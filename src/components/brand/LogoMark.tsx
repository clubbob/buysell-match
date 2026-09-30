import { cn } from '@/lib/utils';

/** 공동구매: 양옆 모임(원) + 가운데 상품(택배 박스) */
export default function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-full w-full', className)} fill="none" aria-hidden>
      <circle cx="4.15" cy="13.35" r="2.35" fill="currentColor" />
      <circle cx="19.85" cy="13.35" r="2.35" fill="currentColor" />
      <rect x="7.5" y="11.5" width="9" height="9.5" rx="1.65" fill="currentColor" />
      <rect x="7" y="6.75" width="10" height="3.85" rx="1.1" fill="currentColor" />
    </svg>
  );
}
