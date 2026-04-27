import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export function JoinRoomForm() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    navigate(`/r/${trimmed}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter room code"
        maxLength={6}
        className="flex-1 bg-surface-2 border border-white/10 text-white placeholder-gray-600
          px-4 py-3 rounded-xl font-mono tracking-widest text-center text-lg uppercase
          focus:outline-none focus:border-accent/50 transition-colors"
      />
      <button
        type="submit"
        disabled={code.trim().length < 4}
        className="px-5 py-3 bg-surface-2 hover:bg-surface-3 disabled:opacity-40
          disabled:cursor-not-allowed text-white rounded-xl border border-white/10
          transition-colors font-medium"
      >
        Join
      </button>
    </form>
  )
}
