import { g as getActiveTab } from "./chunks/tab-Dafp5T2K.js";
const OFFSCREEN_URL = chrome.runtime.getURL("offscreen.html");
const API_BASE_URL = "http://localhost:3000";
let currentStatus = "idle";
let currentError;
async function ensureOffscreenDocument() {
  const existing = await chrome.offscreen.hasDocument();
  if (!existing) {
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: [chrome.offscreen.Reason.USER_MEDIA],
      justification: "Capture tab audio and publish to LiveKit"
    });
  }
}
async function closeOffscreenDocument() {
  try {
    const exists = await chrome.offscreen.hasDocument();
    if (exists) await chrome.offscreen.closeDocument();
  } catch {
  }
}
chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse) => {
    handleMessage(message, sendResponse);
    return true;
  }
);
async function handleMessage(message, sendResponse) {
  switch (message.type) {
    case "GET_STATUS": {
      sendResponse({
        type: "BROADCAST_STATUS",
        status: currentStatus,
        error: currentError
      });
      break;
    }
    case "START_BROADCAST": {
      try {
        const tab = await getActiveTab();
        const streamId = await getTabCaptureStreamId(tab.tabId);
        await ensureOffscreenDocument();
        const fwd = {
          ...message,
          tabId: tab.tabId,
          tabTitle: tab.title,
          sourceDomain: tab.domain,
          apiBaseUrl: API_BASE_URL,
          streamId
        };
        chrome.runtime.sendMessage(fwd);
        sendResponse({ ok: true });
      } catch (err) {
        const error = err instanceof Error ? err.message : "Failed to start broadcast";
        currentStatus = "error";
        currentError = error;
        relayStatus({ type: "BROADCAST_STATUS", status: "error", error });
        sendResponse({ ok: false, error });
      }
      break;
    }
    case "STOP_BROADCAST": {
      chrome.runtime.sendMessage({ type: "STOP_BROADCAST" }).catch(() => {
      });
      sendResponse({ ok: true });
      break;
    }
    case "BROADCAST_STATUS": {
      currentStatus = message.status;
      currentError = message.error;
      if (message.status === "idle" || message.status === "error") {
        closeOffscreenDocument();
      }
      relayStatus(message);
      sendResponse({ ok: true });
      break;
    }
  }
}
function relayStatus(msg) {
  chrome.runtime.sendMessage(msg).catch(() => {
  });
}
function getTabCaptureStreamId(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, (streamId) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message ?? "tabCapture failed"));
        return;
      }
      if (!streamId) {
        reject(new Error("No stream ID returned from tabCapture"));
        return;
      }
      resolve(streamId);
    });
  });
}
