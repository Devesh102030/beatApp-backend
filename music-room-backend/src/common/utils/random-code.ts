/**
 * Generate a random room code
 * Avoids confusing characters: O, 0, I, 1
 */
export function generateRoomCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }

  return code;
}

/**
 * Validate room code format
 */
export function isValidRoomCode(code: string): boolean {
  const pattern = /^[A-Z2-9]{6}$/;
  return pattern.test(code);
}
