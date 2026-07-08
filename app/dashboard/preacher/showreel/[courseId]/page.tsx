'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Button from '@/app/components/Button';
import { Archive, ArrowLeft, Trash2 } from 'lucide-react';
import PublishIcon from '@/app/assets/icons/publishIcon';
import Tabs from '@/app/components/Tabs';
import CourseContent from './components/CourseContent';
import MetricsContent from './components/MetricsContent';
import CommentsContent from './components/CommentsContent';
import SettingsContent from './components/SettingsContent';
import { courseService } from '@/lib/api-services';

interface ApiCourse {
  id: string;
  title: string;
  status: string;
  description?: string;
  coverImageUrl?: string | null;
  lessonCount?: number;
  enrollmentCount?: number;
  lessons?: unknown[];
}

const UpdateCourse = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<ApiCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'publish' | 'archive' | 'delete' | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCourse = useCallback(async () => {
    setLoading(true);
    try {
      const data = await courseService.getById(courseId) as ApiCourse;
      setCourse(data);
    } catch {
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handlePublish = async () => {
    if (actionLoading) return;
    setActionLoading('publish');
    try {
      await courseService.publishCourse(courseId);
      showMessage('success', 'Course published successfully.');
      loadCourse();
    } catch (err: unknown) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to publish course.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async () => {
    if (actionLoading) return;
    setActionLoading('archive');
    try {
      await courseService.updateCourse(courseId, { status: 'ARCHIVED' });
      showMessage('success', 'Course archived.');
      loadCourse();
    } catch (err: unknown) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to archive course.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (actionLoading) return;
    const confirmed = window.confirm(
      'Are you sure you want to delete this course? This action cannot be undone.'
    );
    if (!confirmed) return;
    setActionLoading('delete');
    try {
      await courseService.deleteCourse(courseId);
      router.push('/dashboard/preacher/showreel');
    } catch (err: unknown) {
      showMessage('error', err instanceof Error ? err.message : 'Failed to delete course.');
      setActionLoading(null);
    }
  };

  const status = course?.status?.toLowerCase();
  const isPublished = status === 'published';
  const isArchived = status === 'archived';

  const tabs = [
    {
      label: 'Content',
      value: 'content',
      content: <CourseContent onCourseUpdate={loadCourse} />,
    },
    {
      label: 'Metrics',
      value: 'metrics',
      content: <MetricsContent course={course} />,
    },
    {
      label: 'Comments',
      value: 'comments',
      content: <CommentsContent />,
    },
    {
      label: 'Settings',
      value: 'settings',
      content: <SettingsContent course={course} onUpdate={loadCourse} />,
    },
  ];

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white">
        {/* Action feedback banner */}
        {actionMessage && (
          <div
            className={`mx-4 lg:mx-10 mt-4 px-4 py-2 rounded-lg text-sm font-medium ${
              actionMessage.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {actionMessage.text}
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 lg:px-10 pt-6">
          <div className="flex items-center gap-4">
            <Button
              customClass="!w-fit !px-3 !h-[40px] !bg-transparent"
              type="button"
              buttonType="custom"
              onClick={() => router.push('/dashboard/preacher/showreel')}
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-[24px] lg:text-[28px] leading-none font-bold">
              {loading ? 'Loading...' : (course?.title ?? 'Course')}
            </h1>
            {!loading && course && (
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${getStatusBadge(status ?? '')}`}
              >
                {status}
              </span>
            )}
          </div>

          <div className="flex gap-[18px]">
            {/* Publish — shown when draft or archived */}
            {!isPublished && (
              <button
                onClick={handlePublish}
                disabled={!!actionLoading}
                title="Publish course"
                className="w-10 h-10 flex justify-center items-center rounded-full border border-[#870BD6] bg-[#F3F4F6] text-[#6B7280] transition-colors hover:bg-purple-50 disabled:opacity-50"
              >
                {actionLoading === 'publish' ? (
                  <span className="inline-block w-4 h-4 rounded-full border-t-2 border-purple-600 animate-spin" />
                ) : (
                  <PublishIcon />
                )}
              </button>
            )}

            {/* Archive — shown when published */}
            {!isArchived && (
              <button
                onClick={handleArchive}
                disabled={!!actionLoading}
                title="Archive course"
                className="w-10 h-10 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] text-[#6B7280] transition-colors hover:bg-gray-200 disabled:opacity-50"
              >
                {actionLoading === 'archive' ? (
                  <span className="inline-block w-4 h-4 rounded-full border-t-2 border-gray-600 animate-spin" />
                ) : (
                  <Archive className="w-[18px] h-[18px]" />
                )}
              </button>
            )}

            {/* Delete */}
            <button
              onClick={handleDelete}
              disabled={!!actionLoading}
              title="Delete course"
              className="w-10 h-10 flex justify-center items-center rounded-full border border-[#FCA5A5] text-[#EF4444] bg-[#FFE4E4] transition-colors hover:bg-red-100 disabled:opacity-50"
            >
              {actionLoading === 'delete' ? (
                <span className="inline-block w-4 h-4 rounded-full border-t-2 border-red-500 animate-spin" />
              ) : (
                <Trash2 className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-white pt-5">
          <Tabs
            tabs={tabs}
            defaultTab="content"
            className="px-4 lg:px-12"
            customClass="!rounded-full"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

function getStatusBadge(status: string) {
  switch (status) {
    case 'published':
      return 'bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]';
    case 'draft':
      return 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]';
    case 'archived':
      return 'bg-[#F8F9FC] text-[#363F72] border border-[#D5D9EB]';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

export default UpdateCourse;
