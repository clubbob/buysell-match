import type { UserMode } from '@/lib/user-mode';

const ALLOWED_NEXT = new Set(['/', '/sell', '/buy', '/sell/new', '/buy/new', '/mypage']);

export function loginHref(mode: UserMode): string {
  const next = mode === 'seller' ? '/sell' : '/buy';
  return `/login?next=${next}&mode=${mode}`;
}

export function safeNextPath(value: string | null): string | null {
  if (!value || !ALLOWED_NEXT.has(value)) return null;
  return value;
}

export function safeUserMode(value: string | null): UserMode | null {
  return value === 'buyer' || value === 'seller' ? value : null;
}
