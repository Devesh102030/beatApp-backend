export type RoomStatus = 'idle' | 'waiting_for_host' | 'live' | 'ended'
export type RoomRole = 'host' | 'listener' | 'moderator'
export type LiveKitRole = 'host' | 'listener'

export interface GuestUserResponse {
  userId: string
  displayName: string
}

export interface CreateRoomResponse {
  roomId: string
  roomCode: string
  name: string
  status: RoomStatus
  inviteUrl: string
  hostSecret: string
  hostUserId?: string | null
  createdAt: string
}

export interface RoomMetadata {
  roomId: string
  roomCode: string
  name: string
  status: RoomStatus
  listenerCount: number
  hostOnline: boolean
  createdAt: string
  sourceTabTitle?: string
  sourceDomain?: string
}

export interface JoinRoomResponse {
  roomCode: string
  roomId: string
  userId: string
  role: RoomRole
  status: RoomStatus
  displayName: string
}

export interface LiveKitTokenResponse {
  url: string
  token: string
  roomName: string
  identity: string
}

export interface ApiError {
  error: {
    code: string
    message: string
    statusCode: number
  }
}
