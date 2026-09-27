import { hasBuyerProfile } from '@/types/buyer';
import { formatMemberJoinedAt, type MemberRecord } from '@/types/member';
import { hasSellerProfile } from '@/types/seller';

export const SEOUL_TZ = 'Asia/Seoul';

export type SignupTrendPoint = {
  date: string;
  label: string;
  count: number;
};

export type DashboardRecentMember = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
};

export type AdminDashboardData = {
  totals: {
    members: number;
    week: number;
    buyers: number;
    sellers: number;
  };
  trend: SignupTrendPoint[];
  recent: DashboardRecentMember[];
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

export function buildAdminDashboard(items: MemberRecord[], days = 14, now = new Date()): AdminDashboardData {
  const today = seoulDateKey(now);
  const start = addSeoulDays(today, -(days - 1));
  const weekStart = addSeoulDays(today, -6);
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = memberDayKey(item.member.createdAt);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const trend: SignupTrendPoint[] = [];
  for (let cursor = start; cursor <= today; cursor = addSeoulDays(cursor, 1)) {
    trend.push({
      date: cursor,
      label: seoulDayLabel(cursor),
      count: counts.get(cursor) ?? 0,
    });
  }

  const week = [...counts.entries()].reduce((sum, [key, count]) => (key >= weekStart ? sum + count : sum), 0);

  return {
    totals: {
      members: items.length,
      week,
      buyers: items.filter((item) => hasBuyerProfile(item.buyer)).length,
      sellers: items.filter((item) => hasSellerProfile(item.seller)).length,
    },
    trend,
    recent: items.slice(0, 5).map((item) => ({
      id: item.member.id,
      name: item.member.name || item.member.email || '이름 없음',
      email: item.member.email,
      joinedAt: formatMemberJoinedAt(item.member.createdAt),
    })),
  };
}
