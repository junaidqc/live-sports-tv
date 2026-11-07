import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/search/SearchModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SettingsPage } from './pages/SettingsPage';

import { usePlaylists } from './hooks/usePlaylists';
import { useFavorites } from './hooks/useFavorites';
import { useRecentlyWatched } from './hooks/useRecentlyWatched';
import { useStreamHealth } from './hooks/useStreamHealth';
import { Storage } from './utils/storage';

export default function App() {
  const [theme, setTheme] = useState(() => Storage.getTheme());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Core data hooks
  const playlistsHook = usePlaylists();
  const favoritesHook = useFavorites();
  const recentHook = useRecentlyWatched();
  const healthHook = useStreamHealth();

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    Storage.saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Global Ctrl+K / Cmd+K shortcut for search modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Channel selection handler: updates active channel and adds to recently watched
  const handleSelectChannel = useCallback(
    (channel) => {
      if (!channel) return;
      playlistsHook.selectChannel(channel);
      recentHook.addRecent(channel);
    },
    [playlistsHook, recentHook]
  );

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100 transition-colors">
          {/* Top Sticky Navbar */}
          <Navbar
            totalChannels={playlistsHook.totalChannels}
            favoritesCount={favoritesHook.favoritesCount}
            theme={theme}
            toggleTheme={toggleTheme}
            onOpenSearch={() => setSearchModalOpen(true)}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
            sidebarOpen={sidebarOpen}
            streamHealth={healthHook}
          />

          {/* Main Layout Area */}
          <div className="flex-1 max-w-7xl w-full mx-auto flex">
            {/* Collapsible Sidebar */}
            <Sidebar
              categoriesWithCounts={playlistsHook.categoriesWithCounts}
              totalChannels={playlistsHook.totalChannels}
              favoritesCount={favoritesHook.favoritesCount}
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />

            {/* Page View */}
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-hidden">
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      channels={playlistsHook.channels}
                      activeChannel={playlistsHook.activeChannel}
                      onSelectChannel={handleSelectChannel}
                      favoritesHook={favoritesHook}
                      recentHook={recentHook}
                      healthHook={healthHook}
                      loading={playlistsHook.loading}
                      error={playlistsHook.error}
                      reloadPlaylists={playlistsHook.reloadPlaylists}
                    />
                  }
                />
                <Route
                  path="/category/:categoryId"
                  element={
                    <CategoryPage
                      channels={playlistsHook.channels}
                      activeChannel={playlistsHook.activeChannel}
                      onSelectChannel={handleSelectChannel}
                      favoritesHook={favoritesHook}
                      healthHook={healthHook}
                    />
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <FavoritesPage
                      activeChannel={playlistsHook.activeChannel}
                      onSelectChannel={handleSelectChannel}
                      favoritesHook={favoritesHook}
                      healthHook={healthHook}
                    />
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <SettingsPage
                      playlists={playlistsHook.playlists}
                      channels={playlistsHook.channels}
                      addPlaylist={playlistsHook.addPlaylist}
                      removePlaylist={playlistsHook.removePlaylist}
                      togglePlaylist={playlistsHook.togglePlaylist}
                      uploadM3UFile={playlistsHook.uploadM3UFile}
                      reloadPlaylists={playlistsHook.reloadPlaylists}
                      healthHook={healthHook}
                      totalChannels={playlistsHook.totalChannels}
                    />
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Footer */}
          <Footer />

          {/* Instant Search Modal */}
          <SearchModal
            isOpen={searchModalOpen}
            onClose={() => setSearchModalOpen(false)}
            channels={playlistsHook.channels}
            onSelectChannel={handleSelectChannel}
            favoritesHook={favoritesHook}
            healthHook={healthHook}
          />
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
