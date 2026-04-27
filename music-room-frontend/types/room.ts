import type { RoomStatus } from './api'

export interface StoredUser {
  userId: string
  displayName: string
}

export interface RoomState {
  status: RoomStatus
  listenerCount: number
  hostOnline: boolean
  sourceTabTitle?: string
  sourceDomain?: string
}
