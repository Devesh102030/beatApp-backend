# Quick Start Guide

Get the Music Room backend running in 5 minutes.

## Prerequisites

- Node.js 18+
- pnpm
- Docker & Docker Compose

## Steps

### 1. Install Dependencies

```bash
cd music-room-backend
pnpm install
```

### 2. Start Database

```bash
docker-compose up -d
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set your LiveKit credentials:

```env
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

### 4. Setup Database

```bash
pnpm prisma:generate
pnpm prisma:migrate
```

### 5. Start Server

```bash
pnpm dev
```

### 6. Test It

Open http://localhost:3000/api/docs

Try creating a room:

```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"name": "My First Room"}'
```

You'll get back a `roomCode` and `hostSecret`. Save these!

## What's Next?

- Read [API.md](docs/API.md) for full API documentation
- Read [SETUP.md](docs/SETUP.md) for detailed setup
- Read [ARCHITECTURE.md](docs/ARCHITECTURE.md) to understand the system
- Check [CHECKLIST.md](CHECKLIST.md) before deploying

## Common Issues

**Port 3000 in use?**
Change `PORT=3001` in `.env`

**Database connection failed?**
Check Docker is running: `docker ps`

**LiveKit token errors?**
Verify your LiveKit credentials in `.env`

## Test Data

Want test data? Run:

```bash
pnpm prisma:seed
```

This creates:
- Test room with code `TEST01`
- Host secret: `test-secret-123`
- Sample users and chat messages

## API Endpoints

- `POST /api/users/guest` - Create guest user
- `POST /api/rooms` - Create room
- `GET /api/rooms/:code` - Get room info
- `POST /api/rooms/:code/join` - Join room
- `POST /api/livekit/token` - Get LiveKit token

## WebSocket

Connect to `ws://localhost:3000`

Events:
- `room:join` - Join a room
- `chat:message` - Send message
- `room:state` - Receive updates

## Need Help?

1. Check the logs in your terminal
2. Read [docs/API.md](docs/API.md)
3. Review [docs/SETUP.md](docs/SETUP.md)
4. Check [CHECKLIST.md](CHECKLIST.md)

Happy coding! 🎵
