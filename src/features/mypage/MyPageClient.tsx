'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import PageIntro from '@/components/ui/PageIntro';
import { useAuth } from '@/features/auth/auth-context';
import { useBuyerProfile } from '@/features/buyer/use-buyer-profile';
import MyPageInquiries from '@/features/mypage/MyPageInquiries';
import MyPageMarketingConsent from '@/features/mypage/MyPageMarketingConsent';
import MyPageSiteInquiries from '@/features/mypage/MyPageSiteInquiries';
import MyPageBuyJoins from '@/features/mypage/MyPageBuyJoins';
import MyPageSellPosts from '@/features/mypage/MyPageSellPosts';
import { useSellListings } from '@/features/sell/use-sell-listings';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { mypageHref } from '@/lib/mypage-nav';
import { cn } from '@/lib/utils';
import { BUYER_DETAIL_LABEL, SELLER_DETAIL_LABEL } from '@/lib/profile-labels';
import { hasBuyerProfile } from '@/types/buyer';
import { formatMemberJoinedAt } from '@/types/member';
import { isSellerProfileComplete } from '@/types/seller';

type MyPageTab = 'info' | 'inquiries' | 'sell' | 'buy';

const MY_PAGE_TABS: { id: MyPageTab; label: string }[] = [
  { id: 'info', label: '내 정보' },
  { id: 'sell', label: '나의 판매 상품 현황' },
  { id: 'buy', label: '나의 구매 현황' },
  { id: 'inquiries', label: '문의' },
];

function parseMyPageTab(value: string | null): MyPageTab | null {
  if (value === 'info' || value === 'inquiries' || value === 'sell' || value === 'buy') {
    return value;
  }
  return null;
}

function myPageTabClass(active: boolean) {
  return cn(
    'min-h-10 rounded-sm px-1.5 text-center text-[11px] font-semibold leading-tight transition-colors sm:px-2 sm:text-xs',
    active ? 'bg-white text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:bg-white/70 hover:text-ink',
  );
}

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

export default function MyPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { mine, items, ready } = useSellListings();
  const { profile, ready: profileReady } = useSellerProfile(user?.uid);
  const { profile: buyerProfile, ready: buyerReady } = useBuyerProfile(user?.uid);
  const tab = parseMyPageTab(searchParams.get('tab')) ?? 'info';

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  const myListings = mine(user.uid);
  const canPostSell = profileReady && isSellerProfileComplete(profile);
  const buyerDetail = !buyerReady
    ? '불러오는 중…'
    : hasBuyerProfile(buyerProfile)
      ? `${buyerProfile.buyerPhone} · 배송 주소 ${buyerProfile.addresses.length}곳`
      : '아직 등록하지 않았습니다.';
  const sellerDetail = !profileReady
    ? '불러오는 중…'
    : profile
      ? [profile.sellerName, profile.representativeName, profile.businessNumber, profile.businessAddress]
          .filter(Boolean)
          .join(' · ')
      : '아직 등록하지 않았습니다.';
  const joinedAt = formatMemberJoinedAt(user.metadata.creationTime);
  const memberDetail = [user.displayName || '이름 없음', user.email || '—', joinedAt ? `가입 ${joinedAt}` : null]
    .filter(Boolean)
    .join(' · ');

  const tabDescription =
    tab === 'info'
      ? '회원 정보와 구매·판매 상세 등록을 관리합니다.'
      : tab === 'inquiries'
        ? '서비스 문의와 받은 상품 문의를 확인합니다.'
        : tab === 'sell'
          ? '나의 판매 상품과 판매 진행 현황을 확인합니다.'
          : '나의 구매 신청 현황을 확인합니다.';

  return (
    <div className="space-y-5">
      <PageIntro title="마이페이지" description={tabDescription}>
        {tab === 'sell' && canPostSell ? (
          <Link href="/sell/new" className="btn-primary">
            판매 상품 등록
          </Link>
        ) : null}
      </PageIntro>

      <div
        role="tablist"
        aria-label="마이페이지 메뉴"
        className="grid grid-cols-2 gap-1 rounded-sm border border-line bg-slate-100 p-1 sm:grid-cols-4"
      >
        {MY_PAGE_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => router.replace(mypageHref(item.id), { scroll: false })}
            className={myPageTabClass(tab === item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="panel overflow-hidden">
        {tab === 'info' ? (
          <div className="px-4 py-5 sm:px-5">
            <h2 className="text-sm font-bold text-ink">회원 정보</h2>
            <div className="mt-4">
                <div className="-mx-4 border-t border-line px-4 py-4 first:border-t-0 first:pt-0 sm:-mx-5 sm:px-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-ink">기본 정보</h3>
                      <div className="mt-1 flex items-center gap-x-4 text-sm text-muted">
                        <p className="min-w-0 truncate">{memberDetail}</p>
                        <MyPageMarketingConsent />
                      </div>
                    </div>
                    <Link href="/mypage/password" className="btn-secondary shrink-0">
                      비밀번호 변경
                    </Link>
                  </div>
                </div>
                <SummaryRow
                  title={BUYER_DETAIL_LABEL}
                  detail={buyerDetail}
                  href="/buyer/profile"
                  action={hasBuyerProfile(buyerProfile) ? '보기' : '등록'}
                />
                <SummaryRow
                  title={SELLER_DETAIL_LABEL}
                  detail={sellerDetail}
                  href="/seller/profile"
                  action={profile ? '보기' : '등록'}
                />
            </div>
          </div>
        ) : null}

        {tab === 'inquiries' ? (
          <div className="space-y-5 p-4 sm:p-5">
            <MyPageSiteInquiries embedded />
            <MyPageInquiries sellerId={user.uid} listings={myListings} embedded />
          </div>
        ) : null}

        {tab === 'sell' ? <MyPageSellPosts listings={myListings} ready={ready} /> : null}

        {tab === 'buy' ? <MyPageBuyJoins buyerId={user.uid} listings={items} /> : null}
      </section>
    </div>
  );
}
