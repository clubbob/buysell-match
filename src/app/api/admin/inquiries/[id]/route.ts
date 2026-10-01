import { NextResponse } from 'next/server';
import { answerAdminSiteInquiry, loadAdminSiteInquiry } from '@/lib/admin-site-inquiries-data';
import { getAdminSession } from '@/lib/admin-session';
import { hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isSafeId(id: string) {
  return /^[A-Za-z0-9_-]+$/.test(id);
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isSafeId(id)) {
    return NextResponse.json({ ok: false, message: '잘못된 문의입니다.' }, { status: 400 });
  }

  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '관리자 DB가 연결되지 않았습니다.' }, { status: 503 });
  }

  const item = await loadAdminSiteInquiry(id);
  if (!item) {
    return NextResponse.json({ ok: false, message: '없는 문의입니다.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isSafeId(id)) {
    return NextResponse.json({ ok: false, message: '잘못된 문의입니다.' }, { status: 400 });
  }

  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '관리자 DB가 연결되지 않았습니다.' }, { status: 503 });
  }

  let body: { answer?: unknown };
  try {
    body = (await request.json()) as { answer?: unknown };
  } catch {
    return NextResponse.json({ ok: false, message: '답변 내용을 확인해 주세요.' }, { status: 400 });
  }

  const answer = String(body.answer ?? '').trim();
  if (answer.length < 2) {
    return NextResponse.json({ ok: false, message: '답변은 2자 이상 입력해 주세요.' }, { status: 400 });
  }

  try {
    const item = await answerAdminSiteInquiry(id, answer);
    if (!item) {
      return NextResponse.json({ ok: false, message: '없는 문의입니다.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, message: '답변을 저장하지 못했습니다.' }, { status: 500 });
  }
}
