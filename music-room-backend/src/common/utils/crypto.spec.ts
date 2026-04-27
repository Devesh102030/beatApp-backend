import {
  generateSecureToken,
  hashSecret,
  verifySecret,
  timingSafeEqual,
} from './crypto';

describe('Crypto Utils', () => {
  describe('generateSecureToken', () => {
    it('should generate a token', () => {
      const token = generateSecureToken();
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate different tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });

    it('should respect length parameter', () => {
      const token = generateSecureToken(16);
      expect(token).toBeDefined();
    });
  });

  describe('hashSecret and verifySecret', () => {
    it('should hash and verify a secret', async () => {
      const secret = 'my-secret-password';
      const hash = await hashSecret(secret);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(secret);

      const isValid = await verifySecret(secret, hash);
      expect(isValid).toBe(true);
    });

    it('should reject invalid secret', async () => {
      const secret = 'my-secret-password';
      const hash = await hashSecret(secret);

      const isValid = await verifySecret('wrong-password', hash);
      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same secret', async () => {
      const secret = 'my-secret-password';
      const hash1 = await hashSecret(secret);
      const hash2 = await hashSecret(secret);

      expect(hash1).not.toBe(hash2);

      // But both should verify
      expect(await verifySecret(secret, hash1)).toBe(true);
      expect(await verifySecret(secret, hash2)).toBe(true);
    });
  });

  describe('timingSafeEqual', () => {
    it('should return true for equal strings', () => {
      expect(timingSafeEqual('hello', 'hello')).toBe(true);
    });

    it('should return false for different strings', () => {
      expect(timingSafeEqual('hello', 'world')).toBe(false);
    });

    it('should return false for different length strings', () => {
      expect(timingSafeEqual('hello', 'hello world')).toBe(false);
    });
  });
});
