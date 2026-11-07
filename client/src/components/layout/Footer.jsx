import React from 'react';
import { ShieldCheck, Radio, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/70 backdrop-blur text-slate-400 py-10 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
              Live Sports TV <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">HLS v2</span>
            </span>
            <p className="text-xs text-slate-500">Universal IPTV & Sports Streaming Player</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <Link to="/favorites" className="hover:text-emerald-400 transition-colors">Favorites</Link>
          <Link to="/settings" className="hover:text-emerald-400 transition-colors">Settings & Playlists</Link>
          <a
            href="https://github.com/iptv-org/iptv"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-emerald-400 transition-colors"
          >
            IPTV-Org <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="flex items-start gap-2.5 max-w-3xl text-[11px] leading-relaxed text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p>
            <strong>Legal Disclaimer:</strong> Live Sports TV is a modern web-based IPTV media player that parses user-provided M3U/M3U8 playlists and public community indexes. It does not host, broadcast, or distribute any media content. Users are solely responsible for verifying and ensuring they have the legal right and licensing to view any stream added or accessed through this player.
          </p>
        </div>
        <p className="text-[11px] text-slate-600 whitespace-nowrap">
          &copy; {new Date().getFullYear()} Live Sports TV
        </p>
      </div>
    </footer>
  );
}
