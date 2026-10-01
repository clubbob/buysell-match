import { NextResponse } from 'next/server';
import { loadAdminSiteInquiries } from '@/lib/admin-site-inquiries-data';
import { getAdminSession } from '@/lib/admin-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: '관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const items = await loadAdminSiteInquiries();
    if (!items) {
      return NextResponse.json({ ok: false, message: '관리자 DB가 연결되지 않았습니다.' }, { status: 503 });
    }

    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json({ ok: false, message: '목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}
