'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GripVertical, Plus, Trash2, Pencil, Image, Video, Code, Bold, Italic, Underline, Strikethrough, Link } from 'lucide-react';
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
import Button from '@/app/components/Button';
import BookOpenIcon from '@/app/assets/icons/BookOpenIcon';

// Types
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
  initialCourse?: {
    id: string;
    title: string;
    chapters: Chapter[];
  };
  onSaveDraft: (courseData: any) => void;
  onPublish?: (courseData: any) => void;
}

// Sortable Lesson Item Component
const SortableLessonItem = ({
  lesson,
  chapterIndex,
  lessonIndex,
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 py-2 px-3 mb-2 rounded-lg cursor-pointer group ${
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
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={16} className="text-gray-400" />
      </div>
      <div className="flex items-center gap-2 flex-1">
       <BookOpenIcon stroke={isActive ? "#B144F9" : "#667085"} />
        <input
          type="text"
          value={lesson.name}
          onChange={(e) => {
            e.stopPropagation();
            onNameChange(e.target.value);
          }}
          className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm ${
            isActive ? 'font-medium text-[#B144F9]' : 'text-gray-700'
          }`}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      {isActive && (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Edit Lesson"
          >
            <Pencil size={14} className="text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-gray-200 rounded"
            title="Delete Lesson"
          >
            <Trash2 size={14} className="text-gray-500" />
          </button>
        </div>
      )}
      {isHovered && !isActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-gray-200 rounded transition-opacity"
          title="Delete Lesson"
        >
          <Trash2 size={14} className="text-gray-500" />
        </button>
      )}
    </div>
  );
};

// Rich Text Editor Handle type for imperative methods
interface RichTextEditorHandle {
  insertImage: (file: File) => void;
  insertVideo: (url: string) => void;
  insertCodeBlock: () => void;
}

// Rich Text Editor Component
const RichTextEditor = React.forwardRef<
  RichTextEditorHandle,
  {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
  }
>(({
  value,
  onChange,
  placeholder = 'Start writing your lesson content...',
}, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0 && editorRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const editorRect = editorRef.current.getBoundingClientRect();
      
      setToolbarPosition({
        top: rect.top - editorRect.top - 45,
        left: rect.left - editorRect.left + (rect.width / 2) - 100,
      });
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Helper: insert an HTML string at the current cursor position (or end of editor)
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
      while (temp.firstChild) {
        lastNode = frag.appendChild(temp.firstChild);
      }
      range.insertNode(frag);

      // Move cursor after inserted content
      if (lastNode) {
        const newRange = document.createRange();
        newRange.setStartAfter(lastNode);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    } else {
      // No selection inside editor – append at the end
      editor.innerHTML += html;
    }

    // Trigger onChange
    onChange(editor.innerHTML);
  }, [onChange]);

  // Expose imperative methods via ref
  React.useImperativeHandle(ref, () => ({
    insertImage: (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const imgHtml = `<div contenteditable="false" style="margin: 12px 0; text-align: center;">
          <img src="${dataUrl}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 8px; display: inline-block;" />
          <p style="font-size: 12px; color: #9ca3af; margin-top: 4px;">${file.name}</p>
        </div><p><br/></p>`;
        insertHtmlAtCursor(imgHtml);
      };
      reader.readAsDataURL(file);
    },

    insertVideo: (url: string) => {
      // Detect YouTube
      const youtubeMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      // Detect Vimeo
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

      let videoHtml: string;

      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        videoHtml = `<div contenteditable="false" style="margin: 12px 0; text-align: center;">
          <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="max-width: 100%; border-radius: 8px;"></iframe>
        </div><p><br/></p>`;
      } else if (vimeoMatch) {
        const videoId = vimeoMatch[1];
        videoHtml = `<div contenteditable="false" style="margin: 12px 0; text-align: center;">
          <iframe src="https://player.vimeo.com/video/${videoId}" width="560" height="315" frameborder="0" allowfullscreen style="max-width: 100%; border-radius: 8px;"></iframe>
        </div><p><br/></p>`;
      } else {
        // Direct video URL
        videoHtml = `<div contenteditable="false" style="margin: 12px 0; text-align: center;">
          <video controls src="${url}" style="max-width: 100%; border-radius: 8px;">Your browser does not support the video tag.</video>
        </div><p><br/></p>`;
      }

      insertHtmlAtCursor(videoHtml);
    },

    insertCodeBlock: () => {
      const codeHtml = `<div contenteditable="false" style="margin: 12px 0;">
        <pre style="background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: 'Fira Code', 'Courier New', monospace; font-size: 14px; line-height: 1.5;"><code contenteditable="true">// Write your code here</code></pre>
      </div><p><br/></p>`;
      insertHtmlAtCursor(codeHtml);
    },
  }), [insertHtmlAtCursor]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  return (
    <div className="relative h-full">
      {showToolbar && (
        <div
          className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-1 flex items-center gap-1"
          style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
        >
          <button
            onClick={() => execCommand('bold')}
            className="p-2 hover:bg-gray-100 rounded"
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => execCommand('italic')}
            className="p-2 hover:bg-gray-100 rounded"
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => execCommand('underline')}
            className="p-2 hover:bg-gray-100 rounded"
            title="Underline"
          >
            <Underline size={16} />
          </button>
          <button
            onClick={() => execCommand('strikeThrough')}
            className="p-2 hover:bg-gray-100 rounded"
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>
          <button
            onClick={() => {
              const url = prompt('Enter URL:');
              if (url) execCommand('createLink', url);
            }}
            className="p-2 hover:bg-gray-100 rounded"
            title="Link"
          >
            <Link size={16} />
          </button>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        className="w-full h-full min-h-[400px] pl-6 focus:outline-none prose prose-sm max-w-none"
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{
          minHeight: '400px',
        }}
      />
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

const CourseEditor: React.FC<CourseEditorProps> = ({
  initialCourse,
  onSaveDraft,
  onPublish,
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [editingChapterIndex, setEditingChapterIndex] = useState<number | null>(null);
  const editorHandleRef = useRef<RichTextEditorHandle>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [course, setCourse] = useState<{
    id: string;
    title: string;
    chapters: Chapter[];
  }>(
    initialCourse || {
      id: '',
      title: '',
      chapters: [
        {
          id: '1',
          name: 'Explore the bible',
          lessons: [
            {
              id: '1',
              name: 'Lesson 1',
              content: '',
              isValid: false,
            },
          ],
        },
      ],
    }
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for lessons
  const handleDragEnd = (event: DragEndEvent, chapterIndex: number) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newChapters = [...course.chapters];
      const chapter = newChapters[chapterIndex];
      const oldIndex = chapter.lessons.findIndex((l) => l.id === active.id);
      const newIndex = chapter.lessons.findIndex((l) => l.id === over.id);

      newChapters[chapterIndex] = {
        ...chapter,
        lessons: arrayMove(chapter.lessons, oldIndex, newIndex),
      };

      setCourse({
        ...course,
        chapters: newChapters,
      });
    }
  };

  // Add a new lesson to a chapter
  const addLesson = (chapterIndex: number) => {
    const newChapters = [...course.chapters];
    const newLessonId = `${Date.now()}`;

    newChapters[chapterIndex].lessons.push({
      id: newLessonId,
      name: `Lesson ${newChapters[chapterIndex].lessons.length + 1}`,
      content: '',
      isValid: false,
    });

    setCourse({
      ...course,
      chapters: newChapters,
    });

    // Set the new lesson as active
    setActiveChapterIndex(chapterIndex);
    setActiveLessonIndex(newChapters[chapterIndex].lessons.length - 1);
  };

  // Add a new chapter
  const addChapter = () => {
    const newChapterId = `${Date.now()}`;
    const newChapter: Chapter = {
      id: newChapterId,
      name: `Chapter ${course.chapters.length + 1}`,
      lessons: [
        {
          id: `${newChapterId}-lesson-1`,
          name: 'Lesson 1',
          content: '',
          isValid: false,
        },
      ],
    };

    setCourse({
      ...course,
      chapters: [...course.chapters, newChapter],
    });

    // Set the new chapter as active
    setActiveChapterIndex(course.chapters.length);
    setActiveLessonIndex(0);
  };

  // Update lesson content
  const updateLessonContent = (content: string) => {
    const newChapters = [...course.chapters];
    const chapter = newChapters[activeChapterIndex];
    const lessons = [...chapter.lessons];

    lessons[activeLessonIndex] = {
      ...lessons[activeLessonIndex],
      content,
      isValid: content.trim() !== '' && content !== '<br>',
    };

    newChapters[activeChapterIndex] = {
      ...chapter,
      lessons,
    };

    setCourse({
      ...course,
      chapters: newChapters,
    });
  };

  // Update lesson name
  const updateLessonName = (chapterIndex: number, lessonIndex: number, name: string) => {
    const newChapters = [...course.chapters];
    const chapter = newChapters[chapterIndex];
    const lessons = [...chapter.lessons];

    lessons[lessonIndex] = {
      ...lessons[lessonIndex],
      name,
    };

    newChapters[chapterIndex] = {
      ...chapter,
      lessons,
    };

    setCourse({
      ...course,
      chapters: newChapters,
    });
  };

  // Update chapter name
  const updateChapterName = (chapterIndex: number, name: string) => {
    const newChapters = [...course.chapters];

    newChapters[chapterIndex] = {
      ...newChapters[chapterIndex],
      name,
    };

    setCourse({
      ...course,
      chapters: newChapters,
    });
  };

  // Delete a lesson
  const deleteLesson = (chapterIndex: number, lessonIndex: number) => {
    const newChapters = [...course.chapters];
    const chapter = newChapters[chapterIndex];
    const lessons = [...chapter.lessons];

    // Remove the lesson
    lessons.splice(lessonIndex, 1);

    // If there are no lessons left, add a default one
    if (lessons.length === 0) {
      lessons.push({
        id: `${chapter.id}-lesson-${Date.now()}`,
        name: 'Lesson 1',
        content: '',
        isValid: false,
      });
    }

    newChapters[chapterIndex] = {
      ...chapter,
      lessons,
    };

    setCourse({
      ...course,
      chapters: newChapters,
    });

    // Update active lesson if needed
    if (activeChapterIndex === chapterIndex) {
      setActiveLessonIndex(Math.min(activeLessonIndex, lessons.length - 1));
    }
  };

  // Save draft
  const saveDraft = () => {
    // Save to localStorage for persistence
    localStorage.setItem(`course-draft-${course.id || 'new'}`, JSON.stringify(course));
    onSaveDraft(course);
  };

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(`course-draft-${initialCourse?.id || 'new'}`);
    if (savedDraft && !initialCourse) {
      try {
        const parsed = JSON.parse(savedDraft);
        setCourse(parsed);
      } catch (e) {
        console.error('Failed to parse saved draft:', e);
      }
    }
  }, [initialCourse]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      localStorage.setItem(`course-draft-${course.id || 'new'}`, JSON.stringify(course));
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [course]);

  const activeLesson = course.chapters[activeChapterIndex]?.lessons[activeLessonIndex];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="w-full flex h-[calc(100vh-200px)] border border-[#E3E8EF] rounded-[16px]">
        {/* Left sidebar - Chapters and Lessons */}
        <div className="w-[35%] border-r border-[#E3E8EF] p-4 overflow-y-auto">
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingChapterIndex(null);
                      }
                    }}
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
                <SortableContext
                  items={chapter.lessons.map((l) => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="pl-8">
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <SortableLessonItem
                        key={lesson.id}
                        lesson={lesson}
                        chapterIndex={chapterIndex}
                        lessonIndex={lessonIndex}
                        isActive={
                          activeChapterIndex === chapterIndex &&
                          activeLessonIndex === lessonIndex
                        }
                        onSelect={() => {
                          setActiveChapterIndex(chapterIndex);
                          setActiveLessonIndex(lessonIndex);
                        }}
                        onDelete={() => deleteLesson(chapterIndex, lessonIndex)}
                        onNameChange={(name) =>
                          updateLessonName(chapterIndex, lessonIndex, name)
                        }
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

        {/* Right side - Content Editor */}
        <div className="flex-1  rounded-[16px] overflow-hidden flex flex-col">
          {activeLesson && (
            <>
              {/* Editor Header */}
              <div className="flex justify-between items-center p-6">
                <input
                  type="text"
                  value={activeLesson.name}
                  onChange={(e) =>
                    updateLessonName(activeChapterIndex, activeLessonIndex, e.target.value)
                  }
                  className="text-xl font-medium border-none focus:outline-none focus:ring-0 flex-1"
                  placeholder="Add lesson title here"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveDraft}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Save Draft
                  </button>
                  {/* {onPublish && (
                    <button
                      onClick={() => onPublish(course)}
                      className="px-4 py-2 text-sm font-medium text-[#B144F9] hover:bg-purple-50 rounded-lg"
                    >
                      Publish
                    </button>
                  )} */}
                </div>
              </div>

              {/* Editor Content */}
              <div className='flex gap-6 pr-6'>
              <div className="flex-1 overflow-y-auto relative">
                <RichTextEditor
                  ref={editorHandleRef}
                  value={activeLesson.content}
                  onChange={updateLessonContent}
                  placeholder="Start writing your lesson content..."
                />
                {/* Hidden file input for image uploads */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && editorHandleRef.current) {
                      editorHandleRef.current.insertImage(file);
                    }
                    // Reset so the same file can be selected again
                    e.target.value = '';
                  }}
                />
              </div>

              {/* Media Buttons */}
              <div className="flex flex-col w-10 gap-6">
                <button
                  className=" flex flex-col"
                  title="Add Image"
                  onClick={() => imageInputRef.current?.click()}
                >
                   <div className="w-9 h-9 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] text-[#6B7280] hover:bg-[#D1D5DB] transition-colors">
             <Image size={20} className="text-gray-400" />
            </div>
                  
                  <span className="text-[10px] text-gray-400 mt-2">Image</span>
                </button>
                  <button
                  className=" flex flex-col"
                  title="Add Video"
                  onClick={() => {
                    const url = prompt('Enter video URL (YouTube, Vimeo, or direct video link):');
                    if (url && editorHandleRef.current) {
                      editorHandleRef.current.insertVideo(url);
                    }
                  }}
                >
                   <div className="w-9 h-9 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] text-[#6B7280] hover:bg-[#D1D5DB] transition-colors">
             <Video size={20} className="text-gray-400" />
            </div>
                  
                  <span className="text-[10px] text-gray-400 mt-2">Video</span>
                </button>
                  <button
                  className=" flex flex-col"
                  title="Add Code Block"
                  onClick={() => {
                    if (editorHandleRef.current) {
                      editorHandleRef.current.insertCodeBlock();
                    }
                  }}
                >
                   <div className="w-9 h-9 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] text-[#6B7280] hover:bg-[#D1D5DB] transition-colors">
             <Code size={20} className="text-gray-400" />
            </div>
                  
                  <span className="text-[10px] text-gray-400 mt-2">Embed</span>
                </button>

              </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseEditor;
