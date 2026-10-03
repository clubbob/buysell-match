'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import PageIntro from '@/components/ui/PageIntro';
import Sparkline, { type SparkTone } from '@/features/admin/Sparkline';
import { readApiJson } from '@/lib/api-json';
import { BUYER_DETAIL_LABEL, SELLER_DETAIL_LABEL } from '@/lib/profile-labels';
import type { AdminDashboardData, SignupTrendPoint } from '@/lib/admin-dashboard';
import { cn } from '@/lib/utils';

const TONES = {
  members: { id: 'members', stroke: '#2563eb', fill: '#60a5fa', bar: '#3b82f6', grid: '#bfdbfe' },
  buyers: { id: 'buyers', stroke: '#4338ca', fill: '#818cf8', bar: '#6366f1', grid: '#c7d2fe' },
  sellers: { id: 'sellers', stroke: '#047857', fill: '#34d399', bar: '#10b981', grid: '#a7f3d0' },
  listings: { id: 'listings', stroke: '#0f766e', fill: '#2dd4bf', bar: '#14b8a6', grid: '#99f6e4' },
  joinsOpen: { id: 'joinsOpen', stroke: '#0369a1', fill: '#38bdf8', bar: '#0ea5e9', grid: '#bae6fd' },
  joinsConfirmed: { id: 'joinsConfirmed', stroke: '#6d28d9', fill: '#a78bfa', bar: '#8b5cf6', grid: '#ddd6fe' },
  sellInquiries: { id: 'sellInquiries', stroke: '#334155', fill: '#94a3b8', bar: '#64748b', grid: '#e2e8f0' },
  sellWaiting: { id: 'sellWaiting', stroke: '#9a3412', fill: '#fdba74', bar: '#f97316', grid: '#fed7aa' },
  siteInquiries: { id: 'siteInquiries', stroke: '#0f766e', fill: '#5eead4', bar: '#14b8a6', grid: '#99f6e4' },
  siteWaiting: { id: 'siteWaiting', stroke: '#be123c', fill: '#fb7185', bar: '#f43f5e', grid: '#fecdd3' },
} as const satisfies Record<string, SparkTone>;

const WASH: Record<keyof typeof TONES, string> = {
  members: 'bg-blue-50/80',
  buyers: 'bg-indigo-50/80',
  sellers: 'bg-emerald-50/80',
  listings: 'bg-teal-50/80',
  joinsOpen: 'bg-sky-50/80',
  joinsConfirmed: 'bg-violet-50/80',
  sellInquiries: 'bg-slate-50',
  sellWaiting: 'bg-orange-50/80',
  siteInquiries: 'bg-teal-50/60',
  siteWaiting: 'bg-rose-50/80',
};

function StatCard({
  label,
  value,
  points,
  tone,
  href,
}: {
  label: string;
  value: string;
  points?: SignupTrendPoint[];
  tone: keyof typeof TONES;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'panel block px-4 py-5 sm:px-5 transition-shadow hover:shadow-sm',
        WASH[tone],
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
      )}
    >
      <div className="flex items-end justify-between gap-3">
        <h2 className="text-base font-bold tracking-tight text-ink">{label}</h2>
        <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: TONES[tone].stroke }}>
          {value}
        </p>
      </div>
      <Sparkline points={points ?? []} tone={TONES[tone]} />
    </Link>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setReady(false);
    setPending(true);
    try {
      const response = await fetch('/api/admin/dashboard?days=14', { cache: 'no-store' });
      const payload = await readApiJson<{ ok?: boolean; data?: AdminDashboardData; message?: string }>(
        response,
        '대시보드를 불러오지 못했습니다.',
      );
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.message ?? '대시보드를 불러오지 못했습니다.');
      }
      setData(payload.data);
      setUpdatedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setError(null);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : '대시보드를 불러오지 못했습니다.');
    } finally {
      setReady(true);
      setPending(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-5">
      <PageIntro title="대시보드" description="서비스 전체 현황입니다.">
        <div className="flex items-center gap-2">
          {updatedAt ? <p className="text-xs tabular-nums text-muted">갱신 {updatedAt}</p> : null}
          <button type="button" className="btn-secondary" disabled={pending} onClick={() => void load(true)}>
            {pending ? '새로고침 중…' : '새로고침'}
          </button>
        </div>
      </PageIntro>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {!ready && !data ? (
        <p className="text-sm text-muted">불러오는 중…</p>
      ) : data ? (
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="가입 회원"
              value={`${data.totals.members ?? 0}명`}
              points={data.series?.members}
              tone="members"
              href="/admin/members"
            />
            <StatCard
              label={BUYER_DETAIL_LABEL}
              value={`${data.totals.buyers ?? 0}명`}
              points={data.series?.buyers}
              tone="buyers"
              href="/admin/members?profile=buyer"
            />
            <StatCard
              label={SELLER_DETAIL_LABEL}
              value={`${data.totals.sellers ?? 0}명`}
              points={data.series?.sellers}
              tone="sellers"
              href="/admin/members?profile=seller"
            />
            <StatCard
              label="판매 상품"
              value={`${data.totals.listings ?? 0}건`}
              points={data.series?.listings}
              tone="listings"
              href="/admin/sell"
            />
            <StatCard
              label="구매 신청(진행)"
              value={`${data.totals.joinsOpen ?? 0}건`}
              points={data.series?.joinsOpen}
              tone="joinsOpen"
              href="/admin/joins?status=open"
            />
            <StatCard
              label="판매 확정"
              value={`${data.totals.joinsConfirmed ?? 0}건`}
              points={data.series?.joinsConfirmed}
              tone="joinsConfirmed"
              href="/admin/joins?status=confirmed"
            />
            <StatCard
              label="상품 문의"
              value={`${data.totals.sellInquiries ?? 0}건`}
              points={data.series?.sellInquiries}
              tone="sellInquiries"
              href="/admin/sell-inquiries"
            />
            <StatCard
              label="미답변 상품 문의"
              value={`${data.totals.sellInquiriesWaiting ?? 0}건`}
              points={data.series?.sellInquiriesWaiting}
              tone="sellWaiting"
              href="/admin/sell-inquiries?status=waiting"
            />
            <StatCard
              label="서비스 문의"
              value={`${data.totals.siteInquiries ?? 0}건`}
              points={data.series?.siteInquiries}
              tone="siteInquiries"
              href="/admin/inquiries"
            />
            <StatCard
              label="미답변 서비스 문의"
              value={`${data.totals.siteInquiriesWaiting ?? 0}건`}
              points={data.series?.siteInquiriesWaiting}
              tone="siteWaiting"
              href="/admin/inquiries?status=waiting"
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
