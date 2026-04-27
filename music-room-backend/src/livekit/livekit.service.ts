import { Injectable, Logger } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { AppConfigService } from '../config/config.service';
import { RoomsService } from '../rooms/rooms.service';
import { AppError } from '../common/errors/app-error';
import { TokenRequestDto, TokenRole } from './dto/token-request.dto';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class LiveKitService {
  private readonly logger = new Logger(LiveKitService.name);

  constructor(
    private configService: AppConfigService,
    private roomsService: RoomsService,
  ) {}

  async generateToken(dto: TokenRequestDto) {
    // Validate room exists and is not ended
    const room = await this.roomsService.getRoomByCode(dto.roomCode);

    if (room.status === RoomStatus.ended) {
      throw AppError.roomEnded();
    }

    // Validate host secret if role is host
    if (dto.role === TokenRole.HOST) {
      if (!dto.hostSecret) {
        throw AppError.hostSecretRequired();
      }

      const isValid = await this.roomsService.verifyHostSecret(
        dto.roomCode,
        dto.hostSecret,
      );

      if (!isValid) {
        throw AppError.invalidHostSecret();
      }
    }

    // Generate LiveKit room name and identity
    const livekitRoomName = `music_room_${dto.roomCode}`;
    const identity =
      dto.role === TokenRole.HOST
        ? `host_${dto.roomCode}_${dto.userId}`
        : `user_${dto.userId}`;

    // Create access token
    const at = new AccessToken(
      this.configService.livekitApiKey,
      this.configService.livekitApiSecret,
      {
        identity,
        ttl: '2h', // Token valid for 2 hours
      },
    );

    // Set permissions based on role
    if (dto.role === TokenRole.HOST) {
      at.addGrant({
        roomJoin: true,
        room: livekitRoomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      });
    } else {
      at.addGrant({
        roomJoin: true,
        room: livekitRoomName,
        canPublish: false,
        canSubscribe: true,
        canPublishData: false,
      });
    }

    const token = await at.toJwt();

    this.logger.log(
      `Generated ${dto.role} token for room ${dto.roomCode}, user ${dto.userId}`,
    );

    return {
      url: this.configService.livekitUrl,
      token,
      roomName: livekitRoomName,
      identity,
    };
  }
}
