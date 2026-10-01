import type { Metadata } from 'next';
import ContactClient from '@/features/contact/ContactClient';
import ContactGuard from '@/features/contact/ContactGuard';

export const metadata: Metadata = {
  title: '문의하기',
};

export default function ContactPage() {
  return (
    <ContactGuard>
      <ContactClient />
    </ContactGuard>
  );
}
