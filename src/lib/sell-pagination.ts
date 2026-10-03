export const SELL_LIST_PAGE_SIZE = 20;

export function parseSellListPage(value: string | undefined | null): number {
  const page = Number(value);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export function paginateItems<T>(items: T[], page: number, pageSize = SELL_LIST_PAGE_SIZE) {
  const total = items.length;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    total,
    totalPages,
    pageSize,
  };
}

export function sellListHref(options: {
  seller?: string;
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (options.seller) params.set('seller', options.seller);
  if (options.q?.trim()) params.set('q', options.q.trim());
  if (options.category) params.set('category', options.category);
  if (options.sort && options.sort !== 'newest') params.set('sort', options.sort);
  if (options.page && options.page > 1) params.set('page', String(options.page));
  const query = params.toString();
  return query ? `/sell?${query}` : '/sell';
}
