import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomCodeService } from './services/room-code.service';
import { HostSecretService } from './services/host-secret.service';
import { UsersModule } from '../users/users.module';
import { StateModule } from '../state/state.module';

@Module({
  imports: [UsersModule, StateModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomCodeService, HostSecretService],
  exports: [RoomsService],
})
export class RoomsModule {}
