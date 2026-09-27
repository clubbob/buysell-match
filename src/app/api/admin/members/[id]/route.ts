import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { getAdminSession } from '@/lib/admin-session';
import { toBuyerProfile } from '@/types/buyer';
import type { MemberRecord } from '@/types/member';
import { toSellerProfile } from '@/types/seller';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isSafeId(id: string) {
  return /^[A-Za-z0-9_-]+$/.test(id);
}

async function deleteWithUserToken(id: string, idToken: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('Firebase 프로젝트가 없습니다.');
  for (const path of [`members/${id}`, `buyerProfiles/${id}`, `sellerProfiles/${id}`]) {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      },
    );
    if (!response.ok && response.status !== 404) {
      throw new Error('회원 정보를 삭제하지 못했습니다.');
    }
  }
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isSafeId(id)) {
    return NextResponse.json({ ok: false, message: '잘못된 회원입니다.' }, { status: 400 });
  }

  const auth = getAdminAuth();
  const db = getAdminFirestore();
  if (!auth || !db) {
    return NextResponse.json({ ok: false, message: '관리자 DB가 연결되지 않았습니다.' }, { status: 503 });
  }

  const [user, memberDoc, buyerDoc, sellerDoc] = await Promise.all([
    auth.getUser(id).catch(() => null),
    db.collection('members').doc(id).get(),
    db.collection('buyerProfiles').doc(id).get(),
    db.collection('sellerProfiles').doc(id).get(),
  ]);

  const seller = sellerDoc.exists ? toSellerProfile(id, sellerDoc.data() as Record<string, unknown>) : null;
  const buyer = buyerDoc.exists ? toBuyerProfile(id, buyerDoc.data() as Record<string, unknown>) : null;
  const memberData = memberDoc.exists ? (memberDoc.data() as Record<string, unknown>) : {};

  if (!user && !memberDoc.exists && !buyer && !seller) {
    return NextResponse.json({ ok: false, message: '없는 회원입니다.' }, { status: 404 });
  }

  const item: MemberRecord = {
    member: {
      id,
      name: String(memberData.name ?? user?.displayName ?? seller?.representativeName ?? seller?.sellerName ?? ''),
      email: String(memberData.email ?? user?.email ?? seller?.sellerEmail ?? ''),
      createdAt: String(memberData.createdAt || user?.metadata.creationTime || ''),
    },
    buyer,
    seller,
  };

  return NextResponse.json({ ok: true, item });
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isSafeId(id)) {
    return NextResponse.json({ ok: false, message: '잘못된 회원입니다.' }, { status: 400 });
  }

  const db = getAdminFirestore();
  if (db) {
    await db.collection('members').doc(id).delete();
    await db.collection('buyerProfiles').doc(id).delete();
    await db.collection('sellerProfiles').doc(id).delete();
    const listings = await db.collection('sellListings').where('sellerId', '==', id).get();
    await Promise.all(listings.docs.map((entry) => entry.ref.delete()));
    const auth = getAdminAuth();
    if (auth) {
      try {
        await auth.deleteUser(id);
      } catch {
        // Auth 계정이 없을 수 있음
      }
    }
    return NextResponse.json({ ok: true });
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (token) {
    try {
      await deleteWithUserToken(id, token);
      return NextResponse.json({ ok: true });
    } catch (error) {
      return NextResponse.json(
        { ok: false, message: error instanceof Error ? error.message : '삭제에 실패했습니다.' },
        { status: 403 },
      );
    }
  }

  return NextResponse.json(
    { ok: false, message: '회원 정보를 삭제할 권한이 없습니다. Firebase 서비스 계정을 설정해 주세요.' },
    { status: 503 },
  );
}
