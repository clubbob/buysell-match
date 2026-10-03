'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import SellBuyerInquiryForm from '@/features/mypage/SellBuyerInquiryForm';
import { loginHref } from '@/lib/auth-redirect';
import { mypageBuyInquiryHref } from '@/lib/mypage-nav';
import { fetchSellJoinsByBuyer } from '@/lib/sell-join-remote';
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
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<SellInquiry[]>([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [joinReady, setJoinReady] = useState(false);
  const [hasBuyerJoin, setHasBuyerJoin] = useState(false);
  const isOwner = Boolean(user && user.uid === item.sellerId);
  const loginPath = loginHref(`/sell/${item.id}?tab=inquiries`);

  const reloadInquiries = useCallback(async () => {
    setLoadError(null);
    try {
      const next = await fetchSellInquiries(item.id);
      setItems(next);
      return next;
    } catch (error: unknown) {
      setItems([]);
      setLoadError(error instanceof Error ? error.message : '상품 문의를 불러오지 못했습니다.');
      return [];
    }
  }, [item.id]);

  useEffect(() => {
    let cancelled = false;
    void reloadInquiries()
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadInquiries]);

  useEffect(() => {
    if (!user || isOwner) {
      setHasBuyerJoin(false);
      setJoinReady(true);
      return;
    }

    let cancelled = false;
    setJoinReady(false);
    void fetchSellJoinsByBuyer(user.uid)
      .then((joins) => {
        if (!cancelled) setHasBuyerJoin(joins.some((join) => join.listingId === item.id));
      })
      .catch(() => {
        if (!cancelled) setHasBuyerJoin(false);
      })
      .finally(() => {
        if (!cancelled) setJoinReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, isOwner, item.id]);

  useEffect(() => {
    if (ready) onCountChange?.(items.length);
  }, [items.length, ready, onCountChange]);

  return (
    <div>
      <div className="border-b border-line px-4 py-4 sm:px-6">
        {authLoading || !joinReady ? (
          <p className="text-sm text-muted">불러오는 중…</p>
        ) : isOwner ? (
          <p className="text-sm leading-relaxed text-muted">구매자가 남긴 문의는 아래에서 확인할 수 있습니다.</p>
        ) : user ? (
          hasBuyerJoin ? (
            <SellBuyerInquiryForm
              listingId={item.id}
              buyerId={user.uid}
              showHistory={false}
              onCreated={() => void reloadInquiries()}
            />
          ) : (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed text-muted">
                상품 문의는 구매 신청한 회원만 남길 수 있습니다. 먼저 구매 신청을 완료해 주세요.
              </p>
              <div className="flex justify-center sm:justify-start">
                <Link href={mypageBuyInquiryHref(item.id)} className="btn-secondary">
                  나의 구매 현황에서 문의
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="flex justify-center sm:justify-start">
            <Link href={loginPath} className="btn-secondary">
              로그인 후 문의
            </Link>
          </div>
        )}
      </div>

      {loadError ? (
        <p className="mx-4 mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger sm:mx-6" role="alert">
          {loadError}
        </p>
      ) : null}

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
