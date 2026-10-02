import { listDocuments } from '@/lib/firebase-rest-admin';
import { hasBuyerProfile } from '@/types/buyer';
import type { MemberRecord } from '@/types/member';
import { hasSellerProfile } from '@/types/seller';

export const SEOUL_TZ = 'Asia/Seoul';

export type SignupTrendPoint = {
  date: string;
  label: string;
  count: number;
};

export type DashboardSeries = {
  members: SignupTrendPoint[];
  buyers: SignupTrendPoint[];
  sellers: SignupTrendPoint[];
  listings: SignupTrendPoint[];
  joinsOpen: SignupTrendPoint[];
  inquiries: SignupTrendPoint[];
  inquiriesWaiting: SignupTrendPoint[];
};

export type AdminDashboardData = {
  totals: {
    members: number;
    buyers: number;
    sellers: number;
    listings: number;
    joinsOpen: number;
    inquiries: number;
    inquiriesWaiting: number;
  };
  trend: SignupTrendPoint[];
  series: DashboardSeries;
};

type ServiceDocs = {
  listings: { data: Record<string, unknown> }[];
  sellJoins: { data: Record<string, unknown> }[];
  inquiries: { data: Record<string, unknown> }[];
};

function seoulDateKey(value: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
}

function seoulDayLabel(key: string): string {
  const [, month, day] = key.split('-');
  return `${Number(month)}.${Number(day)}`;
}

function addSeoulDays(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-${String(next.getUTCDate()).padStart(2, '0')}`;
}

function memberDayKey(createdAt: string): string {
  if (!createdAt.trim()) return '';
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return '';
  return seoulDateKey(parsed);
}

function emptySeries(): DashboardSeries {
  const empty: SignupTrendPoint[] = [];
  return {
    members: empty,
    buyers: empty,
    sellers: empty,
    listings: empty,
    joinsOpen: empty,
    inquiries: empty,
    inquiriesWaiting: empty,
  };
}

export async function loadServiceDocuments(): Promise<ServiceDocs> {
  try {
    const [listings, sellJoins, inquiries] = await Promise.all([
      listDocuments('sellListings'),
      listDocuments('sellJoins'),
      listDocuments('sellInquiries'),
    ]);
    return { listings, sellJoins, inquiries };
  } catch {
    return { listings: [], sellJoins: [], inquiries: [] };
  }
}

function seriesFromDays(keys: string[], start: string, today: string): SignupTrendPoint[] {
  const counts = new Map<string, number>();
  for (const key of keys) {
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const points: SignupTrendPoint[] = [];
  for (let cursor = start; cursor <= today; cursor = addSeoulDays(cursor, 1)) {
    points.push({
      date: cursor,
      label: seoulDayLabel(cursor),
      count: counts.get(cursor) ?? 0,
    });
  }
  return points;
}

function docDay(data: Record<string, unknown>, fallback: string) {
  return memberDayKey(String(data.createdAt ?? '')) || fallback;
}

export function buildAdminDashboard(
  items: MemberRecord[],
  docs: ServiceDocs,
  days = 14,
  now = new Date(),
): AdminDashboardData {
  const today = seoulDateKey(now);
  const start = addSeoulDays(today, -(days - 1));

  const memberDays = items.map((item) => memberDayKey(item.member.createdAt)).filter(Boolean);
  const members = seriesFromDays(memberDays, start, today);
  const buyerItems = items.filter((item) => hasBuyerProfile(item.buyer));
  const sellerItems = items.filter((item) => hasSellerProfile(item.seller));
  const buyers = seriesFromDays(
    buyerItems.map((item) => memberDayKey(item.member.createdAt)).filter(Boolean),
    start,
    today,
  );
  const sellers = seriesFromDays(
    sellerItems.map((item) => memberDayKey(item.member.createdAt)).filter(Boolean),
    start,
    today,
  );
  const listings = seriesFromDays(
    docs.listings.map((entry) => docDay(entry.data, today)),
    start,
    today,
  );
  const openJoins = docs.sellJoins.filter((entry) => String(entry.data.status ?? 'open') !== 'confirmed');
  const joinsOpen = seriesFromDays(
    openJoins.map((entry) => docDay(entry.data, today)),
    start,
    today,
  );
  const inquiries = seriesFromDays(
    docs.inquiries.map((entry) => docDay(entry.data, today)),
    start,
    today,
  );
  const waiting = docs.inquiries.filter((entry) => !String(entry.data.answer ?? '').trim());
  const inquiriesWaiting = seriesFromDays(
    waiting.map((entry) => docDay(entry.data, today)),
    start,
    today,
  );

  const series = { members, buyers, sellers, listings, joinsOpen, inquiries, inquiriesWaiting };

  return {
    totals: {
      members: items.length,
      buyers: buyerItems.length,
      sellers: sellerItems.length,
      listings: docs.listings.length,
      joinsOpen: openJoins.length,
      inquiries: docs.inquiries.length,
      inquiriesWaiting: waiting.length,
    },
    trend: members,
    series,
  };
}

export function emptyDashboard(): AdminDashboardData {
  return {
    totals: { members: 0, buyers: 0, sellers: 0, listings: 0, joinsOpen: 0, inquiries: 0, inquiriesWaiting: 0 },
    trend: [],
    series: emptySeries(),
  };
}
