import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import type { RoomMetadata } from '../types/api'

export function useRoom(roomCode: string) {
  const [room, setRoom] = useState<RoomMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoom = useCallback(async () => {
    if (!roomCode) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.getRoom(roomCode)
      setRoom(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load room'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [roomCode])

  useEffect(() => {
    fetchRoom()
  }, [fetchRoom])

  return { room, loading, error, refetch: fetchRoom }
}
