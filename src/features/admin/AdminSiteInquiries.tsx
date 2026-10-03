'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import AdminListFilters from '@/components/admin/AdminListFilters';
import PageIntro from '@/components/ui/PageIntro';
import { readApiJson } from '@/lib/api-json';
import { formatMemberJoinedAt } from '@/types/member';
import {
  isSiteInquiryAnswered,
  SITE_INQUIRY_CATEGORY_LABELS,
  type SiteInquiry,
} from '@/types/site-inquiry';

function statusLabel(item: SiteInquiry) {
  return isSiteInquiryAnswered(item) ? '답변 완료' : '미답변';
}

function DesktopRow({ item }: { item: SiteInquiry }) {
  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3 align-middle text-sm font-semibold text-ink">
        <span className="line-clamp-2">{item.subject}</span>
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{SITE_INQUIRY_CATEGORY_LABELS[item.category]}</td>
      <td className="px-3 py-3 align-middle text-sm text-ink">
        <span className="block">{item.memberName || '—'}</span>
        <span className="mt-0.5 block text-xs text-muted break-all">{item.memberEmail || '—'}</span>
      </td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">
        {formatMemberJoinedAt(item.createdAt) || '—'}
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{statusLabel(item)}</td>
      <td className="px-4 py-3 align-middle">
        <Link href={`/admin/inquiries/${item.id}`} className="btn-chip">
          {isSiteInquiryAnswered(item) ? '답변 보기' : '답변하기'}
        </Link>
      </td>
    </tr>
  );
}

function MobileRow({ item }: { item: SiteInquiry }) {
  return (
    <li className="border-t border-line px-4 py-3">
      <p className="text-sm font-semibold text-ink">{item.subject}</p>
      <p className="mt-1 text-sm text-muted">
        {SITE_INQUIRY_CATEGORY_LABELS[item.category]}
        <span className="mx-1.5 text-subtle">·</span>
        {statusLabel(item)}
      </p>
      <p className="mt-1 text-sm text-ink">
        {item.memberName || '회원'}
        <span className="mx-1.5 text-subtle">·</span>
        {formatMemberJoinedAt(item.createdAt) || '—'}
      </p>
      <div className="mt-3">
        <Link href={`/admin/inquiries/${item.id}`} className="btn-chip">
          {isSiteInquiryAnswered(item) ? '답변 보기' : '답변하기'}
        </Link>
      </div>
    </li>
  );
}

function inquiryFilterHref(status: 'all' | 'waiting', memberId: string | null) {
  const params = new URLSearchParams();
  if (status !== 'all') params.set('status', status);
  if (memberId) params.set('member', memberId);
  const query = params.toString();
  return query ? `/admin/inquiries?${query}` : '/admin/inquiries';
}

function parseInquiryStatus(value: string | null) {
  return value === 'waiting' ? 'waiting' : 'all';
}

export default function AdminSiteInquiries() {
  const searchParams = useSearchParams();
  const status = parseInquiryStatus(searchParams.get('status'));
  const memberId = searchParams.get('member');
  const inquiryFilters = useMemo(
    () => [
      { value: 'all', label: '전체', href: inquiryFilterHref('all', memberId) },
      { value: 'waiting', label: '미답변', href: inquiryFilterHref('waiting', memberId) },
    ],
    [memberId],
  );
  const [items, setItems] = useState<SiteInquiry[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/admin/inquiries')
      .then(async (response) => {
        const data = await readApiJson<{ ok?: boolean; items?: SiteInquiry[]; message?: string }>(
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

  const scopedItems = useMemo(() => {
    if (!memberId) return items;
    return items.filter((item) => item.memberId === memberId);
  }, [items, memberId]);

  const filteredItems = useMemo(() => {
    if (status === 'waiting') return scopedItems.filter((item) => !isSiteInquiryAnswered(item));
    return scopedItems;
  }, [scopedItems, status]);

  const waiting = scopedItems.filter((item) => !isSiteInquiryAnswered(item)).length;
  const sectionTitle = memberId ? '회원 서비스 문의' : status === 'waiting' ? '미답변' : '전체';

  return (
    <div className="space-y-5">
      <PageIntro title="서비스 문의" description="회원이 남긴 서비스 문의를 목록으로 보고, 상세에서 답변합니다." />
      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!ready ? (
        <p className="text-sm text-muted">불러오는 중…</p>
      ) : error && items.length === 0 ? null : items.length === 0 ? (
        <p className="panel px-4 py-10 text-center text-sm text-muted">아직 접수된 문의가 없습니다.</p>
      ) : scopedItems.length === 0 ? (
        <section className="panel min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <p className="text-sm text-muted">선택한 회원의 서비스 문의가 없습니다.</p>
            <Link href="/admin/inquiries" className="btn-chip">전체 보기</Link>
          </div>
        </section>
      ) : filteredItems.length === 0 ? (
        <section className="panel min-w-0 overflow-hidden">
          <AdminListFilters options={inquiryFilters} current={status} />
          <p className="px-4 py-10 text-center text-sm text-muted">미답변 서비스 문의가 없습니다.</p>
        </section>
      ) : (
        <section className="panel min-w-0 overflow-hidden">
          <header className="border-b border-line px-4 py-3.5">
            <h2 className="text-[15px] font-bold text-ink">{sectionTitle}</h2>
            <p className="mt-0.5 text-sm text-muted">
              {filteredItems.length}건{status === 'all' && !memberId && waiting > 0 ? ` · 미답변 ${waiting}` : ''}
              {memberId ? (
                <>
                  <span className="mx-1.5 text-subtle">·</span>
                  <Link href="/admin/inquiries" className="font-medium text-ink underline-offset-2 hover:underline">
                    전체 보기
                  </Link>
                </>
              ) : null}
            </p>
          </header>
          <AdminListFilters options={inquiryFilters} current={status} />
          <table className="hidden w-full table-fixed lg:table">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-subtle">
                <th className="px-4 py-2">제목</th>
                <th className="px-3 py-2">유형</th>
                <th className="px-3 py-2">회원</th>
                <th className="px-3 py-2">접수일</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-4 py-2">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <DesktopRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
          <ul className="lg:hidden">
            {filteredItems.map((item) => (
              <MobileRow key={item.id} item={item} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
