import { useEffect, useRef, useCallback, useState } from 'react'
import { getSocket } from '../lib/socket'
import type { Socket } from 'socket.io-client'
import type {
  RoomStatePayload,
  ChatMessage,
  MemberJoinedPayload,
  MemberLeftPayload,
  HostLivePayload,
  HostStoppedPayload,
} from '../types/socket'
import type { RoomState } from '../types/room'

interface UseSocketRoomOptions {
  roomCode: string
  userId: string
  displayName: string
  enabled: boolean
}

export function useSocketRoom({
  roomCode,
  userId,
  displayName,
  enabled,
}: UseSocketRoomOptions) {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [members, setMembers] = useState<MemberJoinedPayload[]>([])

  const sendMessage = useCallback(
    (message: string) => {
      if (!socketRef.current?.connected || !message.trim()) return
      socketRef.current.emit('chat:message', {
        roomCode,
        userId,
        displayName,
        message: message.trim(),
      })
    },
    [roomCode, userId, displayName],
  )

  useEffect(() => {
    if (!enabled || !roomCode || !userId) return

    const socket = getSocket()
    socketRef.current = socket

    socket.connect()

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('room:join', { roomCode, userId, displayName })
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('room:state', (payload: RoomStatePayload) => {
      setRoomState({
        status: payload.status,
        listenerCount: payload.listenerCount,
        hostOnline: payload.hostOnline,
        sourceTabTitle: payload.sourceTabTitle,
        sourceDomain: payload.sourceDomain,
      })
    })

    socket.on('member:joined', (payload: MemberJoinedPayload) => {
      setMembers((prev) => {
        if (prev.find((m) => m.userId === payload.userId)) return prev
        return [...prev, payload]
      })
    })

    socket.on('member:left', (payload: MemberLeftPayload) => {
      setMembers((prev) => prev.filter((m) => m.userId !== payload.userId))
    })

    socket.on('chat:message', (payload: Omit<ChatMessage, 'id'>) => {
      setMessages((prev) => [
        ...prev,
        { ...payload, id: `${Date.now()}-${Math.random()}` },
      ])
    })

    socket.on('host:live', (_payload: HostLivePayload) => {
      setRoomState((prev) =>
        prev ? { ...prev, status: 'live', hostOnline: true } : prev,
      )
    })

    socket.on('host:stopped', (_payload: HostStoppedPayload) => {
      setRoomState((prev) =>
        prev ? { ...prev, status: 'waiting_for_host' } : prev,
      )
    })

    return () => {
      socket.emit('room:leave', { roomCode, userId })
      socket.off('connect')
      socket.off('disconnect')
      socket.off('room:state')
      socket.off('member:joined')
      socket.off('member:left')
      socket.off('chat:message')
      socket.off('host:live')
      socket.off('host:stopped')
      socket.disconnect()
    }
  }, [enabled, roomCode, userId, displayName])

  return { connected, roomState, messages, members, sendMessage }
}
