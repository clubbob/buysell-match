'use client';

import Link from 'next/link';
import { useState } from 'react';
import PageBack from '@/components/ui/PageBack';
import { useAuth } from '@/features/auth/auth-context';
import SellImageGallery from '@/features/sell/SellImageGallery';
import SellGuidePanel from '@/features/sell/SellGuidePanel';
import SellJoinSection from '@/features/sell/SellJoinSection';
import SellListingSpecs from '@/features/sell/SellListingSpecs';
import SellYoutubeEmbed from '@/features/sell/SellYoutubeEmbed';
import { SPEC_PANEL_PAD } from '@/features/sell/sell-spec-ui';
import type { OpenJoinSummary, SellJoin } from '@/types/sell-join';
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
  const [join, setJoin] = useState<OpenJoinSummary>({ quantity: 0, buyers: 0 });
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

        {item.youtubeUrl ? <SellYoutubeEmbed url={item.youtubeUrl} /> : null}

        <SellJoinSection
          item={item}
          from={from}
          onRemainingChange={onRemainingChange}
          onJoinChange={setJoin}
          onJoinsLoaded={setJoins}
        />
      </article>

      <SellGuidePanel item={item} />

      <p className="text-xs leading-relaxed text-subtle">
        공구매칭은 통신판매중개자이며 결제·정산·배송의 당사자가 아닙니다. 거래는 판매자와 구매자 사이에서 이루어집니다.
      </p>
    </div>
  );
}
