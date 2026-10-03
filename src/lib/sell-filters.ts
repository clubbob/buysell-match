import { isListingClosed } from '@/lib/sell-display';
import { listingCreatedAtMs } from '@/lib/sell-listing-time';
import { parseSellCategory, SELL_CATEGORY_LABELS, type SellCategory } from '@/types/sell-category';
import type { SellListing } from '@/types/sell';

export type SellSort = 'deadline' | 'newest' | 'price-asc' | 'price-desc';

export function filterSellListings(
  items: SellListing[],
  options: {
    q?: string;
    category?: string;
    sort?: SellSort;
    seller?: string;
  },
): SellListing[] {
  const query = options.q?.trim().toLowerCase() ?? '';
  const category = options.category?.trim() ?? '';
  const seller = options.seller?.trim() ?? '';

  let next = items;

  if (seller) {
    next = next.filter((item) => item.sellerId === seller);
  }

  if (category) {
    next = next.filter((item) => parseSellCategory(item.category) === category);
  }

  if (query) {
    next = next.filter((item) => {
      const haystack = [item.title, item.sellerName, item.description].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }

  const sort = options.sort ?? 'newest';
  return [...next].sort((a, b) => compareSellListings(a, b, sort));
}

function compareSellListings(a: SellListing, b: SellListing, sort: SellSort): number {
  const aClosed = isListingClosed(a);
  const bClosed = isListingClosed(b);
  if (aClosed !== bClosed) return aClosed ? 1 : -1;

  if (sort === 'newest') {
    const byCreated = listingCreatedAtMs(b) - listingCreatedAtMs(a);
    if (byCreated !== 0) return byCreated;
    return b.id.localeCompare(a.id);
  }
  if (sort === 'price-asc') return a.salePrice - b.salePrice;
  if (sort === 'price-desc') return b.salePrice - a.salePrice;

  const byDeadline = a.deadline.localeCompare(b.deadline);
  if (byDeadline !== 0) return byDeadline;
  return a.title.localeCompare(b.title, 'ko');
}

export function parseSellSort(value: string | undefined): SellSort {
  if (value === 'newest' || value === 'price-asc' || value === 'price-desc' || value === 'deadline') {
    return value;
  }
  return 'newest';
}

export function sellCategoryLabel(category: SellCategory | string | undefined): string {
  return SELL_CATEGORY_LABELS[parseSellCategory(category)];
}
