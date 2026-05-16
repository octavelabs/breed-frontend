'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GripVertical, Plus, Trash2, Pencil, Image, Video, Code, Check } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BookOpenIcon from '@/app/assets/icons/BookOpenIcon';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  name: string;
  content: string;
  isValid: boolean;
}

interface Chapter {
  id: string;
  name: string;
  lessons: Lesson[];
}

interface CourseEditorProps {
  initialCourse?: { id: string; title: string; chapters: Chapter[] };
  onSaveDraft: (courseData: { id: string; title: string; chapters: Chapter[] }) => void;
  onPublish?: (courseData: { id: string; title: string; chapters: Chapter[] }) => void;
  onChange?: (courseData: { id: string; title: string; chapters: Chapter[] }) => void;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}

// ── Sortable Lesson Item ───────────────────────────────────────────────────────

const SortableLessonItem = ({
  lesson,
  isActive,
  onSelect,
  onDelete,
  onNameChange,
}: {
  lesson: Lesson;
  chapterIndex: number;
  lessonIndex: number;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onNameChange: (name: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 py-2 px-3 mb-2 rounded-lg cursor-pointer ${
        isActive
          ? 'bg-[#F5EBFF] border border-[#D49CFD]'
          : !lesson.isValid && lesson.content === ''
          ? 'border border-red-300 bg-red-50'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical size={16} className="text-gray-400" />
      </div>
      <div className="flex items-center gap-2 flex-1">
        <BookOpenIcon stroke={isActive ? '#B144F9' : '#667085'} />
        <input
          type="text"
          value={lesson.name}
          onChange={(e) => { e.stopPropagation(); onNameChange(e.target.value); }}
          className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm ${
            isActive ? 'font-medium text-[#B144F9]' : 'text-gray-700'
          }`}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      {isActive && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1 hover:bg-gray-200 rounded"
            title="Edit Lesson"
          >
            <Pencil size={14} className="text-gray-500" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Delete Lesson"
          >
            <Trash2 size={14} className="text-gray-500" />
          </button>
        </div>
      )}
      {isHovered && !isActive && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 hover:bg-gray-200 rounded transition-opacity"
          title="Delete Lesson"
        >
          <Trash2 size={14} className="text-gray-500" />
        </button>
      )}
    </div>
  );
};

// ── Rich Text Editor ───────────────────────────────────────────────────────────

interface RichTextEditorHandle {
  insertImage: (file: File) => void;
  insertVideo: (url: string) => void;
  insertCodeBlock: () => void;
}

const RichTextEditor = React.forwardRef<
  RichTextEditorHandle,
  { value: string; onChange: (content: string) => void; placeholder?: string }
>(({ value, onChange, placeholder = 'Start writing your lesson content…' }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync incoming value → DOM (only when they differ, to avoid cursor reset)
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  const insertHtmlAtCursor = useCallback((html: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const temp = document.createElement('div');
      temp.innerHTML = html;
      const frag = document.createDocumentFragment();
      let lastNode: Node | null = null;
      while (temp.firstChild) lastNode = frag.appendChild(temp.firstChild);
      range.insertNode(frag);
      if (lastNode) {
        const newRange = document.createRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
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
        const dataUrl = e.target?.result as string;
        insertHtmlAtCursor(
          `<div contenteditable="false" style="margin:12px 0;text-align:center;">
            <img src="${dataUrl}" alt="${file.name}" style="max-width:100%;height:auto;border-radius:8px;display:inline-block;" />
            <p style="font-size:12px;color:#9ca3af;margin-top:4px;">${file.name}</p>
          </div><p><br/></p>`
        );
      };
      reader.readAsDataURL(file);
    },
    insertVideo: (url: string) => {
      const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const vmMatch = url.match(/vimeo\.com\/(\d+)/);
      let videoHtml: string;
      if (ytMatch) {
        videoHtml = `<div contenteditable="false" style="margin:12px 0;text-align:center;"><iframe width="560" height="315" src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allowfullscreen style="max-width:100%;border-radius:8px;"></iframe></div><p><br/></p>`;
      } else if (vmMatch) {
        videoHtml = `<div contenteditable="false" style="margin:12px 0;text-align:center;"><iframe src="https://player.vimeo.com/video/${vmMatch[1]}" width="560" height="315" frameborder="0" allowfullscreen style="max-width:100%;border-radius:8px;"></iframe></div><p><br/></p>`;
      } else {
        videoHtml = `<div contenteditable="false" style="margin:12px 0;text-align:center;"><video controls src="${url}" style="max-width:100%;border-radius:8px;">Your browser does not support video.</video></div><p><br/></p>`;
      }
      insertHtmlAtCursor(videoHtml);
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

// ── Course Editor ──────────────────────────────────────────────────────────────

const CourseEditor: React.FC<CourseEditorProps> = ({
  initialCourse,
  onSaveDraft,
  onPublish: _onPublish,
  onChange,
  saveStatus,
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [editingChapterIndex, setEditingChapterIndex] = useState<number | null>(null);
  const editorHandleRef = useRef<RichTextEditorHandle>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);
  const onChangeRef = useRef(onChange);
  const idCounter = useRef(0);
  const genId = () => `new_${++idCounter.current}`;

  useEffect(() => { onChangeRef.current = onChange; });

  const [course, setCourse] = useState<{ id: string; title: string; chapters: Chapter[] }>(() => {
    if (initialCourse) return initialCourse;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('course-draft-new');
      if (saved) { try { return JSON.parse(saved); } catch { /* ignore */ } }
    }
    return {
      id: '',
      title: '',
      chapters: [{ id: 'ch-0', name: 'Explore the bible', lessons: [{ id: 'new_0', name: 'Lesson 1', content: '', isValid: false }] }],
    };
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent, chapterIndex: number) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newChapters = [...course.chapters];
      const chapter = newChapters[chapterIndex];
      const oldIndex = chapter.lessons.findIndex((l) => l.id === active.id);
      const newIndex = chapter.lessons.findIndex((l) => l.id === over.id);
      newChapters[chapterIndex] = { ...chapter, lessons: arrayMove(chapter.lessons, oldIndex, newIndex) };
      setCourse({ ...course, chapters: newChapters });
    }
  };

  const addLesson = (chapterIndex: number) => {
    const newChapters = course.chapters.map((ch, i) =>
      i === chapterIndex
        ? { ...ch, lessons: [...ch.lessons, { id: genId(), name: `Lesson ${ch.lessons.length + 1}`, content: '', isValid: false }] }
        : ch
    );
    setCourse({ ...course, chapters: newChapters });
    setActiveChapterIndex(chapterIndex);
    setActiveLessonIndex(newChapters[chapterIndex].lessons.length - 1);
  };

  const addChapter = () => {
    const newChapterId = `ch-${++idCounter.current}`;
    const newChapter: Chapter = {
      id: newChapterId,
      name: `Chapter ${course.chapters.length + 1}`,
      lessons: [{ id: genId(), name: 'Lesson 1', content: '', isValid: false }],
    };
    setCourse({ ...course, chapters: [...course.chapters, newChapter] });
    setActiveChapterIndex(course.chapters.length);
    setActiveLessonIndex(0);
  };

  const updateLessonContent = (content: string) => {
    const newChapters = course.chapters.map((ch, ci) =>
      ci !== activeChapterIndex ? ch : {
        ...ch,
        lessons: ch.lessons.map((l, li) =>
          li !== activeLessonIndex ? l : { ...l, content, isValid: content.trim() !== '' && content !== '<br>' }
        ),
      }
    );
    setCourse({ ...course, chapters: newChapters });
  };

  const updateLessonName = (chapterIndex: number, lessonIndex: number, name: string) => {
    const newChapters = course.chapters.map((ch, ci) =>
      ci !== chapterIndex ? ch : {
        ...ch,
        lessons: ch.lessons.map((l, li) => li !== lessonIndex ? l : { ...l, name }),
      }
    );
    setCourse({ ...course, chapters: newChapters });
  };

  const updateChapterName = (chapterIndex: number, name: string) => {
    setCourse({
      ...course,
      chapters: course.chapters.map((ch, i) => i !== chapterIndex ? ch : { ...ch, name }),
    });
  };

  const deleteLesson = (chapterIndex: number, lessonIndex: number) => {
    const newChapters = course.chapters.map((ch, ci) => {
      if (ci !== chapterIndex) return ch;
      let lessons = ch.lessons.filter((_, li) => li !== lessonIndex);
      if (lessons.length === 0) lessons = [{ id: genId(), name: 'Lesson 1', content: '', isValid: false }];
      return { ...ch, lessons };
    });
    setCourse({ ...course, chapters: newChapters });
    if (activeChapterIndex === chapterIndex) {
      setActiveLessonIndex((prev) => Math.min(prev, newChapters[chapterIndex].lessons.length - 1));
    }
  };

  const saveDraft = () => {
    localStorage.setItem(`course-draft-${course.id || 'new'}`, JSON.stringify(course));
    onSaveDraft(course);
  };

  // Persist to localStorage every 30s
  useEffect(() => {
    const t = setInterval(() => {
      localStorage.setItem(`course-draft-${course.id || 'new'}`, JSON.stringify(course));
    }, 30000);
    return () => clearInterval(t);
  }, [course]);

  // Notify parent 2s after edit (debounced auto-save trigger)
  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    const t = setTimeout(() => { onChangeRef.current?.(course); }, 2000);
    return () => clearTimeout(t);
  }, [course]);

  const activeLesson = course.chapters[activeChapterIndex]?.lessons[activeLessonIndex];

  // Apply formatting without losing editor focus
  const applyFormat = (cmd: string) => {
    document.execCommand(cmd, false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-full flex h-[calc(100vh-200px)] border border-[#E3E8EF] rounded-[16px]">

        {/* ── Left sidebar ── */}
        <div className="w-[35%] border-r border-[#E3E8EF] p-4 overflow-y-auto flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Chapters</h2>
            <button onClick={addChapter} className="p-1 hover:bg-gray-100 rounded-full" title="Add Chapter">
              <Plus size={20} />
            </button>
          </div>

          {course.chapters.map((chapter, chapterIndex) => (
            <div key={chapter.id} className="mb-6">
              <div className="flex items-center gap-2 mb-2 group/chapter">
                <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm font-medium">
                  {chapterIndex + 1}
                </span>
                {editingChapterIndex === chapterIndex ? (
                  <input
                    type="text"
                    value={chapter.name}
                    onChange={(e) => updateChapterName(chapterIndex, e.target.value)}
                    onBlur={() => setEditingChapterIndex(null)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setEditingChapterIndex(null); }}
                    autoFocus
                    className="flex-1 text-base font-medium border-none focus:outline-none focus:ring-0"
                  />
                ) : (
                  <span
                    className="flex-1 text-base font-medium cursor-default truncate"
                    onDoubleClick={() => setEditingChapterIndex(chapterIndex)}
                  >
                    {chapter.name}
                  </span>
                )}
                <button
                  onClick={() => setEditingChapterIndex(chapterIndex)}
                  className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover/chapter:opacity-100 transition-opacity"
                  title="Edit Chapter Name"
                >
                  <Pencil size={14} className="text-gray-500" />
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEnd(event, chapterIndex)}
              >
                <SortableContext items={chapter.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                  <div className="pl-8">
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <SortableLessonItem
                        key={lesson.id}
                        lesson={lesson}
                        chapterIndex={chapterIndex}
                        lessonIndex={lessonIndex}
                        isActive={activeChapterIndex === chapterIndex && activeLessonIndex === lessonIndex}
                        onSelect={() => { setActiveChapterIndex(chapterIndex); setActiveLessonIndex(lessonIndex); }}
                        onDelete={() => deleteLesson(chapterIndex, lessonIndex)}
                        onNameChange={(name) => updateLessonName(chapterIndex, lessonIndex, name)}
                      />
                    ))}
                    <button
                      onClick={() => addLesson(chapterIndex)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-2 pl-3"
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

        {/* ── Right: editor panel ── */}
        <div className="flex-1 overflow-hidden flex flex-col rounded-r-[16px]">
          {activeLesson ? (
            <>
              {/* Header: lesson title + save status */}
              <div className="flex justify-between items-center px-6 pt-5 pb-3 flex-shrink-0">
                <input
                  type="text"
                  value={activeLesson.name}
                  onChange={(e) => updateLessonName(activeChapterIndex, activeLessonIndex, e.target.value)}
                  className="text-xl font-medium border-none focus:outline-none focus:ring-0 flex-1"
                  placeholder="Add lesson title here"
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

              {/* Permanent formatting toolbar — brand-styled B / I / U */}
              <div className="flex items-center gap-1 px-5 pb-2 border-b border-[#E3E8EF] flex-shrink-0">
                {([
                  { label: 'B', cmd: 'bold',      cls: 'font-bold',           title: 'Bold' },
                  { label: 'I', cmd: 'italic',    cls: 'italic',              title: 'Italic' },
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

              {/* Scrollable editor area + right-side media buttons */}
              <div className="flex gap-4 flex-1 min-h-0 overflow-hidden pr-4 py-4">
                <div className="flex-1 overflow-y-auto pl-6">
                  {/* key forces a full remount when switching lessons so the DOM is always in sync */}
                  <RichTextEditor
                    key={activeLesson.id}
                    ref={editorHandleRef}
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
                  <button
                    title="Add Image"
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center"
                  >
                    <div className="w-9 h-9 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] hover:bg-[#D1D5DB] transition-colors">
                      <Image size={18} className="text-gray-500" alt="" />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5">Image</span>
                  </button>
                  <button
                    title="Add Video"
                    onClick={() => {
                      const url = prompt('Enter video URL (YouTube, Vimeo, or direct link):');
                      if (url && editorHandleRef.current) editorHandleRef.current.insertVideo(url);
                    }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-9 h-9 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] hover:bg-[#D1D5DB] transition-colors">
                      <Video size={18} className="text-gray-500" />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5">Video</span>
                  </button>
                  <button
                    title="Add Code Block"
                    onClick={() => editorHandleRef.current?.insertCodeBlock()}
                    className="flex flex-col items-center"
                  >
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
              Select or add a lesson to start editing
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;
