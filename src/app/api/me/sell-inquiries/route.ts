import { NextResponse } from 'next/server';
import { hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';
import { createSellInquiryForUser, loadInquiriesForBuyer, loadInquiriesForSeller } from '@/lib/sell-inquiry-server';
import { getAuthedUid } from '@/lib/user-token';
import type { SellInquiry } from '@/types/sell-inquiry';

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

  const scope = new URL(request.url).searchParams.get('scope') === 'buyer' ? 'buyer' : 'seller';

  try {
    const items = scope === 'buyer' ? await loadInquiriesForBuyer(uid) : await loadInquiriesForSeller(uid);
    return NextResponse.json({ ok: true, items } satisfies { ok: true; items: SellInquiry[] });
  } catch {
    return NextResponse.json({ ok: false, message: '상품 문의를 불러오지 못했습니다.' }, { status: 500 });
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

  let body: { listingId?: unknown; question?: unknown };
  try {
    body = (await request.json()) as { listingId?: unknown; question?: unknown };
  } catch {
    return NextResponse.json({ ok: false, message: '문의 내용을 확인해 주세요.' }, { status: 400 });
  }

  const listingId = String(body.listingId ?? '').trim();
  const question = String(body.question ?? '');
  if (!listingId) {
    return NextResponse.json({ ok: false, message: '상품을 확인해 주세요.' }, { status: 400 });
  }

  try {
    const item = await createSellInquiryForUser(uid, listingId, question);
    return NextResponse.json({ ok: true, item } satisfies { ok: true; item: SellInquiry });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '문의를 등록하지 못했습니다.';
    const status = message.includes('없는') ? 404 : 400;
    return NextResponse.json({ ok: false, message }, { status });
  }
}
