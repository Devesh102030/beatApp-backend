import { Module } from '@nestjs/common';
import { LiveKitController } from './livekit.controller';
import { LiveKitService } from './livekit.service';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [RoomsModule],
  controllers: [LiveKitController],
  providers: [LiveKitService],
})
export class LiveKitModule {}
