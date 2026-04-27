import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteTrackPublication,
  RemoteParticipant,
  ConnectionState,
} from 'livekit-client'
import { api } from '../lib/api'
import type { LiveKitConnectionState } from '../types/livekit'

interface UseLiveKitListenerOptions {
  roomCode: string
  userId: string
}

export function useLiveKitListener({ roomCode, userId }: UseLiveKitListenerOptions) {
  const [connectionState, setConnectionState] = useState<LiveKitConnectionState>('disconnected')
  const [error, setError] = useState<string | null>(null)
  const roomRef = useRef<Room | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isConnectingRef = useRef(false)

  const setAudioElement = useCallback((el: HTMLAudioElement | null) => {
    audioRef.current = el
  }, [])

  const attachTrack = useCallback((track: RemoteTrack) => {
    if (audioRef.current) {
      track.attach(audioRef.current)
      audioRef.current.play().catch(() => {
        // Autoplay blocked — the user already clicked the button so this is fine
      })
    }
  }, [])

  const connect = useCallback(async () => {
    if (isConnectingRef.current || roomRef.current) return
    isConnectingRef.current = true

    setConnectionState('connecting')
    setError(null)

    try {
      const tokenRes = await api.getLiveKitToken(roomCode, 'listener', userId)

      const room = new Room({ adaptiveStream: true, dynacast: true })
      roomRef.current = room

      room.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, _participant: RemoteParticipant) => {
          if (track.kind === Track.Kind.Audio) {
            attachTrack(track)
            setConnectionState('listening')
          }
        },
      )

      room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
        if (track.kind === Track.Kind.Audio) {
          track.detach()
          setConnectionState('waiting_for_host')
        }
      })

      room.on(RoomEvent.ConnectionStateChanged, (cs: ConnectionState) => {
        if (cs === ConnectionState.Reconnecting) setConnectionState('reconnecting')
        if (cs === ConnectionState.Disconnected) setConnectionState('disconnected')
      })

      room.on(RoomEvent.Disconnected, () => {
        setConnectionState('disconnected')
        roomRef.current = null
        isConnectingRef.current = false
      })

      await room.connect(tokenRes.url, tokenRes.token)

      // Attach any already-published audio tracks (host already live)
      let hasAudio = false
      room.remoteParticipants.forEach((participant: RemoteParticipant) => {
        participant.trackPublications.forEach((pub) => {
          if (pub.kind === Track.Kind.Audio && pub.track) {
            attachTrack(pub.track as RemoteTrack)
            hasAudio = true
          }
        })
      })

      setConnectionState(hasAudio ? 'listening' : 'waiting_for_host')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to audio stream'
      setError(msg)
      setConnectionState('error')
      roomRef.current = null
    } finally {
      isConnectingRef.current = false
    }
  }, [roomCode, userId, attachTrack])

  const disconnect = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect()
      roomRef.current = null
    }
    isConnectingRef.current = false
    setConnectionState('disconnected')
    setError(null)
  }, [])

  useEffect(() => {
    return () => {
      roomRef.current?.disconnect()
    }
  }, [])

  return { state: connectionState, error, connect, disconnect, setAudioElement }
}
