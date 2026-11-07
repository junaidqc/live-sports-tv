import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  Tv,
  Heart,
  RotateCcw,
  Sliders,
  Activity,
  Layers,
  ChevronRight,
  ChevronLeft,
  SkipBack,
  SkipForward,
  AlertTriangle,
  Radio,
  Cast
} from 'lucide-react';
import { useHls } from '../../hooks/useHls';
import { Storage } from '../../utils/storage';
import { SPORT_CATEGORIES } from '../../config/categories';
import { LazyImage } from '../common/LazyImage';

export function VideoPlayer({
  activeChannel,
  categoryChannels = [],
  onSelectChannel,
  favoritesHook,
  healthHook,
  onNextChannel,
  onPrevChannel,
  theaterMode = false,
  onToggleTheater
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Volume & Mute state from storage
  const [volume, setVolume] = useState(() => Storage.getVolume());
  const [muted, setMuted] = useState(() => Storage.getMuted());

  // Quality menu & stats modal state
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showChannelSwitcher, setShowChannelSwitcher] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize HLS player hook
  const {
    isPlaying,
    isBuffering,
    isLive,
    levels,
    currentLevel,
    retryCount,
    isUsingProxy,
    playbackFailed,
    stats,
    togglePlay,
    setQualityLevel,
    retryStream
  } = useHls(videoRef, activeChannel?.url, {
    autoPlay: true,
    onError: (err) => console.warn('HLS stream error:', err)
  });

  // Apply volume changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = muted;
    }
    Storage.saveVolume(volume);
    Storage.saveMuted(muted);
  }, [volume, muted]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Controls auto-hide on idle
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showQualityMenu && !showStats && !showChannelSwitcher) {
        setControlsVisible(false);
      }
    }, 3500);
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          setControlsVisible(true);
          break;
        case 'KeyM':
          e.preventDefault();
          setMuted((prev) => !prev);
          setControlsVisible(true);
          break;
        case 'KeyF':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'KeyT':
          e.preventDefault();
          if (onToggleTheater) onToggleTheater();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.min(1, Math.round((prev + 0.05) * 100) / 100);
            if (muted) setMuted(false);
            return next;
          });
          setControlsVisible(true);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((prev) => {
            const next = Math.max(0, Math.round((prev - 0.05) * 100) / 100);
            return next;
          });
          setControlsVisible(true);
          break;
        case 'KeyN':
          e.preventDefault();
          if (onNextChannel) onNextChannel();
          break;
        case 'KeyP':
          e.preventDefault();
          if (onPrevChannel) onPrevChannel();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, muted, onToggleTheater, onNextChannel, onPrevChannel]);

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Picture in Picture
  const handleTogglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  // AirPlay support
  const handleAirPlay = () => {
    if (videoRef.current && videoRef.current.webkitShowPlaybackTargetPicker) {
      videoRef.current.webkitShowPlaybackTargetPicker();
    }
  };

  // Suggestions from same category
  const alternativeChannels = categoryChannels
    .filter((ch) => ch.url !== activeChannel?.url)
    .slice(0, 4);

  const categoryConfig = SPORT_CATEGORIES.find((c) => c.id === activeChannel?.category);

  return (
    <div className={`relative flex flex-col transition-all duration-300 ${theaterMode ? 'w-full' : 'max-w-6xl mx-auto'}`}>
      {/* Player Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setControlsVisible(false)}
        className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 group select-none"
      >
        {/* HTML5 Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          playsInline
        />

        {/* Buffering Spinner */}
        {isBuffering && !playbackFailed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none z-10">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-3" />
            <span className="text-xs font-mono text-emerald-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
              {isUsingProxy ? 'Buffering via Proxy...' : 'Connecting Live Stream...'}
            </span>
          </div>
        )}

        {/* Auto-Retry Overlay */}
        {retryCount > 0 && !playbackFailed && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs backdrop-blur-md">
            <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            <span>
              Retrying stream ({retryCount}/3){isUsingProxy ? ' • Switched to Express Proxy' : ''}
            </span>
          </div>
        )}

        {/* Stream Unavailable Overlay with Suggested Alternatives */}
        {playbackFailed && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Stream Unavailable</h3>
            <p className="text-xs text-slate-400 max-w-md mb-4">
              This channel broadcast could not be reached after 3 attempts. Try another live channel from{' '}
              <span className="text-emerald-400 font-medium">{categoryConfig?.name || 'this category'}</span>:
            </p>

            {/* Alternative channels list */}
            {alternativeChannels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-xl mb-5">
                {alternativeChannels.map((alt) => (
                  <button
                    key={alt.id || alt.url}
                    type="button"
                    onClick={() => onSelectChannel && onSelectChannel(alt)}
                    className="flex flex-col items-center p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-850 transition-all text-left group/alt"
                  >
                    <div className="w-10 h-10 mb-2">
                      <LazyImage src={alt.logo} alt={alt.name} title={alt.name} className="w-full h-full" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 group-hover/alt:text-emerald-400 truncate w-full text-center">
                      {alt.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={retryStream}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Channel
              </button>
              {onNextChannel && (
                <button
                  type="button"
                  onClick={onNextChannel}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  Next Channel &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        {/* Big Center Play/Pause button (shows when paused or hover) */}
        {!isPlaying && !isBuffering && !playbackFailed && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10 transition-opacity"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>
        )}

        {/* Stats Overlay Drawer */}
        {showStats && (
          <div className="absolute top-4 right-4 z-20 w-72 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 text-xs font-mono backdrop-blur-md shadow-2xl text-slate-300">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-bold text-white">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Activity className="w-4 h-4" /> Stream Metrics
              </span>
              <button onClick={() => setShowStats(false)} className="text-slate-500 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Routing:</span>
                <span className={isUsingProxy ? 'text-amber-400' : 'text-emerald-400'}>
                  {isUsingProxy ? 'Server Proxy' : 'Direct HLS'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Resolution:</span>
                <span>{stats.resolution || 'Auto / Dynamic'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bitrate:</span>
                <span>{stats.bitrate ? `${Math.round(stats.bitrate / 1000)} kbps` : 'Variable'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Buffer:</span>
                <span>{stats.bufferLength}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dropped Frames:</span>
                <span>{stats.droppedFrames}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quality Selector Dropdown Menu */}
        {showQualityMenu && (
          <div className="absolute bottom-16 right-16 z-30 w-44 bg-slate-950/95 border border-slate-800 rounded-2xl p-2 shadow-2xl backdrop-blur-md">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1 mb-1 border-b border-slate-800">
              Quality
            </div>
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setQualityLevel(-1);
                  setShowQualityMenu(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                  currentLevel === -1
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Auto</span>
                {stats.resolution && <span className="text-[10px] opacity-70">({stats.resolution})</span>}
              </button>

              {levels.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => {
                    setQualityLevel(lvl.id);
                    setShowQualityMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                    currentLevel === lvl.id
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{lvl.label}</span>
                  {lvl.bitrate && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {Math.round(lvl.bitrate / 1000)}k
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Top Header Overlay inside Player */}
        <div
          className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-20 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900/80 border border-slate-800 p-1 flex items-center justify-center">
              <LazyImage
                src={activeChannel?.logo}
                alt={activeChannel?.name}
                title={activeChannel?.name}
                className="w-full h-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-sm sm:text-base drop-shadow truncate max-w-[200px] sm:max-w-md">
                  {activeChannel?.name || 'Live Sports Broadcast'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold uppercase tracking-wider animate-pulse-live">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 drop-shadow truncate">
                {activeChannel?.group || activeChannel?.country || 'Universal IPTV'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Favorite toggle on player */}
            <button
              type="button"
              onClick={() => favoritesHook?.toggleFavorite(activeChannel)}
              className={`p-2 rounded-xl backdrop-blur-md border transition-colors ${
                favoritesHook?.isFavorite(activeChannel)
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-black/40 text-white/80 border-white/10 hover:text-white hover:bg-black/60'
              }`}
              title="Add to favorites"
            >
              <Heart
                className={`w-4 h-4 ${favoritesHook?.isFavorite(activeChannel) ? 'fill-rose-500' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Custom Controls Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-2 z-20 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            {/* Left Controls: Play/Pause, Next/Prev, Volume */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Previous Channel */}
              <button
                type="button"
                onClick={onPrevChannel}
                disabled={!onPrevChannel}
                className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-30"
                title="Previous Channel (P)"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={togglePlay}
                className="p-2 sm:p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-lg hover:scale-105"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Next Channel */}
              <button
                type="button"
                onClick={onNextChannel}
                disabled={!onNextChannel}
                className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-30"
                title="Next Channel (N)"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Volume Slider & Mute */}
              <div className="flex items-center gap-2 group/vol ml-1">
                <button
                  type="button"
                  onClick={() => setMuted((prev) => !prev)}
                  className="p-1.5 sm:p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                  title={muted ? 'Unmute (M)' : 'Mute (M)'}
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (muted) setMuted(false);
                  }}
                  className="w-16 sm:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  title={`Volume: ${Math.round(volume * 100)}%`}
                />
              </div>

              {/* Live indicator tag */}
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[11px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>LIVE</span>
              </div>
            </div>

            {/* Right Controls: Quality, Stats, Switcher, PiP, Theater, Fullscreen */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Channel Switcher Drawer Button */}
              <button
                type="button"
                onClick={() => setShowChannelSwitcher((prev) => !prev)}
                className={`p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors ${
                  showChannelSwitcher ? 'bg-emerald-500/20 text-emerald-400' : ''
                }`}
                title="Quick Channel Switcher"
              >
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Stream Stats Toggle */}
              <button
                type="button"
                onClick={() => setShowStats((prev) => !prev)}
                className={`p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors ${
                  showStats ? 'bg-emerald-500/20 text-emerald-400' : ''
                }`}
                title="Stream Health & Metrics"
              >
                <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Quality Selector */}
              <button
                type="button"
                onClick={() => setShowQualityMenu((prev) => !prev)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition-colors"
                title="Quality Settings"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">
                  {currentLevel === -1
                    ? 'Auto'
                    : levels[currentLevel]?.label || `${currentLevel}p`}
                </span>
              </button>

              {/* AirPlay / Cast button if supported */}
              {window.WebKitPlaybackTargetAvailabilityEvent && (
                <button
                  type="button"
                  onClick={handleAirPlay}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  title="AirPlay"
                >
                  <Cast className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Picture in Picture */}
              {document.pictureInPictureEnabled && (
                <button
                  type="button"
                  onClick={handleTogglePiP}
                  className="hidden sm:flex p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  title="Picture-in-Picture"
                >
                  <PictureInPicture className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Theater Mode */}
              <button
                type="button"
                onClick={onToggleTheater}
                className={`hidden md:flex p-2 rounded-xl transition-colors ${
                  theaterMode
                    ? 'text-emerald-400 bg-emerald-500/20'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title="Theater Mode (T)"
              >
                <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Fullscreen */}
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Fullscreen (F)"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Channel Switcher Drawer (Below/Beside Player) */}
      {showChannelSwitcher && (
        <div className="mt-4 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Quick Switch • {categoryConfig?.name || 'Category'} ({categoryChannels.length})
              </h4>
            </div>
            <button
              onClick={() => setShowChannelSwitcher(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close ✕
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {categoryChannels.map((channel) => (
              <button
                key={channel.id || channel.url}
                type="button"
                onClick={() => onSelectChannel && onSelectChannel(channel)}
                className={`flex items-center gap-2.5 p-2 rounded-xl border shrink-0 text-left transition-all ${
                  activeChannel?.url === channel.url
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-7 h-7 shrink-0">
                  <LazyImage src={channel.logo} alt={channel.name} title={channel.name} className="w-full h-full" />
                </div>
                <span className="text-xs font-medium max-w-[120px] truncate">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
