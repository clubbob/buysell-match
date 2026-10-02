'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { inputClassName } from '@/features/auth/auth-errors';
import { parseSellSort, type SellSort } from '@/lib/sell-filters';
import { SELL_CATEGORY_OPTIONS, SELL_CATEGORY_LABELS } from '@/types/sell-category';

export default function SellListFilters({
  q = '',
  category = '',
  sort = 'deadline',
  seller,
}: {
  q?: string;
  category?: string;
  sort?: SellSort;
  seller?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedSort, setSelectedSort] = useState(parseSellSort(sort));

  useEffect(() => {
    setQuery(q);
    setSelectedCategory(category);
    setSelectedSort(parseSellSort(sort));
  }, [q, category, sort]);

  function applyFilters(next?: { q?: string; category?: string; sort?: SellSort }) {
    const params = new URLSearchParams();
    if (seller) params.set('seller', seller);
    const nextQ = next?.q ?? query;
    const nextCategory = next?.category ?? selectedCategory;
    const nextSort = next?.sort ?? selectedSort;
    if (nextQ.trim()) params.set('q', nextQ.trim());
    if (nextCategory) params.set('category', nextCategory);
    if (nextSort && nextSort !== 'deadline') params.set('sort', nextSort);
    const href = params.toString() ? `/sell?${params.toString()}` : '/sell';
    router.push(href);
  }

  return (
    <form
      className="panel flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters();
      }}
    >
      <label className="min-w-0 flex-1 space-y-1.5">
        <span className="text-sm font-semibold text-ink">검색</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={inputClassName}
          placeholder="상품명·판매자"
        />
      </label>
      <label className="w-full space-y-1.5 sm:w-40">
        <span className="text-sm font-semibold text-ink">카테고리</span>
        <select
          value={selectedCategory}
          onChange={(event) => {
            const value = event.target.value;
            setSelectedCategory(value);
            applyFilters({ category: value });
          }}
          className={inputClassName}
        >
          <option value="">전체</option>
          {SELL_CATEGORY_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {SELL_CATEGORY_LABELS[item]}
            </option>
          ))}
        </select>
      </label>
      <label className="w-full space-y-1.5 sm:w-40">
        <span className="text-sm font-semibold text-ink">정렬</span>
        <select
          value={selectedSort}
          onChange={(event) => {
            const value = parseSellSort(event.target.value);
            setSelectedSort(value);
            applyFilters({ sort: value });
          }}
          className={inputClassName}
        >
          <option value="deadline">마감 임박</option>
          <option value="newest">최신 등록</option>
          <option value="price-asc">낮은 가격</option>
          <option value="price-desc">높은 가격</option>
        </select>
      </label>
      <button type="submit" className="btn-primary w-full sm:w-auto">검색</button>
    </form>
  );
}
