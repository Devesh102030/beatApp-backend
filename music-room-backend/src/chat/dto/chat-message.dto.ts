import { IsString, MaxLength, IsUUID } from 'class-validator';

export class CreateChatMessageDto {
  @IsUUID()
  roomId: string;

  @IsUUID()
  userId: string;

  @IsString()
  @MaxLength(50)
  displayName: string;

  @IsString()
  @MaxLength(500)
  message: string;
}

export class ChatMessageResponseDto {
  id: string;
  roomId: string;
  userId: string;
  displayName: string;
  message: string;
  createdAt: Date;
}
