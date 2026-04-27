# 🎵 START HERE - Music Room Backend

Welcome! This document will get you started quickly.

## What Is This?

A **production-grade backend** for a low-latency music room platform where:
- A host streams audio from their browser (Spotify, YouTube Music, etc.)
- Multiple listeners join and hear the same audio in real-time
- Everyone can chat together
- Built with NestJS, PostgreSQL, LiveKit, and Socket.IO

## 📋 What You Need

Before starting, make sure you have:

- ✅ **Node.js 18+** - [Download](https://nodejs.org/)
- ✅ **pnpm** - Install with `npm install -g pnpm`
- ✅ **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- ✅ **LiveKit Account** - [Sign up free](https://livekit.io) or self-host

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd music-room-backend
pnpm install
```

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Open `.env` and add your LiveKit credentials:

```env
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

**Where to get LiveKit credentials:**
1. Go to [livekit.io](https://livekit.io)
2. Create a free account
3. Create a new project
4. Copy the API Key, Secret, and WebSocket URL

### Step 3: Start Database

```bash
docker-compose up -d
```

### Step 4: Setup Database

```bash
pnpm prisma:generate
pnpm prisma:migrate dev --name init
```

### Step 5: (Optional) Add Test Data

```bash
pnpm prisma:seed
```

This creates a test room with code `TEST01` and host secret `test-secret-123`.

### Step 6: Start Server

```bash
pnpm dev
```

### Step 7: Test It! 🎉

Open your browser to:
- **Swagger API Docs**: http://localhost:3000/api/docs

Try creating a room in Swagger:
1. Click on `POST /api/rooms`
2. Click "Try it out"
3. Enter: `{"name": "My First Room"}`
4. Click "Execute"
5. You'll get back a `roomCode` and `hostSecret` - save these!

## 📚 What to Read Next

Depending on what you need:

| I want to... | Read this |
|--------------|-----------|
| **Get started quickly** | [QUICKSTART.md](QUICKSTART.md) |
| **Understand the API** | [docs/API.md](docs/API.md) |
| **Set up for development** | [docs/SETUP.md](docs/SETUP.md) |
| **Understand the architecture** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| **Deploy to production** | [CHECKLIST.md](CHECKLIST.md) |
| **See all commands** | [MANUAL_COMMANDS.md](MANUAL_COMMANDS.md) |
| **Get an overview** | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |

## 🎯 Key Concepts

### Rooms
- Created by a host
- Have a unique 6-character code (e.g., `ABCD12`)
- Can be in states: `idle`, `waiting_for_host`, `live`, or `ended`

### Host
- Creates the room
- Gets a secret key (only shown once!)
- Uses Chrome extension to stream audio
- Controls broadcast start/stop

### Listeners
- Join using room code
- Can be guests (no account needed)
- Receive audio stream via LiveKit
- Can chat in real-time

### LiveKit Tokens
- Generated server-side
- Host tokens allow publishing audio
- Listener tokens only allow subscribing
- Short-lived (2 hours)

## 🔧 Common Commands

```bash
# Development
pnpm dev                    # Start with hot reload
pnpm build                  # Build for production
pnpm start:prod             # Start production server

# Database
pnpm prisma:studio          # Open database GUI
pnpm prisma:migrate dev     # Create migration
pnpm prisma:seed            # Add test data

# Testing
pnpm test                   # Run tests
pnpm test:watch             # Watch mode
pnpm lint                   # Lint code

# Docker
docker-compose up -d        # Start PostgreSQL
docker-compose down         # Stop PostgreSQL
docker-compose logs         # View logs
```

## 🏗️ Project Structure

```
music-room-backend/
├── src/
│   ├── users/           # User management
│   ├── rooms/           # Room lifecycle
│   ├── livekit/         # Token generation
│   ├── chat/            # Chat messages
│   ├── realtime/        # Socket.IO
│   ├── state/           # State management
│   ├── config/          # Configuration
│   ├── prisma/          # Database
│   └── common/          # Shared utilities
├── docs/                # Documentation
├── prisma/              # Database schema
└── test/                # Tests
```

## 🔐 Security Notes

- **Host secrets** are hashed with bcrypt
- **Never log** secrets or tokens
- **CORS** is configured for web app and extension
- **Rate limiting** is enabled (100 req/min)
- **Input validation** on all endpoints

## 🐛 Troubleshooting

### "Port 3000 already in use"
Change `PORT=3001` in `.env`

### "Cannot connect to database"
Make sure Docker is running: `docker ps`

### "LiveKit token error"
Check your LiveKit credentials in `.env`

### "pnpm: command not found"
Install pnpm: `npm install -g pnpm`

## 📖 API Overview

### REST Endpoints

```
POST   /api/users/guest              Create guest user
POST   /api/rooms                    Create room
GET    /api/rooms/:code              Get room info
POST   /api/rooms/:code/join         Join room
POST   /api/rooms/:code/end          End room
POST   /api/rooms/:code/broadcast/*  Control broadcast
POST   /api/livekit/token            Get LiveKit token
```

### WebSocket Events

**Send:**
- `room:join` - Join a room
- `room:leave` - Leave a room
- `chat:message` - Send message
- `host:heartbeat` - Keep host online

**Receive:**
- `room:state` - Room state updates
- `member:joined` - Someone joined
- `member:left` - Someone left
- `chat:message` - Chat message
- `host:live` - Host started streaming
- `host:stopped` - Host stopped streaming

## ✅ Verify Everything Works

Run these checks:

```bash
# 1. Server starts
pnpm dev
# Should see: "Application is running on: http://localhost:3000"

# 2. Database connected
# Should see: "Database connected successfully"

# 3. API accessible
curl http://localhost:3000/api/rooms/TEST01
# Should return room data (if you seeded)

# 4. Tests pass
pnpm test
# Should see: "Tests passed"
```

## 🎓 Learning Path

**Day 1: Get it running**
1. Follow Quick Start above
2. Create a room via Swagger
3. Test the API endpoints

**Day 2: Understand the code**
1. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
2. Explore the `src/` directory
3. Read the module files

**Day 3: Customize it**
1. Modify a feature
2. Add a test
3. Run the tests

**Day 4: Deploy it**
1. Read [CHECKLIST.md](CHECKLIST.md)
2. Set up production environment
3. Deploy!

## 🤝 Need Help?

1. **Check the docs** in the `docs/` folder
2. **Review the code** - it's well-commented
3. **Check the logs** in your terminal
4. **Verify environment** in `.env`

## 🎉 You're Ready!

The backend is complete and production-ready. Here's what you can do:

✅ Create and manage rooms
✅ Generate LiveKit tokens
✅ Handle real-time chat
✅ Manage room state
✅ Control broadcasts
✅ Scale with Redis (when needed)

**Next Steps:**
1. Run the Quick Start above
2. Test the API in Swagger
3. Read the API documentation
4. Build your frontend!

---

**Questions?** Check [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for a complete overview.

**Ready to deploy?** See [CHECKLIST.md](CHECKLIST.md) for the deployment guide.

Happy coding! 🚀
