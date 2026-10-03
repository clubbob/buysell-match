'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSellJoinsByListings } from '@/features/sell/use-sell-joins-by-listings';
import {
  deadlineParts,
  discountRate,
  formatQuantityNumber,
  formatWon,
  isRemainingShort,
  listingProgressStatus,
  listingProgressStatusLabel,
} from '@/lib/sell-display';
import { buildJoinTimeline, formatTimelineAt, formatTimelineQuantity } from '@/lib/sell-join-timeline';
import { sellCategoryLabel } from '@/lib/sell-filters';
import { sellDetailHref } from '@/lib/mypage-nav';
import { listingSourceLabel } from '@/lib/sell-source';
import SellProductCardGrid from '@/components/sell/SellProductCardGrid';
import { sellCoverImage, type SellListing } from '@/types/sell';
import type { SellJoin } from '@/types/sell-join';

function MypageJoinTimelineTable({ item, joins = [] }: { item: SellListing; joins?: SellJoin[] }) {
  const { initialRemaining, currentRemaining, steps } = buildJoinTimeline(item, joins);
  const shortRemaining = isRemainingShort(item.minPurchaseLabel, item.remainingLabel);
  const lastRemaining = steps[steps.length - 1]?.remainingAfter;
  const showCurrent = steps.length > 0 && lastRemaining !== currentRemaining;
  const rows = [
    {
      key: 'initial',
      at: formatTimelineAt(item.createdAt),
      label: '최초 잔여',
      quantity: '—',
      remainingBefore: initialRemaining,
      remainingAfter: initialRemaining,
      tone: 'muted' as const,
    },
    ...steps.map((step, index) => ({
      key: `${step.kind}-${step.at}-${index}`,
      at: formatTimelineAt(step.at),
      label: step.label,
      quantity: formatTimelineQuantity(step.quantity),
      remainingBefore: step.remainingBefore,
      remainingAfter: step.remainingAfter,
      tone: step.kind === 'confirmed' ? ('confirmed' as const) : ('default' as const),
    })),
    ...(showCurrent
      ? [
          {
            key: 'current',
            at: '—',
            label: '현재 잔여',
            quantity: '—',
            remainingBefore: currentRemaining,
            remainingAfter: currentRemaining,
            tone: shortRemaining ? ('danger' as const) : ('emphasis' as const),
          },
        ]
      : []),
  ];

  return (
    <div className="max-h-48 overflow-y-auto">
      <table className="w-full border-collapse text-[10px] leading-snug">
        <thead className="sticky top-0 z-[1]">
          <tr>
            <th className="border border-line bg-slate-50 px-2 py-1 text-left font-semibold text-subtle">일시</th>
            <th className="border border-line bg-slate-50 px-2 py-1 text-left font-semibold text-subtle">내용</th>
            <th className="border border-line bg-slate-50 px-2 py-1 text-right font-semibold text-subtle">수량</th>
            <th className="border border-line bg-slate-50 px-2 py-1 text-right font-semibold text-subtle">확정 전</th>
            <th className="border border-line bg-slate-50 px-2 py-1 text-right font-semibold text-subtle">확정 후</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td className="whitespace-nowrap border border-line px-2 py-1 tabular-nums text-subtle">{row.at}</td>
              <td className="whitespace-nowrap border border-line px-2 py-1 font-medium text-ink">{row.label}</td>
              <td
                className={`whitespace-nowrap border border-line px-2 py-1 text-right tabular-nums ${
                  row.tone === 'confirmed'
                    ? 'font-semibold text-blue-600'
                    : row.tone === 'muted'
                      ? 'text-subtle'
                      : 'text-ink'
                }`}
              >
                {row.quantity}
              </td>
              <td className="whitespace-nowrap border border-line px-2 py-1 text-right tabular-nums text-ink">
                {formatTimelineQuantity(row.remainingBefore)}
              </td>
              <td
                className={`whitespace-nowrap border border-line px-2 py-1 text-right tabular-nums ${
                  row.tone === 'danger'
                    ? 'font-semibold text-danger'
                    : row.remainingBefore !== row.remainingAfter
                      ? 'font-semibold text-blue-600'
                      : row.tone === 'emphasis'
                        ? 'font-semibold text-ink'
                        : 'text-ink'
                }`}
              >
                {formatTimelineQuantity(row.remainingAfter)}
                {row.tone === 'danger' ? <span className="ml-1 text-[9px] font-medium">부족</span> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MypageProductCell({ item }: { item: SellListing }) {
  const categoryLabel = sellCategoryLabel(item.category);
  const sourceLabel = listingSourceLabel(item);

  return (
    <div className="flex min-w-0 items-center gap-3">
      <PhotoSlot src={sellCoverImage(item)} alt={item.title} compact />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {[categoryLabel, sourceLabel].filter(Boolean).join(' · ')}
        </p>
      </div>
    </div>
  );
}

function MypagePriceCell({ item }: { item: SellListing }) {
  const rate = discountRate(item.regularPrice, item.salePrice);

  return (
    <div className="text-xs leading-snug tabular-nums">
      <p className="text-subtle line-through">{formatWon(item.regularPrice)}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">
        {formatWon(item.salePrice)}
        {rate > 0 ? <span className="ml-1 text-xs font-medium text-muted">({rate}%)</span> : null}
      </p>
    </div>
  );
}

function MypageDeadlineCell({ item }: { item: SellListing }) {
  const status = listingProgressStatus(item);
  const deadline = deadlineParts(item.deadline);
  const statusText =
    status === 'recruiting'
      ? `${listingProgressStatusLabel(status)} ${deadline.note}`
      : listingProgressStatusLabel(status);

  return (
    <div className="text-xs leading-snug tabular-nums">
      <p className="font-medium text-ink">{statusText}</p>
      <p className="mt-0.5 text-muted">{deadline.date}</p>
    </div>
  );
}

function PhotoSlot({ src, alt, compact = false }: { src?: string | null; alt: string; compact?: boolean }) {
  const sizeClass = compact ? 'h-12 w-12' : 'h-16 w-16';
  if (src) {
    return (
      <span className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden border border-line bg-white p-0.5`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-contain" />
      </span>
    );
  }

  return (
    <div className={`flex ${sizeClass} shrink-0 items-center justify-center border border-line bg-slate-100 text-[11px] font-medium text-subtle`} aria-hidden>
      사진
    </div>
  );
}

function listingHref(id: string, from?: string, mypageTab: 'sell' | 'buy' = 'sell') {
  return sellDetailHref(id, from === 'mypage' ? { from: 'mypage', mypageTab } : from ? { from } : undefined);
}

function DesktopRow({
  item,
  joins,
  from,
  mypageTab,
}: {
  item: SellListing;
  joins?: SellJoin[];
  from?: string;
  mypageTab?: 'sell' | 'buy';
}) {
  const router = useRouter();

  return (
    <tr
      className="cursor-pointer border-t border-line hover:bg-slate-50"
      onClick={() => router.push(listingHref(item.id, from, mypageTab))}
    >
      <td className="px-4 py-3 align-middle">
        <MypageProductCell item={item} />
      </td>
      <td className="px-3 py-3 align-middle">
        <MypagePriceCell item={item} />
      </td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">
        {formatQuantityNumber(item.minPurchaseLabel)}
      </td>
      <td className="px-3 py-3 align-middle">
        <MypageDeadlineCell item={item} />
      </td>
      <td className="px-3 py-3 align-middle">
        <MypageJoinTimelineTable item={item} joins={joins} />
      </td>
    </tr>
  );
}

function MobileRow({
  item,
  joins,
  from,
  mypageTab,
}: {
  item: SellListing;
  joins?: SellJoin[];
  from?: string;
  mypageTab?: 'sell' | 'buy';
}) {
  const rate = discountRate(item.regularPrice, item.salePrice);
  const categoryLabel = sellCategoryLabel(item.category);
  const sourceLabel = listingSourceLabel(item);

  return (
    <li className="border-t border-line">
      <Link href={listingHref(item.id, from, mypageTab)} className="block px-4 py-3">
        <p className="text-sm font-semibold text-ink">{item.title}</p>
        <p className="mt-0.5 text-xs font-medium text-muted">
          {[categoryLabel, sourceLabel].filter(Boolean).join(' · ')}
        </p>
        <div className="mt-2 flex gap-3">
          <PhotoSlot src={sellCoverImage(item)} alt={item.title} />
          <div className="min-w-0 space-y-1">
            <p className="text-sm">
              <span className="text-subtle line-through tabular-nums">{formatWon(item.regularPrice)}</span>
              <span className="ml-2 font-semibold text-ink tabular-nums">{formatWon(item.salePrice)}</span>
              {rate > 0 ? <span className="ml-1 text-xs text-muted">(할인율 {rate}%)</span> : null}
            </p>
            <p className="text-sm text-ink">
              {item.minPurchaseLabel ? `모집 최소 수량 ${formatQuantityNumber(item.minPurchaseLabel)}` : null}
              {item.minPurchaseLabel ? <span className="mx-1.5 text-subtle">·</span> : null}
              {formatQuantityNumber(item.remainingLabel)}
              {isRemainingShort(item.minPurchaseLabel, item.remainingLabel) ? (
                <span className="ml-1 text-xs font-medium text-muted">잔여 부족</span>
              ) : null}
            </p>
            <div className="space-y-2 pt-2">
              <MypageDeadlineCell item={item} />
              <MypageJoinTimelineTable item={item} joins={joins} />
            </div>
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
  mypageTab = 'sell',
  footer,
}: {
  title?: string;
  description?: string;
  href?: string;
  actionLabel?: string;
  items?: SellListing[];
  embedded?: boolean;
  hideDeadline?: boolean;
  from?: string;
  mypageTab?: 'sell' | 'buy';
  footer?: React.ReactNode;
}) {
  const listingIds = items.map((item) => item.id);
  const isMypage = from === 'mypage';
  const joinsByListing = useSellJoinsByListings(isMypage ? listingIds : []);
  const showDeadline = !hideDeadline;
  const showStatusColumn = isMypage;
  const list =
    items.length > 0 ? (
      showStatusColumn ? (
        <>
          <table className="hidden w-full table-fixed lg:table">
            <colgroup>
              <col className="w-[32%]" />
              <col className="w-[11%]" />
              <col className="w-[8%]" />
              <col className="w-[13%]" />
              <col className="w-[40%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-subtle">
                <th className="px-4 py-2">상품</th>
                <th className="px-3 py-2">가격</th>
                <th className="px-3 py-2">모집 최소 수량</th>
                <th className="px-3 py-2">마감</th>
                <th className="px-3 py-2">판매 진행</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <DesktopRow
                  key={item.id}
                  item={item}
                  joins={joinsByListing[item.id]}
                  from={from}
                  mypageTab={mypageTab}
                />
              ))}
            </tbody>
          </table>

          <ul className="lg:hidden">
            {items.map((item) => (
              <MobileRow
                key={item.id}
                item={item}
                joins={joinsByListing[item.id]}
                from={from}
                mypageTab={mypageTab}
              />
            ))}
          </ul>
        </>
      ) : (
        <SellProductCardGrid
          items={items}
          showDeadline={showDeadline}
          hrefForItem={(id) => listingHref(id, from, mypageTab)}
        />
      )
    ) : (
      <p className="px-4 py-12 text-center text-sm text-muted">
        {showStatusColumn ? (
          <>
            아직 올라온 글이 없습니다.
            <span className="mt-1 block text-subtle">상품 사진과 판매자가 함께 표시됩니다.</span>
          </>
        ) : (
          '아직 올라온 판매 상품이 없습니다.'
        )}
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
      {footer}
    </section>
  );
}
