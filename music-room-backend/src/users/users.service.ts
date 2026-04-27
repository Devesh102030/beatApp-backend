import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuestUserDto } from './dto/create-guest-user.dto';
import { AppError } from '../common/errors/app-error';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async createGuestUser(dto: CreateGuestUserDto) {
    const displayName = dto.displayName || this.generateGuestName();

    const user = await this.prisma.user.create({
      data: {
        displayName,
      },
    });

    this.logger.log(`Created guest user: ${user.id} (${displayName})`);

    return {
      userId: user.id,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  }

  async findById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.userNotFound(userId);
    }

    return user;
  }

  async findByIdOrNull(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  private generateGuestName(): string {
    const adjectives = [
      'Happy',
      'Cool',
      'Funky',
      'Groovy',
      'Chill',
      'Vibing',
      'Dancing',
      'Jamming',
    ];
    const nouns = [
      'Listener',
      'Fan',
      'Music Lover',
      'Dancer',
      'Viber',
      'Guest',
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);

    return `${adjective} ${noun} ${number}`;
  }
}
