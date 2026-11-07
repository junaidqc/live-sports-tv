import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Play, Heart, Radio, Tv } from 'lucide-react';
import { LazyImage } from '../common/LazyImage';
import { SPORT_CATEGORIES } from '../../config/categories';

export function SearchModal({
  isOpen,
  onClose,
  channels = [],
  onSelectChannel,
  favoritesHook,
  healthHook
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  const filteredChannels = normalizedQuery
    ? channels
        .filter((ch) => {
          return (
            ch.name.toLowerCase().includes(normalizedQuery) ||
            ch.group.toLowerCase().includes(normalizedQuery) ||
            (ch.category && ch.category.toLowerCase().includes(normalizedQuery)) ||
            (ch.country && ch.country.toLowerCase().includes(normalizedQuery))
          );
        })
        .slice(0, 50)
    : [];

  const handleSelect = (channel) => {
    if (onSelectChannel) {
      onSelectChannel(channel);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels, competitions, sports (e.g. Premier League, Sky, ESPN, Formula 1)..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-1">
          {normalizedQuery && filteredChannels.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No live sports channels found matching "{query}"
            </div>
          ) : null}

          {!normalizedQuery ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              Type something above to search instantly across all {channels.length} sports channels.
            </div>
          ) : null}

          {filteredChannels.map((channel) => {
            const cat = SPORT_CATEGORIES.find((c) => c.id === channel.category);
            const isFav = favoritesHook?.isFavorite(channel);
            const isDead = healthHook?.isDead(channel.url);

            return (
              <div
                key={channel.id || channel.url}
                onClick={() => handleSelect(channel)}
                className="group flex items-center justify-between p-3 rounded-2xl hover:bg-slate-900 border border-transparent hover:border-slate-800 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0">
                    <LazyImage
                      src={channel.logo}
                      alt={channel.name}
                      title={channel.name}
                      className="w-full h-full"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 truncate">
                        {channel.name}
                      </h4>
                      {isDead && (
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                          Offline
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="text-emerald-400/80 font-medium">
                        {cat?.shortName || 'Sports'}
                      </span>
                      <span>•</span>
                      <span className="truncate">{channel.group || channel.country || 'Broadcast'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isFav && (
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  )}
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        {normalizedQuery && filteredChannels.length > 0 && (
          <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Showing top {filteredChannels.length} matches</span>
            <span>Click to watch channel</span>
          </div>
        )}
      </div>
    </div>
  );
}
