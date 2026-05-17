'use client';

import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';
import {
  GripVertical, Plus, Trash2, Pencil, Image as ImageIcon, Video, Code, Check,
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BookOpenIcon from '@/app/assets/icons/BookOpenIcon';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Lesson  { id: string; name: string; content: string; isValid: boolean; }
export interface Chapter { id: string; name: string; lessons: Lesson[]; }
export interface CourseData { id: string; title: string; chapters: Chapter[]; }

export interface CourseEditorHandle {
  /** Surgically replace client-side new_xxx IDs with real backend IDs, without remounting. */
  patchLessonIds: (idMap: Map<string, string>) => void;
}

interface CourseEditorProps {
  initialCourse?: CourseData;
  onSaveDraft: (courseData: CourseData) => void;
  onChange?:    (courseData: CourseData) => void;
  saveStatus?:  'idle' | 'saving' | 'saved' | 'error';
}

// ── Module-level ID generator ─────────────────────────────────────────────────
// Kept outside the component to avoid the react-hooks/purity lint rule.
let _seq = 0;
const genId   = () => `new_${++_seq}`;
const genChId = () => `ch_${++_seq}`;

// ── SortableLessonItem ────────────────────────────────────────────────────────

const SortableLessonItem = React.memo(({
  lesson, isActive, onSelect, onDelete, onNameChange,
}: {
  lesson: Lesson;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onNameChange: (name: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 py-2 px-3 mb-2 rounded-lg cursor-pointer ${
        isActive
          ? 'bg-[#F5EBFF] border border-[#D49CFD]'
          : lesson.content === ''
          ? 'border border-red-300 bg-red-50'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0">
        <GripVertical size={16} className="text-gray-400" />
      </div>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <BookOpenIcon stroke={isActive ? '#B144F9' : '#667085'} />
        <input
          type="text"
          value={lesson.name}
          onChange={(e) => { e.stopPropagation(); onNameChange(e.target.value); }}
          className={`flex-1 min-w-0 bg-transparent border-none focus:outline-none focus:ring-0 text-sm truncate ${
            isActive ? 'font-medium text-[#B144F9]' : 'text-gray-700'
          }`}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      {isActive && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
          title="Delete Lesson"
        >
          <Trash2 size={14} className="text-gray-500" />
        </button>
      )}
      {hovered && !isActive && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
          title="Delete Lesson"
        >
          <Trash2 size={14} className="text-gray-500" />
        </button>
      )}
    </div>
  );
});
SortableLessonItem.displayName = 'SortableLessonItem';

// ── RichTextEditor ────────────────────────────────────────────────────────────

interface RichTextEditorHandle {
  insertImage:    (file: File)   => void;
  insertVideo:    (url: string)  => void;
  insertCodeBlock:()             => void;
}

const RichTextEditor = React.forwardRef<
  RichTextEditorHandle,
  { lessonId: string; value: string; onChange: (content: string) => void; placeholder?: string }
>(({ lessonId, value, onChange, placeholder = 'Start writing your lesson content…' }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const syncedLessonId = useRef<string>('');

  // Sync DOM ← React state only when the active lesson changes.
  // During normal typing the DOM is source-of-truth; we only write to it when
  // switching to a different lesson (or on first mount) to avoid cursor resets.
  useEffect(() => {
    if (!editorRef.current) return;
    if (syncedLessonId.current === lessonId) return;   // same lesson — don't touch DOM
    syncedLessonId.current = lessonId;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [lessonId, value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const insertHtmlAtCursor = useCallback((html: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const frag = document.createDocumentFragment();
      let last: Node | null = null;
      while (tmp.firstChild) last = frag.appendChild(tmp.firstChild);
      range.insertNode(frag);
      if (last) {
        const nr = document.createRange();
        nr.setStartAfter(last);
        nr.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nr);
      }
    } else {
      editor.innerHTML += html;
    }
    onChange(editor.innerHTML);
  }, [onChange]);

  React.useImperativeHandle(ref, () => ({
    insertImage: (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        insertHtmlAtCursor(
          `<div contenteditable="false" style="margin:12px 0;text-align:center;">` +
          `<img src="${src}" alt="${file.name}" style="max-width:100%;height:auto;border-radius:8px;display:inline-block;"/>` +
          `<p style="font-size:12px;color:#9ca3af;margin-top:4px;">${file.name}</p></div><p><br/></p>`
        );
      };
      reader.readAsDataURL(file);
    },
    insertVideo: (url: string) => {
      const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const vm = url.match(/vimeo\.com\/(\d+)/);
      let html: string;
      if (yt)      html = `<div contenteditable="false" style="margin:12px 0;text-align:center;"><iframe width="560" height="315" src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allowfullscreen style="max-width:100%;border-radius:8px;"></iframe></div><p><br/></p>`;
      else if (vm) html = `<div contenteditable="false" style="margin:12px 0;text-align:center;"><iframe src="https://player.vimeo.com/video/${vm[1]}" width="560" height="315" frameborder="0" allowfullscreen style="max-width:100%;border-radius:8px;"></iframe></div><p><br/></p>`;
      else         html = `<div contenteditable="false" style="margin:12px 0;text-align:center;"><video controls src="${url}" style="max-width:100%;border-radius:8px;">Your browser does not support video.</video></div><p><br/></p>`;
      insertHtmlAtCursor(html);
    },
    insertCodeBlock: () => {
      insertHtmlAtCursor(
        `<div contenteditable="false" style="margin:12px 0;"><pre style="background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;overflow-x:auto;font-family:'Fira Code','Courier New',monospace;font-size:14px;line-height:1.5;"><code contenteditable="true">// Write your code here</code></pre></div><p><br/></p>`
      );
    },
  }), [insertHtmlAtCursor]);

  return (
    <div className="relative h-full">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="w-full min-h-[400px] pl-6 pr-2 pt-2 focus:outline-none prose prose-sm max-w-none"
        onInput={handleInput}
        data-placeholder={placeholder}
      />
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
      `}</style>
    </div>
  );
});
RichTextEditor.displayName = 'RichTextEditor';

// ── CourseEditor ──────────────────────────────────────────────────────────────

const DEFAULT_COURSE: CourseData = {
  id: '',
  title: '',
  chapters: [{
    id: 'ch_0',
    name: 'Chapter 1',
    lessons: [{ id: 'new_0', name: 'Lesson 1', content: '', isValid: false }],
  }],
};

const CourseEditor = React.forwardRef<CourseEditorHandle, CourseEditorProps>(({
  initialCourse,
  onSaveDraft,
  onChange,
  saveStatus,
}, ref) => {
  // ── State ───────────────────────────────────────────────────────────────────

  const [course, setCourse] = useState<CourseData>(() => {
    if (initialCourse) return initialCourse;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('course-draft-new');
      if (saved) { try { return JSON.parse(saved); } catch { /* ignore */ } }
    }
    return DEFAULT_COURSE;
  });

  // Track the active lesson by stable ID — never by volatile array index.
  const [activeLessonId, setActiveLessonId] = useState<string | null>(() => {
    const firstLesson = (initialCourse ?? DEFAULT_COURSE).chapters[0]?.lessons[0];
    return firstLesson?.id ?? null;
  });

  // Track which chapter name is being edited (by stable chapter ID).
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  const editorHandleRef = useRef<RichTextEditorHandle>(null);
  const imageInputRef   = useRef<HTMLInputElement>(null);

  // Suppress the debounce trigger that fires after patchLessonIds updates state.
  const isPatchingRef    = useRef(false);
  const isInitialMount   = useRef(true);

  // Keep a stable ref to `onChange` so the debounce closure never goes stale.
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ── Imperative handle ────────────────────────────────────────────────────────
  // CourseContent calls this after createLesson succeeds to swap new_xxx IDs
  // with real backend IDs — without remounting the editor or losing chapters.

  React.useImperativeHandle(ref, () => ({
    patchLessonIds: (idMap: Map<string, string>) => {
      isPatchingRef.current = true;           // suppress next debounce tick
      setCourse((prev) => ({
        ...prev,
        chapters: prev.chapters.map((ch) => ({
          ...ch,
          lessons: ch.lessons.map((l) =>
            idMap.has(l.id) ? { ...l, id: idMap.get(l.id)! } : l
          ),
        })),
      }));
      setActiveLessonId((prev) =>
        prev && idMap.has(prev) ? idMap.get(prev)! : prev
      );
    },
  }), []);

  // ── Derive a safe active-lesson ID without ever calling setState in an effect.
  // `activeLessonId` is the user's intent; `resolvedLessonId` is what we render.
  // If the intended ID no longer exists (e.g. lesson was deleted), fall back to
  // the first available lesson so the editor is never blank.

  const resolvedLessonId = useMemo(() => {
    const allIds = new Set(course.chapters.flatMap((ch) => ch.lessons.map((l) => l.id)));
    if (activeLessonId && allIds.has(activeLessonId)) return activeLessonId;
    return course.chapters[0]?.lessons[0]?.id ?? null;
  }, [course.chapters, activeLessonId]);

  // ── Derived active lesson (resolved, by stable ID) ─────────────────────────

  const activeLesson = useMemo(() => {
    if (!resolvedLessonId) return null;
    for (const ch of course.chapters) {
      const lesson = ch.lessons.find((l) => l.id === resolvedLessonId);
      if (lesson) return lesson;
    }
    return null;
  }, [course.chapters, resolvedLessonId]);

  // ── Auto-save: localStorage every 30s ──────────────────────────────────────

  useEffect(() => {
    const t = setInterval(() => {
      localStorage.setItem(`course-draft-${course.id || 'new'}`, JSON.stringify(course));
    }, 30_000);
    return () => clearInterval(t);
  }, [course]);

  // ── Auto-save: notify parent 2s after any user-driven course change ─────────
  // Skips initial mount and skips the synthetic update from patchLessonIds.

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    if (isPatchingRef.current)  { isPatchingRef.current = false;  return; }
    const t = setTimeout(() => {
      // Persist the chapter structure (id, name, which lessonIds belong where) so
      // it can be restored after a hard refresh or cross-session navigation.
      // Lesson *content* is authoritative in the backend; only the structure is
      // local, because the backend stores lessons as a flat list with no chapters.
      if (course.id) {
        localStorage.setItem(
          `course-structure-${course.id}`,
          JSON.stringify({
            chapters: course.chapters.map((ch) => ({
              id:        ch.id,
              name:      ch.name,
              lessonIds: ch.lessons.map((l) => l.id),
            })),
          }),
        );
      }
      onChangeRef.current?.(course);
    }, 2_000);
    return () => clearTimeout(t);
  }, [course]);

  // ── Handlers (all use functional setCourse to avoid stale-closure bugs) ─────

  const addLesson = useCallback((chapterId: string) => {
    const newId = genId();
    setCourse((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) =>
        ch.id !== chapterId ? ch : {
          ...ch,
          lessons: [
            ...ch.lessons,
            { id: newId, name: `Lesson ${ch.lessons.length + 1}`, content: '', isValid: false },
          ],
        }
      ),
    }));
    setActiveLessonId(newId);
  }, []);

  const addChapter = useCallback(() => {
    const chId  = genChId();
    const lesId = genId();
    setCourse((prev) => ({
      ...prev,
      chapters: [
        ...prev.chapters,
        {
          id:      chId,
          name:    `Chapter ${prev.chapters.length + 1}`,
          lessons: [{ id: lesId, name: 'Lesson 1', content: '', isValid: false }],
        },
      ],
    }));
    setActiveLessonId(lesId);
    setEditingChapterId(chId);
  }, []);

  const updateLessonContent = useCallback((content: string) => {
    if (!resolvedLessonId) return;
    const lesId = resolvedLessonId;         // capture for the closure
    setCourse((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => ({
        ...ch,
        lessons: ch.lessons.map((l) =>
          l.id !== lesId ? l
            : { ...l, content, isValid: content.trim() !== '' && content !== '<br>' }
        ),
      })),
    }));
  }, [resolvedLessonId]);

  const updateLessonName = useCallback((lessonId: string, name: string) => {
    setCourse((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => ({
        ...ch,
        lessons: ch.lessons.map((l) => l.id !== lessonId ? l : { ...l, name }),
      })),
    }));
  }, []);

  const updateChapterName = useCallback((chapterId: string, name: string) => {
    setCourse((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => ch.id !== chapterId ? ch : { ...ch, name }),
    }));
  }, []);

  const deleteLesson = useCallback((chapterId: string, lessonId: string) => {
    const fallbackId = genId();             // generate outside the updater
    setCourse((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const lessons = ch.lessons.filter((l) => l.id !== lessonId);
        if (lessons.length > 0) return { ...ch, lessons };
        // keep chapter alive with a blank placeholder
        return { ...ch, lessons: [{ id: fallbackId, name: 'Lesson 1', content: '', isValid: false }] };
      }),
    }));
    // resolvedLessonId will automatically fall back to first lesson if needed
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent, chapterId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setCourse((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const oi = ch.lessons.findIndex((l) => l.id === active.id);
        const ni = ch.lessons.findIndex((l) => l.id === over.id);
        return { ...ch, lessons: arrayMove(ch.lessons, oi, ni) };
      }),
    }));
  }, []);

  const saveDraft = useCallback(() => {
    localStorage.setItem(`course-draft-${course.id || 'new'}`, JSON.stringify(course));
    onSaveDraft(course);
  }, [course, onSaveDraft]);

  const applyFormat = (cmd: string) => { document.execCommand(cmd, false); };

  // Media insert handlers — defined as stable callbacks so they don't access
  // refs inside the render body (avoids react-hooks/refs lint rule).
  const handleInsertImage = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleInsertVideo = useCallback(() => {
    const url = prompt('Enter video URL (YouTube, Vimeo, or direct link):');
    if (url) editorHandleRef.current?.insertVideo(url);
  }, []);

  const handleInsertCode = useCallback(() => {
    editorHandleRef.current?.insertCodeBlock();
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-full flex h-[calc(100vh-200px)] border border-[#E3E8EF] rounded-[16px]">

        {/* ── Left sidebar ────────────────────────────────────────────────── */}
        <div className="w-[35%] border-r border-[#E3E8EF] p-4 overflow-y-auto flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Chapters</h2>
            <button
              onClick={addChapter}
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Add Chapter"
            >
              <Plus size={20} />
            </button>
          </div>

          {course.chapters.map((chapter, chapterIndex) => (
            <div key={chapter.id} className="mb-6">
              {/* Chapter header */}
              <div className="flex items-center gap-2 mb-2 group/chapter">
                <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium flex-shrink-0">
                  {chapterIndex + 1}
                </span>

                {editingChapterId === chapter.id ? (
                  <input
                    type="text"
                    value={chapter.name}
                    autoFocus
                    onChange={(e) => updateChapterName(chapter.id, e.target.value)}
                    onBlur={() => setEditingChapterId(null)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setEditingChapterId(null); }}
                    className="flex-1 text-base font-medium border-none focus:outline-none focus:ring-0"
                  />
                ) : (
                  <span
                    className="flex-1 text-base font-medium cursor-default truncate"
                    onDoubleClick={() => setEditingChapterId(chapter.id)}
                  >
                    {chapter.name}
                  </span>
                )}

                <button
                  onClick={() => setEditingChapterId(chapter.id)}
                  className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover/chapter:opacity-100 transition-opacity flex-shrink-0"
                  title="Rename Chapter"
                >
                  <Pencil size={14} className="text-gray-500" />
                </button>
              </div>

              {/* Lessons */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, chapter.id)}
              >
                <SortableContext
                  items={chapter.lessons.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="pl-8">
                    {chapter.lessons.map((lesson) => (
                      <SortableLessonItem
                        key={lesson.id}
                        lesson={lesson}
                        isActive={lesson.id === resolvedLessonId}
                        onSelect={() => setActiveLessonId(lesson.id)}
                        onDelete={() => deleteLesson(chapter.id, lesson.id)}
                        onNameChange={(name) => updateLessonName(lesson.id, name)}
                      />
                    ))}
                    <button
                      onClick={() => addLesson(chapter.id)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#870BD6] mt-2 pl-3 transition-colors"
                    >
                      <Plus size={16} />
                      Add new lesson
                    </button>
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ))}
        </div>

        {/* ── Right: editor panel ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden flex flex-col rounded-r-[16px]">
          {activeLesson ? (
            <>
              {/* Header: lesson title + save indicator */}
              <div className="flex justify-between items-center px-6 pt-5 pb-3 flex-shrink-0">
                <input
                  type="text"
                  value={activeLesson.name}
                  onChange={(e) => updateLessonName(activeLesson.id, e.target.value)}
                  className="text-xl font-medium border-none focus:outline-none focus:ring-0 flex-1"
                  placeholder="Lesson title"
                />
                <div className="flex items-center gap-2 min-w-[140px] justify-end">
                  {saveStatus === 'saving' && (
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                      Saving…
                    </span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="text-xs text-green-600 flex items-center gap-1.5">
                      <Check size={12} /> All changes saved
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="text-xs text-red-500">Failed to save</span>
                  )}
                  {(!saveStatus || saveStatus === 'idle') && (
                    <button
                      onClick={saveDraft}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      Save Draft
                    </button>
                  )}
                </div>
              </div>

              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 px-5 pb-2 border-b border-[#E3E8EF] flex-shrink-0">
                {([
                  { label: 'B', cmd: 'bold',      cls: 'font-bold',            title: 'Bold' },
                  { label: 'I', cmd: 'italic',    cls: 'italic',               title: 'Italic' },
                  { label: 'U', cmd: 'underline', cls: 'underline font-medium', title: 'Underline' },
                ] as const).map(({ label, cmd, cls, title }) => (
                  <button
                    key={cmd}
                    title={title}
                    onMouseDown={(e) => { e.preventDefault(); applyFormat(cmd); }}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm text-[#60666B] hover:text-[#870BD6] hover:bg-[#F5EBFF] transition-colors ${cls}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Editor + media buttons */}
              <div className="flex gap-4 flex-1 min-h-0 overflow-hidden pr-4 py-4">
                <div className="flex-1 overflow-y-auto pl-6">
                  <RichTextEditor
                    ref={editorHandleRef}
                    lessonId={activeLesson.id}
                    value={activeLesson.content}
                    onChange={updateLessonContent}
                    placeholder="Start writing your lesson content…"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && editorHandleRef.current) editorHandleRef.current.insertImage(file);
                      e.target.value = '';
                    }}
                  />
                </div>

                {/* Right-side media insert buttons */}
                <div className="flex flex-col gap-5 pt-1 w-10 flex-shrink-0">
                  <button title="Image" onClick={handleInsertImage} className="flex flex-col items-center">
                    <div className="w-9 h-9 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] hover:bg-[#D1D5DB] transition-colors">
                      <ImageIcon size={18} className="text-gray-500" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5">Image</span>
                  </button>
                  <button title="Video" onClick={handleInsertVideo} className="flex flex-col items-center">
                    <div className="w-9 h-9 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] hover:bg-[#D1D5DB] transition-colors">
                      <Video size={18} className="text-gray-500" />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5">Video</span>
                  </button>
                  <button title="Embed" onClick={handleInsertCode} className="flex flex-col items-center">
                    <div className="w-9 h-9 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] hover:bg-[#D1D5DB] transition-colors">
                      <Code size={18} className="text-gray-500" />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5">Embed</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select or add a lesson to begin editing
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CourseEditor.displayName = 'CourseEditor';
export default CourseEditor;
