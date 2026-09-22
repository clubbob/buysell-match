import Link from 'next/link';

export default function PageBack({
  href,
  children = '← 이전 목록',
}: {
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-back">
      <Link href={href} className="btn-secondary">
        {children}
      </Link>
    </div>
  );
}
