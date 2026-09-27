'use client';

import { useEffect, useState } from 'react';
import { fetchOpenJoinSummaries } from '@/lib/sell-join-remote';
import type { OpenJoinSummary } from '@/types/sell-join';

export function useSellJoinTotals(listingIds: string[]) {
  const [totals, setTotals] = useState<Record<string, OpenJoinSummary>>({});
  const key = [...listingIds].sort().join(',');

  useEffect(() => {
    let cancelled = false;
    if (!key) {
      setTotals({});
      return;
    }

    void fetchOpenJoinSummaries(listingIds).then((next) => {
      if (!cancelled) setTotals(next);
    });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return totals;
}
