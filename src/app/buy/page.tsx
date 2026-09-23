import type { Metadata } from 'next';
import BoardPanel from '@/components/ui/BoardPanel';
import PageIntro from '@/components/ui/PageIntro';
import BuyCreateLink from '@/features/buy/BuyCreateLink';

export const metadata: Metadata = {
  title: '삽니다',
};

export default function BuyPage() {
  return (
    <div className="space-y-5">
      <PageIntro title="삽니다" description="구매자가 찾는 상품입니다.">
        <BuyCreateLink />
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
