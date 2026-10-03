import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'buysell.admin';
/** 세션 쿠키(브라우저 종료 시 삭제). 토큰은 같은 브라우저에서 장시간 열어도 유지. */
const SESSION_MAX_DAYS = 7;

function adminId() {
  return process.env.ADMIN_ID ?? '';
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? '';
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || adminPassword() || 'buysell-admin';
}

function sign(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyAdminCredentials(id: string, password: string) {
  const expectedId = adminId();
  const expectedPassword = adminPassword();
  if (!expectedId || !expectedPassword) return false;
  return safeEqual(id, expectedId) && safeEqual(password, expectedPassword);
}

export function createAdminSessionValue(id: string) {
  const expires = Date.now() + SESSION_MAX_DAYS * 86_400_000;
  const payload = `${id}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function readAdminSession(value?: string | null) {
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length < 3) return null;
  const signature = parts.pop() ?? '';
  const payload = parts.join('.');
  const [id, expiresRaw] = payload.split('.');
  const expires = Number(expiresRaw);
  if (!id || !Number.isFinite(expires) || expires < Date.now()) return null;
  if (!safeEqual(sign(payload), signature)) return null;
  if (id !== adminId()) return null;
  return { id };
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  };
}

export async function getAdminSession() {
  const store = await cookies();
  return readAdminSession(store.get(ADMIN_COOKIE)?.value);
}
