export interface StoredCredentials {
  roomCode: string
  hostSecret: string
}

const CREDS_KEY = 'mr_host_creds'

export const storage = {
  async getCredentials(): Promise<StoredCredentials | null> {
    const result = await chrome.storage.local.get(CREDS_KEY)
    return (result[CREDS_KEY] as StoredCredentials) ?? null
  },

  async saveCredentials(creds: StoredCredentials): Promise<void> {
    await chrome.storage.local.set({ [CREDS_KEY]: creds })
  },

  async clearCredentials(): Promise<void> {
    await chrome.storage.local.remove(CREDS_KEY)
  },
}
