// Client to Server Events
export const CLIENT_EVENTS = {
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  CHAT_MESSAGE: 'chat:message',
  HOST_HEARTBEAT: 'host:heartbeat',
} as const;

// Server to Client Events
export const SERVER_EVENTS = {
  ROOM_STATE: 'room:state',
  MEMBER_JOINED: 'member:joined',
  MEMBER_LEFT: 'member:left',
  CHAT_MESSAGE: 'chat:message',
  HOST_LIVE: 'host:live',
  HOST_STOPPED: 'host:stopped',
} as const;

// Event Payloads
export interface RoomJoinPayload {
  roomCode: string;
  userId: string;
  displayName: string;
}

export interface RoomLeavePayload {
  roomCode: string;
  userId: string;
}

export interface ChatMessagePayload {
  roomCode: string;
  userId: string;
  displayName: string;
  message: string;
}

export interface HostHeartbeatPayload {
  roomCode: string;
  hostSecret: string;
}

export interface RoomStatePayload {
  roomCode: string;
  status: 'idle' | 'waiting_for_host' | 'live' | 'ended';
  listenerCount: number;
  hostOnline: boolean;
  sourceTabTitle?: string;
  sourceDomain?: string;
}

export interface MemberJoinedPayload {
  userId: string;
  displayName: string;
}

export interface MemberLeftPayload {
  userId: string;
}

export interface ChatMessageBroadcastPayload {
  userId: string;
  displayName: string;
  message: string;
  sentAt: string;
}

export interface HostLivePayload {
  roomCode: string;
  startedAt: string;
}

export interface HostStoppedPayload {
  roomCode: string;
}
