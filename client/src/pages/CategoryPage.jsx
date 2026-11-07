import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SPORT_CATEGORIES } from '../config/categories';
import { ChannelCard } from '../components/channels/ChannelCard';
import {
  Trophy,
  Filter,
  ArrowUpDown,
  Search,
  Globe,
  Radio,
  Play
} from 'lucide-react';

export function CategoryPage({
  channels = [],
  activeChannel,
  onSelectChannel,
  favoritesHook,
  healthHook
}) {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('favorites'); // 'favorites', 'az', 'za'
  const [selectedCountry, setSelectedCountry] = useState('all');

  const category = SPORT_CATEGORIES.find((c) => c.id === categoryId) || {
    id: categoryId,
    name: 'Sports Category',
    shortName: categoryId,
    description: 'Live sports channels'
  };

  // Filter channels belonging to this category
  const rawCategoryChannels = useMemo(() => {
    return channels.filter((c) => c.category === categoryId);
  }, [channels, categoryId]);

  // Extract unique countries
  const countries = useMemo(() => {
    const set = new Set();
    for (const ch of rawCategoryChannels) {
      if (ch.country && ch.country.trim()) {
        set.add(ch.country.trim().toUpperCase());
      }
    }
    return Array.from(set).sort();
  }, [rawCategoryChannels]);

  // Apply filters and sorting
  const processedChannels = useMemo(() => {
    let result = rawCategoryChannels;

    // Filter offline if toggle enabled
    if (healthHook?.hideOffline) {
      result = result.filter((ch) => !healthHook.isDead(ch.url));
    }

    // Country filter
    if (selectedCountry !== 'all') {
      result = result.filter(
        (ch) => ch.country && ch.country.toUpperCase() === selectedCountry
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ch) =>
          ch.name.toLowerCase().includes(q) ||
          ch.group.toLowerCase().includes(q)
      );
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'favorites') {
        const aFav = favoritesHook?.isFavorite(a) ? 1 : 0;
        const bFav = favoritesHook?.isFavorite(b) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'az') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'za') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });
  }, [
    rawCategoryChannels,
    healthHook?.hideOffline,
    selectedCountry,
    searchQuery,
    sortBy,
    favoritesHook
  ]);

  const handleSelect = (channel) => {
    if (onSelectChannel) {
      onSelectChannel(channel);
    }
    // Navigate home to watch
    navigate('/');
  };

  return (
    <div className="space-y-8">
      {/* Category Header Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl overflow-hidden">
        {category.accentColor && (
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: category.accentColor }}
          />
        )}

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Live Category
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
                {rawCategoryChannels.length} Channels Available
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mt-1.5 leading-relaxed">
              {category.description || 'Watch live tournament broadcasts, club matches, and events.'}
            </p>
          </div>

          {activeChannel && activeChannel.category === categoryId && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-transform hover:scale-105 shrink-0"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Back to Active Player</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sorting Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md">
        {/* Search within category */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${category.shortName} channels...`}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Country filter */}
          {countries.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Countries ({countries.length})</option>
                {countries.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="favorites" className="bg-slate-900">Favorites First</option>
              <option value="az" className="bg-slate-900">Name (A &rarr; Z)</option>
              <option value="za" className="bg-slate-900">Name (Z &rarr; A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Channels Grid */}
      {processedChannels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {processedChannels.map((channel) => (
            <ChannelCard
              key={channel.id || channel.url}
              channel={channel}
              isActive={activeChannel?.url === channel.url}
              isFavorite={favoritesHook?.isFavorite(channel)}
              isDead={healthHook?.isDead(channel.url)}
              onSelect={handleSelect}
              onToggleFavorite={favoritesHook?.toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800">
          <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No channels match your filter</h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query, country filter, or offline toggle.
          </p>
        </div>
      )}
    </div>
  );
}
