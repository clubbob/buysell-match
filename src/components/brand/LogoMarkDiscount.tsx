import { cn } from '@/lib/utils';

/** 특가·할인: 가격 태그 + % */
export default function LogoMarkDiscount({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-full w-full', className)} fill="none" aria-hidden>
      <path
        d="M12 5.1a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM8.25 8.1c0-.55.45-1 1-1h5.5c.55 0 1 .45 1 1v6.35l-4.75 3.65-4.75-3.65V8.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10.15" cy="10.85" r="1.35" fill="currentColor" />
      <circle cx="13.85" cy="14.55" r="1.35" fill="currentColor" />
      <path d="M14.35 9.15 9.65 16.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
