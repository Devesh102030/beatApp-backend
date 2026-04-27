import { generateRoomCode, isValidRoomCode } from './random-code';

describe('Random Code Utils', () => {
  describe('generateRoomCode', () => {
    it('should generate a 6-character code by default', () => {
      const code = generateRoomCode();
      expect(code).toHaveLength(6);
    });

    it('should generate uppercase alphanumeric code', () => {
      const code = generateRoomCode();
      expect(code).toMatch(/^[A-Z2-9]+$/);
    });

    it('should not contain confusing characters', () => {
      for (let i = 0; i < 100; i++) {
        const code = generateRoomCode();
        expect(code).not.toContain('O');
        expect(code).not.toContain('0');
        expect(code).not.toContain('I');
        expect(code).not.toContain('1');
      }
    });

    it('should generate different codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateRoomCode());
      }
      expect(codes.size).toBeGreaterThan(90); // Allow some collisions
    });
  });

  describe('isValidRoomCode', () => {
    it('should validate correct room codes', () => {
      expect(isValidRoomCode('ABCD23')).toBe(true);
      expect(isValidRoomCode('XYZ789')).toBe(true);
    });

    it('should reject invalid room codes', () => {
      expect(isValidRoomCode('abc123')).toBe(false); // lowercase
      expect(isValidRoomCode('ABCD1')).toBe(false); // too short
      expect(isValidRoomCode('ABCD123')).toBe(false); // too long
      expect(isValidRoomCode('ABCD!@')).toBe(false); // special chars
    });
  });
});
