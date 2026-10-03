import { NextResponse } from 'next/server';
import { hasFirebaseAdminConfig } from '@/lib/firebase-rest-admin';
import { answerSellInquiryForSeller } from '@/lib/sell-inquiry-server';
import { getAuthedUid } from '@/lib/user-token';
import type { SellInquiry } from '@/types/sell-inquiry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const uid = await getAuthedUid(request);
  if (!uid) {
    return NextResponse.json({ ok: false, message: '로그인이 필요합니다.' }, { status: 401 });
  }
  if (!hasFirebaseAdminConfig()) {
    return NextResponse.json({ ok: false, message: '저장소를 연결하지 못했습니다.' }, { status: 503 });
  }

  const { id } = await context.params;
  let body: { answer?: unknown };
  try {
    body = (await request.json()) as { answer?: unknown };
  } catch {
    return NextResponse.json({ ok: false, message: '답변 내용을 확인해 주세요.' }, { status: 400 });
  }

  try {
    const item = await answerSellInquiryForSeller(uid, id, String(body.answer ?? ''));
    return NextResponse.json({ ok: true, item } satisfies { ok: true; item: SellInquiry });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '답변을 등록하지 못했습니다.';
    const status = message.includes('없는') ? 404 : message.includes('본인') ? 403 : 400;
    return NextResponse.json({ ok: false, message }, { status });
  }
}
