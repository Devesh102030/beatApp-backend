import { IsString, MinLength, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BroadcastStartingDto {
  @ApiProperty({
    description: 'Host secret for authentication',
    example: 'secret_abc123...',
  })
  @IsString()
  @MinLength(10)
  hostSecret: string;

  @ApiPropertyOptional({
    description: 'Title of the source tab',
    example: 'YouTube Music',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sourceTabTitle?: string;

  @ApiPropertyOptional({
    description: 'Domain of the source',
    example: 'music.youtube.com',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sourceDomain?: string;
}

export class BroadcastLiveDto {
  @ApiProperty({
    description: 'Host secret for authentication',
    example: 'secret_abc123...',
  })
  @IsString()
  @MinLength(10)
  hostSecret: string;
}

export class BroadcastStoppedDto {
  @ApiProperty({
    description: 'Host secret for authentication',
    example: 'secret_abc123...',
  })
  @IsString()
  @MinLength(10)
  hostSecret: string;
}
