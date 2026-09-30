'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSellJoinTotals } from '@/features/sell/use-sell-join-totals';
import {
  deadlineParts,
  discountRate,
  formatConfirmedJoinSummary,
  formatJoinParticipants,
  formatQuantityNumber,
  formatWon,
  isRemainingShort,
} from '@/lib/sell-display';
import { listingSourceLabel } from '@/lib/sell-source';
import { sellCoverImage, type SellListing } from '@/types/sell';
import type { JoinListSummary } from '@/types/sell-join';

function JoinNotes({ summary }: { summary?: JoinListSummary }) {
  if (!summary) return null;
  const openText = formatJoinParticipants(summary.open.buyers, summary.open.quantity);
  const confirmedText = formatConfirmedJoinSummary(summary.confirmed.buyers, summary.confirmed.quantity);
  if (!openText && !confirmedText) return null;
  return (
    <span className="mt-0.5 block text-xs font-medium text-muted">
      {openText ? <span className="block">{openText}</span> : null}
      {confirmedText ? <span className="block">{confirmedText}</span> : null}
    </span>
  );
}

function PhotoSlot({ src, alt }: { src?: string | null; alt: string }) {
  if (src) {
    return (
      <span className="flex h-16 w-16 items-center justify-center overflow-hidden border border-line bg-white p-0.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-contain" />
      </span>
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center border border-line bg-slate-100 text-[11px] font-medium text-subtle" aria-hidden>
      사진
    </div>
  );
}

function listingHref(id: string, from?: string) {
  return from ? `/sell/${id}?from=${encodeURIComponent(from)}` : `/sell/${id}`;
}

function DesktopRow({
  item,
  join,
  showDeadline,
  from,
}: {
  item: SellListing;
  join?: JoinListSummary;
  showDeadline?: boolean;
  from?: string;
}) {
  const router = useRouter();
  const rate = discountRate(item.regularPrice, item.salePrice);
  const deadline = deadlineParts(item.deadline);
  const sourceLabel = listingSourceLabel(item);

  return (
    <tr
      className="cursor-pointer border-t border-line hover:bg-slate-50"
      onClick={() => router.push(listingHref(item.id, from))}
    >
      <td className="px-4 py-3 align-middle text-sm font-semibold text-ink">
        {item.title}
        {sourceLabel ? <span className="mt-0.5 block text-xs font-medium text-muted">{sourceLabel}</span> : null}
      </td>
      <td className="py-3 align-middle">
        <PhotoSlot src={sellCoverImage(item)} alt={item.title} />
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{item.sellerName}</td>
      <td className="px-3 py-3 align-middle text-sm text-subtle line-through tabular-nums">{formatWon(item.regularPrice)}</td>
      <td className="px-3 py-3 align-middle text-sm text-ink tabular-nums">
        <span className="font-semibold">{formatWon(item.salePrice)}</span>
        {rate > 0 ? <span className="mt-0.5 block text-xs font-medium text-muted">(할인율 {rate}%)</span> : null}
      </td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">
        <span>{formatQuantityNumber(item.minPurchaseLabel)}</span>
        <JoinNotes summary={join} />
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">
        <span className="tabular-nums">{formatQuantityNumber(item.remainingLabel)}</span>
        {isRemainingShort(item.minPurchaseLabel, item.remainingLabel) ? (
          <span className="mt-0.5 block text-xs font-medium text-muted">잔여 부족</span>
        ) : null}
      </td>
      {showDeadline ? (
        <td className="px-4 py-3 align-middle text-sm text-ink">
          <span className="tabular-nums">{deadline.date}</span>
          <span className="mt-0.5 block text-xs font-medium text-muted">{deadline.note}</span>
        </td>
      ) : null}
    </tr>
  );
}

function MobileRow({
  item,
  join,
  showDeadline,
  from,
}: {
  item: SellListing;
  join?: JoinListSummary;
  showDeadline?: boolean;
  from?: string;
}) {
  const rate = discountRate(item.regularPrice, item.salePrice);
  const deadline = deadlineParts(item.deadline);
  const sourceLabel = listingSourceLabel(item);

  return (
    <li className="border-t border-line">
      <Link href={listingHref(item.id, from)} className="block px-4 py-3">
        <p className="text-sm font-semibold text-ink">{item.title}</p>
        {sourceLabel ? <p className="mt-0.5 text-xs font-medium text-muted">{sourceLabel}</p> : null}
        <div className="mt-2 flex gap-3">
          <PhotoSlot src={sellCoverImage(item)} alt={item.title} />
          <div className="min-w-0 space-y-1">
            <p className="text-sm text-muted">{item.sellerName}</p>
            <p className="text-sm">
              <span className="text-subtle line-through tabular-nums">{formatWon(item.regularPrice)}</span>
              <span className="ml-2 font-semibold text-ink tabular-nums">{formatWon(item.salePrice)}</span>
              {rate > 0 ? <span className="ml-1 text-xs text-muted">(할인율 {rate}%)</span> : null}
            </p>
            <p className="text-sm text-ink">
              {item.minPurchaseLabel ? `공구 최소 주문 ${formatQuantityNumber(item.minPurchaseLabel)}` : null}
              <JoinNotes summary={join} />
              {item.minPurchaseLabel ? <span className="mx-1.5 text-subtle">·</span> : null}
              {formatQuantityNumber(item.remainingLabel)}
              {isRemainingShort(item.minPurchaseLabel, item.remainingLabel) ? (
                <span className="ml-1 text-xs font-medium text-muted">잔여 부족</span>
              ) : null}
              {showDeadline ? (
                <>
                  <span className="mx-1.5 text-subtle">·</span>
                  {deadline.date}
                  <span className="ml-1 text-xs font-medium text-muted">{deadline.note}</span>
                </>
              ) : null}
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function SellListPanel({
  title,
  description,
  href,
  actionLabel,
  items = [],
  embedded = false,
  hideDeadline = false,
  from,
}: {
  title?: string;
  description?: string;
  href?: string;
  actionLabel?: string;
  items?: SellListing[];
  embedded?: boolean;
  hideDeadline?: boolean;
  from?: string;
}) {
  const joinTotals = useSellJoinTotals(items.map((item) => item.id));
  const showDeadline = !hideDeadline;
  const list =
    items.length > 0 ? (
      <>
        <table className="hidden w-full table-fixed lg:table">
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[5.5rem]" />
            <col className="w-[12%]" />
            <col className="w-[11%]" />
            <col className="w-[13%]" />
            <col className="w-[15%]" />
            <col className="w-[11%]" />
            {showDeadline ? <col className="w-[14%]" /> : null}
          </colgroup>
          <thead>
            <tr className="border-b border-line bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-subtle">
              <th className="px-4 py-2">상품</th>
              <th className="py-2">사진</th>
              <th className="px-3 py-2">판매자</th>
              <th className="px-3 py-2">정상 가격</th>
              <th className="px-3 py-2">특판 가격</th>
              <th className="px-3 py-2">공구 최소 주문</th>
              <th className="px-3 py-2">잔여 수량</th>
              {showDeadline ? <th className="px-4 py-2">마감</th> : null}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <DesktopRow key={item.id} item={item} join={joinTotals[item.id]} showDeadline={showDeadline} from={from} />
            ))}
          </tbody>
        </table>

        <ul className="lg:hidden">
          {items.map((item) => (
            <MobileRow key={item.id} item={item} join={joinTotals[item.id]} showDeadline={showDeadline} from={from} />
          ))}
        </ul>
      </>
    ) : (
      <p className="px-4 py-12 text-center text-sm text-muted">
        아직 올라온 글이 없습니다.
        <span className="mt-1 block text-subtle">상품 사진과 판매자가 함께 표시됩니다.</span>
      </p>
    );

  if (embedded) {
    return list;
  }

  return (
    <section className="panel min-w-0 overflow-hidden">
      <header className="flex flex-col gap-2 border-b border-line px-4 py-3.5 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        </div>
        {href && actionLabel ? (
          <Link
            href={href}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline-offset-2 hover:underline sm:min-h-0 sm:shrink-0"
          >
            {actionLabel}
          </Link>
        ) : null}
      </header>
      {list}
    </section>
  );
}
