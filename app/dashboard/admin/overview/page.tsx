'use client';

import { useEffect, useState } from 'react';
import {
  People, ProfileTick, ProfileAdd, Book1, BookSaved,
  ShieldSecurity, More,
} from 'iconsax-react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { adminService } from '@/lib/api-services';

// ── Types ──────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  totalCourses: number;
  publishedCourses: number;
  totalDevotionals: number;
  publishedDevotionals: number;
  totalCommunities: number;
  activeCommunities: number;
  pendingReports: number;
  openPrayerRequests: number;
  totalEnrollments: number;
  topCourses: { title: string; enrollmentCount: number }[];
}

interface DateCount { date: string; count: number; }
interface MonthCount { month: string; count: number; }

// ── Palette ───────────────────────────────────────────────────────────────────

type Palette = { bg: string; border: string; iconBg: string; accent: string };
const PURPLE: Palette = { bg: '#FBF6FF', border: '#E7C8FF', iconBg: '#E7C8FF', accent: '#870BD6' };
const GREEN:  Palette = { bg: '#ECFDF3', border: '#ABEFC6', iconBg: '#ABEFC6', accent: '#067647' };
const BLUE:   Palette = { bg: '#EFF8FF', border: '#B2DDFF', iconBg: '#B2DDFF', accent: '#175CD3' };
const AMBER:  Palette = { bg: '#FFFAEB', border: '#FEDF89', iconBg: '#FEDF89', accent: '#B54708' };
const RED:    Palette = { bg: '#FEF3F2', border: '#FECDCA', iconBg: '#FECDCA', accent: '#B42318' };
const TEAL:   Palette = { bg: '#F0FDF9', border: '#99F6E4', iconBg: '#99F6E4', accent: '#0F766E' };

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub, Icon, palette, loading,
}: {
  label: string; value: number | string; sub?: string;
  Icon: React.ElementType; palette: Palette; loading?: boolean;
}) => (
  <div className="rounded-2xl border p-5" style={{ backgroundColor: palette.bg, borderColor: palette.border }}>
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: palette.iconBg }}>
        <Icon size={20} color={palette.accent} />
      </div>
      <div>
        <p className="text-[13px] text-[#60666B]">{label}</p>
        {loading
          ? <div className="animate-pulse bg-gray-200 rounded h-6 w-10 mt-1" />
          : <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{value}</h3>
        }
        {sub && <p className="text-[12px] text-[#60666B] mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

// ── Line Chart ────────────────────────────────────────────────────────────────

const VW = 500; const VH = 160;
const PT = 12; const PR = 12; const PB = 32; const PL = 36;
const PW = VW - PL - PR;
const PH = VH - PT - PB;

function parseDate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const LineChart = ({ data, color, gradientId }: {
  data: DateCount[]; color: string; gradientId: string;
}) => {
  if (!data.length) return <div className="flex items-center justify-center h-full text-sm text-[#60666B]">No data</div>;

  const max = Math.max(...data.map(d => d.count), 1);
  const xOf = (i: number) => PL + (i / Math.max(data.length - 1, 1)) * PW;
  const yOf = (v: number) => PT + PH - (v / max) * PH;

  const linePoints = data.map((d, i) => `${xOf(i)},${yOf(d.count)}`).join(' ');
  const areaPoints = [
    `${xOf(0)},${PT + PH}`,
    ...data.map((d, i) => `${xOf(i)},${yOf(d.count)}`),
    `${xOf(data.length - 1)},${PT + PH}`,
  ].join(' ');

  const yTicks = [0, Math.round(max / 2), max];
  const xLabelIdx = [0, Math.floor((data.length - 1) / 2), data.length - 1];

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal grid */}
      {yTicks.map((v) => (
        <line key={v} x1={PL} y1={yOf(v)} x2={PL + PW} y2={yOf(v)}
          stroke="#E3E8EF" strokeWidth="1" />
      ))}

      {/* Area */}
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />

      {/* Line */}
      <polyline points={linePoints} fill="none" stroke={color}
        strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots — only on non-zero values */}
      {data.map((d, i) => d.count > 0 && (
        <circle key={i} cx={xOf(i)} cy={yOf(d.count)} r="3" fill={color} />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((v) => (
        <text key={v} x={PL - 6} y={yOf(v) + 4} textAnchor="end" fontSize="10" fill="#60666B">
          {v}
        </text>
      ))}

      {/* X-axis labels */}
      {xLabelIdx.map((i) => (
        <text key={i} x={xOf(i)} y={VH - 4} textAnchor="middle" fontSize="10" fill="#60666B">
          {parseDate(data[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </text>
      ))}
    </svg>
  );
};

// ── Bar Chart ─────────────────────────────────────────────────────────────────

const BVW = 500; const BVH = 220;
const BPT = 12; const BPR = 12; const BPB = 36; const BPL = 36;
const BPW = BVW - BPL - BPR;
const BPH = BVH - BPT - BPB;

const BarChart = ({ data, color }: { data: MonthCount[]; color: string }) => {
  if (!data.length) return <div className="flex items-center justify-center h-full text-sm text-[#60666B]">No data</div>;

  const max = Math.max(...data.map(d => d.count), 1);
  const barW = (BPW / data.length) * 0.6;
  const gap  = BPW / data.length;
  const xOf  = (i: number) => BPL + i * gap + (gap - barW) / 2;
  const hOf  = (v: number) => (v / max) * BPH;
  const yOf  = (v: number) => BPT + BPH - hOf(v);

  const yTicks = [0, Math.round(max / 2), max];

  function fmtMonth(m: string) {
    const [y, mo] = m.split('-');
    return new Date(Number(y), Number(mo) - 1, 1)
      .toLocaleDateString('en-US', { month: 'short' });
  }

  return (
    <svg viewBox={`0 0 ${BVW} ${BVH}`} className="w-full h-full" preserveAspectRatio="none">
      {/* Grid */}
      {yTicks.map((v) => (
        <line key={v} x1={BPL} y1={yOf(v)} x2={BPL + BPW} y2={yOf(v)}
          stroke="#E3E8EF" strokeWidth="1" />
      ))}

      {/* Bars */}
      {data.map((d, i) => (
        <g key={i}>
          <rect
            x={xOf(i)} y={yOf(d.count)}
            width={barW} height={Math.max(hOf(d.count), 2)}
            rx="4" fill={d.count > 0 ? color : '#E3E8EF'}
          />
          {/* Month label */}
          <text x={xOf(i) + barW / 2} y={BVH - 4} textAnchor="middle" fontSize="10" fill="#60666B">
            {fmtMonth(d.month)}
          </text>
        </g>
      ))}

      {/* Y-axis labels */}
      {yTicks.map((v) => (
        <text key={v} x={BPL - 6} y={yOf(v) + 4} textAnchor="end" fontSize="10" fill="#60666B">
          {v}
        </text>
      ))}
    </svg>
  );
};

// ── Chart skeleton ────────────────────────────────────────────────────────────

const ChartSkeleton = () => (
  <div className="animate-pulse space-y-2 h-full flex flex-col justify-end px-2 pb-2">
    <div className="flex items-end gap-1.5 h-32">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex-1 bg-gray-200 rounded-t"
          style={{ height: `${30 + Math.random() * 70}%` }} />
      ))}
    </div>
    <div className="h-3 bg-gray-200 rounded w-full" />
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminOverviewPage = () => {
  const [stats,       setStats]       = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [userGrowth,       setUserGrowth]       = useState<DateCount[]>([]);
  const [userGrowthLoading, setUserGrowthLoading] = useState(true);

  const [dau,       setDau]       = useState<DateCount[]>([]);
  const [dauLoading, setDauLoading] = useState(true);

  const [communityGrowth,       setCommunityGrowth]       = useState<MonthCount[]>([]);
  const [communityGrowthLoading, setCommunityGrowthLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then((d) => setStats(d as DashboardStats))
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    adminService.getUserGrowth(30)
      .then((d) => setUserGrowth(d as DateCount[]))
      .catch(() => {})
      .finally(() => setUserGrowthLoading(false));

    adminService.getActivityAnalytics(30)
      .then((d) => setDau(d as DateCount[]))
      .catch(() => {})
      .finally(() => setDauLoading(false));

    adminService.getContentAnalytics()
      .then((d: any) => setCommunityGrowth(d?.communityGrowthByMonth ?? []))
      .catch(() => {})
      .finally(() => setCommunityGrowthLoading(false));
  }, []);

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white min-h-full px-4 lg:px-10 pt-6 pb-10 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">Overview</h1>
          <p className="text-sm text-[#60666B] mt-1">Platform health and activity at a glance.</p>
        </div>

        {/* ── Users (3 cards) ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold text-[#60666B] uppercase tracking-wider mb-4">Users</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Total Users"    value={stats?.totalUsers ?? 0}        sub="All time"       Icon={People}      palette={PURPLE} loading={statsLoading} />
            <StatCard label="New This Month" value={stats?.newUsersThisMonth ?? 0} sub="Since the 1st"  Icon={ProfileAdd}  palette={GREEN}  loading={statsLoading} />
            <StatCard label="New This Week"  value={stats?.newUsersThisWeek ?? 0}  sub="Last 7 days"    Icon={ProfileTick} palette={BLUE}   loading={statsLoading} />
          </div>
        </section>

        {/* ── Charts row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* User Growth */}
          <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-900 mb-1">User Growth</p>
            <p className="text-[12px] text-[#60666B] mb-4">New registrations — last 30 days</p>
            <div className="h-[160px]">
              {userGrowthLoading ? <ChartSkeleton /> : (
                <LineChart data={userGrowth} color="#870BD6" gradientId="ugGrad" />
              )}
            </div>
          </div>

          {/* Daily Active Users */}
          <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-900 mb-1">Daily Active Users</p>
            <p className="text-[12px] text-[#60666B] mb-4">Activity log events — last 30 days</p>
            <div className="h-[160px]">
              {dauLoading ? <ChartSkeleton /> : (
                <LineChart data={dau} color="#175CD3" gradientId="dauGrad" />
              )}
            </div>
          </div>

        </div>

        {/* ── Content cards + Community Growth ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Left: 4 content cards in 2×2 grid */}
          <section>
            <h2 className="text-sm font-semibold text-[#60666B] uppercase tracking-wider mb-4">Content</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Active Communities"    value={stats?.activeCommunities ?? 0}    sub={`of ${stats?.totalCommunities ?? 0} total`}    Icon={People}          palette={TEAL}   loading={statsLoading} />
              <StatCard label="Published Courses"     value={stats?.publishedCourses ?? 0}     sub={`of ${stats?.totalCourses ?? 0} total`}         Icon={Book1}           palette={PURPLE} loading={statsLoading} />
              <StatCard label="Total Enrolments"      value={stats?.totalEnrollments ?? 0}     sub="Course sign-ups"                                Icon={BookSaved}       palette={AMBER}  loading={statsLoading} />
              <StatCard label="Published Devotionals" value={stats?.publishedDevotionals ?? 0} sub={`of ${stats?.totalDevotionals ?? 0} total`}     Icon={BookSaved}       palette={BLUE}   loading={statsLoading} />
            </div>
          </section>

          {/* Right: Community Growth bar chart */}
          <section>
            <h2 className="text-sm font-semibold text-[#60666B] uppercase tracking-wider mb-4">Community Growth</h2>
            <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
              <p className="text-[12px] text-[#60666B] mb-4">New communities created — last 12 months</p>
              <div className="h-[200px]">
                {communityGrowthLoading ? <ChartSkeleton /> : (
                  <BarChart data={communityGrowth} color="#870BD6" />
                )}
              </div>
            </div>
          </section>

        </div>

        {/* ── Moderation + Top Courses ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          <section>
            <h2 className="text-sm font-semibold text-[#60666B] uppercase tracking-wider mb-4">Moderation</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Pending Reports"      value={stats?.pendingReports ?? 0}     sub="Awaiting review" Icon={ShieldSecurity} palette={RED}   loading={statsLoading} />
              <StatCard label="Open Prayer Requests" value={stats?.openPrayerRequests ?? 0} sub="Unanswered"       Icon={More}           palette={AMBER} loading={statsLoading} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-[#60666B] uppercase tracking-wider mb-4">Top Courses by Enrolment</h2>
            <div className="bg-white border border-[#E3E8EF] rounded-2xl divide-y divide-[#F0F2F4] overflow-hidden">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
                    <div className="w-6 h-4 bg-gray-200 rounded shrink-0" />
                    <div className="flex-1 h-4 bg-gray-200 rounded" />
                    <div className="w-10 h-4 bg-gray-200 rounded shrink-0" />
                  </div>
                ))
              ) : !stats?.topCourses?.length ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Book1 size={24} color="#D1D5DB" />
                  <p className="text-sm text-[#60666B]">No enrolment data yet</p>
                </div>
              ) : (
                stats.topCourses.map((course, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors">
                    <span className="text-xs font-bold text-[#60666B] w-5 shrink-0 tabular-nums">#{i + 1}</span>
                    <div className="w-8 h-8 rounded-lg bg-[#FBF6FF] flex items-center justify-center shrink-0">
                      <Book1 size={14} color="#870BD6" />
                    </div>
                    <p className="flex-1 text-sm font-medium text-[#180426] truncate">{course.title}</p>
                    <span className="text-xs font-semibold text-[#870BD6] bg-[#FBF6FF] border border-[#E7C8FF] px-2.5 py-1 rounded-full shrink-0 tabular-nums">
                      {course.enrollmentCount} enrolled
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminOverviewPage;
