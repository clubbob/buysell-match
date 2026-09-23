import type { SellJoin } from '@/types/sell-join';

const STORAGE_KEY = 'buysell.sellJoins';

function isJoin(value: unknown): value is SellJoin {
  if (!value || typeof value !== 'object') return false;
  const item = value as SellJoin;
  return Boolean(item.id && item.listingId && item.buyerId && item.quantity > 0);
}

export function loadLocalJoins(listingId?: string): SellJoin[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    const list = Array.isArray(parsed) ? parsed.filter(isJoin) : [];
    return listingId ? list.filter((item) => item.listingId === listingId) : list;
  } catch {
    return [];
  }
}

export function saveLocalJoin(join: SellJoin) {
  const next = [join, ...loadLocalJoins().filter((item) => item.id !== join.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function saveLocalJoins(joins: SellJoin[]) {
  const others = loadLocalJoins().filter((item) => !joins.some((join) => join.id === item.id));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...joins, ...others]));
}
