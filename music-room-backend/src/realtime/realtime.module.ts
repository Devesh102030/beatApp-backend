import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { RoomsModule } from '../rooms/rooms.module';
import { ChatModule } from '../chat/chat.module';
import { StateModule } from '../state/state.module';

@Module({
  imports: [RoomsModule, ChatModule, StateModule],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
