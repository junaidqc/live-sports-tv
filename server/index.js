import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { validateSafeUrl } from './ssrfValidator.js';
import { TTLCache } from './cache.js';
import { rewriteM3U8 } from './m3uRewriter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 10-minute cache for fetched M3U playlists
const playlistCache = new TTLCache(10 * 60 * 1000);

// Basic security headers with Helmet configured for video streaming
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow HLS playback from various sources
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Enable CORS for all routes
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Range', 'Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges', 'Content-Type']
  })
);

// Rate limiter for playlist and health endpoints
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again shortly.' }
});

// Stream limiter (generous to allow smooth HLS segment streaming)
const streamLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6000, // plenty for HLS video chunks
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded for video streaming.' }
});

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * GET /api/playlist?url=...
 * Fetches and returns M3U text server-side to bypass CORS.
 * SSRF protected, 10s timeout, 10-minute cache.
 */
app.get('/api/playlist', apiLimiter, async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing required "url" parameter.' });
  }

  // Validate URL & SSRF
  const validation = await validateSafeUrl(targetUrl);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  // Check in-memory cache
  const cached = playlistCache.get(targetUrl);
  if (cached) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Cache', 'HIT');
    return res.send(cached);
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: '*/*'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Remote playlist server responded with status: ${response.status} ${response.statusText}`
      });
    }

    const playlistText = await response.text();

    // Store in cache for 10 minutes
    playlistCache.set(targetUrl, playlistText);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Cache', 'MISS');
    return res.send(playlistText);
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    return res.status(502).json({
      error: isTimeout
        ? 'Request timed out while fetching playlist (10s limit)'
        : `Failed to fetch playlist: ${err.message}`
    });
  }
});

/**
 * GET /api/stream?url=...
 * Proxy for HLS manifests (.m3u8) and video segments (.ts, .aac, .m4s).
 * Rewrites .m3u8 manifests so relative and absolute child links route through this proxy.
 * Forwards Range headers for segment seeking.
 */
app.get('/api/stream', streamLimiter, async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing required "url" parameter.' });
  }

  // Validate URL & SSRF
  const validation = await validateSafeUrl(targetUrl);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout for stream segments

    // Forward relevant incoming headers
    const forwardHeaders = {
      'User-Agent': req.headers['user-agent'] || DEFAULT_USER_AGENT,
      Accept: req.headers['accept'] || '*/*'
    };

    if (req.headers['range']) {
      forwardHeaders['Range'] = req.headers['range'];
    }

    const upstreamRes = await fetch(targetUrl, {
      method: 'GET',
      headers: forwardHeaders,
      signal: controller.signal
    });

    clearTimeout(timeout);

    const contentType = upstreamRes.headers.get('content-type') || '';
    const isM3U8 =
      contentType.includes('mpegurl') ||
      contentType.includes('application/x-mpegURL') ||
      targetUrl.split('?')[0].endsWith('.m3u8');

    if (isM3U8) {
      // Manifest file: read text and rewrite internal URLs
      const manifestText = await upstreamRes.text();

      // Check if it's indeed an M3U manifest
      if (manifestText.includes('#EXTM3U')) {
        const rewritten = rewriteM3U8(manifestText, targetUrl, '/api/stream');
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(rewritten);
      } else {
        // If not containing EXTM3U, return as is
        res.setHeader('Content-Type', contentType || 'application/vnd.apple.mpegurl');
        return res.send(manifestText);
      }
    }

    // Binary segment (.ts, .aac, .m4s, etc.)
    res.status(upstreamRes.status);

    // Forward essential response headers
    const copyHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
      'last-modified',
      'etag'
    ];

    for (const header of copyHeaders) {
      const val = upstreamRes.headers.get(header);
      if (val) {
        res.setHeader(header, val);
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');

    // Pipe response body
    if (upstreamRes.body) {
      const { Readable } = await import('stream');
      // Node 18+ Web ReadableStream to Node Readable
      const nodeStream = Readable.fromWeb(upstreamRes.body);
      nodeStream.pipe(res);

      nodeStream.on('error', (err) => {
        if (!res.headersSent) {
          res.status(502).end();
        }
      });
    } else {
      res.end();
    }
  } catch (err) {
    if (!res.headersSent) {
      const isTimeout = err.name === 'AbortError';
      return res.status(502).json({
        error: isTimeout ? 'Stream request timed out' : `Proxy error: ${err.message}`
      });
    }
  }
});

/**
 * GET /api/health?url=...
 * Quickly checks whether a stream is alive (HEAD/GET with 4s timeout).
 */
app.get('/api/health', apiLimiter, async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ alive: false, error: 'Missing url parameter' });
  }

  const validation = await validateSafeUrl(targetUrl);
  if (!validation.valid) {
    return res.status(400).json({ alive: false, error: validation.error });
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

  try {
    // Try HEAD first
    let response = await fetch(targetUrl, {
      method: 'HEAD',
      headers: { 'User-Agent': DEFAULT_USER_AGENT },
      signal: controller.signal
    }).catch(() => null);

    // If HEAD failed or gave 405 Method Not Allowed, try GET
    if (!response || response.status === 405) {
      response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'User-Agent': DEFAULT_USER_AGENT, Range: 'bytes=0-100' },
        signal: controller.signal
      });
    }

    clearTimeout(timeout);
    const latencyMs = Date.now() - startTime;
    const alive = response.status >= 200 && response.status < 400;

    return res.json({
      alive,
      status: response.status,
      latencyMs
    });
  } catch (err) {
    clearTimeout(timeout);
    return res.json({
      alive: false,
      status: 0,
      latencyMs: Date.now() - startTime,
      error: err.name === 'AbortError' ? 'Timeout (4s)' : err.message
    });
  }
});

// Production: serve built client files
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Only start standalone HTTP server when not in serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Live Sports TV] Server running on port ${PORT}`);
  });
}

export default app;
