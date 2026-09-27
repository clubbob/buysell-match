import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { getAdminSession } from '@/lib/admin-session';
import { toBuyerProfile } from '@/types/buyer';
import type { MemberRecord } from '@/types/member';
import { toSellerProfile } from '@/types/seller';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  const auth = getAdminAuth();
  const db = getAdminFirestore();
  if (!auth || !db) {
    return NextResponse.json({ ok: false, message: '관리자 DB가 연결되지 않았습니다.' }, { status: 503 });
  }

  const [users, memberDocs, buyerDocs, sellerDocs] = await Promise.all([
    auth.listUsers(1000),
    db.collection('members').get(),
    db.collection('buyerProfiles').get(),
    db.collection('sellerProfiles').get(),
  ]);

  const members = new Map<string, { name: string; email: string; createdAt: string }>();
  for (const user of users.users) {
    members.set(user.uid, {
      name: user.displayName ?? '',
      email: user.email ?? '',
      createdAt: user.metadata.creationTime ?? '',
    });
  }
  for (const entry of memberDocs.docs) {
    const current = members.get(entry.id);
    const data = entry.data();
    members.set(entry.id, {
      name: String(data.name ?? current?.name ?? ''),
      email: String(data.email ?? current?.email ?? ''),
      createdAt: String(data.createdAt || current?.createdAt || ''),
    });
  }

  const buyers = new Map(
    buyerDocs.docs.map((entry) => [entry.id, toBuyerProfile(entry.id, entry.data() as Record<string, unknown>)]),
  );
  const sellers = new Map(
    sellerDocs.docs.map((entry) => [entry.id, toSellerProfile(entry.id, entry.data() as Record<string, unknown>)]),
  );
  for (const [id, buyer] of buyers) {
    if (!members.has(id)) {
      members.set(id, {
        name: '',
        email: '',
        createdAt: '',
      });
    }
  }
  for (const [id, seller] of sellers) {
    if (!members.has(id)) {
      members.set(id, {
        name: seller.representativeName || seller.sellerName,
        email: seller.sellerEmail,
        createdAt: '',
      });
    }
  }

  const items: MemberRecord[] = [...members.entries()]
    .map(([id, member]) => ({
      member: { id, ...member },
      buyer: buyers.get(id) ?? null,
      seller: sellers.get(id) ?? null,
    }))
    .sort((a, b) => b.member.createdAt.localeCompare(a.member.createdAt));

  return NextResponse.json({ ok: true, items });
}
