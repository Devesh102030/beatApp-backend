import {
  Room,
  RoomEvent,
  LocalAudioTrack,
  createLocalAudioTrack,
  Track,
} from 'livekit-client'

export interface PublisherOptions {
  url: string
  token: string
  audioTrack: MediaStreamTrack
  onDisconnected?: () => void
}

export class LiveKitPublisher {
  private room: Room | null = null
  private localTrack: LocalAudioTrack | null = null

  async connect(options: PublisherOptions): Promise<void> {
    const room = new Room({
      adaptiveStream: false,
      dynacast: false,
    })

    room.on(RoomEvent.Disconnected, () => {
      options.onDisconnected?.()
    })

    await room.connect(options.url, options.token)

    // Wrap the captured MediaStreamTrack in a LiveKit LocalAudioTrack
    const localTrack = new LocalAudioTrack(options.audioTrack, undefined, false)
    this.localTrack = localTrack

    await room.localParticipant.publishTrack(localTrack, {
      name: 'host-tab-audio',
      source: Track.Source.Microphone, // closest semantic match for tab audio
    })

    this.room = room
  }

  async disconnect(): Promise<void> {
    if (this.localTrack) {
      await this.room?.localParticipant.unpublishTrack(this.localTrack)
      this.localTrack.stop()
      this.localTrack = null
    }

    if (this.room) {
      await this.room.disconnect()
      this.room = null
    }
  }

  get isConnected(): boolean {
    return this.room?.state === 'connected'
  }
}
