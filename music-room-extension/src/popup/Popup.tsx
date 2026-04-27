import React, { useState, useEffect, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import { storage } from '../lib/storage'
import { getActiveTab } from '../lib/tab'
import type { BroadcastStatus } from '../types/messages'

// ── Inline styles (no Tailwind in extension popup) ────────────────────────────

const s = {
  root: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: 'rgba(124,58,237,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  },
  title: { fontWeight: 600, fontSize: 15, color: '#fff' },
  tabInfo: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 1.5,
  },
  tabTitle: { color: '#e5e7eb', fontWeight: 500, marginBottom: 2 },
  label: { fontSize: 11, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '8px 10px',
    color: '#fff',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
  },
  inputFocus: { borderColor: 'rgba(124,58,237,0.5)' },
  btnPrimary: {
    width: '100%',
    padding: '10px',
    background: '#7c3aed',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnDanger: {
    width: '100%',
    padding: '10px',
    background: 'rgba(239,68,68,0.15)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8,
    color: '#ef4444',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
  },
  btnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
  },
  dot: { width: 7, height: 7, borderRadius: '50%' },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    color: '#f87171',
    lineHeight: 1.5,
  },
  fieldGroup: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<BroadcastStatus, { label: string; color: string; bg: string; pulse?: boolean }> = {
  idle:       { label: 'Ready to broadcast',    color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  connecting: { label: 'Connecting...',          color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', pulse: true },
  capturing:  { label: 'Capturing tab audio...', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', pulse: true },
  publishing: { label: 'Publishing to LiveKit...', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', pulse: true },
  live:       { label: '🔴 Live',                color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  pulse: true },
  stopping:   { label: 'Stopping...',            color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  error:      { label: 'Error',                  color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

// ── Popup component ───────────────────────────────────────────────────────────

function Popup() {
  const [roomCode, setRoomCode] = useState('')
  const [hostSecret, setHostSecret] = useState('')
  const [status, setStatus] = useState<BroadcastStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [tabTitle, setTabTitle] = useState('')
  const [tabDomain, setTabDomain] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const isLive = status === 'live'
  const isBusy = status === 'connecting' || status === 'capturing' || status === 'publishing' || status === 'stopping'
  const canStart = roomCode.trim().length >= 4 && hostSecret.trim().length >= 10 && !isLive && !isBusy

  // Load saved credentials + active tab info on mount
  useEffect(() => {
    storage.getCredentials().then((creds) => {
      if (creds) {
        setRoomCode(creds.roomCode)
        setHostSecret(creds.hostSecret)
      }
    })

    getActiveTab().then((tab) => {
      setTabTitle(tab.title)
      setTabDomain(tab.domain)
    }).catch(() => {})

    // Get current status from service worker
    chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (res) => {
      if (res?.status) {
        setStatus(res.status)
        setError(res.error ?? null)
      }
    })
  }, [])

  // Listen for status updates from service worker
  useEffect(() => {
    const listener = (message: { type: string; status?: BroadcastStatus; error?: string }) => {
      if (message.type === 'BROADCAST_STATUS' && message.status) {
        setStatus(message.status)
        setError(message.error ?? null)
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  const handleStart = useCallback(async () => {
    if (!canStart) return
    setError(null)

    // Save credentials
    await storage.saveCredentials({ roomCode: roomCode.trim(), hostSecret: hostSecret.trim() })

    // Send to service worker
    chrome.runtime.sendMessage({
      type: 'START_BROADCAST',
      roomCode: roomCode.trim(),
      hostSecret: hostSecret.trim(),
      apiBaseUrl: 'http://localhost:3000',
      tabId: 0, // service worker will fill this in
      tabTitle,
      sourceDomain: tabDomain,
    })
  }, [canStart, roomCode, hostSecret, tabTitle, tabDomain])

  const handleStop = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'STOP_BROADCAST' })
  }, [])

  const cfg = STATUS_CONFIG[status]

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>🎵</div>
        <span style={s.title}>Music Room</span>
      </div>

      {/* Active tab info */}
      <div style={s.tabInfo}>
        <div style={s.tabTitle}>{tabTitle || 'Loading tab...'}</div>
        {tabDomain && <div>{tabDomain}</div>}
      </div>

      {/* Status */}
      <div style={{ ...s.statusRow, background: cfg.bg }}>
        <div
          style={{
            ...s.dot,
            background: cfg.color,
            animation: cfg.pulse ? 'pulse 1.5s infinite' : 'none',
          }}
        />
        <span style={{ color: cfg.color }}>{cfg.label}</span>
      </div>

      {/* Error */}
      {error && <div style={s.error}>{error}</div>}

      {/* Credentials — hide while live */}
      {!isLive && !isBusy && (
        <>
          <div style={s.fieldGroup}>
            <div style={s.label}>Room Code</div>
            <input
              style={{
                ...s.input,
                ...(focusedField === 'code' ? s.inputFocus : {}),
                fontFamily: 'monospace',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onFocus={() => setFocusedField('code')}
              onBlur={() => setFocusedField(null)}
              placeholder="ABCD12"
              maxLength={6}
              spellCheck={false}
            />
          </div>

          <div style={s.fieldGroup}>
            <div style={s.label}>Host Secret</div>
            <input
              style={{
                ...s.input,
                ...(focusedField === 'secret' ? s.inputFocus : {}),
                fontFamily: 'monospace',
                fontSize: 11,
              }}
              type="password"
              value={hostSecret}
              onChange={(e) => setHostSecret(e.target.value)}
              onFocus={() => setFocusedField('secret')}
              onBlur={() => setFocusedField(null)}
              placeholder="secret_..."
              spellCheck={false}
            />
          </div>
        </>
      )}

      {/* Actions */}
      {!isLive ? (
        <button
          style={{ ...s.btnPrimary, ...(!canStart ? s.btnDisabled : {}) }}
          onClick={handleStart}
          disabled={!canStart}
        >
          {isBusy ? (
            <>
              <Spinner />
              {STATUS_CONFIG[status].label}
            </>
          ) : (
            '▶ Start Broadcast'
          )}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' as const }}>
            Broadcasting from <strong style={{ color: '#e5e7eb' }}>{tabDomain || tabTitle}</strong>
          </div>
          <button style={s.btnDanger} onClick={handleStop}>
            ■ Stop Broadcast
          </button>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: 12,
      height: 12,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

// ── Mount ─────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
)

// Add spin keyframe
const styleEl = document.createElement('style')
styleEl.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
document.head.appendChild(styleEl)
