'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BookOpen, Search, X, Trash2, ChevronLeft, ChevronRight,
  Eye, EyeOff, Users, ChevronRight as Arrow,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { adminService } from '@/lib/api-services';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminCourse {
  id: string;
  title: string;
  status: string;
  level: string;
  isFree: boolean;
  enrollmentCount: number;
  author: { id: string; firstName: string; lastName: string; email: string } | null;
  category: { name: string } | null;
  createdAt: string;
  publishedAt: string | null;
}

interface Meta { total: number; page: number; limit: number; totalPages: number; }

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toUpperCase();
  const cls =
    s === 'PUBLISHED' ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]' :
    s === 'DRAFT'     ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]' :
    s === 'ARCHIVED'  ? 'bg-[#F8F9FC] text-[#363F72] border-[#D5D9EB]' :
                        'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      {s.charAt(0) + s.slice(1).toLowerCase()}
    </span>
  );
};

// ── Level badge ───────────────────────────────────────────────────────────────

const LevelBadge = ({ level }: { level: string }) => {
  const cls =
    level === 'BEGINNER'     ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]' :
    level === 'INTERMEDIATE' ? 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]' :
                               'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]';
  const label =
    level === 'BEGINNER' ? 'Foundational' :
    level === 'INTERMEDIATE' ? 'Intermediate' : 'Advanced';
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      {label}
    </span>
  );
};

// ── Confirm Delete Modal ──────────────────────────────────────────────────────

const ConfirmDeleteModal = ({
  course, onConfirm, onCancel, loading,
}: {
  course: AdminCourse; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
      <div className="w-11 h-11 rounded-full bg-[#FEF3F2] flex items-center justify-center mb-4">
        <Trash2 size={20} color="#B42318" />
      </div>
      <h3 className="text-base font-bold text-gray-900">Delete course?</h3>
      <p className="text-sm text-[#60666B] mt-2">
        This will remove <span className="font-semibold text-gray-900">{course.title}</span> and all its content. This action cannot be undone.
      </p>
      <div className="flex gap-3 mt-6">
        <button onClick={onCancel}
          className="flex-1 h-10 rounded-xl border border-[#D2D9DF] text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 h-10 rounded-xl bg-[#B42318] text-sm font-semibold text-white hover:bg-[#912018] transition-colors disabled:opacity-60">
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminCoursesPage = () => {
  const router = useRouter();

  const [courses,       setCourses]      = useState<AdminCourse[]>([]);
  const [meta,          setMeta]         = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading,       setLoading]      = useState(true);
  const [search,        setSearch]       = useState('');
  const [statusFilter,  setStatusFilter] = useState('');
  const [toDelete,      setToDelete]     = useState<AdminCourse | null>(null);
  const [deleting,      setDeleting]     = useState(false);
  const [toggling,      setToggling]     = useState<string | null>(null);

  const fetchCourses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getCourses({
        page, limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      }) as { data: AdminCourse[]; meta: Meta };
      setCourses(res.data ?? []);
      setMeta(res.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchCourses(1); }, [fetchCourses]);

  const handleToggleStatus = async (course: AdminCourse) => {
    const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setToggling(course.id);
    try {
      await adminService.updateCourseStatus(course.id, newStatus);
      setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, status: newStatus } : c));
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteCourse(toDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== toDelete.id));
      setMeta((m) => ({ ...m, total: m.total - 1 }));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white min-h-full px-4 lg:px-10 pt-6 pb-10">

        {toDelete && (
          <ConfirmDeleteModal
            course={toDelete}
            onConfirm={handleDelete}
            onCancel={() => setToDelete(null)}
            loading={deleting}
          />
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">Courses</h1>
          <p className="text-sm text-[#60666B] mt-1">
            {loading ? 'Loading…' : `${meta.total} total course${meta.total !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 h-10 border border-[#D2D9DF] rounded-xl text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 border border-[#D2D9DF] rounded-xl text-sm bg-white focus:outline-none focus:border-[#870BD6] min-w-[150px]"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8EF] bg-[#F8F9FC]">
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Course</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Author</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Level</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Enrolments</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Created</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8EF]">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                      <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
                      <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded-full w-24" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-7 bg-gray-200 rounded-lg w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center text-[#60666B] text-sm">
                      <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
                      No courses found
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#F5EBFF] flex items-center justify-center flex-shrink-0">
                            <BookOpen size={16} className="text-[#870BD6]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[200px]">{course.title}</p>
                            {course.isFree && (
                              <span className="text-[10px] font-semibold text-[#067647]">Free</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#60666B] whitespace-nowrap">
                        {course.author ? `${course.author.firstName} ${course.author.lastName}` : '—'}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={course.status} /></td>
                      <td className="px-5 py-4"><LevelBadge level={course.level} /></td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => router.push(`/dashboard/admin/courses/${course.id}/enrolments`)}
                          className="flex items-center gap-1.5 text-[13px] text-[#870BD6] font-semibold hover:underline"
                        >
                          <Users size={13} />
                          {course.enrollmentCount}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                        {new Date(course.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleStatus(course)}
                            disabled={toggling === course.id}
                            title={course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              course.status === 'PUBLISHED'
                                ? 'text-[#B54708] hover:bg-[#FFFAEB]'
                                : 'text-[#067647] hover:bg-[#ECFDF3]'
                            }`}
                          >
                            {course.status === 'PUBLISHED' ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button
                            onClick={() => setToDelete(course)}
                            title="Delete course"
                            className="p-2 rounded-lg text-gray-400 hover:bg-[#FEF3F2] hover:text-[#B42318] transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/admin/courses/${course.id}/enrolments`)}
                            title="View enrolments"
                            className="p-2 rounded-lg text-gray-400 hover:bg-[#F5EBFF] hover:text-[#870BD6] transition-colors"
                          >
                            <Arrow size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#E3E8EF]">
              <p className="text-[12px] text-[#60666B]">
                {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} courses
              </p>
              <div className="flex gap-1">
                <button onClick={() => fetchCourses(meta.page - 1)} disabled={meta.page <= 1}
                  className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={15} />
                </button>
                <button onClick={() => fetchCourses(meta.page + 1)} disabled={meta.page >= meta.totalPages}
                  className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminCoursesPage;
