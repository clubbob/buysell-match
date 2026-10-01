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
import type { JoinListSummary } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';
import SellerIdentityBlock from '@/features/sell/SellerIdentityBlock';
import SellProductLink from '@/features/sell/SellProductLink';
import SellYoutubeEmbed from '@/features/sell/SellYoutubeEmbed';
import { SPEC_GRID, SPEC_GROUP_TITLE, SPEC_PRICE_FIELDS, SPEC_QTY_FIELDS, SPEC_ROW } from '@/features/sell/sell-spec-ui';

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={`${SPEC_ROW} border-b border-line py-3`}>
      <dt className="whitespace-nowrap text-subtle">{label}</dt>
      <dd className="flex min-w-0 items-center text-ink">{children}</dd>
    </div>
  );
}

function EmptyValue() {
  return <span className="text-muted">—</span>;
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
        <Spec label="상품명">
          <h1 className="min-w-0 flex-1 break-words text-sm font-normal text-ink">{item.title}</h1>
          {titleAction}
        </Spec>
      ) : null}
      {showSeller ? (
        <div className={`${SPEC_ROW} items-start border-b border-line py-3 sm:items-start`}>
          <dt className="whitespace-nowrap text-subtle">판매자</dt>
          <dd className="flex min-w-0 items-start text-ink">
            {showSellerContact ? <SellerIdentityBlock item={item} /> : <span className="font-semibold">{item.sellerName}</span>}
          </dd>
        </div>
      ) : null}
      <div className={`${SPEC_ROW} border-b border-line py-3`}>
        <p className={SPEC_GROUP_TITLE}>온라인 판매상품 URL (선택)</p>
        <span className="whitespace-nowrap text-subtle">쿠팡</span>
        {item.coupangUrl ? <SellProductLink href={item.coupangUrl} label="쿠팡" /> : <EmptyValue />}
        <span className="whitespace-nowrap text-subtle">스마트스토어</span>
        {item.smartstoreUrl ? <SellProductLink href={item.smartstoreUrl} label="스마트스토어" /> : <EmptyValue />}
      </div>
      <div className={`${SPEC_ROW} items-start border-b border-line py-3 sm:items-start`}>
        <p className={SPEC_GROUP_TITLE}>유튜브 판매상품 URL (선택)</p>
        <span className="hidden sm:block" aria-hidden />
        {item.youtubeUrl ? <SellYoutubeEmbed url={item.youtubeUrl} /> : <EmptyValue />}
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
        <dt className="whitespace-nowrap text-subtle">공구 최소 주문</dt>
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
