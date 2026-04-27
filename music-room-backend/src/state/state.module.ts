import { Module } from '@nestjs/common';
import { InMemoryRoomStateStore } from './in-memory-room-state.store';
import { ROOM_STATE_STORE } from './room-state-store.interface';

@Module({
  providers: [
    {
      provide: ROOM_STATE_STORE,
      useClass: InMemoryRoomStateStore,
    },
  ],
  exports: [ROOM_STATE_STORE],
})
export class StateModule {}
