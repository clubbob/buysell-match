import { INTERMEDIARY_NOTICE } from '@/lib/legal-notice';
import { cn } from '@/lib/utils';

export default function IntermediaryNotice({
  className,
  variant = 'default',
}: {
  className?: string;
  variant?: 'default' | 'panel' | 'emphasized' | 'footer';
}) {
  if (variant === 'footer') {
    return (
      <p className={cn('text-sm font-medium leading-relaxed text-ink', className)} role="note">
        {INTERMEDIARY_NOTICE}
      </p>
    );
  }

  if (variant === 'panel') {
    return (
      <p className={cn('border border-line bg-slate-50 px-4 py-3 text-sm leading-relaxed text-ink', className)} role="note">
        {INTERMEDIARY_NOTICE}
      </p>
    );
  }

  if (variant === 'emphasized') {
    return (
      <p className={cn('text-sm font-medium leading-relaxed text-ink', className)} role="note">
        {INTERMEDIARY_NOTICE}
      </p>
    );
  }

  return (
    <p className={cn('text-xs leading-relaxed text-subtle', className)} role="note">
      {INTERMEDIARY_NOTICE}
    </p>
  );
}
