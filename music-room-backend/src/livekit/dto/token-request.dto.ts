import {
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TokenRole {
  HOST = 'host',
  LISTENER = 'listener',
}

export class TokenRequestDto {
  @ApiProperty({
    description: 'Room code',
    example: 'ABCD12',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(10)
  roomCode: string;

  @ApiProperty({
    description: 'Role in the room',
    enum: TokenRole,
    example: TokenRole.LISTENER,
  })
  @IsEnum(TokenRole)
  role: TokenRole;

  @ApiProperty({
    description: 'User ID — UUID for listeners, any stable string for hosts',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  userId: string;

  @ApiPropertyOptional({
    description: 'Host secret (required only for host role)',
    example: 'secret_abc123...',
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  hostSecret?: string;
}
