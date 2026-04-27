# Music Room API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

Most endpoints don't require authentication in the MVP. Host-specific operations require a `hostSecret` in the request body.

## Error Response Format

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400
  }
}
```

### Error Codes

- `ROOM_NOT_FOUND` - Room does not exist
- `ROOM_ENDED` - Room has ended
- `INVALID_HOST_SECRET` - Invalid or incorrect host secret
- `HOST_SECRET_REQUIRED` - Host secret is required but not provided
- `USER_NOT_FOUND` - User does not exist
- `VALIDATION_ERROR` - Request validation failed
- `LIVEKIT_TOKEN_ERROR` - Failed to generate LiveKit token
- `RATE_LIMITED` - Too many requests
- `INTERNAL_ERROR` - Internal server error

---

## Users API

### Create Guest User

Create a new guest user account.

**Endpoint:** `POST /users/guest`

**Request Body:**

```json
{
  "displayName": "Devesh" // optional
}
```

**Response:** `201 Created`

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "displayName": "Devesh"
}
```

If `displayName` is not provided, a random guest name is generated (e.g., "Happy Listener 42").

---

## Rooms API

### Create Room

Create a new music room.

**Endpoint:** `POST /rooms`

**Request Body:**

```json
{
  "name": "Friday Night Room",
  "hostUserId": "123e4567-e89b-12d3-a456-426614174000" // optional
}
```

**Response:** `201 Created`

```json
{
  "roomId": "123e4567-e89b-12d3-a456-426614174000",
  "roomCode": "ABCD12",
  "name": "Friday Night Room",
  "status": "idle",
  "inviteUrl": "https://app.example.com/r/ABCD12",
  "hostSecret": "secret_abc123...",
  "hostUserId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Important:** The `hostSecret` is only returned once during room creation. Store it securely.

---

### Get Room Metadata

Get public information about a room.

**Endpoint:** `GET /rooms/:roomCode`

**Parameters:**
- `roomCode` - 6-character room code (e.g., "ABCD12")

**Response:** `200 OK`

```json
{
  "roomId": "123e4567-e89b-12d3-a456-426614174000",
  "roomCode": "ABCD12",
  "name": "Friday Night Room",
  "status": "live",
  "listenerCount": 5,
  "hostOnline": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "sourceTabTitle": "YouTube Music",
  "sourceDomain": "music.youtube.com"
}
```

**Room Status Values:**
- `idle` - Room created, no broadcast
- `waiting_for_host` - Host is preparing to broadcast
- `live` - Broadcast is active
- `ended` - Room has ended

---

### Join Room

Join a room as a listener.

**Endpoint:** `POST /rooms/:roomCode/join`

**Parameters:**
- `roomCode` - 6-character room code

**Request Body:**

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000", // optional
  "displayName": "Devesh" // optional
}
```

If `userId` is not provided, a guest user will be created automatically.

**Response:** `200 OK`

```json
{
  "roomCode": "ABCD12",
  "roomId": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "role": "listener",
  "status": "live",
  "displayName": "Devesh"
}
```

---

### End Room

End a room permanently. Requires host secret.

**Endpoint:** `POST /rooms/:roomCode/end`

**Parameters:**
- `roomCode` - 6-character room code

**Request Body:**

```json
{
  "hostSecret": "secret_abc123..."
}
```

**Response:** `200 OK`

```json
{
  "roomCode": "ABCD12",
  "status": "ended",
  "endedAt": "2024-01-01T01:00:00.000Z"
}
```

---

### Broadcast Starting

Called by Chrome extension before publishing audio. Requires host secret.

**Endpoint:** `POST /rooms/:roomCode/broadcast/starting`

**Parameters:**
- `roomCode` - 6-character room code

**Request Body:**

```json
{
  "hostSecret": "secret_abc123...",
  "sourceTabTitle": "YouTube Music", // optional
  "sourceDomain": "music.youtube.com" // optional
}
```

**Response:** `200 OK`

```json
{
  "roomCode": "ABCD12",
  "status": "waiting_for_host",
  "sessionId": "123e4567-e89b-12d3-a456-426614174000"
}
```

This creates a new `RoomSession` and sets room status to `waiting_for_host`.

---

### Broadcast Live

Called by Chrome extension after successfully publishing to LiveKit. Requires host secret.

**Endpoint:** `POST /rooms/:roomCode/broadcast/live`

**Parameters:**
- `roomCode` - 6-character room code

**Request Body:**

```json
{
  "hostSecret": "secret_abc123..."
}
```

**Response:** `200 OK`

```json
{
  "roomCode": "ABCD12",
  "status": "live"
}
```

This sets room status to `live` and emits `host:live` event to all connected clients.

---

### Broadcast Stopped

Called by Chrome extension when host stops publishing. Requires host secret.

**Endpoint:** `POST /rooms/:roomCode/broadcast/stopped`

**Parameters:**
- `roomCode` - 6-character room code

**Request Body:**

```json
{
  "hostSecret": "secret_abc123..."
}
```

**Response:** `200 OK`

```json
{
  "roomCode": "ABCD12",
  "status": "waiting_for_host"
}
```

This ends the active `RoomSession` and sets room status back to `waiting_for_host` (unless room is ended).

---

## LiveKit API

### Generate Token

Generate a LiveKit access token for joining a room.

**Endpoint:** `POST /livekit/token`

**Request Body:**

```json
{
  "roomCode": "ABCD12",
  "role": "listener", // "host" or "listener"
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "hostSecret": "secret_abc123..." // required only for role="host"
}
```

**Response:** `200 OK`

```json
{
  "url": "wss://livekit.example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "roomName": "music_room_ABCD12",
  "identity": "user_123e4567-e89b-12d3-a456-426614174000"
}
```

**Token Permissions:**

**Host:**
- `canPublish: true`
- `canSubscribe: true`
- `canPublishData: true`

**Listener:**
- `canPublish: false`
- `canSubscribe: true`
- `canPublishData: false`

**Token Lifetime:** 2 hours

---

## WebSocket API

Connect to: `ws://localhost:3000` (or your server URL)

### Client → Server Events

#### room:join

Join a room to receive real-time updates.

**Payload:**

```json
{
  "roomCode": "ABCD12",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "displayName": "Devesh"
}
```

After joining, you'll receive:
- Current `room:state`
- Future `member:joined`, `member:left`, `chat:message`, `host:live`, `host:stopped` events

---

#### room:leave

Leave a room.

**Payload:**

```json
{
  "roomCode": "ABCD12",
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

#### chat:message

Send a chat message to the room.

**Payload:**

```json
{
  "roomCode": "ABCD12",
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "displayName": "Devesh",
  "message": "Hello everyone!"
}
```

**Constraints:**
- Maximum message length: 500 characters
- Rate limited per socket

---

#### host:heartbeat

Host heartbeat to maintain online status.

**Payload:**

```json
{
  "roomCode": "ABCD12",
  "hostSecret": "secret_abc123..."
}
```

Send this periodically (e.g., every 30 seconds) to keep `hostOnline` status true.

---

### Server → Client Events

#### room:state

Broadcast to all members when room state changes.

**Payload:**

```json
{
  "roomCode": "ABCD12",
  "status": "live",
  "listenerCount": 5,
  "hostOnline": true,
  "sourceTabTitle": "YouTube Music",
  "sourceDomain": "music.youtube.com"
}
```

**Triggered by:**
- Member joins/leaves
- Host online status changes
- Room status changes

---

#### member:joined

Broadcast when a new member joins the room.

**Payload:**

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "displayName": "Devesh"
}
```

---

#### member:left

Broadcast when a member leaves the room.

**Payload:**

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

#### chat:message

Broadcast chat message to all room members.

**Payload:**

```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "displayName": "Devesh",
  "message": "Hello everyone!",
  "sentAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### host:live

Broadcast when host starts broadcasting.

**Payload:**

```json
{
  "roomCode": "ABCD12",
  "startedAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### host:stopped

Broadcast when host stops broadcasting.

**Payload:**

```json
{
  "roomCode": "ABCD12"
}
```

---

## Rate Limiting

- **Global Rate Limit:** 100 requests per minute per IP
- **Chat Messages:** Additional rate limiting per socket (configured in gateway)

---

## CORS

The API accepts requests from:
- Web app origin (configured via `WEB_APP_URL`)
- Chrome extension origin (configured via `EXTENSION_ORIGIN`)

---

## Example Flows

### Flow 1: Create and Join Room

1. **Host creates room:**
   ```
   POST /api/rooms
   → Returns roomCode and hostSecret
   ```

2. **Host gets LiveKit token:**
   ```
   POST /api/livekit/token
   { role: "host", hostSecret: "..." }
   → Returns LiveKit token
   ```

3. **Listener joins room:**
   ```
   POST /api/rooms/:roomCode/join
   → Returns userId and room info
   ```

4. **Listener gets LiveKit token:**
   ```
   POST /api/livekit/token
   { role: "listener" }
   → Returns LiveKit token
   ```

5. **Both connect to LiveKit and Socket.IO**

---

### Flow 2: Host Broadcasting

1. **Host starts broadcast preparation:**
   ```
   POST /api/rooms/:roomCode/broadcast/starting
   → Room status: waiting_for_host
   ```

2. **Host publishes to LiveKit**

3. **Host confirms live:**
   ```
   POST /api/rooms/:roomCode/broadcast/live
   → Room status: live
   → Emits host:live event
   ```

4. **Listeners receive audio stream**

5. **Host stops broadcasting:**
   ```
   POST /api/rooms/:roomCode/broadcast/stopped
   → Room status: waiting_for_host
   → Emits host:stopped event
   ```

---

### Flow 3: Real-time Updates

1. **Client connects to Socket.IO**

2. **Client joins room:**
   ```
   emit('room:join', { roomCode, userId, displayName })
   ```

3. **Client receives events:**
   - `room:state` - Current state
   - `member:joined` - When others join
   - `member:left` - When others leave
   - `chat:message` - Chat messages
   - `host:live` - Host starts
   - `host:stopped` - Host stops

4. **Client sends chat:**
   ```
   emit('chat:message', { roomCode, userId, displayName, message })
   ```

---

## Development

Swagger documentation available at: `http://localhost:3000/api/docs`
