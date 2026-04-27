import { Injectable } from '@nestjs/common';
import {
  generateSecureToken,
  hashSecret,
  verifySecret,
} from '../../common/utils/crypto';

@Injectable()
export class HostSecretService {
  /**
   * Generate a new host secret
   */
  generateSecret(): string {
    return `secret_${generateSecureToken(32)}`;
  }

  /**
   * Hash a host secret for storage
   */
  async hashSecret(secret: string): Promise<string> {
    return hashSecret(secret);
  }

  /**
   * Verify a host secret against a hash
   */
  async verifySecret(secret: string, hash: string): Promise<boolean> {
    return verifySecret(secret, hash);
  }
}
