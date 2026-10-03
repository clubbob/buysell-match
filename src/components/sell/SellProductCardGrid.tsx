import Link from 'next/link';
import {
  deadlineParts,
  discountRate,
  formatWon,
  isListingClosed,
  isRemainingShort,
} from '@/lib/sell-display';
import { sellCategoryLabel } from '@/lib/sell-filters';
import { cn } from '@/lib/utils';
import { sellCoverImage, type SellListing } from '@/types/sell';
import SellListingImageFrame from '@/components/sell/SellListingImageFrame';

function SellProductCard({
  item,
  href,
  showDeadline,
}: {
  item: SellListing;
  href: string;
  showDeadline: boolean;
}) {
  const cover = sellCoverImage(item);
  const rate = discountRate(item.regularPrice, item.salePrice);
  const categoryLabel = sellCategoryLabel(item.category);
  const deadline = deadlineParts(item.deadline);
  const closed = isListingClosed(item);
  const shortRemaining = isRemainingShort(item.minPurchaseLabel, item.remainingLabel);

  const statusParts: string[] = [];
  if (closed) {
    statusParts.push('마감');
  } else if (showDeadline && deadline.note) {
    statusParts.push(deadline.note.replace(/^\(|\)$/g, ''));
  }
  if (shortRemaining) {
    statusParts.push('잔여 부족');
  }
  const statusText = statusParts.join(' · ');

  return (
    <li className="min-w-0 max-w-full overflow-hidden bg-white">
      <Link href={href} className="block min-w-0 max-w-full overflow-hidden hover:bg-slate-50">
        <SellListingImageFrame src={cover} alt={item.title}>
          {closed ? (
            <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/35 text-sm font-semibold text-white">
              마감
            </span>
          ) : null}
        </SellListingImageFrame>

        <div className="border-t border-line px-3 py-2.5 sm:px-3.5 sm:py-3">
          <p className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-ink">{item.title}</p>
          <p className="mt-1 line-clamp-1 min-h-4 text-xs leading-4 text-muted">
            {categoryLabel} · {item.sellerName}
          </p>

          <div className="mt-2 space-y-0.5">
            <p className="truncate text-xs leading-4 text-subtle line-through tabular-nums">
              {formatWon(item.regularPrice)}
            </p>
            <p className="truncate text-[15px] font-bold leading-5 tabular-nums text-ink">
              {formatWon(item.salePrice)}
              {rate > 0 ? <span className="ml-1 text-xs font-medium text-muted">({rate}%)</span> : null}
            </p>
            {showDeadline ? (
              <p className="min-h-4 truncate text-xs leading-4 text-muted">
                {statusText ? (
                  <span className={closed ? 'font-medium text-subtle' : undefined}>{statusText}</span>
                ) : (
                  <span className="invisible" aria-hidden>—</span>
                )}
              </p>
            ) : shortRemaining ? (
              <p className="min-h-4 truncate text-xs font-medium leading-4 text-ink">잔여 부족</p>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function SellProductCardGrid({
  items,
  hrefForItem,
  showDeadline = true,
  className,
}: {
  items: SellListing[];
  hrefForItem?: (id: string) => string;
  showDeadline?: boolean;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'grid min-w-0 max-w-full grid-cols-2 gap-px overflow-hidden bg-line lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {items.map((item) => (
        <SellProductCard
          key={item.id}
          item={item}
          href={hrefForItem?.(item.id) ?? `/sell/${item.id}`}
          showDeadline={showDeadline}
        />
      ))}
    </ul>
  );
}
