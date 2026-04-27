# Music Room Broadcaster — Chrome Extension

Captures audio from the active browser tab and publishes it to LiveKit so Music Room listeners can hear it in real time.

## Architecture

```
Popup (React)
  │  sends START_BROADCAST / STOP_BROADCAST
  ▼
Service Worker (MV3)
  │  calls chrome.tabCapture.getMediaStreamId()
  │  creates offscreen document
  │  forwards message + streamId
  ▼
Offscreen Document
  │  calls getUserMedia({ chromeMediaSource: 'tab', chromeMediaSourceId })
  │  routes audio back to AudioContext.destination (host hears tab)
  │  calls POST /api/rooms/:code/broadcast/starting
  │  calls POST /api/livekit/token (role: host)
  │  connects livekit-client
  │  publishes LocalAudioTrack
  │  calls POST /api/rooms/:code/broadcast/live
  │  ← on stop →
  │  unpublishes track, disconnects LiveKit
  │  calls POST /api/rooms/:code/broadcast/stopped
  ▼
Status updates flow back: Offscreen → Service Worker → Popup
```

## Why this architecture?

- **MV3 service workers** cannot hold long-lived connections (LiveKit WebSocket)
- **Offscreen documents** can hold WebSockets and use `getUserMedia`
- **`chrome.tabCapture.getMediaStreamId`** must be called from the service worker (has `tabCapture` permission), then the stream ID is passed to the offscreen document which calls `getUserMedia` with it

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Generate icons

```bash
node scripts/generate-icons.mjs
```

### 3. Build

```bash
pnpm build
```

This produces the `dist/` folder.

### 4. Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. The extension icon appears in the toolbar

### 5. Use it

1. Open **Spotify Web Player** or **YouTube Music** in a Chrome tab
2. Start playing music
3. Click the **Music Room Broadcaster** extension icon
4. Enter your **Room Code** and **Host Secret** (from when you created the room)
5. Click **▶ Start Broadcast**
6. Listeners in the React web app will hear the audio

### 6. Stop broadcasting

Click **■ Stop Broadcast** in the popup.

## Development (watch mode)

```bash
pnpm dev
```

After each rebuild, go to `chrome://extensions` and click the reload button on the extension.

## File structure

```
manifest.json              Extension manifest (MV3)
src/
  popup/
    Popup.tsx              React popup UI
    popup.html             Popup HTML entry
  service-worker/
    index.ts               Background service worker
  offscreen/
    offscreen.ts           Tab capture + LiveKit publisher
    offscreen.html         Offscreen document HTML
  lib/
    api.ts                 Backend API client
    livekitPublisher.ts    LiveKit connection wrapper
    messages.ts            Message helpers
    storage.ts             chrome.storage.local helpers
    tab.ts                 Active tab info helper
  types/
    messages.ts            Shared message types
scripts/
  generate-icons.mjs       Generates placeholder PNG icons
icons/                     Generated icons (gitignored)
dist/                      Build output (gitignored)
```

## Environment

The backend URL is hardcoded to `http://localhost:3000` in the service worker.
For production, update `API_BASE_URL` in `src/service-worker/index.ts`.

## Permissions used

| Permission | Why |
|------------|-----|
| `tabCapture` | Capture audio from the active tab |
| `activeTab` | Get the active tab's ID and info |
| `offscreen` | Create offscreen document for long-lived WebSocket |
| `storage` | Save room code and host secret locally |
| `tabs` | Query active tab details |

## Troubleshooting

**"No audio detected"**
→ Make sure music is actually playing in the tab before clicking Start Broadcast.

**"Tab capture failed"**
→ You can only capture normal web pages. Chrome system pages (`chrome://`) cannot be captured.

**"LiveKit connection failed"**
→ Check that your LiveKit server URL is correct and the backend is running.

**"Invalid host secret"**
→ The host secret must match the one generated when the room was created.

**Extension not updating after rebuild**
→ Go to `chrome://extensions` and click the reload (↺) button on the extension card.

## Security notes

- Host secret is stored in `chrome.storage.local` (not synced, local only)
- Host secret is never logged
- LiveKit API key/secret never touches the extension — only backend-generated tokens are used
- Audio is only published after the backend validates the host secret and returns a token
