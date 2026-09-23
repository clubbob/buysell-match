'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { inputClassName, isValidEmail } from '@/features/auth/auth-errors';
import { useUserMode } from '@/features/mode/mode-context';
import { useSellerProfile } from '@/features/seller/use-seller-profile';
import { digitsOnly, formatBusinessNumber } from '@/lib/business-number';
import { uploadBusinessCertificate } from '@/lib/seller-remote';
import { hasSellerProfile, isSellerProfileComplete } from '@/types/seller';

const CERT_MAX_BYTES = 8 * 1024 * 1024;

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
  const { mode, ready: modeReady, setMode } = useUserMode();
  const { profile, ready: profileReady, save } = useSellerProfile(user?.uid);
  const [sellerName, setSellerName] = useState('');
  const [representativeName, setRepresentativeName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [verifiedNumber, setVerifiedNumber] = useState('');
  const [verifiedAt, setVerifiedAt] = useState('');
  const [statusLabel, setStatusLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificatePreview, setCertificatePreview] = useState('');
  const [filled, setFilled] = useState(false);
  const [done, setDone] = useState<'created' | 'updated' | null>(null);

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
    if (!user) {
      setError('로그인 후 등록할 수 있습니다.');
      return;
    }
    if (!verified) {
      setLookupError('사업자등록번호를 검증해 주세요. 계속사업자만 등록할 수 있습니다.');
      return;
    }
    if (!sellerName.trim() || !representativeName.trim() || !sellerPhone.trim() || !businessAddress.trim()) {
      setError('상호, 대표자, 전화, 사업장 주소를 입력해 주세요.');
      return;
    }
    if (!isValidEmail(sellerEmail)) {
      setError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (!certificateFile && !certificateUrl) {
      setError('사업자등록증을 첨부해 주세요.');
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
        sellerPhone: sellerPhone.trim(),
        sellerEmail: sellerEmail.trim(),
        businessAddress: businessAddress.trim(),
        businessNumber: formatBusinessNumber(verifiedNumber),
        businessVerified: true,
        businessVerifiedAt: verifiedAt || new Date().toISOString().slice(0, 10),
        businessCertificateUrl,
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
          {done === 'created' ? '판매자 정보 등록이 완료되었습니다.' : '판매자 정보 수정이 완료되었습니다.'}
        </p>
        <div className="action-row mt-0">
          <Link href="/sell/new" className="btn-primary">
            팝니다 등록
          </Link>
          <Link href="/mypage" className="btn-secondary">
            마이페이지
          </Link>
        </div>
      </div>
    );
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
                setVerifiedAt('');
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
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">사업장 주소</span>
        <input
          value={businessAddress}
          onChange={(event) => setBusinessAddress(event.target.value)}
          className={inputClassName}
          placeholder="사업장 소재지를 입력해 주세요"
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

      <div className="space-y-1.5">
        <span className="block text-sm font-semibold text-ink">사업자등록증</span>
        <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center border border-dashed border-line bg-slate-50">
          {certificatePreview && !certificatePreview.toLowerCase().includes('.pdf') && !certificateFile?.type.includes('pdf') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={certificatePreview} alt="사업자등록증" className="h-40 w-full object-contain" />
          ) : certificateFile || certificateUrl ? (
            <span className="px-4 py-8 text-center text-sm text-ink">
              {certificateFile ? certificateFile.name : '사업자등록증이 첨부되어 있습니다. 클릭하면 바꿀 수 있습니다.'}
            </span>
          ) : (
            <span className="px-4 py-8 text-center text-sm text-subtle">클릭해서 사업자등록증 사진 또는 PDF를 첨부하세요</span>
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
            }}
          />
        </label>
      </div>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary" disabled={pending || !verified}>
        {pending ? '저장 중…' : hasSellerProfile(profile) ? '수정하기' : '등록하기'}
      </button>
    </form>
  );
}
