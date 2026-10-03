import { NextResponse } from 'next/server';
import { hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';
import { confirmSellJoinsForSeller } from '@/lib/sell-join-server';
import { getAuthedUid } from '@/lib/user-token';
import type { SellJoin } from '@/types/sell-join';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  let body: { listingId?: unknown };
  try {
    body = (await request.json()) as { listingId?: unknown };
  } catch {
    return NextResponse.json({ ok: false, message: '판매 확정 정보를 확인해 주세요.' }, { status: 400 });
  }

  const listingId = String(body.listingId ?? '').trim();
  if (!listingId) {
    return NextResponse.json({ ok: false, message: '상품을 확인해 주세요.' }, { status: 400 });
  }

  try {
    const result = await confirmSellJoinsForSeller(uid, listingId);
    return NextResponse.json({
      ok: true,
      joins: result.joins,
      remainingLabel: result.remainingLabel,
    } satisfies { ok: true; joins: SellJoin[]; remainingLabel: string });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '판매 확정에 실패했습니다.';
    const status = message.includes('없는') ? 404 : message.includes('본인') ? 403 : 400;
    return NextResponse.json({ ok: false, message }, { status });
  }
}
