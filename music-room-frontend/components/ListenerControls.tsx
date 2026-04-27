import { useRef, useEffect } from 'react'
import type { LiveKitConnectionState } from '../types/livekit'
import type { RoomStatus } from '../types/api'

interface ListenerControlsProps {
  connectionState: LiveKitConnectionState
  roomStatus: RoomStatus
  error: string | null
  onConnect: () => void
  onDisconnect: () => void
  setAudioElement: (el: HTMLAudioElement | null) => void
}

const STATE_CONFIG: Record<LiveKitConnectionState, { label: string; color: string; icon: string }> = {
  disconnected: { label: 'Not listening', color: 'text-gray-500', icon: '🎵' },
  connecting: { label: 'Connecting...', color: 'text-warning', icon: '⏳' },
  waiting_for_host: { label: 'Waiting for host to broadcast', color: 'text-warning', icon: '⏸️' },
  listening: { label: 'Listening live', color: 'text-success', icon: '🎧' },
  reconnecting: { label: 'Reconnecting...', color: 'text-warning', icon: '🔄' },
  error: { label: 'Connection error', color: 'text-danger', icon: '⚠️' },
}

export function ListenerControls({
  connectionState,
  roomStatus,
  error,
  onConnect,
  onDisconnect,
  setAudioElement,
}: ListenerControlsProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    setAudioElement(audioRef.current)
    return () => setAudioElement(null)
  }, [setAudioElement])

  const config = STATE_CONFIG[connectionState]
  const isConnected = connectionState !== 'disconnected' && connectionState !== 'error'
  const isConnecting = connectionState === 'connecting'
  const isRoomEnded = roomStatus === 'ended'

  return (
    <div className="bg-surface-1 border border-white/5 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center text-sm">
          🎧
        </div>
        <h2 className="text-sm font-semibold text-gray-300">Audio Stream</h2>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <span className="text-base">{config.icon}</span>
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        {connectionState === 'listening' && (
          <span className="flex gap-0.5 items-end h-4 ml-1">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-0.5 bg-success rounded-full animate-pulse"
                style={{
                  height: `${40 + i * 15}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Room ended notice */}
      {isRoomEnded && (
        <p className="text-xs text-gray-500 bg-surface-3 px-3 py-2 rounded-lg">
          This room has ended.
        </p>
      )}

      {/* Source info */}
      {connectionState === 'waiting_for_host' && (
        <p className="text-xs text-gray-500">
          The host hasn't started broadcasting yet. You'll hear audio automatically when they go live.
        </p>
      )}

      {/* Controls */}
      {!isRoomEnded && (
        <div className="flex gap-2">
          {!isConnected ? (
            <button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent
                hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-medium rounded-lg transition-colors text-sm"
            >
              {isConnecting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Listening
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onDisconnect}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-3
                hover:bg-surface-3/80 text-gray-300 font-medium rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Listening
            </button>
          )}
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} autoPlay playsInline className="hidden" />
    </div>
  )
}
