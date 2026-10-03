'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { inputClassName } from '@/features/auth/auth-errors';
import { createSellInquiry, fetchSellInquiriesByBuyer } from '@/lib/sell-inquiry-remote';
import { mypageSellInquiryHref } from '@/lib/mypage-nav';
import { formatMemberJoinedAt } from '@/types/member';
import { isInquiryAnswered, type SellInquiry } from '@/types/sell-inquiry';

export default function SellBuyerInquiryForm({
  listingId,
  buyerId,
  showHistory = true,
  onCreated,
}: {
  listingId: string;
  buyerId: string;
  showHistory?: boolean;
  onCreated?: (inquiry: SellInquiry) => void;
}) {
  const [items, setItems] = useState<SellInquiry[]>([]);
  const [ready, setReady] = useState(false);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!showHistory) {
      setReady(true);
      return;
    }
    let cancelled = false;
    setLoadError(null);
    void fetchSellInquiriesByBuyer(buyerId)
      .then((next) => {
        if (!cancelled) setItems(next.filter((row) => row.listingId === listingId));
      })
      .catch((loadErr: unknown) => {
        if (!cancelled) {
          setItems([]);
          setLoadError(loadErr instanceof Error ? loadErr.message : '문의 내역을 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId, buyerId, showHistory]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const created = await createSellInquiry(listingId, question);
      if (showHistory) {
        setItems((current) => [created, ...current.filter((row) => row.id !== created.id)]);
      }
      setQuestion('');
      onCreated?.(created);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : '문의를 등록하지 못했습니다.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-2">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className={`${inputClassName} min-h-24 py-3`}
          placeholder="상품에 대해 궁금한 점을 적어 주세요."
          required
        />
        <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
          {pending ? '등록 중…' : '문의하기'}
        </button>
      </form>
      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {loadError ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {loadError}
        </p>
      ) : null}
      {!showHistory ? null : !ready ? (
        <p className="text-sm text-muted">문의 내역을 불러오는 중…</p>
      ) : items.length > 0 ? (
        <ul className="divide-y divide-line border border-line">
          {items.map((inquiry) => (
            <li key={inquiry.id}>
              <Link
                href={`${mypageSellInquiryHref(inquiry.id)}?from=mypage`}
                className="block px-3 py-3 hover:bg-slate-50 sm:px-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-ink">{inquiry.question}</p>
                  <span className="shrink-0 text-xs font-medium text-muted">
                    {isInquiryAnswered(inquiry) ? '답변 완료' : '답변 대기'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-subtle">{formatMemberJoinedAt(inquiry.createdAt) || '—'}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">이 상품에 남긴 문의가 없습니다.</p>
      )}
    </div>
  );
}
