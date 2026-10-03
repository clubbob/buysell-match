'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageBack from '@/components/ui/PageBack';
import { inputClassName } from '@/features/auth/auth-errors';
import { readApiJson } from '@/lib/api-json';
import { formatMemberJoinedAt } from '@/types/member';
import { isInquiryAnswered } from '@/types/sell-inquiry';
import type { AdminSellInquiryRow } from '@/lib/admin-sell-inquiries-data';

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-3 text-sm">
      <dt className="w-20 shrink-0 text-muted sm:w-24">{label}</dt>
      <dd className="min-w-0 break-all text-ink">{value?.trim() ? value : '—'}</dd>
    </div>
  );
}

export default function AdminSellInquiryDetail({ id }: { id: string }) {
  const [item, setItem] = useState<AdminSellInquiryRow | null>(null);
  const [answer, setAnswer] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/admin/sell-inquiries/${id}`)
      .then(async (response) => {
        const data = await readApiJson<{ ok?: boolean; item?: AdminSellInquiryRow; message?: string }>(
          response,
          '문의를 불러오지 못했습니다.',
        );
        if (!response.ok || !data.ok || !data.item) {
          throw new Error(data.message ?? '문의를 불러오지 못했습니다.');
        }
        return data.item;
      })
      .then((next) => {
        if (!cancelled) {
          setItem(next);
          setAnswer(next.answer);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : '문의를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;
    setError(null);
    setSuccess(null);
    setPending(true);
    try {
      const response = await fetch(`/api/admin/sell-inquiries/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      const data = await readApiJson<{ ok?: boolean; item?: AdminSellInquiryRow; message?: string }>(
        response,
        '답변을 저장하지 못했습니다.',
      );
      if (!response.ok || !data.ok || !data.item) {
        setError(data.message ?? '답변을 저장하지 못했습니다.');
        return;
      }
      setItem(data.item);
      setAnswer(data.item.answer);
      setSuccess('답변을 저장했습니다.');
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : '답변을 저장하지 못했습니다.');
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  if (error && !item) {
    return (
      <div className="space-y-5">
        <PageBack href="/admin/sell-inquiries" />
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">{error}</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="space-y-5">
        <PageBack href="/admin/sell-inquiries" />
        <p className="text-sm text-muted">없는 문의입니다.</p>
      </div>
    );
  }

  const answered = isInquiryAnswered(item);

  return (
    <div className="space-y-5">
      <PageBack href="/admin/sell-inquiries" />

      <article className="panel px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-ink">{item.listingTitle}</h1>
            <p className="mt-1 text-sm text-muted">상품 문의</p>
          </div>
          <span className="text-sm font-semibold text-muted">{answered ? '답변 완료' : '미답변'}</span>
        </div>

        <dl className="mt-5 space-y-2 border-t border-line pt-5">
          <Field label="구매자" value={item.buyerName} />
          <Field label="등록일" value={formatMemberJoinedAt(item.createdAt)} />
        </dl>

        <div className="mt-4">
          <Link href={`/sell/${item.listingId}`} target="_blank" rel="noopener noreferrer" className="btn-chip">
            상품 보기
          </Link>
        </div>

        <section className="mt-5 border-t border-line pt-5">
          <h2 className="text-sm font-bold text-ink">문의 내용</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">{item.question}</p>
        </section>

        <form className="mt-5 border-t border-line pt-5" onSubmit={(event) => void handleSubmit(event)}>
          <h2 className="text-sm font-bold text-ink">답변</h2>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className={`${inputClassName} mt-3 min-h-36 py-3`}
            placeholder="답변을 입력해 주세요."
            required
          />
          {error ? (
            <p className="mt-2 text-sm text-danger" role="alert">{error}</p>
          ) : null}
          {success ? (
            <p className="mt-2 text-sm font-medium text-ink" role="status">{success}</p>
          ) : null}
          {answered && item.answeredAt ? (
            <p className="mt-2 text-xs text-subtle">마지막 답변 · {formatMemberJoinedAt(item.answeredAt) || '—'}</p>
          ) : null}
          <button type="submit" disabled={pending} className="btn-primary mt-4 w-full sm:w-auto">
            {pending ? '저장 중…' : answered ? '답변 수정' : '답변하기'}
          </button>
        </form>
      </article>
    </div>
  );
}
