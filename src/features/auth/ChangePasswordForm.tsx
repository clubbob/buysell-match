'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { getAuthErrorMessage, inputClassName, isAsciiPassword } from '@/features/auth/auth-errors';

export default function ChangePasswordForm() {
  const router = useRouter();
  const { user, loading, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');
  const [nextPasswordConfirm, setNextPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login?next=/mypage/password');
  }, [loading, user, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isAsciiPassword(nextPassword)) {
      setError('비밀번호는 영문, 숫자, 기호만 사용할 수 있습니다.');
      return;
    }
    if (nextPassword.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (nextPassword !== nextPasswordConfirm) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (currentPassword === nextPassword) {
      setError('지금 쓰는 비밀번호와 다른 비밀번호를 입력해 주세요.');
      return;
    }

    setPending(true);
    try {
      await changePassword(currentPassword, nextPassword);
      setDone(true);
    } catch (submitError) {
      setError(getAuthErrorMessage(submitError, '비밀번호 변경에 실패했습니다.'));
    } finally {
      setPending(false);
    }
  }

  if (loading || !user) {
    return <p className="text-sm text-muted">불러오는 중…</p>;
  }

  if (done) {
    return (
      <div className="mt-6 space-y-4">
        <p className="text-sm text-ink">비밀번호가 변경되었습니다.</p>
        <div className="action-row mt-0">
          <Link href="/mypage" className="btn-primary">
            마이페이지
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">현재 비밀번호</span>
        <input
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          className={inputClassName}
          required
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">새 비밀번호</span>
        <input
          type="password"
          autoComplete="new-password"
          value={nextPassword}
          onChange={(event) => setNextPassword(event.target.value)}
          className={inputClassName}
          required
        />
        <span className="block text-xs text-subtle">6자 이상 (영문, 숫자, 기호 무관)</span>
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-ink">새 비밀번호 확인</span>
        <input
          type="password"
          autoComplete="new-password"
          value={nextPasswordConfirm}
          onChange={(event) => setNextPasswordConfirm(event.target.value)}
          className={inputClassName}
          required
        />
      </label>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary" disabled={pending}>
        {pending ? '변경 중…' : '비밀번호 변경'}
      </button>
    </form>
  );
}
