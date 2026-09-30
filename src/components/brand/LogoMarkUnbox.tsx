import { cn } from '@/lib/utils';

/** 공구 상품: 열린 박스 + 언박싱 반짝임 */
export default function LogoMarkUnbox({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-full w-full', className)} fill="none" aria-hidden>
      <path d="M12 4.25l.55 1.35 1.45.35-1.1.9.35 1.45-1.25-.75-1.25.75.35-1.45-1.1-.9 1.45-.35z" fill="currentColor" />
      <path d="M5.75 8.25 12 5.25 18.25 8.25 12 11.25 5.75 8.25Z" fill="currentColor" />
      <path d="M6.25 11.75v6.75c0 .55.45 1 1 1h9.5c.55 0 1-.45 1-1v-6.75l-5.75 3-5.75-3Z" fill="currentColor" />
      <path d="M5.75 8.25v9.25l5.75 3.25 5.75-3.25V8.25" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}
