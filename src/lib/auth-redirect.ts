const ALLOWED_NEXT = new Set(['/', '/sell', '/sell/new', '/mypage', '/mypage/password', '/contact']);

export function loginHref(next?: string): string {
  const path = safeNextPath(next ?? null);
  return path ? `/login?next=${path}` : '/login';
}

export function safeNextPath(value: string | null): string | null {
  if (!value || value.startsWith('//') || !value.startsWith('/')) return null;
  if (ALLOWED_NEXT.has(value)) return value;
  if (/^\/sell\/[A-Za-z0-9_-]+(\/edit)?$/.test(value)) return value;
  return null;
}
