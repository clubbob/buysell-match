import { cn } from '@/lib/utils';

/** 만족·추천: 엄지척 */
export default function LogoMarkThumbs({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-full w-full', className)} fill="none" aria-hidden>
      <path
        d="M10.25 10.5V7.35c0-.85.65-1.5 1.45-1.5.5 0 .95.3 1.1.75l1.2 3.65c.15.45.55.75 1 .75h3.35c.7 0 1.25.55 1.2 1.25l-.55 3.85c-.05.55-.5.95-1.05.95h-4.65c-.75 0-1.45-.35-1.9-.9l-2.15-2.75c-.4-.5-.3-1.25.2-1.65.3-.25.7-.4 1.1-.4h.7Z"
        fill="currentColor"
      />
      <rect x="5.75" y="10.25" width="2.75" height="7.25" rx="1.1" fill="currentColor" />
    </svg>
  );
}
