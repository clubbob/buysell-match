import { NextResponse } from 'next/server';
import { getAuthUser, getDocument, hasFirebaseAdminConfig, setDocument } from '@/lib/firebase-rest-admin';
import { getAuthedUid } from '@/lib/user-token';
import { toMember, type Member } from '@/types/member';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function loadOwnMember(uid: string): Promise<Member> {
  const [data, authUser] = await Promise.all([getDocument('members', uid), getAuthUser(uid)]);
  return toMember(uid, data, {
    name: authUser?.displayName,
    email: authUser?.email,
    createdAt: authUser?.createdAt,
  });
}

function toStoredMember(member: Member) {
  return {
    name: member.name,
    email: member.email,
    createdAt: member.createdAt,
    termsAgreedAt: member.termsAgreedAt,
    privacyAgreedAt: member.privacyAgreedAt,
    marketingAgreed: member.marketingAgreed,
    marketingAgreedAt: member.marketingAgreedAt,
  };
}

export async function GET(request: Request) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  return NextResponse.json({ ok: true, member: await loadOwnMember(uid) });
}

export async function PATCH(request: Request) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  let body: { marketingAgreed?: unknown };
  try {
    body = (await request.json()) as { marketingAgreed?: unknown };
  } catch {
    return NextResponse.json({ ok: false, message: '마케팅 수신 동의를 확인해 주세요.' }, { status: 400 });
  }

  if (typeof body.marketingAgreed !== 'boolean') {
    return NextResponse.json({ ok: false, message: '마케팅 수신 동의를 확인해 주세요.' }, { status: 400 });
  }

  const current = await loadOwnMember(uid);
  const now = new Date().toISOString();
  const member: Member = {
    ...current,
    marketingAgreed: body.marketingAgreed,
    marketingAgreedAt: body.marketingAgreed ? now : '',
  };

  await setDocument('members', uid, toStoredMember(member));
  return NextResponse.json({ ok: true, member });
}
