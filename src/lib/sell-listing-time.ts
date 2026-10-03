import type { SellListing } from '@/types/sell';

function timestampFromStorageUrl(url: string): number {
  const match = url.match(/\/(\d{13})-/);
  if (!match) return 0;
  const ms = Number(match[1]);
  return Number.isFinite(ms) ? ms : 0;
}

export function readFirestoreCreatedAt(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'object' && value !== null) {
    if ('toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate().toISOString();
    }
    if ('seconds' in value) {
      const seconds = Number((value as { seconds: number }).seconds);
      if (Number.isFinite(seconds)) return new Date(seconds * 1000).toISOString();
    }
  }
  return String(value).trim();
}

export function inferListingCreatedAtMs(item: Pick<SellListing, 'images' | 'introImages'>): number {
  let max = 0;
  for (const url of [...item.images, ...item.introImages]) {
    max = Math.max(max, timestampFromStorageUrl(url));
  }
  return max;
}

export function listingCreatedAtMs(item: SellListing): number {
  const raw = item.createdAt?.trim();
  if (raw) {
    const ms = Date.parse(raw);
    if (!Number.isNaN(ms)) return ms;
  }
  return inferListingCreatedAtMs(item);
}
