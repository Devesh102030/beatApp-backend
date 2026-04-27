import { CopyButton } from './CopyButton'
import { StatusBadge } from './StatusBadge'
import type { RoomMetadata } from '../types/api'
import type { RoomState } from '../types/room'

interface RoomHeaderProps {
  room: RoomMetadata
  liveState: RoomState | null
}

export function RoomHeader({ room, liveState }: RoomHeaderProps) {
  const status = liveState?.status ?? room.status
  const listenerCount = liveState?.listenerCount ?? room.listenerCount
  const hostOnline = liveState?.hostOnline ?? room.hostOnline
  const inviteUrl = `${window.location.origin}/r/${room.roomCode}`

  return (
    <div className="bg-surface-1 border-b border-white/5 px-4 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Left: name + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold text-white truncate">{room.name}</h1>
            <StatusBadge status={status} />
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span className="font-mono tracking-widest text-gray-400">{room.roomCode}</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {listenerCount} listening
            </span>
            <span className={`flex items-center gap-1 ${hostOnline ? 'text-success' : 'text-gray-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hostOnline ? 'bg-success' : 'bg-gray-600'}`} />
              Host {hostOnline ? 'online' : 'offline'}
            </span>
          </div>
        </div>

        {/* Right: invite */}
        <div className="flex items-center gap-2 shrink-0">
          <CopyButton text={inviteUrl} label="Copy invite link" />
        </div>
      </div>
    </div>
  )
}
