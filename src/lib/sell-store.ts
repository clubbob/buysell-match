import { SAMPLE_SELL_LISTINGS } from '@/lib/sell-samples';
import type { SellListing } from '@/types/sell';

const STORAGE_KEY = 'buysell.sellListings';
const REMAINING_KEY = 'buysell.sellRemaining';

export function loadRemainingOverrides(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(REMAINING_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveRemainingOverride(id: string, remainingLabel: string) {
  if (typeof window === 'undefined') return;
  const next = { ...loadRemainingOverrides(), [id]: remainingLabel };
  window.localStorage.setItem(REMAINING_KEY, JSON.stringify(next));
}

function isListing(value: unknown): value is SellListing {
  if (!value || typeof value !== 'object') return false;
  const item = value as SellListing;
  return Boolean(item.id && item.title && Array.isArray(item.images) && item.sellerId);
}

export function loadUserSellListings(): SellListing[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isListing) : [];
  } catch {
    return [];
  }
}

export function saveUserSellListings(items: SellListing[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addUserSellListing(item: SellListing) {
  saveUserSellListings([item, ...loadUserSellListings()]);
}

export function removeUserSellListing(id: string) {
  saveUserSellListings(loadUserSellListings().filter((item) => item.id !== id));
}

export function mergeSellListings(userItems: SellListing[]): SellListing[] {
  const sampleIds = new Set(SAMPLE_SELL_LISTINGS.map((item) => item.id));
  const overrides = loadRemainingOverrides();
  return [...userItems.filter((item) => !sampleIds.has(item.id)), ...SAMPLE_SELL_LISTINGS].map((item) =>
    overrides[item.id] ? { ...item, remainingLabel: overrides[item.id] } : item,
  );
}

export function findSellListing(id: string, userItems: SellListing[]): SellListing | undefined {
  return mergeSellListings(userItems).find((item) => item.id === id);
}
