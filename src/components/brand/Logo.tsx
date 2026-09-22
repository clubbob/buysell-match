import { SITE_NAME } from '@/lib/site';
import { cn } from '@/lib/utils';

export default function Logo({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex h-6 w-6 shrink-0 items-center justify-center text-[11px] font-bold leading-none',
          inverted ? 'bg-white text-ink' : 'bg-ink text-white',
        )}
        aria-hidden
      >
        공
      </span>
      <span className={cn('truncate text-[15px] font-bold tracking-tight', inverted ? 'text-white' : 'text-ink')}>
        {SITE_NAME}
      </span>
    </span>
  );
}
