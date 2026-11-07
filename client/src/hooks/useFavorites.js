import { useState, useEffect, useCallback } from 'react';
import { Storage } from '../utils/storage';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => Storage.getFavorites());

  useEffect(() => {
    Storage.saveFavorites(favorites);
  }, [favorites]);

  const isFavorite = useCallback(
    (channel) => {
      if (!channel) return false;
      return favorites.some((fav) => fav.url === channel.url || (fav.tvgId && fav.tvgId === channel.tvgId));
    },
    [favorites]
  );

  const toggleFavorite = useCallback((channel) => {
    if (!channel) return;
    setFavorites((prev) => {
      const exists = prev.some((fav) => fav.url === channel.url || (fav.tvgId && fav.tvgId === channel.tvgId));
      if (exists) {
        return prev.filter((fav) => fav.url !== channel.url && (!fav.tvgId || fav.tvgId !== channel.tvgId));
      } else {
        return [channel, ...prev];
      }
    });
  }, []);

  const removeFavorite = useCallback((channelUrl) => {
    setFavorites((prev) => prev.filter((fav) => fav.url !== channelUrl));
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    favoritesCount: favorites.length
  };
}
