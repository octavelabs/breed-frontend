"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Play, Users, Lock, CheckCircle, UserRound } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import Link from "next/link";
import { courseService } from "@/lib/api-services";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  sortOrder: number;
  isPublished: boolean;
  isFree?: boolean;
}

interface CourseAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
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
  isEnrolled?: boolean;
  progressPercent?: number;
  category?: { name: string } | null;
  author?: CourseAuthor | null;
  lessons?: Lesson[];
}

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

// ── Page ──────────────────────────────────────────────────────────────────────

const CourseDetail: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    courseService
      .getById(courseId)
      .then((res: unknown) => {
        const data = res as Course;
        setCourse(data);
        setEnrolled(data.isEnrolled ?? false);
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleEnroll = async (firstLessonId?: string) => {
    if (enrolled && firstLessonId) {
      router.push(`/dashboard/learn/materials/${firstLessonId}`);
      return;
    }

    setEnrolling(true);
    setEnrollError(null);
    try {
      await courseService.enroll(courseId);
      setEnrolled(true);
      if (firstLessonId) {
        router.push(`/dashboard/learn/materials/${firstLessonId}`);
      }
    } catch (err: unknown) {
      // If already enrolled, still navigate
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("already enrolled") || (err as any)?.response?.status === 409) {
        setEnrolled(true);
        if (firstLessonId) router.push(`/dashboard/learn/materials/${firstLessonId}`);
      } else {
        setEnrollError("Failed to enrol. Please try again.");
      }
    } finally {
      setEnrolling(false);
    }
  };

  const lessons = course?.lessons ?? [];
  const firstLesson = lessons[0];
  const level = course?.level ?? "BEGINNER";
  const authorName = course?.author
    ? `${course.author.firstName} ${course.author.lastName}`
    : null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6 p-6">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="flex gap-8">
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
            <div className="w-1/2 h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <BookOpen size={36} className="text-gray-300" />
          <p className="text-gray-500">Course not found.</p>
          <button onClick={() => router.back()} className="text-[#870BD6] text-sm underline">
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto px-4 lg:px-0">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title + badges */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h1 className="text-[24px] lg:text-[32px] leading-none font-bold">{course.title}</h1>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${levelColor[level] ?? levelColor.BEGINNER}`}>
            {levelLabel[level] ?? level}
          </span>
          {course.isFree && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]">
              Free
            </span>
          )}
        </div>

        {/* Course header */}
        <div className="flex flex-col lg:flex-row gap-10 mb-10">
          <div className="w-full lg:w-1/2 text-[#60666B] text-base">
            {course.category?.name && (
              <p className="text-xs font-semibold text-[#870BD6] mb-3 uppercase tracking-wide">
                {course.category.name}
              </p>
            )}
            <p className="mb-4 leading-relaxed">{course.description ?? "No description provided."}</p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
              <span className="flex items-center gap-1.5">
                <BookOpen size={15} />
                {lessons.length} lesson{lessons.length !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={15} />
                {course.enrollmentCount ?? 0} enrolled
              </span>
            </div>

            {/* Author */}
            {course.author && (
              <Link
                href={`/dashboard/learn/preacher/${course.author.id}`}
                className="inline-flex items-center gap-2.5 mt-1 group"
              >
                <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm flex-shrink-0">
                  {course.author.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.author.avatarUrl}
                      alt={authorName ?? ""}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    (authorName?.charAt(0) ?? "P")
                  )}
                </div>
                <div>
                  <p className="text-[13px] text-[#60666B]">Course by</p>
                  <p className="text-sm font-semibold text-[#870BD6] group-hover:underline">
                    {authorName}
                  </p>
                </div>
              </Link>
            )}

            {/* Enroll / Start Learning */}
            <div className="mt-6">
              {enrollError && (
                <p className="text-red-500 text-sm mb-2">{enrollError}</p>
              )}
              <button
                onClick={() => handleEnroll(firstLesson?.id)}
                disabled={enrolling}
                className="flex items-center gap-2 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white px-8 py-3 rounded-full font-semibold transition-opacity disabled:opacity-60"
              >
                {enrolling ? (
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {enrolled ? "Continue Learning" : "Start Learning"}
              </button>
              {enrolled && (
                <p className="flex items-center gap-1 text-[#067647] text-xs mt-2">
                  <CheckCircle size={12} /> You&apos;re enrolled in this course
                </p>
              )}
            </div>
          </div>

          {/* Cover image */}
          <div className="w-full lg:w-1/2 h-full max-h-[320px] rounded-2xl overflow-hidden bg-[#180426] flex items-center justify-center">
            {course.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen size={64} className="text-white opacity-10" />
            )}
          </div>
        </div>

        {/* Lessons list */}
        <div>
          <h2 className="text-[20px] font-bold mb-6 border-b border-[#D2D9DF] pb-3">
            Lessons · {lessons.length}
          </h2>

          {lessons.length === 0 ? (
            <p className="text-[#60666B] text-sm py-8 text-center">
              No lessons available yet. Check back soon.
            </p>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden lg:flex flex-col gap-6">
                {lessons.map((lesson, idx) => {
                  const isFirst = idx === 0;
                  const canAccess = enrolled || lesson.isFree || isFirst;
                  return (
                    <div key={lesson.id} className="flex gap-5 px-2">
                      <div className="w-[80px] h-[80px] rounded-xl bg-[#E7C8FF] flex items-center justify-center flex-shrink-0 text-[#870BD6] text-2xl font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-[#60666B] mb-1 font-medium uppercase tracking-wide">
                          Lesson {idx + 1}
                        </p>
                        <h3 className="font-semibold text-gray-900 mb-1">{lesson.title}</h3>
                        {lesson.description && (
                          <p className="text-sm text-[#60666B] mb-3 line-clamp-2">{lesson.description}</p>
                        )}
                        {canAccess ? (
                          <button
                            onClick={() => handleEnroll(lesson.id)}
                            disabled={enrolling}
                            className="flex items-center gap-2 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white px-5 py-2 rounded-full text-sm font-medium transition-opacity disabled:opacity-60"
                          >
                            <Play className="w-3.5 h-3.5" />
                            {isFirst && !enrolled ? "Start Learning" : "Continue"}
                          </button>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[#60666B] text-sm">
                            <Lock size={13} />
                            Enrol to unlock
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile */}
              <div className="flex flex-col gap-4 lg:hidden">
                {lessons.map((lesson, idx) => {
                  const isFirst = idx === 0;
                  const canAccess = enrolled || lesson.isFree || isFirst;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => canAccess && handleEnroll(lesson.id)}
                      disabled={!canAccess || enrolling}
                      className={`flex flex-col items-center w-1/2 ${(idx + 1) % 2 === 0 ? "ml-auto" : ""}`}
                    >
                      <div
                        className={`w-[80px] h-[80px] rounded-full mb-2 flex justify-center items-center text-[40px] font-bold ${
                          canAccess
                            ? "text-[#5B26B1] bg-[#FBF6FF] border-2 border-[#5B26B1]"
                            : "bg-[#D2D9DF] text-[#60666B]"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <p className={`text-sm text-center ${canAccess ? "text-black" : "text-[#D2D9DF]"}`}>
                        {lesson.title}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
