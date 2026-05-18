"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { courseService, userService } from "@/lib/api-services";
import { ArrowLeft, BookOpen, Users, Check, UserPlus } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Preacher {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  churchName?: string | null;
  country?: string | null;
  city?: string | null;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  level?: string;
  isFree?: boolean;
  coverImageUrl?: string | null;
  enrollmentCount?: number;
  lessonCount?: number;
  category?: { name: string } | null;
}

// ── Level helpers ─────────────────────────────────────────────────────────────

const levelLabel: Record<string, string> = {
  BEGINNER: "Foundational", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced",
};
const levelColor: Record<string, string> = {
  BEGINNER:     "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  INTERMEDIATE: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  ADVANCED:     "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
};

// ── Course Card ───────────────────────────────────────────────────────────────

const CourseCard = ({ course }: { course: Course }) => {
  const level = course.level ?? "BEGINNER";
  return (
    <Link href={`/dashboard/learn/${course.id}/chapters/${course.id}`}>
      <div className="border border-[#E2E3E5] rounded-2xl bg-white hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col group">
        <div className="bg-gray-100 rounded-t-2xl p-3">
          <div className="relative bg-[#180426] rounded-xl h-[140px] overflow-hidden flex items-center justify-center">
            {course.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen size={32} className="text-white opacity-20" />
            )}
            <span className={`absolute top-2.5 left-2.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${levelColor[level] ?? levelColor.BEGINNER}`}>
              {levelLabel[level] ?? level}
            </span>
            {course.isFree && (
              <span className="absolute top-2.5 right-2.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]">
                Free
              </span>
            )}
          </div>
        </div>
        <div className="px-4 pt-3 pb-4 flex-1 flex flex-col">
          {course.category?.name && (
            <p className="text-[11px] text-[#870BD6] font-semibold mb-1 uppercase tracking-wide">{course.category.name}</p>
          )}
          <h3 className="text-sm font-bold text-[#180426] leading-snug mb-auto line-clamp-2 group-hover:text-[#870BD6] transition-colors">
            {course.title}
          </h3>
          <div className="flex items-center gap-3 text-[12px] text-[#60666B] mt-3">
            <span className="flex items-center gap-1"><BookOpen size={12} /> {course.lessonCount ?? 0} lessons</span>
            <span className="flex items-center gap-1"><Users size={12} /> {course.enrollmentCount ?? 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const PreacherProfilePage = () => {
  const params     = useParams();
  const router     = useRouter();
  const { user }   = useAuth();
  const preacherId = params.preacherId as string;

  const [preacher,  setPreacher]  = useState<Preacher | null>(null);
  const [courses,   setCourses]   = useState<Course[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"courses" | "about">("courses");

  const isOwnProfile = user?.id === preacherId;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, coursesRes] = await Promise.all([
        userService.getPublicProfile(preacherId) as Promise<Preacher>,
        courseService.getAll({ authorId: preacherId, limit: 30 }) as Promise<unknown>,
      ]);
      setPreacher(profileRes);
      const r = coursesRes as { data?: Course[] };
      setCourses(Array.isArray(coursesRes) ? (coursesRes as Course[]) : (r.data ?? []));
    } catch {
      setPreacher(null);
    } finally {
      setLoading(false);
    }
  }, [preacherId]);

  useEffect(() => { load(); }, [load]);

  const handleFollow = async () => {
    if (!preacher) return;
    const wasFollowing = preacher.isFollowing;
    setPreacher((prev) =>
      prev ? { ...prev, isFollowing: !wasFollowing, followersCount: (prev.followersCount ?? 0) + (wasFollowing ? -1 : 1) } : prev
    );
    setFollowing(true);
    try {
      if (wasFollowing) await userService.unfollow(preacherId);
      else              await userService.follow(preacherId);
    } catch {
      setPreacher((prev) =>
        prev ? { ...prev, isFollowing: wasFollowing, followersCount: (prev.followersCount ?? 0) + (wasFollowing ? 1 : -1) } : prev
      );
    } finally {
      setFollowing(false);
    }
  };

  const fullName    = preacher ? `${preacher.firstName} ${preacher.lastName}` : "Preacher";
  const initial     = preacher?.firstName?.charAt(0)?.toUpperCase() ?? "P";
  const totalEnroll = courses.reduce((s, c) => s + (c.enrollmentCount ?? 0), 0);
  const location    = [preacher?.city, preacher?.country].filter(Boolean).join(", ");

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout custom={true}>
        <div>
          <div className="h-48 bg-[#870BD6] animate-pulse" />
          <div className="px-4 md:px-12 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-[#E2E3E5] rounded-2xl animate-pulse">
                  <div className="bg-gray-100 rounded-t-2xl p-3"><div className="bg-gray-200 rounded-xl h-[140px]" /></div>
                  <div className="px-4 py-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout custom={true}>
      <div className="border-l border-[#D2D9DF]">

        {/* ── Banner ──────────────────────────────────────────────────────── */}
        <div
          className="bg-[#870BD6] h-48 relative"
          style={{ backgroundImage: "url('/dashboard-header.png')" }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 cursor-pointer px-4 md:px-12 pt-16 relative z-20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_1px,_transparent_1px)] [background-size:20px_20px]" />
        </div>

        {/* ── Profile header ───────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 lg:gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar overlapping the banner */}
            <div className="w-[120px] lg:w-[150px] h-[120px] lg:h-[150px] rounded-full bg-[#E7C8FF] flex items-center justify-center shrink-0 border-[3px] border-white overflow-hidden -mt-20 relative z-20 shadow-lg">
              {preacher?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preacher.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#870BD6] text-4xl font-bold">{initial}</span>
              )}
            </div>

            {/* Name + location + stats (large screens) */}
            <div className="hidden lg:block">
              <h2 className="text-[24px] font-bold text-[#180426]">{fullName}</h2>
              {(preacher?.churchName || location) && (
                <p className="text-[#60666B] text-sm">
                  {preacher?.churchName}
                  {preacher?.churchName && location ? ` · ${location}` : location}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-sm text-[#60666B]">
                  <span className="font-bold text-[#180426]">{(preacher?.followersCount ?? 0).toLocaleString()}</span> Followers
                </span>
                <span className="w-1 h-1 rounded-full bg-[#C4B5FD]" />
                <span className="text-sm text-[#60666B]">
                  <span className="font-bold text-[#180426]">{courses.length}</span> Courses
                </span>
                <span className="w-1 h-1 rounded-full bg-[#C4B5FD]" />
                <span className="text-sm text-[#60666B]">
                  <span className="font-bold text-[#180426]">{totalEnroll.toLocaleString()}</span> Enrolled
                </span>
              </div>
            </div>
          </div>

          {/* Name + location + stats (small screens) */}
          <div className="lg:hidden">
            <h2 className="text-[24px] font-bold text-[#180426]">{fullName}</h2>
            {preacher?.churchName && <p className="text-[#60666B] text-sm">{preacher.churchName}</p>}
            {!preacher?.churchName && location && <p className="text-[#60666B] text-sm">{location}</p>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm text-[#60666B]">
                <span className="font-bold text-[#180426]">{(preacher?.followersCount ?? 0).toLocaleString()}</span> Followers
              </span>
              <span className="w-1 h-1 rounded-full bg-[#C4B5FD]" />
              <span className="text-sm text-[#60666B]">
                <span className="font-bold text-[#180426]">{courses.length}</span> Courses
              </span>
              <span className="w-1 h-1 rounded-full bg-[#C4B5FD]" />
              <span className="text-sm text-[#60666B]">
                <span className="font-bold text-[#180426]">{totalEnroll.toLocaleString()}</span> Enrolled
              </span>
            </div>
          </div>

          {/* Follow button */}
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              disabled={following}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all disabled:opacity-60 shrink-0 ${
                preacher?.isFollowing
                  ? "bg-white border border-[#D1D5DB] text-[#374151] hover:bg-gray-50"
                  : "bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white"
              }`}
            >
              {following ? (
                <span className="inline-block w-4 h-4 rounded-full border-t-2 border-current animate-spin" />
              ) : preacher?.isFollowing ? (
                <Check size={15} />
              ) : (
                <UserPlus size={15} />
              )}
              {preacher?.isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 pt-2">
          <div className="flex gap-8 border-b border-[#D2D9DF]">
            {(["courses", "about"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-[#870BD6] text-[#870BD6] font-semibold text-[18px]"
                    : "text-[#60666B]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="px-4 lg:px-12 py-6">

          {/* Courses tab */}
          {activeTab === "courses" && (
            courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-[#E2E3E5] rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                  <BookOpen size={22} className="text-[#870BD6]" />
                </div>
                <p className="text-sm font-semibold text-gray-700">No published courses yet</p>
                <p className="text-xs text-[#60666B] max-w-xs">
                  This creator hasn&apos;t published any courses yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => <CourseCard key={course.id} course={course} />)}
              </div>
            )
          )}

          {/* About tab */}
          {activeTab === "about" && (
            <div className="max-w-2xl w-full space-y-4 leading-relaxed">
              {preacher?.bio ? (
                <p className="text-[#60666B] text-sm whitespace-pre-wrap">{preacher.bio}</p>
              ) : (
                <p className="text-[#60666B] text-sm italic">No bio available yet.</p>
              )}
              {(preacher?.churchName || location) && (
                <div className="pt-4 border-t border-[#F0F2F4] space-y-2">
                  {preacher?.churchName && (
                    <p className="text-sm text-[#60666B]">
                      <span className="font-semibold text-[#180426]">Church: </span>
                      {preacher.churchName}
                    </p>
                  )}
                  {location && (
                    <p className="text-sm text-[#60666B]">
                      <span className="font-semibold text-[#180426]">Location: </span>
                      {location}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default PreacherProfilePage;
