'use client';

import { useEffect, useState } from 'react';
import {
  Users, UserCheck, UserPlus, BookOpen, BookMarked,
  Users2, ShieldAlert, MoreHorizontal,
} from 'lucide-react';
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
  totalMentorships: number;
  activeMentorships: number;
  pendingReports: number;
  openPrayerRequests: number;
  totalEnrollments: number;
  topCourses: { title: string; enrollmentCount: number }[];
}

// ── Palette ───────────────────────────────────────────────────────────────────

type Palette = { bg: string; border: string; iconBg: string; accent: string };
const PURPLE: Palette = { bg: '#FBF6FF', border: '#E7C8FF', iconBg: '#E7C8FF', accent: '#870BD6' };
const GREEN:  Palette = { bg: '#ECFDF3', border: '#ABEFC6', iconBg: '#ABEFC6', accent: '#067647' };
const AMBER:  Palette = { bg: '#FFFAEB', border: '#FEDF89', iconBg: '#FEDF89', accent: '#B54708' };
const BLUE:   Palette = { bg: '#EFF8FF', border: '#B2DDFF', iconBg: '#B2DDFF', accent: '#175CD3' };
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

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminOverviewPage = () => {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then((data) => setStats(data as DashboardStats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white min-h-full px-4 lg:px-10 pt-6 pb-10 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">Overview</h1>
          <p className="text-sm text-[#60666B] mt-1">Platform health and activity at a glance.</p>
        </div>

        {/* Users */}
        <section>
          <h2 className="text-sm font-semibold text-[#60666B] uppercase tracking-wider mb-4">Users</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users"       value={stats?.totalUsers ?? 0}        sub="All time"        Icon={Users}      palette={PURPLE} loading={loading} />
            <StatCard label="New This Month"    value={stats?.newUsersThisMonth ?? 0} sub="Since the 1st"   Icon={UserPlus}   palette={GREEN}  loading={loading} />
            <StatCard label="New This Week"     value={stats?.newUsersThisWeek ?? 0}  sub="Last 7 days"     Icon={UserCheck}  palette={BLUE}   loading={loading} />
            <StatCard label="Total Enrollments" value={stats?.totalEnrollments ?? 0}  sub="Course sign-ups" Icon={BookMarked} palette={AMBER}  loading={loading} />
          </div>
        </section>

        {/* Content */}
        <section>
          <h2 className="text-sm font-semibold text-[#60666B] uppercase tracking-wider mb-4">Content</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Active Communities"    value={stats?.activeCommunities ?? 0}    sub={`of ${stats?.totalCommunities ?? 0} total`}    Icon={Users2}     palette={TEAL}   loading={loading} />
            <StatCard label="Published Courses"     value={stats?.publishedCourses ?? 0}     sub={`of ${stats?.totalCourses ?? 0} total`}         Icon={BookOpen}   palette={PURPLE} loading={loading} />
            <StatCard label="Published Devotionals" value={stats?.publishedDevotionals ?? 0} sub={`of ${stats?.totalDevotionals ?? 0} total`}     Icon={BookMarked} palette={BLUE}   loading={loading} />
          </div>
        </section>

        {/* Moderation + Top Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Moderation */}
          <section>
            <h2 className="text-sm font-semibold text-[#60666B] uppercase tracking-wider mb-4">Moderation</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Pending Reports"      value={stats?.pendingReports ?? 0}     sub="Awaiting review" Icon={ShieldAlert}    palette={RED}   loading={loading} />
              <StatCard label="Open Prayer Requests" value={stats?.openPrayerRequests ?? 0} sub="Unanswered"       Icon={MoreHorizontal} palette={AMBER} loading={loading} />
            </div>
          </section>

          {/* Top Courses */}
          <section>
            <h2 className="text-sm font-semibold text-[#60666B] uppercase tracking-wider mb-4">Top Courses by Enrollment</h2>
            <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#E3E8EF] last:border-0 animate-pulse">
                    <div className="flex-1 h-3.5 bg-gray-200 rounded" />
                    <div className="h-5 bg-gray-200 rounded-full w-16" />
                  </div>
                ))
              ) : !stats?.topCourses?.length ? (
                <div className="px-5 py-10 text-center text-sm text-[#60666B]">No courses yet</div>
              ) : (
                stats.topCourses.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#E3E8EF] last:border-0">
                    <span className="text-[12px] font-bold text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                    <p className="flex-1 text-sm font-medium text-gray-900 truncate">{c.title}</p>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FBF6FF] text-[#870BD6] border border-[#E7C8FF] whitespace-nowrap">
                      {c.enrollmentCount} enrolled
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
