import { inferListingCreatedAtMs } from '@/lib/sell-listing-time';
import { parseSellCategory } from '@/types/sell-category';
import { withSellSource, type SellListing } from '@/types/sell';

function resolveListingCreatedAt(item: SellListing): string {
  const stored = item.createdAt?.trim();
  if (stored && !Number.isNaN(Date.parse(stored))) return stored;
  const inferred = inferListingCreatedAtMs(item);
  return inferred > 0 ? new Date(inferred).toISOString() : '';
}

export function normalizeSellListings(items: SellListing[]): SellListing[] {
  return items.map((item) =>
    withSellSource({
      ...item,
      category: parseSellCategory(item.category),
      createdAt: resolveListingCreatedAt(item),
      introImages: item.introImages ?? [],
      composition: item.composition ?? '',
      specification: item.specification ?? '',
      origin: item.origin ?? '',
      certification: item.certification ?? '',
      shippingFee: item.shippingFee ?? '',
      shippingGuide: item.shippingGuide ?? '',
      returnPolicy: item.returnPolicy ?? '',
      specText: item.specText ?? '',
      tradeText: item.tradeText ?? '',
      closedAt: item.closedAt ?? '',
      depositBank: item.depositBank ?? '',
      depositAccount: item.depositAccount ?? '',
      depositHolder: item.depositHolder ?? '',
    }),
  );
}

export function findSellListing(id: string, items: SellListing[]): SellListing | undefined {
  return normalizeSellListings(items).find((item) => item.id === id);
}
