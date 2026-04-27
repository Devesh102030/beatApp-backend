import { api } from '../lib/api'
import { LiveKitPublisher } from '../lib/livekitPublisher'
import type {
  StartBroadcastMessage,
  BroadcastStatusMessage,
  BroadcastStatus,
} from '../types/messages'

// Extended message type that includes the stream ID from service worker
interface StartBroadcastWithStreamId extends StartBroadcastMessage {
  streamId: string
}

// ── State ─────────────────────────────────────────────────────────────────────

let publisher: LiveKitPublisher | null = null
let audioContext: AudioContext | null = null
let capturedStream: MediaStream | null = null
let currentRoomCode = ''
let currentHostSecret = ''
let currentApiBase = ''
let isStopping = false

// ── Status helper ─────────────────────────────────────────────────────────────

function sendStatus(status: BroadcastStatus, error?: string): void {
  const msg: BroadcastStatusMessage = { type: 'BROADCAST_STATUS', status, error }
  chrome.runtime.sendMessage(msg).catch(() => {})
}

// ── Message listener ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'START_BROADCAST') {
    handleStart(message as StartBroadcastWithStreamId)
      .then(() => sendResponse({ ok: true }))
      .catch((err) => sendResponse({ ok: false, error: String(err) }))
    return true
  }

  if (message.type === 'STOP_BROADCAST') {
    handleStop()
      .then(() => sendResponse({ ok: true }))
      .catch(() => sendResponse({ ok: false }))
    return true
  }
})

// ── Start broadcast ───────────────────────────────────────────────────────────

async function handleStart(msg: StartBroadcastWithStreamId): Promise<void> {
  if (publisher?.isConnected) return

  isStopping = false
  currentRoomCode = msg.roomCode
  currentHostSecret = msg.hostSecret
  currentApiBase = msg.apiBaseUrl

  try {
    // 1. Notify backend: broadcast starting
    sendStatus('connecting')
    await api.broadcastStarting(currentApiBase, currentRoomCode, {
      hostSecret: currentHostSecret,
      sourceTabTitle: msg.tabTitle,
      sourceDomain: msg.sourceDomain,
    })

    // 2. Capture tab audio using the stream ID from service worker
    sendStatus('capturing')
    const stream = await captureTabAudioFromStreamId(msg.streamId)
    capturedStream = stream

    // 3. Route audio back to host speakers
    preserveLocalPlayback(stream)

    // 4. Validate audio track
    const audioTracks = stream.getAudioTracks()
    if (audioTracks.length === 0) {
      throw new Error(
        'No audio detected. Start playing music in this tab and try again.',
      )
    }
    const audioTrack = audioTracks[0]

    // 5. Get LiveKit host token
    sendStatus('publishing')
    const hostUserId = `host_${currentRoomCode}`
    const tokenRes = await api.getLiveKitToken(
      currentApiBase,
      currentRoomCode,
      hostUserId,
      currentHostSecret,
    )

    // 6. Connect to LiveKit and publish
    publisher = new LiveKitPublisher()
    await publisher.connect({
      url: tokenRes.url,
      token: tokenRes.token,
      audioTrack,
      onDisconnected: () => {
        if (!isStopping) {
          sendStatus('error', 'LiveKit disconnected unexpectedly')
          cleanup()
        }
      },
    })

    // 7. Notify backend: broadcast live
    await api.broadcastLive(currentApiBase, currentRoomCode, currentHostSecret)

    sendStatus('live')
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Broadcast failed'
    sendStatus('error', error)
    await cleanup()
  }
}

// ── Stop broadcast ────────────────────────────────────────────────────────────

async function handleStop(): Promise<void> {
  if (isStopping) return
  isStopping = true

  sendStatus('stopping')

  try {
    await cleanup()
    if (currentRoomCode && currentHostSecret) {
      await api.broadcastStopped(currentApiBase, currentRoomCode, currentHostSecret)
    }
  } catch {
    // Best-effort
  }

  sendStatus('idle')
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

async function cleanup(): Promise<void> {
  if (publisher) {
    await publisher.disconnect().catch(() => {})
    publisher = null
  }

  if (capturedStream) {
    capturedStream.getTracks().forEach((t) => t.stop())
    capturedStream = null
  }

  if (audioContext) {
    await audioContext.close().catch(() => {})
    audioContext = null
  }
}

// ── Tab capture via stream ID ─────────────────────────────────────────────────
// The service worker calls chrome.tabCapture.getMediaStreamId() and passes
// the ID here. We then use getUserMedia with chromeMediaSource: 'tab'.

async function captureTabAudioFromStreamId(streamId: string): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      // @ts-expect-error — Chrome-specific constraint
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId,
      },
    },
    video: false,
  })

  // Drop any video tracks just in case
  stream.getVideoTracks().forEach((t) => {
    t.stop()
    stream.removeTrack(t)
  })

  return stream
}

// ── Preserve local playback ───────────────────────────────────────────────────

function preserveLocalPlayback(stream: MediaStream): void {
  try {
    audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(stream)
    source.connect(audioContext.destination)
  } catch {
    // Non-fatal
  }
}
