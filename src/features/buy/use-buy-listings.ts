'use client';

import { useEffect, useState } from 'react';
import { fetchRemoteBuyListings } from '@/lib/buy-remote';
import type { BuyListing } from '@/types/buy';

export function useBuyListings() {
  const [items, setItems] = useState<BuyListing[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetchRemoteBuyListings()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, ready };
}
