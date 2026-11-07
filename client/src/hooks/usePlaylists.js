import { useState, useEffect, useCallback, useMemo } from 'react';
import { Storage, DEFAULT_PLAYLISTS } from '../utils/storage';
import { parseM3U } from '../utils/m3uParser';
import { SPORT_CATEGORIES } from '../config/categories';

export function usePlaylists() {
  const [playlists, setPlaylists] = useState(() => Storage.getPlaylists());
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);

  // Load and parse all enabled playlists
  const loadPlaylists = useCallback(async (currentPlaylists = playlists) => {
    setLoading(true);
    setError(null);

    const enabled = currentPlaylists.filter((p) => p.enabled);
    if (enabled.length === 0) {
      setChannels([]);
      setLoading(false);
      return;
    }

    const allChannels = [];
    const seenUrls = new Set();
    const errors = [];

    for (const playlist of enabled) {
      try {
        let content = '';
        if (playlist.rawContent) {
          content = playlist.rawContent;
        } else if (playlist.url) {
          const res = await fetch(`/api/playlist?url=${encodeURIComponent(playlist.url)}`);
          if (!res.ok) {
            throw new Error(`Failed to fetch playlist (Status: ${res.status})`);
          }
          content = await res.text();
        }

        if (content) {
          const parsed = parseM3U(content, playlist.id, playlist.filterOnlySports);
          for (const ch of parsed) {
            if (!seenUrls.has(ch.url)) {
              seenUrls.add(ch.url);
              allChannels.push(ch);
            }
          }
        }
      } catch (err) {
        console.error(`Error loading playlist "${playlist.name}":`, err);
        errors.push(`${playlist.name}: ${err.message}`);
      }
    }

    if (errors.length > 0 && allChannels.length === 0) {
      setError(errors.join(', '));
    }

    setChannels(allChannels);
    setLoading(false);

    // Set initial active channel
    const savedLast = Storage.getLastChannel();
    if (savedLast && allChannels.some((c) => c.url === savedLast.url)) {
      setActiveChannel(savedLast);
    } else if (allChannels.length > 0) {
      // Pick first channel from football or general sports
      const firstPick =
        allChannels.find((c) => c.category === 'football') ||
        allChannels.find((c) => c.category === 'cricket') ||
        allChannels[0];
      setActiveChannel(firstPick);
    }
  }, [playlists]);

  // Initial load
  useEffect(() => {
    loadPlaylists(playlists);
  }, []);

  // Compute category counts
  const categoriesWithCounts = useMemo(() => {
    const counts = {};
    for (const cat of SPORT_CATEGORIES) {
      counts[cat.id] = 0;
    }

    for (const ch of channels) {
      if (counts[ch.category] !== undefined) {
        counts[ch.category]++;
      } else {
        counts['other-sports'] = (counts['other-sports'] || 0) + 1;
      }
    }

    return SPORT_CATEGORIES.map((cat) => ({
      ...cat,
      count: counts[cat.id] || 0
    }));
  }, [channels]);

  // Playlist management actions
  const addPlaylist = useCallback((name, url) => {
    if (!url) return;
    const newPlaylist = {
      id: `custom_${Date.now()}`,
      name: name || 'Custom Playlist',
      url: url.trim(),
      enabled: true,
      isDefault: false,
      filterOnlySports: false
    };

    setPlaylists((prev) => {
      const updated = [...prev, newPlaylist];
      Storage.savePlaylists(updated);
      loadPlaylists(updated);
      return updated;
    });
  }, [loadPlaylists]);

  const removePlaylist = useCallback((id) => {
    setPlaylists((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      Storage.savePlaylists(updated);
      loadPlaylists(updated);
      return updated;
    });
  }, [loadPlaylists]);

  const togglePlaylist = useCallback((id) => {
    setPlaylists((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p));
      Storage.savePlaylists(updated);
      loadPlaylists(updated);
      return updated;
    });
  }, [loadPlaylists]);

  const uploadM3UFile = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const newPlaylist = {
          id: `file_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          rawContent: content,
          enabled: true,
          isDefault: false,
          filterOnlySports: false
        };

        setPlaylists((prev) => {
          const updated = [...prev, newPlaylist];
          Storage.savePlaylists(updated);
          loadPlaylists(updated);
          return updated;
        });
        resolve();
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, [loadPlaylists]);

  const selectChannel = useCallback((channel) => {
    if (!channel) return;
    setActiveChannel(channel);
    Storage.saveLastChannel(channel);
  }, []);

  return {
    playlists,
    channels,
    totalChannels: channels.length,
    categoriesWithCounts,
    loading,
    error,
    activeChannel,
    selectChannel,
    addPlaylist,
    removePlaylist,
    togglePlaylist,
    uploadM3UFile,
    reloadPlaylists: () => loadPlaylists(playlists)
  };
}
