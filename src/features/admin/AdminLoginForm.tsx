'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { inputClassName } from '@/features/auth/auth-errors';

export default function AdminLoginForm() {
  const router = useRouter();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setError(data.message ?? '로그인에 실패했습니다.');
        return;
      }
      router.replace('/admin/dashboard');
      router.refresh();
    } catch {
      setError('로그인에 실패했습니다.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel mx-auto w-full max-w-md px-4 py-6 sm:px-8 sm:py-8">
      <div className="border-b border-line pb-5">
        <h1 className="text-xl font-bold tracking-tight text-ink">관리자 로그인</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">관리자 아이디와 비밀번호로 들어갑니다.</p>
      </div>

      <div className="mt-6 space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">아이디</span>
          <input
            type="text"
            autoComplete="username"
            value={id}
            onChange={(event) => setId(event.target.value)}
            className={inputClassName}
            required
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-ink">비밀번호</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClassName}
            required
          />
        </label>
        {error ? (
          <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? '처리 중…' : '로그인'}
        </button>
      </div>
    </form>
  );
}
