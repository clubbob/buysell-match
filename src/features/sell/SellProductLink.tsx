'use client';

import { normalizeHttpUrl } from '@/lib/sell-source';

export default function SellProductLink({ href, label }: { href: string; label: string }) {
  const url = normalizeHttpUrl(href);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-chip">
      {label}
    </a>
  );
}
