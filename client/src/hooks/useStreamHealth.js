import { useState, useCallback, useRef } from 'react';
import { Storage } from '../utils/storage';

/**
 * Hook to manage stream health checking with limited concurrency (5 concurrent requests).
 */
export function useStreamHealth() {
  const [healthMap, setHealthMap] = useState(() => Storage.getHealthCache());
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [hideOffline, setHideOffline] = useState(() => Storage.getHideOffline());
  const abortControllerRef = useRef(null);

  const toggleHideOffline = useCallback(() => {
    setHideOffline((prev) => {
      const next = !prev;
      Storage.saveHideOffline(next);
      return next;
    });
  }, []);

  const checkChannelHealth = async (channelUrl) => {
    try {
      const res = await fetch(`/api/health?url=${encodeURIComponent(channelUrl)}`);
      if (!res.ok) {
        return { alive: false, status: res.status };
      }
      const data = await res.json();
      return data;
    } catch {
      return { alive: false, status: 0 };
    }
  };

  const checkAllStreams = useCallback(async (channels) => {
    if (!channels || channels.length === 0 || isChecking) return;

    setIsChecking(true);
    const total = channels.length;
    setProgress({ current: 0, total, percentage: 0 });

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const newHealth = { ...Storage.getHealthCache() };
    const concurrencyLimit = 5;
    let index = 0;
    let completed = 0;

    const worker = async () => {
      while (index < channels.length) {
        if (abortControllerRef.current?.signal.aborted) break;

        const currentIndex = index++;
        const channel = channels[currentIndex];
        if (!channel || !channel.url) continue;

        const result = await checkChannelHealth(channel.url);
        newHealth[channel.url] = {
          alive: result.alive,
          status: result.status,
          latencyMs: result.latencyMs,
          checkedAt: Date.now()
        };

        completed++;
        setProgress({
          current: completed,
          total,
          percentage: Math.round((completed / total) * 100)
        });

        // Batch update state every 10 channels or when done
        if (completed % 10 === 0 || completed === total) {
          setHealthMap({ ...newHealth });
          Storage.saveHealthCache(newHealth);
        }
      }
    };

    // Run 5 concurrent workers
    const workers = [];
    for (let i = 0; i < Math.min(concurrencyLimit, channels.length); i++) {
      workers.push(worker());
    }

    await Promise.all(workers);

    setIsChecking(false);
    setHealthMap({ ...newHealth });
    Storage.saveHealthCache(newHealth);
  }, [isChecking]);

  const cancelCheck = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsChecking(false);
  }, []);

  const isDead = useCallback(
    (url) => {
      const entry = healthMap[url];
      return entry && entry.alive === false;
    },
    [healthMap]
  );

  const isAlive = useCallback(
    (url) => {
      const entry = healthMap[url];
      return entry && entry.alive === true;
    },
    [healthMap]
  );

  return {
    healthMap,
    isChecking,
    progress,
    hideOffline,
    toggleHideOffline,
    checkAllStreams,
    cancelCheck,
    isDead,
    isAlive
  };
}
