"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { courseService } from "@/lib/api-services";
import { ArrowLeft, BookOpen, Users, Globe, Church, UserRound } from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  churchName?: string | null;
  country?: string | null;
  city?: string | null;
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
  author?: Author | null;
}

// ── Level maps ────────────────────────────────────────────────────────────────

const levelLabel: Record<string, string> = {
  BEGINNER: "Foundational",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

const levelColor: Record<string, string> = {
  BEGINNER:     "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  INTERMEDIATE: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  ADVANCED:     "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
};

// ── Mini Course Card ──────────────────────────────────────────────────────────

const MiniCourseCard = ({ course }: { course: Course }) => {
  const level = course.level ?? "BEGINNER";
  return (
    <Link href={`/dashboard/learn/${course.id}/chapters/${course.id}`}>
      <div className="border border-[#E2E3E5] rounded-[16px] bg-white hover:shadow-md transition-shadow cursor-pointer flex flex-col">
        <div className="bg-gray-100 rounded-t-[16px] p-[14px]">
          <div className="relative bg-[#180426] rounded-[12px] h-[140px] overflow-hidden flex items-center justify-center">
            {course.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen size={36} className="text-white opacity-20" />
            )}
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
        <div className="px-4 pt-3 pb-4">
          {course.category?.name && (
            <p className="text-[11px] text-[#870BD6] font-medium mb-1">{course.category.name}</p>
          )}
          <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2 line-clamp-2">{course.title}</h3>
          <div className="flex items-center gap-3 text-[13px] text-[#60666B]">
            <span className="flex items-center gap-1">
              <BookOpen size={12} /> {course.lessonCount ?? 0} lessons
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} /> {course.enrollmentCount ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const PreacherProfilePage = () => {
  const params = useParams();
  const router = useRouter();
  const preacherId = params.preacherId as string;

  const [courses, setCourses] = useState<Course[]>([]);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService
      .getAll({ authorId: preacherId, limit: 20 })
      .then((res: unknown) => {
        const r = res as { data?: Course[] };
        const list: Course[] = Array.isArray(res) ? (res as Course[]) : (r.data ?? []);
        setCourses(list);
        // Extract author info from first course
        if (list[0]?.author) setAuthor(list[0].author as Author);
      })
      .catch(() => { setCourses([]); setAuthor(null); })
      .finally(() => setLoading(false));
  }, [preacherId]);

  const fullName = author ? `${author.firstName} ${author.lastName}` : "Preacher";
  const initial = author?.firstName?.charAt(0)?.toUpperCase() ?? "P";

  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollmentCount ?? 0), 0);
  const totalLessons = courses.reduce((sum, c) => sum + (c.lessonCount ?? 0), 0);

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white min-h-full pb-12">

        {/* Back */}
        <div className="px-4 lg:px-12 pt-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#60666B] hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
        </div>

        {/* Hero banner */}
        <div className="bg-gradient-to-br from-[#180426] to-[#3D1472] px-4 lg:px-12 pb-10 pt-4">
          <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
            {/* Avatar */}
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-[#E7C8FF] flex items-center justify-center flex-shrink-0 border-4 border-white/20 overflow-hidden">
              {author?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#870BD6] text-4xl font-bold">{initial}</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left text-white">
              <p className="text-xs font-semibold text-[#D49CFD] uppercase tracking-widest mb-1">Course Creator</p>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">{loading ? "Loading…" : fullName}</h1>

              {author?.churchName && (
                <p className="flex items-center gap-1.5 justify-center lg:justify-start text-[#C4B5FD] text-sm mb-1">
                  <Church size={14} />
                  {author.churchName}
                </p>
              )}
              {(author?.city || author?.country) && (
                <p className="flex items-center gap-1.5 justify-center lg:justify-start text-[#C4B5FD] text-sm mb-4">
                  <Globe size={14} />
                  {[author.city, author.country].filter(Boolean).join(", ")}
                </p>
              )}

              {author?.bio && (
                <p className="text-white/75 text-sm leading-relaxed max-w-lg">{author.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="bg-[#FBF6FF] border-b border-[#E7C8FF] px-4 lg:px-12 py-5">
          <div className="max-w-4xl mx-auto flex items-center justify-center lg:justify-start gap-10">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#180426]">{loading ? "—" : courses.length}</p>
              <p className="text-[13px] text-[#60666B]">Courses</p>
            </div>
            <div className="w-px h-8 bg-[#E7C8FF]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[#180426]">{loading ? "—" : totalLessons}</p>
              <p className="text-[13px] text-[#60666B]">Lessons</p>
            </div>
            <div className="w-px h-8 bg-[#E7C8FF]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[#180426]">{loading ? "—" : totalEnrollments}</p>
              <p className="text-[13px] text-[#60666B]">Enrolments</p>
            </div>
          </div>
        </div>

        {/* Courses grid */}
        <div className="px-4 lg:px-12 pt-8 max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold text-[#180426] mb-5">
            Courses by {loading ? "…" : fullName}
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-[#E2E3E5] rounded-[16px] animate-pulse">
                  <div className="bg-gray-100 rounded-t-[16px] p-[14px]">
                    <div className="bg-gray-200 rounded-[12px] h-[140px]" />
                  </div>
                  <div className="px-4 py-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                <UserRound size={24} color="#870BD6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No published courses yet</p>
              <p className="text-[13px] text-[#60666B] max-w-xs">
                This preacher hasn&apos;t published any courses yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <MiniCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PreacherProfilePage;
