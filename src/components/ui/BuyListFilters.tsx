'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { inputClassName } from '@/features/auth/auth-errors';

export default function BuyListFilters({ q = '' }: { q?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(q);

  useEffect(() => {
    setQuery(q);
  }, [q]);

  return (
    <form
      className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        const href = query.trim() ? `/buy?q=${encodeURIComponent(query.trim())}` : '/buy';
        router.push(href);
      }}
    >
      <label className="min-w-0 flex-1 space-y-1.5">
        <span className="text-sm font-semibold text-ink">검색</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={inputClassName}
          placeholder="제목·구매자"
        />
      </label>
      <button type="submit" className="btn-primary w-full sm:w-auto">검색</button>
    </form>
  );
}
