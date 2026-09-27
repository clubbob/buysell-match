'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { inputClassName } from '@/features/auth/auth-errors';
import DefaultAddressBadge from '@/components/ui/DefaultAddressBadge';
import { useBuyerProfile } from '@/features/buyer/use-buyer-profile';
import { loginHref } from '@/lib/auth-redirect';
import { defaultBuyerAddress, hasBuyerProfile } from '@/types/buyer';
import { confirmSellJoins, createSellJoin, fetchSellJoins } from '@/lib/sell-join-remote';
import { updateSellRemaining } from '@/lib/sell-remote';
import {
  formatCount,
  formatJoinParticipants,
  isDeadlinePassed,
  isRemainingShort,
  joinAvailable,
  quantityAmount,
  replaceQuantityNumber,
} from '@/lib/sell-display';
import { openJoinSummary, openJoinTotal, type OpenJoinSummary, type SellJoin } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';

export default function SellJoinSection({
  item,
  onRemainingChange,
  onJoinChange,
}: {
  item: SellListing;
  onRemainingChange?: () => void;
  onJoinChange?: (summary: OpenJoinSummary) => void;
}) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { profile: buyerProfile, ready: buyerReady } = useBuyerProfile(user?.uid);
  const [joins, setJoins] = useState<SellJoin[]>([]);
  const [deliveryAddressId, setDeliveryAddressId] = useState('');
  const [ready, setReady] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const min = quantityAmount(item.minPurchaseLabel) ?? 0;
  const remaining = quantityAmount(item.remainingLabel) ?? 0;
  const limit = quantityAmount(item.limitLabel || item.quantityLabel || item.remainingLabel) ?? remaining;
  const remainingShort = isRemainingShort(item.minPurchaseLabel, item.remainingLabel);
  const deadlinePassed = isDeadlinePassed(item.deadline);
  const joinSummary = useMemo(() => openJoinSummary(joins), [joins]);
  const gathered = joinSummary.quantity;
  const confirmedTotal = useMemo(
    () => joins.filter((join) => join.status === 'confirmed').reduce((sum, join) => sum + join.quantity, 0),
    [joins],
  );
  const available = joinAvailable(limit, remaining, gathered);
  const canMoreTrade = remaining >= min && min > 0 && !deadlinePassed;
  const canConfirm = gathered >= min && min > 0 && canMoreTrade;
  const isOwner = Boolean(user && user.uid === item.sellerId);
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

  useEffect(() => {
    onJoinChange?.(joinSummary);
  }, [joinSummary, onJoinChange]);

  useEffect(() => {
    if (!buyerProfile) return;
    setDeliveryAddressId((current) =>
      buyerProfile.addresses.some((item) => item.id === current) ? current : buyerProfile.defaultAddressId,
    );
  }, [buyerProfile]);

  async function handleJoin() {
    setError(null);
    if (!user) {
      router.push(loginHref(`/sell/${item.id}`));
      return;
    }
    if (isOwner) {
      setError('내 상품에는 참여할 수 없습니다.');
      return;
    }
    if (remainingShort || deadlinePassed) return;
    if (!hasBuyerProfile(buyerProfile)) {
      router.push('/buyer/profile');
      return;
    }
    const delivery =
      buyerProfile.addresses.find((item) => item.id === deliveryAddressId) ?? defaultBuyerAddress(buyerProfile);
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
        buyerAddress: delivery.address,
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

  const people = formatJoinParticipants(joinSummary.buyers, gathered);
  const currentJoin = people ? `현재 ${people}` : '현재 구매 참여 없음';
  const need = Math.max(0, min - gathered);
  const statusText = remainingShort
    ? '잔여가 공구 최소 주문보다 적어 구매 참여를 받을 수 없습니다.'
    : deadlinePassed
      ? '마감된 상품입니다.'
      : available === 0 && gathered > 0
        ? `${currentJoin}. 이번 수량이 찼습니다.`
        : gathered >= min
          ? `${currentJoin}. 최소 주문을 채웠습니다.`
          : `${currentJoin}. 최소 주문까지 ${formatCount(need)} 남음.`;

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
        ) : loading ? (
          <button type="button" className="btn-primary" disabled>
            불러오는 중…
          </button>
        ) : !user ? (
          <Link href={loginHref(`/sell/${item.id}`)} className="btn-primary">
            구매 참여
          </Link>
        ) : alreadyJoined ? (
          <button type="button" className="btn-primary" disabled>
            이번 참여 완료
          </button>
        ) : available === 0 && !isOwner ? (
          <button type="button" className="btn-primary" disabled>
            이번 수량 마감
          </button>
        ) : isOwner ? (
          <button type="button" className="btn-primary" disabled={!canConfirm || pending} onClick={() => void handleConfirm()}>
            {pending ? '처리 중…' : canConfirm ? '판매 확정' : '판매 확정 대기'}
          </button>
        ) : (
          <>
            {!buyerReady ? (
              <p className="w-full text-center text-sm text-muted">배송 주소를 불러오는 중…</p>
            ) : !hasBuyerProfile(buyerProfile) ? (
              <div className="w-full space-y-2 text-center">
                <p className="text-sm text-muted">구매 참여 전에 배송 주소를 등록해 주세요.</p>
                <Link href="/buyer/profile" className="btn-secondary">
                  구매자 정보 등록
                </Link>
              </div>
            ) : (
              <fieldset className="w-full max-w-md space-y-2 text-left">
                <legend className="text-sm font-semibold text-ink">배송 주소</legend>
                {buyerProfile.addresses.map((item, index) => (
                  <label key={item.id} className="flex items-start gap-2 text-sm text-ink">
                    <input
                      type="radio"
                      name="joinAddress"
                      className="mt-0.5 h-4 w-4 accent-ink"
                      checked={deliveryAddressId === item.id}
                      onChange={() => setDeliveryAddressId(item.id)}
                    />
                    <span>
                      <span className="inline-flex flex-wrap items-center gap-2 font-semibold">
                        배송 주소 {index + 1}
                        {item.id === buyerProfile.defaultAddressId ? <DefaultAddressBadge /> : null}
                      </span>
                      <span className="mt-0.5 block text-muted">{item.address}</span>
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            {hasBuyerProfile(buyerProfile) ? (
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
            ) : null}
          </>
        )}
        <Link href="/sell" className="btn-secondary">
          목록으로
        </Link>
      </div>
    </div>
  );
}
