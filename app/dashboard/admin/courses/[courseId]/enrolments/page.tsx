'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, People, ArrowLeft2, ArrowRight2, TickCircle } from 'iconsax-react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { adminService } from '@/lib/api-services';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Enrolment {
  id: string;
  progressPercent: number;
  completedAt: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };
}

interface Meta { total: number; page: number; limit: number; totalPages: number; }

// ── Progress bar ──────────────────────────────────────────────────────────────

const ProgressBar = ({ value }: { value: number }) => (
  <div className="flex items-center gap-2.5">
    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: value >= 100 ? '#067647' : '#870BD6' }}
      />
    </div>
    <span className="text-[12px] text-[#60666B] tabular-nums w-8 text-right">{Math.round(value)}%</span>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const CourseEnrolmentsPage = () => {
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();

  const [courseTitle, setCourseTitle] = useState('');
  const [enrolments, setEnrolments]   = useState<Enrolment[]>([]);
  const [meta,        setMeta]        = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading,     setLoading]     = useState(true);

  const fetchEnrolments = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getCourseEnrolments(courseId, { page, limit: 20 }) as {
        course: { title: string };
        data: Enrolment[];
        meta: Meta;
      };
      setCourseTitle(res.course?.title ?? '');
      setEnrolments(res.data ?? []);
      setMeta(res.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch {
      setEnrolments([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchEnrolments(1); }, [fetchEnrolments]);

  const completedCount = enrolments.filter((e) => e.completedAt).length;

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white min-h-full px-4 lg:px-10 pt-6 pb-10">

        {/* Back */}
        <button
          onClick={() => router.push('/dashboard/admin/courses')}
          className="flex items-center gap-2 text-[#60666B] hover:text-gray-900 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Courses
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">
            {loading && !courseTitle ? 'Enrolments' : courseTitle}
          </h1>
          <p className="text-sm text-[#60666B] mt-1">
            {loading ? 'Loading…' : `${meta.total} enrolled · ${completedCount} completed`}
          </p>
        </div>

        {/* Summary cards */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl border border-[#E7C8FF] bg-[#FBF6FF] p-4">
              <div className="flex items-center gap-2 mb-1">
                <People size={16} className="text-[#870BD6]" />
                <p className="text-[13px] text-[#60666B]">Total Enrolled</p>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{meta.total}</h3>
            </div>
            <div className="rounded-2xl border border-[#ABEFC6] bg-[#ECFDF3] p-4">
              <div className="flex items-center gap-2 mb-1">
                <TickCircle size={16} className="text-[#067647]" />
                <p className="text-[13px] text-[#60666B]">Completed</p>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{completedCount}</h3>
            </div>
            <div className="rounded-2xl border border-[#B2DDFF] bg-[#EFF8FF] p-4">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[13px] text-[#60666B]">Avg. Progress</p>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {enrolments.length
                  ? `${Math.round(enrolments.reduce((s, e) => s + e.progressPercent, 0) / enrolments.length)}%`
                  : '—'}
              </h3>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8EF] bg-[#F8F9FC]">
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B]">Learner</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B]">Progress</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Enrolled</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8EF]">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 bg-gray-200 rounded w-28" />
                            <div className="h-3 bg-gray-200 rounded w-40" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4"><div className="h-2 bg-gray-200 rounded-full w-32" /></td>
                      <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
                      <td className="px-5 py-4"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                    </tr>
                  ))
                ) : enrolments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-20 text-center text-[#60666B] text-sm">
                      <People size={32} className="mx-auto text-gray-300 mb-3" />
                      No learners enrolled yet
                    </td>
                  </tr>
                ) : (
                  enrolments.map((e) => {
                    const initials = `${e.user.firstName?.[0] ?? ''}${e.user.lastName?.[0] ?? ''}`.toUpperCase();
                    const isComplete = !!e.completedAt;
                    return (
                      <tr key={e.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center flex-shrink-0 text-[#870BD6] text-xs font-bold overflow-hidden">
                              {e.user.avatarUrl
                                ? <img src={e.user.avatarUrl} alt={initials} className="w-full h-full object-cover" />
                                : initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate max-w-[180px]">
                                {e.user.firstName} {e.user.lastName}
                              </p>
                              <p className="text-[12px] text-[#60666B] truncate max-w-[180px]">{e.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 min-w-[160px]">
                          <ProgressBar value={e.progressPercent} />
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                            isComplete
                              ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]'
                              : 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                          }`}>
                            {isComplete ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                          {new Date(e.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                          {e.completedAt
                            ? new Date(e.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#E3E8EF]">
              <p className="text-[12px] text-[#60666B]">
                {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
              </p>
              <div className="flex gap-1">
                <button onClick={() => fetchEnrolments(meta.page - 1)} disabled={meta.page <= 1}
                  className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ArrowLeft2 size={15} />
                </button>
                <button onClick={() => fetchEnrolments(meta.page + 1)} disabled={meta.page >= meta.totalPages}
                  className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ArrowRight2 size={15} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default CourseEnrolmentsPage;
