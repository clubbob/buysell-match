'use client';

import SellListPanel from '@/components/ui/SellListPanel';
import type { SellListing } from '@/types/sell';

export default function MyPageSellPosts({
  listings,
  ready,
  onSellCreate,
}: {
  listings: SellListing[];
  ready: boolean;
  onSellCreate?: () => void;
}) {
  if (!ready) {
    return <p className="px-4 py-10 text-center text-sm text-muted">불러오는 중…</p>;
  }

  if (listings.length === 0) {
    return (
      <div className="px-4 py-10 text-center sm:px-5">
        <p className="text-sm text-muted">아직 올린 판매 상품이 없습니다.</p>
        {onSellCreate ? (
          <button type="button" className="btn-primary mt-4 inline-flex" onClick={onSellCreate}>
            판매 상품 등록
          </button>
        ) : null}
      </div>
    );
  }

  return <SellListPanel embedded hideDeadline from="mypage" items={listings} />;
}
