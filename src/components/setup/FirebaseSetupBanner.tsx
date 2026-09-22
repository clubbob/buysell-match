import { hasFirebaseClientConfig } from '@/lib/firebase-config';

export default function FirebaseSetupBanner() {
  if (hasFirebaseClientConfig()) return null;

  return (
    <div className="mb-8 border-l-4 border-ink bg-white px-4 py-3 text-sm text-muted">
      Firebase가 아직 연결되지 않았습니다. 전용 프로젝트를 만든 뒤{' '}
      <code className="rounded-sm bg-slate-100 px-1 py-0.5 text-xs text-ink">.env.local</code>에 값을 넣으면
      가입·로그인이 켜집니다.
    </div>
  );
}
