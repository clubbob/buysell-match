'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageIntro from '@/components/ui/PageIntro';
import { readApiJson } from '@/lib/api-json';
import { BUYER_DETAIL_LABEL, SELLER_DETAIL_LABEL } from '@/lib/profile-labels';
import { hasBuyerProfile } from '@/types/buyer';
import { formatMemberJoinedAt, type MemberRecord } from '@/types/member';
import { hasSellerProfile } from '@/types/seller';

function buyerLabel(item: MemberRecord) {
  return hasBuyerProfile(item.buyer) ? '등록' : '—';
}

function sellerLabel(item: MemberRecord) {
  return hasSellerProfile(item.seller) ? '등록' : '—';
}

function memberTitle(item: MemberRecord) {
  return item.member.name || item.member.email || '이름 없음';
}

function DesktopRow({ item }: { item: MemberRecord }) {
  const router = useRouter();

  return (
    <tr
      className="cursor-pointer border-t border-line hover:bg-slate-50"
      onClick={() => router.push(`/admin/members/${item.member.id}`)}
    >
      <td className="px-4 py-3 align-middle text-sm font-semibold text-ink">{memberTitle(item)}</td>
      <td className="px-3 py-3 align-middle text-sm text-ink break-all">{item.member.email || '—'}</td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">
        {formatMemberJoinedAt(item.member.createdAt) || '—'}
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{buyerLabel(item)}</td>
      <td className="px-4 py-3 align-middle text-sm text-ink">{sellerLabel(item)}</td>
    </tr>
  );
}

function MobileRow({ item }: { item: MemberRecord }) {
  return (
    <li className="border-t border-line">
      <Link href={`/admin/members/${item.member.id}`} className="block px-4 py-3">
        <p className="text-sm font-semibold text-ink">{memberTitle(item)}</p>
        <p className="mt-1 text-sm text-muted">{item.member.email || '이메일 없음'}</p>
        <p className="mt-1 text-sm text-ink">
          가입 {formatMemberJoinedAt(item.member.createdAt) || '—'}
          <span className="mx-1.5 text-subtle">·</span>
          {BUYER_DETAIL_LABEL} {buyerLabel(item)}
          <span className="mx-1.5 text-subtle">·</span>
          {SELLER_DETAIL_LABEL} {sellerLabel(item)}
        </p>
      </Link>
    </li>
  );
}

export default function AdminMembers() {
  const [items, setItems] = useState<MemberRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/admin/members')
      .then(async (response) => {
        const data = await readApiJson<{ ok?: boolean; items?: MemberRecord[]; message?: string }>(
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

  return (
    <div className="space-y-5">
      <PageIntro title="회원정보" description="가입한 회원을 목록으로 보고, 눌러서 세부 정보를 확인합니다." />
      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {!ready ? (
        <p className="text-sm text-muted">불러오는 중…</p>
      ) : error ? null : items.length === 0 ? (
        <p className="panel px-4 py-10 text-center text-sm text-muted">아직 등록된 회원이 없습니다.</p>
      ) : (
        <section className="panel min-w-0 overflow-hidden">
          <header className="border-b border-line px-4 py-3.5">
            <h2 className="text-[15px] font-bold text-ink">전체</h2>
            <p className="mt-0.5 text-sm text-muted">{items.length}명</p>
          </header>
          <table className="hidden w-full table-fixed lg:table">
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[30%]" />
              <col className="w-[14%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-subtle">
                <th className="px-4 py-2">이름</th>
                <th className="px-3 py-2">이메일</th>
                <th className="px-3 py-2">가입 일자</th>
                <th className="px-3 py-2">{BUYER_DETAIL_LABEL}</th>
                <th className="px-4 py-2">{SELLER_DETAIL_LABEL}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <DesktopRow key={item.member.id} item={item} />
              ))}
            </tbody>
          </table>
          <ul className="lg:hidden">
            {items.map((item) => (
              <MobileRow key={item.member.id} item={item} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
