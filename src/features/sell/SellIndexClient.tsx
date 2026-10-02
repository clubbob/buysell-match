'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import PageIntro from '@/components/ui/PageIntro';
import SellListFilters from '@/components/ui/SellListFilters';
import SellListPanel from '@/components/ui/SellListPanel';
import { useAuth } from '@/features/auth/auth-context';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { loginHref } from '@/lib/auth-redirect';
import { filterSellListings, parseSellSort } from '@/lib/sell-filters';
import { SELL_CATEGORY_LABELS } from '@/types/sell-category';

export default function SellIndexClient({
  seller,
  q = '',
  category = '',
  sort,
}: {
  seller?: string;
  q?: string;
  category?: string;
  sort?: string;
}) {
  const { user } = useAuth();
  const { items, ready } = useSellListings();
  const parsedSort = parseSellSort(sort);
  const filtered = useMemo(
    () => filterSellListings(items, { q, category, sort: parsedSort, seller }),
    [items, q, category, parsedSort, seller],
  );
  const sellerName = filtered[0]?.sellerName ?? items.find((item) => item.sellerId === seller)?.sellerName;
  const showSellCreate = !seller;
  const categoryLabel = category ? SELL_CATEGORY_LABELS[category as keyof typeof SELL_CATEGORY_LABELS] : null;

  return (
    <div className="space-y-5">
      <PageIntro
        title="판매 상품"
        description={
          seller && sellerName
            ? `${sellerName}이(가) 올린 공동구매 상품입니다.`
            : categoryLabel
              ? `${categoryLabel} 카테고리 판매 상품입니다.`
              : '진행 중인 공동구매 상품입니다. 쿠팡·스마트스토어는 새 창으로, 유튜브는 상품 화면에서 확인할 수 있습니다.'
        }
      >
        {seller ? (
          <Link href="/sell" className="btn-secondary">
            전체 보기
          </Link>
        ) : showSellCreate ? (
          <Link href={user ? '/sell/new' : loginHref('/sell/new')} className="btn-primary">
            판매 상품 등록
          </Link>
        ) : null}
      </PageIntro>

      {!seller ? <SellListFilters q={q} category={category} sort={parsedSort} /> : null}

      {ready ? (
        <SellListPanel
          title={sellerName && seller ? sellerName : categoryLabel || (q.trim() ? `"${q.trim()}" 검색` : '전체')}
          description={
            seller
              ? '이 판매자의 판매 상품'
              : filtered.length > 0
                ? `${filtered.length.toLocaleString('ko-KR')}건`
                : '진행 중인 판매 상품'
          }
          items={filtered}
        />
      ) : (
        <p className="text-sm text-muted">불러오는 중…</p>
      )}
    </div>
  );
}
