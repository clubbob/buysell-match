'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { inputClassName } from '@/features/auth/auth-errors';
import { useBuyerProfile } from '@/features/buyer/use-buyer-profile';
import { formatPhoneNumber, PHONE_HYPHEN_HINT } from '@/lib/phone-number';
import { scrollToFormField } from '@/lib/form-scroll';
import { BUYER_DETAIL_LABEL } from '@/lib/profile-labels';
import DefaultAddressBadge from '@/components/ui/DefaultAddressBadge';
import { cn } from '@/lib/utils';
import { createBuyerAddress, hasBuyerProfile, resolveDefaultAddressId, type BuyerAddress } from '@/types/buyer';

function fieldInputClass(hasError: boolean) {
  return cn(inputClassName, hasError && 'border-red-300 focus:border-red-400 focus:ring-red-300');
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-danger" role="alert">
      {message}
    </p>
  );
}

export default function BuyerProfileForm() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { profile, ready: profileReady, save } = useBuyerProfile(user?.uid);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [addresses, setAddresses] = useState<BuyerAddress[]>(() => [createBuyerAddress()]);
  const [defaultAddressId, setDefaultAddressId] = useState(() => addresses[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [filled, setFilled] = useState(false);
  const [done, setDone] = useState<'created' | 'updated' | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!profileReady || filled) return;
    if (profile) {
      const next = profile.addresses.length > 0 ? profile.addresses : [createBuyerAddress()];
      setBuyerPhone(formatPhoneNumber(profile.buyerPhone));
      setAddresses(next);
      setDefaultAddressId(resolveDefaultAddressId(next, profile.defaultAddressId));
    } else {
      setDefaultAddressId((current) => current || '');
    }
    setFilled(true);
  }, [profile, profileReady, filled]);

  function updateAddress(id: string, address: string) {
    setAddresses((current) => current.map((item) => (item.id === id ? { ...item, address } : item)));
    setAddressErrors((current) => {
      if (!current[id]) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function addAddress() {
    const next = createBuyerAddress();
    setAddresses((current) => [...current, next]);
    if (!defaultAddressId) setDefaultAddressId(next.id);
  }

  function removeAddress(id: string) {
    setAddresses((current) => {
      if (current.length <= 1) return current;
      const next = current.filter((item) => item.id !== id);
      if (defaultAddressId === id) setDefaultAddressId(next[0]?.id ?? '');
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!user) {
      setError('로그인 후 등록할 수 있습니다.');
      return;
    }

    const cleaned = addresses.map((item) => ({ ...item, address: item.address.trim() })).filter((item) => item.address);
    const next = {
      buyerId: user.uid,
      buyerPhone: formatPhoneNumber(buyerPhone),
      addresses: cleaned,
      defaultAddressId: resolveDefaultAddressId(cleaned, defaultAddressId),
    };

    const nextPhoneError = buyerPhone.trim() ? null : '핸드폰 번호를 입력해 주세요.';
    const nextAddressErrors: Record<string, string> = {};
    if (cleaned.length === 0) {
      const targetId = addresses[0]?.id;
      if (targetId) nextAddressErrors[targetId] = '배송 주소를 입력해 주세요.';
    }
    setPhoneError(nextPhoneError);
    setAddressErrors(nextAddressErrors);
    if (nextPhoneError || Object.keys(nextAddressErrors).length > 0) {
      window.requestAnimationFrame(() => {
        if (nextPhoneError) {
          scrollToFormField('buyer-field-phone');
          return;
        }
        const firstAddressId = addresses.find((item) => nextAddressErrors[item.id])?.id;
        if (firstAddressId) scrollToFormField(`buyer-field-address-${firstAddressId}`);
      });
      return;
    }

    setPending(true);
    const creating = !hasBuyerProfile(profile);
    try {
      await save(next);
      setDone(creating ? 'created' : 'updated');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '저장에 실패했습니다.');
    } finally {
      setPending(false);
    }
  }

  if (loading || !user || !profileReady) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  if (done) {
    return (
      <div className="mt-6 space-y-4">
        <p className="text-sm text-ink">
          {done === 'created' ? `${BUYER_DETAIL_LABEL}이 완료되었습니다.` : `${BUYER_DETAIL_LABEL} 수정이 완료되었습니다.`}
        </p>
        <div className="action-row mt-0">
          <Link href="/mypage" className="btn-primary">
            마이페이지
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">핸드폰 번호</span>
        <input
          id="buyer-field-phone"
          type="tel"
          autoComplete="tel"
          value={buyerPhone}
          onChange={(event) => {
            setBuyerPhone(formatPhoneNumber(event.target.value));
            setPhoneError(null);
          }}
          className={fieldInputClass(Boolean(phoneError))}
          inputMode="numeric"
        />
        <span className="block text-xs text-subtle">{PHONE_HYPHEN_HINT}</span>
        <FieldError message={phoneError ?? undefined} />
      </label>

      <div className="space-y-3">
        <span className="block text-sm font-semibold text-ink">배송 주소</span>
        <p className="text-xs text-subtle">
          {hasBuyerProfile(profile)
            ? '주문할 때 쓸 기본 배송 주소를 고르세요. 주소는 여러 개 넣을 수 있습니다.'
            : '주문할 때 쓸 기본 배송 주소를 고르세요.'}
        </p>
        {addresses.map((item, index) => (
          <div key={item.id} className="space-y-2 border border-line px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                배송 주소 {index + 1}
                {defaultAddressId === item.id ? <DefaultAddressBadge /> : null}
              </span>
              {addresses.length > 1 ? (
                <button type="button" className="btn-chip" onClick={() => removeAddress(item.id)}>
                  삭제
                </button>
              ) : null}
            </div>
            <input
              id={`buyer-field-address-${item.id}`}
              autoComplete={index === 0 ? 'street-address' : 'off'}
              value={item.address}
              onChange={(event) => updateAddress(item.id, event.target.value)}
              className={fieldInputClass(Boolean(addressErrors[item.id]))}
              placeholder="배송 받을 주소를 입력해 주세요"
            />
            <FieldError message={addressErrors[item.id]} />
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="defaultAddress"
                checked={defaultAddressId === item.id}
                onChange={() => setDefaultAddressId(item.id)}
                className="h-4 w-4 accent-ink"
              />
              주문 시 이 주소 사용
            </label>
          </div>
        ))}
        {hasBuyerProfile(profile) ? (
          <button type="button" className="btn-secondary" onClick={addAddress}>
            배송 주소 추가
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="action-row">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? '저장 중…' : '저장'}
        </button>
        <Link href="/mypage" className="btn-secondary">
          마이페이지
        </Link>
      </div>
    </form>
  );
}
