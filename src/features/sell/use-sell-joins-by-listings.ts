'use client';

import { useEffect, useState } from 'react';
import { fetchSellJoinsByListings } from '@/lib/sell-join-remote';
import type { SellJoin } from '@/types/sell-join';

export function useSellJoinsByListings(listingIds: string[]) {
  const [joinsByListing, setJoinsByListing] = useState<Record<string, SellJoin[]>>({});
  const key = [...listingIds].sort().join(',');

  useEffect(() => {
    let cancelled = false;
    if (!key) {
      setJoinsByListing({});
      return;
    }

    void fetchSellJoinsByListings(listingIds)
      .then((next) => {
        if (!cancelled) setJoinsByListing(next);
      })
      .catch(() => {
        if (!cancelled) setJoinsByListing({});
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return joinsByListing;
}
