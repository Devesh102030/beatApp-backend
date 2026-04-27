import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { storage } from '../lib/storage'
import { CopyButton } from '../components/CopyButton'

type Step = 'form' | 'secret' | 'loading'

export function CreateRoomPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('form')
  const [roomName, setRoomName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Shown after creation
  const [createdRoomCode, setCreatedRoomCode] = useState('')
  const [createdHostSecret, setCreatedHostSecret] = useState('')

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    const name = roomName.trim()
    if (!name) return

    setStep('loading')
    setError(null)

    try {
      // Ensure we have a user
      let user = storage.getStoredUser()
      if (!user) {
        const guestName = displayName.trim() || `Guest${Math.floor(1000 + Math.random() * 9000)}`
        const res = await api.createGuestUser(guestName)
        user = { userId: res.userId, displayName: res.displayName }
        storage.saveStoredUser(user)
      }

      // Create room
      const room = await api.createRoom(name, user.userId)

      // Persist host secret
      storage.saveHostSecret(room.roomCode, room.hostSecret)

      setCreatedRoomCode(room.roomCode)
      setCreatedHostSecret(room.hostSecret)
      setStep('secret')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room')
      setStep('form')
    }
  }

  const handleContinue = () => {
    navigate(`/r/${createdRoomCode}`)
  }

  if (step === 'secret') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          {/* Success header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/20 mb-2">
              <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Room Created!</h1>
            <p className="text-gray-400 text-sm">Save your host secret before continuing.</p>
          </div>

          {/* Room code */}
          <div className="bg-surface-1 border border-white/5 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Room Code</p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-3xl font-bold text-white tracking-widest">
                {createdRoomCode}
              </span>
              <CopyButton text={createdRoomCode} />
            </div>
          </div>

          {/* Host secret — warning */}
          <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-warning mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-warning">Save this host secret now</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  This is the only time it will be shown. It's already saved in your browser,
                  but copy it somewhere safe in case you clear your storage.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Host Secret</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-xs text-gray-300 bg-surface-3 px-3 py-2 rounded-lg break-all">
                  {createdHostSecret}
                </code>
                <CopyButton text={createdHostSecret} />
              </div>
            </div>
          </div>

          {/* Continue */}
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3.5 bg-accent hover:bg-accent-hover text-white
              font-semibold rounded-xl transition-colors"
          >
            Enter Room →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Create a Room</h1>
          <p className="text-gray-400 text-sm">Give your room a name and start streaming.</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Room name */}
          <div className="space-y-1.5">
            <label className="text-sm text-gray-400">Room name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Friday Night Vibes"
              maxLength={100}
              required
              autoFocus
              className="w-full bg-surface-2 border border-white/10 text-white placeholder-gray-600
                px-4 py-3 rounded-xl focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Display name (only if no user stored) */}
          {!storage.getStoredUser() && (
            <div className="space-y-1.5">
              <label className="text-sm text-gray-400">Your name <span className="text-gray-600">(optional)</span></label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Leave blank for a random name"
                maxLength={50}
                className="w-full bg-surface-2 border border-white/10 text-white placeholder-gray-600
                  px-4 py-3 rounded-xl focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-danger bg-danger/10 px-4 py-3 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={step === 'loading' || !roomName.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-accent
              hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-semibold rounded-xl transition-colors"
          >
            {step === 'loading' ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Create Room'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
