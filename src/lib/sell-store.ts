import { parseSellCategory } from '@/types/sell-category';
import { withSellSource, type SellListing } from '@/types/sell';

export function normalizeSellListings(items: SellListing[]): SellListing[] {
  return items.map((item) =>
    withSellSource({
      ...item,
      category: parseSellCategory(item.category),
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
