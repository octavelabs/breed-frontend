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
  isPublished?: boolean;
}

interface ApiCourse {
  id: string;
  title: string;
  lessons?: ApiLesson[];
}

// ── Editor types (mirror CourseEditor internals) ──────────────────────────────

interface EditorLesson  { id: string; name: string; content: string; isValid: boolean; }
interface EditorChapter { id: string; name: string; lessons: EditorLesson[]; }
interface EditorCourse  { id: string; title: string; chapters: EditorChapter[]; }

// ── Helpers ───────────────────────────────────────────────────────────────────

// IDs starting with "new_" are client-side placeholders not yet persisted.
const isNewLesson = (id: string) => id.startsWith("new_");

/**
 * Map a flat API response into the editor's chapter-based structure.
 * `addFallback`: only true on the FIRST load so a brand-new course shows an
 * empty lesson ready to fill. Never true on post-save reloads — avoids the
 * phantom "Lesson 1" loop when the API response is briefly empty.
 */
function mapApiToEditor(
  course: ApiCourse,
  initialChapterName?: string,
  addFallback = true,
): EditorCourse {
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

  // Ref to call patchLessonIds on the running editor without remounting it.
  // Remounting would destroy the user's multi-chapter structure since the
  // backend stores lessons flat and mapApiToEditor collapses them all into one chapter.
  const editorRef = useRef<CourseEditorHandle>(null);

  // Guard: prevent overlapping concurrent saves.
  const isSavingRef = useRef(false);

  // The set of lesson IDs that currently exist in the backend.
  const originalLessonIds = useRef<Set<string>>(new Set());

  // ── Initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = (await courseService.getById(courseId)) as ApiCourse;

        // The chapter name from the Create Course modal is in the URL only on first navigation.
        const initialChapterName =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("chapterName") ?? undefined
            : undefined;

        setEditorCourse(mapApiToEditor(data, initialChapterName));
        originalLessonIds.current = new Set((data.lessons ?? []).map((l) => l.id));
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
    // Prevent overlapping concurrent saves.
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setSaveStatus("saving");

    try {
      const allLessons     = courseData.chapters.flatMap((ch) => ch.lessons);
      const editorIds      = new Set(allLessons.map((l) => l.id));
      const newLessons     = allLessons.filter((l) => isNewLesson(l.id));
      const existingLessons = allLessons.filter((l) => !isNewLesson(l.id));
      const deletedIds     = [...originalLessonIds.current].filter((id) => !editorIds.has(id));

      // Run all mutations in parallel.
      // We separate createLesson from the others so we can collect returned IDs.
      const [createdLessons] = await Promise.all([
        Promise.all(
          newLessons.map((l) =>
            courseService.createLesson(courseId, {
              title:       l.name || "Untitled Lesson",
              content:     l.content,
              type:        "TEXT",
              sortOrder:   allLessons.findIndex((al) => al.id === l.id),
              isPublished: true,
            }) as Promise<{ id: string }>,
          ),
        ),
        Promise.all(
          existingLessons.map((l) =>
            courseService.updateLesson(courseId, l.id, {
              title:       l.name || "Untitled Lesson",
              content:     l.content,
              sortOrder:   allLessons.findIndex((al) => al.id === l.id),
              isPublished: true,
            }),
          ),
        ),
        Promise.all(deletedIds.map((id) => courseService.deleteLesson(courseId, id))),
      ]);

      // Build a map of client-side ID → real backend ID from the create responses.
      const idPatchMap = new Map<string, string>();
      newLessons.forEach((l, i) => {
        const created = createdLessons[i];
        if (created?.id) idPatchMap.set(l.id, created.id);
      });

      // Keep originalLessonIds in sync without reloading.
      createdLessons.forEach((c) => { if (c?.id) originalLessonIds.current.add(c.id); });
      deletedIds.forEach((id) => originalLessonIds.current.delete(id));

      // Surgically patch new_xxx IDs with real backend IDs inside the running
      // editor — preserving all chapters and the user's current cursor position.
      // This is the key fix: we never remount the editor after a save, so the
      // multi-chapter structure the user built is never destroyed.
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
        // No `key` prop here — we never force-remount the editor.
        // ID reconciliation is done via editorRef.patchLessonIds().
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
