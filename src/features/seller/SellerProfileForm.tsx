'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { inputClassName, isValidEmail } from '@/features/auth/auth-errors';
import { useUserMode } from '@/features/mode/mode-context';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { digitsOnly, formatBusinessNumber } from '@/lib/business-number';
import { isSellerProfileComplete } from '@/types/seller';

type StatusApiResponse =
  | {
      ok: true;
      data: { businessNumber: string; statusLabel: string; taxType: string | null };
    }
  | {
      ok: false;
      error?: { message?: string };
      data?: { statusLabel?: string; message?: string };
    };

export default function SellerProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { mode, ready: modeReady, setMode } = useUserMode();
  const { profile, ready: profileReady, save } = useSellerProfile(user?.uid);
  const [sellerName, setSellerName] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [verifiedNumber, setVerifiedNumber] = useState('');
  const [statusLabel, setStatusLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [filled, setFilled] = useState(false);

  const nextPath = searchParams.get('next') === '/sell/new' ? '/sell/new' : '/mypage';
  const verified = digitsOnly(businessNumber) === digitsOnly(verifiedNumber) && digitsOnly(verifiedNumber).length === 10;

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (user && modeReady && mode !== 'seller') setMode('seller');
  }, [user, modeReady, mode, setMode]);

  useEffect(() => {
    if (!profileReady || filled) return;
    if (profile) {
      setSellerName(profile.sellerName);
      setRepresentativeName(profile.representativeName);
      setSellerPhone(profile.sellerPhone);
      setSellerEmail(profile.sellerEmail);
      setBusinessNumber(formatBusinessNumber(profile.businessNumber));
      if (profile.businessVerified) {
        setVerifiedNumber(formatBusinessNumber(profile.businessNumber));
        setStatusLabel('계속사업자');
      }
    } else if (user?.email) {
      setSellerEmail(user.email);
    }
    setFilled(true);
  }, [profile, profileReady, user, filled]);

  async function handleLookup() {
    setError(null);
    setLookupError(null);
    if (digitsOnly(businessNumber).length !== 10) {
      setLookupError('사업자등록번호 10자리를 입력해 주세요.');
      return;
    }

    setLookingUp(true);
    try {
      const response = await fetch('/api/biz/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessNumber }),
      });
      const data = (await response.json()) as StatusApiResponse;
      if (!response.ok || !data.ok) {
        setVerifiedNumber('');
        setStatusLabel('');
        const message = !data.ok ? data.error?.message || data.data?.message || '검증에 실패했습니다.' : '검증에 실패했습니다.';
        setLookupError(message);
        return;
      }
      setBusinessNumber(data.data.businessNumber);
      setVerifiedNumber(data.data.businessNumber);
      setStatusLabel(data.data.statusLabel);
    } catch {
      setVerifiedNumber('');
      setStatusLabel('');
      setLookupError('검증에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLookingUp(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!user) {
      setError('로그인 후 등록할 수 있습니다.');
      return;
    }
    if (!verified) {
      setLookupError('사업자등록번호를 검증해 주세요. 계속사업자만 등록할 수 있습니다.');
      return;
    }
    if (!sellerName.trim() || !representativeName.trim() || !sellerPhone.trim()) {
      setError('상호, 대표자, 전화를 입력해 주세요.');
      return;
    }
    if (!isValidEmail(sellerEmail)) {
      setError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }

    setPending(true);
    try {
      await save({
        sellerId: user.uid,
        sellerName: sellerName.trim(),
        representativeName: representativeName.trim(),
        sellerPhone: sellerPhone.trim(),
        sellerEmail: sellerEmail.trim(),
        businessNumber: formatBusinessNumber(verifiedNumber),
        businessVerified: true,
      });
      router.replace(nextPath);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '저장에 실패했습니다.');
      setPending(false);
    }
  }

  if (loading || !user || !profileReady) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <span className="block text-sm font-semibold text-ink">사업자등록번호</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            inputMode="numeric"
            autoComplete="off"
            value={businessNumber}
            onChange={(event) => {
              const next = formatBusinessNumber(event.target.value);
              setBusinessNumber(next);
              if (digitsOnly(next) !== digitsOnly(verifiedNumber)) {
                setVerifiedNumber('');
                setStatusLabel('');
              }
              setLookupError(null);
            }}
            className={`${inputClassName} sm:flex-1`}
            placeholder="000-00-00000"
            required
          />
          <button type="button" onClick={() => void handleLookup()} disabled={lookingUp} className="btn-secondary sm:shrink-0">
            {lookingUp ? '검증 중…' : '검증하기'}
          </button>
        </div>
        {verified ? (
          <p className="text-sm text-ink">조회 결과: {statusLabel || '계속사업자'} (조회 시점 기준)</p>
        ) : lookupError ? (
          <p className="text-sm text-danger" role="alert">
            {lookupError}
          </p>
        ) : (
          <p className="text-sm text-muted">계속사업자로 조회된 경우에만 판매자 정보를 등록할 수 있습니다.</p>
        )}
        <p className="text-xs text-subtle">출처: 국세청, 공공데이터포털</p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">상호</span>
        <input value={sellerName} onChange={(event) => setSellerName(event.target.value)} className={inputClassName} required />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">대표자</span>
        <input
          value={representativeName}
          onChange={(event) => setRepresentativeName(event.target.value)}
          className={inputClassName}
          required
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">전화</span>
          <input value={sellerPhone} onChange={(event) => setSellerPhone(event.target.value)} className={inputClassName} required />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">이메일</span>
          <input
            type="email"
            value={sellerEmail}
            onChange={(event) => setSellerEmail(event.target.value)}
            className={inputClassName}
            required
          />
        </label>
      </div>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary" disabled={pending || !verified}>
        {pending ? '저장 중…' : isSellerProfileComplete(profile) ? '수정하기' : '등록하기'}
      </button>
    </form>
  );
}
