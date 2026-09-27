'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchBuyerProfile, saveBuyerProfile } from '@/lib/buyer-remote';
import type { BuyerProfile } from '@/types/buyer';

export function useBuyerProfile(buyerId?: string | null) {
  const [profile, setProfile] = useState<BuyerProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!buyerId) {
      setProfile(null);
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    void fetchBuyerProfile(buyerId)
      .then((item) => {
        if (!cancelled) setProfile(item);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [buyerId]);

  const save = useCallback(async (next: BuyerProfile) => {
    const stored = await saveBuyerProfile(next);
    setProfile(stored);
    return stored;
  }, []);

  return { profile, ready, save };
}
