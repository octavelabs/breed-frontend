'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Heart, SearchNormal1, CloseCircle, Trash, Eye, EyeSlash, ArrowLeft2, ArrowRight2, Book1,
} from 'iconsax-react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { adminService } from '@/lib/api-services';
import AdminConfirmModal from '@/app/components/admin/AdminConfirmModal';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminArticle {
  id: string;
  title: string;
  status: string;
  isFeatured: boolean;
  readCount: number;
  reactionCount: number;
  estimatedMinutes: number;
  author: { id: string; firstName: string; lastName: string; email: string } | null;
  createdAt: string;
  publishedAt: string | null;
}

interface SeriesInfo {
  id: string;
  title: string;
}

interface Meta { total: number; page: number; limit: number; totalPages: number; }

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toUpperCase();
  const cls =
    s === 'PUBLISHED' ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]' :
    s === 'DRAFT'     ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]' :
    s === 'SCHEDULED' ? 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]' :
                        'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      {s.charAt(0) + s.slice(1).toLowerCase()}
    </span>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const SeriesArticlesPage = () => {
  const router = useRouter();
  const params = useParams();
  const seriesId = params?.seriesId as string;

  const [series,       setSeries]       = useState<SeriesInfo | null>(null);
  const [articles,     setArticles]     = useState<AdminArticle[]>([]);
  const [meta,         setMeta]         = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal state
  const [modal, setModal] = useState<{
    open: boolean;
    item: AdminArticle | null;
    action: 'publish' | 'unpublish' | 'delete' | null;
    loading: boolean;
  }>({ open: false, item: null, action: null, loading: false });

  const fetchArticles = useCallback(async (page = 1) => {
    if (!seriesId) return;
    setLoading(true);
    try {
      const res = await adminService.getDevotionalSeriesArticles(seriesId, {
        page, limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      }) as { series: SeriesInfo; data: AdminArticle[]; meta: Meta };
      setSeries(res.series ?? null);
      setArticles(res.data ?? []);
      setMeta(res.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [seriesId, search, statusFilter]);

  useEffect(() => { fetchArticles(1); }, [fetchArticles]);

  const openModal = (item: AdminArticle, action: 'publish' | 'unpublish' | 'delete') => {
    setModal({ open: true, item, action, loading: false });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleConfirm = async () => {
    if (!modal.item || !modal.action) return;
    setModal((m) => ({ ...m, loading: true }));
    try {
      if (modal.action === 'delete') {
        await adminService.deleteDevotional(modal.item.id);
        setArticles((prev) => prev.filter((a) => a.id !== modal.item!.id));
        setMeta((m) => ({ ...m, total: m.total - 1 }));
      } else {
        const newStatus = modal.action === 'publish' ? 'PUBLISHED' : 'DRAFT';
        await adminService.updateDevotionalStatus(modal.item.id, newStatus);
        setArticles((prev) => prev.map((a) => a.id === modal.item!.id ? { ...a, status: newStatus } : a));
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
        return { iconType: 'constructive' as const, title: 'Publish article?', description: `"${name}" will be visible to all subscribers.`, confirmLabel: 'Publish' };
      case 'unpublish':
        return { iconType: 'destructive' as const, title: 'Unpublish article?', description: `"${name}" will be hidden from users until republished.`, confirmLabel: 'Unpublish' };
      case 'delete':
        return { iconType: 'destructive' as const, title: 'Delete article?', description: `This will permanently delete "${name}". This action cannot be undone.`, confirmLabel: 'Delete' };
      default:
        return { iconType: 'neutral' as const, title: '', description: '', confirmLabel: 'Confirm' };
    }
  };

  const modalConfig = getModalConfig();

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

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5 text-sm">
          <button
            onClick={() => router.push('/dashboard/admin/devotionals')}
            className="text-[#60666B] hover:text-[#870BD6] transition-colors font-medium"
          >
            Devotionals
          </button>
          <span className="text-[#D2D9DF]">/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[240px]">
            {loading && !series ? '…' : (series?.title ?? 'Series')}
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">
            {series?.title ?? 'Articles'}
          </h1>
          <p className="text-sm text-[#60666B] mt-1">
            {loading ? 'Loading…' : `${meta.total} article${meta.total !== 1 ? 's' : ''} in this series`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <SearchNormal1 size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 h-10 border border-[#D2D9DF] rounded-xl text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <CloseCircle size={14} color="#9CA3AF" />
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
            <option value="SCHEDULED">Scheduled</option>
          </select>
        </div>

        <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8EF] bg-[#F8F9FC]">
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B]">Article</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Author</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Reads</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Reactions</th>
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
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-10" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-10" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-7 bg-gray-200 rounded-lg w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center text-[#60666B] text-sm">
                      <Book1 size={32} className="mx-auto mb-3" color="#D1D5DB" />
                      No articles found in this series
                    </td>
                  </tr>
                ) : (
                  articles.map((a) => (
                    <tr key={a.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FFF0F5] flex items-center justify-center flex-shrink-0">
                            <Heart size={16} color="#C01048" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[220px]">{a.title}</p>
                            <p className="text-[11px] text-[#60666B]">{a.estimatedMinutes} min read</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#60666B] whitespace-nowrap">
                        {a.author ? `${a.author.firstName} ${a.author.lastName}` : '—'}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-4 text-[13px] font-semibold text-gray-700">{a.readCount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-[13px] text-[#60666B]">{a.reactionCount}</td>
                      <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openModal(a, a.status === 'PUBLISHED' ? 'unpublish' : 'publish')}
                            title={a.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            className={`p-2 rounded-lg transition-colors ${
                              a.status === 'PUBLISHED'
                                ? 'text-[#B54708] hover:bg-[#FFFAEB]'
                                : 'text-[#067647] hover:bg-[#ECFDF3]'
                            }`}
                          >
                            {a.status === 'PUBLISHED'
                              ? <EyeSlash size={15} color="#B54708" />
                              : <Eye size={15} color="#067647" />
                            }
                          </button>
                          <button
                            onClick={() => openModal(a, 'delete')}
                            className="p-2 rounded-lg text-gray-400 hover:bg-[#FEF3F2] hover:text-[#B42318] transition-colors"
                          >
                            <Trash size={15} color="#9CA3AF" />
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
                {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} articles
              </p>
              <div className="flex gap-1">
                <button onClick={() => fetchArticles(meta.page - 1)} disabled={meta.page <= 1}
                  className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ArrowLeft2 size={15} color="#6B7280" />
                </button>
                <button onClick={() => fetchArticles(meta.page + 1)} disabled={meta.page >= meta.totalPages}
                  className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ArrowRight2 size={15} color="#6B7280" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SeriesArticlesPage;
