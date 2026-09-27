import { getAdminAuth } from '@/lib/firebase-admin';

export async function getAuthedUid(request: Request): Promise<string | null> {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const auth = getAdminAuth();
  if (!auth || !token) return null;
  try {
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
