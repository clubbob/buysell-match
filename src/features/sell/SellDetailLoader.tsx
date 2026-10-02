'use client';

import { useSellListings } from '@/features/sell/use-sell-listings';
import SellDetail from '@/features/sell/SellDetail';

export default function SellDetailLoader({ id, from, tab }: { id: string; from?: string; tab?: string }) {
  const { getById, ready, refreshRemaining, remove } = useSellListings();

  if (!ready) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  const item = getById(id);
  if (!item) {
    return <p className="panel px-4 py-10 text-center text-sm text-muted">없는 상품입니다.</p>;
  }

  return (
    <SellDetail
      item={item}
      from={from}
      tab={tab}
      onRemainingChange={refreshRemaining}
      onListingDeleted={() => remove(id)}
    />
  );
}
