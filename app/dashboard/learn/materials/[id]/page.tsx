'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import StepProgress from '@/app/components/StepProgress';
import VideoPlayer from '@/app/components/upload/VideoPlayer';
import { courseService } from '@/lib/api-services';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  description?: string | null;
  content?: string | null;
  videoUrl?: string | null;
  videoThumbnailUrl?: string | null;
  sortOrder: number;
  isPublished: boolean;
  chapterTitle?: string;
  quiz?: { id: string } | null;
}

interface Chapter {
  id: string;
  title: string;
  sortOrder: number;
  lessons: Omit<Lesson, 'chapterTitle'>[];
}

interface Course {
  id: string;
  title: string;
  chapters?: Chapter[];
  lessons?: Omit<Lesson, 'chapterTitle'>[];
  quizzes?: { id: string }[];
}

// ── Lesson content renderer ───────────────────────────────────────────────────

function LessonContent({ lesson }: { lesson: Lesson }) {
  return (
    <div className="flex flex-col gap-6">
      {lesson.videoUrl && (
        <VideoPlayer
          src={lesson.videoUrl}
          poster={lesson.videoThumbnailUrl ?? undefined}
          className="w-full max-w-3xl"
        />
      )}

      {lesson.description && !lesson.content && (
        <p className="text-[#60666B] text-sm leading-relaxed">{lesson.description}</p>
      )}

      {lesson.content ? (
        <div
          className="prose prose-sm max-w-none text-[#1A1A2E] leading-relaxed"
          // Content is preacher-authored rich text stored server-side
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      ) : !lesson.videoUrl ? (
        <p className="text-[#B0B7C3] text-sm italic">This lesson has no content yet.</p>
      ) : null}
    </div>
  );
}

// ── Inner page (needs useSearchParams inside Suspense) ────────────────────────

function CourseMaterialsInner() {
  const router       = useRouter();
  const { id }       = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const startLessonId = searchParams.get('lesson');

  const [course,  setCourse]  = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseService
      .getById(id)
      .then((res: unknown) => {
        const r = res as { data?: Course };
        setCourse(r.data ?? (res as Course));
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Flatten all lessons across chapters, preserving chapter title
  const allLessons: Lesson[] = useMemo(() => {
    if (!course) return [];
    if (course.chapters && course.chapters.length > 0) {
      return course.chapters
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .flatMap((ch) =>
          (ch.lessons ?? [])
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((l) => ({ ...l, chapterTitle: ch.title })),
        );
    }
    return (course.lessons ?? []).map((l) => ({ ...l, chapterTitle: undefined }));
  }, [course]);

  const initialStep = useMemo(() => {
    if (!startLessonId) return 0;
    const idx = allLessons.findIndex((l) => l.id === startLessonId);
    return idx >= 0 ? idx : 0;
  }, [startLessonId, allLessons]);

  const steps = useMemo(
    () =>
      allLessons.map((lesson) => ({
        subtitle: lesson.chapterTitle,
        title: lesson.title,
        content: <LessonContent lesson={lesson} />,
      })),
    [allLessons],
  );

  const handleNextClick = async (stepIndex: number): Promise<boolean | void> => {
    const lesson = allLessons[stepIndex];
    if (!lesson) return;

    // If this lesson has a quiz, route to it instead of advancing
    if (lesson.quiz?.id) {
      const nextLesson = allLessons[stepIndex + 1];
      const params = new URLSearchParams({ courseId: id, lessonId: lesson.id });
      if (nextLesson) params.set('nextLessonId', nextLesson.id);
      router.push(`/dashboard/learn/quiz/${lesson.quiz.id}?${params.toString()}`);
      return false;
    }

    try { await courseService.markLessonComplete(id, lesson.id); } catch {}
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6 max-w-3xl mx-auto pt-8">
          <div className="h-2 bg-gray-200 rounded-full w-full" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
      </DashboardLayout>
    );
  }

  if (!course || steps.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <p className="text-sm font-semibold text-gray-600">No lessons found for this course.</p>
          <button onClick={() => router.back()} className="text-[#870BD6] text-sm underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const hasQuiz = (course.quizzes?.length ?? 0) > 0;

  return (
    <DashboardLayout>
      <StepProgress
        steps={steps}
        initialStep={initialStep}
        onComplete={() => {
          const courseQuizId = course.quizzes?.[0]?.id;
          if (hasQuiz && courseQuizId) {
            router.push(`/dashboard/learn/quiz/${courseQuizId}?courseId=${id}`);
          } else {
            router.push(`/dashboard/learn/${id}/chapters/${id}`);
          }
        }}
        nextButtonText={(stepIndex) => allLessons[stepIndex]?.quiz?.id ? 'Take Lesson Assessment' : 'Proceed'}
        completeButtonText={hasQuiz ? 'Take Final Assessment' : 'Complete Course'}
        handleNextClick={handleNextClick}
        onClose={() => router.push(`/dashboard/learn/${id}/chapters/${id}`)}
        primaryColor="#870BD6"
      />
    </DashboardLayout>
  );
}

// ── Page export (Suspense boundary for useSearchParams) ───────────────────────

export default function CourseMaterials() {
  return (
    <Suspense>
      <CourseMaterialsInner />
    </Suspense>
  );
}
