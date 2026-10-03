'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { inputClassName } from '@/features/auth/auth-errors';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { digitsOnly, formatBusinessNumber } from '@/lib/business-number';
import { formatPhoneNumber, PHONE_HYPHEN_HINT } from '@/lib/phone-number';
import { SELLER_DETAIL_LABEL } from '@/lib/profile-labels';
import { scrollToFormField } from '@/lib/form-scroll';
import { uploadBusinessCertificate } from '@/lib/seller-remote';
import { cn } from '@/lib/utils';
import { hasSellerProfile } from '@/types/seller';

const CERT_MAX_BYTES = 8 * 1024 * 1024;

const SELLER_FIELD_ORDER: SellerField[] = [
  'businessNumber',
  'sellerName',
  'representativeName',
  'businessAddress',
  'sellerMobile',
  'sellerPhone',
  'depositBank',
  'depositAccount',
  'depositHolder',
  'certificate',
];

type SellerField =
  | 'businessNumber'
  | 'sellerName'
  | 'representativeName'
  | 'businessAddress'
  | 'sellerMobile'
  | 'sellerPhone'
  | 'depositBank'
  | 'depositAccount'
  | 'depositHolder'
  | 'certificate';

type SellerFieldErrors = Partial<Record<SellerField, string>>;

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
  const { user, loading } = useAuth();
  const { profile, ready: profileReady, save } = useSellerProfile(user?.uid);
  const [sellerName, setSellerName] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [sellerMobile, setSellerMobile] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [verifiedNumber, setVerifiedNumber] = useState('');
  const [verifiedAt, setVerifiedAt] = useState('');
  const [statusLabel, setStatusLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SellerFieldErrors>({});
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState('');
  const [depositBank, setDepositBank] = useState('');
  const [depositAccount, setDepositAccount] = useState('');
  const [depositHolder, setDepositHolder] = useState('');
  const [filled, setFilled] = useState(false);
  const [done, setDone] = useState<'created' | 'updated' | null>(null);

  const verified = digitsOnly(businessNumber) === digitsOnly(verifiedNumber) && digitsOnly(verifiedNumber).length === 10;

  function clearFieldError(field: SellerField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function collectFieldErrors(): SellerFieldErrors {
    const errors: SellerFieldErrors = {};
    if (!verified) {
      errors.businessNumber = '사업자등록번호를 검증해 주세요. 계속사업자만 등록할 수 있습니다.';
    }
    if (!sellerName.trim()) errors.sellerName = '상호를 입력해 주세요.';
    if (!representativeName.trim()) errors.representativeName = '대표자를 입력해 주세요.';
    if (!businessAddress.trim()) errors.businessAddress = '사업장 주소를 입력해 주세요.';
    if (!sellerMobile.trim()) errors.sellerMobile = '핸드폰 번호를 입력해 주세요.';
    if (!sellerPhone.trim()) errors.sellerPhone = '사업장 전화를 입력해 주세요.';
    if (!depositBank.trim()) errors.depositBank = '은행을 입력해 주세요.';
    if (!depositAccount.trim()) errors.depositAccount = '계좌번호를 입력해 주세요.';
    if (!depositHolder.trim()) errors.depositHolder = '예금주를 입력해 주세요.';
    if (!certificateFile && !certificateUrl) errors.certificate = '사업자등록증을 첨부해 주세요.';
    return errors;
  }

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!profileReady || filled) return;
    if (profile) {
      setSellerName(profile.sellerName);
      setRepresentativeName(profile.representativeName);
      setSellerMobile(formatPhoneNumber(profile.sellerMobile));
      setSellerPhone(formatPhoneNumber(profile.sellerPhone));
      setBusinessAddress(profile.businessAddress);
      setBusinessNumber(formatBusinessNumber(profile.businessNumber));
      if (profile.businessVerified) {
        setVerifiedNumber(formatBusinessNumber(profile.businessNumber));
        setVerifiedAt(profile.businessVerifiedAt || new Date().toISOString().slice(0, 10));
        setStatusLabel('계속사업자');
      }
      if (profile.businessCertificateUrl) {
        setCertificateUrl(profile.businessCertificateUrl);
        setCertificatePreview(profile.businessCertificateUrl);
      }
      setDepositBank(profile.depositBank);
      setDepositAccount(profile.depositAccount);
      setDepositHolder(profile.depositHolder);
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
        setVerifiedAt('');
        setStatusLabel('');
        const message = !data.ok ? data.error?.message || data.data?.message || '검증에 실패했습니다.' : '검증에 실패했습니다.';
        setLookupError(message);
        return;
      }
      setBusinessNumber(data.data.businessNumber);
      setVerifiedNumber(data.data.businessNumber);
      setVerifiedAt(new Date().toISOString().slice(0, 10));
      setStatusLabel(data.data.statusLabel);
    } catch {
      setVerifiedNumber('');
      setVerifiedAt('');
      setStatusLabel('');
      setLookupError('검증에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLookingUp(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLookupError(null);
    if (!user) {
      setError('로그인 후 등록할 수 있습니다.');
      return;
    }

    const nextFieldErrors = collectFieldErrors();
    setFieldErrors(nextFieldErrors);
    const firstInvalid = SELLER_FIELD_ORDER.find((field) => nextFieldErrors[field]);
    if (firstInvalid) {
      window.requestAnimationFrame(() => scrollToFormField(`seller-field-${firstInvalid}`));
      return;
    }

    setPending(true);
    const creating = !hasSellerProfile(profile);
    try {
      const businessCertificateUrl = certificateFile
        ? await uploadBusinessCertificate(user.uid, certificateFile)
        : certificateUrl;
      await save({
        sellerId: user.uid,
        sellerName: sellerName.trim(),
        representativeName: representativeName.trim(),
        sellerMobile: formatPhoneNumber(sellerMobile),
        sellerPhone: formatPhoneNumber(sellerPhone),
        sellerEmail: user.email ?? '',
        businessAddress: businessAddress.trim(),
        businessNumber: formatBusinessNumber(verifiedNumber),
        businessVerified: true,
        businessVerifiedAt: verifiedAt || new Date().toISOString().slice(0, 10),
        businessCertificateUrl,
        depositBank: depositBank.trim(),
        depositAccount: depositAccount.trim(),
        depositHolder: depositHolder.trim(),
      });
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
          {done === 'created' ? `${SELLER_DETAIL_LABEL}이 완료되었습니다.` : `${SELLER_DETAIL_LABEL} 수정이 완료되었습니다.`}
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
      <div className="space-y-1.5">
        <span className="block text-sm font-semibold text-ink">사업자등록번호</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="seller-field-businessNumber"
            inputMode="numeric"
            autoComplete="off"
            value={businessNumber}
            onChange={(event) => {
              const next = formatBusinessNumber(event.target.value);
              setBusinessNumber(next);
              if (digitsOnly(next) !== digitsOnly(verifiedNumber)) {
                setVerifiedNumber('');
                setVerifiedAt('');
                setStatusLabel('');
              }
              setLookupError(null);
              clearFieldError('businessNumber');
            }}
            className={cn(fieldInputClass(Boolean(fieldErrors.businessNumber)), 'sm:flex-1')}
            placeholder="000-00-00000"
          />
          <button type="button" onClick={() => void handleLookup()} disabled={lookingUp} className="btn-secondary sm:shrink-0">
            {lookingUp ? '검증 중…' : '검증하기'}
          </button>
        </div>
        {verified ? (
          <p className="text-sm text-ink">조회 결과: {statusLabel || '계속사업자'} (조회 시점 기준)</p>
        ) : lookupError || fieldErrors.businessNumber ? (
          <FieldError message={lookupError ?? fieldErrors.businessNumber} />
        ) : (
          <p className="text-sm text-muted">계속사업자로 조회된 경우에만 {SELLER_DETAIL_LABEL}을 할 수 있습니다.</p>
        )}
        <p className="text-xs text-subtle">출처: 국세청, 공공데이터포털</p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">상호</span>
        <input
          id="seller-field-sellerName"
          value={sellerName}
          onChange={(event) => {
            setSellerName(event.target.value);
            clearFieldError('sellerName');
          }}
          className={fieldInputClass(Boolean(fieldErrors.sellerName))}
        />
        <FieldError message={fieldErrors.sellerName} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">대표자</span>
        <input
          id="seller-field-representativeName"
          value={representativeName}
          onChange={(event) => {
            setRepresentativeName(event.target.value);
            clearFieldError('representativeName');
          }}
          className={fieldInputClass(Boolean(fieldErrors.representativeName))}
        />
        <FieldError message={fieldErrors.representativeName} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">사업장 주소</span>
        <input
          id="seller-field-businessAddress"
          value={businessAddress}
          onChange={(event) => {
            setBusinessAddress(event.target.value);
            clearFieldError('businessAddress');
          }}
          className={fieldInputClass(Boolean(fieldErrors.businessAddress))}
          placeholder="사업장 소재지를 입력해 주세요"
        />
        <FieldError message={fieldErrors.businessAddress} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">핸드폰 번호</span>
        <input
          id="seller-field-sellerMobile"
          type="tel"
          autoComplete="tel"
          value={sellerMobile}
          onChange={(event) => {
            setSellerMobile(formatPhoneNumber(event.target.value));
            clearFieldError('sellerMobile');
          }}
          className={fieldInputClass(Boolean(fieldErrors.sellerMobile))}
          inputMode="numeric"
        />
        <span className="block text-xs text-subtle">{PHONE_HYPHEN_HINT}</span>
        <FieldError message={fieldErrors.sellerMobile} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">사업장 전화</span>
        <input
          id="seller-field-sellerPhone"
          type="tel"
          value={sellerPhone}
          onChange={(event) => {
            setSellerPhone(formatPhoneNumber(event.target.value));
            clearFieldError('sellerPhone');
          }}
          className={fieldInputClass(Boolean(fieldErrors.sellerPhone))}
          inputMode="numeric"
        />
        <span className="block text-xs text-subtle">{PHONE_HYPHEN_HINT}</span>
        <FieldError message={fieldErrors.sellerPhone} />
      </label>

      <section className="space-y-4 border-t border-line pt-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-ink">입금 계좌</h3>
          <p className="text-sm text-muted">판매 확정 후 구매자에게 보여 줍니다.</p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">은행</span>
          <input
            id="seller-field-depositBank"
            value={depositBank}
            onChange={(event) => {
              setDepositBank(event.target.value);
              clearFieldError('depositBank');
            }}
            className={fieldInputClass(Boolean(fieldErrors.depositBank))}
            placeholder="예: 국민은행"
          />
          <FieldError message={fieldErrors.depositBank} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">계좌번호</span>
          <input
            id="seller-field-depositAccount"
            value={depositAccount}
            onChange={(event) => {
              setDepositAccount(event.target.value);
              clearFieldError('depositAccount');
            }}
            className={fieldInputClass(Boolean(fieldErrors.depositAccount))}
            inputMode="numeric"
            placeholder="숫자만 입력"
          />
          <FieldError message={fieldErrors.depositAccount} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">예금주</span>
          <input
            id="seller-field-depositHolder"
            value={depositHolder}
            onChange={(event) => {
              setDepositHolder(event.target.value);
              clearFieldError('depositHolder');
            }}
            className={fieldInputClass(Boolean(fieldErrors.depositHolder))}
          />
          <FieldError message={fieldErrors.depositHolder} />
        </label>
      </section>

      <section className="space-y-3 border-t border-line pt-4">
        <h3 className="text-sm font-bold text-ink">사업자등록증</h3>
        <div className="space-y-1.5">
        <label
          id="seller-field-certificate"
          tabIndex={-1}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center border border-dashed bg-slate-50 px-4 py-3 outline-none',
            fieldErrors.certificate ? 'border-red-300' : 'border-line',
          )}
        >
          {certificatePreview && !certificatePreview.toLowerCase().includes('.pdf') && !certificateFile?.type.includes('pdf') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={certificatePreview} alt="사업자등록증" className="max-h-28 w-full object-contain" />
          ) : certificateFile || certificateUrl ? (
            <span className="text-center text-sm text-ink">
              {certificateFile ? certificateFile.name : '사업자등록증이 첨부되어 있습니다. 클릭하면 바꿀 수 있습니다.'}
            </span>
          ) : (
            <span className="text-center text-sm text-subtle">클릭해서 사업자등록증 사진 또는 PDF를 첨부하세요</span>
          )}
          <input
            type="file"
            accept="image/*,.pdf,application/pdf"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;
              if (file.size > CERT_MAX_BYTES) {
                setError('사업자등록증은 8MB 이하만 첨부할 수 있습니다.');
                return;
              }
              setError(null);
              setCertificateFile(file);
              setCertificatePreview(file.type.includes('pdf') ? '' : URL.createObjectURL(file));
              clearFieldError('certificate');
            }}
          />
        </label>
        <FieldError message={fieldErrors.certificate} />
        </div>
      </section>

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
