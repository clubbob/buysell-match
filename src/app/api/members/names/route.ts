import { NextResponse } from 'next/server';
import { getAuthUser, getDocument, hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';
import { getAuthedUid } from '@/lib/user-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: true, names: {} });
  }

  const ids = [...new Set(
    (new URL(request.url).searchParams.get('ids') ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  )].slice(0, 40);

  const names: Record<string, string> = {};
  await Promise.all(
    ids.map(async (id) => {
      const [authUser, member, seller] = await Promise.all([
        getAuthUser(id),
        getDocument('members', id),
        getDocument('sellerProfiles', id),
      ]);
      const name =
        String(authUser?.displayName ?? '').trim() ||
        String(member?.name ?? '').trim() ||
        String(seller?.representativeName ?? '').trim() ||
        String(seller?.sellerName ?? '').trim();
      if (name) names[id] = name;
    }),
  );

  return NextResponse.json({ ok: true, names });
}
