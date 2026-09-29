'use client';

import { useEffect, useState } from 'react';
import { fetchMyMember, saveMyMarketingConsent } from '@/lib/member-remote';

export default function MyPageMarketingConsent() {
  const [agreed, setAgreed] = useState(false);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchMyMember()
      .then((member) => {
        if (cancelled) return;
        setAgreed(member.marketingAgreed);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : '회원 정보를 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onToggle(next: boolean) {
    if (!ready || pending || next === agreed) return;
    const previous = agreed;
    setAgreed(next);
    setPending(true);
    setError(null);
    try {
      const member = await saveMyMarketingConsent(next);
      setAgreed(member.marketingAgreed);
    } catch (saveError: unknown) {
      setAgreed(previous);
      setError(saveError instanceof Error ? saveError.message : '마케팅 수신 동의를 저장하지 못했습니다.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex shrink-0 items-center gap-x-3 whitespace-nowrap text-sm text-ink">
      <span className="font-semibold">마케팅 수신 동의</span>
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={ready && agreed}
          disabled={!ready || pending}
          onChange={() => void onToggle(true)}
          className="h-4 w-4 accent-ink"
        />
        선택
      </label>
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={ready && !agreed}
          disabled={!ready || pending}
          onChange={() => void onToggle(false)}
          className="h-4 w-4 accent-ink"
        />
        해제
      </label>
      {error ? (
        <span className="text-danger" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
