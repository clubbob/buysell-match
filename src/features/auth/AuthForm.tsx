'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { getAuthErrorMessage, inputClassName, isAsciiPassword, isValidEmail } from '@/features/auth/auth-errors';

type AuthFormMode = 'login' | 'signup';

const REMEMBER_EMAIL_KEY = 'buysell.rememberEmail';

function loadRememberedEmail() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(REMEMBER_EMAIL_KEY)?.trim() ?? '';
}

export default function AuthForm({ mode }: { mode: AuthFormMode }) {
  const router = useRouter();
  const { user, loading, configured, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isSignup = mode === 'signup';

  useEffect(() => {
    if (!loading && user) router.replace('/');
  }, [loading, user, router]);

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

    setPending(true);
    try {
      if (isSignup) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
        if (rememberEmail) {
          window.localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
        } else {
          window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
      }
      router.replace('/');
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
            ? '이메일과 비밀번호만 등록합니다. 서비스 이용 역할은 로그인 후에 고릅니다.'
            : '가입한 이메일과 비밀번호로 로그인합니다.'}
        </p>
      </div>

      <div className="mt-6 space-y-4">
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
            <Link href="/login" className="font-semibold text-ink underline-offset-2 hover:underline">
              로그인
            </Link>
          </>
        ) : (
          <>
            계정이 없으면{' '}
            <Link href="/signup" className="font-semibold text-ink underline-offset-2 hover:underline">
              회원가입
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
