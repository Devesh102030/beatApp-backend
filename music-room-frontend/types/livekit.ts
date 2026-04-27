export type LiveKitConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'waiting_for_host'
  | 'listening'
  | 'reconnecting'
  | 'error'
