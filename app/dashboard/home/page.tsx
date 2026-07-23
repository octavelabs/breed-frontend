"use client";

import FlameIcon from "@/app/assets/icons/flame";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  ActivityType,
  courseService,
  devotionalService,
  prayerService,
  userService,
  WeekStreakResult,
} from "@/lib/api-services";
import {
  ChevronRight,
  Dumbbell,
  GraduationCap,
  MessageCircle,
  Users,
} from "lucide-react";
import {
  Timer1, Book1, Candle, Lovely, Flag2, HeartAdd, MessageQuestion, Heart,
  Buildings, Cup, Profile2User, Flash, ShieldCross, HeartCircle,
  Global, Wallet, MedalStar, Sun1, Crown, Briefcase, Bookmark,
  Clock as ClockIcon,
  type Icon as IcosaxIcon,
} from "iconsax-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { OnboardingChecklist } from "./components/OnboardingChecklist";

// ── Helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

const ACTIVITY_META: Record<
  string,
  { icon: ReactNode; colour: string; bg: string }
> = {
  DEVOTIONAL_READ: {
    icon: <Book1 size={9} color="#B54708" />,
    colour: "#B54708",
    bg: "#FFF6E5",
  },
  PRAYER_PRAYED: {
    icon: <span className="text-[9px]">🙏</span>,
    colour: "#067647",
    bg: "#ECFDF3",
  },
  LESSON_COMPLETED: {
    icon: <GraduationCap size={9} />,
    colour: "#175CD3",
    bg: "#EFF8FF",
  },
  COMMUNITY_ENGAGED: {
    icon: <MessageCircle size={9} />,
    colour: "#6941C6",
    bg: "#F4F3FF",
  },
  MENTORSHIP_TASK_COMPLETED: {
    icon: <Dumbbell size={9} />,
    colour: "#870BD6",
    bg: "#F5EBFF",
  },
  MENTORSHIP_SESSION_ATTENDED: {
    icon: <Users size={9} />,
    colour: "#C11574",
    bg: "#FDF2FA",
  },
  EDIFY: {
    icon: <Heart size={9} color="#6D28D9" />,
    colour: "#6D28D9",
    bg: "#EDE9FE",
  },
};

const TRACKED: ActivityType[] = [
  "DEVOTIONAL_READ",
  "PRAYER_PRAYED",
  "LESSON_COMPLETED",
  "COMMUNITY_ENGAGED",
  "MENTORSHIP_TASK_COMPLETED",
  "MENTORSHIP_SESSION_ATTENDED",
  "EDIFY",
];

// ── Arrow up-right icon ────────────────────────────────────────────────────

function ArrowUpRightIcon({
  size = 16,
  color = 'currentColor',
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color }}
      className={className}
    >
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 7H17V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Bulletin category map ──────────────────────────────────────────────────

const BULLETIN_CATEGORIES: Array<{
  id: string;
  label: string;
  Icon: IcosaxIcon;
  gradient: string;
  vector: string;
}> = [
  { id: 'PERSONAL_DEVOTION', label: 'Personal Devotion', Icon: Candle, gradient: 'linear-gradient(135deg, #5B26B1, #3B0764)', vector: '/assets/clarity-vector2.svg' },
  { id: 'INTERCESSION', label: 'Intercession', Icon: Lovely, gradient: 'linear-gradient(135deg, #1D4ED8, #1E3A8A)', vector: '/assets/clarity-vector1.svg' },
  { id: 'INTERCESSION_FOR_NATION', label: 'Intercession for Nation', Icon: Flag2, gradient: 'linear-gradient(135deg, #1E40AF, #1E3A8A)', vector: '/assets/clarity-vector1.svg' },
  { id: 'HEALTH_AND_COMFORT', label: 'Health & Comfort', Icon: HeartAdd, gradient: 'linear-gradient(135deg, #047857, #064E3B)', vector: '/assets/clarity-vector3.svg' },
  { id: 'SPECIAL_REQUEST', label: 'Special Request', Icon: MessageQuestion, gradient: 'linear-gradient(135deg, #6D28D9, #4C1D95)', vector: '/assets/clarity-vector4.svg' },
  { id: 'HEALING', label: 'Healing', Icon: Heart, gradient: 'linear-gradient(135deg, #059669, #064E3B)', vector: '/assets/clarity-vector3.svg' },
  { id: 'NATION_AND_CHURCH', label: 'Nation & Church', Icon: Buildings, gradient: 'linear-gradient(135deg, #870BD6, #5B26B1)', vector: '/assets/clarity-vector2.svg' },
  { id: 'THANKSGIVING_AND_TESTIMONIES', label: 'Thanksgiving', Icon: Cup, gradient: 'linear-gradient(135deg, #D97706, #92400E)', vector: '/assets/clarity-vector4.svg' },
  { id: 'FAMILY', label: 'Family', Icon: Profile2User, gradient: 'linear-gradient(135deg, #DB2777, #9D174D)', vector: '/assets/clarity-vector3.svg' },
  { id: 'PURPOSE_AND_CALLING', label: 'Purpose & Calling', Icon: Flash, gradient: 'linear-gradient(135deg, #4338CA, #312E81)', vector: '/assets/clarity-vector1.svg' },
  { id: 'SPIRITUAL_WARFARE', label: 'Spiritual Warfare', Icon: ShieldCross, gradient: 'linear-gradient(135deg, #7F1D1D, #450A0A)', vector: '/assets/clarity-vector4.svg' },
  { id: 'MARRIAGES_AND_RELATIONSHIPS', label: 'Marriages & Relationships', Icon: HeartCircle, gradient: 'linear-gradient(135deg, #BE123C, #881337)', vector: '/assets/clarity-vector2.svg' },
  { id: 'MISSIONS_AND_EVANGELISM', label: 'Missions & Evangelism', Icon: Global, gradient: 'linear-gradient(135deg, #0F766E, #134E4A)', vector: '/assets/clarity-vector3.svg' },
  { id: 'PROVISION_AND_FINANCE', label: 'Provision & Finance', Icon: Wallet, gradient: 'linear-gradient(135deg, #A16207, #713F12)', vector: '/assets/clarity-vector4.svg' },
  { id: 'YOUTH_AND_NEXT_GENERATION', label: 'Youth & Next Generation', Icon: MedalStar, gradient: 'linear-gradient(135deg, #0E7490, #164E63)', vector: '/assets/clarity-vector1.svg' },
  { id: 'PEACE_AND_MENTAL_HEALTH', label: 'Peace & Mental Health', Icon: Sun1, gradient: 'linear-gradient(135deg, #0369A1, #0C4A6E)', vector: '/assets/clarity-vector2.svg' },
  { id: 'SALVATION', label: 'Salvation', Icon: Crown, gradient: 'linear-gradient(135deg, #EA580C, #9A3412)', vector: '/assets/clarity-vector3.svg' },
  { id: 'WORK_AND_CALLING', label: 'Work & Calling', Icon: Briefcase, gradient: 'linear-gradient(135deg, #475569, #1E293B)', vector: '/assets/clarity-vector4.svg' },
];

const DEFAULT_BULLETIN_GRADIENT = 'linear-gradient(135deg, #870BD6, #5B26B1)';
const DEFAULT_BULLETIN_VECTOR = '/assets/clarity-vector2.svg';

// ── Today's Bulletin Card ──────────────────────────────────────────────────

function TodayBulletinCard({ bulletin, loading }: { bulletin: any; loading: boolean }) {
  const cat = bulletin?.category
    ? BULLETIN_CATEGORIES.find((c) => c.id === bulletin.category)
    : null;
  const gradient = cat?.gradient ?? DEFAULT_BULLETIN_GRADIENT;
  const vector = cat?.vector ?? DEFAULT_BULLETIN_VECTOR;
  const CategoryIcon = cat?.Icon ?? null;

  const dateStr = bulletin?.publishedAt
    ? new Date(bulletin.publishedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div
        className="rounded-2xl overflow-hidden animate-pulse h-full min-h-[200px]"
        style={{ background: DEFAULT_BULLETIN_GRADIENT }}
      />
    );
  }

  return (
    <Link href="/dashboard/buildup?tab=bulletins" className="block h-full">
      <div
        className="rounded-2xl overflow-hidden cursor-pointer relative flex flex-col h-full min-h-[200px] p-6"
        style={{ background: gradient }}
      >
        {/* Decorative vector */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={vector}
          alt=""
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-auto pointer-events-none select-none"
          style={{ opacity: 0.15 }}
        />

        {/* Top-center label */}
        <p className="absolute top-8 left-0 right-0 text-white/80 text-sm font-semibold text-center uppercase tracking-widest z-10 pointer-events-none">
          Today&apos;s Prayer Focus
        </p>

        {/* Top row: category icon + bookmark */}
        <div className="relative z-10 flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            {CategoryIcon ? (
              <CategoryIcon size={20} color="white" />
            ) : (
              <Heart size={20} color="white" />
            )}
          </div>
          {bulletin && (
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bookmark
                size={16}
                color="white"
                variant={bulletin.isBookmarked ? 'Bold' : 'Linear'}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">
            {cat?.label ?? "Today's Bulletin"}
          </p>
          <h3 className="text-white font-bold text-xl leading-snug mb-2 line-clamp-3">
            {bulletin?.title ?? "Today's Prayer Bulletin"}
          </h3>
          <p className="text-white/60 text-sm">{dateStr}</p>
        </div>

        {/* Footer */}
        {bulletin && (
          <div className="relative z-10 mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
            <Heart size={14} color="rgba(255,255,255,0.7)" />
            <span className="text-white/70 text-sm">
              {bulletin.prayerCount ?? 0} prayed this
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Streak Day Column ──────────────────────────────────────────────────────

function DayColumn({
  label,
  activities,
  isToday,
  noActivity,
}: {
  label: string;
  activities: ActivityType[];
  isToday: boolean;
  noActivity: boolean;
}) {
  const hasFire = activities.length > 0;

  return (
    <div
      className={`flex flex-col items-center gap-1.5 flex-1 ${isToday ? "relative" : ""}`}
    >
      {/* Activity dots */}
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
          isToday ? "ring-2 ring-[#870BD6] dark:ring-[#A855F7] ring-offset-2 dark:ring-offset-[#1E2025]" : ""
        } ${noActivity ? "bg-gray-100 dark:bg-[#252830]" : "bg-[#EDE9FE] dark:bg-[#3D2060]"}`}
      >
        {hasFire ? (
          <FlameIcon size={17} color="#870BD6" />
        ) : (
          <span className="opacity-40">
            <FlameIcon size={17} color="#870BD6" />
          </span>
        )}
        {/* Activity type badges in bottom-right corner */}
        {activities.length > 0 && (
          <div className="absolute -bottom-1 -right-1 flex gap-px">
            {activities.slice(0, 3).map((type) => {
              const meta = ACTIVITY_META[type];
              if (!meta) return null;
              return (
                <div
                  key={type}
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: meta.bg, color: meta.colour }}
                >
                  {meta.icon}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <span
        className={`text-xs font-medium ${noActivity ? "text-gray-400 dark:text-[#717784]" : "text-gray-600 dark:text-[#E2E4E9]"} ${isToday ? "font-bold text-[#180426] dark:!text-white" : ""}`}
      >
        {label}
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const HomePage = () => {
  const { user } = useAuth();

  const { data: weekStreak = null, isLoading: streakLoading } = useQuery({
    queryKey: ['week-streak'],
    queryFn: () =>
      userService.getWeekStreak().then((res: any) => (res?.data ?? res) as WeekStreakResult),
  });

  const { data: course = null, isLoading: courseLoading } = useQuery({
    queryKey: ['courses', 'featured'],
    queryFn: () =>
      courseService.getAll({ limit: 1 }).then((res: any) => {
        const items = res?.data ?? res;
        return Array.isArray(items) ? (items[0] ?? null) : null;
      }),
  });

  const { data: devotional = null, isLoading: devotionalLoading } = useQuery({
    queryKey: ['devotional', 'today'],
    queryFn: () =>
      devotionalService.getToday().then((res: any) => res?.data ?? res ?? null),
  });

  const { data: bulletin = null, isLoading: bulletinLoading } = useQuery({
    queryKey: ['bulletin', 'today'],
    queryFn: () =>
      prayerService.getTodaysBulletin().then((res: any) => res?.data ?? res ?? null),
  });

  const currentStreak = weekStreak?.currentStreak ?? 0;
  const breakdown = weekStreak?.breakdown ?? {};

  // Non-zero breakdown entries for the strip
  const breakdownEntries = TRACKED.map((type) => breakdown[type]).filter(
    (s): s is NonNullable<typeof s> => !!s && s.current > 0,
  );

  return (
    <DashboardLayout>
      <div className="mx-auto">
        {/* ── Greeting ── */}
        <div className="flex justify-between lg:justify-start items-center mb-8 lg:mb-0">
          <h1 className="text-[24px] lg:text-[32px] font-bold lg:mb-8 dark:text-white">
            {getGreeting()}, {user?.firstName ?? "Friend"}
          </h1>
          {/* Mobile streak badge */}
          <Link href="/dashboard/streaks">
            <div className="flex lg:hidden items-center gap-2.5 px-4 py-2.5 rounded-full border border-[#D2D9DF] dark:border-[#2D313A] bg-white dark:bg-[#252830] cursor-pointer hover:border-[#870BD6] dark:hover:border-[#A855F7] transition-colors">
              <FlameIcon size={20} />
              {streakLoading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-[#181A1F] rounded h-5 w-6" />
              ) : (
                <span className="text-[20px] font-bold dark:text-white">{currentStreak}</span>
              )}
            </div>
          </Link>
        </div>

        {/* ── Today's Bulletin (mobile) ── */}
        <div className="lg:hidden mb-6">
          <TodayBulletinCard bulletin={bulletin} loading={bulletinLoading} />
        </div>

        {/* ── Onboarding checklist (hides once dismissed or all done) ── */}
        <OnboardingChecklist />

        {/* ── Desktop Consistency Tracker + Today's Bulletin ── */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6 mb-16">
          <div className="rounded-2xl">
          <Link href="/dashboard/streaks">
            <div className="bg-white/90 dark:bg-[#181A1F] rounded-2xl p-6 h-full shadow-[0px_4px_4px_0px_#00000008] dark:shadow-none cursor-pointer hover:bg-white/95 dark:hover:bg-[#1E2025] transition-colors relative overflow-hidden">
              {/* Flame watermark */}
              <div
                className="absolute -bottom-8 -right-6 pointer-events-none select-none opacity-[0.06]"
                style={{ transform: 'rotate(-8deg)' }}
                aria-hidden="true"
              >
                <FlameIcon size={210} color="#870BD6" />
              </div>

              {/* Header row: title + streak badge side by side */}
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold dark:text-white">Consistency is Key</h2>
                  <p className="text-sm text-gray-400 dark:text-[#717784] mt-1">Keep showing up, one day at a time</p>
                </div>
                <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border border-[#D2D9DF] dark:border-[#2D313A] bg-white dark:bg-[#252830] shrink-0">
                  <FlameIcon size={30} />
                  {streakLoading ? (
                    <div className="animate-pulse bg-gray-200 dark:bg-[#181A1F] rounded h-6 w-8" />
                  ) : (
                    <span className="text-[22px] font-bold leading-none dark:text-white">
                      {currentStreak}
                    </span>
                  )}
                </div>
              </div>

              {/* Day grid — full width, no badge competing for space */}
              {streakLoading ? (
                <div className="flex gap-2">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#252830] animate-pulse" />
                      <div className="w-4 h-3 rounded bg-gray-100 dark:bg-[#252830] animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* 7-day tracker */}
                  <div className="flex gap-2 mb-4">
                    {(weekStreak?.days ?? []).map((day) => (
                      <DayColumn
                        key={day.date}
                        label={day.label}
                        activities={day.activities}
                        isToday={day.isToday}
                        noActivity={day.activities.length === 0}
                      />
                    ))}
                  </div>

                  {/* Activity type legend */}
                  {breakdownEntries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {TRACKED.map((type) => {
                        const stat = breakdown[type];
                        if (!stat || stat.current === 0) return null;
                        const meta = ACTIVITY_META[type];
                        return (
                          <div
                            key={type}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: meta.bg,
                              color: meta.colour,
                            }}
                          >
                            {meta.icon}
                            <span>{stat.label}</span>
                            <span className="font-bold">{stat.current}d</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </Link>
          </div>

          {/* Today's Bulletin (desktop, second column) */}
          <TodayBulletinCard bulletin={bulletin} loading={bulletinLoading} />
        </div>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-6 mb-8">
          {/* Suggested Course */}
          <div>
            <h3 className="text-base lg:text-xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-4">
              {course ? "Suggested Course" : "Browse Courses"}
            </h3>
            <Link
              href={
                course?.id
                  ? `/dashboard/learn/${course.id}`
                  : "/dashboard/learn"
              }
            >
              <div className="bg-white dark:bg-[#181A1F] border border-[#E5E7EB] dark:border-[#2D313A] rounded-2xl overflow-hidden cursor-pointer flex hover:shadow-sm dark:hover:border-[#3A3E48] transition-all">
                {/* Content */}
                <div className="w-full md:flex-[3] min-w-0 px-6 py-6 flex flex-col">
                  {courseLoading ? (
                    <div className="space-y-3 flex-1">
                      <div className="animate-pulse bg-gray-100 dark:bg-[#252830] rounded h-3 w-1/4" />
                      <div className="animate-pulse bg-gray-100 dark:bg-[#252830] rounded h-5 w-3/4" />
                      <div className="animate-pulse bg-gray-100 dark:bg-[#252830] rounded h-3 w-2/3" />
                      <div className="animate-pulse bg-gray-100 dark:bg-[#252830] rounded h-3 w-1/2" />
                      <div className="animate-pulse bg-gray-100 dark:bg-[#252830] rounded-full h-8 w-28 mt-1" />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400 dark:text-[#9CA3AF] font-medium uppercase tracking-wide mb-2">
                        {course?.category?.name ?? 'Featured Course'}
                      </p>
                      <h4 className="text-[19px] font-bold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2">
                        {course?.title ?? 'Explore courses to grow in your faith.'}
                      </h4>
                      {course?.description && (
                        <p className="text-sm text-gray-500 dark:text-[#9CA3AF] leading-relaxed mb-3 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      {/* Meta row */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-gray-400 dark:text-[#717784]">
                        <span className="flex items-center gap-1.5">
                          <ClockIcon size={13} color="#9CA3AF" />
                          {course?.durationMinutes ? `${course.durationMinutes} min` : 'Self-paced'}
                        </span>
                        {(course?.lessonCount ?? 0) > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Book1 size={13} color="#9CA3AF" />
                            {course!.lessonCount} lessons
                          </span>
                        )}
                      </div>
                      {/* CTA pill */}
                      <div className="inline-flex self-start items-center gap-1.5 px-8 py-3 rounded-full bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white text-sm font-semibold">
                        {(course as any)?.isEnrolled ? 'Continue Learning' : 'Enroll'}
                        <ArrowUpRightIcon size={14} />
                      </div>
                    </>
                  )}
                </div>

                {/* Desktop: image flush right — hidden on mobile */}
                <div className="hidden md:block flex-[2] relative self-stretch">
                  {courseLoading ? (
                    <div className="absolute inset-0 bg-gray-100 dark:bg-[#252830] animate-pulse" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={(course as any)?.coverImageUrl ?? (course as any)?.coverImage ?? '/home-dashboard.jpg'}
                      alt={course?.title ?? 'Course'}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Today's Devotional */}
          <div>
            <h3 className="text-base lg:text-xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-4">
              Today&apos;s Devotional
            </h3>
            <Link
              href={
                devotional?.id
                  ? `/dashboard/home/article/${devotional.id}`
                  : "/dashboard/buildup?tab=devotionals"
              }
            >
              <div className="bg-white dark:bg-[#181A1F] border border-[#E5E7EB] dark:border-[#2D313A] rounded-2xl overflow-hidden cursor-pointer flex hover:shadow-sm dark:hover:border-[#3A3E48] transition-all">
                {/* Content */}
                <div className="w-full md:flex-[3] min-w-0 px-6 py-6 flex flex-col">
                  {devotionalLoading ? (
                    <div className="space-y-3 flex-1">
                      <div className="animate-pulse bg-gray-100 dark:bg-[#252830] rounded h-3 w-1/4" />
                      <div className="animate-pulse bg-gray-100 dark:bg-[#252830] rounded h-5 w-3/4" />
                      <div className="animate-pulse bg-gray-100 dark:bg-[#252830] rounded h-3 w-2/3" />
                      <div className="animate-pulse bg-gray-100 dark:bg-[#252830] rounded h-3 w-1/2" />
                      <div className="animate-pulse bg-gray-100 dark:bg-[#252830] rounded-full h-8 w-28 mt-1" />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400 dark:text-[#9CA3AF] font-medium uppercase tracking-wide mb-2">
                        {devotional?.category?.name ?? 'Daily Devotional'}
                      </p>
                      <h4 className="text-[19px] font-bold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2">
                        {devotional?.title ?? 'No devotional scheduled for today.'}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-[#9CA3AF] leading-relaxed mb-3 line-clamp-2">
                        {devotional?.content
                          ? devotional.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
                          : 'Grow deeper in your faith with today\'s devotional reading.'}
                      </p>
                      {/* Meta row */}
                      <div className="flex items-center gap-4 mb-4 text-xs text-gray-400 dark:text-[#717784]">
                        <span className="flex items-center gap-1.5">
                          <ClockIcon size={13} color="#9CA3AF" />
                          {devotional?.estimatedMinutes ? `${devotional.estimatedMinutes} min read` : '5 min read'}
                        </span>
                      </div>
                      {/* CTA pill */}
                      <div className="inline-flex self-start items-center gap-1.5 px-8 py-3 rounded-full bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white text-sm font-semibold">
                        Read Now
                        <ArrowUpRightIcon size={14} />
                      </div>
                    </>
                  )}
                </div>

                {/* Desktop: image flush right — hidden on mobile */}
                <div className="hidden md:block flex-[2] relative self-stretch">
                  {devotionalLoading ? (
                    <div className="absolute inset-0 bg-gray-100 dark:bg-[#252830] animate-pulse" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={devotional?.coverImageUrl ?? '/DailyEdification2.png'}
                      alt={devotional?.title ?? 'Devotional'}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </Link>
          </div>
        </div>        
      </div>
    </DashboardLayout>
  );
};

export default HomePage;
