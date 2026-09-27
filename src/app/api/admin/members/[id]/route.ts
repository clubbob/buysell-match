import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import {
  deleteAuthUser,
  deleteDocument,
  getAuthUser,
  getDocument,
  hasFirebaseAdminConfig,
  queryDocumentIds,
} from '@/lib/firebase-rest-admin';
import { toBuyerProfile } from '@/types/buyer';
import { toMember, type MemberRecord } from '@/types/member';
import { toSellerProfile } from '@/types/seller';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  try {
    return await getMember(context);
  } catch {
    return NextResponse.json({ ok: false, message: '회원 정보를 불러오지 못했습니다.' }, { status: 500 });
  }
}

async function getMember(context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isSafeId(id)) {
    return NextResponse.json({ ok: false, message: '잘못된 회원입니다.' }, { status: 400 });
  }

  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '관리자 DB가 연결되지 않았습니다.' }, { status: 503 });
  }

  const [user, memberData, buyerData, sellerData] = await Promise.all([
    getAuthUser(id),
    getDocument('members', id),
    getDocument('buyerProfiles', id),
    getDocument('sellerProfiles', id),
  ]);

  const seller = sellerData ? toSellerProfile(id, sellerData) : null;
  const buyer = buyerData ? toBuyerProfile(id, buyerData) : null;

  if (!user && !memberData && !buyer && !seller) {
    return NextResponse.json({ ok: false, message: '없는 회원입니다.' }, { status: 404 });
  }

  const item: MemberRecord = {
    member: toMember(id, memberData, {
      name: user?.displayName ?? seller?.representativeName ?? seller?.sellerName ?? '',
      email: user?.email ?? seller?.sellerEmail ?? '',
      createdAt: user?.createdAt ?? '',
    }),
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

  if (hasFirebaseAdminConfig()) {
    const listingIds = await queryDocumentIds('sellListings', 'sellerId', id);
    await Promise.all([
      deleteDocument('members', id),
      deleteDocument('buyerProfiles', id),
      deleteDocument('sellerProfiles', id),
      ...listingIds.map((listingId) => deleteDocument('sellListings', listingId)),
    ]);
    await deleteAuthUser(id).catch(() => undefined);
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
    { ok: false, message: '회원 정보를 삭제할 권한이 없습니다. Firebase 서비스 계정 키를 설정해 주세요.' },
    { status: 503 },
  );
}
