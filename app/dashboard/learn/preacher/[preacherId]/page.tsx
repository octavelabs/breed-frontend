"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { courseService, userService } from "@/lib/api-services";
import { ArrowLeft, BookOpen, Users, Globe, Church, Check, UserPlus } from "lucide-react";
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

// ── Mini Course Card ──────────────────────────────────────────────────────────

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
  const params      = useParams();
  const router      = useRouter();
  const { user }    = useAuth();
  const preacherId  = params.preacherId as string;

  const [preacher,    setPreacher]    = useState<Preacher | null>(null);
  const [courses,     setCourses]     = useState<Course[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [following,   setFollowing]   = useState(false);   // loading state for follow action
  const [activeTab,   setActiveTab]   = useState<"courses" | "about">("courses");

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
      const list: Course[] = Array.isArray(coursesRes) ? (coursesRes as Course[]) : (r.data ?? []);
      setCourses(list);
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

    // Optimistic update
    setPreacher((prev) =>
      prev
        ? {
            ...prev,
            isFollowing:    !wasFollowing,
            followersCount: (prev.followersCount ?? 0) + (wasFollowing ? -1 : 1),
          }
        : prev,
    );

    setFollowing(true);
    try {
      if (wasFollowing) await userService.unfollow(preacherId);
      else              await userService.follow(preacherId);
    } catch {
      // Revert optimistic update on failure
      setPreacher((prev) =>
        prev
          ? {
              ...prev,
              isFollowing:    wasFollowing,
              followersCount: (prev.followersCount ?? 0) + (wasFollowing ? 1 : -1),
            }
          : prev,
      );
    } finally {
      setFollowing(false);
    }
  };

  const fullName    = preacher ? `${preacher.firstName} ${preacher.lastName}` : "Preacher";
  const initial     = preacher?.firstName?.charAt(0)?.toUpperCase() ?? "P";
  const totalEnroll = courses.reduce((s, c) => s + (c.enrollmentCount ?? 0), 0);

  // ── Skeleton ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout custom={true}>
        <div>
          <div className="h-[200px] bg-[#180426] animate-pulse" />
          <div className="px-4 lg:px-12 py-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-[#E2E3E5] rounded-2xl animate-pulse">
                  <div className="bg-gray-100 rounded-t-2xl p-3"><div className="bg-gray-200 rounded-xl h-[140px]" /></div>
                  <div className="px-4 py-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" /><div className="h-4 bg-gray-200 rounded w-3/4" />
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
      <div className="bg-white min-h-full pb-12">

        {/* ── Back ─────────────────────────────────────────────────────────── */}
        <div className="px-4 lg:px-12 pt-6 pb-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#60666B] hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
        </div>

        {/* ── Hero banner ──────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#180426] via-[#2D0C53] to-[#3D1472] px-4 lg:px-12 pt-10 pb-16 mt-4">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #870BD6 0%, transparent 60%)" }} />

          <div className="relative max-w-5xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-5">
            {/* Avatar */}
            <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-[#E7C8FF] flex items-center justify-center flex-shrink-0 border-4 border-white/20 overflow-hidden shadow-lg">
              {preacher?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preacher.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#870BD6] text-4xl font-bold">{initial}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left text-white pb-1">
              <p className="text-xs font-bold text-[#D49CFD] uppercase tracking-widest mb-1">
                Course Creator
              </p>
              <h1 className="text-2xl lg:text-[28px] font-bold mb-1">{fullName}</h1>

              {preacher?.churchName && (
                <p className="flex items-center gap-1.5 justify-center sm:justify-start text-[#C4B5FD] text-sm mb-0.5">
                  <Church size={13} /> {preacher.churchName}
                </p>
              )}
              {(preacher?.city || preacher?.country) && (
                <p className="flex items-center gap-1.5 justify-center sm:justify-start text-[#C4B5FD] text-sm">
                  <Globe size={13} />
                  {[preacher?.city, preacher?.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>

            {/* Follow button */}
            {!isOwnProfile && (
              <div className="pb-1">
                <button
                  onClick={handleFollow}
                  disabled={following}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all disabled:opacity-60 ${
                    preacher?.isFollowing
                      ? "bg-white/10 border border-white/30 text-white hover:bg-white/20"
                      : "bg-white text-[#870BD6] hover:bg-[#F5EBFF]"
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
              </div>
            )}
          </div>
        </div>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="bg-[#FBF6FF] border-b border-[#E7C8FF] px-4 lg:px-12 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-center sm:justify-start gap-8 lg:gap-12 flex-wrap">
            {[
              { value: preacher?.followersCount ?? 0, label: "Followers" },
              { value: courses.length,                label: "Courses" },
              { value: totalEnroll,                   label: "Students" },
            ].map(({ value, label }, i, arr) => (
              <React.Fragment key={label}>
                <div className="text-center">
                  <p className="text-xl font-bold text-[#180426]">{value.toLocaleString()}</p>
                  <p className="text-[12px] text-[#60666B]">{label}</p>
                </div>
                {i < arr.length - 1 && <div className="w-px h-7 bg-[#E7C8FF]" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <div className="border-b border-[#E2E3E5] px-4 lg:px-12">
          <div className="max-w-5xl mx-auto flex gap-6">
            {(["courses", "about"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-[#870BD6] text-[#870BD6]"
                    : "border-transparent text-[#60666B] hover:text-[#180426]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ──────────────────────────────────────────────────── */}
        <div className="px-4 lg:px-12 pt-8 max-w-5xl mx-auto">
          {/* Courses tab */}
          {activeTab === "courses" && (
            <>
              <h2 className="text-base font-semibold text-[#180426] mb-5">
                Courses by {fullName}
              </h2>
              {courses.length === 0 ? (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {courses.map((course) => <CourseCard key={course.id} course={course} />)}
                </div>
              )}
            </>
          )}

          {/* About tab */}
          {activeTab === "about" && (
            <div className="max-w-2xl">
              <h2 className="text-base font-semibold text-[#180426] mb-4">About {fullName}</h2>
              {preacher?.bio ? (
                <p className="text-[#60666B] text-sm leading-relaxed whitespace-pre-wrap">
                  {preacher.bio}
                </p>
              ) : (
                <p className="text-[#60666B] text-sm italic">No bio available yet.</p>
              )}

              {(preacher?.churchName || preacher?.city || preacher?.country) && (
                <div className="mt-8 space-y-3">
                  <h3 className="text-sm font-semibold text-[#180426]">Details</h3>
                  {preacher?.churchName && (
                    <div className="flex items-center gap-2 text-sm text-[#60666B]">
                      <Church size={15} className="text-[#870BD6]" />
                      {preacher.churchName}
                    </div>
                  )}
                  {(preacher?.city || preacher?.country) && (
                    <div className="flex items-center gap-2 text-sm text-[#60666B]">
                      <Globe size={15} className="text-[#870BD6]" />
                      {[preacher?.city, preacher?.country].filter(Boolean).join(", ")}
                    </div>
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
