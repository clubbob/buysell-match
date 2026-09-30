import { cn } from '@/lib/utils';

/** 공동구매: 겹쳐진 사람 여러 명 */
export default function LogoMarkPeople({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-full w-full', className)} fill="none" aria-hidden>
      <circle cx="7.25" cy="7.75" r="1.9" fill="currentColor" />
      <path d="M5.25 17.5c0-2.15 1.55-3.75 2.75-3.9" fill="currentColor" />
      <circle cx="16.75" cy="7.75" r="1.9" fill="currentColor" />
      <path d="M15.75 13.6c1.2.15 2.75 1.75 2.75 3.9" fill="currentColor" />
      <circle cx="12" cy="6.25" r="2.2" fill="currentColor" />
      <path d="M7.5 18c0-3 1.95-5.25 4.5-5.25s4.5 2.25 4.5 5.25" fill="currentColor" />
    </svg>
  );
}
