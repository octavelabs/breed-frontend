'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Button from '@/app/components/Button';
import { BookOpen, CheckCircle, FileEdit, UserPlus, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { courseService, mentorshipService } from '@/lib/api-services';
import PreacherCommunityIcon from '@/app/assets/icons/preacherCommunityIcon';
import MeetingIcon from '@/app/assets/icons/meetingIcon';
import Link from 'next/link';
import { CreateCourseModal } from '../showreel/components/CreateCourseModal';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthoredCourse {
  id: string;
  title: string;
  status: string;
  lessonCount?: number;
  _count?: { lessons?: number };
  createdAt: string;
}

interface MentorshipRequest {
  id: string;
  disciple?: { firstName?: string; lastName?: string; avatarUrl?: string | null };
  status: string;
  createdAt: string;
}

// ── Brand palette tokens ──────────────────────────────────────────────────────

type Palette = { bg: string; border: string; icon: string; accent: string };
const PURPLE: Palette = { bg: '#FBF6FF', border: '#E7C8FF', icon: '#E7C8FF', accent: '#870BD6' };
const GREEN:  Palette = { bg: '#ECFDF3', border: '#ABEFC6', icon: '#ABEFC6', accent: '#067647' };
const AMBER:  Palette = { bg: '#FFFAEB', border: '#FEDF89', icon: '#FEDF89', accent: '#B54708' };
const BLUE:   Palette = { bg: '#EFF8FF', border: '#B2DDFF', icon: '#B2DDFF', accent: '#175CD3' };

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub, Icon, palette, loading,
}: {
  label: string; value: number | string; sub?: string;
  Icon: React.ElementType; palette: Palette; loading?: boolean;
}) => (
  <div className="rounded-[16px] border p-6" style={{ backgroundColor: palette.bg, borderColor: palette.border }}>
    <div className="flex items-start gap-4">
      <div className="w-[48px] h-[48px] rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: palette.icon }}>
        <Icon size={22} color={palette.accent} />
      </div>
      <div>
        <p className="text-[13px] text-[#60666B]">{label}</p>
        {loading
          ? <div className="animate-pulse bg-gray-200 rounded h-7 w-12 mt-1" />
          : <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{value}</h3>}
        {sub && <p className="text-[13px] text-[#60666B] mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  const cls =
    s === 'published' ? 'bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]' :
    s === 'draft'     ? 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]' :
    s === 'archived'  ? 'bg-[#F8F9FC] text-[#363F72] border border-[#D5D9EB]' :
                        'bg-gray-100 text-gray-600';
  const label = s === 'published' ? 'Live' : (s.charAt(0).toUpperCase() + s.slice(1));
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>{label}</span>;
};

// ── Greeting helper ───────────────────────────────────────────────────────────

function getGreeting(firstName?: string) {
  const h = new Date().getHours();
  const time = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
  return `Good ${time}, ${firstName ?? 'Pastor'} 👋`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PreacherDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<AuthoredCourse[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    courseService
      .getAuthored({ limit: 5 })
      .then((res: unknown) => {
        const r = res as { data?: AuthoredCourse[]; meta?: { total?: number } };
        const list: AuthoredCourse[] = Array.isArray(res) ? (res as AuthoredCourse[]) : (r.data ?? []);
        setCourses(list);
        setTotalCourses(Array.isArray(res) ? list.length : (r.meta?.total ?? list.length));
      })
      .catch(() => { setCourses([]); setTotalCourses(0); })
      .finally(() => setCoursesLoading(false));
  }, []);

  useEffect(() => {
    mentorshipService
      .getDisciples()
      .then((res: unknown) => {
        const r = res as { data?: MentorshipRequest[] };
        const list: MentorshipRequest[] = Array.isArray(res) ? (res as MentorshipRequest[]) : (r.data ?? []);
        setRequests(list.slice(0, 5));
      })
      .catch(() => setRequests([]))
      .finally(() => setRequestsLoading(false));
  }, []);

  const liveCourses  = courses.filter(c => c.status?.toLowerCase() === 'published').length;
  const draftCourses = courses.filter(c => c.status?.toLowerCase() === 'draft').length;
  const pendingReqs  = requests.filter(r => r.status?.toLowerCase() === 'pending').length;

  return (
    <DashboardLayout>
      {createModalOpen && (
        <CreateCourseModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      )}

      <div className="px-4 lg:px-10 pt-6 pb-10 space-y-8">

        {/* Greeting */}
        <div>
          <h1 className="text-[24px] lg:text-[28px] font-bold leading-none">
            {getGreeting(user?.firstName)}
          </h1>
          <p className="text-[#60666B] text-sm mt-2">
            Here&apos;s an overview of your ministry activity.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Courses"     value={totalCourses} sub="All authored"        Icon={BookOpen}    palette={PURPLE} loading={coursesLoading} />
          <StatCard label="Live Courses"      value={liveCourses}  sub="Published"           Icon={CheckCircle} palette={GREEN}  loading={coursesLoading} />
          <StatCard label="Draft Courses"     value={draftCourses} sub="In progress"         Icon={FileEdit}    palette={AMBER}  loading={coursesLoading} />
          <StatCard label="Pending Requests"  value={pendingReqs}  sub="Awaiting response"   Icon={UserPlus}    palette={BLUE}   loading={requestsLoading} />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#FBF6FF] border border-[#E7C8FF] rounded-[16px]">
              <div className="flex items-center justify-between gap-6 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-[48px] h-[48px] rounded-xl bg-[#E7C8FF] flex items-center justify-center flex-shrink-0">
                    <PreacherCommunityIcon color="#870BD6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Create a Course</h3>
                    <p className="text-[13px] text-[#60666B] mt-1">
                      Share your teaching by building a new course for your community.
                    </p>
                  </div>
                </div>
                <Button customClass="!w-fit px-5 !h-[40px] !text-white !bg-[#870BD6]" buttonType="custom"
                  onClick={() => setCreateModalOpen(true)}>
                  Create
                </Button>
              </div>
            </div>

            <div className="bg-[#FBEAF3] border border-[#F3C4DD] rounded-[16px]">
              <div className="flex items-center justify-between gap-6 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-[48px] h-[48px] rounded-xl bg-[#F3C4DD] flex items-center justify-center flex-shrink-0">
                    <MeetingIcon color="#C83785" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Schedule a Meeting</h3>
                    <p className="text-[13px] text-[#60666B] mt-1">
                      Organise a community or open meeting and invite your congregation.
                    </p>
                  </div>
                </div>
                <Button customClass="!w-fit px-5 !h-[40px] !text-white !bg-[#C83785]" buttonType="custom"
                  onClick={() => router.push('/dashboard/preacher/meetings')}>
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column: Recent Courses + Mentorship Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Courses */}
          <div className="bg-white border border-[#E3E8EF] rounded-[16px]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E3E8EF]">
              <h2 className="text-base font-semibold text-gray-900">Recent Courses</h2>
              <Link href="/dashboard/preacher/showreel"
                className="text-[13px] text-[#870BD6] font-medium flex items-center gap-1 hover:underline">
                View all <ChevronRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-[#E3E8EF]">
              {coursesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))
              ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#60666B] text-sm gap-2">
                  <BookOpen size={28} className="text-gray-300" />
                  <p>No courses yet</p>
                </div>
              ) : (
                courses.map((course) => (
                  <Link key={course.id} href={`/dashboard/preacher/showreel/${course.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#FAFAFA] transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-[#E7C8FF] flex items-center justify-center flex-shrink-0">
                      <BookOpen size={18} color="#870BD6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{course.title}</p>
                      <p className="text-[13px] text-[#60666B] flex items-center gap-1 mt-0.5">
                        <Clock size={12} />
                        {new Date(course.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                        &nbsp;·&nbsp;
                        {course.lessonCount ?? course._count?.lessons ?? 0} lessons
                      </p>
                    </div>
                    <StatusBadge status={course.status} />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Mentorship Requests */}
          <div className="bg-white border border-[#E3E8EF] rounded-[16px]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E3E8EF]">
              <h2 className="text-base font-semibold text-gray-900">Mentorship Requests</h2>
              <Link href="/dashboard/preacher/mentorship"
                className="text-[13px] text-[#870BD6] font-medium flex items-center gap-1 hover:underline">
                View all <ChevronRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-[#E3E8EF]">
              {requestsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))
              ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#60666B] text-sm gap-2">
                  <UserPlus size={28} className="text-gray-300" />
                  <p>No mentorship requests yet</p>
                </div>
              ) : (
                requests.map((req) => {
                  const name = req.disciple
                    ? `${req.disciple.firstName ?? ''} ${req.disciple.lastName ?? ''}`.trim() || 'Unknown'
                    : 'Unknown';
                  const isPending = req.status?.toLowerCase() === 'pending';
                  return (
                    <div key={req.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-10 h-10 rounded-full bg-[#F3C4DD] flex items-center justify-center flex-shrink-0 text-[#C83785] text-sm font-bold uppercase">
                        {name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                        <p className="text-[13px] text-[#60666B] mt-0.5">
                          {new Date(req.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                      {isPending && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFF8FF] border border-[#B2DDFF] text-[#175CD3]">
                          Pending
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default PreacherDashboard;
