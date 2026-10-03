import { loadAdminSellInquiries } from '@/lib/admin-sell-inquiries-data';
import { loadAdminSellJoins } from '@/lib/admin-joins-data';
import { loadAdminSellListings } from '@/lib/admin-listings-data';
import { loadAdminSiteInquiries } from '@/lib/admin-site-inquiries-data';
import { computeBuyDashboardStats, type BuyDashboardStats } from '@/lib/buy-dashboard-stats';
import {
  computeSellInquiryDashboardStats,
  computeSiteInquiryDashboardStats,
  type SellInquiryDashboardStats,
  type SiteInquiryDashboardStats,
} from '@/lib/inquiry-dashboard-stats';
import { computeSellDashboardStats, type SellDashboardStats } from '@/lib/sell-dashboard-stats';
import { hasBuyerProfile } from '@/types/buyer';
import type { MemberRecord } from '@/types/member';
import { hasSellerProfile } from '@/types/seller';
import type { SellInquiry } from '@/types/sell-inquiry';
import type { SellJoin } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';
import type { SiteInquiry } from '@/types/site-inquiry';

export type AdminDashboardMembers = {
  members: number;
  buyers: number;
  sellers: number;
};

export type AdminDashboardData = {
  members: AdminDashboardMembers;
  sell: SellDashboardStats;
  buy: BuyDashboardStats;
  siteInquiry: SiteInquiryDashboardStats;
  sellInquiry: SellInquiryDashboardStats;
};

export type AdminDashboardInputs = {
  listings: SellListing[];
  joins: SellJoin[];
  sellInquiries: SellInquiry[];
  siteInquiries: SiteInquiry[];
};

export async function loadAdminDashboardInputs(): Promise<AdminDashboardInputs | null> {
  const [listings, joinRows, sellInquiryRows, siteInquiries] = await Promise.all([
    loadAdminSellListings(),
    loadAdminSellJoins(),
    loadAdminSellInquiries(),
    loadAdminSiteInquiries(),
  ]);

  if (listings == null || joinRows == null || sellInquiryRows == null || siteInquiries == null) {
    return null;
  }

  return {
    listings,
    joins: joinRows.map(({ listingTitle: _listingTitle, sellerName: _sellerName, ...join }) => join),
    sellInquiries: sellInquiryRows,
    siteInquiries,
  };
}

export function buildAdminDashboard(items: MemberRecord[], inputs: AdminDashboardInputs): AdminDashboardData {
  const buyerItems = items.filter((item) => hasBuyerProfile(item.buyer));
  const sellerItems = items.filter((item) => hasSellerProfile(item.seller));
  const { listings, joins, sellInquiries, siteInquiries } = inputs;

  return {
    members: {
      members: items.length,
      buyers: buyerItems.length,
      sellers: sellerItems.length,
    },
    sell: computeSellDashboardStats(listings, joins),
    buy: computeBuyDashboardStats(joins),
    siteInquiry: computeSiteInquiryDashboardStats(siteInquiries),
    sellInquiry: computeSellInquiryDashboardStats(sellInquiries),
  };
}

export function emptyDashboard(): AdminDashboardData {
  return {
    members: { members: 0, buyers: 0, sellers: 0 },
    sell: computeSellDashboardStats([], []),
    buy: computeBuyDashboardStats([]),
    siteInquiry: computeSiteInquiryDashboardStats([]),
    sellInquiry: computeSellInquiryDashboardStats([]),
  };
}
