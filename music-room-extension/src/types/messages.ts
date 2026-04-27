export type BroadcastStatus =
  | 'idle'
  | 'connecting'
  | 'capturing'
  | 'publishing'
  | 'live'
  | 'stopping'
  | 'error'

// ── Messages sent TO service worker / offscreen ──────────────────────────────

export interface StartBroadcastMessage {
  type: 'START_BROADCAST'
  roomCode: string
  hostSecret: string
  apiBaseUrl: string
  tabId: number
  tabTitle?: string
  sourceDomain?: string
  /** Filled in by service worker before forwarding to offscreen */
  streamId?: string
}

export interface StopBroadcastMessage {
  type: 'STOP_BROADCAST'
}

export interface GetStatusMessage {
  type: 'GET_STATUS'
}

// ── Messages sent FROM offscreen / service worker ────────────────────────────

export interface BroadcastStatusMessage {
  type: 'BROADCAST_STATUS'
  status: BroadcastStatus
  error?: string
}

export type ExtensionMessage =
  | StartBroadcastMessage
  | StopBroadcastMessage
  | GetStatusMessage
  | BroadcastStatusMessage
