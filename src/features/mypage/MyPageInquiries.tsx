'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { inputClassName } from '@/features/auth/auth-errors';
import { answerSellInquiry, fetchSellInquiriesBySeller } from '@/lib/sell-inquiry-remote';
import { formatMemberJoinedAt } from '@/types/member';
import { isInquiryAnswered, type SellInquiry } from '@/types/sell-inquiry';
import type { SellListing } from '@/types/sell';

export default function MyPageInquiries({
  sellerId,
  listings,
}: {
  sellerId: string;
  listings: SellListing[];
}) {
  const [items, setItems] = useState<SellInquiry[]>([]);
  const [ready, setReady] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const titles = useMemo(() => new Map(listings.map((item) => [item.id, item.title])), [listings]);
  const waiting = items.filter((item) => !isInquiryAnswered(item));
  const answered = items.filter((item) => isInquiryAnswered(item));

  useEffect(() => {
    let cancelled = false;
    void fetchSellInquiriesBySeller(sellerId)
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  async function handleAnswer(inquiry: SellInquiry, answer: string) {
    setError(null);
    if (answer.trim().length < 2) {
      setError('답변은 2자 이상 입력해 주세요.');
      return;
    }
    setPendingId(inquiry.id);
    try {
      const next = await answerSellInquiry(inquiry, answer);
      setItems((current) => current.map((row) => (row.id === next.id ? next : row)));
    } catch {
      setError('답변을 등록하지 못했습니다.');
    } finally {
      setPendingId(null);
    }
  }

  if (!ready) {
    return (
      <section className="panel px-4 py-5 sm:px-5">
        <h2 className="text-sm font-bold text-ink">받은 상품 문의</h2>
        <p className="mt-4 text-sm text-muted">불러오는 중…</p>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="panel overflow-hidden">
      <div className="px-4 py-4 sm:px-5">
        <h2 className="text-sm font-bold text-ink">받은 상품 문의 {waiting.length ? `· 미답변 ${waiting.length}` : ''}</h2>
        <p className="mt-1 text-sm text-muted">판매 상품에 올라온 문의는 여기서 답합니다.</p>
      </div>
      {error ? (
        <p className="mx-4 mb-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger sm:mx-5" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="divide-y divide-line border-t border-line">
        {[...waiting, ...answered].map((inquiry) => (
          <SellerInquiryRow
            key={inquiry.id}
            inquiry={inquiry}
            title={titles.get(inquiry.listingId) || '상품'}
            pending={pendingId === inquiry.id}
            onAnswer={handleAnswer}
          />
        ))}
      </ul>
    </section>
  );
}

function SellerInquiryRow({
  inquiry,
  title,
  pending,
  onAnswer,
}: {
  inquiry: SellInquiry;
  title: string;
  pending: boolean;
  onAnswer: (inquiry: SellInquiry, answer: string) => void;
}) {
  const [answer, setAnswer] = useState('');
  const answered = isInquiryAnswered(inquiry);

  return (
    <li className="px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href={`/sell/${inquiry.listingId}?tab=inquiries`} className="min-w-0 truncate text-sm font-semibold text-ink hover:underline">
          {title}
        </Link>
        <Link href={`/sell/${inquiry.listingId}?tab=inquiries`} className="btn-chip shrink-0">
          상품에서 보기
        </Link>
      </div>
      <p className="mt-2 text-xs text-subtle">
        질문 · {inquiry.buyerName || '구매자'} · {formatMemberJoinedAt(inquiry.createdAt) || '—'}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{inquiry.question}</p>
      {answered ? (
        <div className="mt-3 border-l-2 border-ink pl-3">
          <p className="text-xs text-subtle">답변 · {formatMemberJoinedAt(inquiry.answeredAt) || '—'}</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{inquiry.answer}</p>
        </div>
      ) : (
        <form
          className="mt-3 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            onAnswer(inquiry, answer);
          }}
        >
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className={`${inputClassName} h-24 py-3`}
            placeholder="답변을 입력해 주세요."
            required
          />
          <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
            {pending ? '등록 중…' : '답변하기'}
          </button>
        </form>
      )}
    </li>
  );
}
