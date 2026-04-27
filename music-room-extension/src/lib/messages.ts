import type { ExtensionMessage, BroadcastStatusMessage } from '../types/messages'

/**
 * Send a message to the extension service worker
 */
export function sendToServiceWorker(message: ExtensionMessage): Promise<unknown> {
  return chrome.runtime.sendMessage(message)
}

/**
 * Send a status update from offscreen → service worker → popup
 */
export function sendStatusUpdate(status: BroadcastStatusMessage): void {
  chrome.runtime.sendMessage(status).catch(() => {
    // Popup may be closed — ignore
  })
}

/**
 * Send a message to the offscreen document
 */
export async function sendToOffscreen(message: ExtensionMessage): Promise<void> {
  await chrome.runtime.sendMessage(message)
}
