import { classifyChannel } from '../config/categories.js';

/**
 * Extracts attribute value from an #EXTINF line by attribute key name.
 * Handles both key="val" and key='val' or key=val formats.
 */
function extractAttribute(line, attrName) {
  const regex = new RegExp(`${attrName}=["']([^"']*)["']`, 'i');
  const match = line.match(regex);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback for unquoted attributes
  const unquotedRegex = new RegExp(`${attrName}=([^\\s,]+)`, 'i');
  const unquotedMatch = line.match(unquotedRegex);
  return unquotedMatch && unquotedMatch[1] ? unquotedMatch[1].trim() : '';
}

/**
 * Generates a consistent hash string for deduplication or ID.
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Parses raw M3U / M3U8 playlist text into an array of normalized channel objects.
 * Deduplicates by stream URL, classifies into sport categories, and handles malformed lines gracefully.
 *
 * @param {string} m3uContent - Raw text of the M3U playlist
 * @param {string} [sourceId='custom'] - Identifier for the playlist source
 * @param {boolean} [filterOnlySports=false] - If true, only keeps sports classified channels
 * @returns {Array<object>} Array of parsed channels
 */
export function parseM3U(m3uContent, sourceId = 'custom', filterOnlySports = false) {
  if (!m3uContent || typeof m3uContent !== 'string') {
    return [];
  }

  const lines = m3uContent.split(/\r?\n/);
  const channels = [];
  const seenUrls = new Set();

  let currentMeta = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Check for EXTINF line
    if (line.startsWith('#EXTINF:')) {
      const tvgId = extractAttribute(line, 'tvg-id');
      const tvgName = extractAttribute(line, 'tvg-name');
      const tvgLogo = extractAttribute(line, 'tvg-logo');
      const groupTitle = extractAttribute(line, 'group-title');
      const tvgCountry = extractAttribute(line, 'tvg-country');
      const tvgLanguage = extractAttribute(line, 'tvg-language');

      // The channel title / name is whatever comes after the last comma
      const commaIndex = line.lastIndexOf(',');
      let channelName = '';
      if (commaIndex !== -1 && commaIndex < line.length - 1) {
        channelName = line.substring(commaIndex + 1).trim();
      } else {
        channelName = tvgName || tvgId || 'Unnamed Channel';
      }

      currentMeta = {
        tvgId,
        tvgName,
        tvgLogo,
        group: groupTitle || 'Sports',
        country: tvgCountry,
        language: tvgLanguage,
        name: channelName
      };
    } else if (!line.startsWith('#')) {
      // This is a stream URL line
      if (currentMeta && (line.startsWith('http://') || line.startsWith('https://'))) {
        const streamUrl = line.trim();

        // Deduplication by URL
        if (!seenUrls.has(streamUrl)) {
          seenUrls.add(streamUrl);

          const channel = {
            id: `ch_${sourceId}_${hashString(streamUrl)}_${channels.length}`,
            name: currentMeta.name,
            tvgId: currentMeta.tvgId,
            tvgName: currentMeta.tvgName,
            logo: currentMeta.tvgLogo,
            group: currentMeta.group,
            country: currentMeta.country || '',
            language: currentMeta.language || '',
            url: streamUrl,
            sourceId
          };

          // Auto-classify channel
          channel.category = classifyChannel(channel);

          // If source requires sports filtering, check if it fits a sport category
          if (!filterOnlySports || channel.category !== 'other-sports' || channel.group.toLowerCase().includes('sport')) {
            channels.push(channel);
          }
        }
      }
      currentMeta = null; // Reset for next channel
    }
  }

  return channels;
}
