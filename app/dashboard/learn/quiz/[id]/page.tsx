"use client"

import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import QuizQuestion from '@/app/components/quiz';
import StepProgress from '@/app/components/StepProgress';
import DashboardLayout from '@/app/layout/DashboardLayout';
import LoadingScreen from './components/LoadingScreen';
import { courseService } from '@/lib/api-services';
import { CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuizQuestionData {
  id: string;
  question: string;
  options: string[];
  type: string;
  points: number;
  sortOrder: number;
}

interface QuizData {
  id: string;
  title: string;
  description?: string | null;
  passMark: number;
  timeLimit?: number | null;
  lessonId?: string | null;
  questions: QuizQuestionData[];
}

interface QuizResultData {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
}

// ── Result screen ─────────────────────────────────────────────────────────────

const ResultScreen = ({
  result,
  passMark,
  isLessonQuiz,
  onRetry,
  onContinue,
}: {
  result: QuizResultData;
  passMark: number;
  isLessonQuiz: boolean;
  onRetry: () => void;
  onContinue: () => void;
}) => (
  <div className="min-h-screen bg-[#330750] flex items-center justify-center p-6">
    <div className="flex flex-col items-center max-w-sm w-full text-center">
      <div className="mb-6 h-[220px] w-[220px]">
        <img src="/quizLoader.png" className="w-full h-full object-contain" alt="" />
      </div>

      {result.passed ? (
        <div className="flex items-center gap-2 bg-[#ECFDF3] text-[#067647] px-5 py-2 rounded-full mb-4 font-semibold text-sm">
          <CheckCircle size={16} /> Passed!
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-[#FEF3F2] text-[#B42318] px-5 py-2 rounded-full mb-4 font-semibold text-sm">
          <XCircle size={16} /> Not quite — try again
        </div>
      )}

      <div className="bg-[#00000026] rounded-2xl py-6 px-10 mb-6 w-full">
        <span className="inline-block bg-white text-[#870BD6] text-xs font-semibold px-3 py-1 rounded-full mb-3">
          Your Score
        </span>
        <h2 className="text-white text-[40px] font-bold leading-none">{Math.round(result.score)}%</h2>
        <p className="text-white/60 text-sm mt-1">
          {result.correctCount} / {result.totalQuestions} correct · pass mark {passMark}%
        </p>
      </div>

      {result.passed ? (
        <button
          onClick={onContinue}
          className="w-full bg-white text-[#330750] rounded-full py-4 font-semibold text-base flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
        >
          {isLessonQuiz ? 'Continue to Next Lesson' : 'Complete Course'}
          <ArrowRight size={18} />
        </button>
      ) : (
        <button
          onClick={onRetry}
          className="w-full bg-white text-[#330750] rounded-full py-4 font-semibold text-base flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
        >
          <RotateCcw size={16} /> Try Again
        </button>
      )}
    </div>
  </div>
);

// ── Inner page ─────────────────────────────────────────────────────────────────

function QuizInner() {
  const router       = useRouter();
  const { id: quizId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const courseId    = searchParams.get('courseId') ?? '';
  const lessonId    = searchParams.get('lessonId');
  const nextLessonId = searchParams.get('nextLessonId');

  const [quiz,            setQuiz]            = useState<QuizData | null>(null);
  const [isLoading,       setIsLoading]       = useState(true);
  const [screenLoading,   setScreenLoading]   = useState(true); // LoadingScreen animation
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers,         setAnswers]         = useState<Map<string, string>>(new Map());
  const [submitting,      setSubmitting]      = useState(false);
  const [result,          setResult]          = useState<QuizResultData | null>(null);

  const fetchQuiz = useCallback(async () => {
    try {
      const data = await courseService.getQuizForLearner(quizId) as QuizData;
      setQuiz(data);
    } catch {
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [quizId, router]);

  useEffect(() => { fetchQuiz(); }, [fetchQuiz]);

  const handleSelect = (optionText: string) => {
    if (!quiz) return;
    const qId = quiz.questions[currentQuestion].id;
    setAnswers((prev) => new Map(prev).set(qId, optionText));
  };

  const handleNextClick = (stepIndex: number): void => {
    const next = stepIndex + 1;
    if (quiz && next < quiz.questions.length) {
      setCurrentQuestion(next);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    try {
      const payload = quiz.questions.map((q) => ({
        questionId: q.id,
        answer: answers.get(q.id) ?? null,
      }));
      const res = await courseService.submitQuiz(quizId, { answers: payload }) as QuizResultData;
      setResult(res);
    } catch {
      // keep current state, user can retry
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    setCurrentQuestion(0);
    setAnswers(new Map());
  };

  const handleContinue = () => {
    if (lessonId) {
      // Lesson quiz — go back to materials at the next lesson
      const target = `/dashboard/learn/materials/${courseId}`;
      router.push(nextLessonId ? `${target}?lesson=${nextLessonId}` : target);
    } else {
      // Course-level quiz — go to course chapters page
      router.push(`/dashboard/learn/${courseId}/chapters/${courseId}`);
    }
  };

  if (isLoading || screenLoading) {
    return <LoadingScreen onLoadComplete={() => setScreenLoading(false)} />;
  }

  if (result) {
    return (
      <ResultScreen
        result={result}
        passMark={quiz?.passMark ?? 70}
        isLessonQuiz={!!lessonId}
        onRetry={handleRetry}
        onContinue={handleContinue}
      />
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-gray-500">No questions found for this quiz.</p>
          <button onClick={() => router.back()} className="text-[#870BD6] text-sm underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const selectedAnswer = answers.get(currentQ.id) ?? null;

  // Map string options to { id, text } for the QuizQuestion component
  const questionOptions = (currentQ.options as string[]).map((opt, i) => ({
    id: opt,
    text: opt,
  }));

  const steps = quiz.questions.map((q) => ({
    subtitle: quiz.title,
    title: q.question,
    content: (
      <QuizQuestion
        question={quiz.questions[currentQuestion].question}
        options={(quiz.questions[currentQuestion].options as string[]).map((opt) => ({ id: opt, text: opt }))}
        onSelect={handleSelect}
        selectedAnswer={answers.get(quiz.questions[currentQuestion].id) ?? null}
      />
    ),
  }));

  return (
    <DashboardLayout>
      <div className="">
        <StepProgress
          steps={steps}
          onComplete={handleSubmit}
          completeButtonText={submitting ? 'Submitting…' : 'Submit'}
          nextButtonText="Next Question"
          handleNextClick={handleNextClick}
          primaryColor="#870BD6"
        />
      </div>
    </DashboardLayout>
  );
}

// ── Page export ────────────────────────────────────────────────────────────────

export default function Quiz() {
  return (
    <Suspense>
      <QuizInner />
    </Suspense>
  );
}
