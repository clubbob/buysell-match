'use client';

import type { ReactNode } from 'react';
import {
  deadlineParts,
  discountRate,
  formatConfirmedJoinSummary,
  formatJoinParticipants,
  formatQuantityNumber,
  formatWon,
  isRemainingShort,
} from '@/lib/sell-display';
import { sellCategoryLabel } from '@/lib/sell-filters';
import type { JoinListSummary } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';
import SellerIdentityBlock from '@/features/sell/SellerIdentityBlock';
import SellProductLink from '@/features/sell/SellProductLink';
import SellYoutubeEmbed from '@/features/sell/SellYoutubeEmbed';
import { SPEC_GRID, SPEC_PRICE_FIELDS, SPEC_QTY_FIELDS, SPEC_ROW } from '@/features/sell/sell-spec-ui';

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={`${SPEC_ROW} border-b border-line py-3`}>
      <dt className="whitespace-nowrap text-subtle">{label}</dt>
      <dd className="flex min-w-0 items-center text-ink">{children}</dd>
    </div>
  );
}

function EmptyValue() {
  return <span className="text-muted">없음</span>;
}

export default function SellListingSpecs({
  item,
  join,
  showTitle = true,
  showSeller = false,
  showSellerContact = false,
  titleAction,
}: {
  item: SellListing;
  join?: JoinListSummary;
  showTitle?: boolean;
  showSeller?: boolean;
  showSellerContact?: boolean;
  titleAction?: ReactNode;
}) {
  const openNote = formatJoinParticipants(join?.open.buyers ?? 0, join?.open.quantity ?? 0);
  const confirmedNote = formatConfirmedJoinSummary(join?.confirmed.buyers ?? 0, join?.confirmed.quantity ?? 0);
  const rate = discountRate(item.regularPrice, item.salePrice);
  const remainingShort = isRemainingShort(item.minPurchaseLabel, item.remainingLabel);
  const deadline = deadlineParts(item.deadline);

  return (
    <dl className={SPEC_GRID}>
      {showTitle ? (
        <>
          <Spec label="상품명">
            <h1 className="min-w-0 flex-1 break-words text-sm font-bold text-ink">{item.title}</h1>
            {titleAction}
          </Spec>
          <Spec label="카테고리">
            <span>{sellCategoryLabel(item.category)}</span>
          </Spec>
        </>
      ) : null}
      {showSeller ? (
        showSellerContact ? (
          <div className="border-b border-line py-3 sm:col-span-2">
            <SellerIdentityBlock item={item} />
          </div>
        ) : (
          <Spec label="판매자">
            <span>{item.sellerName}</span>
          </Spec>
        )
      ) : null}
      <div className="border-b border-line py-3 sm:col-span-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="shrink-0 whitespace-nowrap text-subtle">판매상품 URL</span>
          <span className="whitespace-nowrap text-subtle">쿠팡</span>
          {item.coupangUrl ? <SellProductLink href={item.coupangUrl} label="쿠팡" /> : <EmptyValue />}
          <span className="whitespace-nowrap text-subtle">스마트스토어</span>
          {item.smartstoreUrl ? <SellProductLink href={item.smartstoreUrl} label="스마트스토어" /> : <EmptyValue />}
          <span className="flex shrink-0 items-center gap-x-2">
            <span className="whitespace-nowrap text-subtle">유튜브</span>
            {item.youtubeUrl ? <SellYoutubeEmbed url={item.youtubeUrl} /> : <EmptyValue />}
          </span>
        </div>
      </div>
      <div className={`${SPEC_ROW} border-b border-line py-3`}>
        <dt className="whitespace-nowrap text-subtle">정상 가격</dt>
        <dd className={SPEC_PRICE_FIELDS}>
          <span className="min-w-0 text-subtle line-through tabular-nums">{formatWon(item.regularPrice)}</span>
          <span className="whitespace-nowrap text-subtle">특판 가격</span>
          <span className="min-w-0">
            <span className="font-semibold tabular-nums">{formatWon(item.salePrice)}</span>
            {rate > 0 ? <span className="ml-1 text-xs font-medium text-muted">(할인율 {rate}%)</span> : null}
          </span>
        </dd>
      </div>
      <div className={`${SPEC_ROW} py-3`}>
        <dt className="whitespace-nowrap text-subtle">모집 최소 수량</dt>
        <dd className={SPEC_QTY_FIELDS}>
          <span className="min-w-0">
            <span className="tabular-nums">{formatQuantityNumber(item.minPurchaseLabel)}</span>
            {openNote ? <span className="ml-1 text-xs font-medium text-muted">{openNote}</span> : null}
            {confirmedNote ? <span className="ml-1 text-xs font-medium text-muted">{confirmedNote}</span> : null}
          </span>
          <span className="whitespace-nowrap text-subtle">잔여 수량</span>
          <span className="min-w-0">
            <span className="tabular-nums">{formatQuantityNumber(item.remainingLabel)}</span>
            {remainingShort ? <span className="ml-1 text-xs font-medium text-muted">잔여 부족</span> : null}
          </span>
          <span className="whitespace-nowrap text-subtle">마감</span>
          <span className="min-w-0">
            <span className="tabular-nums">{deadline.date}</span>
            {deadline.note ? <span className="ml-1 text-xs font-medium text-muted">{deadline.note}</span> : null}
          </span>
        </dd>
      </div>
    </dl>
  );
}
