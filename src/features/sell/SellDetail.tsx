'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PageBack from '@/components/ui/PageBack';
import { useAuth } from '@/features/auth/auth-context';
import { mypageHref, resolveSellBackHref } from '@/lib/mypage-nav';
import SellImageGallery from '@/features/sell/SellImageGallery';
import SellGuidePanel from '@/features/sell/SellGuidePanel';
import SellJoinSection from '@/features/sell/SellJoinSection';
import SellListingSpecs from '@/features/sell/SellListingSpecs';
import { SPEC_PANEL_PAD } from '@/features/sell/sell-spec-ui';
import type { JoinListSummary, SellJoin } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';

export default function SellDetail({
  item,
  from,
  tab,
  onRemainingChange,
  onListingDeleted,
}: {
  item: SellListing;
  from?: string;
  tab?: string;
  onRemainingChange?: () => void;
  onListingDeleted?: () => void;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [join, setJoin] = useState<JoinListSummary>({
    open: { quantity: 0, buyers: 0 },
    confirmed: { quantity: 0, buyers: 0 },
  });
  const [joins, setJoins] = useState<SellJoin[] | null>(null);
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const fromMypage = from === 'mypage';
  const backHref = resolveSellBackHref(from, tab);
  const isOwner = Boolean(user && user.uid === item.sellerId);
  const canEdit = Boolean(fromMypage && isOwner && joins && joins.length === 0);
  const canDelete = canEdit;
  const editLocked = Boolean(fromMypage && isOwner && joins && joins.length > 0);

  async function handleDelete() {
    setDeleteError(null);
    if (!user || !canDelete) return;
    if (!window.confirm('이 팝니다 글을 삭제할까요? 삭제 후에는 복구할 수 없습니다.')) return;
    setDeletePending(true);
    try {
      const { deleteRemoteSellListing } = await import('@/lib/sell-remote');
      await deleteRemoteSellListing(item.id, user.uid);
      onListingDeleted?.();
      router.push(mypageHref('sell'));
    } catch (deleteErr: unknown) {
      setDeleteError(deleteErr instanceof Error ? deleteErr.message : '삭제에 실패했습니다.');
      setDeletePending(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageBack href={backHref}>{fromMypage ? '← 마이페이지' : '← 이전 목록'}</PageBack>

      <article className="panel overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full border-b border-line lg:w-[22rem] lg:shrink-0 lg:self-stretch lg:border-b-0 lg:border-r">
            <SellImageGallery images={item.images} alt={item.title} />
          </div>

          <div className={`min-w-0 flex-1 ${SPEC_PANEL_PAD}`}>
            <SellListingSpecs
              item={item}
              join={join}
              showSeller
              showSellerContact
              titleAction={
                canEdit ? (
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Link href={`/sell/${item.id}/edit`} className="btn-chip">
                      수정
                    </Link>
                    <button type="button" className="btn-chip" disabled={deletePending} onClick={() => void handleDelete()}>
                      {deletePending ? '삭제 중…' : '삭제'}
                    </button>
                  </div>
                ) : editLocked ? (
                  <span className="shrink-0 text-xs text-subtle">수정·삭제 불가 (공구 구매 신청 있음)</span>
                ) : null
              }
            />
          </div>
        </div>

        {deleteError ? (
          <p className="border-t border-line px-4 py-3 text-center text-sm text-danger sm:px-6" role="alert">
            {deleteError}
          </p>
        ) : null}

        <SellJoinSection
          item={item}
          from={from}
          onRemainingChange={onRemainingChange}
          onJoinChange={setJoin}
          onJoinsLoaded={setJoins}
          onReviewCreated={() => setReviewRefresh((value) => value + 1)}
        />
      </article>

      <SellGuidePanel item={item} reviewsKey={reviewRefresh} />
    </div>
  );
}
