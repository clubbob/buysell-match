import type { BuyListing } from '@/types/buy';

export function filterBuyListings(items: BuyListing[], q?: string): BuyListing[] {
  const query = q?.trim().toLowerCase() ?? '';
  if (!query) return items;
  return items.filter((item) => {
    const haystack = [item.title, item.buyerName, item.description].join(' ').toLowerCase();
    return haystack.includes(query);
  });
}
