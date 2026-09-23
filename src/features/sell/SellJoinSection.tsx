'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useUserMode } from '@/features/mode/mode-context';
import { inputClassName } from '@/features/auth/auth-errors';
import { loginHref } from '@/lib/auth-redirect';
import { confirmSellJoins, createSellJoin, fetchSellJoins } from '@/lib/sell-join-remote';
import { updateSellRemaining } from '@/lib/sell-remote';
import {
  isDeadlinePassed,
  isRemainingShort,
  joinAvailable,
  quantityAmount,
  replaceQuantityNumber,
} from '@/lib/sell-display';
import { openJoinTotal, type SellJoin } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';

export default function SellJoinSection({
  item,
  onRemainingChange,
}: {
  item: SellListing;
  onRemainingChange?: () => void;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { mode } = useUserMode();
  const [joins, setJoins] = useState<SellJoin[]>([]);
  const [ready, setReady] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const min = quantityAmount(item.minPurchaseLabel) ?? 0;
  const remaining = quantityAmount(item.remainingLabel) ?? 0;
  const limit = quantityAmount(item.limitLabel || item.quantityLabel || item.remainingLabel) ?? remaining;
  const remainingShort = isRemainingShort(item.minPurchaseLabel, item.remainingLabel);
  const deadlinePassed = isDeadlinePassed(item.deadline);
  const gathered = useMemo(() => openJoinTotal(joins), [joins]);
  const confirmedTotal = useMemo(
    () => joins.filter((join) => join.status === 'confirmed').reduce((sum, join) => sum + join.quantity, 0),
    [joins],
  );
  const available = joinAvailable(limit, remaining, gathered);
  const canMoreTrade = remaining >= min && min > 0 && !deadlinePassed;
  const canConfirm = gathered >= min && min > 0 && canMoreTrade;
  const isOwner = Boolean(user && (user.uid === item.sellerId || (item.id.startsWith('s') && mode === 'seller')));
  const alreadyJoined = Boolean(user && joins.some((join) => join.buyerId === user.uid && join.status === 'open'));

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

  async function handleJoin() {
    setError(null);
    if (!user) {
      router.push(loginHref('buyer', `/sell/${item.id}`));
      return;
    }
    if (isOwner) {
      setError('내 상품에는 참여할 수 없습니다.');
      return;
    }
    if (remainingShort || deadlinePassed) return;
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount <= 0) {
      setError('참여 수량은 1 이상 숫자로 입력해 주세요.');
      return;
    }
    if (amount > available) {
      setError(
        `지금 참여 가능 수량은 ${available.toLocaleString('ko-KR')}개입니다. 이 상품의 한계 수량은 ${limit.toLocaleString('ko-KR')}개이고, 이미 ${gathered.toLocaleString('ko-KR')}개가 참여했습니다.`,
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
        quantity: amount,
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      setJoins((current) => [join, ...current]);
      setQuantity('1');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '참여에 실패했습니다.');
    } finally {
      setPending(false);
    }
  }

  async function handleConfirm() {
    setError(null);
    if (!isOwner || !canConfirm) return;
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

  const statusText = remainingShort
    ? '잔여가 공동구매 최소 주문보다 적어 추가 거래를 할 수 없습니다.'
    : deadlinePassed
      ? '마감된 상품입니다.'
      : available === 0 && gathered > 0
        ? `이번 참여 ${gathered.toLocaleString('ko-KR')}개가 잔여만큼 찼습니다. 판매 확정 후 잔여가 최소 이상이면 추가 거래합니다.`
        : `이번 참여 ${gathered.toLocaleString('ko-KR')} · 지금 참여 가능 ${available.toLocaleString('ko-KR')} · 최소 ${min.toLocaleString('ko-KR')} · 잔여 ${remaining.toLocaleString('ko-KR')}${
            confirmedTotal > 0 ? ` · 이전 거래 ${confirmedTotal.toLocaleString('ko-KR')}` : ''
          }. 마감 전까지 최소가 모이면 거래하고, 잔여가 있으면 추가 거래합니다.`;

  return (
    <div className="border-t border-line px-4 py-4 sm:px-6">
      <p className="mb-3 text-center text-sm text-muted">{ready ? statusText : '참여 현황을 불러오는 중…'}</p>
      {error ? (
        <p className="mb-3 text-center text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        {remainingShort ? (
          <button type="button" className="btn-primary" disabled>
            잔여 부족
          </button>
        ) : deadlinePassed ? (
          <button type="button" className="btn-primary" disabled>
            마감
          </button>
        ) : available === 0 && !isOwner ? (
          <button type="button" className="btn-primary" disabled>
            이번 수량 마감
          </button>
        ) : isOwner ? (
          <button type="button" className="btn-primary" disabled={!canConfirm || pending} onClick={() => void handleConfirm()}>
            {pending ? '처리 중…' : canConfirm ? '판매 확정' : canMoreTrade ? '추가 거래 대기' : '판매 확정 대기'}
          </button>
        ) : loading ? (
          <button type="button" className="btn-primary" disabled>
            불러오는 중…
          </button>
        ) : !user ? (
          <Link href={loginHref('buyer', `/sell/${item.id}`)} className="btn-primary">
            구매 참여
          </Link>
        ) : alreadyJoined ? (
          <button type="button" className="btn-primary" disabled>
            이번 참여 완료
          </button>
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
            <button type="button" className="btn-primary" disabled={pending} onClick={() => void handleJoin()}>
              {pending ? '처리 중…' : '구매 참여'}
            </button>
          </>
        )}
        <Link href="/sell" className="btn-secondary">
          목록으로
        </Link>
      </div>
    </div>
  );
}
