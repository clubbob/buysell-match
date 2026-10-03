'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import MyPageInquirySectionHeader from '@/components/mypage/MyPageInquirySectionHeader';
import { fetchMySiteInquiries } from '@/lib/site-inquiry-remote';
import { cn } from '@/lib/utils';
import { formatMemberJoinedAt } from '@/types/member';
import { isSiteInquiryAnswered, SITE_INQUIRY_CATEGORY_LABELS, type SiteInquiry } from '@/types/site-inquiry';

export default function MyPageSiteInquiries({ embedded = false }: { embedded?: boolean }) {
  const [items, setItems] = useState<SiteInquiry[]>([]);
  const [ready, setReady] = useState(false);
  const waiting = items.filter((item) => !isSiteInquiryAnswered(item));

  useEffect(() => {
    let cancelled = false;
    void fetchMySiteInquiries()
      .then((next) => {
        if (!cancelled) setItems(next);
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
  }, []);

  const preview = items.slice(0, 3);

  return (
    <section
      className={cn(
        'overflow-hidden border-l-4 border-l-teal-600',
        embedded ? 'border border-line border-l-teal-600 bg-teal-50/40' : 'panel bg-teal-50/40',
      )}
    >
      <MyPageInquirySectionHeader
        title="서비스 문의"
        tone="site"
        status={waiting.length > 0 ? `답변 대기 ${waiting.length}건` : null}
        description="플랫폼·이용 관련 문의입니다. 운영팀이 답변합니다."
      >
        <Link href="/contact" className="btn-secondary shrink-0">
          문의하기
        </Link>
      </MyPageInquirySectionHeader>

      {!ready ? (
        <p className="px-4 py-6 text-sm text-muted sm:px-5">불러오는 중…</p>
      ) : preview.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted sm:px-5">
          아직 남긴 문의가 없습니다.
          <span className="mt-1 block text-subtle">궁금한 점은 문의하기에서 남겨 주세요.</span>
        </p>
      ) : (
        <ul>
          {preview.map((item) => (
            <li key={item.id} className="border-t border-line">
              <Link href={`/contact/${item.id}?from=mypage`} className="block px-4 py-3 hover:bg-slate-50 sm:px-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-ink">{item.subject}</p>
                  <span className="text-xs font-medium text-muted">
                    {isSiteInquiryAnswered(item) ? '답변 완료' : '답변 대기'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-subtle">
                  {SITE_INQUIRY_CATEGORY_LABELS[item.category]}
                  <span className="mx-1.5">·</span>
                  {formatMemberJoinedAt(item.createdAt) || '—'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {ready && items.length > 3 ? (
        <div className="border-t border-line px-4 py-3 text-center sm:px-5">
          <Link href="/contact" className="text-sm font-semibold text-ink underline-offset-2 hover:underline">
            전체 문의 보기
          </Link>
        </div>
      ) : null}
    </section>
  );
}
