import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';
import { ChatService } from '../chat/chat.service';
import { RoomsService } from '../rooms/rooms.service';
import { AppConfigService } from '../config/config.service';
import {
  CLIENT_EVENTS,
  RoomJoinPayload,
  RoomLeavePayload,
  ChatMessagePayload,
  HostHeartbeatPayload,
} from './events';

@WebSocketGateway({
  cors: {
    origin: true, // Configured properly in afterInit
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(
    private realtimeService: RealtimeService,
    private chatService: ChatService,
    private roomsService: RoomsService,
    private configService: AppConfigService,
  ) {}

  afterInit(server: Server) {
    this.realtimeService.setServer(server);
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    const origin = client.handshake.headers.origin;
    const allowedOrigins = [
      this.configService.webAppUrl,
      this.configService.extensionOrigin,
    ];

    if (origin && !allowedOrigins.includes(origin)) {
      this.logger.warn(`Rejected WebSocket connection from origin: ${origin}`);
      client.disconnect(true);
      return;
    }

    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.realtimeService.handleDisconnect(client);
  }

  @SubscribeMessage(CLIENT_EVENTS.ROOM_JOIN)
  async handleRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RoomJoinPayload,
  ) {
    await this.realtimeService.handleJoinRoom(
      client,
      payload.roomCode,
      payload.userId,
      payload.displayName,
    );
  }

  @SubscribeMessage(CLIENT_EVENTS.ROOM_LEAVE)
  async handleRoomLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: RoomLeavePayload,
  ) {
    await this.realtimeService.handleLeaveRoom(
      client,
      payload.roomCode,
      payload.userId,
    );
  }

  @SubscribeMessage(CLIENT_EVENTS.CHAT_MESSAGE)
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ChatMessagePayload,
  ) {
    try {
      if (!payload.message || payload.message.length > 500) {
        client.emit('error', { message: 'Message too long or empty' });
        return;
      }

      // Validate room exists and get its ID
      const room = await this.roomsService.getRoomByCode(payload.roomCode);

      // Persist to DB
      const saved = await this.chatService.createMessage({
        roomId: room.id,
        userId: payload.userId,
        displayName: payload.displayName,
        message: payload.message,
      });

      // Broadcast to room
      this.realtimeService.emitChatMessage(payload.roomCode, {
        userId: payload.userId,
        displayName: payload.displayName,
        message: payload.message,
        sentAt: saved.createdAt.toISOString(),
      });
    } catch (error) {
      this.logger.error('Error handling chat message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage(CLIENT_EVENTS.HOST_HEARTBEAT)
  async handleHostHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: HostHeartbeatPayload,
  ) {
    await this.realtimeService.handleHostHeartbeat(
      client,
      payload.roomCode,
      payload.hostSecret,
    );
  }
}
