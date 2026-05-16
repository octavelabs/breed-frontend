'use client';

import Tabs from '@/app/components/Tabs';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { courseService } from '@/lib/api-services';
import { BookOpen, Users, Clock, SearchIcon, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  title: string;
  description?: string;
  level?: string;
  isFree?: boolean;
  coverImageUrl?: string | null;
  enrollmentCount?: number;
  lessonCount?: number;
  isEnrolled?: boolean;
  progressPercent?: number;
  createdAt?: string;
  category?: { name: string } | null;
  author?: { firstName?: string; lastName?: string } | null;
}

// ── Level label map ────────────────────────────────────────────────────────────

const levelLabel: Record<string, string> = {
  BEGINNER: 'Foundational',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const levelColor: Record<string, string> = {
  BEGINNER:     'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]',
  INTERMEDIATE: 'bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]',
  ADVANCED:     'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]',
};

// ── Course Card ───────────────────────────────────────────────────────────────

const CourseCard = ({ course, showProgress }: { course: Course; showProgress?: boolean }) => {
  const level = course.level ?? 'BEGINNER';
  const progress = course.progressPercent ?? 0;

  return (
    <Link href={`/dashboard/learn/${course.id}/chapters/${course.id}`}>
      <div className="border border-[#E2E3E5] shadow-[0px_1px_2px_0px_#1018280D] rounded-[16px] bg-white hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
        {/* Cover */}
        <div className="bg-gray-100 rounded-t-[16px] p-[14px]">
          <div className="relative bg-[#180426] rounded-[12px] h-[160px] overflow-hidden flex items-center justify-center">
            {course.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen size={40} className="text-white opacity-20" />
            )}
            {/* Level badge */}
            <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${levelColor[level] ?? levelColor.BEGINNER}`}>
              {levelLabel[level] ?? level}
            </span>
            {course.isFree && (
              <span className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]">
                Free
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
          {course.category?.name && (
            <p className="text-[11px] text-[#870BD6] font-medium mb-1">{course.category.name}</p>
          )}
          <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2 line-clamp-2 flex-1">
            {course.title}
          </h3>

          <div className="flex items-center gap-3 text-[13px] text-[#60666B] mb-3">
            <span className="flex items-center gap-1">
              <BookOpen size={13} />
              {course.lessonCount ?? 0} lessons
            </span>
            <span className="flex items-center gap-1">
              <Users size={13} />
              {course.enrollmentCount ?? 0}
            </span>
            {course.author && (
              <span className="flex items-center gap-1 truncate">
                <Clock size={13} />
                {course.author.firstName} {course.author.lastName}
              </span>
            )}
          </div>

          {/* Progress bar (In Progress tab) */}
          {showProgress && (
            <div className="mt-auto">
              <div className="flex justify-between text-[11px] text-[#60666B] mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-[#870BD6] h-1.5 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyState = ({ icon: Icon, message, sub }: { icon: React.ElementType; message: string; sub?: string }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
    <div className="w-14 h-14 rounded-full bg-[#F5EBFF] flex items-center justify-center">
      <Icon size={24} color="#870BD6" />
    </div>
    <p className="text-sm font-semibold text-gray-700">{message}</p>
    {sub && <p className="text-[13px] text-[#60666B] max-w-xs">{sub}</p>}
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────────────────────

const CoursesSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-4 lg:px-12 pt-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="border border-[#E2E3E5] rounded-[16px] animate-pulse">
        <div className="bg-gray-100 rounded-t-[16px] p-[14px]">
          <div className="bg-gray-200 rounded-[12px] h-[160px]" />
        </div>
        <div className="px-4 py-4 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// ── Discover tab ──────────────────────────────────────────────────────────────

const DiscoverCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    courseService
      .getAll({ limit: 20 })
      .then((res: unknown) => {
        const r = res as { data?: Course[] };
        const list: Course[] = Array.isArray(res) ? (res as Course[]) : (r.data ?? []);
        setCourses(list);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <CoursesSkeleton />;

  return (
    <div className="border-t border-[#D2D9DF]">
      {/* Search bar */}
      <div className="px-4 lg:px-12 py-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 border border-[#B9C2CA] rounded-full text-sm outline-none focus:border-purple-400 bg-white"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} message="No courses found" sub="Check back later or try a different search." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-4 lg:px-12 pb-10">
          {filtered.map(course => <CourseCard key={course.id} course={course} />)}
        </div>
      )}
    </div>
  );
};

// ── In Progress tab ───────────────────────────────────────────────────────────

const InProgressCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService
      .getEnrolled()
      .then((res: unknown) => {
        const r = res as { data?: Course[] };
        const list: Course[] = Array.isArray(res) ? (res as Course[]) : (r.data ?? []);
        // In Progress = enrolled but not 100% complete
        setCourses(list.filter(c => (c.progressPercent ?? 0) < 100));
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CoursesSkeleton />;

  if (courses.length === 0) {
    return (
      <div className="border-t border-[#D2D9DF]">
        <EmptyState
          icon={Clock}
          message="No courses in progress"
          sub="Enrol in a course from Discover to start learning."
        />
      </div>
    );
  }

  return (
    <div className="border-t border-[#D2D9DF]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-4 lg:px-12 py-6 pb-10">
        {courses.map(course => <CourseCard key={course.id} course={course} showProgress />)}
      </div>
    </div>
  );
};

// ── Completed tab ─────────────────────────────────────────────────────────────

const CompletedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService
      .getCompleted()
      .then((res: unknown) => {
        const r = res as { data?: Course[] };
        const list: Course[] = Array.isArray(res) ? (res as Course[]) : (r.data ?? []);
        setCourses(list);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CoursesSkeleton />;

  if (courses.length === 0) {
    return (
      <div className="border-t border-[#D2D9DF]">
        <EmptyState
          icon={CheckCircle}
          message="No completed courses yet"
          sub="Finish a course to see it here. Keep going!"
        />
      </div>
    );
  }

  return (
    <div className="border-t border-[#D2D9DF]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 px-4 lg:px-12 py-6 pb-10">
        {courses.map(course => (
          <div key={course.id} className="relative">
            <CourseCard course={course} />
            {/* Completed ribbon */}
            <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#ECFDF3] border border-[#ABEFC6] flex items-center justify-center shadow-sm">
              <CheckCircle size={18} className="text-[#067647]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const Learn: React.FC = () => {
  const tabs = [
    { label: 'Discover',    value: 'discover',    content: <DiscoverCourses /> },
    { label: 'In Progress', value: 'inProgress',  content: <InProgressCourses /> },
    { label: 'Completed',   value: 'completed',   content: <CompletedCourses /> },
  ];

  return (
    <DashboardLayout custom={true}>
      <div className="flex justify-start items-center pb-[27px] lg:pb-8 px-4 lg:px-12 mt-6 lg:mt-[64px] border-b border-[#D2D9DF]">
        <h1 className="text-[24px] lg:text-[32px] leading-none font-bold">Learn</h1>
      </div>
      <div className="bg-white pt-5">
        <Tabs tabs={tabs} defaultTab="discover" className="px-4 lg:px-12" />
      </div>
    </DashboardLayout>
  );
};

export default Learn;
