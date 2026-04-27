import { Injectable, Logger, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  RoomStateStore,
  ROOM_STATE_STORE,
} from '../state/room-state-store.interface';
import { RoomsService } from '../rooms/rooms.service';
import {
  SERVER_EVENTS,
  RoomStatePayload,
  MemberJoinedPayload,
  MemberLeftPayload,
  ChatMessageBroadcastPayload,
  HostLivePayload,
  HostStoppedPayload,
} from './events';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server: Server;

  constructor(
    @Inject(ROOM_STATE_STORE) private roomStateStore: RoomStateStore,
    private roomsService: RoomsService,
  ) {}

  setServer(server: Server) {
    this.server = server;
  }

  async handleJoinRoom(
    socket: Socket,
    roomCode: string,
    userId: string,
    displayName: string,
  ) {
    try {
      // Validate room exists
      await this.roomsService.getRoomByCode(roomCode);

      // Join socket room
      socket.join(roomCode);

      // Add member to state
      await this.roomStateStore.addMember(
        roomCode,
        userId,
        socket.id,
        displayName,
      );

      this.logger.log(
        `Socket ${socket.id} joined room ${roomCode} as ${displayName}`,
      );

      // Broadcast member joined
      socket.to(roomCode).emit(SERVER_EVENTS.MEMBER_JOINED, {
        userId,
        displayName,
      } as MemberJoinedPayload);

      // Send current room state to all
      await this.emitRoomState(roomCode);
    } catch (error) {
      this.logger.error(`Error joining room ${roomCode}:`, error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  async handleLeaveRoom(socket: Socket, roomCode: string, userId: string) {
    try {
      socket.leave(roomCode);

      await this.roomStateStore.removeMember(roomCode, userId, socket.id);

      this.logger.log(`Socket ${socket.id} left room ${roomCode}`);

      // Broadcast member left
      socket.to(roomCode).emit(SERVER_EVENTS.MEMBER_LEFT, {
        userId,
      } as MemberLeftPayload);

      // Send updated room state
      await this.emitRoomState(roomCode);
    } catch (error) {
      this.logger.error(`Error leaving room ${roomCode}:`, error);
    }
  }

  async handleDisconnect(socket: Socket) {
    // Find all rooms this socket was in and clean up
    const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);

    for (const roomCode of rooms) {
      try {
        const members = await this.roomStateStore.getRoomMembers(roomCode);

        // Find userId for this socket
        for (const [userId, socketIds] of members.entries()) {
          if (socketIds.has(socket.id)) {
            await this.roomStateStore.removeMember(
              roomCode,
              userId,
              socket.id,
            );

            socket.to(roomCode).emit(SERVER_EVENTS.MEMBER_LEFT, {
              userId,
            } as MemberLeftPayload);

            await this.emitRoomState(roomCode);
            break;
          }
        }
      } catch (error) {
        this.logger.error(
          `Error handling disconnect for room ${roomCode}:`,
          error,
        );
      }
    }

    this.logger.log(`Socket ${socket.id} disconnected`);
  }

  async handleHostHeartbeat(
    socket: Socket,
    roomCode: string,
    hostSecret: string,
  ) {
    try {
      const isValid = await this.roomsService.verifyHostSecret(
        roomCode,
        hostSecret,
      );

      if (!isValid) {
        socket.emit('error', { message: 'Invalid host secret' });
        return;
      }

      await this.roomStateStore.setHostOnline(roomCode, true, socket.id);
      await this.emitRoomState(roomCode);
    } catch (error) {
      this.logger.error(`Error handling host heartbeat:`, error);
    }
  }

  async emitRoomState(roomCode: string) {
    try {
      const state = await this.roomStateStore.getRoomState(roomCode);

      if (!state) {
        return;
      }

      const payload: RoomStatePayload = {
        roomCode: state.roomCode,
        status: state.status,
        listenerCount: state.listenerCount,
        hostOnline: state.hostOnline,
        sourceTabTitle: state.sourceTabTitle,
        sourceDomain: state.sourceDomain,
      };

      this.server.to(roomCode).emit(SERVER_EVENTS.ROOM_STATE, payload);
    } catch (error) {
      this.logger.error(`Error emitting room state for ${roomCode}:`, error);
    }
  }

  emitHostLive(roomCode: string, startedAt: string) {
    const payload: HostLivePayload = {
      roomCode,
      startedAt,
    };

    this.server.to(roomCode).emit(SERVER_EVENTS.HOST_LIVE, payload);
    this.logger.log(`Emitted host:live for room ${roomCode}`);
  }

  emitHostStopped(roomCode: string) {
    const payload: HostStoppedPayload = {
      roomCode,
    };

    this.server.to(roomCode).emit(SERVER_EVENTS.HOST_STOPPED, payload);
    this.logger.log(`Emitted host:stopped for room ${roomCode}`);
  }

  emitChatMessage(roomCode: string, message: ChatMessageBroadcastPayload) {
    this.server.to(roomCode).emit(SERVER_EVENTS.CHAT_MESSAGE, message);
  }
}
