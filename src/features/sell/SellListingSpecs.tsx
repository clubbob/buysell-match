'use client';

import Link from 'next/link';
import { deadlineParts, discountRate, formatJoinParticipants, formatQuantityNumber, formatWon, isRemainingShort } from '@/lib/sell-display';
import type { OpenJoinSummary } from '@/types/sell-join';
import type { SellListing } from '@/types/sell';

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3 border-b border-line py-3 text-sm">
      <dt className="leading-snug text-subtle">{label}</dt>
      <dd className="flex min-h-[1.75rem] items-center text-ink">{children}</dd>
    </div>
  );
}

export default function SellListingSpecs({
  item,
  join,
  showTitle = true,
  showSellerContact = false,
}: {
  item: SellListing;
  join?: OpenJoinSummary;
  showTitle?: boolean;
  showSellerContact?: boolean;
}) {
  const joinNote = formatJoinParticipants(join?.buyers ?? 0, join?.quantity ?? 0);
  const rate = discountRate(item.regularPrice, item.salePrice);
  const remainingShort = isRemainingShort(item.minPurchaseLabel, item.remainingLabel);
  const deadline = deadlineParts(item.deadline);

  return (
    <dl>
      {showTitle ? <Spec label="상품">{item.title}</Spec> : null}
      <Spec label="판매자">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="whitespace-nowrap font-semibold">{item.sellerName}</span>
          {showSellerContact ? (
            <>
              {item.businessVerified ? (
                <Link href={`/seller/${item.sellerId}/verify?from=${item.id}`} className="btn-chip">
                  사업자 인증
                </Link>
              ) : (
                <span className="whitespace-nowrap text-xs text-subtle">인증 대기</span>
              )}
              {item.sellerMobile ? <span className="whitespace-nowrap text-muted">핸드폰 {item.sellerMobile}</span> : null}
              {item.sellerPhone ? <span className="whitespace-nowrap text-muted">사업장 전화 {item.sellerPhone}</span> : null}
              <span className="whitespace-nowrap text-muted">이메일 {item.sellerEmail}</span>
            </>
          ) : null}
        </div>
      </Spec>
      <Spec label="정상 가격">
        <span className="text-subtle line-through tabular-nums">{formatWon(item.regularPrice)}</span>
      </Spec>
      <Spec label="특판 가격">
        <span>
          <span className="font-semibold tabular-nums">{formatWon(item.salePrice)}</span>
          {rate > 0 ? <span className="mt-0.5 block text-xs font-medium text-muted">(할인율 {rate}%)</span> : null}
        </span>
      </Spec>
      <Spec label="공구 최소 주문">
        <span>
          <span className="tabular-nums">{formatQuantityNumber(item.minPurchaseLabel)}</span>
          {joinNote ? <span className="mt-0.5 block text-xs font-medium text-muted">{joinNote}</span> : null}
        </span>
      </Spec>
      <Spec label="잔여 수량">
        <span>
          <span className="tabular-nums">{formatQuantityNumber(item.remainingLabel)}</span>
          {remainingShort ? <span className="mt-0.5 block text-xs font-medium text-muted">잔여 부족</span> : null}
        </span>
      </Spec>
      <Spec label="마감">
        <span>
          <span className="tabular-nums">{deadline.date}</span>
          <span className="mt-0.5 block text-xs font-medium text-muted">{deadline.note}</span>
        </span>
      </Spec>
    </dl>
  );
}
