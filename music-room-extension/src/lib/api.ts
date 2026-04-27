export interface LiveKitTokenResponse {
  url: string
  token: string
  roomName: string
  identity: string
}

export interface BroadcastStartingRequest {
  hostSecret: string
  sourceTabTitle?: string
  sourceDomain?: string
}

// ── Request helper ────────────────────────────────────────────────────────────

async function request<T>(
  baseUrl: string,
  path: string,
  options?: RequestInit,
  label?: string, // endpoint label for logging (no secrets)
): Promise<T> {
  const url = `${baseUrl}/api${path}`

  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch (networkErr) {
    const msg = `Network error calling ${label ?? path}: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`
    console.error('[MusicRoom]', msg)
    throw new Error(msg)
  }

  // Try to parse JSON regardless of status so we can read the error body
  let data: unknown
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    // Surface the backend's structured error message when available
    const backendMsg =
      (data as { error?: { message?: string } } | null)?.error?.message
    const backendCode =
      (data as { error?: { code?: string } } | null)?.error?.code

    const message = backendMsg
      ? `${backendMsg}${backendCode ? ` (${backendCode})` : ''}`
      : `${label ?? path} failed with status ${res.status}`

    console.error(`[MusicRoom] ${label ?? path} →`, res.status, backendCode ?? '')
    // Never log the full request body (may contain hostSecret)

    const err = new Error(message) as Error & { code?: string; statusCode?: number }
    err.code = backendCode
    err.statusCode = res.status
    throw err
  }

  return data as T
}

// ── API client ────────────────────────────────────────────────────────────────

export const api = {
  getLiveKitToken(
    baseUrl: string,
    roomCode: string,
    userId: string,
    hostSecret: string,
  ): Promise<LiveKitTokenResponse> {
    return request(
      baseUrl,
      '/livekit/token',
      {
        method: 'POST',
        body: JSON.stringify({ roomCode, role: 'host', userId, hostSecret }),
      },
      'livekit/token',
    )
  },

  broadcastStarting(
    baseUrl: string,
    roomCode: string,
    body: BroadcastStartingRequest,
  ): Promise<void> {
    return request(
      baseUrl,
      `/rooms/${roomCode}/broadcast/starting`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      `rooms/${roomCode}/broadcast/starting`,
    )
  },

  broadcastLive(baseUrl: string, roomCode: string, hostSecret: string): Promise<void> {
    return request(
      baseUrl,
      `/rooms/${roomCode}/broadcast/live`,
      {
        method: 'POST',
        body: JSON.stringify({ hostSecret }),
      },
      `rooms/${roomCode}/broadcast/live`,
    )
  },

  broadcastStopped(baseUrl: string, roomCode: string, hostSecret: string): Promise<void> {
    return request(
      baseUrl,
      `/rooms/${roomCode}/broadcast/stopped`,
      {
        method: 'POST',
        body: JSON.stringify({ hostSecret }),
      },
      `rooms/${roomCode}/broadcast/stopped`,
    )
  },
}
