import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Trash2, Tv, Sparkles, ArrowRight } from 'lucide-react';
import { ChannelCard } from '../components/channels/ChannelCard';

export function FavoritesPage({
  activeChannel,
  onSelectChannel,
  favoritesHook,
  healthHook
}) {
  const navigate = useNavigate();
  const favorites = favoritesHook?.favorites || [];

  const handleSelect = (channel) => {
    if (onSelectChannel) {
      onSelectChannel(channel);
    }
    navigate('/');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Heart className="w-6 h-6 fill-rose-500/20" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Favorite Channels
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Your pinned sports channels saved locally on this browser.
            </p>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="text-xs font-mono text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
            {favorites.length} Pinned
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {favorites.map((channel) => (
            <ChannelCard
              key={channel.id || channel.url}
              channel={channel}
              isActive={activeChannel?.url === channel.url}
              isFavorite={true}
              isDead={healthHook?.isDead(channel.url)}
              onSelect={handleSelect}
              onToggleFavorite={favoritesHook?.toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No favorite channels yet</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Click the heart icon on any sports channel or inside the player to pin your top streams here for quick access anytime.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <span>Explore Live Sports</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
