'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PageIntro from '@/components/ui/PageIntro';
import SellListPanel from '@/components/ui/SellListPanel';
import { useAuth } from '@/features/auth/auth-context';
import { useUserMode } from '@/features/mode/mode-context';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { USER_MODE_LABELS } from '@/lib/user-mode';
import { cn } from '@/lib/utils';
import { isSellerProfileComplete } from '@/types/seller';

export default function MyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { mode, setMode, resetMode } = useUserMode();
  const { mine, ready } = useSellListings();
  const { profile, ready: profileReady } = useSellerProfile(user?.uid);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  const myListings = mine(user.uid);

  return (
    <div className="space-y-6">
      <PageIntro title="마이페이지" description={user.email ?? ''} />

      <section className="panel px-4 py-5 sm:px-5">
        <h2 className="text-sm font-bold text-ink">서비스 이용 모드</h2>
        <p className="mt-1 text-sm text-muted">{mode ? `${USER_MODE_LABELS[mode]}로 이용 중입니다.` : '아직 고르지 않았습니다.'}</p>
        <div className="action-row mt-4">
          <button
            type="button"
            onClick={() => setMode('buyer')}
            className={cn(mode === 'buyer' ? 'btn-primary' : 'btn-secondary')}
          >
            구매자로 이용
          </button>
          <button
            type="button"
            onClick={() => setMode('seller')}
            className={cn(mode === 'seller' ? 'btn-primary' : 'btn-secondary')}
          >
            판매자로 이용
          </button>
          <button type="button" onClick={() => resetMode({ navigate: true })} className="btn-ghost">
            선택 해제
          </button>
        </div>
      </section>

      {mode === 'seller' ? (
        <section className="panel px-4 py-5 sm:px-5">
          <h2 className="text-sm font-bold text-ink">판매자 정보</h2>
          {profileReady && isSellerProfileComplete(profile) ? (
            <>
              <p className="mt-1 text-sm text-muted">
                {profile.sellerName} · {profile.representativeName}
              </p>
              <p className="mt-1 text-sm text-muted">
                {profile.businessNumber}
                {profile.businessVerified ? ' · 사업자 확인' : ''}
              </p>
              <p className="mt-1 text-sm text-muted">
                {profile.sellerPhone} · {profile.sellerEmail}
              </p>
              <div className="mt-4">
                <Link href="/seller/profile" className="btn-secondary">
                  수정
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted">팝니다를 올리기 전에 상호와 연락처를 등록해 주세요.</p>
              <div className="mt-4">
                <Link href="/seller/profile?next=/sell/new" className="btn-primary">
                  판매자 정보 등록
                </Link>
              </div>
            </>
          )}
        </section>
      ) : null}

      {mode === 'seller' ? (
        ready && myListings.length > 0 ? (
          <SellListPanel title="내가 올린 팝니다" description="계정에 저장된 글입니다." items={myListings} />
        ) : (
          <p className="panel px-4 py-10 text-center text-sm text-muted">아직 올린 팝니다가 없습니다.</p>
        )
      ) : null}

      {mode === 'buyer' ? (
        <p className="panel px-4 py-10 text-center text-sm text-muted">아직 올린 삽니다가 없습니다.</p>
      ) : null}
    </div>
  );
}
