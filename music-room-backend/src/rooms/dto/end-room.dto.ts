import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EndRoomDto {
  @ApiProperty({
    description: 'Host secret for authentication',
    example: 'secret_abc123...',
  })
  @IsString()
  @MinLength(10)
  hostSecret: string;
}
