import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { generateRoomCode } from '../../common/utils/random-code';

@Injectable()
export class RoomCodeService {
  private readonly logger = new Logger(RoomCodeService.name);
  private readonly MAX_RETRIES = 10;

  constructor(private prisma: PrismaService) {}

  /**
   * Generate a unique room code
   * Retries if there's a collision
   */
  async generateUniqueCode(): Promise<string> {
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      const code = generateRoomCode();

      const existing = await this.prisma.room.findUnique({
        where: { code },
      });

      if (!existing) {
        return code;
      }

      this.logger.warn(`Room code collision: ${code}, retrying...`);
    }

    throw new Error('Failed to generate unique room code after max retries');
  }
}
