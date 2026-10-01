import type { Metadata } from 'next';
import BuyIndexClient from '@/features/buy/BuyIndexClient';

export const metadata: Metadata = {
  title: '삽니다',
};

export default function BuyPage() {
  return <BuyIndexClient />;
}
