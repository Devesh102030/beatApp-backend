import { useState, useRef, useEffect, FormEvent } from 'react'
import type { ChatMessage } from '../types/socket'

interface ChatPanelProps {
  messages: ChatMessage[]
  currentUserId: string
  onSend: (message: string) => void
  disabled?: boolean
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function ChatPanel({ messages, currentUserId, onSend, disabled }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || trimmed.length > 500) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-surface-1 rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="text-sm font-medium text-gray-300">Chat</span>
        <span className="ml-auto text-xs text-gray-600">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <p className="text-center text-gray-600 text-xs py-8">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.userId === currentUserId
            return (
              <div key={msg.id} className={`flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2">
                  {!isOwn && (
                    <span className="text-xs font-medium text-accent-light">{msg.displayName}</span>
                  )}
                  <span className="text-xs text-gray-600">{formatTime(msg.sentAt)}</span>
                </div>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-words
                    ${isOwn
                      ? 'bg-accent text-white rounded-br-sm'
                      : 'bg-surface-3 text-gray-200 rounded-bl-sm'
                    }`}
                >
                  {msg.message}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-3 py-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? 'Join room to chat...' : 'Say something...'}
            disabled={disabled}
            maxLength={500}
            className="flex-1 bg-surface-3 text-white placeholder-gray-600 text-sm px-3 py-2 rounded-lg
              border border-white/5 focus:outline-none focus:border-accent/50 disabled:opacity-40
              transition-colors"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim() || input.length > 500}
            className="px-3 py-2 bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed
              text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        {input.length > 450 && (
          <p className={`text-xs mt-1 ${input.length > 500 ? 'text-danger' : 'text-warning'}`}>
            {500 - input.length} characters remaining
          </p>
        )}
      </form>
    </div>
  )
}
