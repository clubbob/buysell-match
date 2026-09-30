import { cn } from '@/lib/utils';

/** 매칭: 구매자·판매자를 잇는 연결 */
export default function LogoMarkLink({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-full w-full', className)} fill="none" aria-hidden>
      <circle cx="7.5" cy="12" r="2.75" fill="currentColor" />
      <path
        d="M10.4 12h3.2"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="16.5" cy="12" r="2.75" fill="currentColor" />
    </svg>
  );
}
