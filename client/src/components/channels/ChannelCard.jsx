import React from 'react';
import { Play, Heart, Radio, AlertCircle } from 'lucide-react';
import { LazyImage } from '../common/LazyImage';
import { SPORT_CATEGORIES } from '../../config/categories';

export function ChannelCard({
  channel,
  isActive = false,
  isFavorite = false,
  isDead = false,
  onSelect,
  onToggleFavorite
}) {
  const categoryConfig = SPORT_CATEGORIES.find((c) => c.id === channel.category) || {
    badgeColor: 'bg-slate-700/50 text-slate-300 border-slate-600',
    shortName: channel.category || 'Sports'
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(channel);
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(channel)}
      className={`group relative flex flex-col justify-between p-3.5 rounded-2xl cursor-pointer border transition-all duration-200 select-none ${
        isActive
          ? 'bg-slate-800/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/50 scale-[1.02]'
          : 'bg-slate-900/70 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700 hover:shadow-xl hover:scale-[1.02]'
      }`}
    >
      {/* Top Bar: Category badge & Favorite Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md border truncate ${categoryConfig.badgeColor}`}
        >
          {categoryConfig.shortName}
        </span>

        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`p-1.5 rounded-lg transition-colors ${
            isFavorite
              ? 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
              : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Center: Logo & Play Hover Overlay */}
      <div className="relative aspect-video w-full rounded-xl bg-slate-950/60 border border-slate-800/50 flex items-center justify-center p-2 overflow-hidden mb-3">
        <LazyImage
          src={channel.logo}
          alt={channel.name}
          title={channel.name}
          className="w-full h-full"
        />

        {/* Play Overlay on Hover or Active */}
        <div
          className={`absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform ${
              isActive
                ? 'bg-emerald-500 text-slate-950 scale-105'
                : 'bg-emerald-600/90 text-white group-hover:scale-110'
            }`}
          >
            {isActive ? (
              <Radio className="w-5 h-5 animate-pulse text-slate-950" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Channel Info & Live Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3
            className={`text-sm font-semibold truncate ${
              isActive ? 'text-emerald-400 font-bold' : 'text-slate-200 group-hover:text-white'
            }`}
            title={channel.name}
          >
            {channel.name}
          </h3>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            {channel.group || channel.country || 'Sports Broadcast'}
          </p>
        </div>

        {/* Live / Offline Dot */}
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {isDead ? (
            <span
              className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20"
              title="Stream reported offline"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Off
            </span>
          ) : (
            <span
              className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
              title="Live Stream"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
