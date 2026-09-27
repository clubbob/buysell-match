'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageIntro from '@/components/ui/PageIntro';
import SignupTrendChart from '@/features/admin/SignupTrendChart';
import { readApiJson } from '@/lib/api-json';
import type { AdminDashboardData } from '@/lib/admin-dashboard';
import { BUYER_DETAIL_LABEL, SELLER_DETAIL_LABEL } from '@/lib/profile-labels';
import { cn } from '@/lib/utils';

const RANGES = [
  { days: 7, label: '7일' },
  { days: 14, label: '14일' },
  { days: 30, label: '30일' },
] as const;

function RateRow({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink">{label}</span>
        <span className="tabular-nums text-muted">
          {total}명 중 {value}명 · {percent}%
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden bg-slate-100">
        <div className="h-full bg-ink transition-[width]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [days, setDays] = useState<7 | 14 | 30>(14);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    void fetch(`/api/admin/dashboard?days=${days}`)
      .then(async (response) => {
        const payload = await readApiJson<{ ok?: boolean; data?: AdminDashboardData; message?: string }>(
          response,
          '대시보드를 불러오지 못했습니다.',
        );
        if (!response.ok || !payload.ok || !payload.data) {
          throw new Error(payload.message ?? '대시보드를 불러오지 못했습니다.');
        }
        return payload.data;
      })
      .then((next) => {
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : '대시보드를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="space-y-5">
      <PageIntro title="대시보드" description="가입 추세와 회원 현황을 봅니다. 항목은 이후에 더 넣습니다." />

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {!ready && !data ? (
        <p className="text-sm text-muted">불러오는 중…</p>
      ) : data ? (
        <>
          <section className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(14rem,1fr)]">
            <article className="panel px-4 py-5 sm:px-5">
              <p className="text-[11px] font-semibold tracking-wide text-subtle">가입 회원</p>
              <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-ink">{data.totals.members}명</p>
              <p className="mt-1 text-sm text-muted">기본 가입한 회원입니다. 아래는 그중에서 상세 등록을 마친 수입니다.</p>
              <div className="mt-5 space-y-4 border-t border-line pt-4">
                <p className="text-xs font-semibold tracking-wide text-subtle">세부</p>
                <RateRow label={BUYER_DETAIL_LABEL} value={data.totals.buyers} total={data.totals.members} />
                <RateRow label={SELLER_DETAIL_LABEL} value={data.totals.sellers} total={data.totals.members} />
              </div>
            </article>
            <article className="panel px-4 py-5 sm:px-5">
              <p className="text-[11px] font-semibold tracking-wide text-subtle">이번 주 가입</p>
              <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-ink">{data.totals.week}명</p>
              <p className="mt-1 text-sm text-muted">최근 7일 동안 새로 가입한 회원입니다.</p>
            </article>
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
            <section className="panel min-w-0 overflow-hidden">
              <header className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
                <div>
                  <h2 className="text-[15px] font-bold text-ink">가입 추세</h2>
                  <p className="mt-0.5 text-sm text-muted">하루 가입 인원입니다.</p>
                </div>
                <div className="flex gap-1">
                  {RANGES.map((range) => (
                    <button
                      key={range.days}
                      type="button"
                      onClick={() => setDays(range.days)}
                      className={cn(days === range.days ? 'btn-primary' : 'btn-secondary', 'min-h-9 px-3 text-xs sm:min-h-9')}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </header>
              <div className="px-3 py-4 sm:px-5">
                <SignupTrendChart points={data.trend} />
              </div>
            </section>

            <div className="grid gap-4">
              <section className="panel overflow-hidden">
                <header className="flex items-end justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
                  <div>
                    <h2 className="text-[15px] font-bold text-ink">최근 가입</h2>
                    <p className="mt-0.5 text-sm text-muted">새로 들어온 회원입니다.</p>
                  </div>
                  <Link href="/admin/members" className="text-sm font-semibold text-ink underline-offset-2 hover:underline">
                    회원정보
                  </Link>
                </header>
                {data.recent.length > 0 ? (
                  <ul className="divide-y divide-line">
                    {data.recent.map((item) => (
                      <li key={item.id}>
                        <Link href={`/admin/members/${item.id}`} className="block px-4 py-3 hover:bg-slate-50 sm:px-5">
                          <p className="text-sm font-semibold text-ink">{item.name}</p>
                          <p className="mt-0.5 text-sm text-muted">
                            {item.email || '이메일 없음'}
                            {item.joinedAt ? <span className="text-subtle"> · 가입 {item.joinedAt}</span> : null}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-8 text-center text-sm text-muted">아직 가입한 회원이 없습니다.</p>
                )}
              </section>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
