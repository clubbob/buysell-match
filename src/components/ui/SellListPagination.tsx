import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SellListPagination({
  page,
  totalPages,
  total,
  hrefForPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  hrefForPage: (page: number) => string;
}) {
  if (total <= 0) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const showNumbers = totalPages <= 7;
  const visiblePages = showNumbers
    ? pages
    : pages.filter((entry) => entry === 1 || entry === totalPages || Math.abs(entry - page) <= 1);

  return (
    <nav
      className="flex flex-col items-center gap-3 border-t border-line px-4 py-4 sm:flex-row sm:justify-between sm:px-6"
      aria-label="판매 상품 페이지"
    >
      <p className="text-sm text-muted">
        전체 {total.toLocaleString('ko-KR')}건
        {totalPages > 1 ? ` · ${page} / ${totalPages} 페이지` : null}
      </p>
      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {page > 1 ? (
            <Link href={hrefForPage(page - 1)} className="btn-secondary">
              이전
            </Link>
          ) : (
            <span className="btn-secondary pointer-events-none opacity-50">이전</span>
          )}
          {visiblePages.map((entry, index) => {
            const prev = visiblePages[index - 1];
            const gap = prev != null && entry - prev > 1;
            return (
              <span key={entry} className="inline-flex items-center gap-2">
                {gap ? <span className="px-1 text-sm text-subtle">…</span> : null}
                <Link
                  href={hrefForPage(entry)}
                  aria-current={entry === page ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-10 min-w-10 items-center justify-center border px-2 text-sm font-semibold',
                    entry === page
                      ? 'border-ink bg-ink text-white'
                      : 'border-line bg-white text-ink hover:bg-slate-50',
                  )}
                >
                  {entry}
                </Link>
              </span>
            );
          })}
          {page < totalPages ? (
            <Link href={hrefForPage(page + 1)} className="btn-secondary">
              다음
            </Link>
          ) : (
            <span className="btn-secondary pointer-events-none opacity-50">다음</span>
          )}
        </div>
      ) : null}
    </nav>
  );
}
