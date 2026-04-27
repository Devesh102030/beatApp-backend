import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureToken(length = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Hash a secret using bcrypt
 */
export async function hashSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, SALT_ROUNDS);
}

/**
 * Verify a secret against a hash using timing-safe comparison
 */
export async function verifySecret(
  secret: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(secret, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Timing-safe string comparison
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return crypto.timingSafeEqual(bufA, bufB);
}
