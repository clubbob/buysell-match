import { NextResponse } from 'next/server';
import { buildAdminDashboard, loadAdminDashboardInputs } from '@/lib/admin-dashboard';
import { loadMemberRecords } from '@/lib/admin-members-data';
import { getAdminSession } from '@/lib/admin-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ ok: false, message: '관리자 로그인이 필요합니다.' }, { status: 401 });
    }

    const [items, inputs] = await Promise.all([loadMemberRecords(), loadAdminDashboardInputs()]);
    if (!items) {
      return NextResponse.json({ ok: false, message: '관리자 DB가 연결되지 않았습니다.' }, { status: 503 });
    }
    if (!inputs) {
      return NextResponse.json({ ok: false, message: '서비스 데이터를 불러오지 못했습니다.' }, { status: 503 });
    }

    return NextResponse.json({ ok: true, data: buildAdminDashboard(items, inputs) });
  } catch {
    return NextResponse.json({ ok: false, message: '대시보드를 불러오지 못했습니다.' }, { status: 500 });
  }
}
