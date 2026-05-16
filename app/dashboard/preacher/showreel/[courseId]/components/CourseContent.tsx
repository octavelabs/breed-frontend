"use client";

import { useParams } from "next/navigation";
import CourseEditor from "../../components/CourseEditor";
import { useCallback, useEffect, useRef, useState } from "react";
import { courseService } from "@/lib/api-services";

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

interface EditorLesson {
  id: string;
  name: string;
  content: string;
  isValid: boolean;
}

interface EditorChapter {
  id: string;
  name: string;
  lessons: EditorLesson[];
}

interface EditorCourse {
  id: string;
  title: string;
  chapters: EditorChapter[];
}

// IDs starting with "new_" are client-side only and need to be created via API
const isNewLesson = (id: string) => id.startsWith("new_");

function mapApiToEditor(
  course: ApiCourse,
  initialChapterName?: string,
  addFallback = true,
): EditorCourse {
  const lessons: EditorLesson[] = (course.lessons ?? []).map((l) => ({
    id: l.id,
    name: l.title,
    content: l.content ?? "",
    isValid: !!l.content,
  }));

  // Only add the placeholder on the very first load (not after saves) to prevent
  // an infinite loop where a stale/empty API response re-creates the placeholder.
  if (lessons.length === 0 && addFallback) {
    lessons.push({ id: `new_${Date.now()}`, name: "Lesson 1", content: "", isValid: false });
  }

  return {
    id: course.id,
    title: course.title,
    chapters: [{ id: "ch-1", name: initialChapterName || "Chapter 1", lessons }],
  };
}

interface CourseContentProps {
  onCourseUpdate?: () => void;
}

const CourseContent = ({ onCourseUpdate }: CourseContentProps) => {
  const params = useParams();
  const courseId = params.courseId as string;

  const [editorCourse, setEditorCourse] = useState<EditorCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [editorVersion, setEditorVersion] = useState(0);

  // Track original backend lesson IDs so we can diff on save
  const originalLessonIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = (await courseService.getById(courseId)) as ApiCourse;
        // Read the chapter name passed from the Create Course modal (only present on first load)
        const initialChapterName =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("chapterName") ?? undefined
            : undefined;
        const mapped = mapApiToEditor(data, initialChapterName);
        setEditorCourse(mapped);
        originalLessonIds.current = new Set(
          (data.lessons ?? []).map((l) => l.id),
        );
      } catch {
        setEditorCourse(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId]);

  const handleSaveDraft = useCallback(async (courseData: EditorCourse) => {
    setSaveStatus("saving");
    try {
      const allEditorLessons = courseData.chapters.flatMap((ch) => ch.lessons);
      const editorIds = new Set(allEditorLessons.map((l) => l.id));

      // Determine which backend lessons were deleted
      const deletedIds = [...originalLessonIds.current].filter((id) => !editorIds.has(id));

      const hasNewLessons = allEditorLessons.some((l) => isNewLesson(l.id));

      await Promise.all([
        // Create new lessons
        ...allEditorLessons
          .filter((l) => isNewLesson(l.id))
          .map((l, idx) =>
            courseService.createLesson(courseId, {
              title: l.name || "Untitled Lesson",
              content: l.content,
              type: "TEXT",
              sortOrder: idx,
              isPublished: true,
            }),
          ),
        // Update existing lessons
        ...allEditorLessons
          .filter((l) => !isNewLesson(l.id))
          .map((l, idx) =>
            courseService.updateLesson(courseId, l.id, {
              title: l.name || "Untitled Lesson",
              content: l.content,
              sortOrder: idx,
              isPublished: true,
            }),
          ),
        // Delete removed lessons
        ...deletedIds.map((id) => courseService.deleteLesson(courseId, id)),
      ]);

      setSaveStatus("saved");
      onCourseUpdate?.();

      // Reload to sync real backend IDs for newly created lessons, then remount editor.
      // Pass addFallback=false so a stale/empty response never injects a phantom "Lesson 1".
      if (hasNewLessons || deletedIds.length > 0) {
        const fresh = (await courseService.getById(courseId)) as ApiCourse;
        const mapped = mapApiToEditor(fresh, undefined, false);
        setEditorCourse(mapped);
        originalLessonIds.current = new Set((fresh.lessons ?? []).map((l) => l.id));
        setEditorVersion((v) => v + 1);
      }

      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  }, [courseId, onCourseUpdate]);

  return (
    <div className="bg-white px-4 lg:px-10">
      {loading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      ) : (
        <CourseEditor
          key={editorVersion}
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
