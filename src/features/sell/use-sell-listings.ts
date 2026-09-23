'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchRemoteSellListings } from '@/lib/sell-remote';
import { findSellListing, mergeSellListings } from '@/lib/sell-store';
import type { SellListing } from '@/types/sell';

export function useSellListings() {
  const [userItems, setUserItems] = useState<SellListing[]>([]);
  const [ready, setReady] = useState(false);
  const [remainingTick, setRemainingTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void fetchRemoteSellListings()
      .then((items) => {
        if (!cancelled) setUserItems(items);
      })
      .catch(() => {
        if (!cancelled) setUserItems([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(() => mergeSellListings(userItems), [userItems, remainingTick]);

  const refreshRemaining = useCallback(() => {
    setRemainingTick((value) => value + 1);
  }, []);

  const add = useCallback((item: SellListing) => {
    setUserItems((current) => [item, ...current.filter((entry) => entry.id !== item.id)]);
  }, []);

  const remove = useCallback((id: string) => {
    setUserItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const getById = useCallback((id: string) => findSellListing(id, userItems), [userItems]);

  const mine = useCallback((sellerId: string) => userItems.filter((item) => item.sellerId === sellerId), [userItems]);

  return { items, ready, add, remove, getById, mine, refreshRemaining };
}
