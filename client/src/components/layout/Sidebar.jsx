import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Trophy,
  Target,
  Circle,
  CircleDot,
  Flame,
  Shield,
  Award,
  Activity,
  Tv,
  Heart,
  Settings,
  Layers,
  Sparkles
} from 'lucide-react';

const ICON_MAP = {
  Trophy,
  Target,
  Circle,
  CircleDot,
  Flame,
  Shield,
  Award,
  Activity
};

export function Sidebar({
  categoriesWithCounts = [],
  totalChannels = 0,
  favoritesCount = 0,
  isOpen = false,
  onClose
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-800/80 bg-slate-950/95 lg:bg-slate-950/50 backdrop-blur-md p-4 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Browse
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/"
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Tv className="w-4 h-4 text-emerald-400" />
                  <span>Featured & Live</span>
                </div>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                  {totalChannels}
                </span>
              </NavLink>

              <NavLink
                to="/favorites"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Favorites</span>
                </div>
                {favoritesCount > 0 && (
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                    {favoritesCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/settings"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <span>Playlists & Setup</span>
                </div>
              </NavLink>
            </nav>
          </div>

          {/* Sports Categories */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <span>Sport Categories</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <nav className="space-y-1">
              {categoriesWithCounts.map((category) => {
                const IconComponent = ICON_MAP[category.icon] || Trophy;

                return (
                  <NavLink
                    key={category.id}
                    to={`/category/${category.id}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                        isActive
                          ? 'bg-slate-800 text-white font-semibold border-l-4 border-l-emerald-500 shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: category.accentColor }}
                      />
                      <IconComponent className="w-4 h-4 shrink-0 text-slate-400" />
                      <span className="truncate">{category.shortName}</span>
                    </div>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-slate-900/90 text-slate-400 border border-slate-800/80 shrink-0">
                      {category.count}
                    </span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Quick Info Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HLS Proxy Engine</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Streams automatically route through the built-in Express proxy to bypass CORS and mixed content.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
