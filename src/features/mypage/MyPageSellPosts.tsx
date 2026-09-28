'use client';

import SellListPanel from '@/components/ui/SellListPanel';
import type { SellListing } from '@/types/sell';

export default function MyPageSellPosts({ listings, ready }: { listings: SellListing[]; ready: boolean }) {
  if (!ready) {
    return <p className="px-4 py-10 text-center text-sm text-muted">불러오는 중…</p>;
  }

  if (listings.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-muted">아직 올린 팝니다가 없습니다.</p>;
  }

  return <SellListPanel embedded hideDeadline from="mypage" items={listings} />;
}
