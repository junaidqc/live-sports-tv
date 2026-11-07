import React, { useState } from 'react';
import { Tv } from 'lucide-react';

/**
 * Image component that handles lazy-loading, CORS issues, and displays
 * an elegant sports fallback badge if the remote channel logo fails to load.
 */
export function LazyImage({ src, alt = '', className = '', fallbackIcon: FallbackIcon = Tv, title = '' }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Compute initials for the fallback badge
  const initials = (title || alt || 'TV')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-800/80 border border-slate-700/50 rounded-lg text-emerald-400 font-bold select-none ${className}`}
        title={title || alt}
      >
        {initials ? (
          <span className="text-xs tracking-wider font-mono opacity-90">{initials}</span>
        ) : (
          <FallbackIcon className="w-5 h-5 opacity-70" />
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-slate-800/40 rounded-lg ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
          <FallbackIcon className="w-4 h-4 text-slate-600" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
