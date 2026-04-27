import type { RoomStatus } from './api'

export interface RoomStatePayload {
  roomCode: string
  status: RoomStatus
  listenerCount: number
  hostOnline: boolean
  sourceTabTitle?: string
  sourceDomain?: string
}

export interface MemberJoinedPayload {
  userId: string
  displayName: string
}

export interface MemberLeftPayload {
  userId: string
}

export interface ChatMessagePayload {
  userId: string
  displayName: string
  message: string
  sentAt: string
}

export interface HostLivePayload {
  roomCode: string
  startedAt: string
}

export interface HostStoppedPayload {
  roomCode: string
}

export interface ChatMessage extends ChatMessagePayload {
  id: string // local id for React key
}
