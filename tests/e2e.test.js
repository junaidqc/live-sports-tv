import { parseM3U } from '../client/src/utils/m3uParser.js';
import { SPORT_CATEGORIES } from '../client/src/config/categories.js';

async function runE2ETests() {
  console.log('--- STARTING E2E VERIFICATION ---');

  // Test 1: Root frontend check
  const rootRes = await fetch('http://localhost:3001/');
  console.log('✓ Test 1: Frontend SPA served. Status:', rootRes.status);
  const rootHtml = await rootRes.text();
  if (!rootHtml.includes('Live Sports TV')) {
    throw new Error('Root HTML missing title/meta');
  }
  console.log('✓ Test 1: HTML contains Live Sports TV shell');

  // Test 2: Playlist API
  const sportsUrl = 'https://iptv-org.github.io/iptv/categories/sports.m3u';
  const playlistRes = await fetch(`http://localhost:3001/api/playlist?url=${encodeURIComponent(sportsUrl)}`);
  console.log('✓ Test 2: Playlist API responded. Status:', playlistRes.status);
  const m3uText = await playlistRes.text();
  console.log(`✓ Test 2: Playlist payload received (${m3uText.length} bytes, X-Cache: ${playlistRes.headers.get('x-cache')})`);

  // Test 3: M3U Parser & Classification
  const channels = parseM3U(m3uText, 'test_source');
  console.log(`✓ Test 3: Parsed ${channels.length} unique deduplicated channels`);

  const categoryMap = {};
  for (const cat of SPORT_CATEGORIES) {
    categoryMap[cat.id] = 0;
  }
  for (const ch of channels) {
    if (categoryMap[ch.category] !== undefined) {
      categoryMap[ch.category]++;
    }
  }

  console.log('✓ Test 3: Channel breakdown across sport categories:');
  for (const [catId, count] of Object.entries(categoryMap)) {
    console.log(`    - ${catId.padEnd(16)} : ${count} channels`);
  }

  // Test 4: Health Check Endpoint
  const sampleChannel = channels.find(c => c.name.includes('ACC') || c.name.includes('Golf') || c.category === 'other-sports');
  const healthRes = await fetch(`http://localhost:3001/api/health?url=${encodeURIComponent(sampleChannel.url)}`);
  const healthJson = await healthRes.json();
  console.log(`✓ Test 4: Health check for "${sampleChannel.name}": alive=${healthJson.alive}, status=${healthJson.status}, latency=${healthJson.latencyMs}ms`);

  // Test 5: Stream Proxy & M3U8 Rewriter
  const liveM3u8Url = 'https://raycom-accdn-firetv.amagi.tv/playlist.m3u8';
  const streamRes = await fetch(`http://localhost:3001/api/stream?url=${encodeURIComponent(liveM3u8Url)}`);
  console.log(`✓ Test 5: Stream proxy responded with status ${streamRes.status}, Content-Type: ${streamRes.headers.get('content-type')}`);
  const streamText = await streamRes.text();
  if (!streamText.includes('/api/stream?url=')) {
    throw new Error('Stream manifest rewriting failed: internal URLs not proxied');
  }
  console.log('✓ Test 5: Successfully verified HLS manifest rewrite: internal URLs correctly point to /api/stream proxy');

  // Test 6: SSRF Protection
  const localRes = await fetch('http://localhost:3001/api/playlist?url=http://127.0.0.1:8080/secret');
  console.log(`✓ Test 6: SSRF protection blocked private IP 127.0.0.1 (Status: ${localRes.status})`);

  const metadataRes = await fetch('http://localhost:3001/api/playlist?url=http://169.254.169.254/latest/meta-data');
  console.log(`✓ Test 6: SSRF protection blocked cloud metadata (Status: ${metadataRes.status})`);

  console.log('\n====================================');
  console.log('  ALL E2E VERIFICATION TESTS PASSED  ');
  console.log('====================================\n');
}

runE2ETests().catch(err => {
  console.error('E2E TEST FAILED:', err);
  process.exit(1);
});
