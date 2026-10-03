import { NextResponse } from 'next/server';
import { hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';
import { loadReviewsForListing, loadReviewsForSeller } from '@/lib/seller-review-server';
import type { SellerReview } from '@/types/review';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const listingId = params.get('listingId')?.trim();
  const sellerId = params.get('sellerId')?.trim();

  if (!listingId && !sellerId) {
    return NextResponse.json({ ok: false, message: '조회 조건을 확인해 주세요.' }, { status: 400 });
  }
  if (listingId && sellerId) {
    return NextResponse.json({ ok: false, message: '조회 조건을 확인해 주세요.' }, { status: 400 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  try {
    const items = listingId ? await loadReviewsForListing(listingId) : await loadReviewsForSeller(sellerId!);
    return NextResponse.json({ ok: true, items } satisfies { ok: true; items: SellerReview[] });
  } catch {
    return NextResponse.json({ ok: false, message: '후기를 불러오지 못했습니다.' }, { status: 500 });
  }
}
