import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChannelCard } from './ChannelCard';

export function ChannelRow({
  title,
  category,
  channels = [],
  activeChannel,
  onSelectChannel,
  favoritesHook,
  healthHook,
  viewAllLink
}) {
  const scrollRef = useRef(null);

  if (!channels || channels.length === 0) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 480;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="mb-10 group/row">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          {category?.accentColor && (
            <div
              className="w-2.5 h-6 rounded-full"
              style={{ backgroundColor: category.accentColor }}
            />
          )}
          <h2 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{title || category?.name || 'Category'}</span>
            <span className="text-xs font-mono font-normal text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
              {channels.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors mr-2"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Scroll Navigation Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Shelf */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar scroll-smooth"
      >
        {channels.map((channel) => (
          <div key={channel.id || channel.url} className="w-[230px] sm:w-[260px] shrink-0">
            <ChannelCard
              channel={channel}
              isActive={activeChannel?.url === channel.url}
              isFavorite={favoritesHook?.isFavorite(channel)}
              isDead={healthHook?.isDead(channel.url)}
              onSelect={onSelectChannel}
              onToggleFavorite={favoritesHook?.toggleFavorite}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
