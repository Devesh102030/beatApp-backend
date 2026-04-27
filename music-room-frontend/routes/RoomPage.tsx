import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { storage } from '../lib/storage'
import { useRoom } from '../hooks/useRoom'
import { useSocketRoom } from '../hooks/useSocketRoom'
import { useLiveKitListener } from '../hooks/useLiveKitListener'
import { RoomHeader } from '../components/RoomHeader'
import { HostPanel } from '../components/HostPanel'
import { ChatPanel } from '../components/ChatPanel'
import { ListenerControls } from '../components/ListenerControls'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import type { StoredUser } from '../types/room'

type JoinStep = 'loading' | 'ask_name' | 'joining' | 'joined' | 'error'

export function RoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const code = roomCode ?? ''

  const { room, loading: roomLoading, error: roomError, refetch } = useRoom(code)

  const [joinStep, setJoinStep] = useState<JoinStep>('loading')
  const [joinError, setJoinError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null)
  const [nameInput, setNameInput] = useState('')

  const hostSecret = storage.getHostSecret(code)

  // Socket
  const { connected, roomState, messages, sendMessage } = useSocketRoom({
    roomCode: code,
    userId: currentUser?.userId ?? '',
    displayName: currentUser?.displayName ?? '',
    enabled: joinStep === 'joined',
  })

  // LiveKit
  const { state: lkState, error: lkError, connect: lkConnect, disconnect: lkDisconnect, setAudioElement } =
    useLiveKitListener({ roomCode: code, userId: currentUser?.userId ?? '' })

  // Auto-join flow
  useEffect(() => {
    if (!code) return

    const doJoin = async (user: StoredUser) => {
      setJoinStep('joining')
      try {
        await api.joinRoom(code, user.userId, user.displayName)
        setCurrentUser(user)
        setJoinStep('joined')
      } catch (err) {
        setJoinError(err instanceof Error ? err.message : 'Failed to join room')
        setJoinStep('error')
      }
    }

    const existing = storage.getStoredUser()
    if (existing) {
      doJoin(existing)
    } else {
      setJoinStep('ask_name')
    }
  }, [code])

  const handleJoinWithName = async () => {
    setJoinStep('joining')
    setJoinError(null)
    try {
      const guestName = nameInput.trim() || `Guest${Math.floor(1000 + Math.random() * 9000)}`
      const res = await api.createGuestUser(guestName)
      const user: StoredUser = { userId: res.userId, displayName: res.displayName }
      storage.saveStoredUser(user)
      await api.joinRoom(code, user.userId, user.displayName)
      setCurrentUser(user)
      setJoinStep('joined')
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Failed to join')
      setJoinStep('ask_name')
    }
  }

  // ── Loading / error states ──────────────────────────────────────────────────

  if (roomLoading || joinStep === 'loading') {
    return (
      <div className="min-h-screen bg-surface">
        <LoadingState message="Loading room..." />
      </div>
    )
  }

  if (roomError || !room) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="max-w-md mx-auto pt-20 px-4">
          <ErrorState
            message={roomError ?? 'Room not found'}
            onRetry={refetch}
          />
          <div className="text-center mt-4">
            <Link to="/" className="text-sm text-accent-light hover:underline">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Ask for name ────────────────────────────────────────────────────────────

  if (joinStep === 'ask_name') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-white">Join {room.name}</h2>
            <p className="text-gray-400 text-sm">Enter a display name to join the room.</p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinWithName()}
              placeholder="Your name (optional)"
              maxLength={50}
              autoFocus
              className="w-full bg-surface-2 border border-white/10 text-white placeholder-gray-600
                px-4 py-3 rounded-xl focus:outline-none focus:border-accent/50 transition-colors"
            />

            {joinError && (
              <p className="text-sm text-danger bg-danger/10 px-4 py-2 rounded-lg">{joinError}</p>
            )}

            <button
              onClick={handleJoinWithName}
              className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-white
                font-semibold rounded-xl transition-colors"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (joinStep === 'joining') {
    return (
      <div className="min-h-screen bg-surface">
        <LoadingState message="Joining room..." />
      </div>
    )
  }

  if (joinStep === 'error') {
    return (
      <div className="min-h-screen bg-surface">
        <ErrorState message={joinError ?? 'Failed to join room'} />
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-accent-light hover:underline">← Back to home</Link>
        </div>
      </div>
    )
  }

  // ── Main room UI ────────────────────────────────────────────────────────────

  const effectiveStatus = roomState?.status ?? room.status

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <RoomHeader room={room} liveState={roomState} />

      {/* Socket status */}
      {!connected && joinStep === 'joined' && (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 text-center">
          <p className="text-xs text-warning">Connecting to real-time server...</p>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Host panel */}
          {hostSecret && (
            <HostPanel roomCode={code} hostSecret={hostSecret} />
          )}

          {/* Listener controls */}
          {currentUser && (
            <ListenerControls
              connectionState={lkState}
              roomStatus={effectiveStatus}
              error={lkError}
              onConnect={lkConnect}
              onDisconnect={lkDisconnect}
              setAudioElement={setAudioElement}
            />
          )}

          {/* Room ended notice */}
          {effectiveStatus === 'ended' && (
            <div className="bg-surface-1 border border-white/5 rounded-xl p-6 text-center space-y-3">
              <p className="text-2xl">🎵</p>
              <p className="text-gray-300 font-medium">This room has ended</p>
              <p className="text-gray-500 text-sm">Thanks for listening!</p>
              <Link
                to="/"
                className="inline-block mt-2 px-4 py-2 bg-accent hover:bg-accent-hover
                  text-white text-sm rounded-lg transition-colors"
              >
                Find another room
              </Link>
            </div>
          )}
        </div>

        {/* Right column — chat */}
        <div className="lg:col-span-1 h-[500px] lg:h-auto lg:min-h-[500px]">
          <ChatPanel
            messages={messages}
            currentUserId={currentUser?.userId ?? ''}
            onSend={sendMessage}
            disabled={!connected}
          />
        </div>
      </div>
    </div>
  )
}
