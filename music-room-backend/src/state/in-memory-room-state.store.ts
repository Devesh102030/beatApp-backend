import { Injectable, Logger } from '@nestjs/common';
import { RoomStateStore } from './room-state-store.interface';
import { LiveRoomState } from './types';

interface RoomMembers {
  members: Map<string, Set<string>>; // userId -> Set of socketIds
  displayNames: Map<string, string>; // userId -> displayName
}

@Injectable()
export class InMemoryRoomStateStore implements RoomStateStore {
  private readonly logger = new Logger(InMemoryRoomStateStore.name);
  private readonly roomStates = new Map<string, LiveRoomState>();
  private readonly roomMembers = new Map<string, RoomMembers>();

  async getRoomState(roomCode: string): Promise<LiveRoomState | null> {
    return this.roomStates.get(roomCode) || null;
  }

  async setRoomState(roomCode: string, state: LiveRoomState): Promise<void> {
    this.roomStates.set(roomCode, state);
    this.logger.debug(`Set room state for ${roomCode}:`, state.status);
  }

  async patchRoomState(
    roomCode: string,
    patch: Partial<LiveRoomState>,
  ): Promise<void> {
    const existing = this.roomStates.get(roomCode);
    if (!existing) {
      this.logger.warn(`Cannot patch non-existent room state: ${roomCode}`);
      return;
    }

    const updated = { ...existing, ...patch };
    this.roomStates.set(roomCode, updated);
    this.logger.debug(`Patched room state for ${roomCode}`);
  }

  async deleteRoomState(roomCode: string): Promise<void> {
    this.roomStates.delete(roomCode);
    this.roomMembers.delete(roomCode);
    this.logger.debug(`Deleted room state for ${roomCode}`);
  }

  async addMember(
    roomCode: string,
    userId: string,
    socketId: string,
    displayName?: string,
  ): Promise<void> {
    let roomMemberData = this.roomMembers.get(roomCode);

    if (!roomMemberData) {
      roomMemberData = {
        members: new Map(),
        displayNames: new Map(),
      };
      this.roomMembers.set(roomCode, roomMemberData);
    }

    let socketIds = roomMemberData.members.get(userId);
    if (!socketIds) {
      socketIds = new Set();
      roomMemberData.members.set(userId, socketIds);
    }

    socketIds.add(socketId);

    if (displayName) {
      roomMemberData.displayNames.set(userId, displayName);
    }

    // Update listener count in room state
    const state = this.roomStates.get(roomCode);
    if (state) {
      state.listenerCount = roomMemberData.members.size;
      this.roomStates.set(roomCode, state);
    }

    this.logger.debug(
      `Added member ${userId} (socket: ${socketId}) to room ${roomCode}`,
    );
  }

  async removeMember(
    roomCode: string,
    userId: string,
    socketId?: string,
  ): Promise<void> {
    const roomMemberData = this.roomMembers.get(roomCode);
    if (!roomMemberData) {
      return;
    }

    const socketIds = roomMemberData.members.get(userId);
    if (!socketIds) {
      return;
    }

    if (socketId) {
      // Remove specific socket
      socketIds.delete(socketId);
      if (socketIds.size === 0) {
        roomMemberData.members.delete(userId);
        roomMemberData.displayNames.delete(userId);
      }
    } else {
      // Remove all sockets for this user
      roomMemberData.members.delete(userId);
      roomMemberData.displayNames.delete(userId);
    }

    // Update listener count in room state
    const state = this.roomStates.get(roomCode);
    if (state) {
      state.listenerCount = roomMemberData.members.size;
      this.roomStates.set(roomCode, state);
    }

    this.logger.debug(`Removed member ${userId} from room ${roomCode}`);
  }

  async getMemberCount(roomCode: string): Promise<number> {
    const roomMemberData = this.roomMembers.get(roomCode);
    return roomMemberData ? roomMemberData.members.size : 0;
  }

  async setHostOnline(
    roomCode: string,
    online: boolean,
    socketId?: string,
  ): Promise<void> {
    const state = this.roomStates.get(roomCode);
    if (!state) {
      this.logger.warn(`Cannot set host online for non-existent room: ${roomCode}`);
      return;
    }

    state.hostOnline = online;
    if (socketId) {
      state.hostSocketId = online ? socketId : undefined;
    }

    this.roomStates.set(roomCode, state);
    this.logger.debug(`Set host online=${online} for room ${roomCode}`);
  }

  async getRoomMembers(roomCode: string): Promise<Map<string, Set<string>>> {
    const roomMemberData = this.roomMembers.get(roomCode);
    return roomMemberData ? roomMemberData.members : new Map();
  }

  // Utility methods for debugging/monitoring
  getAllRoomCodes(): string[] {
    return Array.from(this.roomStates.keys());
  }

  getRoomCount(): number {
    return this.roomStates.size;
  }
}
