'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { mypageBuyInquiryHref } from '@/lib/mypage-nav';
import { fetchSellInquiries } from '@/lib/sell-inquiry-remote';
import { formatMemberJoinedAt } from '@/types/member';
import { isInquiryAnswered, type SellInquiry } from '@/types/sell-inquiry';
import type { SellListing } from '@/types/sell';

function InquiryItem({ item }: { item: SellInquiry }) {
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
  const [items, setItems] = useState<SellInquiry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchSellInquiries(item.id)
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
  }, [item.id]);

  useEffect(() => {
    if (ready) onCountChange?.(items.length);
  }, [items.length, ready, onCountChange]);

  return (
    <div>
      <div className="border-b border-line px-4 py-4 sm:px-6">
        <p className="text-sm leading-relaxed text-muted">
          상품 문의는 구매 신청한 회원만 나의 구매 현황에서 남길 수 있습니다.
        </p>
        <div className="mt-3 flex justify-center sm:justify-start">
          <Link href={mypageBuyInquiryHref(item.id)} className="btn-secondary">
            나의 구매 현황에서 문의
          </Link>
        </div>
      </div>

      {!ready ? (
        <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">불러오는 중…</p>
      ) : items.length > 0 ? (
        <ul className="divide-y divide-line">
          {items.map((inquiry) => (
            <InquiryItem key={inquiry.id} item={inquiry} />
          ))}
        </ul>
      ) : (
        <p className="px-4 py-10 text-center text-sm text-muted sm:px-6">아직 상품 문의가 없습니다.</p>
      )}
    </div>
  );
}
