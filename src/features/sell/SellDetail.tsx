'use client';

import Link from 'next/link';
import SellImageGallery from '@/features/sell/SellImageGallery';
import SellGuidePanel from '@/features/sell/SellGuidePanel';
import SellJoinSection from '@/features/sell/SellJoinSection';
import PageBack from '@/components/ui/PageBack';
import { useState } from 'react';
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

export default function SellDetail({ item, onRemainingChange }: { item: SellListing; onRemainingChange?: () => void }) {
  const [join, setJoin] = useState<OpenJoinSummary>({ quantity: 0, buyers: 0 });
  const joinNote = formatJoinParticipants(join.buyers, join.quantity);
  const rate = discountRate(item.regularPrice, item.salePrice);
  const remainingShort = isRemainingShort(item.minPurchaseLabel, item.remainingLabel);
  const deadline = deadlineParts(item.deadline);

  return (
    <div className="space-y-5">
      <PageBack href="/sell" />

      <article className="panel overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full border-b border-line lg:w-[22rem] lg:shrink-0 lg:self-stretch lg:border-b-0 lg:border-r">
            <SellImageGallery images={item.images} alt={item.title} />
          </div>

          <div className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6">
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{item.title}</h1>

            <dl className="mt-5">
              <Spec label="판매자">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="whitespace-nowrap font-semibold">{item.sellerName}</span>
                  {item.businessVerified ? (
                    <Link
                      href={`/seller/${item.sellerId}/verify?from=${item.id}`}
                      className="btn-chip"
                    >
                      사업자 인증
                    </Link>
                  ) : (
                    <span className="whitespace-nowrap text-xs text-subtle">인증 대기</span>
                  )}
                  {item.sellerMobile ? (
                    <span className="whitespace-nowrap text-muted">핸드폰 {item.sellerMobile}</span>
                  ) : null}
                  {item.sellerPhone ? (
                    <span className="whitespace-nowrap text-muted">사업장 전화 {item.sellerPhone}</span>
                  ) : null}
                  <span className="whitespace-nowrap text-muted">이메일 {item.sellerEmail}</span>
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
          </div>
        </div>

        <SellJoinSection item={item} onRemainingChange={onRemainingChange} onJoinChange={setJoin} />
      </article>

      <SellGuidePanel item={item} />

      <p className="text-xs leading-relaxed text-subtle">
        공구매칭은 통신판매중개자이며 결제·정산·배송의 당사자가 아닙니다. 거래는 판매자와 구매자 사이에서 이루어집니다.
      </p>
    </div>
  );
}
