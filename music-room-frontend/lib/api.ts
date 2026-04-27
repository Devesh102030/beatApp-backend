import type {
  GuestUserResponse,
  CreateRoomResponse,
  RoomMetadata,
  JoinRoomResponse,
  LiveKitTokenResponse,
  LiveKitRole,
} from '../types/api'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    const message = data?.error?.message ?? `Request failed: ${res.status}`
    const err = new Error(message) as Error & { code?: string; statusCode?: number }
    err.code = data?.error?.code
    err.statusCode = data?.error?.statusCode ?? res.status
    throw err
  }

  return data as T
}

export const api = {
  createGuestUser(displayName: string): Promise<GuestUserResponse> {
    return request('/users/guest', {
      method: 'POST',
      body: JSON.stringify({ displayName }),
    })
  },

  createRoom(name: string, hostUserId?: string): Promise<CreateRoomResponse> {
    return request('/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, ...(hostUserId ? { hostUserId } : {}) }),
    })
  },

  getRoom(roomCode: string): Promise<RoomMetadata> {
    return request(`/rooms/${roomCode}`)
  },

  joinRoom(
    roomCode: string,
    userId: string,
    displayName: string,
  ): Promise<JoinRoomResponse> {
    return request(`/rooms/${roomCode}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId, displayName }),
    })
  },

  getLiveKitToken(
    roomCode: string,
    role: LiveKitRole,
    userId: string,
    hostSecret?: string,
  ): Promise<LiveKitTokenResponse> {
    return request('/livekit/token', {
      method: 'POST',
      body: JSON.stringify({
        roomCode,
        role,
        userId,
        ...(hostSecret ? { hostSecret } : {}),
      }),
    })
  },
}
