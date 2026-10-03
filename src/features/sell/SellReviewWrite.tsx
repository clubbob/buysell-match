'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { inputClassName } from '@/features/auth/auth-errors';
import { createSellerReview, fetchBuyerReviewForListing } from '@/lib/seller-review-remote';
import { fetchSellJoins } from '@/lib/sell-join-remote';
import { isJoinPaid, isJoinShipped, type SellJoin } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';

export default function SellReviewWrite({ item, onCreated }: { item: SellListing; onCreated?: () => void }) {
  const { user } = useAuth();
  const [join, setJoin] = useState<SellJoin | null>(null);
  const [existing, setExisting] = useState(false);
  const [ready, setReady] = useState(false);
  const [rating, setRating] = useState('5');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) {
      setReady(true);
      return;
    }
    let cancelled = false;
    void Promise.all([fetchSellJoins(item.id), fetchBuyerReviewForListing(user.uid, item.id)])
      .then(([joins, review]) => {
        if (cancelled) return;
        const eligible = joins.find(
          (entry) =>
            entry.buyerId === user.uid &&
            entry.status === 'confirmed' &&
            isJoinPaid(entry) &&
            isJoinShipped(entry),
        );
        setJoin(eligible ?? null);
        setExisting(Boolean(review));
      })
      .catch(() => {
        if (!cancelled) {
          setJoin(null);
          setExisting(false);
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [item.id, user]);

  if (!ready || !user || !join || existing || done) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!user || !join) return;
    const nextRating = Number(rating);
    const nextContent = content.trim();
    if (!nextContent) {
      setError('후기 내용을 입력해 주세요.');
      return;
    }

    setPending(true);
    try {
      await createSellerReview({
        listingId: item.id,
        rating: nextRating,
        content: nextContent,
      });
      setDone(true);
      onCreated?.();
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : '후기 등록에 실패했습니다.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="w-full border border-line bg-slate-50 px-4 py-4 sm:px-5" onSubmit={(event) => void handleSubmit(event)}>
      <h3 className="text-sm font-bold text-ink">구매자 후기 작성</h3>
      <p className="mt-1 text-sm text-muted">배송 완료된 구매에 한해 후기를 남길 수 있습니다.</p>
      <label className="mt-4 block space-y-1.5">
        <span className="text-sm font-semibold text-ink">별점</span>
        <select value={rating} onChange={(event) => setRating(event.target.value)} className={inputClassName}>
          <option value="5">5점</option>
          <option value="4">4점</option>
          <option value="3">3점</option>
          <option value="2">2점</option>
          <option value="1">1점</option>
        </select>
      </label>
      <label className="mt-3 block space-y-1.5">
        <span className="text-sm font-semibold text-ink">후기</span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className={`${inputClassName} min-h-28`}
          placeholder="상품과 배송 경험을 적어 주세요."
          required
        />
      </label>
      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn-primary mt-4" disabled={pending}>
        {pending ? '등록 중…' : '후기 등록'}
      </button>
    </form>
  );
}
