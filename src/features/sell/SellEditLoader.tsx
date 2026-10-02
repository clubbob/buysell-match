'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageBack from '@/components/ui/PageBack';
import PageIntro from '@/components/ui/PageIntro';
import { useAuth } from '@/features/auth/auth-context';
import SellCreateForm from '@/features/sell/SellCreateForm';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { loginHref } from '@/lib/auth-redirect';
import { fetchSellJoins } from '@/lib/sell-join-remote';

export default function SellEditLoader({ id }: { id: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { getById, ready } = useSellListings();
  const item = ready ? getById(id) : undefined;
  const [hasJoins, setHasJoins] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace(loginHref(`/sell/${id}/edit`));
  }, [id, loading, router, user]);

  useEffect(() => {
    let cancelled = false;
    void fetchSellJoins(id)
      .then((joins) => {
        if (!cancelled) setHasJoins(joins.length > 0);
      })
      .catch(() => {
        if (!cancelled) setHasJoins(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading || !user || !ready || hasJoins == null) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  if (!item) {
    return <p className="panel px-4 py-10 text-center text-sm text-muted">없는 상품입니다.</p>;
  }

  if (item.sellerId !== user.uid) {
    return <p className="panel px-4 py-10 text-center text-sm text-muted">본인 상품만 수정할 수 있습니다.</p>;
  }

  if (hasJoins) {
    return (
      <div className="space-y-5">
        <PageBack href="/mypage?tab=sell">← 마이페이지</PageBack>
        <p className="panel px-4 py-10 text-center text-sm text-muted">공구 구매 신청이 있는 상품은 수정할 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageBack href="/mypage?tab=sell">← 마이페이지</PageBack>
      <PageIntro
        eyebrow="판매자"
        title="팝니다 수정"
        description="마감 전까지 여러 번 거래할 수 있습니다. 쿠팡·스마트스토어·유튜브 주소를 각각 넣을 수 있습니다."
      />
      <SellCreateForm listing={item} />
    </div>
  );
}
