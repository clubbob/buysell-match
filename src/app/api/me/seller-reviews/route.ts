import { NextResponse } from 'next/server';
import { hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';
import { createSellerReviewForUser } from '@/lib/seller-review-server';
import { getAuthedUid } from '@/lib/user-token';
import type { SellerReview } from '@/types/review';

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

  let body: { listingId?: unknown; rating?: unknown; content?: unknown };
  try {
    body = (await request.json()) as { listingId?: unknown; rating?: unknown; content?: unknown };
  } catch {
    return NextResponse.json({ ok: false, message: '후기 내용을 확인해 주세요.' }, { status: 400 });
  }

  const listingId = String(body.listingId ?? '').trim();
  const content = String(body.content ?? '');
  const rating = Number(body.rating);
  if (!listingId) {
    return NextResponse.json({ ok: false, message: '상품을 확인해 주세요.' }, { status: 400 });
  }

  try {
    const item = await createSellerReviewForUser(uid, { listingId, rating, content });
    return NextResponse.json({ ok: true, item } satisfies { ok: true; item: SellerReview });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '후기를 등록하지 못했습니다.';
    const status = message.includes('없는') ? 404 : 400;
    return NextResponse.json({ ok: false, message }, { status });
  }
}
