import { useState } from 'react'
import { CopyButton } from './CopyButton'

interface HostPanelProps {
  roomCode: string
  hostSecret: string
}

export function HostPanel({ roomCode, hostSecret }: HostPanelProps) {
  const [secretVisible, setSecretVisible] = useState(false)

  return (
    <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-accent/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-accent-light">Host Panel</h2>
      </div>

      {/* Room code */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Room Code</p>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xl font-bold text-white tracking-widest">{roomCode}</span>
          <CopyButton text={roomCode} label="Copy" />
        </div>
      </div>

      {/* Host secret */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Host Secret</p>
        <div className="flex items-center gap-2 flex-wrap">
          <code className="font-mono text-xs text-gray-300 bg-surface-3 px-2 py-1 rounded max-w-xs truncate">
            {secretVisible ? hostSecret : '••••••••••••••••••••••••'}
          </code>
          <button
            onClick={() => setSecretVisible((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {secretVisible ? 'Hide' : 'Show'}
          </button>
          <CopyButton text={hostSecret} label="Copy" />
        </div>
        <p className="text-xs text-warning/80 flex items-center gap-1 mt-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Host secret is only shown once. Keep it private.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-surface-2 rounded-lg p-3 space-y-1.5">
        <p className="text-xs font-medium text-gray-300">How to broadcast</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Open Spotify Web Player or YouTube Music in another Chrome tab, then use the
          Chrome extension to broadcast this room using the room code and host secret above.
        </p>
      </div>
    </div>
  )
}
