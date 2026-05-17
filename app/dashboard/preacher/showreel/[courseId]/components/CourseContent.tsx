"use client";

import { useParams } from "next/navigation";
import CourseEditor, { CourseEditorHandle } from "../../components/CourseEditor";
import { useCallback, useEffect, useRef, useState } from "react";
import { courseService } from "@/lib/api-services";

// ── API types ─────────────────────────────────────────────────────────────────

interface ApiLesson {
  id: string;
  title: string;
  content?: string | null;
  sortOrder?: number;
  chapterId?: string | null;
}

interface ApiChapter {
  id: string;
  editorId: string;
  title: string;
  sortOrder: number;
  lessons?: ApiLesson[];
}

interface ApiCourse {
  id: string;
  title: string;
  chapters?: ApiChapter[];
  lessons?: ApiLesson[];   // flat fallback for courses without chapters
}

// ── Editor types (mirror CourseEditor internals) ──────────────────────────────

interface EditorLesson  { id: string; name: string; content: string; isValid: boolean; }
interface EditorChapter { id: string; name: string; lessons: EditorLesson[]; }
interface EditorCourse  { id: string; title: string; chapters: EditorChapter[]; }

// ── Helpers ───────────────────────────────────────────────────────────────────

const isNewLesson = (id: string) => id.startsWith("new_");

/**
 * Convert an API course to the editor format.
 * Priority order:
 *   1. Backend chapters with nested lessons (most accurate, synced to DB)
 *   2. localStorage structure (preserved across tab switches/hard refresh)
 *   3. Flat lesson list collapsed into one chapter (fallback for new courses)
 */
function mapApiToEditor(
  course: ApiCourse,
  initialChapterName?: string,
  addFallback = true,
): EditorCourse {
  // 1. Backend has chapter structure — use it directly
  if (course.chapters && course.chapters.length > 0) {
    const chapters: EditorChapter[] = course.chapters.map((ch) => ({
      id:   ch.editorId || ch.id,   // editor uses editorId as its stable chapter key
      name: ch.title,
      lessons: (ch.lessons ?? []).map((l) => ({
        id:      l.id,
        name:    l.title,
        content: l.content ?? "",
        isValid: !!l.content,
      })),
    }));
    return { id: course.id, title: course.title, chapters };
  }

  // 2. No backend chapters — use flat lessons (fallback / backwards compat)
  const lessons: EditorLesson[] = (course.lessons ?? []).map((l) => ({
    id:      l.id,
    name:    l.title,
    content: l.content ?? "",
    isValid: !!l.content,
  }));

  if (lessons.length === 0 && addFallback) {
    lessons.push({ id: `new_${Date.now()}`, name: "Lesson 1", content: "", isValid: false });
  }

  return {
    id:       course.id,
    title:    course.title,
    chapters: [{ id: "ch-1", name: initialChapterName || "Chapter 1", lessons }],
  };
}

/**
 * Restore the multi-chapter structure from localStorage.
 * Used when the backend doesn't have chapters yet (e.g. very first save).
 * Returns null on any failure so the caller falls back to mapApiToEditor.
 */
function restoreStructure(apiCourse: ApiCourse): EditorCourse | null {
  if (typeof window === "undefined") return null;
  // Only use localStorage if backend has no chapters yet
  if (apiCourse.chapters && apiCourse.chapters.length > 0) return null;

  const raw = localStorage.getItem(`course-structure-${apiCourse.id}`);
  if (!raw) return null;

  try {
    const saved = JSON.parse(raw) as {
      chapters: { id: string; name: string; lessonIds: string[] }[];
    };
    if (!Array.isArray(saved?.chapters)) return null;

    const byId = new Map((apiCourse.lessons ?? []).map((l) => [l.id, l]));

    const chapters: EditorChapter[] = saved.chapters.map((ch) => ({
      id:   ch.id,
      name: ch.name,
      lessons: (ch.lessonIds ?? [])
        .filter((id) => byId.has(id))
        .map((id) => {
          const l = byId.get(id)!;
          return { id: l.id, name: l.title, content: l.content ?? "", isValid: !!l.content };
        }),
    }));

    const knownIds = new Set(saved.chapters.flatMap((ch) => ch.lessonIds ?? []));
    const orphans: EditorLesson[] = (apiCourse.lessons ?? [])
      .filter((l) => !knownIds.has(l.id))
      .map((l) => ({ id: l.id, name: l.title, content: l.content ?? "", isValid: !!l.content }));

    if (orphans.length > 0) {
      if (chapters.length > 0) chapters[0].lessons.push(...orphans);
      else chapters.push({ id: "ch-fallback", name: "Chapter 1", lessons: orphans });
    }

    if (chapters.length === 0) return null;

    return { id: apiCourse.id, title: apiCourse.title, chapters };
  } catch {
    return null;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface CourseContentProps {
  onCourseUpdate?: () => void;
}

const CourseContent = ({ onCourseUpdate }: CourseContentProps) => {
  const params   = useParams();
  const courseId = params.courseId as string;

  const [editorCourse, setEditorCourse] = useState<EditorCourse | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [saveStatus,   setSaveStatus]   = useState<"idle" | "saving" | "saved" | "error">("idle");

  const editorRef      = useRef<CourseEditorHandle>(null);
  const isSavingRef    = useRef(false);
  const originalLessonIds = useRef<Set<string>>(new Set());

  // ── Initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = (await courseService.getById(courseId)) as ApiCourse;

        const initialChapterName =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("chapterName") ?? undefined
            : undefined;

        // Use backend chapters first, then localStorage, then flat fallback
        const restored = restoreStructure(data);
        setEditorCourse(restored ?? mapApiToEditor(data, initialChapterName));
        originalLessonIds.current = new Set(
          (data.lessons ?? []).map((l) => l.id)
        );
      } catch {
        setEditorCourse(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  // ── Save handler ─────────────────────────────────────────────────────────────

  const handleSaveDraft = useCallback(async (courseData: EditorCourse) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaveStatus("saving");

    try {
      // 1. Sync chapter structure to backend → get editorId→backendId mapping
      const syncResult = (await courseService.syncChapters(courseId, {
        chapters: courseData.chapters.map((ch, i) => ({
          editorId:  ch.id,
          title:     ch.name,
          sortOrder: i,
        })),
      })) as { chapters: { editorId: string; id: string }[] };

      const chapterIdMap = new Map<string, string>(
        syncResult.chapters.map((c) => [c.editorId, c.id])
      );

      // 2. Build flat lesson list enriched with sortOrder and backendChapterId
      let globalOrder = 0;
      const allLessons = courseData.chapters.flatMap((ch) =>
        ch.lessons.map((l) => ({
          ...l,
          backendChapterId: chapterIdMap.get(ch.id),
          sortOrder: globalOrder++,
        }))
      );

      const editorIds   = new Set(allLessons.map((l) => l.id));
      const newLessons  = allLessons.filter((l) => isNewLesson(l.id));
      const existing    = allLessons.filter((l) => !isNewLesson(l.id));
      const deletedIds  = [...originalLessonIds.current].filter((id) => !editorIds.has(id));

      // 3. Run lesson mutations in parallel
      const [createdLessons] = await Promise.all([
        Promise.all(
          newLessons.map((l) =>
            courseService.createLesson(courseId, {
              title:       l.name || "Untitled Lesson",
              content:     l.content,
              type:        "TEXT",
              sortOrder:   l.sortOrder,
              chapterId:   l.backendChapterId,
              isPublished: true,
            }) as Promise<{ id: string }>,
          ),
        ),
        Promise.all(
          existing.map((l) =>
            courseService.updateLesson(courseId, l.id, {
              title:       l.name || "Untitled Lesson",
              content:     l.content,
              sortOrder:   l.sortOrder,
              chapterId:   l.backendChapterId,
              isPublished: true,
            }),
          ),
        ),
        Promise.all(deletedIds.map((id) => courseService.deleteLesson(courseId, id))),
      ]);

      // 4. Patch new_xxx IDs with real backend IDs (no editor remount needed)
      const idPatchMap = new Map<string, string>();
      newLessons.forEach((l, i) => {
        const created = createdLessons[i];
        if (created?.id) idPatchMap.set(l.id, created.id);
      });

      createdLessons.forEach((c) => { if (c?.id) originalLessonIds.current.add(c.id); });
      deletedIds.forEach((id) => originalLessonIds.current.delete(id));

      if (idPatchMap.size > 0) {
        editorRef.current?.patchLessonIds(idPatchMap);
      }

      setSaveStatus("saved");
      onCourseUpdate?.();
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      isSavingRef.current = false;
    }
  }, [courseId, onCourseUpdate]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white px-4 lg:px-10">
      {loading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      ) : (
        <CourseEditor
          ref={editorRef}
          initialCourse={editorCourse ?? undefined}
          onSaveDraft={handleSaveDraft}
          onChange={handleSaveDraft}
          saveStatus={saveStatus}
        />
      )}
    </div>
  );
};

export default CourseContent;
