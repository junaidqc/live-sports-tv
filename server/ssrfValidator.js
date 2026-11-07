import dns from 'dns';
import ipaddr from 'ipaddr.js';

/**
 * Validates a URL for SSRF protection and protocol safety.
 * Only allows http and https protocols pointing to public IP addresses.
 *
 * @param {string} rawUrl - The URL string to validate.
 * @returns {Promise<{ valid: boolean, error?: string, parsedUrl?: URL }>}
 */
export async function validateSafeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { valid: false, error: 'Missing or invalid URL parameter' };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl.trim());
  } catch (err) {
    return { valid: false, error: 'Malformed URL: ' + err.message };
  }

  // Only allow HTTP and HTTPS
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { valid: false, error: 'Only http and https protocols are supported' };
  }

  const hostname = parsedUrl.hostname;
  if (!hostname) {
    return { valid: false, error: 'URL must contain a valid hostname' };
  }

  // Block obvious localhost patterns
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { valid: false, error: 'Access to local domain names is prohibited' };
  }

  try {
    // Resolve IP address (supports IPv4 and IPv6)
    const lookupResult = await dns.promises.lookup(hostname, { all: true });
    if (!lookupResult || lookupResult.length === 0) {
      return { valid: false, error: 'Failed to resolve hostname: ' + hostname };
    }

    for (const record of lookupResult) {
      const ipStr = record.address;
      if (!ipaddr.isValid(ipStr)) {
        return { valid: false, error: `Invalid IP address resolved: ${ipStr}` };
      }

      const addr = ipaddr.parse(ipStr);
      const range = addr.range();

      // Block non-public IP ranges
      // ranges: 'unicast' is public for IPv4, 'unicast' for IPv6
      const blockedRanges = [
        'loopback',
        'private',
        'linkLocal',
        'broadcast',
        'carrierGradeNat',
        'uniqueLocal',
        'unspecified',
        'reserved'
      ];

      if (blockedRanges.includes(range)) {
        return {
          valid: false,
          error: `Access to private/restricted IP address (${ipStr} - ${range}) is blocked`
        };
      }
    }

    return { valid: true, parsedUrl };
  } catch (err) {
    return { valid: false, error: 'DNS lookup failed: ' + err.message };
  }
}
