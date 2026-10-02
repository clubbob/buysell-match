'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageBack from '@/components/ui/PageBack';
import PageIntro from '@/components/ui/PageIntro';
import { inputClassName } from '@/features/auth/auth-errors';
import { createMySiteInquiry, fetchMySiteInquiries } from '@/lib/site-inquiry-remote';
import { SITE_COMPANY } from '@/lib/site';
import { formatMemberJoinedAt } from '@/types/member';
import {
  isSiteInquiryAnswered,
  SITE_INQUIRY_CATEGORY_LABELS,
  type SiteInquiry,
  type SiteInquiryCategory,
} from '@/types/site-inquiry';

const CATEGORIES: SiteInquiryCategory[] = ['service', 'account', 'trade', 'other'];

function InquiryHistoryItem({ item }: { item: SiteInquiry }) {
  const answered = isSiteInquiryAnswered(item);

  return (
    <li className="border-t border-line px-4 py-4 first:border-t-0 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-ink">{item.subject}</p>
        <span className="text-xs font-medium text-muted">{SITE_INQUIRY_CATEGORY_LABELS[item.category]}</span>
      </div>
      <p className="mt-1 text-xs text-subtle">{formatMemberJoinedAt(item.createdAt) || '—'}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">{item.question}</p>
      {answered ? (
        <div className="mt-3 border-l-2 border-ink pl-3">
          <p className="text-xs text-subtle">답변 · {formatMemberJoinedAt(item.answeredAt) || '—'}</p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">{item.answer}</p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">답변을 준비 중입니다.</p>
      )}
    </li>
  );
}

export default function ContactClient() {
  const [items, setItems] = useState<SiteInquiry[]>([]);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState<SiteInquiryCategory>('service');
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchMySiteInquiries()
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : '문의 내역을 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);
    try {
      const item = await createMySiteInquiry({ category, subject, question });
      setItems((current) => [item, ...current]);
      setSubject('');
      setQuestion('');
      setSuccess('문의를 접수했습니다. 답변은 아래 내역에서 확인할 수 있습니다.');
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : '문의를 등록하지 못했습니다.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageIntro
        title="문의하기"
        description={`${SITE_COMPANY.legalName} 운영팀에 서비스 이용 문의를 남깁니다. 회원가입한 회원만 이용할 수 있습니다.`}
      >
        <PageBack href="/mypage?tab=inquiries" />
      </PageIntro>

      <section className="panel px-4 py-5 sm:px-6 sm:py-6">
        <h2 className="text-sm font-bold text-ink">새 문의</h2>
        <p className="mt-1 text-sm text-muted">서비스 이용, 계정, 기타 궁금한 점을 남겨 주세요. 답변은 아래 내역에서 확인할 수 있습니다.</p>
        {category === 'trade' ? (
          <p className="mt-2 text-sm text-muted">
            판매자·구매자 간 거래 분쟁은{' '}
            <Link href="/dispute" className="font-semibold text-ink underline-offset-2 hover:underline">
              분쟁 해결 안내
            </Link>
            를 먼저 확인해 주세요.
          </p>
        ) : null}

        <form className="mt-4 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">문의 유형</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as SiteInquiryCategory)}
              className={inputClassName}
            >
              {CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {SITE_INQUIRY_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">제목</span>
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className={inputClassName}
              placeholder="문의 제목을 입력해 주세요."
              maxLength={80}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">문의 내용</span>
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className={`${inputClassName} min-h-36 py-3`}
              placeholder="문의 내용을 자세히 적어 주세요."
              required
            />
          </label>

          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm font-medium text-ink" role="status">
              {success}
            </p>
          ) : null}

          <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
            {pending ? '등록 중…' : '문의하기'}
          </button>
        </form>
      </section>

      <section className="panel overflow-hidden">
        <header className="border-b border-line px-4 py-3.5 sm:px-6">
          <h2 className="text-[15px] font-bold text-ink">내 문의 내역</h2>
          <p className="mt-0.5 text-sm text-muted">접수한 문의와 답변을 확인합니다.</p>
        </header>
        {!ready ? (
          <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">불러오는 중…</p>
        ) : items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">아직 남긴 문의가 없습니다.</p>
        ) : (
          <ul>
            {items.map((item) => (
              <InquiryHistoryItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
