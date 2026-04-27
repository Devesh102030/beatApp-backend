# Music Room Backend

Production-grade backend for a low-latency music room platform. Supports web app + Chrome extension system for synchronized audio streaming using LiveKit.

## Features

- 🎵 **Real-time Audio Streaming**: LiveKit-powered WebRTC audio streaming
- 🏠 **Room Management**: Create, join, and manage music rooms
- 👥 **Guest Users**: No authentication required for MVP
- 💬 **Live Chat**: Real-time chat in rooms using Socket.IO
- 🔐 **Host Authentication**: Secure host secret validation
- 📊 **Room State Management**: In-memory state with Redis-ready architecture
- 🔒 **Security**: Helmet, CORS, rate limiting, input validation
- 📝 **API Documentation**: Swagger/OpenAPI docs
- 🐳 **Docker Support**: Docker Compose for local development

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **Streaming**: LiveKit Server SDK
- **Validation**: class-validator
- **Security**: Helmet, bcryptjs
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+ 
- pnpm 8+
- Docker & Docker Compose (for local PostgreSQL)
- LiveKit server (cloud or self-hosted)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://music:music@localhost:5432/music_room?schema=public
WEB_APP_URL=http://localhost:5173
EXTENSION_ORIGIN=chrome-extension://your-extension-id
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
JWT_SECRET=your-jwt-secret-change-in-production
HOST_SECRET_SIGNING_KEY=your-host-secret-signing-key-change-in-production
```

### 3. Start PostgreSQL

```bash
docker-compose up -d
```

### 4. Run Database Migrations

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

### 5. Start Development Server

```bash
pnpm dev
```

The API will be available at `http://localhost:3000/api`

Swagger documentation: `http://localhost:3000/api/docs`

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run unit tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:cov` - Run tests with coverage
- `pnpm lint` - Lint code
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio

## Architecture

### Modules

- **Config Module**: Environment configuration and validation
- **Prisma Module**: Database connection and ORM
- **State Module**: In-memory room state management (Redis-ready)
- **Users Module**: Guest user creation and management
- **Rooms Module**: Room lifecycle management
- **LiveKit Module**: Token generation for WebRTC streaming
- **Chat Module**: Persistent chat message storage
- **Realtime Module**: Socket.IO gateway for real-time events

### State Management

The application uses an abstracted `RoomStateStore` interface for live room state. The MVP uses an in-memory implementation, but the interface allows easy migration to Redis without changing business logic.

```typescript
interface RoomStateStore {
  getRoomState(roomCode: string): Promise<LiveRoomState | null>;
  setRoomState(roomCode: string, state: LiveRoomState): Promise<void>;
  patchRoomState(roomCode: string, patch: Partial<LiveRoomState>): Promise<void>;
  deleteRoomState(roomCode: string): Promise<void>;
  addMember(roomCode: string, userId: string, socketId: string): Promise<void>;
  removeMember(roomCode: string, userId: string, socketId?: string): Promise<void>;
  getMemberCount(roomCode: string): Promise<number>;
  setHostOnline(roomCode: string, online: boolean): Promise<void>;
}
```

## API Endpoints

### Users

- `POST /api/users/guest` - Create a guest user

### Rooms

- `POST /api/rooms` - Create a new room
- `GET /api/rooms/:roomCode` - Get room metadata
- `POST /api/rooms/:roomCode/join` - Join a room as listener
- `POST /api/rooms/:roomCode/end` - End a room (requires host secret)
- `POST /api/rooms/:roomCode/broadcast/starting` - Mark broadcast starting
- `POST /api/rooms/:roomCode/broadcast/live` - Mark broadcast live
- `POST /api/rooms/:roomCode/broadcast/stopped` - Mark broadcast stopped

### LiveKit

- `POST /api/livekit/token` - Generate LiveKit access token

### WebSocket Events

**Client → Server:**
- `room:join` - Join a room
- `room:leave` - Leave a room
- `chat:message` - Send chat message
- `host:heartbeat` - Host heartbeat

**Server → Client:**
- `room:state` - Room state update
- `member:joined` - Member joined room
- `member:left` - Member left room
- `chat:message` - Chat message broadcast
- `host:live` - Host started broadcasting
- `host:stopped` - Host stopped broadcasting

## Security

- **Helmet**: Security headers
- **CORS**: Configured for web app and extension origins
- **Rate Limiting**: 100 requests per minute per IP
- **Input Validation**: All inputs validated with class-validator
- **Host Secrets**: Bcrypt hashed, timing-safe comparison
- **LiveKit Tokens**: Server-side generation only, role-based permissions

## Database Schema

### Models

- **User**: Guest and authenticated users
- **Room**: Music rooms with status tracking
- **RoomMember**: Room membership records
- **RoomSession**: Broadcast session tracking
- **ChatMessage**: Persistent chat history

### Enums

- **RoomStatus**: `idle`, `waiting_for_host`, `live`, `ended`
- **RoomRole**: `host`, `listener`, `moderator`

## Testing

Run tests:

```bash
pnpm test
```

Run tests with coverage:

```bash
pnpm test:cov
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong secrets for `JWT_SECRET` and `HOST_SECRET_SIGNING_KEY`
3. Configure production database URL
4. Set up proper CORS origins
5. Configure LiveKit production server
6. Consider adding Redis for state management
7. Set up proper logging and monitoring
8. Use a process manager (PM2, systemd)

## Future Enhancements

- [ ] Redis implementation for `RoomStateStore`
- [ ] Full authentication system
- [ ] Room permissions and moderation
- [ ] Recording functionality
- [ ] Analytics and metrics
- [ ] Rate limiting per user
- [ ] WebSocket authentication
- [ ] Room expiration and cleanup

## License

MIT
