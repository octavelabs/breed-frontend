'use client';

import DashboardLayout from '@/app/layout/DashboardLayout';
import StreakStats from '../more/components/StreakStats';

export default function StreaksPage() {
  return (
    <DashboardLayout custom={true}>
      <div className="flex items-end pb-6 px-4 lg:px-12 mt-6 lg:mt-16 border-b border-[#D2D9DF] dark:border-[#2D313A]">
        <div>
          <h1 className="text-[24px] lg:text-[32px] leading-none font-bold text-[#180426] dark:text-white">My Streaks</h1>
          <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] mt-1.5">Track your daily consistency across all activities</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121316] min-h-screen px-4 lg:px-12 py-8">
        <StreakStats showDivider={false} />
      </div>
    </DashboardLayout>
  );
}
