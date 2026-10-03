import type { StatTile } from '@/features/mypage/mypage-status-board-ui';
import { skeletonTile } from '@/features/mypage/mypage-status-board-ui';
import type { BuyDashboardStats } from '@/lib/buy-dashboard-stats';
import {
  SITE_INQUIRY_CATEGORY_ORDER,
  siteInquiryCategoryLabel,
  type SellInquiryDashboardStats,
  type SiteInquiryDashboardStats,
} from '@/lib/inquiry-dashboard-stats';
import type { SellDashboardStats } from '@/lib/sell-dashboard-stats';

export function buildSellDashboardTiles(
  stats: SellDashboardStats | null,
  ready: boolean,
): { product: StatTile[]; pipeline: StatTile[] } {
  if (!ready || !stats) {
    return {
      product: [skeletonTile('listings', '등록'), skeletonTile('recruiting', '모집 중'), skeletonTile('closed', '마감')],
      pipeline: [
        skeletonTile('open', '구매 신청'),
        skeletonTile('confirmed', '판매 확정'),
        skeletonTile('payment-pending', '입금 대기'),
        skeletonTile('payment-done', '결제 완료'),
        skeletonTile('shipping-pending', '배송 대기'),
        skeletonTile('shipping-done', '배송 완료'),
      ],
    };
  }

  return {
    product: [
      { key: 'listings', label: '등록', value: stats.listingCount, sub: '건', tone: 'neutral' },
      { key: 'recruiting', label: '모집 중', value: stats.recruitingCount, sub: '건', tone: 'info' },
      { key: 'closed', label: '마감', value: stats.closedCount, sub: '건', tone: 'muted' },
    ],
    pipeline: [
      {
        key: 'open',
        label: '구매 신청',
        value: stats.openJoinCount,
        sub: '건',
        tone: stats.openJoinCount > 0 ? 'warn' : 'muted',
      },
      {
        key: 'confirmed',
        label: '판매 확정',
        value: stats.confirmedJoinCount,
        sub: '건',
        tone: stats.confirmedJoinCount > 0 ? 'info' : 'muted',
      },
      {
        key: 'payment-pending',
        label: '입금 대기',
        value: stats.paymentPendingCount,
        sub: '건',
        tone: stats.paymentPendingCount > 0 ? 'warn' : 'muted',
      },
      {
        key: 'payment-done',
        label: '결제 완료',
        value: stats.paymentDoneCount,
        sub: '건',
        tone: stats.paymentDoneCount > 0 ? 'success' : 'muted',
      },
      {
        key: 'shipping-pending',
        label: '배송 대기',
        value: stats.shippingPendingCount,
        sub: '건',
        tone: stats.shippingPendingCount > 0 ? 'warn' : 'muted',
      },
      {
        key: 'shipping-done',
        label: '배송 완료',
        value: stats.shippingDoneCount,
        sub: '건',
        tone: stats.shippingDoneCount > 0 ? 'success' : 'muted',
      },
    ],
  };
}

export function buildBuyDashboardTiles(
  stats: BuyDashboardStats | null,
  ready: boolean,
): { summary: StatTile[]; pipeline: StatTile[] } {
  if (!ready || !stats) {
    return {
      summary: [
        skeletonTile('total', '전체 신청'),
        skeletonTile('listings', '신청 상품'),
        skeletonTile('quantity', '신청 수량', '개'),
      ],
      pipeline: [
        skeletonTile('open', '구매 신청'),
        skeletonTile('confirmed', '판매 확정'),
        skeletonTile('payment-pending', '입금 대기'),
        skeletonTile('payment-done', '결제 완료'),
        skeletonTile('shipping-pending', '배송 대기'),
        skeletonTile('shipping-done', '배송 완료'),
      ],
    };
  }

  return {
    summary: [
      { key: 'total', label: '전체 신청', value: stats.totalJoinCount, sub: '건', tone: 'neutral' },
      { key: 'listings', label: '신청 상품', value: stats.uniqueListingCount, sub: '종', tone: 'info' },
      { key: 'quantity', label: '신청 수량', value: stats.totalQuantity, sub: '개', tone: 'muted' },
    ],
    pipeline: [
      {
        key: 'open',
        label: '구매 신청',
        value: stats.openJoinCount,
        sub: '건',
        tone: stats.openJoinCount > 0 ? 'info' : 'muted',
      },
      {
        key: 'confirmed',
        label: '판매 확정',
        value: stats.confirmedJoinCount,
        sub: '건',
        tone: stats.confirmedJoinCount > 0 ? 'info' : 'muted',
      },
      {
        key: 'payment-pending',
        label: '입금 대기',
        value: stats.paymentPendingCount,
        sub: '건',
        tone: stats.paymentPendingCount > 0 ? 'warn' : 'muted',
      },
      {
        key: 'payment-done',
        label: '결제 완료',
        value: stats.paymentDoneCount,
        sub: '건',
        tone: stats.paymentDoneCount > 0 ? 'success' : 'muted',
      },
      {
        key: 'shipping-pending',
        label: '배송 대기',
        value: stats.shippingPendingCount,
        sub: '건',
        tone: stats.shippingPendingCount > 0 ? 'warn' : 'muted',
      },
      {
        key: 'shipping-done',
        label: '배송 완료',
        value: stats.shippingDoneCount,
        sub: '건',
        tone: stats.shippingDoneCount > 0 ? 'success' : 'muted',
      },
    ],
  };
}

export function buildSiteInquiryDashboardTiles(
  stats: SiteInquiryDashboardStats | null,
  ready: boolean,
): { summary: StatTile[]; detail: StatTile[] } {
  if (!ready || !stats) {
    return {
      summary: [skeletonTile('total', '전체'), skeletonTile('waiting', '답변 대기'), skeletonTile('answered', '답변 완료')],
      detail: SITE_INQUIRY_CATEGORY_ORDER.map((category) => skeletonTile(category, siteInquiryCategoryLabel(category))),
    };
  }

  return {
    summary: [
      { key: 'total', label: '전체', value: stats.totalCount, sub: '건', tone: 'neutral' },
      {
        key: 'waiting',
        label: '답변 대기',
        value: stats.waitingCount,
        sub: '건',
        tone: stats.waitingCount > 0 ? 'warn' : 'muted',
      },
      {
        key: 'answered',
        label: '답변 완료',
        value: stats.answeredCount,
        sub: '건',
        tone: stats.answeredCount > 0 ? 'success' : 'muted',
      },
    ],
    detail: SITE_INQUIRY_CATEGORY_ORDER.map((category) => ({
      key: category,
      label: siteInquiryCategoryLabel(category),
      value: stats.categoryCounts[category],
      sub: '건',
      tone: stats.categoryCounts[category] > 0 ? 'info' : 'muted',
    })),
  };
}

export function buildSellInquiryDashboardTiles(
  stats: SellInquiryDashboardStats | null,
  ready: boolean,
): { summary: StatTile[]; detail: StatTile[] } {
  if (!ready || !stats) {
    return {
      summary: [skeletonTile('total', '전체'), skeletonTile('waiting', '답변 대기'), skeletonTile('answered', '답변 완료')],
      detail: [
        skeletonTile('listings', '문의 상품', '종'),
        skeletonTile('waiting-listings', '대기 상품', '종'),
        skeletonTile('answered-listings', '완료 상품', '종'),
      ],
    };
  }

  return {
    summary: [
      { key: 'total', label: '전체', value: stats.totalCount, sub: '건', tone: 'neutral' },
      {
        key: 'waiting',
        label: '답변 대기',
        value: stats.waitingCount,
        sub: '건',
        tone: stats.waitingCount > 0 ? 'warn' : 'muted',
      },
      {
        key: 'answered',
        label: '답변 완료',
        value: stats.answeredCount,
        sub: '건',
        tone: stats.answeredCount > 0 ? 'success' : 'muted',
      },
    ],
    detail: [
      { key: 'listings', label: '문의 상품', value: stats.listingCount, sub: '종', tone: 'info' },
      {
        key: 'waiting-listings',
        label: '대기 상품',
        value: stats.waitingListingCount,
        sub: '종',
        tone: stats.waitingListingCount > 0 ? 'warn' : 'muted',
      },
      {
        key: 'answered-listings',
        label: '완료 상품',
        value: stats.answeredListingCount,
        sub: '종',
        tone: stats.answeredListingCount > 0 ? 'success' : 'muted',
      },
    ],
  };
}

export function buildMemberDashboardTiles(
  members: number,
  buyers: number,
  sellers: number,
): StatTile[] {
  return [
    { key: 'members', label: '가입 회원', value: members, sub: '명', tone: 'neutral' },
    { key: 'buyers', label: '구매자', value: buyers, sub: '명', tone: 'info' },
    { key: 'sellers', label: '판매자', value: sellers, sub: '명', tone: 'muted' },
  ];
}
