import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

/**
 * Custom hook to manage HLS stream playback with hls.js and native Safari fallback.
 * Includes auto-retry (3 attempts), automatic fallback to /api/stream proxy,
 * quality level selection, and stream metrics.
 */
export function useHls(videoRef, rawStreamUrl, { autoPlay = true, onPlay, onError } = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 is Auto
  const [retryCount, setRetryCount] = useState(0);
  const [isUsingProxy, setIsUsingProxy] = useState(false);
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [stats, setStats] = useState({
    bitrate: 0,
    resolution: '',
    bufferLength: 0,
    droppedFrames: 0,
    latency: 0
  });

  const hlsRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Helper to construct proxied URL
  const getProxiedUrl = (url) => `/api/stream?url=${encodeURIComponent(url)}`;

  const cleanUpHls = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
  }, [videoRef]);

  const loadStream = useCallback(
    (targetUrl, useProxyFallback = false, currentRetry = 0) => {
      cleanUpHls();
      setPlaybackFailed(false);
      setIsBuffering(true);
      setIsUsingProxy(useProxyFallback);
      setRetryCount(currentRetry);

      const video = videoRef.current;
      if (!video || !targetUrl) return;

      const finalUrl = useProxyFallback ? getProxiedUrl(targetUrl) : targetUrl;

      // Check if HLS.js is supported
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 1,
          levelLoadingTimeOut: 10000,
          fragLoadingTimeOut: 12000,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          }
        });

        hlsRef.current = hls;

        hls.attachMedia(video);

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(finalUrl);
        });

        hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          setIsBuffering(false);
          setIsLive(data.live !== false);

          // Build quality levels
          const parsedLevels = (data.levels || []).map((lvl, index) => {
            const height = lvl.height || Math.round(lvl.bitrate / 2500);
            return {
              id: index,
              label: height ? `${height}p` : `${Math.round(lvl.bitrate / 1000)}k`,
              bitrate: lvl.bitrate,
              height: lvl.height,
              width: lvl.width
            };
          });

          setLevels(parsedLevels);
          setCurrentLevel(hls.currentLevel);

          if (autoPlay) {
            video.play().catch((err) => {
              console.warn('AutoPlay blocked or interrupted:', err);
              setIsPlaying(false);
            });
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
          const current = hls.levels[data.level];
          if (current) {
            setStats((prev) => ({
              ...prev,
              bitrate: current.bitrate || 0,
              resolution: current.width && current.height ? `${current.width}x${current.height}` : prev.resolution
            }));
          }
        });

        // Error Handling
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.warn(`HLS fatal error: ${data.type} - ${data.details}`, data);

            if (currentRetry < 3) {
              const nextRetry = currentRetry + 1;
              const nextUseProxy = !useProxyFallback || useProxyFallback; // try proxy on retry

              console.log(`Retrying stream attempt ${nextRetry}/3 (Proxy: ${nextUseProxy})...`);

              retryTimeoutRef.current = setTimeout(() => {
                loadStream(targetUrl, nextUseProxy, nextRetry);
              }, 1500 * nextRetry);
            } else {
              // All 3 attempts exhausted
              console.error('All 3 stream playback attempts failed.');
              setPlaybackFailed(true);
              setIsBuffering(false);
              if (onError) onError(data);
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Safari fallback
        video.src = finalUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsBuffering(false);
          if (autoPlay) {
            video.play().catch(() => setIsPlaying(false));
          }
        });

        const errorHandler = () => {
          if (currentRetry < 3) {
            const nextRetry = currentRetry + 1;
            retryTimeoutRef.current = setTimeout(() => {
              loadStream(targetUrl, true, nextRetry);
            }, 1500 * nextRetry);
          } else {
            setPlaybackFailed(true);
            setIsBuffering(false);
          }
        };

        video.addEventListener('error', errorHandler, { once: true });
      } else {
        setPlaybackFailed(true);
        setIsBuffering(false);
      }
    },
    [autoPlay, cleanUpHls, onError, videoRef]
  );

  // Load stream when URL changes
  useEffect(() => {
    if (rawStreamUrl) {
      loadStream(rawStreamUrl, false, 0);
    }
    return () => cleanUpHls();
  }, [rawStreamUrl, loadStream, cleanUpHls]);

  // Video event listeners for state sync & metrics
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      if (onPlay) onPlay();
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    // Periodic stats polling
    const statsInterval = setInterval(() => {
      if (video && !video.paused) {
        let bufferLength = 0;
        if (video.buffered && video.buffered.length > 0) {
          try {
            bufferLength = Math.max(0, video.buffered.end(video.buffered.length - 1) - video.currentTime);
          } catch {}
        }

        const qualityInfo = video.getVideoPlaybackQuality ? video.getVideoPlaybackQuality() : null;

        setStats((prev) => ({
          ...prev,
          bufferLength: parseFloat(bufferLength.toFixed(1)),
          droppedFrames: qualityInfo ? qualityInfo.droppedVideoFrames : prev.droppedFrames,
          resolution: video.videoWidth ? `${video.videoWidth}x${video.videoHeight}` : prev.resolution
        }));
      }
    }, 2000);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      clearInterval(statsInterval);
    };
  }, [videoRef, onPlay]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch((e) => console.warn('Play interrupted:', e));
    } else {
      video.pause();
    }
  }, [videoRef]);

  const setQualityLevel = useCallback(
    (levelIndex) => {
      if (hlsRef.current) {
        hlsRef.current.currentLevel = levelIndex; // -1 for auto
        setCurrentLevel(levelIndex);
      }
    },
    []
  );

  const retryStream = useCallback(() => {
    if (rawStreamUrl) {
      loadStream(rawStreamUrl, true, 0);
    }
  }, [loadStream, rawStreamUrl]);

  return {
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
  };
}
