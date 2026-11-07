import { useState, useCallback } from 'react';
import { Storage } from '../utils/storage';

export function useRecentlyWatched() {
  const [recentChannels, setRecentChannels] = useState(() => Storage.getRecentChannels());

  const addRecent = useCallback((channel) => {
    if (!channel || !channel.url) return;
    Storage.addRecentChannel(channel);
    setRecentChannels(Storage.getRecentChannels());
  }, []);

  const clearRecent = useCallback(() => {
    Storage.clearRecentChannels();
    setRecentChannels([]);
  }, []);

  return {
    recentChannels,
    addRecent,
    clearRecent
  };
}
