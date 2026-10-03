'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchRemoteSellListings } from '@/lib/sell-remote';
import { findSellListing, normalizeSellListings } from '@/lib/sell-store';
import type { SellListing } from '@/types/sell';

export function useSellListings() {
  const [userItems, setUserItems] = useState<SellListing[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const items = await fetchRemoteSellListings();
    setUserItems(items);
    return items;
  }, []);

  useEffect(() => {
    let cancelled = false;

    void load()
      .catch(() => {
        if (!cancelled) setUserItems([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [load]);

  const items = useMemo(() => normalizeSellListings(userItems), [userItems]);

  const refreshRemaining = useCallback(() => {
    void load().catch(() => setUserItems([]));
  }, [load]);

  const add = useCallback((item: SellListing) => {
    setUserItems((current) => [item, ...current.filter((entry) => entry.id !== item.id)]);
  }, []);

  const remove = useCallback((id: string) => {
    setUserItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const upsert = useCallback((item: SellListing) => {
    setUserItems((current) => [item, ...current.filter((entry) => entry.id !== item.id)]);
  }, []);

  const getById = useCallback((id: string) => findSellListing(id, userItems), [userItems]);

  const mine = useCallback((sellerId: string) => userItems.filter((item) => item.sellerId === sellerId), [userItems]);

  return { items, ready, add, remove, upsert, getById, mine, refreshRemaining };
}
