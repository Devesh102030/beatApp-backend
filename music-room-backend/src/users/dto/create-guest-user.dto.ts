import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGuestUserDto {
  @ApiPropertyOptional({
    description: 'Display name for the guest user',
    example: 'Devesh',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;
}
