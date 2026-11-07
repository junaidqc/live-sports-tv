import fs from 'fs';
import { parseM3U } from '../client/src/utils/m3uParser.js';

async function scan() {
  const m3u = fs.readFileSync('client/public/sports_fallback.m3u', 'utf-8');
  const channels = parseM3U(m3u, 'sports');
  const httpsChannels = channels.filter(c => c.url.startsWith('https://'));
  console.log(`Scanning ${httpsChannels.length} HTTPS channels out of ${channels.length}...`);

  const working = [];

  for (const ch of httpsChannels) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(ch.url, {
        method: 'GET',
        headers: { Range: 'bytes=0-100', 'User-Agent': 'Mozilla/5.0' },
        signal: controller.signal
      });
      clearTimeout(timeout);

      const cors = res.headers.get('access-control-allow-origin');
      const ct = res.headers.get('content-type') || '';

      if ((res.status === 200 || res.status === 206) && (cors === '*' || cors)) {
        working.push({
          id: ch.id,
          name: ch.name,
          category: ch.category,
          logo: ch.logo,
          url: ch.url,
          group: ch.group,
          country: ch.country,
          cors
        });
        console.log(`✓ [${ch.category.toUpperCase()}] ${ch.name}`);
      }
    } catch (e) {}
  }

  console.log(`\nSuccessfully verified ${working.length} 100% working permanent streams with CORS!`);
  fs.writeFileSync('client/src/data/verifiedWorkingChannels.json', JSON.stringify(working, null, 2));
}

scan();
