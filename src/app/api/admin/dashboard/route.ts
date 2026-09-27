import { NextResponse } from 'next/server';
import { buildAdminDashboard } from '@/lib/admin-dashboard';
import { loadMemberRecords } from '@/lib/admin-members-data';
import { getAdminSession } from '@/lib/admin-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: '관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const items = await loadMemberRecords();
    if (!items) {
      return NextResponse.json({ ok: false, message: '관리자 DB가 연결되지 않았습니다.' }, { status: 503 });
    }

    const daysRaw = Number(new URL(request.url).searchParams.get('days') ?? 14);
    const days = [7, 14, 30].includes(daysRaw) ? daysRaw : 14;

    return NextResponse.json({ ok: true, data: buildAdminDashboard(items, days) });
  } catch {
    return NextResponse.json({ ok: false, message: '대시보드를 불러오지 못했습니다.' }, { status: 500 });
  }
}
