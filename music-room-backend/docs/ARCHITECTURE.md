# Architecture Documentation

## Overview

The Music Room backend is built with a modular, production-ready architecture using NestJS. It supports real-time audio streaming via LiveKit and real-time communication via Socket.IO.

## System Architecture

```
┌─────────────────┐         ┌──────────────────┐
│  Web App        │         │ Chrome Extension │
│  (Listeners)    │         │  (Host)          │
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │ HTTP/WebSocket            │ HTTP/WebSocket
         │                           │
         └───────────┬───────────────┘
                     │
         ┌───────────▼────────────┐
         │   NestJS Backend       │
         │  ┌──────────────────┐  │
         │  │  REST API        │  │
         │  │  Socket.IO       │  │
         │  │  State Manager   │  │
         │  └──────────────────┘  │
         └───────────┬────────────┘
                     │
         ┌───────────┼────────────┐
         │           │            │
    ┌────▼────┐ ┌───▼────┐  ┌───▼─────┐
    │PostgreSQL│ │LiveKit │  │ Redis   │
    │         │ │ Server │  │(Future) │
    └─────────┘ └────────┘  └─────────┘
```

## Module Structure

### Core Modules

#### 1. Config Module (`src/config/`)

**Purpose**: Centralized configuration management

**Components**:
- `config.service.ts`: Typed configuration access
- `config.module.ts`: Module definition
- `env.validation.ts`: Environment variable validation using Zod

**Responsibilities**:
- Load and validate environment variables
- Provide typed configuration to other modules
- Fail fast on missing/invalid configuration

#### 2. Prisma Module (`src/prisma/`)

**Purpose**: Database connection and ORM

**Components**:
- `prisma.service.ts`: Prisma client wrapper
- `prisma.module.ts`: Global module definition

**Responsibilities**:
- Manage database connections
- Provide Prisma client to other modules
- Handle connection lifecycle

#### 3. State Module (`src/state/`)

**Purpose**: Live room state management

**Components**:
- `room-state-store.interface.ts`: Abstract interface
- `in-memory-room-state.store.ts`: In-memory implementation
- `types.ts`: State type definitions
- `state.module.ts`: Module definition

**Design Pattern**: Strategy Pattern

**Why**: Allows swapping in-memory implementation with Redis without changing business logic.

**State Structure**:
```typescript
interface LiveRoomState {
  roomCode: string;
  status: 'idle' | 'waiting_for_host' | 'live' | 'ended';
  hostUserId?: string;
  hostSocketId?: string;
  hostOnline: boolean;
  listenerCount: number;
  activeSessionId?: string;
  sourceTabTitle?: string;
  sourceDomain?: string;
  startedAt?: string;
}
```

### Feature Modules

#### 4. Users Module (`src/users/`)

**Purpose**: User management

**Endpoints**:
- `POST /users/guest`: Create guest user

**Components**:
- `users.controller.ts`: HTTP endpoints
- `users.service.ts`: Business logic
- `dto/`: Data transfer objects

**Features**:
- Guest user creation
- Random display name generation
- Auth-ready structure

#### 5. Rooms Module (`src/rooms/`)

**Purpose**: Room lifecycle management

**Endpoints**:
- `POST /rooms`: Create room
- `GET /rooms/:roomCode`: Get metadata
- `POST /rooms/:roomCode/join`: Join room
- `POST /rooms/:roomCode/end`: End room
- `POST /rooms/:roomCode/broadcast/*`: Broadcast control

**Components**:
- `rooms.controller.ts`: HTTP endpoints
- `rooms.service.ts`: Business logic
- `services/room-code.service.ts`: Room code generation
- `services/host-secret.service.ts`: Host secret management
- `dto/`: Data transfer objects

**Key Features**:
- Unique room code generation
- Host secret hashing and verification
- Room status transitions
- Integration with state store

**Room Status Flow**:
```
idle → waiting_for_host → live → waiting_for_host
  ↓                                      ↓
ended ←──────────────────────────────── ended
```

#### 6. LiveKit Module (`src/livekit/`)

**Purpose**: LiveKit token generation

**Endpoints**:
- `POST /livekit/token`: Generate access token

**Components**:
- `livekit.controller.ts`: HTTP endpoints
- `livekit.service.ts`: Token generation logic
- `dto/`: Data transfer objects

**Token Permissions**:

**Host**:
```typescript
{
  roomJoin: true,
  canPublish: true,
  canSubscribe: true,
  canPublishData: true
}
```

**Listener**:
```typescript
{
  roomJoin: true,
  canPublish: false,
  canSubscribe: true,
  canPublishData: false
}
```

#### 7. Chat Module (`src/chat/`)

**Purpose**: Chat message persistence

**Components**:
- `chat.service.ts`: Message storage
- `dto/`: Data transfer objects

**Features**:
- Store messages in PostgreSQL
- 500 character limit
- Query recent messages

#### 8. Realtime Module (`src/realtime/`)

**Purpose**: WebSocket communication

**Components**:
- `realtime.gateway.ts`: Socket.IO gateway
- `realtime.service.ts`: Real-time business logic
- `events.ts`: Event definitions

**Client → Server Events**:
- `room:join`: Join room
- `room:leave`: Leave room
- `chat:message`: Send message
- `host:heartbeat`: Host keepalive

**Server → Client Events**:
- `room:state`: State updates
- `member:joined`: Member joined
- `member:left`: Member left
- `chat:message`: Message broadcast
- `host:live`: Host started
- `host:stopped`: Host stopped

### Common Module (`src/common/`)

**Purpose**: Shared utilities and infrastructure

**Components**:
- `errors/`: Error handling
  - `app-error.ts`: Custom error class
  - `error-codes.ts`: Error code enum
- `filters/`: Exception filters
  - `exception.filter.ts`: Global error handler
- `utils/`: Utility functions
  - `crypto.ts`: Cryptographic utilities
  - `random-code.ts`: Room code generation

## Data Flow

### Creating and Joining a Room

```
1. Host creates room
   POST /rooms
   ↓
   RoomsService.createRoom()
   ↓
   - Generate room code
   - Generate host secret
   - Hash host secret
   - Create room in DB
   - Initialize state store
   ↓
   Return: roomCode, hostSecret

2. Listener joins room
   POST /rooms/:roomCode/join
   ↓
   RoomsService.joinRoom()
   ↓
   - Validate room exists
   - Create/get user
   - Create room member
   ↓
   Return: userId, role

3. Both get LiveKit tokens
   POST /livekit/token
   ↓
   LiveKitService.generateToken()
   ↓
   - Validate room
   - Verify host secret (if host)
   - Generate token with permissions
   ↓
   Return: token, url, roomName

4. Both connect to Socket.IO
   emit('room:join')
   ↓
   RealtimeGateway.handleRoomJoin()
   ↓
   - Join socket room
   - Add to state store
   - Broadcast member:joined
   - Emit room:state
```

### Broadcasting Flow

```
1. Host starts broadcast
   POST /rooms/:roomCode/broadcast/starting
   ↓
   - Verify host secret
   - Create RoomSession
   - Update status: waiting_for_host
   - Emit room:state

2. Host publishes to LiveKit
   (Client-side WebRTC)

3. Host confirms live
   POST /rooms/:roomCode/broadcast/live
   ↓
   - Verify host secret
   - Update status: live
   - Emit host:live
   - Emit room:state

4. Listeners receive audio
   (LiveKit WebRTC)

5. Host stops
   POST /rooms/:roomCode/broadcast/stopped
   ↓
   - Verify host secret
   - End RoomSession
   - Update status: waiting_for_host
   - Emit host:stopped
   - Emit room:state
```

## Database Schema

### Entity Relationships

```
User
  ├─ hostedRooms (1:N) → Room
  ├─ roomMembers (1:N) → RoomMember
  ├─ roomSessions (1:N) → RoomSession
  └─ chatMessages (1:N) → ChatMessage

Room
  ├─ host (N:1) → User
  ├─ members (1:N) → RoomMember
  ├─ sessions (1:N) → RoomSession
  └─ chatMessages (1:N) → ChatMessage

RoomMember
  ├─ room (N:1) → Room
  └─ user (N:1) → User

RoomSession
  ├─ room (N:1) → Room
  └─ host (N:1) → User

ChatMessage
  ├─ room (N:1) → Room
  └─ user (N:1) → User
```

### Key Indexes

- `Room.code`: Unique index for fast lookups
- `Room.status`: Index for filtering active rooms
- `RoomMember.roomId + leftAt`: Index for active members
- `RoomSession.roomId + endedAt`: Index for active sessions
- `ChatMessage.roomId + createdAt`: Index for recent messages

## Security Architecture

### Authentication

**MVP**: No full authentication system

**Host Authentication**: Host secret (bcrypt hashed)

**Future**: JWT-based authentication

### Authorization

**Room Operations**:
- Public: Get metadata, join room
- Host-only: End room, broadcast control

**LiveKit Tokens**:
- Host: Requires valid host secret
- Listener: No special requirements

### Security Measures

1. **Input Validation**: class-validator on all DTOs
2. **Rate Limiting**: 100 req/min per IP
3. **CORS**: Whitelist web app and extension origins
4. **Helmet**: Security headers
5. **Secret Hashing**: bcrypt with salt rounds
6. **Timing-Safe Comparison**: Prevent timing attacks
7. **No Secret Logging**: Secrets never logged

## State Management Strategy

### Current: In-Memory

**Pros**:
- Simple
- Fast
- No external dependencies

**Cons**:
- Lost on restart
- Single instance only
- No persistence

### Future: Redis

**Migration Path**:
1. Implement `RedisRoomStateStore` class
2. Implement `RoomStateStore` interface
3. Update module provider
4. No business logic changes needed

**Redis Structure**:
```
room:{roomCode}:state → JSON
room:{roomCode}:members → Hash
room:{roomCode}:host → String
```

## Scalability Considerations

### Current Limitations

- Single instance (in-memory state)
- No horizontal scaling
- WebSocket sticky sessions required

### Scaling Strategy

**Phase 1: Redis State Store**
- Shared state across instances
- Enable horizontal scaling
- Maintain WebSocket sticky sessions

**Phase 2: Redis Pub/Sub**
- Cross-instance event broadcasting
- Remove sticky session requirement

**Phase 3: Microservices**
- Separate API and WebSocket services
- Independent scaling
- Message queue for async tasks

## Monitoring and Observability

### Logging

**Structured Logging**:
- Room creation/join/end
- Broadcast state changes
- Token generation (metadata only)
- Socket connections/disconnections
- Errors with context

**Never Log**:
- Host secrets
- LiveKit tokens
- User passwords (future)

### Metrics (Future)

- Active rooms count
- Active users count
- WebSocket connections
- API response times
- Database query times
- Error rates

### Health Checks (Future)

- Database connectivity
- LiveKit API reachability
- Memory usage
- CPU usage

## Testing Strategy

### Unit Tests

- Utility functions (crypto, room codes)
- Service business logic
- State store operations

### Integration Tests

- API endpoints
- Database operations
- Token generation

### E2E Tests (Future)

- Complete user flows
- WebSocket communication
- Multi-user scenarios

## Performance Considerations

### Database

- Indexes on frequently queried fields
- Connection pooling via Prisma
- Efficient queries (avoid N+1)

### WebSocket

- Room-based broadcasting (not global)
- Efficient state updates
- Disconnect cleanup

### State Store

- In-memory: O(1) operations
- Redis: Sub-millisecond latency

## Error Handling

### Error Flow

```
Error occurs
  ↓
AppError thrown
  ↓
GlobalExceptionFilter catches
  ↓
Structured error response
  ↓
Client receives consistent format
```

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "statusCode": 400
  }
}
```

## Future Enhancements

### Short Term

- [ ] Redis state store
- [ ] Full authentication
- [ ] Room permissions
- [ ] Moderation features

### Medium Term

- [ ] Recording functionality
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Room expiration

### Long Term

- [ ] Microservices architecture
- [ ] Multi-region support
- [ ] CDN integration
- [ ] Mobile app support
