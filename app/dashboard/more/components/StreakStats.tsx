'use client';

import FlameIcon from '@/app/assets/icons/flame';
import { ActivityType, CalendarDay, StreakStatsResult, userService } from '@/lib/api-services';
import { Book1, Cup, Flash, Heart, MessageText, People, Teacher, Timer1, TrendUp, Weight } from 'iconsax-react';
import { useEffect, useState } from 'react';

// ── Activity metadata ──────────────────────────────────────────────────────

const ACTIVITY_META: Record<
  string,
  { label: string; icon: React.ReactNode; colour: string; bg: string; border: string }
> = {
  DEVOTIONAL_READ: {
    label: 'Devotionals',
    icon: <Book1 size={18} color="#B54708" />,
    colour: '#B54708',
    bg: '#FFF6E5',
    border: '#F9DBAF',
  },
  PRAYER_PRAYED: {
    label: 'Bonds',
    icon: <Heart size={18} color="#067647" />,
    colour: '#067647',
    bg: '#ECFDF3',
    border: '#ABEFC6',
  },
  LESSON_COMPLETED: {
    label: 'Learning',
    icon: <Teacher size={18} color="#175CD3" />,
    colour: '#175CD3',
    bg: '#EFF8FF',
    border: '#B2DDFF',
  },
  COMMUNITY_ENGAGED: {
    label: 'Community',
    icon: <MessageText size={18} color="#6941C6" />,
    colour: '#6941C6',
    bg: '#F4F3FF',
    border: '#D9D6FE',
  },
  MENTORSHIP_TASK_COMPLETED: {
    label: 'Tasks',
    icon: <Weight size={18} color="#870BD6" />,
    colour: '#870BD6',
    bg: '#F5EBFF',
    border: '#E7C8FF',
  },
  MENTORSHIP_SESSION_ATTENDED: {
    label: 'Sessions',
    icon: <People size={18} color="#C11574" />,
    colour: '#C11574',
    bg: '#FDF2FA',
    border: '#FCCEEE',
  },
  EDIFY: {
    label: 'Edify',
    icon: <Timer1 size={18} color="#5B26B1" />,
    colour: '#5B26B1',
    bg: '#F5EBFF',
    border: '#C084FC',
  },
};

const TRACKED: ActivityType[] = [
  'EDIFY',
  'PRAYER_PRAYED',
  'DEVOTIONAL_READ',
  'LESSON_COMPLETED',
];

// ── Calendar heat intensity ────────────────────────────────────────────────

function heatColour(count: number): string {
  if (count === 0) return '#F0F2F4';
  if (count === 1) return '#E7C8FF';
  if (count === 2) return '#C084FC';
  if (count <= 4) return '#9333EA';
  return '#5B21B6';
}

// ── Skeleton ───────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="animate-pulse lg:grid lg:grid-cols-[1fr_380px] lg:items-stretch gap-6">
    <div className="space-y-4">
      <div className="h-40 bg-gray-100 dark:bg-[#252830] rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-[#252830] rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-28 bg-gray-100 dark:bg-[#252830] rounded-2xl" />
        ))}
      </div>
    </div>
    <div className="hidden lg:block min-h-[420px] bg-gray-100 dark:bg-[#252830] rounded-2xl" />
  </div>
);

// ── Calendar component ─────────────────────────────────────────────────────

function ActivityCalendar({ calendar }: { calendar: CalendarDay[] }) {
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }

  const today = new Date().toISOString().split('T')[0];
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const weekLabels = weeks.map((week) => {
    const d = new Date(week[0].date);
    return `${MONTH_LABELS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Week columns */}
      <div className="flex gap-2 flex-1 min-h-0">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-2 flex-1 min-w-0">
            <span className="text-[10px] font-medium text-[#B9C2CA] dark:text-[#717784] leading-none truncate shrink-0">
              {weekLabels[wi]}
            </span>
            {week.map((day) => {
              const isToday = day.date === today;
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} activit${day.count === 1 ? 'y' : 'ies'}`}
                  className={`flex-1 min-h-7 rounded-lg transition-colors ${isToday ? 'ring-2 ring-[#870BD6] ring-offset-1 dark:ring-offset-[#181A1F]' : ''} ${day.count === 0 ? 'bg-[#F0F2F4] dark:bg-[#252830]' : ''}`}
                  style={day.count > 0 ? { backgroundColor: heatColour(day.count) } : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="shrink-0 flex items-center justify-between mt-4 pt-4 border-t border-[#F0F2F4] dark:border-[#2D313A]">
        <span className="text-xs text-[#60666B] dark:text-[#9CA3AF]">Activity intensity</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#60666B] dark:text-[#9CA3AF]">Less</span>
          {[0, 1, 2, 3, 5].map((n) => (
            <div
              key={n}
              className={`w-4 h-4 rounded-sm ${n === 0 ? 'bg-[#F0F2F4] dark:bg-[#252830]' : ''}`}
              style={n > 0 ? { backgroundColor: heatColour(n) } : undefined}
            />
          ))}
          <span className="text-xs text-[#60666B] dark:text-[#9CA3AF]">More</span>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function StreakStats({ showDivider = true }: { showDivider?: boolean }) {
  const [stats, setStats] = useState<StreakStatsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getStreakStats()
      .then((res: any) => setStats((res?.data ?? res) as StreakStatsResult))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  if (!stats) {
    return (
      <div className={showDivider ? 'mt-10 pt-8 border-t border-[#F0F2F4] dark:border-[#2D313A]' : ''}>
        <div className="rounded-2xl border border-[#F0F2F4] dark:border-[#2D313A] bg-white dark:bg-[#181A1F] p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center mx-auto mb-4">
            <FlameIcon size={32} />
          </div>
          <p className="text-base font-semibold text-[#180426] dark:text-white">No activity data yet</p>
          <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] mt-2 max-w-xs mx-auto">
            Start reading devotionals, completing lessons, or praying for bulletins to build your streak.
          </p>
        </div>
      </div>
    );
  }

  const { overall, breakdown, calendar, totalActiveDays, mostActiveType } = stats;
  const mostActiveMeta = mostActiveType ? ACTIVITY_META[mostActiveType] : null;

  const now = new Date();
  const thirtyAgo = new Date(now);
  thirtyAgo.setUTCDate(now.getUTCDate() - 29);
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dateRange = `${MONTH_LABELS[thirtyAgo.getUTCMonth()]} ${thirtyAgo.getUTCDate()} – ${MONTH_LABELS[now.getUTCMonth()]} ${now.getUTCDate()}`;

  return (
    <div className={`${showDivider ? 'mt-10 pt-8 border-t border-[#F0F2F4] dark:border-[#2D313A]' : ''} lg:grid lg:grid-cols-[1fr_380px] lg:items-stretch gap-6`}>

      {/* ── Left column ── */}
      <div className="flex flex-col gap-4">

        {/* Overall streak hero */}
        <div className="rounded-2xl bg-[#180426] p-6 flex items-center justify-between relative overflow-hidden">
          {/* decorative glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#870BD6] opacity-20 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[#8B8FA3] text-sm font-medium mb-2">Overall Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold text-white leading-none">{overall.current}</span>
              <span className="text-xl text-[#8B8FA3] font-medium">days</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <Cup size={13} color="#C084FC" />
              <p className="text-sm text-[#8B8FA3]">
                Best: <span className="font-bold text-[#C084FC]">{overall.longest} days</span>
              </p>
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2 bg-white/10 rounded-2xl px-6 py-4 border border-white/10">
            <FlameIcon size={40} />
            <span className="text-xs font-semibold text-white">
              {overall.current > 0 ? 'On fire 🔥' : 'Start today'}
            </span>
          </div>
        </div>

        {/* Summary stat tiles */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#F0F2F4] dark:border-[#2D313A] bg-white dark:bg-[#181A1F] px-4 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center shrink-0">
              <Flash size={18} color="#870BD6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#180426] dark:text-white leading-none">{totalActiveDays}</p>
              <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] mt-0.5">active days this month</p>
            </div>
          </div>

          {mostActiveMeta ? (
            <div className="rounded-2xl border border-[#F0F2F4] dark:border-[#2D313A] bg-white dark:bg-[#181A1F] px-4 py-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-[#F3F4F6] dark:bg-[#252830] flex items-center justify-center shrink-0"
                style={{ color: mostActiveMeta.colour }}
              >
                {mostActiveMeta.icon}
              </div>
              <div>
                <p className="text-xs font-semibold dark:!text-[#9CA3AF]" style={{ color: mostActiveMeta.colour }}>
                  Most Active
                </p>
                <p className="text-sm font-bold text-[#180426] dark:text-white mt-0.5">{mostActiveMeta.label}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#F0F2F4] dark:border-[#2D313A] bg-white dark:bg-[#181A1F] px-4 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0F2F4] dark:bg-[#252830] flex items-center justify-center shrink-0">
                <TrendUp size={18} color="#60666B" />
              </div>
              <div>
                <p className="text-xs text-[#60666B] dark:text-[#9CA3AF]">Most Active</p>
                <p className="text-sm font-bold text-[#180426] dark:text-white mt-0.5">None yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Per-activity streak grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {TRACKED.map((type) => {
            const stat = breakdown[type];
            const meta = ACTIVITY_META[type];
            const current = stat?.current ?? 0;
            const longest = stat?.longest ?? 0;
            return (
              <div
                key={type}
                className="rounded-2xl p-4 border border-[#F0F2F4] dark:border-[#2D313A] bg-white dark:bg-[#181A1F]"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#F3F4F6] dark:bg-[#252830]"
                  style={{ color: meta.colour }}
                >
                  {meta.icon}
                </div>
                <p className="text-xs font-semibold mb-1.5 dark:!text-white" style={{ color: meta.colour }}>
                  {meta.label}
                </p>
                <p className="text-3xl font-bold text-[#180426] dark:text-white leading-none">
                  {current}
                  <span className="text-sm font-normal text-[#60666B] dark:text-[#9CA3AF] ml-1">days</span>
                </p>
                <p className="text-[11px] text-[#60666B] dark:text-[#9CA3AF] mt-1.5">
                  Best: <span className="font-bold">{longest}d</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right column: Calendar ── */}
      <div className="rounded-2xl border border-[#F0F2F4] dark:border-[#2D313A] bg-white dark:bg-[#181A1F] p-6 flex flex-col mt-4 lg:mt-0 min-h-[420px]">
        {/* Header */}
        <div className="shrink-0 flex items-start justify-between mb-5">
          <div>
            <p className="text-base font-bold text-[#180426] dark:text-white">Last 30 Days</p>
            <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] mt-0.5">{dateRange}</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F5EBFF] dark:bg-[#2D1B4E] text-[#870BD6]">
            {totalActiveDays} / 30 active
          </span>
        </div>
        <ActivityCalendar calendar={calendar} />
      </div>
    </div>
  );
}
