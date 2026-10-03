'use client';

import { useEffect, useState } from 'react';
import { inputClassName } from '@/features/auth/auth-errors';
import { createSellInquiry, fetchSellInquiries } from '@/lib/sell-inquiry-remote';
import { formatMemberJoinedAt } from '@/types/member';
import { isInquiryAnswered, type SellInquiry } from '@/types/sell-inquiry';

export default function SellBuyerInquiryForm({ listingId, buyerId }: { listingId: string; buyerId: string }) {
  const [items, setItems] = useState<SellInquiry[]>([]);
  const [ready, setReady] = useState(false);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchSellInquiries(listingId)
      .then((next) => {
        if (!cancelled) setItems(next.filter((row) => row.buyerId === buyerId));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId, buyerId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const created = await createSellInquiry(listingId, question);
      setItems((current) => [created, ...current.filter((row) => row.id !== created.id)]);
      setQuestion('');
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
      {!ready ? (
        <p className="text-sm text-muted">문의 내역을 불러오는 중…</p>
      ) : items.length > 0 ? (
        <ul className="divide-y divide-line border border-line">
          {items.map((inquiry) => (
            <li key={inquiry.id} className="px-3 py-3 sm:px-4">
              <p className="text-xs text-subtle">질문 · {formatMemberJoinedAt(inquiry.createdAt) || '—'}</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{inquiry.question}</p>
              {isInquiryAnswered(inquiry) ? (
                <div className="mt-3 border-l-2 border-ink pl-3">
                  <p className="text-xs text-subtle">답변 · {formatMemberJoinedAt(inquiry.answeredAt) || '—'}</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{inquiry.answer}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted">판매자 답변을 기다리는 중입니다.</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">이 상품에 남긴 문의가 없습니다.</p>
      )}
    </div>
  );
}
