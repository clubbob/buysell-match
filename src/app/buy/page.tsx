import type { Metadata } from 'next';
import Link from 'next/link';
import BoardPanel from '@/components/ui/BoardPanel';
import PageIntro from '@/components/ui/PageIntro';

export const metadata: Metadata = {
  title: '삽니다',
};

export default function BuyPage() {
  return (
    <div className="space-y-5">
      <PageIntro title="삽니다" description="구매자가 찾는 상품입니다.">
        <Link href="/buy/new" className="btn-primary">
          삽니다 등록
        </Link>
      </PageIntro>
      <BoardPanel
        title="전체"
        description="올라온 구매 글"
        columns={['상품', '가격', '수량', '마감']}
        empty="아직 올라온 글이 없습니다."
      />
    </div>
  );
}
