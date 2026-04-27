import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { EndRoomDto } from './dto/end-room.dto';
import {
  BroadcastStartingDto,
  BroadcastLiveDto,
  BroadcastStoppedDto,
} from './dto/broadcast.dto';
import {
  CreateRoomResponseDto,
  RoomMetadataResponseDto,
  JoinRoomResponseDto,
} from './dto/room-response.dto';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({
    status: 201,
    description: 'Room created successfully',
    type: CreateRoomResponseDto,
  })
  async createRoom(
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<CreateRoomResponseDto> {
    return this.roomsService.createRoom(createRoomDto);
  }

  @Get(':roomCode')
  @ApiOperation({ summary: 'Get room metadata' })
  @ApiParam({ name: 'roomCode', example: 'ABCD12' })
  @ApiResponse({
    status: 200,
    description: 'Room metadata retrieved successfully',
    type: RoomMetadataResponseDto,
  })
  async getRoomMetadata(
    @Param('roomCode') roomCode: string,
  ): Promise<RoomMetadataResponseDto> {
    return this.roomsService.getRoomMetadata(roomCode);
  }

  @Post(':roomCode/join')
  @ApiOperation({ summary: 'Join a room as a listener' })
  @ApiParam({ name: 'roomCode', example: 'ABCD12' })
  @ApiResponse({
    status: 200,
    description: 'Joined room successfully',
    type: JoinRoomResponseDto,
  })
  async joinRoom(
    @Param('roomCode') roomCode: string,
    @Body() joinRoomDto: JoinRoomDto,
  ): Promise<JoinRoomResponseDto> {
    return this.roomsService.joinRoom(roomCode, joinRoomDto);
  }

  @Post(':roomCode/end')
  @ApiOperation({ summary: 'End a room' })
  @ApiParam({ name: 'roomCode', example: 'ABCD12' })
  @ApiResponse({
    status: 200,
    description: 'Room ended successfully',
  })
  async endRoom(
    @Param('roomCode') roomCode: string,
    @Body() endRoomDto: EndRoomDto,
  ) {
    return this.roomsService.endRoom(roomCode, endRoomDto.hostSecret);
  }

  @Post(':roomCode/broadcast/starting')
  @ApiOperation({ summary: 'Mark broadcast as starting' })
  @ApiParam({ name: 'roomCode', example: 'ABCD12' })
  @ApiResponse({
    status: 200,
    description: 'Broadcast starting',
  })
  async broadcastStarting(
    @Param('roomCode') roomCode: string,
    @Body() dto: BroadcastStartingDto,
  ) {
    return this.roomsService.broadcastStarting(roomCode, dto);
  }

  @Post(':roomCode/broadcast/live')
  @ApiOperation({ summary: 'Mark broadcast as live' })
  @ApiParam({ name: 'roomCode', example: 'ABCD12' })
  @ApiResponse({
    status: 200,
    description: 'Broadcast is now live',
  })
  async broadcastLive(
    @Param('roomCode') roomCode: string,
    @Body() dto: BroadcastLiveDto,
  ) {
    return this.roomsService.broadcastLive(roomCode, dto.hostSecret);
  }

  @Post(':roomCode/broadcast/stopped')
  @ApiOperation({ summary: 'Mark broadcast as stopped' })
  @ApiParam({ name: 'roomCode', example: 'ABCD12' })
  @ApiResponse({
    status: 200,
    description: 'Broadcast stopped',
  })
  async broadcastStopped(
    @Param('roomCode') roomCode: string,
    @Body() dto: BroadcastStoppedDto,
  ) {
    return this.roomsService.broadcastStopped(roomCode, dto.hostSecret);
  }
}
