'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrayerBulletinDetailRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/buildup?tab=bulletins');
  }, [router]);
  return null;
}
