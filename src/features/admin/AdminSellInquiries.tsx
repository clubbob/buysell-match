'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AdminListFilters from '@/components/admin/AdminListFilters';
import PageIntro from '@/components/ui/PageIntro';
import { readApiJson } from '@/lib/api-json';
import { formatMemberJoinedAt } from '@/types/member';
import { isInquiryAnswered } from '@/types/sell-inquiry';
import type { AdminSellInquiryRow } from '@/lib/admin-sell-inquiries-data';

function statusLabel(item: AdminSellInquiryRow) {
  return isInquiryAnswered(item) ? '답변 완료' : '미답변';
}

function RowActions({
  item,
  pending,
  onDelete,
}: {
  item: AdminSellInquiryRow;
  pending: boolean;
  onDelete: (item: AdminSellInquiryRow) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/admin/sell-inquiries/${item.id}`} className="btn-chip shrink-0">
        {isInquiryAnswered(item) ? '답변 보기' : '답변하기'}
      </Link>
      <Link href={`/sell/${item.listingId}`} target="_blank" rel="noopener noreferrer" className="btn-chip shrink-0">
        상품 보기
      </Link>
      <button type="button" className="btn-chip shrink-0" disabled={pending} onClick={() => onDelete(item)}>
        {pending ? '삭제 중…' : '삭제'}
      </button>
    </div>
  );
}

function DesktopRow({
  item,
  pending,
  onDelete,
}: {
  item: AdminSellInquiryRow;
  pending: boolean;
  onDelete: (item: AdminSellInquiryRow) => void;
}) {
  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3 align-middle text-sm font-semibold text-ink">
        <span className="line-clamp-2">{item.listingTitle}</span>
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">
        <span className="line-clamp-3">{item.question}</span>
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{item.buyerName || '—'}</td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">
        {formatMemberJoinedAt(item.createdAt) || '—'}
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{statusLabel(item)}</td>
      <td className="px-4 py-3 align-middle">
        <RowActions item={item} pending={pending} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function MobileRow({
  item,
  pending,
  onDelete,
}: {
  item: AdminSellInquiryRow;
  pending: boolean;
  onDelete: (item: AdminSellInquiryRow) => void;
}) {
  return (
    <li className="border-t border-line px-4 py-3">
      <p className="text-sm font-semibold text-ink">{item.listingTitle}</p>
      <p className="mt-1 line-clamp-3 text-sm text-ink">{item.question}</p>
      <p className="mt-1 text-sm text-muted">
        {item.buyerName || '구매자'}
        <span className="mx-1.5 text-subtle">·</span>
        {statusLabel(item)}
        <span className="mx-1.5 text-subtle">·</span>
        {formatMemberJoinedAt(item.createdAt) || '—'}
      </p>
      <div className="mt-3">
        <RowActions item={item} pending={pending} onDelete={onDelete} />
      </div>
    </li>
  );
}

function inquiryFilterHref(status: 'all' | 'waiting', memberId: string | null) {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (memberId) params.set('member', memberId);
  const query = params.toString();
  return query ? `/admin/sell-inquiries?${query}` : '/admin/sell-inquiries';
}

function parseInquiryStatus(value: string | null) {
  return value === 'waiting' ? 'waiting' : 'all';
}

export default function AdminSellInquiries() {
  const searchParams = useSearchParams();
  const status = parseInquiryStatus(searchParams.get('status'));
  const memberId = searchParams.get('member');
  const inquiryFilters = useMemo(
    () => [
      { value: 'all', label: '전체', href: inquiryFilterHref('all', memberId) },
      { value: 'waiting', label: '미답변', href: inquiryFilterHref('waiting', memberId) },
    ],
    [memberId],
  );
  const [items, setItems] = useState<AdminSellInquiryRow[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/admin/sell-inquiries')
      .then(async (response) => {
        const data = await readApiJson<{ ok?: boolean; items?: AdminSellInquiryRow[]; message?: string }>(
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
    if (status === 'waiting') return scopedItems.filter((item) => !isInquiryAnswered(item));
    return scopedItems;
  }, [scopedItems, status]);

  const waiting = scopedItems.filter((item) => !isInquiryAnswered(item)).length;
  const sectionTitle = memberId ? '회원 상품 문의' : status === 'waiting' ? '미답변' : '전체';

  async function handleDelete(item: AdminSellInquiryRow) {
    const label = item.listingTitle || '상품 문의';
    if (!window.confirm(`「${label}」 상품 문의를 삭제할까요?`)) return;
    setError(null);
    setPendingId(item.id);
    try {
      const response = await fetch(`/api/admin/sell-inquiries/${item.id}`, { method: 'DELETE' });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setError(data.message ?? '삭제에 실패했습니다.');
        return;
      }
      setItems((current) => current.filter((row) => row.id !== item.id));
    } catch {
      setError('삭제에 실패했습니다.');
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <PageIntro
        title="상품 문의"
        description="판매 상품에 달린 문의를 확인하고 답변하거나 삭제합니다."
      />
      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!ready ? (
        <p className="text-sm text-muted">불러오는 중…</p>
      ) : error && items.length === 0 ? null : items.length === 0 ? (
        <p className="panel px-4 py-10 text-center text-sm text-muted">아직 상품 문의가 없습니다.</p>
      ) : scopedItems.length === 0 ? (
        <section className="panel min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <p className="text-sm text-muted">선택한 회원의 상품 문의가 없습니다.</p>
            <Link href="/admin/sell-inquiries" className="btn-chip">전체 보기</Link>
          </div>
        </section>
      ) : filteredItems.length === 0 ? (
        <section className="panel min-w-0 overflow-hidden">
          <AdminListFilters options={inquiryFilters} current={status} />
          <p className="px-4 py-10 text-center text-sm text-muted">미답변 상품 문의가 없습니다.</p>
        </section>
      ) : (
        <section className="panel min-w-0 overflow-hidden">
          <header className="border-b border-line px-4 py-3.5">
            <h2 className="text-[15px] font-bold text-ink">{sectionTitle}</h2>
            <p className="mt-0.5 text-sm text-muted">
              {filteredItems.length}건{status === 'all' && !memberId && waiting > 0 ? ` · 미답변 ${waiting}` : ''}
              {memberId ? (
                <>
                  <span className="mx-1.5 text-subtle">·</span>
                  <Link href="/admin/sell-inquiries" className="font-medium text-ink underline-offset-2 hover:underline">
                    전체 보기
                  </Link>
                </>
              ) : null}
            </p>
          </header>
          <AdminListFilters options={inquiryFilters} current={status} />
          <table className="hidden w-full table-fixed lg:table">
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[24%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[9%]" />
              <col className="w-[24%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-subtle">
                <th className="px-4 py-2">상품</th>
                <th className="px-3 py-2">문의</th>
                <th className="px-3 py-2">구매자</th>
                <th className="px-3 py-2">등록일</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-4 py-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <DesktopRow
                  key={item.id}
                  item={item}
                  pending={pendingId === item.id}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
          <ul className="lg:hidden">
            {filteredItems.map((item) => (
              <MobileRow
                key={item.id}
                item={item}
                pending={pendingId === item.id}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
