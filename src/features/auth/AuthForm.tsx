'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import {
  getAuthErrorMessage,
  inputClassName,
  isAsciiPassword,
  isValidEmail,
  isValidPersonName,
  normalizePersonName,
} from '@/features/auth/auth-errors';
import { MarketingBody, PrivacyBody, TermsBody } from '@/components/legal/legal-bodies';
import { useUserMode } from '@/features/mode/mode-context';
import { safeNextPath } from '@/lib/auth-redirect';

type AuthFormMode = 'login' | 'signup';
type ConsentDoc = 'terms' | 'privacy' | 'marketing';

const REMEMBER_EMAIL_KEY = 'buysell.rememberEmail';

function loadRememberedEmail() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(REMEMBER_EMAIL_KEY)?.trim() ?? '';
}

function ConsentRow({
  required,
  label,
  checked,
  open,
  onChange,
  onToggle,
  children,
}: {
  required?: boolean;
  label: string;
  checked: boolean;
  open: boolean;
  onChange: (next: boolean) => void;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="flex min-w-0 items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            className="h-4 w-4 accent-ink"
          />
          <span>
            <span className="font-semibold">{required ? '[필수]' : '[선택]'}</span> {label}
          </span>
        </label>
        <button type="button" className="btn-chip shrink-0" onClick={onToggle}>
          {open ? '닫기' : '내용'}
        </button>
      </div>
      {open ? (
        <div className="max-h-72 overflow-y-auto border border-line bg-white px-3 py-3 text-xs leading-relaxed text-muted">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default function AuthForm({ mode }: { mode: AuthFormMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, configured, signInWithEmail, signUpWithEmail } = useAuth();
  const { resetMode } = useUserMode();
  const isSignup = mode === 'signup';
  const nextPath = safeNextPath(searchParams.get('next'));
  const authQuery = searchParams.toString();
  const otherAuthHref = isSignup ? `/login${authQuery ? `?${authQuery}` : ''}` : '/signup';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [openDoc, setOpenDoc] = useState<ConsentDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const agreeAll = agreeTerms && agreePrivacy && agreeMarketing;

  function finishAuth() {
    resetMode();
    router.replace(isSignup ? '/' : (nextPath ?? '/'));
  }

  useEffect(() => {
    if (!loading && user) finishAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when session becomes ready
  }, [loading, user]);

  useEffect(() => {
    if (isSignup) return;
    const saved = loadRememberedEmail();
    if (!saved) return;
    setEmail(saved);
    setRememberEmail(true);
  }, [isSignup]);

  if (loading || user) {
    return <p className="py-10 text-center text-sm text-muted">불러오는 중…</p>;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!configured) {
      setError('Firebase가 아직 연결되지 않았습니다.');
      return;
    }
    const displayName = normalizePersonName(name);
    if (isSignup && !isValidPersonName(displayName)) {
      setError('이름은 한글 또는 영문 2~20자로 입력해 주세요.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('올바른 이메일 주소를 입력해 주세요.');
      return;
    }
    if (!isAsciiPassword(password)) {
      setError('비밀번호는 영문, 숫자, 기호만 사용할 수 있습니다.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (isSignup && password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (isSignup && (!agreeTerms || !agreePrivacy)) {
      setError('이용약관과 개인정보처리방침에 동의해 주세요.');
      return;
    }

    setPending(true);
    try {
      if (isSignup) {
        await signUpWithEmail(displayName, email, password, { marketingAgreed: agreeMarketing });
      } else {
        await signInWithEmail(email, password);
        if (rememberEmail) {
          window.localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
        } else {
          window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      }
      finishAuth();
    } catch (err) {
      setError(getAuthErrorMessage(err, isSignup ? '회원가입에 실패했습니다.' : '로그인에 실패했습니다.'));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel mx-auto w-full max-w-md px-4 py-6 sm:px-8 sm:py-8">
      <div className="border-b border-line pb-5">
        <h1 className="text-xl font-bold tracking-tight text-ink">{isSignup ? '회원가입' : '로그인'}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {isSignup
            ? '이름, 이메일, 비밀번호와 필수 약관 동의를 등록합니다. 서비스 이용 역할은 로그인 후에 고릅니다.'
            : '가입한 이메일과 비밀번호로 로그인합니다.'}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {isSignup ? (
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">이름</span>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
              required
            />
          </label>
        ) : null}
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">이메일</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClassName}
            required
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">비밀번호</span>
          <input
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            required
          />
          <span className="block text-xs text-subtle">6자 이상 (영문, 숫자, 기호 무관)</span>
        </label>

        {!isSignup ? (
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={rememberEmail}
              onChange={(event) => {
                const next = event.target.checked;
                setRememberEmail(next);
                if (!next) window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
              }}
              className="h-4 w-4 accent-ink"
            />
            이메일 저장
          </label>
        ) : null}

        {isSignup ? (
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold text-ink">비밀번호 확인</span>
            <input
              type="password"
              autoComplete="new-password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              className={inputClassName}
              required
            />
          </label>
        ) : null}

        {isSignup ? (
          <fieldset className="space-y-3 border-t border-line pt-4">
            <legend className="text-sm font-semibold text-ink">약관 동의</legend>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={agreeAll}
                onChange={(event) => {
                  const next = event.target.checked;
                  setAgreeTerms(next);
                  setAgreePrivacy(next);
                  setAgreeMarketing(next);
                }}
                className="h-4 w-4 accent-ink"
              />
              전체 동의
            </label>
            <ConsentRow
              required
              label="이용약관"
              checked={agreeTerms}
              open={openDoc === 'terms'}
              onChange={setAgreeTerms}
              onToggle={() => setOpenDoc((current) => (current === 'terms' ? null : 'terms'))}
            >
              <TermsBody />
            </ConsentRow>
            <ConsentRow
              required
              label="개인정보처리방침"
              checked={agreePrivacy}
              open={openDoc === 'privacy'}
              onChange={setAgreePrivacy}
              onToggle={() => setOpenDoc((current) => (current === 'privacy' ? null : 'privacy'))}
            >
              <PrivacyBody />
            </ConsentRow>
            <ConsentRow
              label="마케팅 수신 동의"
              checked={agreeMarketing}
              open={openDoc === 'marketing'}
              onChange={setAgreeMarketing}
              onToggle={() => setOpenDoc((current) => (current === 'marketing' ? null : 'marketing'))}
            >
              <MarketingBody />
            </ConsentRow>
          </fieldset>
        ) : null}

        {error ? (
          <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? '처리 중…' : isSignup ? '가입하기' : '로그인'}
        </button>
      </div>

      <p className="mt-5 text-center text-sm text-muted">
        {isSignup ? (
          <>
            이미 계정이 있으면{' '}
            <Link href={otherAuthHref} className="font-semibold text-ink underline-offset-2 hover:underline">
              로그인
            </Link>
          </>
        ) : (
          <>
            계정이 없으면{' '}
            <Link href={otherAuthHref} className="font-semibold text-ink underline-offset-2 hover:underline">
              회원가입
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
