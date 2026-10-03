'use client';

import Link from 'next/link';
import MyPageBuyStatusBoard from '@/features/mypage/MyPageBuyStatusBoard';
import MyPageInquiryStatusBoard from '@/features/mypage/MyPageInquiryStatusBoard';
import MyPageSellStatusBoard from '@/features/mypage/MyPageSellStatusBoard';
import {
  DashboardMemberStrip,
  DashboardSection,
  DashboardShell,
  ProfileStatCell,
} from '@/features/mypage/mypage-status-board-ui';
import { mypageHref } from '@/lib/mypage-nav';
import { BUYER_DETAIL_LABEL, SELLER_DETAIL_LABEL } from '@/lib/profile-labels';
import type { SellListing } from '@/types/sell';

export default function MyPageDashboard({
  userId,
  displayName,
  email,
  joinedAt,
  listings,
  sellReady,
  buyerRegistered,
  sellerRegistered,
}: {
  userId: string;
  displayName: string;
  email: string;
  joinedAt: string | null;
  listings: SellListing[];
  sellReady: boolean;
  buyerRegistered: boolean;
  sellerRegistered: boolean;
}) {
  const initial = (displayName || email || '?').trim().charAt(0).toUpperCase();

  return (
    <DashboardShell>
      <DashboardMemberStrip
        displayName={displayName}
        email={email}
        joinedAt={joinedAt}
        initial={initial}
      />

      <DashboardSection title="프로필" tone="profile" href={mypageHref('info')}>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <ProfileStatCell
            label="구매자"
            title={BUYER_DETAIL_LABEL}
            registered={buyerRegistered}
            href="/buyer/profile"
            variant="buyer"
          />
          <ProfileStatCell
            label="판매자"
            title={SELLER_DETAIL_LABEL}
            registered={sellerRegistered}
            href="/seller/profile"
            variant="seller"
          />
        </div>
        <p className="mt-2 text-center text-[11px] text-subtle">
          <Link href={mypageHref('info')} className="font-semibold text-ink underline-offset-2 hover:underline">
            회원 정보 관리
          </Link>
        </p>
      </DashboardSection>

      <MyPageSellStatusBoard
        sellerId={userId}
        listings={listings}
        listingsReady={sellReady}
        embedded
      />

      <MyPageBuyStatusBoard buyerId={userId} embedded />

      <MyPageInquiryStatusBoard userId={userId} embedded />
    </DashboardShell>
  );
}
