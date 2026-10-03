'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export type AdminListFilterOption = {
  value: string;
  label: string;
  href: string;
};

export default function AdminListFilters({
  options,
  current,
}: {
  options: AdminListFilterOption[];
  current: string;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
      {options.map((option) => (
        <Link
          key={option.value}
          href={option.href}
          className={cn(
            'btn-chip',
            current === option.value && 'bg-ink text-white hover:bg-ink hover:text-white',
          )}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
