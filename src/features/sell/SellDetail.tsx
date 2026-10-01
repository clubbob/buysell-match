'use client';

import Link from 'next/link';
import { useState } from 'react';
import IntermediaryNotice from '@/components/legal/IntermediaryNotice';
import PageBack from '@/components/ui/PageBack';
import { useAuth } from '@/features/auth/auth-context';
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
  onRemainingChange,
}: {
  item: SellListing;
  from?: string;
  onRemainingChange?: () => void;
}) {
  const { user } = useAuth();
  const [join, setJoin] = useState<JoinListSummary>({
    open: { quantity: 0, buyers: 0 },
    confirmed: { quantity: 0, buyers: 0 },
  });
  const [joins, setJoins] = useState<SellJoin[] | null>(null);
  const fromMypage = from === 'mypage';
  const isOwner = Boolean(user && user.uid === item.sellerId);
  const canEdit = Boolean(fromMypage && isOwner && joins && joins.length === 0);
  const editLocked = Boolean(fromMypage && isOwner && joins && joins.length > 0);

  return (
    <div className="space-y-5">
      <PageBack href={fromMypage ? '/mypage' : '/sell'} />

      <article className="panel overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full border-b border-line lg:w-[22rem] lg:shrink-0 lg:self-stretch lg:border-b-0 lg:border-r">
            <SellImageGallery images={item.images} alt={item.title} />
          </div>

          <div className={`min-w-0 flex-1 ${SPEC_PANEL_PAD}`}>
            <IntermediaryNotice variant="panel" className="mb-4" />
            <SellListingSpecs
              item={item}
              join={join}
              showSeller
              showSellerContact
              titleAction={
                canEdit ? (
                  <Link href={`/sell/${item.id}/edit`} className="btn-chip shrink-0">
                    수정
                  </Link>
                ) : editLocked ? (
                  <span className="shrink-0 text-xs text-subtle">수정 불가 (참여자 존재)</span>
                ) : null
              }
            />
          </div>
        </div>

        <SellJoinSection
          item={item}
          from={from}
          onRemainingChange={onRemainingChange}
          onJoinChange={setJoin}
          onJoinsLoaded={setJoins}
        />
      </article>

      <SellGuidePanel item={item} />
    </div>
  );
}
