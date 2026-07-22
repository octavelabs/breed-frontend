import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Build Up' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
