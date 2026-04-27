import { useNavigate } from 'react-router-dom'
import { JoinRoomForm } from '../components/JoinRoomForm'

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
      {/* Logo / Hero */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-2">
          <svg className="w-8 h-8 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Music Room
        </h1>
        <p className="text-gray-400 text-lg max-w-sm mx-auto leading-relaxed">
          Stream music from your browser to anyone, anywhere — in real time.
        </p>
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-4">
        {/* Create */}
        <button
          onClick={() => navigate('/create')}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent
            hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors text-base"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create a Room
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-gray-600 uppercase tracking-wider">or join</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Join */}
        <JoinRoomForm />
      </div>

      {/* Footer */}
      <p className="mt-16 text-xs text-gray-700">
        Low-latency audio streaming powered by LiveKit
      </p>
    </div>
  )
}
