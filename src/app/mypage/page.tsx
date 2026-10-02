import { Suspense } from 'react';
import MyPageClient from '@/features/mypage/MyPageClient';

export default function MyPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">불러오는 중…</p>}>
      <MyPageClient />
    </Suspense>
  );
}
