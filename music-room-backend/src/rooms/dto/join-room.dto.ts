import { IsString, IsOptional, MaxLength, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class JoinRoomDto {
  @ApiPropertyOptional({
    description: 'User ID (if not provided, a guest user will be created)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Display name for guest users',
    example: 'Devesh',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;
}
