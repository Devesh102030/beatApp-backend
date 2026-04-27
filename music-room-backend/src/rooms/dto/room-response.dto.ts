import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  roomId: string;

  @ApiProperty({ example: 'ABCD12' })
  roomCode: string;

  @ApiProperty({ example: 'Friday Night Room' })
  name: string;

  @ApiProperty({ example: 'idle' })
  status: string;

  @ApiProperty({ example: 'https://app.example.com/r/ABCD12' })
  inviteUrl: string;

  @ApiProperty({ example: 'secret_abc123...' })
  hostSecret: string;

  @ApiPropertyOptional({ nullable: true })
  hostUserId?: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class RoomMetadataResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  roomId: string;

  @ApiProperty({ example: 'ABCD12' })
  roomCode: string;

  @ApiProperty({ example: 'Friday Night Room' })
  name: string;

  @ApiProperty({ example: 'live' })
  status: string;

  @ApiProperty({ example: 5 })
  listenerCount: number;

  @ApiProperty({ example: true })
  hostOnline: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  sourceTabTitle?: string;

  @ApiPropertyOptional()
  sourceDomain?: string;
}

export class JoinRoomResponseDto {
  @ApiProperty({ example: 'ABCD12' })
  roomCode: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  roomId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: 'listener' })
  role: string;

  @ApiProperty({ example: 'live' })
  status: string;

  @ApiProperty({ example: 'Devesh' })
  displayName: string;
}
