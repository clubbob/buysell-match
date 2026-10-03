'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AdminListFilters from '@/components/admin/AdminListFilters';
import PageIntro from '@/components/ui/PageIntro';
import { readApiJson } from '@/lib/api-json';
import { formatCount } from '@/lib/sell-display';
import { formatMemberJoinedAt } from '@/types/member';
import {
  isJoinPaid,
  joinPaymentLabel,
  joinShippingLabel,
  OPEN_JOIN_STATUS_LABEL,
  type SellJoin,
} from '@/types/sell-join';
import type { AdminSellJoinRow } from '@/lib/admin-joins-data';

function joinStatusLabel(join: SellJoin) {
  return join.status === 'confirmed' ? '판매 확정' : OPEN_JOIN_STATUS_LABEL;
}

function joinPaymentCell(join: SellJoin) {
  if (join.status !== 'confirmed') return '—';
  return joinPaymentLabel(join) || '입금 대기';
}

function joinShippingCell(join: SellJoin) {
  if (join.status !== 'confirmed' || !isJoinPaid(join)) return '—';
  return joinShippingLabel(join) || '배송 대기';
}

function buyerLabel(join: SellJoin) {
  const name = join.buyerName?.trim();
  const email = join.buyerEmail?.trim();
  if (name && email) return `${name} (${email})`;
  return name || email || '—';
}

function DesktopRow({ item }: { item: AdminSellJoinRow }) {
  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3 align-middle text-sm font-semibold text-ink">
        <span className="line-clamp-2">{item.listingTitle}</span>
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{item.sellerName || '—'}</td>
      <td className="px-3 py-3 align-middle text-sm text-ink break-all">{buyerLabel(item)}</td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">{formatCount(item.quantity)}</td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{joinStatusLabel(item)}</td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{joinPaymentCell(item)}</td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{joinShippingCell(item)}</td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">
        {formatMemberJoinedAt(item.createdAt) || '—'}
      </td>
      <td className="px-4 py-3 align-middle">
        <Link href={`/sell/${item.listingId}`} target="_blank" rel="noopener noreferrer" className="btn-chip">
          상품 보기
        </Link>
      </td>
    </tr>
  );
}

function MobileRow({ item }: { item: AdminSellJoinRow }) {
  return (
    <li className="border-t border-line px-4 py-3">
      <p className="text-sm font-semibold text-ink">{item.listingTitle}</p>
      <p className="mt-1 text-sm text-muted">{item.sellerName || '판매자 없음'}</p>
      <p className="mt-1 text-sm text-muted break-all">{buyerLabel(item)}</p>
      <p className="mt-1 text-sm text-ink">
        {formatCount(item.quantity)}
        <span className="mx-1.5 text-subtle">·</span>
        {joinStatusLabel(item)}
        <span className="mx-1.5 text-subtle">·</span>
        {joinPaymentCell(item)}
        <span className="mx-1.5 text-subtle">·</span>
        {joinShippingCell(item)}
        <span className="mx-1.5 text-subtle">·</span>
        {formatMemberJoinedAt(item.createdAt) || '—'}
      </p>
      <div className="mt-3">
        <Link href={`/sell/${item.listingId}`} target="_blank" rel="noopener noreferrer" className="btn-chip">
          상품 보기
        </Link>
      </div>
    </li>
  );
}

function joinFilterHref(status: 'all' | 'open' | 'confirmed', memberId: string | null) {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (memberId) params.set('member', memberId);
  const query = params.toString();
  return query ? `/admin/joins?${query}` : '/admin/joins';
}

function parseJoinStatus(value: string | null) {
  if (value === 'open' || value === 'confirmed') return value;
  return 'all';
}

export default function AdminSellJoins() {
  const searchParams = useSearchParams();
  const status = parseJoinStatus(searchParams.get('status'));
  const memberId = searchParams.get('member');
  const joinFilters = useMemo(
    () => [
      { value: 'all', label: '전체', href: joinFilterHref('all', memberId) },
      { value: 'open', label: '진행', href: joinFilterHref('open', memberId) },
      { value: 'confirmed', label: '확정', href: joinFilterHref('confirmed', memberId) },
    ],
    [memberId],
  );
  const [items, setItems] = useState<AdminSellJoinRow[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/admin/joins')
      .then(async (response) => {
        const data = await readApiJson<{ ok?: boolean; items?: AdminSellJoinRow[]; message?: string }>(
          response,
          '목록을 불러오지 못했습니다.',
        );
        if (!response.ok || !data.ok) throw new Error(data.message ?? '목록을 불러오지 못했습니다.');
        return data.items ?? [];
      })
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : '목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scopedItems = useMemo(() => {
    if (!memberId) return items;
    return items.filter((item) => item.buyerId === memberId);
  }, [items, memberId]);

  const filteredItems = useMemo(() => {
    if (status === 'open') return scopedItems.filter((item) => item.status !== 'confirmed');
    if (status === 'confirmed') return scopedItems.filter((item) => item.status === 'confirmed');
    return scopedItems;
  }, [scopedItems, status]);

  const openCount = scopedItems.filter((item) => item.status !== 'confirmed').length;
  const confirmedCount = scopedItems.length - openCount;
  const sectionTitle = memberId
    ? '회원 구매 신청'
    : status === 'open'
      ? '진행'
      : status === 'confirmed'
        ? '확정'
        : '전체';

  return (
    <div className="space-y-5">
      <PageIntro
        title="구매 신청 현황"
        description="전체 구매 신청과 판매 확정·결제·배송 상태를 확인합니다."
      />
      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!ready ? (
        <p className="text-sm text-muted">불러오는 중…</p>
      ) : error && items.length === 0 ? null : items.length === 0 ? (
        <p className="panel px-4 py-10 text-center text-sm text-muted">아직 구매 신청이 없습니다.</p>
      ) : scopedItems.length === 0 ? (
        <section className="panel min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <p className="text-sm text-muted">선택한 회원의 구매 신청이 없습니다.</p>
            <Link href="/admin/joins" className="btn-chip">전체 보기</Link>
          </div>
        </section>
      ) : filteredItems.length === 0 ? (
        <section className="panel min-w-0 overflow-hidden">
          <AdminListFilters options={joinFilters} current={status} />
          <p className="px-4 py-10 text-center text-sm text-muted">해당 상태의 구매 신청이 없습니다.</p>
        </section>
      ) : (
        <section className="panel min-w-0 overflow-hidden">
          <header className="border-b border-line px-4 py-3.5">
            <h2 className="text-[15px] font-bold text-ink">{sectionTitle}</h2>
            <p className="mt-0.5 text-sm text-muted">
              {filteredItems.length}건
              {status === 'all' && !memberId ? ` · 진행 ${openCount} · 확정 ${confirmedCount}` : null}
              {memberId ? (
                <>
                  <span className="mx-1.5 text-subtle">·</span>
                  <Link href="/admin/joins" className="font-medium text-ink underline-offset-2 hover:underline">
                    전체 보기
                  </Link>
                </>
              ) : null}
            </p>
          </header>
          <AdminListFilters options={joinFilters} current={status} />
          <table className="hidden w-full table-fixed lg:table">
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[10%]" />
              <col className="w-[14%]" />
              <col className="w-[7%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-subtle">
                <th className="px-4 py-2">상품</th>
                <th className="px-3 py-2">판매자</th>
                <th className="px-3 py-2">구매자</th>
                <th className="px-3 py-2">수량</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-3 py-2">입금</th>
                <th className="px-3 py-2">배송</th>
                <th className="px-3 py-2">신청일</th>
                <th className="px-4 py-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <DesktopRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
          <ul className="lg:hidden">
            {filteredItems.map((item) => (
              <MobileRow key={item.id} item={item} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
