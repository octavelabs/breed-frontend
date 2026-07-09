"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft, BookOpen, Play, Users, Lock, CheckCircle,
  ChevronDown, ChevronRight, UserRound,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import Link from "next/link";
import { courseService } from "@/lib/api-services";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApiLesson {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  sortOrder: number;
  isPublished: boolean;
  isFree?: boolean;
}

interface ApiChapter {
  id: string;
  editorId: string;
  title: string;
  sortOrder: number;
  lessons: ApiLesson[];
}

interface CourseAuthor {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  churchName?: string | null;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  level?: string;
  isFree?: boolean;
  coverImageUrl?: string | null;
  enrollmentCount?: number;
  isEnrolled?: boolean;
  progressPercent?: number;
  category?: { name: string } | null;
  author?: CourseAuthor | null;
  chapters?: ApiChapter[];
  lessons?: ApiLesson[];
}

const levelLabel: Record<string, string> = {
  BEGINNER:     "Foundational",
  INTERMEDIATE: "Intermediate",
  ADVANCED:     "Advanced",
};
const levelColor: Record<string, string> = {
  BEGINNER:     "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  INTERMEDIATE: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  ADVANCED:     "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
};

function buildChapters(course: Course): { id: string; name: string; lessons: ApiLesson[] }[] {
  if (course.chapters && course.chapters.length > 0) {
    return course.chapters.map((ch) => ({ id: ch.id, name: ch.title, lessons: ch.lessons ?? [] }));
  }
  const flat = course.lessons ?? [];
  if (flat.length === 0) return [];
  return [{ id: "ch-fallback", name: "Chapter 1", lessons: flat }];
}

// ── Lesson Item ───────────────────────────────────────────────────────────────

const LessonItem = ({
  lesson,
  globalIdx,
  enrolled,
  enrolling,
  completed,
  onEnroll,
}: {
  lesson: ApiLesson;
  globalIdx: number;
  enrolled: boolean;
  enrolling: boolean;
  completed: boolean;
  onEnroll: (id: string) => void;
}) => {
  const isFirst   = globalIdx === 0;
  const canAccess = enrolled || lesson.isFree || isFirst;

  return (
    <div className="flex items-start gap-4 py-4 border-b border-[#F0F2F4] last:border-0 transition-colors">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${
          completed ? "bg-[#ECFDF3] text-[#067647]" : canAccess ? "bg-[#F5EBFF] text-[#870BD6]" : "bg-[#F0F2F4] text-[#B0B7C3]"
        }`}
      >
        {completed ? <CheckCircle size={18} /> : globalIdx + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#B0B7C3] mb-0.5">
          Lesson {globalIdx + 1}
        </p>
        <h4 className={`font-semibold text-sm leading-snug mb-2 ${canAccess ? "text-[#180426]" : "text-[#B0B7C3]"}`}>
          {lesson.title}
        </h4>
        {canAccess ? (
          <button
            onClick={() => onEnroll(lesson.id)}
            disabled={enrolling}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-b from-[#A967F1] to-[#5B26B1] px-4 py-1.5 rounded-full disabled:opacity-60 transition-opacity"
          >
            {enrolling ? (
              <span className="inline-block w-3 h-3 rounded-full border-t-2 border-white animate-spin" />
            ) : (
              <Play size={11} />
            )}
            {isFirst && !enrolled ? "Start Learning" : "Continue"}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-[#B0B7C3]">
            <Lock size={11} /> Enrol to unlock
          </span>
        )}
      </div>
    </div>
  );
};

// ── Chapter Accordion (used only when there are 2+ chapters) ──────────────────

const ChapterSection = ({
  chapter,
  chapterIndex,
  enrolled,
  enrolling,
  completedLessonIds,
  globalLessonOffset,
  onEnroll,
}: {
  chapter: { id: string; name: string; lessons: ApiLesson[] };
  chapterIndex: number;
  enrolled: boolean;
  enrolling: boolean;
  completedLessonIds: string[];
  globalLessonOffset: number;
  onEnroll: (id: string) => void;
}) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-[#E2E3E5] rounded-2xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#FAFAFA] hover:bg-[#F5F0FF] transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="w-8 h-8 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] text-xs font-bold flex-shrink-0">
            {chapterIndex + 1}
          </div>
          <div>
            <p className="font-semibold text-[#180426] text-sm leading-tight">{chapter.name}</p>
            <p className="text-xs text-[#60666B] mt-0.5">
              {chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {open
          ? <ChevronDown size={18} className="text-[#870BD6] flex-shrink-0" />
          : <ChevronRight size={18} className="text-[#60666B] flex-shrink-0" />
        }
      </button>

      {open && (
        <div className="px-5">
          {chapter.lessons.length === 0 ? (
            <p className="py-4 text-sm text-[#60666B] italic text-center">No lessons in this chapter yet.</p>
          ) : (
            chapter.lessons.map((lesson, i) => (
              <LessonItem
                key={lesson.id}
                lesson={lesson}
                globalIdx={globalLessonOffset + i}
                enrolled={enrolled}
                enrolling={enrolling}
                completed={completedLessonIds.includes(lesson.id)}
                onEnroll={onEnroll}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const CourseDetail: React.FC = () => {
  const router   = useRouter();
  const params   = useParams();
  const courseId = params.courseId as string;

  const [course,              setCourse]              = useState<Course | null>(null);
  const [loading,             setLoading]             = useState(true);
  const [enrolling,           setEnrolling]           = useState(false);
  const [enrolled,            setEnrolled]            = useState(false);
  const [enrollError,         setEnrollError]         = useState<string | null>(null);
  const [completedLessonIds,  setCompletedLessonIds]  = useState<string[]>([]);

  useEffect(() => {
    courseService
      .getById(courseId)
      .then((res: unknown) => {
        const data = res as Course;
        setCourse(data);
        const isEnrolled = data.isEnrolled ?? false;
        setEnrolled(isEnrolled);
        if (isEnrolled) {
          courseService.getProgress(courseId).then((pr: unknown) => {
            const p = pr as { completedLessonIds?: string[] };
            setCompletedLessonIds(p?.completedLessonIds ?? []);
          }).catch(() => {});
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleEnroll = async (lessonId?: string) => {
    const target = `/dashboard/learn/materials/${courseId}${lessonId ? `?lesson=${lessonId}` : ''}`;
    if (enrolled) {
      router.push(target);
      return;
    }
    setEnrolling(true);
    setEnrollError(null);
    try {
      await courseService.enroll(courseId);
      setEnrolled(true);
      router.push(target);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (
        msg.toLowerCase().includes("already enrolled") ||
        (err as { response?: { status?: number } })?.response?.status === 409
      ) {
        setEnrolled(true);
        router.push(target);
      } else {
        setEnrollError("Failed to enrol. Please try again.");
      }
    } finally {
      setEnrolling(false);
    }
  };

  const chapters    = course ? buildChapters(course) : [];
  const allLessons  = chapters.flatMap((ch) => ch.lessons);
  const firstLesson = allLessons[0];
  const level       = course?.level ?? "BEGINNER";
  const authorName  = course?.author
    ? `${course.author.firstName} ${course.author.lastName}`
    : null;

  let lessonOffset = 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="flex gap-8">
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="w-1/2 h-56 bg-gray-200 rounded-2xl" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-200 rounded-2xl" />)}
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
      <div className="pb-16">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-10 mb-10">
          {/* Left: meta */}
          <div className="w-full lg:w-1/2">
            {/* Title + badges on the same line */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl lg:text-[28px] font-bold text-[#180426] leading-tight">
                {course.title}
              </h1>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${levelColor[level] ?? levelColor.BEGINNER}`}>
                {levelLabel[level] ?? level}
              </span>
              {course.isFree && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]">
                  Free
                </span>
              )}
            </div>

            {/* Category */}
            {course.category?.name && (
              <p className="text-xs font-semibold text-[#870BD6] mb-3 uppercase tracking-widest">
                {course.category.name}
              </p>
            )}

            {/* Description */}
            <p className="text-[#60666B] text-sm leading-relaxed mb-5">
              {course.description ?? "No description provided."}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#60666B] mb-5">
              <span className="flex items-center gap-1.5">
                <BookOpen size={15} />
                {allLessons.length} lesson{allLessons.length !== 1 ? "s" : ""}
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
                className="inline-flex items-center gap-2.5 mb-6 group"
              >
                <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm flex-shrink-0 overflow-hidden">
                  {course.author.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={course.author.avatarUrl} alt={authorName ?? ""} className="w-full h-full object-cover" />
                  ) : (
                    authorName?.charAt(0) ?? "P"
                  )}
                </div>
                <div>
                  <p className="text-[12px] text-[#60666B]">Course by</p>
                  <p className="text-sm font-semibold text-[#870BD6] group-hover:underline">{authorName}</p>
                </div>
              </Link>
            )}

            {/* CTA */}
            <div>
              {enrollError && <p className="text-red-500 text-sm mb-2">{enrollError}</p>}
              <button
                onClick={() => handleEnroll(firstLesson?.id)}
                disabled={enrolling}
                className="flex items-center gap-2 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white px-8 py-3 rounded-full font-semibold transition-opacity disabled:opacity-60"
              >
                {enrolling ? (
                  <span className="inline-block w-4 h-4 rounded-full border-t-2 border-white animate-spin" />
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

          {/* Right: cover image */}
          <div className="w-full lg:w-1/2 max-h-[320px] rounded-2xl overflow-hidden bg-[#180426] flex items-center justify-center flex-shrink-0">
            {course.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen size={64} className="text-white opacity-10" />
            )}
          </div>
        </div>

        {/* ── Lessons section ───────────────────────────────────────────────── */}
        <div>
          <h2 className="text-lg font-bold text-[#180426] mb-5">
            Lessons &middot; {allLessons.length}
          </h2>

          {chapters.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-14 text-center border border-[#E2E3E5] rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                <UserRound size={22} className="text-[#870BD6]" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No lessons yet</p>
              <p className="text-xs text-[#60666B] max-w-xs">
                The creator hasn&apos;t published lessons yet. Check back soon!
              </p>
            </div>
          ) : chapters.length === 1 ? (
            // Single chapter → flat list, no accordion wrapper
            <div>
              {chapters[0].lessons.map((lesson, i) => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  globalIdx={i}
                  enrolled={enrolled}
                  enrolling={enrolling}
                  completed={completedLessonIds.includes(lesson.id)}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>
          ) : (
            // Multiple chapters → accordion per chapter
            chapters.map((chapter, chapterIndex) => {
              const offset = lessonOffset;
              lessonOffset += chapter.lessons.length;
              return (
                <ChapterSection
                  key={chapter.id}
                  chapter={chapter}
                  chapterIndex={chapterIndex}
                  enrolled={enrolled}
                  enrolling={enrolling}
                  completedLessonIds={completedLessonIds}
                  globalLessonOffset={offset}
                  onEnroll={handleEnroll}
                />
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
