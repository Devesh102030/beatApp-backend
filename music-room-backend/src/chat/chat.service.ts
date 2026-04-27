import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatMessageDto } from './dto/chat-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private prisma: PrismaService) {}

  async createMessage(dto: CreateChatMessageDto) {
    const message = await this.prisma.chatMessage.create({
      data: {
        roomId: dto.roomId,
        userId: dto.userId,
        displayName: dto.displayName,
        message: dto.message,
      },
    });

    this.logger.debug(
      `Chat message created in room ${dto.roomId} by ${dto.displayName}`,
    );

    return message;
  }

  async getRecentMessages(roomId: string, limit = 50) {
    return this.prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
