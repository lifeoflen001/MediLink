import jwt from 'jsonwebtoken';
import type { UserRole } from '@workspace/db';

const SECRET = process.env.SESSION_SECRET ?? 'mediconnect-dev-secret-fallback';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, SECRET) as JWTPayload;
}
