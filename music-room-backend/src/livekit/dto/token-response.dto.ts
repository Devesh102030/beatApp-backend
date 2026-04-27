import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    description: 'LiveKit server URL',
    example: 'wss://livekit.example.com',
  })
  url: string;

  @ApiProperty({
    description: 'Access token for LiveKit',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'LiveKit room name',
    example: 'music_room_ABCD12',
  })
  roomName: string;

  @ApiProperty({
    description: 'Participant identity',
    example: 'user_123e4567-e89b-12d3-a456-426614174000',
  })
  identity: string;
}
