import { LiveRoomState } from './types';

/**
 * Interface for room state storage
 * Can be implemented with in-memory Map or Redis
 */
export interface RoomStateStore {
  /**
   * Get room state by room code
   */
  getRoomState(roomCode: string): Promise<LiveRoomState | null>;

  /**
   * Set complete room state
   */
  setRoomState(roomCode: string, state: LiveRoomState): Promise<void>;

  /**
   * Partially update room state
   */
  patchRoomState(
    roomCode: string,
    patch: Partial<LiveRoomState>,
  ): Promise<void>;

  /**
   * Delete room state
   */
  deleteRoomState(roomCode: string): Promise<void>;

  /**
   * Add a member to the room
   */
  addMember(
    roomCode: string,
    userId: string,
    socketId: string,
    displayName?: string,
  ): Promise<void>;

  /**
   * Remove a member from the room
   * If socketId is provided, only remove that socket
   * If socketId is not provided, remove all sockets for that user
   */
  removeMember(
    roomCode: string,
    userId: string,
    socketId?: string,
  ): Promise<void>;

  /**
   * Get count of active listeners in room
   */
  getMemberCount(roomCode: string): Promise<number>;

  /**
   * Set host online status
   */
  setHostOnline(
    roomCode: string,
    online: boolean,
    socketId?: string,
  ): Promise<void>;

  /**
   * Get all member info for a room
   */
  getRoomMembers(roomCode: string): Promise<Map<string, Set<string>>>;
}

export const ROOM_STATE_STORE = Symbol('ROOM_STATE_STORE');
