import { NextResponse } from 'next/server';
import { getDocument, hasFirebaseAdminConfig, setDocument } from '@/lib/firebase-rest-admin';
import { BUYER_DETAIL_LABEL } from '@/lib/profile-labels';
import { getAuthedUid } from '@/lib/user-token';
import {
  createBuyerAddress,
  hasBuyerProfile,
  resolveDefaultAddressId,
  toBuyerProfile,
  type BuyerAddress,
  type BuyerProfile,
} from '@/types/buyer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cleanAddresses(value: unknown): BuyerAddress[] {
  if (!Array.isArray(value) && !(value && typeof value === 'object')) return [];
  const list = Array.isArray(value) ? value : Object.values(value);
  return list.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    const address = String(row.address ?? '').trim();
    if (!address) return [];
    return [{ id: String(row.id ?? createBuyerAddress().id), address }];
  });
}

export async function GET(request: Request) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  const data = await getDocument('buyerProfiles', uid);
  if (!data) {
    return NextResponse.json({ ok: true, profile: null });
  }

  return NextResponse.json({
    ok: true,
    profile: toBuyerProfile(uid, data),
  });
}

export async function PUT(request: Request) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  let body: Partial<BuyerProfile>;
  try {
    body = (await request.json()) as Partial<BuyerProfile>;
  } catch {
    return NextResponse.json({ ok: false, message: `${BUYER_DETAIL_LABEL}을 확인해 주세요.` }, { status: 400 });
  }

  const addresses = cleanAddresses(body.addresses);
  const profile: BuyerProfile = {
    buyerId: uid,
    buyerPhone: String(body.buyerPhone ?? '').trim(),
    addresses,
    defaultAddressId: resolveDefaultAddressId(addresses, body.defaultAddressId),
  };

  if (!hasBuyerProfile(profile)) {
    return NextResponse.json({ ok: false, message: '핸드폰 번호와 배송 주소를 입력해 주세요.' }, { status: 400 });
  }

  await setDocument('buyerProfiles', uid, profile);
  return NextResponse.json({ ok: true, profile });
}
