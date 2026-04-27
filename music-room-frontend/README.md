# Music Room — Frontend

React + TypeScript + Tailwind frontend for the Music Room platform.

## Stack

- **Vite** — build tool
- **React 18** — UI
- **TypeScript** — type safety
- **Tailwind CSS** — styling
- **React Router v6** — routing
- **Socket.IO Client** — real-time events
- **livekit-client** — WebRTC audio streaming
- **Zustand** — (available, state managed via hooks for now)

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open http://localhost:5173

## Environment

```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — create or join a room |
| `/create` | Create a new room |
| `/r/:roomCode` | Room page — listen, chat, host panel |

## Key Files

```
main.tsx              Entry point
App.tsx               Router
routes/
  LandingPage.tsx     Home
  CreateRoomPage.tsx  Room creation + host secret reveal
  RoomPage.tsx        Main room experience
components/
  RoomHeader.tsx      Room name, status, listener count
  HostPanel.tsx       Host secret + instructions
  ChatPanel.tsx       Real-time chat
  ListenerControls.tsx  LiveKit audio controls
  StatusBadge.tsx     Room status pill
  CopyButton.tsx      Clipboard copy
  LoadingState.tsx    Spinner
  ErrorState.tsx      Error display
hooks/
  useGuestUser.ts     Guest user creation + storage
  useRoom.ts          Fetch room metadata
  useSocketRoom.ts    Socket.IO connection + events
  useLiveKitListener.ts  LiveKit audio subscription
lib/
  api.ts              Typed API client
  storage.ts          localStorage helpers
  socket.ts           Socket.IO singleton
types/
  api.ts              API response types
  socket.ts           Socket event types
  room.ts             Room state types
  livekit.ts          LiveKit connection state
```

## Flow

1. **Create room** → POST /api/rooms → store hostSecret in localStorage → redirect to /r/:code
2. **Join room** → POST /api/users/guest (if needed) → POST /api/rooms/:code/join → connect Socket.IO
3. **Listen** → POST /api/livekit/token → connect livekit-client → subscribe to audio tracks
4. **Chat** → emit `chat:message` over Socket.IO → receive broadcasts

## Scripts

```bash
pnpm dev       # Start dev server (port 5173)
pnpm build     # Production build
pnpm preview   # Preview production build
pnpm lint      # ESLint
```
