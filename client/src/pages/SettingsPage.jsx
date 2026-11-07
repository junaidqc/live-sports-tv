import React, { useState, useRef } from 'react';
import {
  ListPlus,
  Trash2,
  Upload,
  CheckCircle2,
  XCircle,
  Activity,
  RefreshCw,
  EyeOff,
  Eye,
  Shield,
  Layers,
  Sparkles,
  Link as LinkIcon,
  FileText
} from 'lucide-react';

export function SettingsPage({
  playlists = [],
  channels = [],
  addPlaylist,
  removePlaylist,
  togglePlaylist,
  uploadM3UFile,
  reloadPlaylists,
  healthHook,
  totalChannels = 0
}) {
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  const {
    healthMap,
    isChecking,
    progress,
    hideOffline,
    toggleHideOffline,
    checkAllStreams,
    cancelCheck
  } = healthHook;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setAddError('');

    const trimmed = newUrl.trim();
    if (!trimmed) {
      setAddError('Please enter a valid M3U/M3U8 URL');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setAddError('URL must start with http:// or https://');
      return;
    }

    addPlaylist(newName.trim() || 'Custom M3U Playlist', trimmed);
    setNewUrl('');
    setNewName('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      await uploadM3UFile(file);
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Health summary metrics
  const testedCount = Object.keys(healthMap).length;
  const aliveCount = Object.values(healthMap).filter((h) => h.alive).length;
  const deadCount = Object.values(healthMap).filter((h) => !h.alive).length;

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Title Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Settings & Playlist Sources
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
          Manage your M3U IPTV sources, run stream health verifications, and customize playback preferences.
        </p>
      </div>

      {/* Stream Health Verification Section */}
      <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Stream Health Diagnostic</h2>
              <p className="text-xs text-slate-400">
                Tests streams with 5 concurrent server-side checks and flags offline channels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isChecking ? (
              <button
                type="button"
                onClick={cancelCheck}
                className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/30 transition-colors"
              >
                Cancel Check
              </button>
            ) : (
              <button
                type="button"
                onClick={() => checkAllStreams(channels)}
                disabled={channels.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md hover:scale-105 disabled:opacity-50"
              >
                <Activity className="w-4 h-4" />
                <span>Check All {channels.length} Streams</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar when checking */}
        {isChecking && (
          <div className="space-y-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>
                Checking {progress.current} of {progress.total} streams...
              </span>
              <span className="text-emerald-400 font-bold">{progress.percentage}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Health Stats & Offline Toggle */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-500">Tested</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">{testedCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-500">Alive</span>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">{aliveCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-500">Offline</span>
            <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">{deadCount}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={toggleHideOffline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                hideOffline
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              {hideOffline ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{hideOffline ? 'Offline Hidden' : 'Hide Offline'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Playlist Sources Management */}
      <section className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-lg space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Configured Playlists</h2>
              <p className="text-xs text-slate-400">
                Enable, disable, add custom URLs, or upload your own .m3u files.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={reloadPlaylists}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reload All</span>
          </button>
        </div>

        {/* Existing Playlists Table */}
        <div className="space-y-3">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white truncate">{playlist.name}</h4>
                  {playlist.isDefault && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Default
                    </span>
                  )}
                  {playlist.filterOnlySports && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Sports Filtered
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-slate-500 truncate mt-1">
                  {playlist.url || 'Local uploaded file'}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {/* Enable/Disable Toggle */}
                <button
                  type="button"
                  onClick={() => togglePlaylist(playlist.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    playlist.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                >
                  {playlist.enabled ? 'Enabled' : 'Disabled'}
                </button>

                {/* Remove button (only for non-default) */}
                {!playlist.isDefault && (
                  <button
                    type="button"
                    onClick={() => removePlaylist(playlist.id)}
                    className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Playlist Form */}
        <form onSubmit={handleAddSubmit} className="pt-4 border-t border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-emerald-400" /> Add Custom M3U URL
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Playlist Name (e.g. My Sports IPTV)"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com/playlist.m3u"
              className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {addError && <p className="text-xs text-rose-400">{addError}</p>}

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-500">
              Fetched via backend proxy to bypass CORS restrictions.
            </p>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow"
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>Add Playlist</span>
            </button>
          </div>
        </form>

        {/* Upload Local .m3u File */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
            <FileText className="w-3.5 h-3.5 text-cyan-400" /> Upload Local .m3u / .m3u8 File
          </h3>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".m3u,.m3u8,text/plain"
              onChange={handleFileUpload}
              className="hidden"
              id="m3u-file-input"
            />
            <label
              htmlFor="m3u-file-input"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>{uploadLoading ? 'Importing file...' : 'Choose File from Device'}</span>
            </label>
            <span className="text-[11px] text-slate-500">
              Supports standard M3U/M3U8 playlist formats. Stored locally on this browser.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
