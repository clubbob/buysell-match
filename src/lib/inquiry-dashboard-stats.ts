import { isInquiryAnswered, type SellInquiry } from '@/types/sell-inquiry';
import {
  isSiteInquiryAnswered,
  SITE_INQUIRY_CATEGORY_LABELS,
  type SiteInquiry,
  type SiteInquiryCategory,
} from '@/types/site-inquiry';

export type InquiryDashboardStats = {
  totalCount: number;
  waitingCount: number;
  answeredCount: number;
};

export type SiteInquiryDashboardStats = InquiryDashboardStats & {
  categoryCounts: Record<SiteInquiryCategory, number>;
};

export type SellInquiryDashboardStats = InquiryDashboardStats & {
  listingCount: number;
  waitingListingCount: number;
  answeredListingCount: number;
};

function baseInquiryStats<T>(items: T[], isAnswered: (item: T) => boolean): InquiryDashboardStats {
  const waiting = items.filter((item) => !isAnswered(item));
  return {
    totalCount: items.length,
    waitingCount: waiting.length,
    answeredCount: items.length - waiting.length,
  };
}

export function computeSiteInquiryDashboardStats(items: SiteInquiry[]): SiteInquiryDashboardStats {
  const base = baseInquiryStats(items, isSiteInquiryAnswered);
  const categoryCounts: Record<SiteInquiryCategory, number> = {
    service: 0,
    account: 0,
    trade: 0,
    other: 0,
  };

  for (const item of items) {
    categoryCounts[item.category] += 1;
  }

  return { ...base, categoryCounts };
}

export function computeSellInquiryDashboardStats(items: SellInquiry[]): SellInquiryDashboardStats {
  const base = baseInquiryStats(items, isInquiryAnswered);
  const listingIds = new Set(items.map((item) => item.listingId));
  const waitingListingIds = new Set(items.filter((item) => !isInquiryAnswered(item)).map((item) => item.listingId));
  const answeredListingIds = new Set(items.filter((item) => isInquiryAnswered(item)).map((item) => item.listingId));

  return {
    ...base,
    listingCount: listingIds.size,
    waitingListingCount: waitingListingIds.size,
    answeredListingCount: answeredListingIds.size,
  };
}

export const SITE_INQUIRY_CATEGORY_ORDER: SiteInquiryCategory[] = ['service', 'account', 'trade', 'other'];

export function siteInquiryCategoryLabel(category: SiteInquiryCategory): string {
  return SITE_INQUIRY_CATEGORY_LABELS[category];
}
