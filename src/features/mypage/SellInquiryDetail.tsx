'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageBack from '@/components/ui/PageBack';
import PageIntro from '@/components/ui/PageIntro';
import { fetchMySellInquiry } from '@/lib/sell-inquiry-remote';
import { sellDetailHref } from '@/lib/mypage-nav';
import { formatMemberJoinedAt } from '@/types/member';
import { isInquiryAnswered, type SellInquiryDetail } from '@/types/sell-inquiry';

export default function SellInquiryDetail({ id, backHref }: { id: string; backHref: string }) {
  const [item, setItem] = useState<SellInquiryDetail | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchMySellInquiry(id)
      .then((next) => {
        if (!cancelled) setItem(next);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : '문의를 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const pageIntro = (
    <PageIntro title="상품 문의 상세" description="남긴 문의와 답변을 확인합니다.">
      <PageBack href={backHref} />
    </PageIntro>
  );

  if (!ready) {
    return (
      <div className="space-y-5">
        {pageIntro}
        <p className="text-sm text-muted">불러오는 중…</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="space-y-5">
        {pageIntro}
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error ?? '없는 문의입니다.'}
        </p>
      </div>
    );
  }

  const answered = isInquiryAnswered(item);

  return (
    <div className="space-y-5">
      {pageIntro}

      <article className="panel px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-ink">{item.listingTitle}</h2>
            <p className="mt-1 text-sm text-muted">상품 문의</p>
          </div>
          <span className="text-sm font-semibold text-muted">{answered ? '답변 완료' : '답변 대기'}</span>
        </div>

        <p className="mt-4 text-xs text-subtle">{formatMemberJoinedAt(item.createdAt) || '—'}</p>

        <div className="mt-3">
          <Link
            href={sellDetailHref(item.listingId, { from: 'mypage', mypageTab: 'buy' })}
            className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
          >
            상품 보기
          </Link>
        </div>

        <section className="mt-5 border-t border-line pt-5">
          <h2 className="text-sm font-bold text-ink">문의 내용</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">{item.question}</p>
        </section>

        <section className="mt-5 border-t border-line pt-5">
          <h2 className="text-sm font-bold text-ink">답변</h2>
          {answered ? (
            <div className="mt-3 border-l-2 border-ink pl-3">
              <p className="text-xs text-subtle">답변 · {formatMemberJoinedAt(item.answeredAt) || '—'}</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{item.answer}</p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">답변을 준비 중입니다.</p>
          )}
        </section>
      </article>
    </div>
  );
}
