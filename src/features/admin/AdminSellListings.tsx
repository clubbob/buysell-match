'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageIntro from '@/components/ui/PageIntro';
import { readApiJson } from '@/lib/api-json';
import { deadlineParts, formatQuantityNumber, formatWon } from '@/lib/sell-display';
import { listingSourceLabel } from '@/lib/sell-source';
import type { SellListing } from '@/types/sell';

function RowActions({
  item,
  pending,
  onDelete,
}: {
  item: SellListing;
  pending: boolean;
  onDelete: (item: SellListing) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/sell/${item.id}`} target="_blank" rel="noopener noreferrer" className="btn-chip">
        사이트에서 보기
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
  item: SellListing;
  pending: boolean;
  onDelete: (item: SellListing) => void;
}) {
  const deadline = item.deadline ? deadlineParts(item.deadline) : null;
  const sourceLabel = listingSourceLabel(item);

  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3 align-middle text-sm font-semibold text-ink">
        {item.title}
        {sourceLabel ? <span className="mt-0.5 block text-xs font-medium text-muted">{sourceLabel}</span> : null}
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{item.sellerName || '—'}</td>
      <td className="px-3 py-3 align-middle text-sm font-semibold tabular-nums text-ink">{formatWon(item.salePrice)}</td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">
        {formatQuantityNumber(item.remainingLabel)}
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
  item: SellListing;
  pending: boolean;
  onDelete: (item: SellListing) => void;
}) {
  const deadline = item.deadline ? deadlineParts(item.deadline) : null;
  const sourceLabel = listingSourceLabel(item);

  return (
    <li className="border-t border-line px-4 py-3">
      <p className="text-sm font-semibold text-ink">{item.title}</p>
      {sourceLabel ? <p className="mt-0.5 text-xs font-medium text-muted">{sourceLabel}</p> : null}
      <p className="mt-1 text-sm text-muted">{item.sellerName || '판매자 없음'}</p>
      <p className="mt-1 text-sm text-ink">
        <span className="font-semibold tabular-nums">{formatWon(item.salePrice)}</span>
        <span className="mx-1.5 text-subtle">·</span>
        <span className="tabular-nums">잔여 {formatQuantityNumber(item.remainingLabel)}</span>
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

export default function AdminSellListings() {
  const [items, setItems] = useState<SellListing[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/admin/sell')
      .then(async (response) => {
        const data = await readApiJson<{ ok?: boolean; items?: SellListing[]; message?: string }>(
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

  async function handleDelete(item: SellListing) {
    if (!window.confirm(`「${item.title}」 팝니다 글을 삭제할까요? 구매 참여·문의도 함께 삭제됩니다.`)) return;
    setError(null);
    setPendingId(item.id);
    try {
      const response = await fetch(`/api/admin/sell/${item.id}`, { method: 'DELETE' });
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
      <PageIntro title="팝니다" description="등록된 팝니다 글을 목록으로 보고, 사이트에서 확인하거나 삭제합니다." />
      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!ready ? (
        <p className="text-sm text-muted">불러오는 중…</p>
      ) : error && items.length === 0 ? null : items.length === 0 ? (
        <p className="panel px-4 py-10 text-center text-sm text-muted">아직 등록된 팝니다가 없습니다.</p>
      ) : (
        <section className="panel min-w-0 overflow-hidden">
          <header className="border-b border-line px-4 py-3.5">
            <h2 className="text-[15px] font-bold text-ink">전체</h2>
            <p className="mt-0.5 text-sm text-muted">{items.length}건</p>
          </header>
          <table className="hidden w-full table-fixed lg:table">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
              <col className="w-[24%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-subtle">
                <th className="px-4 py-2">상품</th>
                <th className="px-3 py-2">판매자</th>
                <th className="px-3 py-2">특판 가격</th>
                <th className="px-3 py-2">잔여 수량</th>
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
