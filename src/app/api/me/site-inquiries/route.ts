import { NextResponse } from 'next/server';
import { getAuthUser, getDocument, hasFirebaseAdminConfig, queryDocumentIds, setDocument } from '@/lib/firebase-rest-admin';
import { getAuthedUid } from '@/lib/user-token';
import { toMember } from '@/types/member';
import { isSiteInquiryCategory, toSiteInquiry, type SiteInquiry } from '@/types/site-inquiry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function newInquiryId() {
  return `si-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function loadMemberProfile(uid: string) {
  const [memberData, authUser] = await Promise.all([getDocument('members', uid), getAuthUser(uid)]);
  const member = toMember(uid, memberData, {
    name: authUser?.displayName,
    email: authUser?.email,
    createdAt: authUser?.createdAt,
  });
  return {
    name: member.name || authUser?.displayName || '',
    email: member.email || authUser?.email || '',
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

  const ids = await queryDocumentIds('siteInquiries', 'memberId', uid);
  const items = (
    await Promise.all(ids.map(async (id) => {
      const data = await getDocument('siteInquiries', id);
      return data ? toSiteInquiry(id, data) : null;
    }))
  )
    .filter((item): item is SiteInquiry => Boolean(item))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({ ok: true, items });
}

export async function POST(request: Request) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  let body: { category?: unknown; subject?: unknown; question?: unknown };
  try {
    body = (await request.json()) as { category?: unknown; subject?: unknown; question?: unknown };
  } catch {
    return NextResponse.json({ ok: false, message: '문의 내용을 확인해 주세요.' }, { status: 400 });
  }

  const category = isSiteInquiryCategory(body.category) ? body.category : null;
  const subject = String(body.subject ?? '').trim();
  const question = String(body.question ?? '').trim();

  if (!category) {
    return NextResponse.json({ ok: false, message: '문의 유형을 선택해 주세요.' }, { status: 400 });
  }
  if (subject.length < 2) {
    return NextResponse.json({ ok: false, message: '제목은 2자 이상 입력해 주세요.' }, { status: 400 });
  }
  if (question.length < 5) {
    return NextResponse.json({ ok: false, message: '문의 내용은 5자 이상 입력해 주세요.' }, { status: 400 });
  }

  const profile = await loadMemberProfile(uid);
  const now = new Date().toISOString();
  const item: SiteInquiry = {
    id: newInquiryId(),
    memberId: uid,
    memberName: profile.name,
    memberEmail: profile.email,
    category,
    subject,
    question,
    answer: '',
    answeredAt: '',
    createdAt: now,
  };

  await setDocument('siteInquiries', item.id, item);
  return NextResponse.json({ ok: true, item });
}
