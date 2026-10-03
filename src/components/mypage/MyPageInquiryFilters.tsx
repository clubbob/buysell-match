'use client';

import Link from 'next/link';
import { mypageInquiriesHref, type MyPageInquiryKind } from '@/lib/mypage-nav';
import { cn } from '@/lib/utils';

const FILTERS: { value: MyPageInquiryKind; label: string; description: string }[] = [
  { value: 'all', label: '전체', description: '서비스·상품 문의 모두' },
  { value: 'site', label: '서비스 문의', description: '운영팀에 남긴 문의' },
  { value: 'sell', label: '상품 문의', description: '판매 상품 Q&A' },
];

export default function MyPageInquiryFilters({ current }: { current: MyPageInquiryKind }) {
  return (
    <div className="panel px-4 py-3 sm:px-5">
      <p className="text-sm font-semibold text-ink">문의 종류</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={mypageInquiriesHref(filter.value)}
            className={cn(
              'btn-chip',
              current === filter.value && 'bg-ink text-white hover:bg-ink hover:text-white',
            )}
            title={filter.description}
          >
            {filter.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
