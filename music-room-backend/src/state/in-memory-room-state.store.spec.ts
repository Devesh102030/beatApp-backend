import { Test, TestingModule } from '@nestjs/testing';
import { InMemoryRoomStateStore } from './in-memory-room-state.store';

describe('InMemoryRoomStateStore', () => {
  let store: InMemoryRoomStateStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InMemoryRoomStateStore],
    }).compile();

    store = module.get<InMemoryRoomStateStore>(InMemoryRoomStateStore);
  });

  describe('Room State Management', () => {
    it('should set and get room state', async () => {
      const roomCode = 'TEST01';
      const state = {
        roomCode,
        status: 'idle' as const,
        hostOnline: false,
        listenerCount: 0,
      };

      await store.setRoomState(roomCode, state);
      const retrieved = await store.getRoomState(roomCode);

      expect(retrieved).toEqual(state);
    });

    it('should return null for non-existent room', async () => {
      const state = await store.getRoomState('NONEXISTENT');
      expect(state).toBeNull();
    });

    it('should patch room state', async () => {
      const roomCode = 'TEST02';
      await store.setRoomState(roomCode, {
        roomCode,
        status: 'idle',
        hostOnline: false,
        listenerCount: 0,
      });

      await store.patchRoomState(roomCode, { status: 'live' });

      const state = await store.getRoomState(roomCode);
      expect(state?.status).toBe('live');
      expect(state?.roomCode).toBe(roomCode);
    });

    it('should delete room state', async () => {
      const roomCode = 'TEST03';
      await store.setRoomState(roomCode, {
        roomCode,
        status: 'idle',
        hostOnline: false,
        listenerCount: 0,
      });

      await store.deleteRoomState(roomCode);
      const state = await store.getRoomState(roomCode);
      expect(state).toBeNull();
    });
  });

  describe('Member Management', () => {
    it('should add and count members', async () => {
      const roomCode = 'TEST04';
      await store.setRoomState(roomCode, {
        roomCode,
        status: 'idle',
        hostOnline: false,
        listenerCount: 0,
      });

      await store.addMember(roomCode, 'user1', 'socket1', 'User One');
      await store.addMember(roomCode, 'user2', 'socket2', 'User Two');

      const count = await store.getMemberCount(roomCode);
      expect(count).toBe(2);
    });

    it('should remove member', async () => {
      const roomCode = 'TEST05';
      await store.setRoomState(roomCode, {
        roomCode,
        status: 'idle',
        hostOnline: false,
        listenerCount: 0,
      });

      await store.addMember(roomCode, 'user1', 'socket1');
      await store.addMember(roomCode, 'user2', 'socket2');

      await store.removeMember(roomCode, 'user1');

      const count = await store.getMemberCount(roomCode);
      expect(count).toBe(1);
    });

    it('should handle multiple sockets per user', async () => {
      const roomCode = 'TEST06';
      await store.setRoomState(roomCode, {
        roomCode,
        status: 'idle',
        hostOnline: false,
        listenerCount: 0,
      });

      await store.addMember(roomCode, 'user1', 'socket1');
      await store.addMember(roomCode, 'user1', 'socket2');

      const count = await store.getMemberCount(roomCode);
      expect(count).toBe(1); // Same user, different sockets

      await store.removeMember(roomCode, 'user1', 'socket1');
      const countAfter = await store.getMemberCount(roomCode);
      expect(countAfter).toBe(1); // Still has socket2
    });

    it('should update listener count in room state', async () => {
      const roomCode = 'TEST07';
      await store.setRoomState(roomCode, {
        roomCode,
        status: 'idle',
        hostOnline: false,
        listenerCount: 0,
      });

      await store.addMember(roomCode, 'user1', 'socket1');
      await store.addMember(roomCode, 'user2', 'socket2');

      const state = await store.getRoomState(roomCode);
      expect(state?.listenerCount).toBe(2);
    });
  });

  describe('Host Management', () => {
    it('should set host online status', async () => {
      const roomCode = 'TEST08';
      await store.setRoomState(roomCode, {
        roomCode,
        status: 'idle',
        hostOnline: false,
        listenerCount: 0,
      });

      await store.setHostOnline(roomCode, true, 'host-socket');

      const state = await store.getRoomState(roomCode);
      expect(state?.hostOnline).toBe(true);
      expect(state?.hostSocketId).toBe('host-socket');
    });

    it('should set host offline', async () => {
      const roomCode = 'TEST09';
      await store.setRoomState(roomCode, {
        roomCode,
        status: 'idle',
        hostOnline: true,
        hostSocketId: 'host-socket',
        listenerCount: 0,
      });

      await store.setHostOnline(roomCode, false);

      const state = await store.getRoomState(roomCode);
      expect(state?.hostOnline).toBe(false);
    });
  });
});
