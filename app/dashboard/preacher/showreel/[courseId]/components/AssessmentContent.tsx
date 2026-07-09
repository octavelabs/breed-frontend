'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, CheckCircle, AlertCircle, Loader2, ClipboardList } from 'lucide-react';
import { courseService } from '@/lib/api-services';
import Toast from '@/app/components/Toast';

// ── Types ─────────────────────────────────────────────────────────────────────

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

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

const emptyQuestion = (): DraftQuestion => ({
  question: '',
  options: ['', '', '', ''],
  correctAnswer: 'A',
  explanation: '',
});

// ── Single question editor ─────────────────────────────────────────────────────

const QuestionEditor = ({
  q,
  idx,
  onChange,
  onDelete,
  canDelete,
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
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-500 transition-colors"
          title="Remove question"
        >
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
    <p className="text-[10px] text-[#6B7280] mb-1.5 font-medium uppercase tracking-wide">
      Explanation (optional — shown after submission)
    </p>
    <input
      type="text"
      value={q.explanation}
      onChange={(e) => onChange({ ...q, explanation: e.target.value })}
      placeholder="Why is this the correct answer?"
      className="w-full text-sm border border-[#E3E8EF] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#870BD6]"
    />
  </div>
);

// ── Existing quiz viewer ───────────────────────────────────────────────────────

const QuizViewer = ({
  quiz,
  onReplace,
  onDelete,
  deleting,
}: {
  quiz: Quiz;
  onReplace: () => void;
  onDelete: () => void;
  deleting: boolean;
}) => (
  <div>
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="font-semibold text-[#180426]">{quiz.title}</h3>
        {quiz.description && <p className="text-xs text-[#60666B] mt-0.5">{quiz.description}</p>}
        <div className="flex items-center gap-3 mt-2 text-xs text-[#60666B]">
          <span className="flex items-center gap-1">
            <CheckCircle size={11} className="text-green-500" />
            Pass mark: {quiz.passMark}%
          </span>
          {quiz.timeLimit && <span>{quiz.timeLimit} min time limit</span>}
          <span>{quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onReplace}
          className="text-xs font-semibold text-[#870BD6] border border-[#D49CFD] px-3 py-1.5 rounded-lg hover:bg-[#F5EBFF] transition-colors"
        >
          Replace
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 size={12} className="animate-spin" /> : 'Delete'}
        </button>
      </div>
    </div>

    <div className="space-y-3">
      {quiz.questions.map((q, i) => (
        <div key={q.id} className="border border-[#E3E8EF] rounded-xl p-4 bg-white">
          <p className="text-xs font-semibold text-[#870BD6] uppercase tracking-widest mb-2">
            Question {i + 1}
          </p>
          <p className="text-sm font-medium text-[#180426] mb-3">{q.question}</p>
          <div className="space-y-1.5">
            {q.options.map((opt, oi) => {
              const label = OPTION_LABELS[oi];
              const isCorrect = q.correctAnswer === opt || q.correctAnswer === label;
              return (
                <div
                  key={oi}
                  className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg ${
                    isCorrect ? 'bg-[#ECFDF3] text-[#067647]' : 'bg-[#F9FAFB] text-[#374151]'
                  }`}
                >
                  <span className={`text-xs font-bold w-5 flex-shrink-0 ${isCorrect ? 'text-[#067647]' : 'text-[#6B7280]'}`}>
                    {label}
                  </span>
                  {opt}
                  {isCorrect && <CheckCircle size={12} className="ml-auto text-[#067647]" />}
                </div>
              );
            })}
          </div>
          {q.explanation && (
            <p className="text-xs text-[#6B7280] mt-2 italic">💡 {q.explanation}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

export default function AssessmentContent({ courseId }: { courseId: string }) {
  const [quiz,     setQuiz]     = useState<Quiz | null | undefined>(undefined); // undefined = loading
  const [mode,     setMode]     = useState<'view' | 'build'>('view');
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast,    setToast]    = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Builder state
  const [title,     setTitle]     = useState('Final Assessment');
  const [desc,      setDesc]      = useState('');
  const [passMark,  setPassMark]  = useState(70);
  const [timeLimit, setTimeLimit] = useState<number | ''>('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([emptyQuestion()]);

  const loadQuiz = useCallback(async () => {
    try {
      const res = await courseService.getCourseQuiz(courseId) as unknown;
      const q = res as Quiz | null;
      setQuiz(q);
    } catch {
      setQuiz(null);
    }
  }, [courseId]);

  useEffect(() => { loadQuiz(); }, [loadQuiz]);

  const startBuilder = () => {
    setTitle('Final Assessment');
    setDesc('');
    setPassMark(70);
    setTimeLimit('');
    setQuestions([emptyQuestion()]);
    setMode('build');
  };

  const handleSave = async () => {
    // Validate
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setToast({ message: `Question ${i + 1} is empty.`, type: 'error' }); return;
      }
      if (q.options.some((o) => !o.trim())) {
        setToast({ message: `All options for question ${i + 1} must be filled in.`, type: 'error' }); return;
      }
    }

    setSaving(true);
    try {
      // If replacing, delete old quiz first
      if (quiz?.id) {
        await courseService.deleteQuiz(courseId, quiz.id);
      }

      await courseService.createQuiz(courseId, {
        title: title.trim() || 'Final Assessment',
        description: desc.trim() || undefined,
        passMark,
        timeLimit: timeLimit !== '' ? Number(timeLimit) : undefined,
        questions: questions.map((q, i) => ({
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
      setToast({ message: 'Assessment saved successfully.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save assessment. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!quiz?.id) return;
    if (!window.confirm('Delete this assessment? Students who have already submitted will lose their results.')) return;
    setDeleting(true);
    try {
      await courseService.deleteQuiz(courseId, quiz.id);
      setQuiz(null);
      setToast({ message: 'Assessment deleted.', type: 'success' });
    } catch {
      setToast({ message: 'Failed to delete assessment.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const updateQuestion = (i: number, q: DraftQuestion) =>
    setQuestions((prev) => prev.map((old, idx) => idx === i ? q : old));

  const removeQuestion = (i: number) =>
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (quiz === undefined) {
    return (
      <div className="flex items-center justify-center py-20 text-[#60666B] gap-2 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading assessment…
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* ── View / empty state ────────────────────────────────────────────── */}
      {mode === 'view' && (
        <>
          {quiz ? (
            <QuizViewer
              quiz={quiz}
              onReplace={startBuilder}
              onDelete={handleDelete}
              deleting={deleting}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-[#E3E8EF] rounded-2xl text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                <ClipboardList size={24} className="text-[#870BD6]" />
              </div>
              <div>
                <p className="font-semibold text-[#180426] mb-1">No assessment yet</p>
                <p className="text-sm text-[#60666B] max-w-xs">
                  Add a final assessment so learners can test their understanding after completing the course.
                </p>
              </div>
              <button
                onClick={startBuilder}
                className="flex items-center gap-2 bg-[#870BD6] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#6A09AA] transition-colors"
              >
                <Plus size={15} /> Create Assessment
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Builder ───────────────────────────────────────────────────────── */}
      {mode === 'build' && (
        <>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-[#180426]">
              {quiz ? 'Replace Assessment' : 'Create Assessment'}
            </h3>
            <button
              onClick={() => setMode('view')}
              className="text-xs text-[#60666B] hover:text-[#180426] transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Meta */}
          <div className="border border-[#E3E8EF] rounded-xl p-5 mb-5 bg-white space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#60666B] mb-1.5 uppercase tracking-wide">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Final Assessment"
                className="w-full text-sm border border-[#E3E8EF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#870BD6]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#60666B] mb-1.5 uppercase tracking-wide">Description (optional)</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Brief description shown to learners before they start"
                className="w-full text-sm border border-[#E3E8EF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#870BD6]"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#60666B] mb-1.5 uppercase tracking-wide">
                  Pass Mark (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={passMark}
                  onChange={(e) => setPassMark(Number(e.target.value))}
                  className="w-full text-sm border border-[#E3E8EF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#870BD6]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[#60666B] mb-1.5 uppercase tracking-wide">
                  Time Limit (min, optional)
                </label>
                <input
                  type="number"
                  min={1}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="No limit"
                  className="w-full text-sm border border-[#E3E8EF] rounded-lg px-3 py-2 focus:outline-none focus:border-[#870BD6]"
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          {questions.map((q, i) => (
            <QuestionEditor
              key={i}
              q={q}
              idx={i}
              onChange={(updated) => updateQuestion(i, updated)}
              onDelete={() => removeQuestion(i)}
              canDelete={questions.length > 1}
            />
          ))}

          <button
            onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
            className="flex items-center gap-2 text-sm text-[#870BD6] font-semibold mb-6 hover:text-[#6A09AA] transition-colors"
          >
            <Plus size={15} /> Add question
          </button>

          {quiz && (
            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              Saving will replace the current assessment. Previous submissions will be deleted.
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[#870BD6] text-white py-3 rounded-full font-semibold text-sm hover:bg-[#6A09AA] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : 'Save Assessment'}
          </button>
        </>
      )}
    </div>
  );
}
