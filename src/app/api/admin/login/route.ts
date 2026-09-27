import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminCookieOptions, createAdminSessionValue, verifyAdminCredentials } from '@/lib/admin-session';

export async function POST(request: Request) {
  let body: { id?: unknown; password?: unknown };
  try {
    body = (await request.json()) as { id?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ ok: false, message: '아이디와 비밀번호를 입력해 주세요.' }, { status: 400 });
  }

  const id = typeof body.id === 'string' ? body.id.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!id || !password) {
    return NextResponse.json({ ok: false, message: '아이디와 비밀번호를 입력해 주세요.' }, { status: 400 });
  }
  if (!process.env.ADMIN_ID || !process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, message: '관리자 계정이 아직 설정되지 않았습니다.' }, { status: 500 });
  }
  if (!verifyAdminCredentials(id, password)) {
    return NextResponse.json({ ok: false, message: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSessionValue(id), adminCookieOptions());
  return response;
}
