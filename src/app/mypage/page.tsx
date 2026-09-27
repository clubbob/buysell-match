'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageIntro from '@/components/ui/PageIntro';
import { useAuth } from '@/features/auth/auth-context';
import { useBuyerProfile } from '@/features/buyer/use-buyer-profile';
import { useUserMode } from '@/features/mode/mode-context';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { formatWon } from '@/lib/sell-display';
import { USER_MODE_LABELS } from '@/lib/user-mode';
import { cn } from '@/lib/utils';
import { hasBuyerProfile } from '@/types/buyer';
import { formatMemberJoinedAt } from '@/types/member';
import { isSellerProfileComplete } from '@/types/seller';

type PostTab = 'sell' | 'buy';

function SummaryRow({
  title,
  detail,
  href,
  action,
}: {
  title: string;
  detail: string;
  href: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="-mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-4 first:border-t-0 first:pt-0 last:pb-0 hover:bg-slate-50 sm:-mx-5 sm:px-5"
    >
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-muted">{detail}</p>
      </div>
      <span className="text-sm font-semibold text-ink">{action}</span>
    </Link>
  );
}

export default function MyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { mode, setMode, resetMode } = useUserMode();
  const { mine, ready } = useSellListings();
  const { profile, ready: profileReady } = useSellerProfile(user?.uid);
  const { profile: buyerProfile, ready: buyerReady } = useBuyerProfile(user?.uid);
  const [postTab, setPostTab] = useState<PostTab>('sell');

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  const myListings = mine(user.uid);
  const canPostSell = profileReady && isSellerProfileComplete(profile);
  const canPostBuy = buyerReady && hasBuyerProfile(buyerProfile);
  const buyerDetail = !buyerReady
    ? '불러오는 중…'
    : hasBuyerProfile(buyerProfile)
      ? `${buyerProfile.buyerPhone} · 배송 주소 ${buyerProfile.addresses.length}곳`
      : '아직 등록하지 않았습니다.';
  const sellerDetail = !profileReady
    ? '불러오는 중…'
    : profile
      ? `${profile.sellerName} · ${profile.representativeName}`
      : '아직 등록하지 않았습니다.';
  const joinedAt = formatMemberJoinedAt(user.metadata.creationTime);
  const memberDetail = [user.displayName || '이름 없음', user.email || '—', joinedAt ? `가입 ${joinedAt}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="space-y-6">
      <PageIntro title="마이페이지" description={mode ? `${USER_MODE_LABELS[mode]}로 이용 중입니다.` : '이용 모드는 아래에서 고릅니다.'}>
        {canPostBuy || canPostSell ? (
          <div className="flex flex-wrap justify-end gap-2">
            {canPostBuy ? (
              <Link href="/buy/new" className="btn-secondary">
                삽니다 등록
              </Link>
            ) : null}
            {canPostSell ? (
              <Link href="/sell/new" className="btn-primary">
                팝니다 등록
              </Link>
            ) : null}
          </div>
        ) : null}
      </PageIntro>

      <section className="panel px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-ink">이용 모드</h2>
          <p className="text-sm text-muted">{mode ? USER_MODE_LABELS[mode] : '미선택'}</p>
        </div>
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

      <section className="panel px-4 py-5 sm:px-5">
        <h2 className="text-sm font-bold text-ink">회원 정보</h2>
        <div className="mt-4">
          <SummaryRow
            title="기본 정보"
            detail={memberDetail}
            href="/mypage/password"
            action="비밀번호 변경"
          />
          <SummaryRow
            title="구매자 이용 시"
            detail={buyerDetail}
            href="/buyer/profile"
            action={hasBuyerProfile(buyerProfile) ? '보기' : '등록'}
          />
          <SummaryRow
            title="판매자 이용 시"
            detail={sellerDetail}
            href="/seller/profile"
            action={profile ? '보기' : '등록'}
          />
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex border-b border-line">
          <button
            type="button"
            onClick={() => setPostTab('sell')}
            className={cn(
              'relative min-h-11 flex-1 px-4 text-sm font-semibold',
              postTab === 'sell' ? 'text-ink after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-ink' : 'text-muted',
            )}
          >
            팝니다 {ready ? myListings.length : ''}
          </button>
          <button
            type="button"
            onClick={() => setPostTab('buy')}
            className={cn(
              'relative min-h-11 flex-1 px-4 text-sm font-semibold',
              postTab === 'buy' ? 'text-ink after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-ink' : 'text-muted',
            )}
          >
            삽니다 0
          </button>
        </div>

        {postTab === 'sell' ? (
          ready && myListings.length > 0 ? (
            <ul className="divide-y divide-line">
              {myListings.map((item) => (
                <li key={item.id}>
                  <Link href={`/sell/${item.id}`} className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50">
                    <span className="min-w-0 truncate text-sm font-semibold text-ink">{item.title}</span>
                    <span className="shrink-0 text-sm tabular-nums text-ink">{formatWon(item.salePrice)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-muted">아직 올린 팝니다가 없습니다.</p>
          )
        ) : (
          <p className="px-4 py-10 text-center text-sm text-muted">아직 올린 삽니다가 없습니다.</p>
        )}
      </section>
    </div>
  );
}
