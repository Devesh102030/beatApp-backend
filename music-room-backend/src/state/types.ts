export type RoomStatus = 'idle' | 'waiting_for_host' | 'live' | 'ended';

export interface LiveRoomState {
  roomCode: string;
  status: RoomStatus;
  hostUserId?: string;
  hostSocketId?: string;
  hostOnline: boolean;
  listenerCount: number;
  activeSessionId?: string;
  sourceTabTitle?: string;
  sourceDomain?: string;
  startedAt?: string;
}

export interface RoomMemberInfo {
  userId: string;
  socketIds: Set<string>;
  displayName?: string;
}
