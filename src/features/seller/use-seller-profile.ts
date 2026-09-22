'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchSellerProfile, saveSellerProfile } from '@/lib/seller-remote';
import type { SellerProfile } from '@/types/seller';

export function useSellerProfile(sellerId?: string | null) {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!sellerId) {
      setProfile(null);
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    void fetchSellerProfile(sellerId)
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
  }, [sellerId]);

  const save = useCallback(async (next: SellerProfile) => {
    const stored = await saveSellerProfile(next);
    setProfile(stored);
    return stored;
  }, []);

  return { profile, ready, save };
}
