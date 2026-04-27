import { useState, useCallback } from 'react'
import { api } from '../lib/api'
import { storage } from '../lib/storage'
import type { StoredUser } from '../types/room'

function randomGuestName(): string {
  return `Guest${Math.floor(1000 + Math.random() * 9000)}`
}

export function useGuestUser() {
  const [user, setUser] = useState<StoredUser | null>(() => storage.getStoredUser())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ensureUser = useCallback(
    async (preferredName?: string): Promise<StoredUser> => {
      const existing = storage.getStoredUser()
      if (existing) {
        setUser(existing)
        return existing
      }

      setLoading(true)
      setError(null)
      try {
        const displayName = preferredName?.trim() || randomGuestName()
        const res = await api.createGuestUser(displayName)
        const stored: StoredUser = { userId: res.userId, displayName: res.displayName }
        storage.saveStoredUser(stored)
        setUser(stored)
        return stored
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to create user'
        setError(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { user, loading, error, ensureUser }
}
