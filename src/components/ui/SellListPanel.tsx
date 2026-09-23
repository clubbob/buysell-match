'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { discountRate, formatDeadline, formatQuantityNumber, formatWon } from '@/lib/sell-display';
import { sellCoverImage, type SellListing } from '@/types/sell';

function PhotoSlot({ src, alt }: { src?: string | null; alt: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className="h-14 w-14 border border-line object-cover" />
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center bg-slate-100 text-[11px] font-medium text-subtle" aria-hidden>
      사진
    </div>
  );
}

function DesktopRow({ item }: { item: SellListing }) {
  const router = useRouter();
  const rate = discountRate(item.regularPrice, item.salePrice);

  return (
    <tr
      className="cursor-pointer border-t border-line hover:bg-slate-50"
      onClick={() => router.push(`/sell/${item.id}`)}
    >
      <td className="px-4 py-3 align-middle text-sm font-semibold text-ink">{item.title}</td>
      <td className="py-3 align-middle">
        <PhotoSlot src={sellCoverImage(item)} alt={item.title} />
      </td>
      <td className="px-3 py-3 align-middle text-sm text-ink">{item.sellerName}</td>
      <td className="px-3 py-3 align-middle text-sm text-subtle line-through tabular-nums">{formatWon(item.regularPrice)}</td>
      <td className="px-3 py-3 align-middle text-sm text-ink tabular-nums">
        <span className="font-semibold">{formatWon(item.salePrice)}</span>
        {rate > 0 ? <span className="mt-0.5 block text-xs font-medium text-muted">(할인율 {rate}%)</span> : null}
      </td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">{formatQuantityNumber(item.minPurchaseLabel)}</td>
      <td className="px-3 py-3 align-middle text-sm tabular-nums text-ink">{formatQuantityNumber(item.remainingLabel)}</td>
      <td className="px-4 py-3 align-middle text-sm text-ink">{formatDeadline(item.deadline)}</td>
    </tr>
  );
}

function MobileRow({ item }: { item: SellListing }) {
  const rate = discountRate(item.regularPrice, item.salePrice);

  return (
    <li className="border-t border-line">
      <Link href={`/sell/${item.id}`} className="block px-4 py-3">
        <p className="text-sm font-semibold text-ink">{item.title}</p>
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
              {item.minPurchaseLabel ? `공동구매 최소 주문 ${formatQuantityNumber(item.minPurchaseLabel)}` : null}
              {item.minPurchaseLabel ? <span className="mx-1.5 text-subtle">·</span> : null}
              {formatQuantityNumber(item.remainingLabel)}
              <span className="mx-1.5 text-subtle">·</span>
              {formatDeadline(item.deadline)}
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
}: {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
  items?: SellListing[];
}) {
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

      {items.length > 0 ? (
        <>
          <table className="hidden w-full table-fixed lg:table">
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[72px]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-line bg-slate-50 text-left text-[11px] font-semibold tracking-wide text-subtle">
                <th className="px-4 py-2">상품</th>
                <th className="py-2">사진</th>
                <th className="px-3 py-2">판매자</th>
                <th className="px-3 py-2">정상 가격</th>
                <th className="px-3 py-2">특판 가격</th>
                <th className="px-3 py-2">공동구매 최소 주문</th>
                <th className="px-3 py-2">잔여 수량</th>
                <th className="px-4 py-2">마감</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <DesktopRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>

          <ul className="lg:hidden">
            {items.map((item) => (
              <MobileRow key={item.id} item={item} />
            ))}
          </ul>
        </>
      ) : (
        <p className="px-4 py-12 text-center text-sm text-muted">
          아직 올라온 글이 없습니다.
          <span className="mt-1 block text-subtle">상품 사진과 판매자가 함께 표시됩니다.</span>
        </p>
      )}
    </section>
  );
}
