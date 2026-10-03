import { cn } from '@/lib/utils';

export default function MyPageInquirySectionHeader({
  title,
  tone,
  status,
  description,
  children,
}: {
  title: string;
  tone: 'site' | 'sell';
  status?: string | null;
  description: string;
  children?: React.ReactNode;
}) {
  const titleClass = tone === 'site' ? 'text-teal-950' : 'text-slate-950';
  const badgeClass =
    tone === 'site'
      ? 'border-teal-200 bg-teal-100 text-teal-900'
      : 'border-slate-200 bg-slate-100 text-slate-800';

  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-4 border-b border-line px-4 py-5 sm:px-6',
        tone === 'site' ? 'bg-teal-50/80' : 'bg-slate-50/90',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h2 className={cn('text-xl font-bold tracking-tight sm:text-2xl', titleClass)}>{title}</h2>
          {status ? (
            <span
              className={cn(
                'inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold sm:text-sm',
                badgeClass,
              )}
            >
              {status}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">{description}</p>
      </div>
      {children ? <div className="shrink-0 self-center">{children}</div> : null}
    </div>
  );
}
