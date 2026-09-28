'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { inputClassName } from '@/features/auth/auth-errors';
import { useBuyerProfile } from '@/features/buyer/use-buyer-profile';
import { useUserMode } from '@/features/mode/mode-context';
import { loginHref } from '@/lib/auth-redirect';
import { BUYER_DETAIL_LABEL } from '@/lib/profile-labels';
import { defaultBuyerAddress, hasBuyerProfile } from '@/types/buyer';
import { confirmSellJoins, createSellJoin, fetchSellJoins } from '@/lib/sell-join-remote';
import { updateSellRemaining } from '@/lib/sell-remote';
import {
  formatCount,
  isDeadlinePassed,
  isRemainingShort,
  joinAvailable,
  quantityAmount,
  replaceQuantityNumber,
} from '@/lib/sell-display';
import { openJoinSummary, openJoinTotal, type OpenJoinSummary, type SellJoin } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';
import SellJoinHistoryTable from '@/features/sell/SellJoinHistoryTable';

export default function SellJoinSection({
  item,
  from,
  onRemainingChange,
  onJoinChange,
  onJoinsLoaded,
}: {
  item: SellListing;
  from?: string;
  onRemainingChange?: () => void;
  onJoinChange?: (summary: OpenJoinSummary) => void;
  onJoinsLoaded?: (joins: SellJoin[]) => void;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { mode } = useUserMode();
  const { profile: buyerProfile, ready: buyerReady } = useBuyerProfile(user?.uid);
  const [joins, setJoins] = useState<SellJoin[]>([]);
  const [ready, setReady] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const min = quantityAmount(item.minPurchaseLabel) ?? 0;
  const remaining = quantityAmount(item.remainingLabel) ?? 0;
  const limit = quantityAmount(item.limitLabel || item.quantityLabel || item.remainingLabel) ?? remaining;
  const remainingShort = isRemainingShort(item.minPurchaseLabel, item.remainingLabel);
  const deadlinePassed = isDeadlinePassed(item.deadline);
  const joinSummary = useMemo(() => openJoinSummary(joins), [joins]);
  const gathered = joinSummary.quantity;
  const available = joinAvailable(limit, remaining, gathered);
  const canMoreTrade = remaining >= min && min > 0 && !deadlinePassed;
  const canConfirm = gathered >= min && min > 0 && canMoreTrade;
  const isOwner = Boolean(user && user.uid === item.sellerId);
  const isBuyer = mode === 'buyer';
  const showSellerTools = isOwner && mode === 'seller';
  const showConfirm = showSellerTools && from === 'mypage';
  const showJoinCta = !user || isBuyer;
  const myJoins = user ? joins.filter((join) => join.buyerId === user.uid) : [];

  useEffect(() => {
    let cancelled = false;
    void fetchSellJoins(item.id)
      .then((items) => {
        if (!cancelled) setJoins(items);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  useEffect(() => {
    onJoinChange?.(joinSummary);
  }, [joinSummary, onJoinChange]);

  useEffect(() => {
    if (ready) onJoinsLoaded?.(joins);
  }, [ready, joins, onJoinsLoaded]);

  async function handleJoin() {
    setError(null);
    setNotice(null);
    if (!user) {
      router.push(loginHref(`/sell/${item.id}`));
      return;
    }
    if (mode !== 'buyer') {
      setError('구매자로 이용할 때만 참여할 수 있습니다.');
      return;
    }
    if (remainingShort || deadlinePassed) return;
    if (!hasBuyerProfile(buyerProfile)) {
      router.push(`/buyer/profile?next=${encodeURIComponent(`/sell/${item.id}`)}`);
      return;
    }
    const delivery = defaultBuyerAddress(buyerProfile);
    if (!delivery?.address) {
      setError('주문에 쓸 배송 주소를 골라 주세요.');
      return;
    }
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount <= 0) {
      setError('참여 수량은 1 이상 숫자로 입력해 주세요.');
      return;
    }
    if (amount > available) {
      setError(
        `지금 더 받을 수 있는 수량은 ${formatCount(available)}입니다. 한계 ${formatCount(limit)} 중 이미 ${formatCount(gathered)}가 참여했습니다.`,
      );
      return;
    }

    setPending(true);
    try {
      const join = await createSellJoin({
        id: `j-${crypto.randomUUID()}`,
        listingId: item.id,
        sellerId: item.sellerId,
        buyerId: user.uid,
        buyerEmail: user.email ?? '',
        buyerName: user.displayName?.trim() || '',
        buyerAddress: delivery.address,
        quantity: amount,
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      setJoins((current) => [join, ...current]);
      setQuantity('1');
      setNotice(`${formatCount(amount)} 구매 참여가 접수되었습니다.`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '참여에 실패했습니다.');
    } finally {
      setPending(false);
    }
  }

  async function handleConfirm() {
    setError(null);
    if (!isOwner || !canConfirm || from !== 'mypage') return;
    setPending(true);
    try {
      const openJoins = joins.filter((join) => join.status === 'open');
      const confirmedAmount = Math.min(openJoinTotal(openJoins), remaining);
      await confirmSellJoins(openJoins);
      const nextRemaining = Math.max(0, remaining - confirmedAmount);
      const nextLabel = replaceQuantityNumber(item.remainingLabel, nextRemaining);
      await updateSellRemaining(item.id, nextLabel);
      setJoins((current) => current.map((join) => (join.status === 'open' ? { ...join, status: 'confirmed' } : join)));
      onRemainingChange?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '판매 확정에 실패했습니다.');
    } finally {
      setPending(false);
    }
  }

  if (!showSellerTools && !showJoinCta && myJoins.length === 0 && !error) {
    return null;
  }

  return (
    <div className="border-t border-line px-4 py-4 sm:px-6">
      {error ? (
        <p className="mb-3 text-center text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex w-full flex-col items-center gap-3">
        {showSellerTools || showJoinCta ? (
          !ready ? (
            <p className="w-full text-center text-sm text-muted">참여 내역을 불러오는 중…</p>
          ) : joins.length === 0 ? (
            <p className="w-full text-center text-sm text-muted">아직 구매 참여가 없습니다.</p>
          ) : (
            <div className="w-full">
              <SellJoinHistoryTable joins={joins} minQuantity={min > 0 ? min : null} />
            </div>
          )
        ) : myJoins.length > 0 ? (
          <div className="w-full">
            <SellJoinHistoryTable joins={myJoins} title="내 구매 참여" minQuantity={min > 0 ? min : null} />
          </div>
        ) : null}

        {showConfirm ? (
          canConfirm ? (
            <button type="button" className="btn-primary min-w-[12rem]" disabled={pending} onClick={() => void handleConfirm()}>
              {pending ? '처리 중…' : '판매 확정'}
            </button>
          ) : null
        ) : showJoinCta && notice ? (
          <>
            <p className="text-center text-sm font-semibold text-ink" role="status">
              {notice}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/buy" className="btn-secondary">
                삽니다
              </Link>
              <Link href="/mypage" className="btn-secondary">
                마이페이지
              </Link>
            </div>
          </>
        ) : showJoinCta ? (
          remainingShort ? (
            <button type="button" className="btn-primary min-w-[12rem]" disabled>
              잔여 부족
            </button>
          ) : deadlinePassed ? (
            <button type="button" className="btn-primary min-w-[12rem]" disabled>
              마감
            </button>
          ) : loading ? (
            <button type="button" className="btn-primary min-w-[12rem]" disabled>
              불러오는 중…
            </button>
          ) : !user ? (
            <Link href={loginHref(`/sell/${item.id}`)} className="btn-primary min-w-[12rem]">
              구매 참여
            </Link>
          ) : available === 0 ? (
            <button type="button" className="btn-primary min-w-[12rem]" disabled>
              이번 수량 마감
            </button>
          ) : !buyerReady ? (
            <p className="text-center text-sm text-muted">불러오는 중…</p>
          ) : (
            <>
              <label className="flex items-center gap-2 text-sm text-ink">
                <span className="whitespace-nowrap font-semibold">참여 수량</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(available, 1)}
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className={`${inputClassName} w-24`}
                />
              </label>
              <button type="button" className="btn-primary min-w-[12rem]" disabled={pending} onClick={() => void handleJoin()}>
                {pending ? '처리 중…' : '구매 참여'}
              </button>
              {!hasBuyerProfile(buyerProfile) ? (
                <p className="text-center text-sm text-muted">참여 전에 {BUYER_DETAIL_LABEL}이 필요합니다.</p>
              ) : null}
            </>
          )
        ) : null}
      </div>
    </div>
  );
}
