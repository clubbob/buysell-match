import { NextResponse } from 'next/server';
import { hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';
import { createSellJoinForBuyer, loadJoinsForBuyer, loadJoinsForSeller } from '@/lib/sell-join-server';
import { getAuthedUid } from '@/lib/user-token';
import type { SellJoin } from '@/types/sell-join';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  const scope = new URL(request.url).searchParams.get('scope') === 'seller' ? 'seller' : 'buyer';
  try {
    const items = scope === 'seller' ? await loadJoinsForSeller(uid) : await loadJoinsForBuyer(uid);
    return NextResponse.json({ ok: true, items } satisfies { ok: true; items: SellJoin[] });
  } catch {
    return NextResponse.json({ ok: false, message: '구매 신청 내역을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  let body: { listingId?: unknown; quantity?: unknown };
  try {
    body = (await request.json()) as { listingId?: unknown; quantity?: unknown };
  } catch {
    return NextResponse.json({ ok: false, message: '구매 신청 정보를 확인해 주세요.' }, { status: 400 });
  }

  const listingId = String(body.listingId ?? '').trim();
  const quantity = Number(body.quantity);
  if (!listingId) {
    return NextResponse.json({ ok: false, message: '상품을 확인해 주세요.' }, { status: 400 });
  }

  try {
    const join = await createSellJoinForBuyer(uid, listingId, quantity);
    return NextResponse.json({ ok: true, join } satisfies { ok: true; join: SellJoin });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '구매 신청에 실패했습니다.';
    const status = message.includes('없는') ? 404 : 400;
    return NextResponse.json({ ok: false, message }, { status });
  }
}
