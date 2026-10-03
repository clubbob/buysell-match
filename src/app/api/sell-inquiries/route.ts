import { NextResponse } from 'next/server';
import { hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';
import { loadInquiriesForListing } from '@/lib/sell-inquiry-server';
import type { SellInquiry } from '@/types/sell-inquiry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const listingId = new URL(request.url).searchParams.get('listingId')?.trim();
  if (!listingId) {
    return NextResponse.json({ ok: false, message: '상품을 확인해 주세요.' }, { status: 400 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  try {
    const items = await loadInquiriesForListing(listingId);
    return NextResponse.json({ ok: true, items } satisfies { ok: true; items: SellInquiry[] });
  } catch {
    return NextResponse.json({ ok: false, message: '상품 문의를 불러오지 못했습니다.' }, { status: 500 });
  }
}
