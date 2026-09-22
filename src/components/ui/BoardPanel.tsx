import Link from 'next/link';

export default function BoardPanel({
  title,
  description,
  href,
  actionLabel,
  columns,
  empty,
}: {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
  columns: string[];
  empty: string;
}) {
  return (
    <section className="panel min-w-0 flex-1 overflow-hidden">
      <header className="flex flex-col gap-2 border-b border-line px-4 py-3.5 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        </div>
        {href && actionLabel ? (
          <Link
            href={href}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline-offset-2 hover:underline sm:min-h-0 sm:shrink-0"
          >
            {actionLabel}
          </Link>
        ) : null}
      </header>
      <div
        className="hidden border-b border-line bg-slate-50 px-4 py-2 text-[11px] font-semibold tracking-wide text-subtle sm:grid"
        style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
      >
        {columns.map((column) => (
          <span key={column}>{column}</span>
        ))}
      </div>
      <p className="px-4 py-12 text-center text-sm text-muted">{empty}</p>
    </section>
  );
}
