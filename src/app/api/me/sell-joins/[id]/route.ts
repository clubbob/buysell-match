import { NextResponse } from 'next/server';
import { hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';
import {
  markSellJoinPaidForSeller,
  markSellJoinPendingForSeller,
  markSellJoinShippedForSeller,
  markSellJoinShippingPendingForSeller,
} from '@/lib/sell-join-server';
import { getAuthedUid } from '@/lib/user-token';
import type { SellJoin } from '@/types/sell-join';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type JoinAction = 'markPaid' | 'markPaymentPending' | 'markShipped' | 'markShippingPending';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  const { id } = await context.params;
  let body: { action?: unknown; trackingNumber?: unknown };
  try {
    body = (await request.json()) as { action?: unknown; trackingNumber?: unknown };
  } catch {
    return NextResponse.json({ ok: false, message: '요청을 확인해 주세요.' }, { status: 400 });
  }

  const action = String(body.action ?? '') as JoinAction;
  const trackingNumber = typeof body.trackingNumber === 'string' ? body.trackingNumber : undefined;

  try {
    let join: SellJoin;
    switch (action) {
      case 'markPaid':
        join = await markSellJoinPaidForSeller(uid, id);
        break;
      case 'markPaymentPending':
        join = await markSellJoinPendingForSeller(uid, id);
        break;
      case 'markShipped':
        join = await markSellJoinShippedForSeller(uid, id, trackingNumber);
        break;
      case 'markShippingPending':
        join = await markSellJoinShippingPendingForSeller(uid, id);
        break;
      default:
        return NextResponse.json({ ok: false, message: '지원하지 않는 요청입니다.' }, { status: 400 });
    }
    return NextResponse.json({ ok: true, join } satisfies { ok: true; join: SellJoin });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '구매 신청 상태를 바꾸지 못했습니다.';
    const status = message.includes('없는') ? 404 : message.includes('본인') ? 403 : 400;
    return NextResponse.json({ ok: false, message }, { status });
  }
}
