"use client";

import { useParams } from "next/navigation";
import CourseEditor from "../../components/CourseEditor";
import { useEffect, useRef, useState } from "react";
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

function mapApiToEditor(course: ApiCourse): EditorCourse {
  const lessons: EditorLesson[] = (course.lessons ?? []).map((l) => ({
    id: l.id,
    name: l.title,
    content: l.content ?? "",
    isValid: !!l.content,
  }));

  if (lessons.length === 0) {
    lessons.push({ id: `new_${Date.now()}`, name: "Lesson 1", content: "", isValid: false });
  }

  return {
    id: course.id,
    title: course.title,
    chapters: [{ id: "ch-1", name: "Chapter 1", lessons }],
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

  // Track original backend lesson IDs so we can diff on save
  const originalLessonIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = (await courseService.getById(courseId)) as ApiCourse;
        const mapped = mapApiToEditor(data);
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

  const handleSaveDraft = async (courseData: EditorCourse) => {
    setSaveStatus("saving");
    try {
      const allEditorLessons = courseData.chapters.flatMap((ch) => ch.lessons);
      const editorIds = new Set(allEditorLessons.map((l) => l.id));

      // Determine which backend lessons were deleted
      const deletedIds = [...originalLessonIds.current].filter((id) => !editorIds.has(id));

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

      // Reload to sync real IDs for newly created lessons
      const fresh = (await courseService.getById(courseId)) as ApiCourse;
      const mapped = mapApiToEditor(fresh);
      setEditorCourse(mapped);
      originalLessonIds.current = new Set((fresh.lessons ?? []).map((l) => l.id));

      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  return (
    <div className="bg-white px-4 lg:px-10">
      {saveStatus !== "idle" && (
        <div
          className={`mb-3 px-4 py-2 rounded-lg text-sm font-medium ${
            saveStatus === "saving"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : saveStatus === "saved"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {saveStatus === "saving" && "Saving changes…"}
          {saveStatus === "saved" && "Draft saved successfully."}
          {saveStatus === "error" && "Failed to save. Please try again."}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      ) : (
        <CourseEditor
          initialCourse={editorCourse ?? undefined}
          onSaveDraft={handleSaveDraft}
        />
      )}
    </div>
  );
};

export default CourseContent;
