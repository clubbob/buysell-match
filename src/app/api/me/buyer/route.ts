import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { getAuthedUid } from '@/lib/user-token';
import {
  createBuyerAddress,
  hasBuyerProfile,
  resolveDefaultAddressId,
  toBuyerProfile,
  type BuyerAddress,
  type BuyerProfile,
} from '@/types/buyer';

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

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  const snapshot = await db.collection('buyerProfiles').doc(uid).get();
  if (!snapshot.exists) {
    return NextResponse.json({ ok: true, profile: null });
  }

  return NextResponse.json({
    ok: true,
    profile: toBuyerProfile(snapshot.id, snapshot.data() as Record<string, unknown>),
  });
}

export async function PUT(request: Request) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }

  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  let body: Partial<BuyerProfile>;
  try {
    body = (await request.json()) as Partial<BuyerProfile>;
  } catch {
    return NextResponse.json({ ok: false, message: '구매자 정보를 확인해 주세요.' }, { status: 400 });
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

  await db.collection('buyerProfiles').doc(uid).set(profile);
  return NextResponse.json({ ok: true, profile });
}
