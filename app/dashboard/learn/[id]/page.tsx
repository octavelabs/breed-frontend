'use client';

import { ArrowLeft, BookOpen, MessageSquareText, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { courseService } from '@/lib/api-services';
import { useEffect, useState } from 'react';
import { usePageTitle } from '@/app/hooks/usePageTitle';

interface Lesson {
  id: string;
  title: string;
  type?: string;
  isPublished?: boolean;
}

interface Chapter {
  id: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  coverImageUrl?: string | null;
  description?: string;
  enrollmentCount?: number;
  chapters: Chapter[];
  author?: { firstName?: string; lastName?: string } | null;
  createdAt?: string;
}

const Skeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="border border-[#E2E3E5] rounded-2xl animate-pulse">
        <div className="bg-gray-100 rounded-t-2xl p-3.5">
          <div className="bg-gray-200 rounded-xl h-47" />
        </div>
        <div className="px-4 py-4.5 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const CourseDetail: React.FC = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  usePageTitle(course?.title);

  useEffect(() => {
    if (!id) return;
    courseService
      .getById(id as string)
      .then((res: unknown) => {
        const r = res as { data?: CourseDetail };
        setCourse(Array.isArray(res) ? null : (r.data ?? (res as CourseDetail)));
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  const chapters = course?.chapters ?? [];
  const totalLessons = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

  return (
    <DashboardLayout>
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-5 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {loading ? (
          <>
            <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
            <Skeleton />
          </>
        ) : !course ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-full bg-[#F5EBFF] flex items-center justify-center">
              <BookOpen size={24} color="#870BD6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Course not found</p>
          </div>
        ) : (
          <>
            <h1 className="text-[18px] md:text-[24px] lg:text-[32px] leading-none font-bold mb-2">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-[#60666B] text-sm mb-2 max-w-2xl">{course.description}</p>
            )}
            <p className="text-[13px] text-[#60666B] mb-8">
              {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} · {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
              {course.author && ` · ${course.author.firstName} ${course.author.lastName}`}
            </p>

            {chapters.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-14 h-14 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                  <BookOpen size={24} color="#870BD6" />
                </div>
                <p className="text-sm font-semibold text-gray-700">No chapters yet</p>
                <p className="text-[13px] text-[#60666B]">This course has no published content yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((chapter, index) => (
                  <Link
                    key={chapter.id}
                    href={`/dashboard/learn/${id}/chapters/${chapter.id}`}
                  >
                    <div className="border border-[#E2E3E5] shadow-[0px_1px_2px_0px_#1018280D] cursor-pointer rounded-2xl h-full">
                      <div className="bg-gray-100 rounded-t-2xl w-full p-3.5">
                        <div className="relative bg-[#180426] rounded-xl h-47 overflow-hidden flex items-center justify-center">
                          {course.coverImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={course.coverImageUrl}
                              alt={chapter.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen size={40} className="text-white opacity-20" />
                          )}
                          <span className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white text-xs font-bold">
                            {index + 1}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white rounded-b-2xl px-4 py-4.5">
                        <h3 className="text-sm font-semibold mb-2 leading-tight line-clamp-2">
                          {chapter.title}
                        </h3>

                        <div className="flex items-center gap-2 mb-3 text-gray-600 text-sm flex-wrap">
                          <span className="flex items-center gap-1">
                            <BookOpen size={13} />
                            {chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-[5.57px]">
                            <UserRound size={20} strokeWidth={1.5} />
                            <span className="text-[15px] font-medium">
                              {course.enrollmentCount ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseDetail;
