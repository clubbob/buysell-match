'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import PageBack from '@/components/ui/PageBack';
import PageIntro from '@/components/ui/PageIntro';
import SellBuyerInquiryForm from '@/features/mypage/SellBuyerInquiryForm';
import { useAuth } from '@/features/auth/auth-context';
import { mypageHref, mypageSellInquiryHref } from '@/lib/mypage-nav';
import { useSellListings } from '@/features/sell/use-sell-listings';

export default function SellInquiryWrite({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { items, ready } = useSellListings();
  const title = useMemo(() => items.find((item) => item.id === listingId)?.title ?? '상품', [items, listingId]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && listingId && !items.some((item) => item.id === listingId)) {
      setError('없는 상품입니다.');
    }
  }, [ready, listingId, items]);

  if (!user) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  if (!listingId) {
    return (
      <div className="space-y-5">
        <PageIntro title="상품 문의" description="구매 신청한 상품에 문의를 남깁니다.">
          <PageBack href={mypageHref('buy')} />
        </PageIntro>
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          상품을 확인해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageIntro title="상품 문의" description="구매 신청한 상품에 문의를 남깁니다.">
        <PageBack href={mypageHref('buy')} />
      </PageIntro>

      <article className="panel px-4 py-5 sm:px-6 sm:py-6">
        <h2 className="text-lg font-bold text-ink">{ready ? title : '불러오는 중…'}</h2>
        <p className="mt-1 text-sm text-muted">상품 문의</p>

        {error ? (
          <p className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : (
          <div className="mt-5 border-t border-line pt-5">
            <SellBuyerInquiryForm
              listingId={listingId}
              buyerId={user.uid}
              showHistory={false}
              onCreated={(inquiry) => router.replace(mypageSellInquiryHref(inquiry.id))}
            />
          </div>
        )}
      </article>
    </div>
  );
}
