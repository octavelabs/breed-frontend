'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import AccountabilityTab from './components/AccountabilityTab';
import DevotionalsTab from './components/DevotionalsTab';
import PrayerBullletinsTab from './components/PrayerBullletinsTab';

const TABS = [
  { id: 'accountability', label: 'Accountability' },
  { id: 'devotionals', label: 'Devotionals' },
  { id: 'bulletins', label: 'Prayer Bulletins' },
];

function BuildupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get('tab') ?? 'accountability';

  const setTab = (tab: string) => {
    router.push(`/dashboard/buildup?tab=${tab}`);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto">
        <h1 className="text-[24px] lg:text-[32px] leading-none font-bold mb-6">Build Up</h1>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-8 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#870BD6] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'accountability' && <AccountabilityTab />}
        {activeTab === 'devotionals' && <DevotionalsTab />}
        {activeTab === 'bulletins' && <PrayerBullletinsTab />}
      </div>
    </DashboardLayout>
  );
}

export default function BuildupPage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="animate-pulse h-8 bg-gray-100 rounded w-48 mb-6" /></DashboardLayout>}>
      <BuildupContent />
    </Suspense>
  );
}
