'use client';

import { useEffect, useState } from 'react';
import { fetchJoinListSummaries } from '@/lib/sell-join-remote';
import type { JoinListSummary } from '@/types/sell-join';

export function useSellJoinTotals(listingIds: string[]) {
  const [totals, setTotals] = useState<Record<string, JoinListSummary>>({});
  const key = [...listingIds].sort().join(',');

  useEffect(() => {
    let cancelled = false;
    if (!key) {
      setTotals({});
      return;
    }

    void fetchJoinListSummaries(listingIds).then((next) => {
      if (!cancelled) setTotals(next);
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return totals;
}
