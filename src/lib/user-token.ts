import { verifyIdToken } from '@/lib/firebase-rest-admin';

export async function getAuthedUid(request: Request): Promise<string | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!token) return null;
  return verifyIdToken(token);
}
