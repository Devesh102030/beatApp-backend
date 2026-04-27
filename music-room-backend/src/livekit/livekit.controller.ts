import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LiveKitService } from './livekit.service';
import { TokenRequestDto } from './dto/token-request.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@ApiTags('livekit')
@Controller('livekit')
export class LiveKitController {
  constructor(private readonly livekitService: LiveKitService) {}

  @Post('token')
  @ApiOperation({ summary: 'Generate LiveKit access token' })
  @ApiResponse({
    status: 200,
    description: 'Token generated successfully',
    type: TokenResponseDto,
  })
  async generateToken(
    @Body() tokenRequestDto: TokenRequestDto,
  ): Promise<TokenResponseDto> {
    return this.livekitService.generateToken(tokenRequestDto);
  }
}
