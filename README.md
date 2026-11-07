# Live Sports TV 📺⚽🏎️

A complete, production-quality "Live Sports TV" IPTV web application that loads M3U/M3U8 playlists, auto-classifies channels into sport categories, and delivers high-performance playback through a custom HLS video player with server-side proxying, SSRF protection, stream health checks, and responsive sports-broadcast UI.

---

## 🌟 Key Features

### 1. Robust Video Player (Custom HLS Controls)
- **Built on `hls.js`** with automatic native fallback for Safari (iOS/macOS).
- **Controls**: Play/Pause, volume slider + instant mute, Fullscreen, Picture-in-Picture (PiP), Theater mode.
- **Adaptive Bitrate & Manual Quality Selector**: Switch between Auto and discrete levels (`1080p`, `720p`, `480p`, `360p`) parsed from the manifest.
- **Live Stream Indicator**: Pulsing badge, buffer length, dropped frame monitor, and connection metrics overlay.
- **Auto-Recovery & Proxy Fallback**: Automatically tries direct stream first; if CORS or mixed content occurs, it immediately reroutes through the Express proxy. Auto-retries 3 times before displaying a graceful error overlay with suggested alternative channels from the same category.
- **Channel Switcher Drawer**: Quick carousel tray directly on the player for switching channels in the active category with 1 click.
- **Keyboard Shortcuts**:
  - `Space`: Play / Pause
  - `M`: Mute / Unmute
  - `F`: Fullscreen toggle
  - `T`: Theater mode toggle
  - `Up` / `Down`: Volume +/- 5%
  - `N` / `P`: Next / Previous channel
  - `Ctrl + K`: Global instant channel search

### 2. High-Performance Express Proxy Backend
- **`/api/playlist?url=`**: Fetches remote M3U playlists server-side to bypass CORS.
  - **SSRF Protection**: Blocks loopback (`127.0.0.1`), link-local metadata (`169.254.169.254`), private RFC1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and non-HTTP(S) schemes.
  - **10-Minute In-Memory Cache**: Lowers network overhead with instant response times.
  - **10s Request Timeout**.
- **`/api/stream?url=`**: Proxies `.m3u8` playlists and binary media segments (`.ts`, `.m4s`, `.aac`).
  - **Full Manifest Rewriter**: Rewrites both relative paths, absolute URLs, key URIs (`#EXT-X-KEY`), and maps (`#EXT-X-MAP`) so all media chunks stream seamlessly.
  - **Range Request Forwarding**: Supports HTTP 206 Partial Content for video seeking and buffering.
- **`/api/health?url=`**: Rapid HEAD/GET check (4s timeout) returning status, alive state, and latency in milliseconds.
- **Security & Rate Limiting**: Secured with Helmet headers and rate limiters tailored for streaming.

### 3. Smart Categorization System
Auto-classifies all channels using `group-title` first, then fuzzy keyword matching on channel name across 8 sport categories:
1. **Football / Soccer** (Premier League, La Liga, Serie A, Champions League, UEFA, MLS, FIFA, etc.)
2. **Cricket** (IPL, PSL, BBL, ICC, PTV Sports, Willow, Star Sports, Ashes, etc.)
3. **Basketball** (NBA, EuroLeague, WNBA, FIBA, NCAA)
4. **Tennis** (ATP, WTA, Wimbledon, Roland Garros, US Open, Davis Cup)
5. **Motorsport** (F1, MotoGP, NASCAR, IndyCar, Rally, WRC)
6. **Combat Sports** (UFC, WWE, Boxing, MMA, Wrestling, Bellator, ONE)
7. **American Sports** (NFL, MLB, NHL, American Football, Baseball, Ice Hockey)
8. **Other Sports** (Golf, Rugby, Athletics, Cycling, Volleyball, Olympics, Extreme Sports)

Configurable keyword lists are centralized in `client/src/config/categories.js`.

### 4. Playlist & Settings Management
- **Default Sources**:
  - `https://iptv-org.github.io/iptv/categories/sports.m3u`
  - `https://iptv-org.github.io/iptv/index.m3u` (filtered for sports)
- **Custom Playlists**: Add, remove, enable, or disable any M3U/M3U8 URL.
- **Local M3U File Upload**: Upload local `.m3u` playlist files directly from your computer or phone.
- **Stream Diagnostic Health Checker**: Runs background health checks with limited concurrency (5 requests) and flags dead channels with an offline badge. Includes option to "Hide Offline Channels".
- **Zero Database Required**: All playlists, favorites, recently watched items, and volume preferences persist cleanly in browser `localStorage`.

### 5. Broadcast UI & PWA
- Sports broadcast dark theme with electric emerald & cyan accents, glassmorphic panels, and light/dark mode toggle.
- PWA ready (`manifest.json`, mobile meta tags, standalone display mode).

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested on Node v26)
- npm 9+

### Installation

Clone the repository and install dependencies:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..
```

### Running the App (Single Command)

To run both the Express backend (port 3001) and the Vite frontend (port 5173) concurrently:

```bash
npm run dev
```

Then open your browser at:
👉 **`http://localhost:5173`** (Development with hot-reload)

---

## 📦 Production Build & Deployment

To compile the React frontend and run the complete app on a single port (port 3001 or `$PORT`):

```bash
# Build the client into client/dist
npm run build

# Start the unified Express production server
npm start
```

Then navigate to:
👉 **`http://localhost:3001`**

---

## ⚙️ Environment Variables

Create a `.env` file in the `server/` directory (or root) to customize server behavior:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | Port number for Express server |
| `NODE_ENV` | `development` | Node environment (`development` or `production`) |

---

## 🧪 Testing

Run the automated End-to-End verification test suite:

```bash
npm test
```

This verifies:
- SPA frontend delivery
- Server-side M3U playlist fetching & in-memory caching
- 8-category channel classification
- Stream health check responses
- HLS manifest URL rewriting & segment proxying
- SSRF prevention against private IP & cloud metadata exploits

---

## ⚖️ Legal Disclaimer

Live Sports TV does not host, broadcast, or distribute any video streams. All stream links are loaded directly from user-provided or open-source community M3U playlists. Users are solely responsible for ensuring they have the legal right and proper licensing to view any streams accessed through this application.
