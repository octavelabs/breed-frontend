'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Heart, Search, X, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight,
  ChevronRight as Arrow, Users, RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { adminService } from '@/lib/api-services';
import AdminConfirmModal from '@/app/components/admin/AdminConfirmModal';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminDevotionalSeries {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  isPublished: boolean;
  articleCount: number;
  subscriberCount: number;
  author: { id: string; firstName: string; lastName: string; email: string } | null;
  createdAt: string;
  deletedAt: string | null;
}

interface Meta { total: number; page: number; limit: number; totalPages: number; }

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminDevotionalsPage = () => {
  const router = useRouter();

  const [series,       setSeries]       = useState<AdminDevotionalSeries[]>([]);
  const [meta,         setMeta]         = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toggling,     setToggling]     = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [recalcResult,  setRecalcResult]  = useState<string | null>(null);

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    item: AdminDevotionalSeries | null;
    action: 'publish' | 'unpublish' | 'delete' | null;
    loading: boolean;
  }>({ open: false, item: null, action: null, loading: false });

  const fetchSeries = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getDevotionalSeries({
        page, limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      }) as { data: AdminDevotionalSeries[]; meta: Meta };
      setSeries(res.data ?? []);
      setMeta(res.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch {
      setSeries([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchSeries(1); }, [fetchSeries]);

  const openModal = (item: AdminDevotionalSeries, action: 'publish' | 'unpublish' | 'delete') => {
    setModal({ open: true, item, action, loading: false });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleConfirm = async () => {
    if (!modal.item || !modal.action) return;
    setModal((m) => ({ ...m, loading: true }));
    try {
      if (modal.action === 'delete') {
        await adminService.deleteDevotionalSeries(modal.item.id);
        setSeries((prev) => prev.filter((s) => s.id !== modal.item!.id));
        setMeta((m) => ({ ...m, total: m.total - 1 }));
      } else {
        const isPublished = modal.action === 'publish';
        await adminService.updateDevotionalSeriesStatus(modal.item.id, isPublished);
        setSeries((prev) => prev.map((s) => s.id === modal.item!.id ? { ...s, isPublished } : s));
      }
      closeModal();
    } catch {
      setModal((m) => ({ ...m, loading: false }));
    }
  };

  const getModalConfig = () => {
    const name = modal.item?.title ?? '';
    switch (modal.action) {
      case 'publish':
        return { iconType: 'constructive' as const, title: 'Publish series?', description: `"${name}" will be visible to all users.`, confirmLabel: 'Publish' };
      case 'unpublish':
        return { iconType: 'destructive' as const, title: 'Unpublish series?', description: `"${name}" will be hidden from users until republished.`, confirmLabel: 'Unpublish' };
      case 'delete':
        return { iconType: 'destructive' as const, title: 'Delete series?', description: `This will permanently remove "${name}" and all its articles. This action cannot be undone.`, confirmLabel: 'Delete' };
      default:
        return { iconType: 'neutral' as const, title: '', description: '', confirmLabel: 'Confirm' };
    }
  };

  const modalConfig = getModalConfig();

  const handleRecalculate = async () => {
    setRecalculating(true);
    setRecalcResult(null);
    try {
      const res = await adminService.recalculateDevotionalReadTimes() as { updated: number };
      setRecalcResult(`Done — ${res.updated} article${res.updated !== 1 ? 's' : ''} updated`);
    } catch {
      setRecalcResult('Failed to recalculate. Please try again.');
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white min-h-full px-4 lg:px-10 pt-6 pb-10">

        <AdminConfirmModal
          isOpen={modal.open}
          onClose={closeModal}
          onConfirm={handleConfirm}
          loading={modal.loading}
          iconType={modalConfig.iconType}
          title={modalConfig.title}
          description={modalConfig.description}
          confirmLabel={modalConfig.confirmLabel}
        />

        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">Devotionals</h1>
            <p className="text-sm text-[#60666B] mt-1">
              {loading ? 'Loading…' : `${meta.total} total series`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#D2D9DF] text-sm font-medium text-[#60666B] hover:bg-[#F5EBFF] hover:text-[#870BD6] hover:border-[#D49CFD] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={recalculating ? 'animate-spin' : ''} />
              Recalculate read times
            </button>
            {recalcResult && (
              <p className="text-xs text-[#60666B]">{recalcResult}</p>
            )}
          </div>
        </div>

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
          </select>
        </div>

        <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8EF] bg-[#F8F9FC]">
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B]">Series</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Author</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Articles</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Subscribers</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Status</th>
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
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                      <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-7 bg-gray-200 rounded-lg w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : series.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center text-[#60666B] text-sm">
                      <Heart size={32} className="mx-auto text-gray-300 mb-3" />
                      No devotional series found
                    </td>
                  </tr>
                ) : (
                  series.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FFF0F5] flex items-center justify-center flex-shrink-0">
                            <Heart size={16} className="text-[#C01048]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[220px]">{s.title}</p>
                            {s.description && (
                              <p className="text-[11px] text-[#60666B] truncate max-w-[220px]">{s.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#60666B] whitespace-nowrap">
                        {s.author ? `${s.author.firstName} ${s.author.lastName}` : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => router.push(`/dashboard/admin/devotionals/${s.id}`)}
                          className="flex items-center gap-1.5 text-[13px] text-[#870BD6] font-semibold hover:underline"
                        >
                          {s.articleCount}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1.5 text-[13px] text-[#60666B]">
                          <Users size={12} />
                          {s.subscriberCount}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          s.isPublished
                            ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]'
                            : 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                        }`}>
                          {s.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                        {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openModal(s, s.isPublished ? 'unpublish' : 'publish')}
                            disabled={toggling === s.id}
                            title={s.isPublished ? 'Unpublish' : 'Publish'}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              s.isPublished
                                ? 'text-[#B54708] hover:bg-[#FFFAEB]'
                                : 'text-[#067647] hover:bg-[#ECFDF3]'
                            }`}
                          >
                            {s.isPublished ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button
                            onClick={() => openModal(s, 'delete')}
                            className="p-2 rounded-lg text-gray-400 hover:bg-[#FEF3F2] hover:text-[#B42318] transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/admin/devotionals/${s.id}`)}
                            title="View articles"
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

          {!loading && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#E3E8EF]">
              <p className="text-[12px] text-[#60666B]">
                {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} series
              </p>
              <div className="flex gap-1">
                <button onClick={() => fetchSeries(meta.page - 1)} disabled={meta.page <= 1}
                  className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={15} />
                </button>
                <button onClick={() => fetchSeries(meta.page + 1)} disabled={meta.page >= meta.totalPages}
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

export default AdminDevotionalsPage;
