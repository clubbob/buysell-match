import LogoMark from '@/components/brand/LogoMark';
import LogoMarkLink from '@/components/brand/LogoMarkLink';
import LogoMarkPeople from '@/components/brand/LogoMarkPeople';
import LogoMarkDiscount from '@/components/brand/LogoMarkDiscount';
import LogoMarkThumbs from '@/components/brand/LogoMarkThumbs';
import LogoMarkUnbox from '@/components/brand/LogoMarkUnbox';
import { SITE_NAME } from '@/lib/site';
import { cn } from '@/lib/utils';

export type LogoMarkVariant = 'group' | 'link' | 'people' | 'unbox' | 'discount' | 'thumbs';

export default function Logo({
  className,
  inverted = false,
  mark = 'group',
}: {
  className?: string;
  inverted?: boolean;
  mark?: LogoMarkVariant;
}) {
  const Mark =
    mark === 'link'
      ? LogoMarkLink
      : mark === 'people'
        ? LogoMarkPeople
        : mark === 'unbox'
          ? LogoMarkUnbox
          : mark === 'discount'
            ? LogoMarkDiscount
            : mark === 'thumbs'
              ? LogoMarkThumbs
              : LogoMark;

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] p-0',
          inverted ? 'bg-white text-ink' : 'bg-ink text-white',
        )}
        aria-hidden
      >
        <Mark />
      </span>
      <span className={cn('truncate text-[15px] font-bold tracking-tight', inverted ? 'text-white' : 'text-ink')}>
        {SITE_NAME}
      </span>
    </span>
  );
}
