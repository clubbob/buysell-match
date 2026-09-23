import type { UserMode } from '@/lib/user-mode';

const ALLOWED_NEXT = new Set(['/', '/sell', '/buy', '/sell/new', '/buy/new', '/mypage']);

export function loginHref(mode: UserMode, next?: string): string {
  const path = safeNextPath(next ?? null) ?? (mode === 'seller' ? '/sell' : '/buy');
  return `/login?next=${path}&mode=${mode}`;
}

export function safeNextPath(value: string | null): string | null {
  if (!value || value.startsWith('//') || !value.startsWith('/')) return null;
  if (ALLOWED_NEXT.has(value)) return value;
  if (/^\/sell\/[A-Za-z0-9_-]+(\/edit)?$/.test(value)) return value;
  return null;
}

export function safeUserMode(value: string | null): UserMode | null {
  return value === 'buyer' || value === 'seller' ? value : null;
}
