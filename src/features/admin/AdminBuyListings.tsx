'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageIntro from '@/components/ui/PageIntro';
import { readApiJson } from '@/lib/api-json';
import { deadlineParts, formatQuantityNumber, formatWon } from '@/lib/sell-display';
import type { BuyListing } from '@/types/buy';

function RowActions({
  item,
  pending,
  onDelete,
}: {
  item: BuyListing;
  pending: boolean;
  onDelete: (item: BuyListing) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href="/buy" target="_blank" rel="noopener noreferrer" className="btn-chip">
        삽니다 목록
      </Link>
      <button type="button" className="btn-chip" disabled={pending} onClick={() => onDelete(item)}>
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
  item: BuyListing;
  pending: boolean;
  onDelete: (item: BuyListing) => void;
}) {
  const deadline = item.deadline ? deadlineParts(item.deadline) : null;

  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3 align-middle text-sm font-semibold text-ink">{item.title}</td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{item.buyerName || '—'}</td>
      <td className="px-3 py-3 align-middle text-sm font-semibold tabular-nums text-ink">
        {item.price > 0 ? formatWon(item.price) : '—'}
      </td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">
        {item.quantityLabel ? formatQuantityNumber(item.quantityLabel) : '—'}
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">
        {deadline ? (
          <>
            <span className="tabular-nums">{deadline.date}</span>
            <span className="mt-0.5 block text-xs font-medium text-muted">{deadline.note}</span>
          </>
        ) : (
          '—'
        )}
      </td>
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
  item: BuyListing;
  pending: boolean;
  onDelete: (item: BuyListing) => void;
}) {
  const deadline = item.deadline ? deadlineParts(item.deadline) : null;

  return (
    <li className="border-t border-line px-4 py-3">
      <p className="text-sm font-semibold text-ink">{item.title}</p>
      <p className="mt-1 text-sm text-muted">{item.buyerName || '구매자 없음'}</p>
      <p className="mt-1 text-sm text-ink">
        <span className="font-semibold tabular-nums">{item.price > 0 ? formatWon(item.price) : '—'}</span>
        {item.quantityLabel ? (
          <>
            <span className="mx-1.5 text-subtle">·</span>
            <span className="tabular-nums">{formatQuantityNumber(item.quantityLabel)}</span>
          </>
        ) : null}
        {deadline ? (
          <>
            <span className="mx-1.5 text-subtle">·</span>
            <span className="tabular-nums">{deadline.date}</span>
            <span className="ml-1 text-xs font-medium text-muted">{deadline.note}</span>
          </>
        ) : null}
      </p>
      <div className="mt-3">
        <RowActions item={item} pending={pending} onDelete={onDelete} />
      </div>
    </li>
  );
}

export default function AdminBuyListings() {
  const [items, setItems] = useState<BuyListing[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/admin/buy')
      .then(async (response) => {
        const data = await readApiJson<{ ok?: boolean; items?: BuyListing[]; message?: string }>(
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

  async function handleDelete(item: BuyListing) {
    if (!window.confirm(`「${item.title}」 삽니다 글을 삭제할까요?`)) return;
    setError(null);
    setPendingId(item.id);
    try {
      const response = await fetch(`/api/admin/buy/${item.id}`, { method: 'DELETE' });
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
      <PageIntro title="삽니다" description="등록된 삽니다 글을 목록으로 보고 삭제합니다." />
      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!ready ? (
        <p className="text-sm text-muted">불러오는 중…</p>
      ) : error && items.length === 0 ? null : items.length === 0 ? (
        <p className="panel px-4 py-10 text-center text-sm text-muted">아직 등록된 삽니다가 없습니다.</p>
      ) : (
        <section className="panel min-w-0 overflow-hidden">
          <header className="border-b border-line px-4 py-3.5">
            <h2 className="text-[15px] font-bold text-ink">전체</h2>
            <p className="mt-0.5 text-sm text-muted">{items.length}건</p>
          </header>
          <table className="hidden w-full table-fixed lg:table">
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[22%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-subtle">
                <th className="px-4 py-2">상품</th>
                <th className="px-3 py-2">구매자</th>
                <th className="px-3 py-2">가격</th>
                <th className="px-3 py-2">수량</th>
                <th className="px-3 py-2">마감</th>
                <th className="px-4 py-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
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
            {items.map((item) => (
              <MobileRow key={item.id} item={item} pending={pendingId === item.id} onDelete={handleDelete} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
