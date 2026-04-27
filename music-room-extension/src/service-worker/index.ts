import type {
  ExtensionMessage,
  BroadcastStatusMessage,
  BroadcastStatus,
  StartBroadcastMessage,
} from '../types/messages'
import { getActiveTab } from '../lib/tab'

// After build, offscreen.html sits at the root of dist/ so the extension URL is just offscreen.html
const OFFSCREEN_URL = chrome.runtime.getURL('offscreen.html')
const API_BASE_URL = 'http://localhost:3000'

let currentStatus: BroadcastStatus = 'idle'
let currentError: string | undefined

// ── Offscreen document management ────────────────────────────────────────────

async function ensureOffscreenDocument(): Promise<void> {
  const existing = await chrome.offscreen.hasDocument()
  if (!existing) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: [chrome.offscreen.Reason.USER_MEDIA],
      justification: 'Capture tab audio and publish to LiveKit',
    })
  }
}

async function closeOffscreenDocument(): Promise<void> {
  try {
    const exists = await chrome.offscreen.hasDocument()
    if (exists) await chrome.offscreen.closeDocument()
  } catch {
    // ignore
  }
}

// ── Message handler ───────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse) => {
    handleMessage(message, sendResponse)
    return true
  },
)

async function handleMessage(
  message: ExtensionMessage,
  sendResponse: (response?: unknown) => void,
) {
  switch (message.type) {
    case 'GET_STATUS': {
      sendResponse({
        type: 'BROADCAST_STATUS',
        status: currentStatus,
        error: currentError,
      } as BroadcastStatusMessage)
      break
    }

    case 'START_BROADCAST': {
      try {
        const tab = await getActiveTab()

        // Get a stream ID from tabCapture — must happen in service worker
        const streamId = await getTabCaptureStreamId(tab.tabId)

        await ensureOffscreenDocument()

        // Forward to offscreen with the stream ID (not the stream itself)
        const fwd: StartBroadcastMessage & { streamId: string } = {
          ...(message as StartBroadcastMessage),
          tabId: tab.tabId,
          tabTitle: tab.title,
          sourceDomain: tab.domain,
          apiBaseUrl: API_BASE_URL,
          streamId,
        }
        chrome.runtime.sendMessage(fwd)

        sendResponse({ ok: true })
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to start broadcast'
        currentStatus = 'error'
        currentError = error
        relayStatus({ type: 'BROADCAST_STATUS', status: 'error', error })
        sendResponse({ ok: false, error })
      }
      break
    }

    case 'STOP_BROADCAST': {
      chrome.runtime.sendMessage({ type: 'STOP_BROADCAST' }).catch(() => {})
      sendResponse({ ok: true })
      break
    }

    case 'BROADCAST_STATUS': {
      // Forwarded from offscreen — update local state
      currentStatus = message.status
      currentError = message.error

      if (message.status === 'idle' || message.status === 'error') {
        closeOffscreenDocument()
      }

      // Relay to popup (if open)
      relayStatus(message)
      sendResponse({ ok: true })
      break
    }
  }
}

function relayStatus(msg: BroadcastStatusMessage): void {
  chrome.runtime.sendMessage(msg).catch(() => {})
}

// ── Tab capture stream ID ─────────────────────────────────────────────────────

function getTabCaptureStreamId(tabId: number): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, (streamId) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message ?? 'tabCapture failed'))
        return
      }
      if (!streamId) {
        reject(new Error('No stream ID returned from tabCapture'))
        return
      }
      resolve(streamId)
    })
  })
}
