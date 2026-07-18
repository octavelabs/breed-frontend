"use client";

import FlameIcon from "@/app/assets/icons/flame";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  ActivityType,
  courseService,
  devotionalService,
  userService,
  WeekStreakResult,
} from "@/lib/api-services";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Dumbbell,
  GraduationCap,
  MessageCircle,
  Users,
} from "lucide-react";
import { Timer1 } from "iconsax-react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  { icon: React.ReactNode; colour: string; bg: string }
> = {
  DEVOTIONAL_READ: {
    icon: <BookOpen size={9} />,
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
    icon: <Timer1 size={9} color="#6D28D9" />,
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

// ── Skeleton ───────────────────────────────────────────────────────────────

const TextSkeleton = ({ w = "w-3/4" }: { w?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded h-4 ${w}`} />
);

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
        className={`w-9 h-9 rounded-full flex items-center justify-center relative ${
          isToday ? "ring-2 ring-[#870BD6] ring-offset-2" : ""
        } ${noActivity ? "bg-gray-100" : "bg-[#FFF6E5]"}`}
      >
        {hasFire ? (
          <FlameIcon size={20} />
        ) : (
          <span className="opacity-20">
            <FlameIcon size={20} />
          </span>
        )}
        {/* Activity type dots in bottom-right corner */}
        {activities.length > 0 && (
          <div className="absolute -bottom-1 -right-1 flex gap-px">
            {activities.slice(0, 3).map((type) => {
              const meta = ACTIVITY_META[type];
              if (!meta) return null;
              return (
                <div
                  key={type}
                  className="w-2.5 h-2.5 rounded-full flex items-center justify-center"
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
        className={`text-xs font-medium ${noActivity ? "text-gray-400" : "text-gray-600"} ${isToday ? "font-bold text-[#180426]" : ""}`}
      >
        {label}
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

const HomePage = () => {
  const { user } = useAuth();

  const [weekStreak, setWeekStreak] = useState<WeekStreakResult | null>(null);
  const [streakLoading, setStreakLoading] = useState(true);

  const [course, setCourse] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(true);

  const [devotional, setDevotional] = useState<any>(null);
  const [devotionalLoading, setDevotionalLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService
        .getWeekStreak()
        .then((res: any) => {
          setWeekStreak((res?.data ?? res) as WeekStreakResult);
        })
        .catch(() => null),
      courseService
        .getAll({ limit: 1 })
        .then((res: any) => {
          const items = res?.data ?? res;
          setCourse(Array.isArray(items) ? (items[0] ?? null) : null);
        })
        .catch(() => null),
      devotionalService
        .getToday()
        .then((res: any) => {
          setDevotional(res?.data ?? res ?? null);
        })
        .catch(() => null),
    ]).finally(() => {
      setStreakLoading(false);
      setCourseLoading(false);
      setDevotionalLoading(false);
    });
  }, []);

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
          <h1 className="text-[24px] lg:text-[32px] font-bold lg:mb-8">
            {getGreeting()}, {user?.firstName ?? "Friend"}
          </h1>
          {/* Mobile streak badge */}
          <Link href="/dashboard/streaks">
            <div className="flex lg:hidden items-center gap-2.5 px-4 py-2.5 rounded-full border border-[#D2D9DF] bg-white cursor-pointer hover:border-[#870BD6] transition-colors">
              <FlameIcon size={20} />
              {streakLoading ? (
                <div className="animate-pulse bg-gray-200 rounded h-5 w-6" />
              ) : (
                <span className="text-[20px] font-bold">{currentStreak}</span>
              )}
            </div>
          </Link>
        </div>

        {/* ── Mobile hero card ── */}
        <div
          className="block lg:hidden relative rounded-2xl px-[30px] py-[37.5px] shadow-lg cursor-pointer overflow-hidden h-[220px] mb-8"
          style={{
            backgroundImage: `url('/dashboard-gratitude.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="text-white">
            <h2 className="text-[20px] font-bold mb-1 leading-none">
              Daily Reading
            </h2>
            <p className="text-sm mb-4 line-clamp-3">
              {devotional?.excerpt ??
                devotional?.title ??
                "Start your day with the Word."}
            </p>
            {devotional?.id ? (
              <Link href={`/dashboard/home/article/${devotional.id}`}>
                <button className="flex items-center gap-2 font-semibold hover:gap-3 transition-all">
                  <span className="text-sm leading-none">Continue Reading</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            ) : (
              <Link href="/dashboard/buildup?tab=devotionals">
                <button className="flex items-center gap-2 font-semibold hover:gap-3 transition-all">
                  <span className="text-sm leading-none">
                    Browse Devotionals
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Onboarding checklist (hides once dismissed or all done) ── */}
        <OnboardingChecklist />

        {/* ── Desktop Consistency Tracker ── */}
        <div
          style={{ backgroundImage: `url('/dashboard-header.png')` }}
          className="hidden lg:block rounded-2xl"
        >
          <Link href="/dashboard/streaks">
            <div className="bg-white/90 rounded-2xl px-16.5 py-11 mb-16 shadow-[0px_4px_4px_0px_#00000008] cursor-pointer hover:bg-white/95 transition-colors">
              <div className="flex items-start justify-between gap-16">
                <div className="shrink-0">
                  <h2 className="text-2xl font-bold mb-5">Consistency is Key</h2>

                  {streakLoading ? (
                    <div className="flex gap-4">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
                          <div className="w-4 h-3 rounded bg-gray-100 animate-pulse" />
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

                {/* Streak badge */}
                <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl border border-[#D2D9DF] bg-white shrink-0">
                  <FlameIcon size={38} />
                  {streakLoading ? (
                    <div className="animate-pulse bg-gray-200 rounded h-7 w-8" />
                  ) : (
                    <span className="text-2xl font-bold leading-none">
                      {currentStreak}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-6 mb-8">
          {/* Suggested Course */}
          <div>
            <h3 className="text-base lg:text-xl font-bold text-gray-900 mb-2 lg:mb-4">
              {course ? "Suggested Course" : "Browse Courses"}
            </h3>
            <Link
              href={
                course?.id
                  ? `/dashboard/learn/courses/${course.id}`
                  : "/dashboard/learn"
              }
            >
              <div className="bg-white rounded-2xl px-[28px] py-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-6 items-center">
                  <div className="flex-1">
                    {courseLoading ? (
                      <div className="space-y-2">
                        <TextSkeleton w="w-1/3" />
                        <TextSkeleton />
                        <TextSkeleton w="w-1/2" />
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] lg:text-sm text-gray-500 mb-2">
                          {course?.category?.name ?? "Featured Course"}
                        </p>
                        <p className="text-xs lg:text-base font-bold text-gray-900 leading-tight mb-2 lg:mb-4">
                          {course?.title ??
                            "Explore courses to grow in your faith."}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] lg:text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>
                            {course?.durationMinutes
                              ? `${course.durationMinutes} min`
                              : "Self-paced"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course?.coverImage ?? "/home-dashboard.jpg"}
                    alt="Course"
                    className="w-[120px] h-[120px] lg:w-[160px] lg:h-[160px] object-cover rounded-[20px] shrink-0"
                  />
                </div>
              </div>
            </Link>
          </div>

          {/* Today's Devotional */}
          <div>
            <h3 className="text-base lg:text-xl font-bold text-gray-900 mb-2 lg:mb-4">
              Today&apos;s Devotional
            </h3>
            <Link
              href={
                devotional?.id
                  ? `/dashboard/home/article/${devotional.id}`
                  : "/dashboard/buildup?tab=devotionals"
              }
            >
              <div className="bg-white rounded-2xl px-[28px] py-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex gap-6 items-center">
                  <div className="flex-1">
                    {devotionalLoading ? (
                      <div className="space-y-2">
                        <TextSkeleton w="w-1/3" />
                        <TextSkeleton />
                        <TextSkeleton w="w-1/2" />
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] lg:text-sm text-gray-500 mb-2">
                          {devotional?.category?.name ?? "Daily Devotional"}
                        </p>
                        <p className="text-xs lg:text-base font-bold text-gray-900 leading-tight mb-2 lg:mb-4">
                          {devotional?.title ??
                            devotional?.excerpt ??
                            "No devotional scheduled for today."}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] lg:text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>
                            {devotional?.estimatedMinutes
                              ? `${devotional.estimatedMinutes} min read`
                              : "5 min read"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={devotional?.coverImageUrl ?? "/DailyEdification2.png"}
                    alt="Devotional"
                    className="w-[120px] h-[120px] lg:w-[160px] lg:h-[160px] object-cover rounded-[20px] shrink-0"
                  />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Desktop featured article banner ── */}
        {devotional && (
          <div
            className="hidden lg:block relative rounded-2xl px-[30px] py-[75px] shadow-lg cursor-pointer overflow-hidden h-64"
            style={{
              backgroundImage: `url('/dashboard-gratitude.png')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="text-white">
              <h2 className="text-[20px] lg:text-[24px] font-bold mb-1 leading-none">
                {devotional.title}
              </h2>
              {devotional.excerpt && (
                <p className="text-sm lg:text-base mb-4 line-clamp-2 max-w-2xl">
                  {devotional.excerpt}
                </p>
              )}
              <Link href={`/dashboard/home/article/${devotional.id}`}>
                <button className="flex items-center gap-2 font-semibold hover:gap-3 transition-all">
                  <span className="text-[20px] leading-none">
                    Continue Reading
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HomePage;
