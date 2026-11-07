/**
 * LocalStorage keys and helper functions for persistent user data.
 */

const STORAGE_KEYS = {
  PLAYLISTS: 'sports_tv_playlists_v2',
  FAVORITES: 'sports_tv_favorites_v2',
  RECENT: 'sports_tv_recent_v2',
  LAST_CHANNEL: 'sports_tv_last_channel_v2',
  VOLUME: 'sports_tv_volume',
  MUTED: 'sports_tv_muted',
  THEME: 'sports_tv_theme',
  HIDE_OFFLINE: 'sports_tv_hide_offline',
  HEALTH_CACHE: 'sports_tv_health_cache'
};

// Default playlists specified in the requirements
export const DEFAULT_PLAYLISTS = [
  {
    id: 'iptv-sports',
    name: 'IPTV-Org Sports (Official)',
    url: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
    enabled: true,
    isDefault: true,
    filterOnlySports: false
  },
  {
    id: 'iptv-index-sports',
    name: 'IPTV-Org Global Index (Sports Filtered)',
    url: 'https://iptv-org.github.io/iptv/index.m3u',
    enabled: true,
    isDefault: true,
    filterOnlySports: true
  }
];

export const Storage = {
  // Playlists
  getPlaylists() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading playlists from localStorage:', e);
    }
    return DEFAULT_PLAYLISTS;
  },

  savePlaylists(playlists) {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.error('Error saving playlists:', e);
    }
  },

  // Favorites
  getFavorites() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveFavorites(favorites) {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  },

  // Recently Watched
  getRecentChannels() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addRecentChannel(channel) {
    if (!channel || !channel.url) return;
    try {
      const recent = Storage.getRecentChannels().filter((c) => c.url !== channel.url);
      recent.unshift(channel);
      // Keep up to 25 recent items
      const trimmed = recent.slice(0, 25);
      localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Error updating recent channels:', e);
    }
  },

  clearRecentChannels() {
    localStorage.removeItem(STORAGE_KEYS.RECENT);
  },

  // Last Channel
  getLastChannel() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_CHANNEL);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveLastChannel(channel) {
    try {
      if (channel) {
        localStorage.setItem(STORAGE_KEYS.LAST_CHANNEL, JSON.stringify(channel));
      }
    } catch (e) {
      console.error('Error saving last channel:', e);
    }
  },

  // Volume & Mute
  getVolume() {
    try {
      const v = localStorage.getItem(STORAGE_KEYS.VOLUME);
      return v !== null ? parseFloat(v) : 0.8;
    } catch {
      return 0.8;
    }
  },

  saveVolume(volume) {
    try {
      localStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
    } catch {}
  },

  getMuted() {
    try {
      return localStorage.getItem(STORAGE_KEYS.MUTED) === 'true';
    } catch {
      return false;
    }
  },

  saveMuted(muted) {
    try {
      localStorage.setItem(STORAGE_KEYS.MUTED, muted ? 'true' : 'false');
    } catch {}
  },

  // Theme
  getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
    } catch {
      return 'dark';
    }
  },

  saveTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {}
  },

  // Hide Offline
  getHideOffline() {
    try {
      return localStorage.getItem(STORAGE_KEYS.HIDE_OFFLINE) === 'true';
    } catch {
      return false;
    }
  },

  saveHideOffline(hide) {
    try {
      localStorage.setItem(STORAGE_KEYS.HIDE_OFFLINE, hide ? 'true' : 'false');
    } catch {}
  },

  // Health Cache
  getHealthCache() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HEALTH_CACHE);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveHealthCache(cache) {
    try {
      localStorage.setItem(STORAGE_KEYS.HEALTH_CACHE, JSON.stringify(cache));
    } catch {}
  }
};
