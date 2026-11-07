/**
 * Rewrites an HLS (.m3u8) playlist manifest so that all segment URLs, child playlists,
 * initialization maps, and encryption keys are proxied through `/api/stream?url=...`.
 *
 * @param {string} manifestContent - Raw text content of the .m3u8 manifest.
 * @param {string} baseUrl - Original URL of this manifest file.
 * @param {string} proxyPrefix - Base proxy path, e.g. '/api/stream'
 * @returns {string} The rewritten manifest text.
 */
export function rewriteM3U8(manifestContent, baseUrl, proxyPrefix = '/api/stream') {
  if (!manifestContent || typeof manifestContent !== 'string') {
    return manifestContent;
  }

  const lines = manifestContent.split(/\r?\n/);
  const rewrittenLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      rewrittenLines.push('');
      continue;
    }

    if (line.startsWith('#')) {
      // Check for tags containing URI attributes: e.g. URI="something"
      let rewrittenTag = line;

      // Regex matching URI="..." or URI=something inside tags like #EXT-X-KEY, #EXT-X-MAP, #EXT-X-MEDIA
      rewrittenTag = rewrittenTag.replace(/URI=["']([^"']+)["']/g, (match, uriValue) => {
        try {
          const resolved = new URL(uriValue, baseUrl).href;
          return `URI="${proxyPrefix}?url=${encodeURIComponent(resolved)}"`;
        } catch {
          return match;
        }
      });

      rewrittenLines.push(rewrittenTag);
    } else {
      // This is a segment or sub-playlist URL line
      try {
        const resolvedUrl = new URL(line, baseUrl).href;
        rewrittenLines.push(`${proxyPrefix}?url=${encodeURIComponent(resolvedUrl)}`);
      } catch {
        // If it cannot be parsed as a URL, keep original line
        rewrittenLines.push(line);
      }
    }
  }

  return rewrittenLines.join('\n');
}
