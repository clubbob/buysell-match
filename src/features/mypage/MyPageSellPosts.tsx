'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import SellGuidePanel from '@/features/sell/SellGuidePanel';
import { formatCount, formatWon } from '@/lib/sell-display';
import { fetchSellJoinsBySeller } from '@/lib/sell-join-remote';
import { formatMemberJoinedAt } from '@/types/member';
import type { SellJoin } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-ink">{label}</p>
      <div className="whitespace-pre-line text-sm leading-6 text-ink">{children || '—'}</div>
    </div>
  );
}

export default function MyPageSellPosts({
  sellerId,
  listings,
  ready,
}: {
  sellerId: string;
  listings: SellListing[];
  ready: boolean;
}) {
  const [joins, setJoins] = useState<SellJoin[]>([]);
  const [joinsReady, setJoinsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchSellJoinsBySeller(sellerId)
      .then((next) => {
        if (!cancelled) setJoins(next);
      })
      .finally(() => {
        if (!cancelled) setJoinsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  const joinsByListing = useMemo(() => {
    const map = new Map<string, SellJoin[]>();
    for (const join of joins) {
      const list = map.get(join.listingId) ?? [];
      list.push(join);
      map.set(join.listingId, list);
    }
    return map;
  }, [joins]);

  if (!ready) {
    return <p className="px-4 py-10 text-center text-sm text-muted">불러오는 중…</p>;
  }

  if (listings.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-muted">아직 올린 팝니다가 없습니다.</p>;
  }

  return (
    <ul className="divide-y divide-line">
      {listings.map((item) => {
        const rows = joinsByListing.get(item.id) ?? [];
        const cover = item.images[0];
        const extras = item.images.slice(1);
        return (
          <li key={item.id} className="px-4 py-5">
            <div className="flex items-start justify-end">
              {joinsReady && rows.length === 0 ? (
                <Link href={`/sell/${item.id}/edit`} className="btn-chip shrink-0">
                  수정
                </Link>
              ) : rows.length > 0 ? (
                <span className="shrink-0 text-xs text-subtle">구매 참여 후 수정 불가</span>
              ) : null}
            </div>

            <section className="mt-3">
              <h3 className="text-sm font-bold text-ink">상품 사진</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">대표 이미지</p>
                  {cover ? (
                    <img src={cover} alt="" className="h-40 w-full border border-line object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center border border-line bg-slate-50 text-sm text-subtle">
                      사진 없음
                    </div>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-ink">추가 이미지</p>
                  {extras.length > 0 ? (
                    <ul className="grid grid-cols-4 gap-2">
                      {extras.map((src, index) => (
                        <li key={`${src}-${index}`}>
                          <img src={src} alt="" className="h-24 w-full border border-line object-cover" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-subtle">없음</p>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-8 space-y-4">
              <h3 className="text-sm font-bold text-ink">상품 정보</h3>
              <Field label="상품명">{item.title}</Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="정상가 (원)">{formatWon(item.regularPrice)}</Field>
                <Field label="특판가 (원)">{formatWon(item.salePrice)}</Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="공동구매 최소 주문">{item.minPurchaseLabel}</Field>
                <Field label="한계 수량">{item.limitLabel}</Field>
                <Field label="수량">{item.quantityLabel}</Field>
                <Field label="잔여 수량">{item.remainingLabel}</Field>
              </div>
              <Field label="마감일">{item.deadline || '—'}</Field>
            </section>

            <SellGuidePanel item={item} readQueryTab={false} className="mt-8 border border-line" />

            {!joinsReady ? (
              <p className="mt-4 text-sm text-muted">참여 내역을 불러오는 중…</p>
            ) : rows.length === 0 ? (
              <p className="mt-4 text-sm text-muted">아직 구매 참여가 없습니다.</p>
            ) : (
              <div className="mt-4 overflow-x-auto border border-line">
                <p className="border-b border-line bg-slate-50 px-3 py-2 text-sm font-semibold text-ink">
                  {item.title} · 구매 참여 내역
                </p>
                <table className="w-full min-w-[28rem] text-center text-sm">
                  <thead>
                    <tr className="border-b border-line text-[11px] font-semibold text-subtle">
                      <th className="px-3 py-2 font-semibold">구매자</th>
                      <th className="px-3 py-2 font-semibold">수량</th>
                      <th className="px-3 py-2 font-semibold">상태</th>
                      <th className="px-3 py-2 font-semibold">참여일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((join) => (
                      <tr key={join.id} className="border-t border-line">
                        <td className="px-3 py-2.5 break-all text-ink">{join.buyerEmail || '—'}</td>
                        <td className="px-3 py-2.5 font-semibold tabular-nums text-ink">{formatCount(join.quantity)}</td>
                        <td className="px-3 py-2.5 font-semibold text-ink">
                          {join.status === 'confirmed' ? '판매 확정' : '접수됨'}
                        </td>
                        <td className="px-3 py-2.5 font-semibold tabular-nums text-ink">
                          {formatMemberJoinedAt(join.createdAt) || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
