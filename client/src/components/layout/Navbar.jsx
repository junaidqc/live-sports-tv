import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Tv,
  Search,
  Heart,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  Activity,
  EyeOff,
  Eye,
  Radio,
  Flame
} from 'lucide-react';

export function Navbar({
  totalChannels = 0,
  favoritesCount = 0,
  theme = 'dark',
  toggleTheme,
  onOpenSearch,
  onToggleSidebar,
  sidebarOpen = false,
  streamHealth
}) {
  const location = useLocation();

  const isChecking = streamHealth?.isChecking;
  const progress = streamHealth?.progress;
  const hideOffline = streamHealth?.hideOffline;
  const toggleHideOffline = streamHealth?.toggleHideOffline;
  const checkAllStreams = streamHealth?.checkAllStreams;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden transition-colors"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-emerald-400 transition-colors">
                  LIVE SPORTS
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {totalChannels > 0 ? `${totalChannels} Channels` : 'IPTV Player'}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar Trigger */}
        <div className="hidden sm:flex flex-1 max-w-md mx-4">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-slate-700 hover:text-slate-200 transition-all shadow-inner group"
          >
            <div className="flex items-center gap-2.5">
              <Search className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Search channels, teams, sports...</span>
            </div>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded-md">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile search icon */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-emerald-400" />
          </button>

          {/* Hide / Show Offline Channels Toggle */}
          <button
            type="button"
            onClick={toggleHideOffline}
            title={hideOffline ? 'Showing all streams (Offline hidden)' : 'Click to hide offline streams'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
              hideOffline
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'text-slate-400 border-slate-800 hover:bg-slate-900'
            }`}
          >
            {hideOffline ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{hideOffline ? 'Offline Hidden' : 'All Streams'}</span>
          </button>

          {/* Health check indicator */}
          {isChecking && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
              <Activity className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Checking {progress.percentage}%</span>
            </div>
          )}

          {/* Favorites Link */}
          <Link
            to="/favorites"
            className={`relative p-2 rounded-xl transition-colors ${
              isActive('/favorites')
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Favorites"
          >
            <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-rose-500/20 text-rose-400' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md">
                {favoritesCount}
              </span>
            )}
          </Link>

          {/* Settings Link */}
          <Link
            to="/settings"
            className={`p-2 rounded-xl transition-colors ${
              isActive('/settings')
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Settings & Playlists"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
