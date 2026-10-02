import { NextResponse } from 'next/server';
import { getDocument, hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';
import { getAuthedUid } from '@/lib/user-token';
import { toSiteInquiry } from '@/types/site-inquiry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isSafeId(id: string) {
  return /^[A-Za-z0-9_-]+$/.test(id);
}

export async function GET(request: Request, context: RouteContext) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isSafeId(id)) {
    return NextResponse.json({ ok: false, message: '잘못된 문의입니다.' }, { status: 400 });
  }

  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  const data = await getDocument('siteInquiries', id);
  const item = data ? toSiteInquiry(id, data) : null;
  if (!item || item.memberId !== uid) {
    return NextResponse.json({ ok: false, message: '없는 문의입니다.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item });
}
