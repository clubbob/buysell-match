import type { SellInquiry } from '@/types/sell-inquiry';

const STORAGE_KEY = 'buysell.sellInquiries';

function isInquiry(value: unknown): value is SellInquiry {
  if (!value || typeof value !== 'object') return false;
  const item = value as SellInquiry;
  return Boolean(item.id && item.listingId && item.buyerId && item.question);
}

export function loadLocalInquiries(listingId?: string): SellInquiry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    const list = Array.isArray(parsed) ? parsed.filter(isInquiry) : [];
    return listingId ? list.filter((item) => item.listingId === listingId) : list;
  } catch {
    return [];
  }
}

export function saveLocalInquiry(inquiry: SellInquiry) {
  const next = [inquiry, ...loadLocalInquiries().filter((item) => item.id !== inquiry.id)];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
