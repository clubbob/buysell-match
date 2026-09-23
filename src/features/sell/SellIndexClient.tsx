'use client';

import Link from 'next/link';
import PageIntro from '@/components/ui/PageIntro';
import SellListPanel from '@/components/ui/SellListPanel';
import { useAuth } from '@/features/auth/auth-context';
import { useUserMode } from '@/features/mode/mode-context';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { loginHref } from '@/lib/auth-redirect';

export default function SellIndexClient({ seller }: { seller?: string }) {
  const { user } = useAuth();
  const { mode, ready: modeReady } = useUserMode();
  const { items, ready } = useSellListings();
  const filtered = seller ? items.filter((item) => item.sellerId === seller) : items;
  const sellerName = filtered[0]?.sellerName;
  const showSellCreate = modeReady && (!user || mode === 'seller');

  return (
    <div className="space-y-5">
      <PageIntro
        title="팝니다"
        description={
          seller && sellerName
            ? `${sellerName}이(가) 올린 상품입니다.`
            : '판매자가 올린 상품입니다. 사진과 판매자를 함께 확인합니다.'
        }
      >
        {seller ? (
          <Link href="/sell" className="btn-secondary">
            전체 보기
          </Link>
        ) : showSellCreate ? (
          <Link href={user ? '/sell/new' : loginHref('seller')} className="btn-primary">
            팝니다 등록
          </Link>
        ) : null}
      </PageIntro>
      {ready ? (
        <SellListPanel
          title={sellerName && seller ? sellerName : '전체'}
          description={seller ? '이 판매자의 팝니다' : '올라온 팝니다'}
          items={filtered}
        />
      ) : (
        <p className="text-sm text-muted">불러오는 중…</p>
      )}
    </div>
  );
}
