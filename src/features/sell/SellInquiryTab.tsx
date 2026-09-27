'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { inputClassName } from '@/features/auth/auth-errors';
import { loginHref } from '@/lib/auth-redirect';
import { answerSellInquiry, createSellInquiry, fetchSellInquiries } from '@/lib/sell-inquiry-remote';
import { formatMemberJoinedAt } from '@/types/member';
import { isInquiryAnswered, type SellInquiry } from '@/types/sell-inquiry';
import type { SellListing } from '@/types/sell';

function newInquiryId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `q-${crypto.randomUUID()}`;
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function InquiryItem({
  item,
  canAnswer,
  pendingId,
  onAnswer,
}: {
  item: SellInquiry;
  canAnswer: boolean;
  pendingId: string | null;
  onAnswer: (inquiry: SellInquiry, answer: string) => void;
}) {
  const [answer, setAnswer] = useState('');
  const answered = isInquiryAnswered(item);

  return (
    <li className="px-4 py-4 sm:px-6">
      <p className="text-xs text-subtle">
        질문 · {item.buyerName || '구매자'} · {formatMemberJoinedAt(item.createdAt) || '—'}
      </p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{item.question}</p>
      {answered ? (
        <div className="mt-3 border-l-2 border-ink pl-3">
          <p className="text-xs text-subtle">답변 · {formatMemberJoinedAt(item.answeredAt) || '—'}</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{item.answer}</p>
        </div>
      ) : canAnswer ? (
        <form
          className="mt-3 space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            onAnswer(item, answer);
          }}
        >
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className={`${inputClassName} h-24 py-3`}
            placeholder="답변을 입력해 주세요."
            required
          />
          <button type="submit" disabled={pendingId === item.id} className="btn-primary w-full sm:w-auto">
            {pendingId === item.id ? '등록 중…' : '답변하기'}
          </button>
        </form>
      ) : (
        <p className="mt-2 text-sm text-muted">판매자 답변을 기다리는 중입니다.</p>
      )}
    </li>
  );
}

export default function SellInquiryTab({
  item,
  onCountChange,
}: {
  item: SellListing;
  onCountChange?: (count: number) => void;
}) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<SellInquiry[]>([]);
  const [ready, setReady] = useState(false);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const isOwner = Boolean(user && user.uid === item.sellerId);
  const loginPath = loginHref(`/sell/${item.id}`);

  useEffect(() => {
    let cancelled = false;
    void fetchSellInquiries(item.id)
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  useEffect(() => {
    if (ready) onCountChange?.(items.length);
  }, [items.length, ready, onCountChange]);

  async function handleAsk(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!user) return;
    if (isOwner) {
      setError('내 상품에는 문의할 수 없습니다.');
      return;
    }
    const text = question.trim();
    if (text.length < 5) {
      setError('문의는 5자 이상 입력해 주세요.');
      return;
    }
    setPending(true);
    try {
      const created = await createSellInquiry({
        id: newInquiryId(),
        listingId: item.id,
        sellerId: item.sellerId,
        buyerId: user.uid,
        buyerName: user.displayName?.trim() || '구매자',
        question: text,
        answer: '',
        answeredAt: '',
        createdAt: new Date().toISOString(),
      });
      setItems((current) => [created, ...current.filter((row) => row.id !== created.id)]);
      setQuestion('');
    } catch {
      setError('문의를 등록하지 못했습니다.');
    } finally {
      setPending(false);
    }
  }

  async function handleAnswer(inquiry: SellInquiry, answer: string) {
    setError(null);
    if (!isOwner) return;
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

  return (
    <div>
      <div className="border-b border-line px-4 py-4 sm:px-6">
        {loading ? (
          <p className="text-sm text-muted">불러오는 중…</p>
        ) : isOwner ? (
          <p className="text-sm text-muted">이 상품 문의에는 판매자인 회원만 답할 수 있습니다.</p>
        ) : user ? (
          <form onSubmit={(event) => void handleAsk(event)} className="space-y-2">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className={`${inputClassName} h-24 py-3`}
              placeholder="상품에 대해 궁금한 점을 적어 주세요."
              required
            />
            <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
              {pending ? '등록 중…' : '문의하기'}
            </button>
          </form>
        ) : (
          <div className="flex justify-center">
            <Link href={loginPath} className="btn-secondary">
              로그인 후 문의
            </Link>
          </div>
        )}
        {error ? (
          <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {!ready ? (
        <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">불러오는 중…</p>
      ) : items.length > 0 ? (
        <ul className="divide-y divide-line">
          {items.map((inquiry) => (
            <InquiryItem
              key={inquiry.id}
              item={inquiry}
              canAnswer={isOwner && !isInquiryAnswered(inquiry)}
              pendingId={pendingId}
              onAnswer={(row, answer) => void handleAnswer(row, answer)}
            />
          ))}
        </ul>
      ) : (
        <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">아직 상품 문의가 없습니다.</p>
      )}
    </div>
  );
}
