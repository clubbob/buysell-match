import Link from 'next/link';
import { deadlineParts, formatQuantityNumber, formatWon } from '@/lib/sell-display';
import type { BuyListing } from '@/types/buy';

function BuyRow({ item }: { item: BuyListing }) {
  const deadline = item.deadline ? deadlineParts(item.deadline) : null;

  return (
    <tr className="border-t border-line">
      <td className="px-4 py-3 align-middle text-sm font-semibold text-ink">
        {item.title}
        {item.buyerName ? <span className="mt-0.5 block text-xs font-medium text-muted">{item.buyerName}</span> : null}
      </td>
      <td className="px-3 py-3 align-middle text-sm font-semibold tabular-nums text-ink">
        {item.price > 0 ? formatWon(item.price) : '—'}
      </td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">
        {item.quantityLabel ? formatQuantityNumber(item.quantityLabel) : '—'}
      </td>
      <td className="px-4 py-3 align-middle text-sm text-ink">
        {deadline ? (
          <>
            <span className="tabular-nums">{deadline.date}</span>
            <span className="mt-0.5 block text-xs font-medium text-muted">{deadline.note}</span>
          </>
        ) : (
          '—'
        )}
      </td>
    </tr>
  );
}

function BuyMobileRow({ item }: { item: BuyListing }) {
  const deadline = item.deadline ? deadlineParts(item.deadline) : null;

  return (
    <li className="border-t border-line px-4 py-3">
      <p className="text-sm font-semibold text-ink">{item.title}</p>
      {item.buyerName ? <p className="mt-0.5 text-xs font-medium text-muted">{item.buyerName}</p> : null}
      <p className="mt-2 text-sm text-ink">
        <span className="font-semibold tabular-nums">{item.price > 0 ? formatWon(item.price) : '—'}</span>
        {item.quantityLabel ? (
          <>
            <span className="mx-1.5 text-subtle">·</span>
            <span className="tabular-nums">{formatQuantityNumber(item.quantityLabel)}</span>
          </>
        ) : null}
        {deadline ? (
          <>
            <span className="mx-1.5 text-subtle">·</span>
            <span className="tabular-nums">{deadline.date}</span>
            <span className="ml-1 text-xs font-medium text-muted">{deadline.note}</span>
          </>
        ) : null}
      </p>
    </li>
  );
}

export default function BuyListPanel({
  title,
  description,
  href,
  actionLabel,
  items = [],
  empty = '아직 올라온 글이 없습니다.',
}: {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
  items?: BuyListing[];
  empty?: string;
}) {
  const list =
    items.length > 0 ? (
      <>
        <table className="hidden w-full table-fixed sm:table">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[30%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-subtle">
              <th className="px-4 py-2">상품</th>
              <th className="px-3 py-2">가격</th>
              <th className="px-3 py-2">수량</th>
              <th className="px-4 py-2">마감</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <BuyRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
        <ul className="sm:hidden">
          {items.map((item) => (
            <BuyMobileRow key={item.id} item={item} />
          ))}
        </ul>
      </>
    ) : (
      <p className="px-4 py-10 text-center text-sm text-muted sm:py-12">{empty}</p>
    );

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
