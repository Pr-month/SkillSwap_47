import { createHmac, timingSafeEqual } from 'crypto';

export function hashPassword(password: string, salt: string): string {
  return createHmac('sha256', salt).update(password).digest('hex');
}

export function verifyPassword(
  password: string,
  salt: string,
  storedHash: string,
): boolean {
  const hash = hashPassword(password, salt);

  if (hash.length !== storedHash.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}

export function hashToken(token: string, salt: string): string {
  return hashPassword(token, salt);
}
