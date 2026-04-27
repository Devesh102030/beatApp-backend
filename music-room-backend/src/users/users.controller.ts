import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateGuestUserDto } from './dto/create-guest-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('guest')
  @ApiOperation({ summary: 'Create a guest user' })
  @ApiResponse({
    status: 201,
    description: 'Guest user created successfully',
    type: UserResponseDto,
  })
  async createGuest(
    @Body() createGuestUserDto: CreateGuestUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.createGuestUser(createGuestUserDto);
  }
}
