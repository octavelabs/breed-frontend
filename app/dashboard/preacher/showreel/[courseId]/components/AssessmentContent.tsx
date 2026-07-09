'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, CheckCircle, AlertCircle, ClipboardList, BookOpen,
} from 'lucide-react';
import { courseService } from '@/lib/api-services';
import Toast from '@/app/components/Toast';
import Button from '@/app/components/Button';
import BookOpenIcon from '@/app/assets/icons/BookOpenIcon';

// ── Shared types ──────────────────────────────────────────────────────────────

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  sortOrder: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passMark: number;
  timeLimit?: number;
  questions: QuizQuestion[];
}

interface DraftQuestion {
  question: string;
  options: [string, string, string, string];
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
}

interface ApiLesson {
  id: string;
  title: string;
  sortOrder: number;
  quiz?: { id: string } | null;
}

interface LessonWithStatus extends ApiLesson {
  hasQuiz: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

const emptyQuestion = (): DraftQuestion => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 'A',
  explanation: '',
});

// ── Question editor ────────────────────────────────────────────────────────────

const QuestionEditor = ({
  q, idx, onChange, onDelete, canDelete,
}: {
  q: DraftQuestion;
  idx: number;
  onChange: (q: DraftQuestion) => void;
  onDelete: () => void;
  canDelete: boolean;
}) => (
  <div className="border border-[#E3E8EF] rounded-xl p-5 mb-4 bg-white">
    <div className="flex justify-between items-start mb-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-[#870BD6]">
        Question {idx + 1}
      </span>
      {canDelete && (
        <button onClick={onDelete} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      )}
    </div>
    <textarea
      value={q.question}
      onChange={(e) => onChange({ ...q, question: e.target.value })}
      placeholder="Enter your question…"
      rows={2}
      className="w-full text-sm border border-[#E3E8EF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#870BD6] resize-none mb-4"
    />
    <div className="space-y-2 mb-4">
      {OPTION_LABELS.map((label, i) => (
        <div key={label} className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onChange({ ...q, correctAnswer: label })}
            className={`w-7 h-7 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
              q.correctAnswer === label
                ? 'border-[#870BD6] bg-[#870BD6] text-white'
                : 'border-[#D1D5DB] text-[#6B7280] hover:border-[#870BD6]'
            }`}
            title="Mark as correct answer"
          >
            {label}
          </button>
          <input
            type="text"
            value={q.options[i]}
            onChange={(e) => {
              const opts: [string, string, string, string] = [...q.options] as [string, string, string, string];
              opts[i] = e.target.value;
              onChange({ ...q, options: opts });
            }}
            placeholder={`Option ${label}`}
            className="flex-1 text-sm border border-[#E3E8EF] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#870BD6]"
          />
        </div>
      ))}
    </div>
    <p className="text-[10px] text-[#6B7280] mb-1.5 font-medium uppercase tracking-wide">Explanation (optional)</p>
    <input
      type="text"
      value={q.explanation}
      onChange={(e) => onChange({ ...q, explanation: e.target.value })}
      placeholder="Why is this the correct answer?"
      className="w-full text-sm border border-[#E3E8EF] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#870BD6]"
    />
  </div>
);

// ── Quiz viewer (read-only) ────────────────────────────────────────────────────

const QuizViewer = ({
  quiz, onReplace, onDelete, deleting,
}: {
  quiz: Quiz;
  onReplace: () => void;
  onDelete: () => void;
  deleting: boolean;
}) => {
  const questions = quiz.questions ?? [];
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-[#180426] text-sm">{quiz.title}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-[#60666B]">
            <span className="flex items-center gap-1"><CheckCircle size={11} className="text-green-500" />Pass: {quiz.passMark}%</span>
            {quiz.timeLimit && <span>{quiz.timeLimit} min</span>}
            <span>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onReplace} className="text-xs font-semibold text-[#870BD6] border border-[#D49CFD] px-3 py-1.5 rounded-lg hover:bg-[#F5EBFF] transition-colors">Replace</button>
          <button onClick={onDelete} disabled={deleting} className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
            {deleting ? <span className="inline-block w-3 h-3 rounded-full border-t-2 border-red-400 animate-spin" /> : 'Delete'}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {questions.map((q, i) => (
          <div key={q.id} className="border border-[#E3E8EF] rounded-xl p-4 bg-white">
            <p className="text-xs font-semibold text-[#870BD6] uppercase tracking-widest mb-1.5">Q{i + 1}</p>
            <p className="text-sm font-medium text-[#180426] mb-2">{q.question}</p>
            <div className="space-y-1">
              {(q.options ?? []).map((opt, oi) => {
                const label = OPTION_LABELS[oi];
                const isCorrect = q.correctAnswer === opt || q.correctAnswer === label;
                return (
                  <div key={oi} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${isCorrect ? 'bg-[#ECFDF3] text-[#067647]' : 'bg-[#F9FAFB] text-[#374151]'}`}>
                    <span className={`font-bold w-4 flex-shrink-0 ${isCorrect ? 'text-[#067647]' : 'text-[#6B7280]'}`}>{label}</span>
                    {opt}
                    {isCorrect && <CheckCircle size={11} className="ml-auto text-[#067647]" />}
                  </div>
                );
              })}
            </div>
            {q.explanation && <p className="text-xs text-[#6B7280] mt-2 italic">💡 {q.explanation}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Quiz builder form ─────────────────────────────────────────────────────────

const QuizBuilder = ({
  existingQuiz,
  onSave,
  onCancel,
  saving,
}: {
  existingQuiz: Quiz | null;
  onSave: (data: {
    title: string; description?: string; passMark: number; timeLimit?: number;
    questions: DraftQuestion[];
  }) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const [title,     setTitle]     = useState(existingQuiz?.title ?? 'Lesson Assessment');
  const [desc,      setDesc]      = useState(existingQuiz?.description ?? '');
  const [passMark,  setPassMark]  = useState(existingQuiz?.passMark ?? 70);
  const [timeLimit, setTimeLimit] = useState<number | ''>(existingQuiz?.timeLimit ?? '');
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);

  const updateQ = (i: number, q: DraftQuestion) =>
    setQuestions((prev) => prev.map((old, idx) => idx === i ? q : old));
  const removeQ = (i: number) =>
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <>
      {/* Meta */}
      <div className="border border-[#E3E8EF] rounded-xl p-5 mb-4 bg-white space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#60666B] mb-1 uppercase tracking-wide">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full text-sm border border-[#E3E8EF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#870BD6]" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#60666B] mb-1 uppercase tracking-wide">Description (optional)</label>
          <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)}
            placeholder="Brief description shown to learners"
            className="w-full text-sm border border-[#E3E8EF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#870BD6]" />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#60666B] mb-1 uppercase tracking-wide">Pass Mark (%)</label>
            <input type="number" min={0} max={100} value={passMark} onChange={(e) => setPassMark(Number(e.target.value))}
              className="w-full text-sm border border-[#E3E8EF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#870BD6]" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#60666B] mb-1 uppercase tracking-wide">Time Limit (min, optional)</label>
            <input type="number" min={1} value={timeLimit} onChange={(e) => setTimeLimit(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="No limit"
              className="w-full text-sm border border-[#E3E8EF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#870BD6]" />
          </div>
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, i) => (
        <QuestionEditor key={i} q={q} idx={i} onChange={(updated) => updateQ(i, updated)}
          onDelete={() => removeQ(i)} canDelete={questions.length > 1} />
      ))}

      <button onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
        className="flex items-center gap-2 text-sm text-[#870BD6] font-semibold mb-4 hover:text-[#6A09AA] transition-colors">
        <Plus size={15} /> Add question
      </button>

      {existingQuiz && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          Saving will replace the current quiz.
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 border border-[#E3E8EF] text-[#60666B] py-2.5 rounded-full text-sm font-semibold hover:bg-[#F9FAFB] transition-colors">
          Cancel
        </button>
        <Button
          loading={saving}
          onClick={() => onSave({
            title,
            description: desc || undefined,
            passMark,
            timeLimit: timeLimit !== '' ? Number(timeLimit) : undefined,
            questions,
          })}
          customClass="flex-1 text-white"
        >
          Save Assessment
        </Button>
      </div>
    </>
  );
};

// ── Lesson list item (left column) ────────────────────────────────────────────

const LessonListItem = ({
  lesson, isSelected, onClick,
}: {
  lesson: LessonWithStatus;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-2 py-2 px-3 mb-1 rounded-lg text-left cursor-pointer transition-colors ${
      isSelected
        ? 'bg-[#F5EBFF] border border-[#D49CFD]'
        : 'border border-transparent hover:bg-gray-50'
    }`}
  >
    <BookOpenIcon stroke={isSelected ? '#B144F9' : '#667085'} />
    <div className="flex-1 min-w-0">
      <span className={`block text-sm truncate select-none ${
        isSelected ? 'font-medium text-[#B144F9]' : 'text-gray-700'
      }`}>
        {lesson.title}
      </span>
      {lesson.hasQuiz ? (
        <span className="text-[10px] font-semibold text-[#067647]">Has quiz</span>
      ) : (
        <span className="text-[10px] text-[#9CA3AF]">No quiz</span>
      )}
    </div>
  </button>
);

// ── Lesson quiz panel (right column) ──────────────────────────────────────────

const LessonQuizPanel = ({
  courseId, lesson, onToast, onQuizChanged,
}: {
  courseId: string;
  lesson: LessonWithStatus;
  onToast: (msg: string, type: 'success' | 'error') => void;
  onQuizChanged: (lessonId: string, hasQuiz: boolean) => void;
}) => {
  const [quiz,     setQuiz]     = useState<Quiz | null | undefined>(undefined);
  const [mode,     setMode]     = useState<'view' | 'build'>('view');
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadQuiz = useCallback(async () => {
    try {
      const res = await courseService.getLessonQuizForAuthor(courseId, lesson.id) as Quiz | null;
      setQuiz(res ?? null);
      if (!res || (res.questions ?? []).length === 0) setMode('build');
    } catch {
      setQuiz(null);
      setMode('build');
    }
  }, [courseId, lesson.id]);

  useEffect(() => {
    setQuiz(undefined);
    setMode('view');
    loadQuiz();
  }, [lesson.id, loadQuiz]);

  const handleSave = async (data: {
    title: string; description?: string; passMark: number; timeLimit?: number; questions: DraftQuestion[];
  }) => {
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      if (!q.question.trim()) { onToast(`Question ${i + 1} is empty.`, 'error'); return; }
      if (q.options.some((o) => !o.trim())) { onToast(`All options for question ${i + 1} must be filled in.`, 'error'); return; }
    }
    setSaving(true);
    try {
      if (quiz?.id) await courseService.deleteLessonQuiz(courseId, lesson.id, quiz.id);
      await courseService.createLessonQuiz(courseId, lesson.id, {
        title: data.title.trim() || 'Lesson Assessment',
        description: data.description,
        passMark: data.passMark,
        timeLimit: data.timeLimit,
        questions: data.questions.map((q, i) => ({
          question: q.question.trim(),
          type: 'MULTIPLE_CHOICE',
          options: q.options,
          correctAnswer: q.options[OPTION_LABELS.indexOf(q.correctAnswer as typeof OPTION_LABELS[number])],
          explanation: q.explanation.trim() || undefined,
          points: 1,
          sortOrder: i,
        })),
      });
      await loadQuiz();
      setMode('view');
      onToast('Lesson assessment saved.', 'success');
      onQuizChanged(lesson.id, true);
    } catch {
      onToast('Failed to save assessment.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!quiz?.id) return;
    if (!window.confirm('Delete this lesson assessment?')) return;
    setDeleting(true);
    try {
      await courseService.deleteLessonQuiz(courseId, lesson.id, quiz.id);
      setQuiz(null);
      setMode('view');
      onToast('Lesson assessment deleted.', 'success');
      onQuizChanged(lesson.id, false);
    } catch {
      onToast('Failed to delete assessment.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (quiz === undefined) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-sm text-[#60666B]">
        <span className="inline-block w-4 h-4 rounded-full border-t-2 border-[#870BD6] animate-spin flex-shrink-0" />
        Loading…
      </div>
    );
  }

  if (mode === 'view' && quiz) {
    return <QuizViewer quiz={quiz} onReplace={() => setMode('build')} onDelete={handleDelete} deleting={deleting} />;
  }

  if (mode === 'view') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
          <BookOpen size={20} className="text-[#870BD6]" />
        </div>
        <div>
          <p className="font-semibold text-[#180426] mb-1">No assessment for this lesson yet.</p>
          <p className="text-xs text-[#60666B] max-w-xs">Add a quiz learners must pass before moving on.</p>
        </div>
        <button
          onClick={() => setMode('build')}
          className="flex items-center gap-2 bg-[#870BD6] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#6A09AA] transition-colors"
        >
          <Plus size={14} /> Add Assessment
        </button>
      </div>
    );
  }

  return (
    <QuizBuilder
      existingQuiz={quiz}
      onSave={handleSave}
      onCancel={() => setMode('view')}
      saving={saving}
    />
  );
};

// ── Course-level quiz section ──────────────────────────────────────────────────

const CourseQuizSection = ({ courseId, onToast }: { courseId: string; onToast: (msg: string, type: 'success' | 'error') => void }) => {
  const [quiz,     setQuiz]     = useState<Quiz | null | undefined>(undefined);
  const [mode,     setMode]     = useState<'view' | 'build'>('view');
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadQuiz = useCallback(async () => {
    try {
      const res = await courseService.getCourseQuiz(courseId) as Quiz | null;
      setQuiz(res);
    } catch {
      setQuiz(null);
    }
  }, [courseId]);

  useEffect(() => { loadQuiz(); }, [loadQuiz]);

  const handleSave = async (data: {
    title: string; description?: string; passMark: number; timeLimit?: number; questions: DraftQuestion[];
  }) => {
    for (let i = 0; i < data.questions.length; i++) {
      const q = data.questions[i];
      if (!q.question.trim()) { onToast(`Question ${i + 1} is empty.`, 'error'); return; }
      if (q.options.some((o) => !o.trim())) { onToast(`All options for question ${i + 1} must be filled in.`, 'error'); return; }
    }
    setSaving(true);
    try {
      if (quiz?.id) await courseService.deleteQuiz(courseId, quiz.id);
      await courseService.createQuiz(courseId, {
        title: data.title.trim() || 'Final Assessment',
        description: data.description,
        passMark: data.passMark,
        timeLimit: data.timeLimit,
        questions: data.questions.map((q, i) => ({
          question: q.question.trim(),
          type: 'MULTIPLE_CHOICE',
          options: q.options,
          correctAnswer: q.options[OPTION_LABELS.indexOf(q.correctAnswer as typeof OPTION_LABELS[number])],
          explanation: q.explanation.trim() || undefined,
          points: 1,
          sortOrder: i,
        })),
      });
      await loadQuiz();
      setMode('view');
      onToast('Final assessment saved.', 'success');
    } catch {
      onToast('Failed to save assessment.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!quiz?.id) return;
    if (!window.confirm('Delete the final assessment?')) return;
    setDeleting(true);
    try {
      await courseService.deleteQuiz(courseId, quiz.id);
      setQuiz(null);
      onToast('Final assessment deleted.', 'success');
    } catch {
      onToast('Failed to delete.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (quiz === undefined) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#60666B] py-4">
        <span className="inline-block w-4 h-4 rounded-full border-t-2 border-[#870BD6] animate-spin flex-shrink-0" />
        Loading…
      </div>
    );
  }

  if (mode === 'view' && quiz) {
    return <QuizViewer quiz={quiz} onReplace={() => setMode('build')} onDelete={handleDelete} deleting={deleting} />;
  }

  if (mode === 'view') {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[#E3E8EF] rounded-2xl text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
          <ClipboardList size={20} className="text-[#870BD6]" />
        </div>
        <div>
          <p className="font-semibold text-[#180426] mb-1">No final assessment yet</p>
          <p className="text-sm text-[#60666B] max-w-xs">Learners see a "Take Assessment" button after completing all lessons.</p>
        </div>
        <button onClick={() => setMode('build')}
          className="flex items-center gap-2 bg-[#870BD6] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#6A09AA] transition-colors">
          <Plus size={15} /> Create Final Assessment
        </button>
      </div>
    );
  }

  return (
    <QuizBuilder
      existingQuiz={quiz}
      onSave={handleSave}
      onCancel={() => setMode('view')}
      saving={saving}
    />
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function AssessmentContent({ courseId }: { courseId: string }) {
  const [lessons,        setLessons]        = useState<ApiLesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [selectedId,     setSelectedId]     = useState<string | null>(null);
  const [quizStatusMap,  setQuizStatusMap]  = useState<Record<string, boolean>>({});
  const [toast,          setToast]          = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    courseService.getById(courseId).then((res: unknown) => {
      const r = res as { chapters?: { lessons: ApiLesson[] }[]; lessons?: ApiLesson[] };
      const flat: ApiLesson[] = r.chapters
        ? r.chapters.flatMap((ch) => ch.lessons ?? [])
        : (r.lessons ?? []);
      const mapped = flat.map((l, i) => ({ ...l, sortOrder: i }));
      setLessons(mapped);

      const statusMap: Record<string, boolean> = {};
      mapped.forEach((l) => { statusMap[l.id] = !!l.quiz?.id; });
      setQuizStatusMap(statusMap);

      if (mapped.length > 0) setSelectedId(mapped[0].id);
    }).catch(() => {}).finally(() => setLoadingLessons(false));
  }, [courseId]);

  const handleQuizChanged = (lessonId: string, hasQuiz: boolean) => {
    setQuizStatusMap((prev) => ({ ...prev, [lessonId]: hasQuiz }));
  };

  const showToast = (msg: string, type: 'success' | 'error') => setToast({ message: msg, type });

  const lessonsWithStatus: LessonWithStatus[] = lessons.map((l) => ({
    ...l,
    hasQuiz: quizStatusMap[l.id] ?? !!l.quiz?.id,
  }));
  const selectedLesson = lessonsWithStatus.find((l) => l.id === selectedId);

  return (
    <div className="space-y-10 px-4 lg:px-12">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* ── Lesson assessments ───────────────────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h3 className="font-semibold text-[#180426]">Lesson Assessments</h3>
          <p className="text-xs text-[#60666B] mt-0.5">
            Learners must pass a lesson's assessment before proceeding to the next lesson.
          </p>
        </div>

        {loadingLessons ? (
          <div className="flex items-center gap-2 text-sm text-[#60666B] py-4">
            <span className="inline-block w-4 h-4 rounded-full border-t-2 border-[#870BD6] animate-spin flex-shrink-0" />
            Loading lessons…
          </div>
        ) : lessons.length === 0 ? (
          <div className="border-2 border-dashed border-[#E3E8EF] rounded-2xl py-10 text-center">
            <p className="text-sm text-[#60666B]">No lessons in this course yet. Add lessons from the Content tab first.</p>
          </div>
        ) : (
          <div className="flex border border-[#E3E8EF] rounded-2xl overflow-hidden">
            {/* Left: lesson list */}
            <div className="w-64 flex-shrink-0 border-r border-[#E3E8EF] p-3 overflow-y-auto max-h-[600px]">
              {lessonsWithStatus.map((lesson) => (
                <LessonListItem
                  key={lesson.id}
                  lesson={lesson}
                  isSelected={lesson.id === selectedId}
                  onClick={() => setSelectedId(lesson.id)}
                />
              ))}
            </div>

            {/* Right: quiz editor/viewer */}
            <div className="flex-1 min-w-0 p-6 overflow-y-auto max-h-[600px]">
              {selectedLesson ? (
                <LessonQuizPanel
                  courseId={courseId}
                  lesson={selectedLesson}
                  onToast={showToast}
                  onQuizChanged={handleQuizChanged}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <BookOpen size={28} className="text-[#D1D5DB]" />
                  <p className="text-sm text-[#60666B]">Select a lesson to manage its assessment.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Final / course-level assessment ──────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h3 className="font-semibold text-[#180426]">Final Assessment</h3>
          <p className="text-xs text-[#60666B] mt-0.5">
            Shown after all lessons are complete. Controls the "Take Assessment" button learners see at the end.
          </p>
        </div>
        <CourseQuizSection courseId={courseId} onToast={showToast} />
      </section>
    </div>
  );
}
