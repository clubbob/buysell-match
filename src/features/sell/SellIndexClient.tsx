'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import PageIntro from '@/components/ui/PageIntro';
import SellListFilters from '@/components/ui/SellListFilters';
import SellListPagination from '@/components/ui/SellListPagination';
import SellListPanel from '@/components/ui/SellListPanel';
import { useAuth } from '@/features/auth/auth-context';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { loginHref } from '@/lib/auth-redirect';
import { alertAndGoToSellerProfile, SELL_CREATE_PATH } from '@/lib/profile-gate';
import { isSellerProfileComplete } from '@/types/seller';
import { filterSellListings, parseSellSort } from '@/lib/sell-filters';
import { paginateItems, parseSellListPage, sellListHref } from '@/lib/sell-pagination';
import { SELL_CATEGORY_LABELS } from '@/types/sell-category';

export default function SellIndexClient({
  seller,
  q = '',
  category = '',
  sort,
  page,
}: {
  seller?: string;
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, ready: profileReady } = useSellerProfile(user?.uid);
  const { items, ready } = useSellListings();
  const canPostSell = profileReady && isSellerProfileComplete(profile);

  function handleSellCreateClick() {
    if (!user) {
      router.push(loginHref(SELL_CREATE_PATH));
      return;
    }
    if (canPostSell) {
      router.push(SELL_CREATE_PATH);
      return;
    }
    alertAndGoToSellerProfile(router);
  }
  const parsedSort = parseSellSort(sort);
  const parsedPage = parseSellListPage(page);
  const filtered = useMemo(
    () => filterSellListings(items, { q, category, sort: parsedSort, seller }),
    [items, q, category, parsedSort, seller],
  );
  const paged = useMemo(() => paginateItems(filtered, parsedPage), [filtered, parsedPage]);
  const listHref = (nextPage: number) =>
    sellListHref({ seller, q, category, sort: parsedSort, page: nextPage });
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
          <button type="button" className="btn-primary" onClick={handleSellCreateClick}>
            판매 상품 등록
          </button>
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
                ? '진행 중 상품을 먼저 보여 줍니다.'
                : '진행 중인 판매 상품'
          }
          items={paged.items}
          footer={
            <SellListPagination
              page={paged.page}
              totalPages={paged.totalPages}
              total={paged.total}
              hrefForPage={listHref}
            />
          }
        />
      ) : (
        <p className="text-sm text-muted">불러오는 중…</p>
      )}
    </div>
  );
}
