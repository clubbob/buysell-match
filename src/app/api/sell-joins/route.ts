import { NextResponse } from 'next/server';
import { hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';
import { loadJoinsForListing, loadJoinsForListings } from '@/lib/sell-join-server';
import type { SellJoin } from '@/types/sell-join';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseListingIds(searchParams: URLSearchParams) {
  const many = searchParams
    .get('listingIds')
    ?.split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  if (many?.length) return many;
  const one = searchParams.get('listingId')?.trim();
  return one ? [one] : [];
}

export async function GET(request: Request) {
  const listingIds = parseListingIds(new URL(request.url).searchParams);
  if (listingIds.length === 0) {
    return NextResponse.json({ ok: false, message: '상품을 확인해 주세요.' }, { status: 400 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  try {
    if (listingIds.length === 1) {
      const items = await loadJoinsForListing(listingIds[0]);
      return NextResponse.json({ ok: true, items } satisfies { ok: true; items: SellJoin[] });
    }
    const joinsByListing = await loadJoinsForListings(listingIds);
    return NextResponse.json({ ok: true, joinsByListing } satisfies { ok: true; joinsByListing: Record<string, SellJoin[]> });
  } catch {
    return NextResponse.json({ ok: false, message: '구매 신청 내역을 불러오지 못했습니다.' }, { status: 500 });
  }
}
