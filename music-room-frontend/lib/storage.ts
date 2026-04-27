import type { StoredUser } from '../types/room'

const USER_KEY = 'mr_user'
const HOST_SECRET_PREFIX = 'mr_host_secret_'

export const storage = {
  getStoredUser(): StoredUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? (JSON.parse(raw) as StoredUser) : null
    } catch {
      return null
    }
  },

  saveStoredUser(user: StoredUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  clearStoredUser(): void {
    localStorage.removeItem(USER_KEY)
  },

  getHostSecret(roomCode: string): string | null {
    return localStorage.getItem(`${HOST_SECRET_PREFIX}${roomCode}`)
  },

  saveHostSecret(roomCode: string, secret: string): void {
    localStorage.setItem(`${HOST_SECRET_PREFIX}${roomCode}`, secret)
  },

  clearHostSecret(roomCode: string): void {
    localStorage.removeItem(`${HOST_SECRET_PREFIX}${roomCode}`)
  },
}
