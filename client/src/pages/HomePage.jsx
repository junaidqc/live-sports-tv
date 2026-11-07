import React, { useState } from 'react';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { ChannelRow } from '../components/channels/ChannelRow';
import { SPORT_CATEGORIES } from '../config/categories';
import { RefreshCw, Radio, Sparkles, AlertCircle } from 'lucide-react';

export function HomePage({
  channels = [],
  activeChannel,
  onSelectChannel,
  favoritesHook,
  recentHook,
  healthHook,
  loading = false,
  error = null,
  reloadPlaylists
}) {
  const [theaterMode, setTheaterMode] = useState(false);

  // Filter channels if hideOffline is toggled
  const displayChannels = healthHook?.hideOffline
    ? channels.filter((ch) => !healthHook.isDead(ch.url))
    : channels;

  // Channels in the same category as activeChannel for the switcher / next-prev
  const categoryChannels = displayChannels.filter(
    (c) => c.category === (activeChannel?.category || 'football')
  );

  const currentIndex = categoryChannels.findIndex((c) => c.url === activeChannel?.url);

  const handleNextChannel = () => {
    if (categoryChannels.length === 0) return;
    const nextIdx = (currentIndex + 1) % categoryChannels.length;
    onSelectChannel(categoryChannels[nextIdx]);
  };

  const handlePrevChannel = () => {
    if (categoryChannels.length === 0) return;
    const prevIdx = (currentIndex - 1 + categoryChannels.length) % categoryChannels.length;
    onSelectChannel(categoryChannels[prevIdx]);
  };

  // Group channels by category
  const channelsByCategory = {};
  for (const cat of SPORT_CATEGORIES) {
    channelsByCategory[cat.id] = displayChannels.filter((c) => c.category === cat.id);
  }

  // Filtered recent channels
  const recentList = (recentHook?.recentChannels || []).filter((ch) =>
    channels.some((c) => c.url === ch.url)
  );

  // Filtered favorites
  const favoritesList = favoritesHook?.favorites || [];

  return (
    <div className="space-y-10">
      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-8 animate-pulse">
          <div className="aspect-video max-w-5xl mx-auto bg-slate-900/80 rounded-3xl border border-slate-800" />
          <div className="space-y-4">
            <div className="h-6 w-48 bg-slate-900 rounded-lg" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-64 h-48 bg-slate-900/80 rounded-2xl shrink-0 border border-slate-800" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && channels.length === 0 && (
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-red-500/30 text-center max-w-xl mx-auto my-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Could not load playlists</h3>
          <p className="text-xs text-slate-400 mb-6">{error}</p>
          <button
            type="button"
            onClick={reloadPlaylists}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Playlists
          </button>
        </div>
      )}

      {/* Hero Video Player */}
      {!loading && activeChannel && (
        <div className="relative">
          <VideoPlayer
            activeChannel={activeChannel}
            categoryChannels={categoryChannels}
            onSelectChannel={onSelectChannel}
            favoritesHook={favoritesHook}
            healthHook={healthHook}
            onNextChannel={categoryChannels.length > 1 ? handleNextChannel : null}
            onPrevChannel={categoryChannels.length > 1 ? handlePrevChannel : null}
            theaterMode={theaterMode}
            onToggleTheater={() => setTheaterMode((prev) => !prev)}
          />
        </div>
      )}

      {/* Content Shelves */}
      {!loading && channels.length > 0 && (
        <div className="space-y-2">
          {/* Recently Watched Shelf */}
          {recentList.length > 0 && (
            <ChannelRow
              title="Recently Watched"
              channels={recentList}
              activeChannel={activeChannel}
              onSelectChannel={onSelectChannel}
              favoritesHook={favoritesHook}
              healthHook={healthHook}
            />
          )}

          {/* Favorites Shelf (if any) */}
          {favoritesList.length > 0 && (
            <ChannelRow
              title="My Favorites"
              channels={favoritesList}
              activeChannel={activeChannel}
              onSelectChannel={onSelectChannel}
              favoritesHook={favoritesHook}
              healthHook={healthHook}
              viewAllLink="/favorites"
            />
          )}

          {/* Sport Categories Rows */}
          {SPORT_CATEGORIES.map((category) => {
            const catChannels = channelsByCategory[category.id] || [];
            if (catChannels.length === 0) return null;

            return (
              <ChannelRow
                key={category.id}
                category={category}
                channels={catChannels}
                activeChannel={activeChannel}
                onSelectChannel={onSelectChannel}
                favoritesHook={favoritesHook}
                healthHook={healthHook}
                viewAllLink={`/category/${category.id}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
