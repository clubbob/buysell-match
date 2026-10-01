import { NextResponse } from 'next/server';
import { deleteAdminBuyListing } from '@/lib/admin-listings-data';
import { getAdminSession } from '@/lib/admin-session';
import { hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isSafeId(id: string) {
  return /^[A-Za-z0-9_-]+$/.test(id);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isSafeId(id)) {
    return NextResponse.json({ ok: false, message: '잘못된 글입니다.' }, { status: 400 });
  }

  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '관리자 DB가 연결되지 않았습니다.' }, { status: 503 });
  }

  try {
    await deleteAdminBuyListing(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: '삭제에 실패했습니다.' }, { status: 500 });
  }
}
