import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AppConfigService } from '../config/config.service';
import { RoomCodeService } from './services/room-code.service';
import { HostSecretService } from './services/host-secret.service';
import { AppError } from '../common/errors/app-error';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { BroadcastStartingDto } from './dto/broadcast.dto';
import {
  RoomStateStore,
  ROOM_STATE_STORE,
} from '../state/room-state-store.interface';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private configService: AppConfigService,
    private roomCodeService: RoomCodeService,
    private hostSecretService: HostSecretService,
    @Inject(ROOM_STATE_STORE) private roomStateStore: RoomStateStore,
  ) {}

  async createRoom(dto: CreateRoomDto) {
    const roomCode = await this.roomCodeService.generateUniqueCode();
    const hostSecret = this.hostSecretService.generateSecret();
    const hostSecretHash = await this.hostSecretService.hashSecret(hostSecret);

    // Validate host user if provided
    if (dto.hostUserId) {
      await this.usersService.findById(dto.hostUserId);
    }

    const room = await this.prisma.room.create({
      data: {
        code: roomCode,
        name: dto.name,
        hostUserId: dto.hostUserId,
        hostSecretHash,
        status: RoomStatus.idle,
      },
    });

    // Create host member if hostUserId provided
    if (dto.hostUserId) {
      await this.prisma.roomMember.create({
        data: {
          roomId: room.id,
          userId: dto.hostUserId,
          role: 'host',
        },
      });
    }

    // Initialize room state
    await this.roomStateStore.setRoomState(roomCode, {
      roomCode,
      status: 'idle',
      hostUserId: dto.hostUserId,
      hostOnline: false,
      listenerCount: 0,
    });

    const inviteUrl = `${this.configService.webAppUrl}/r/${roomCode}`;

    this.logger.log(`Created room: ${roomCode} (${room.name})`);

    return {
      roomId: room.id,
      roomCode: room.code,
      name: room.name,
      status: room.status,
      inviteUrl,
      hostSecret, // Only returned once
      hostUserId: room.hostUserId,
      createdAt: room.createdAt,
    };
  }

  async getRoomByCode(roomCode: string) {
    const room = await this.prisma.room.findUnique({
      where: { code: roomCode },
    });

    if (!room) {
      throw AppError.roomNotFound(roomCode);
    }

    return room;
  }

  async getRoomMetadata(roomCode: string) {
    const room = await this.getRoomByCode(roomCode);
    const liveState = await this.roomStateStore.getRoomState(roomCode);

    return {
      roomId: room.id,
      roomCode: room.code,
      name: room.name,
      status: room.status,
      listenerCount: liveState?.listenerCount || 0,
      hostOnline: liveState?.hostOnline || false,
      createdAt: room.createdAt,
      sourceTabTitle: liveState?.sourceTabTitle,
      sourceDomain: liveState?.sourceDomain,
    };
  }

  async joinRoom(roomCode: string, dto: JoinRoomDto) {
    const room = await this.getRoomByCode(roomCode);

    if (room.status === RoomStatus.ended) {
      throw AppError.roomEnded();
    }

    let userId = dto.userId;
    let displayName = dto.displayName;

    // Create guest user if no userId provided
    if (!userId) {
      const guestUser = await this.usersService.createGuestUser({
        displayName: dto.displayName,
      });
      userId = guestUser.userId;
      displayName = guestUser.displayName;
    } else {
      // Validate existing user
      const user = await this.usersService.findById(userId);
      displayName = displayName || user.displayName;
    }

    // Create or update room member
    const existingMember = await this.prisma.roomMember.findFirst({
      where: {
        roomId: room.id,
        userId,
        leftAt: null,
      },
    });

    if (!existingMember) {
      await this.prisma.roomMember.create({
        data: {
          roomId: room.id,
          userId,
          role: 'listener',
        },
      });
    }

    this.logger.log(`User ${userId} joined room ${roomCode}`);

    return {
      roomCode: room.code,
      roomId: room.id,
      userId,
      role: 'listener',
      status: room.status,
      displayName: displayName!,
    };
  }

  async endRoom(roomCode: string, hostSecret: string) {
    const room = await this.getRoomByCode(roomCode);

    // Verify host secret
    const isValid = await this.hostSecretService.verifySecret(
      hostSecret,
      room.hostSecretHash,
    );

    if (!isValid) {
      throw AppError.invalidHostSecret();
    }

    // End active session
    await this.prisma.roomSession.updateMany({
      where: {
        roomId: room.id,
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
      },
    });

    // Update room status
    const updatedRoom = await this.prisma.room.update({
      where: { id: room.id },
      data: {
        status: RoomStatus.ended,
        endedAt: new Date(),
      },
    });

    // Update in-memory state
    await this.roomStateStore.patchRoomState(roomCode, {
      status: 'ended',
    });

    this.logger.log(`Room ${roomCode} ended`);

    return {
      roomCode: updatedRoom.code,
      status: updatedRoom.status,
      endedAt: updatedRoom.endedAt,
    };
  }

  async broadcastStarting(roomCode: string, dto: BroadcastStartingDto) {
    const room = await this.getRoomByCode(roomCode);

    // Verify host secret
    const isValid = await this.hostSecretService.verifySecret(
      dto.hostSecret,
      room.hostSecretHash,
    );

    if (!isValid) {
      throw AppError.invalidHostSecret();
    }

    // Create new session — hostUserId is optional (room may have been created without one)
    const session = await this.prisma.roomSession.create({
      data: {
        roomId: room.id,
        hostUserId: room.hostUserId ?? undefined,
        sourceTabTitle: dto.sourceTabTitle,
        sourceDomain: dto.sourceDomain,
      },
    });

    // Update room status
    await this.prisma.room.update({
      where: { id: room.id },
      data: { status: RoomStatus.waiting_for_host },
    });

    // Update in-memory state
    await this.roomStateStore.patchRoomState(roomCode, {
      status: 'waiting_for_host',
      activeSessionId: session.id,
      sourceTabTitle: dto.sourceTabTitle,
      sourceDomain: dto.sourceDomain,
    });

    this.logger.log(`Broadcast starting for room ${roomCode}`);

    return {
      roomCode: room.code,
      status: 'waiting_for_host',
      sessionId: session.id,
    };
  }

  async broadcastLive(roomCode: string, hostSecret: string) {
    const room = await this.getRoomByCode(roomCode);

    // Verify host secret
    const isValid = await this.hostSecretService.verifySecret(
      hostSecret,
      room.hostSecretHash,
    );

    if (!isValid) {
      throw AppError.invalidHostSecret();
    }

    // Update room status
    await this.prisma.room.update({
      where: { id: room.id },
      data: { status: RoomStatus.live },
    });

    // Update in-memory state
    await this.roomStateStore.patchRoomState(roomCode, {
      status: 'live',
      startedAt: new Date().toISOString(),
    });

    this.logger.log(`Broadcast live for room ${roomCode}`);

    return {
      roomCode: room.code,
      status: 'live',
    };
  }

  async broadcastStopped(roomCode: string, hostSecret: string) {
    const room = await this.getRoomByCode(roomCode);

    // Verify host secret
    const isValid = await this.hostSecretService.verifySecret(
      hostSecret,
      room.hostSecretHash,
    );

    if (!isValid) {
      throw AppError.invalidHostSecret();
    }

    // End active session
    await this.prisma.roomSession.updateMany({
      where: {
        roomId: room.id,
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
      },
    });

    // Update room status (back to waiting or idle)
    const newStatus =
      room.status === RoomStatus.ended
        ? RoomStatus.ended
        : RoomStatus.waiting_for_host;

    await this.prisma.room.update({
      where: { id: room.id },
      data: { status: newStatus },
    });

    // Update in-memory state
    await this.roomStateStore.patchRoomState(roomCode, {
      status: newStatus === RoomStatus.ended ? 'ended' : 'waiting_for_host',
      activeSessionId: undefined,
      startedAt: undefined,
    });

    this.logger.log(`Broadcast stopped for room ${roomCode}`);

    return {
      roomCode: room.code,
      status: newStatus,
    };
  }

  async verifyHostSecret(roomCode: string, hostSecret: string): Promise<boolean> {
    const room = await this.getRoomByCode(roomCode);
    return this.hostSecretService.verifySecret(hostSecret, room.hostSecretHash);
  }
}
