'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  HandHeart, Search, X, CheckCircle2, ChevronLeft, ChevronRight, EyeOff,
} from 'lucide-react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { adminService } from '@/lib/api-services';
import AdminConfirmModal from '@/app/components/admin/AdminConfirmModal';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PrayerRequest {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  isAnonymous: boolean;
  isPublic: boolean;
  answeredAt: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null } | null;
}

interface Meta { total: number; page: number; limit: number; totalPages: number; }

// ── Category badge ────────────────────────────────────────────────────────────

const CategoryBadge = ({ category }: { category: string }) => {
  const label = category?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-[#F8F9FC] text-[#363F72] border-[#D5D9EB]">
      {label}
    </span>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminPrayerRequestsPage = () => {
  const [requests,     setRequests]     = useState<PrayerRequest[]>([]);
  const [meta,         setMeta]         = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [expanded,     setExpanded]     = useState<string | null>(null);

  const [modal, setModal] = useState<{
    open: boolean;
    request: PrayerRequest | null;
    loading: boolean;
  }>({ open: false, request: null, loading: false });

  const fetchRequests = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getPrayerRequests({
        page, limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      }) as { data: PrayerRequest[]; meta: Meta };
      setRequests(res.data ?? []);
      setMeta(res.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchRequests(1); }, [fetchRequests]);

  const openModal = (request: PrayerRequest) => {
    setModal({ open: true, request, loading: false });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleConfirm = async () => {
    if (!modal.request) return;
    setModal((m) => ({ ...m, loading: true }));
    try {
      await adminService.answerPrayerRequest(modal.request.id);
      setRequests((prev) => prev.map((r) =>
        r.id === modal.request!.id
          ? { ...r, status: 'ANSWERED', answeredAt: new Date().toISOString() }
          : r,
      ));
      closeModal();
    } catch {
      setModal((m) => ({ ...m, loading: false }));
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
          iconType="constructive"
          title="Mark as answered?"
          description={`"${modal.request?.title ?? ''}" will be marked as answered and moved out of the open queue.`}
          confirmLabel="Mark Answered"
        />

        <div className="mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">Prayer Requests</h1>
          <p className="text-sm text-[#60666B] mt-1">
            {loading ? 'Loading…' : `${meta.total} ${statusFilter.toLowerCase()} request${meta.total !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or requester…"
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
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="ANSWERED">Answered</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* Request cards */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse border border-[#E3E8EF] rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-3 bg-gray-200 rounded w-64" />
                    <div className="h-3 bg-gray-200 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center border border-[#E3E8EF] rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
              <HandHeart size={22} className="text-[#870BD6]" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No prayer requests found</p>
            <p className="text-xs text-[#60666B]">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => {
              const isOpen     = r.status === 'OPEN';
              const isAnswered = r.status === 'ANSWERED';
              const isExpanded = expanded === r.id;
              const displayName = r.isAnonymous
                ? 'Anonymous'
                : r.user ? `${r.user.firstName} ${r.user.lastName}` : '—';
              const initials = r.isAnonymous || !r.user
                ? '?'
                : `${r.user.firstName?.[0] ?? ''}${r.user.lastName?.[0] ?? ''}`.toUpperCase();

              return (
                <div
                  key={r.id}
                  className="border border-[#E3E8EF] rounded-2xl overflow-hidden hover:border-[#D5B4FB] transition-colors"
                >
                  <div className="flex items-start gap-4 p-5">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center flex-shrink-0 text-[#870BD6] text-xs font-bold overflow-hidden">
                      {!r.isAnonymous && r.user?.avatarUrl
                        ? <img src={r.user.avatarUrl} alt={initials} className="w-full h-full object-cover" />
                        : initials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm truncate">{r.title}</p>
                        <CategoryBadge category={r.category} />
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          isAnswered ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]' :
                          isOpen     ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]' :
                                       'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                        </span>
                        {r.isAnonymous && (
                          <span className="flex items-center gap-1 text-[11px] text-[#60666B]">
                            <EyeOff size={11} /> Anonymous
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#60666B]">
                        By <span className="font-medium">{displayName}</span>
                        {r.user && !r.isAnonymous && (
                          <span className="ml-1 text-gray-400">· {r.user.email}</span>
                        )}
                        <span className="ml-2 text-gray-400">·</span>
                        <span className="ml-2">
                          {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </p>

                      {/* Collapsible content */}
                      {isExpanded && (
                        <p className="mt-3 text-sm text-[#4E5255] leading-relaxed border-t border-[#F0F2F4] pt-3">
                          {r.content}
                        </p>
                      )}

                      <button
                        onClick={() => setExpanded(isExpanded ? null : r.id)}
                        className="mt-2 text-[12px] text-[#870BD6] font-medium hover:underline"
                      >
                        {isExpanded ? 'Show less' : 'Read request'}
                      </button>
                    </div>

                    {/* Action */}
                    {isOpen && (
                      <button
                        onClick={() => openModal(r)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ECFDF3] text-[#067647] text-xs font-semibold border border-[#ABEFC6] hover:bg-[#D1FAE5] transition-colors flex-shrink-0"
                      >
                        <CheckCircle2 size={13} />
                        Mark Answered
                      </button>
                    )}
                    {isAnswered && r.answeredAt && (
                      <p className="text-[11px] text-[#067647] font-medium flex-shrink-0">
                        Answered {new Date(r.answeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-[12px] text-[#60666B]">
              {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </p>
            <div className="flex gap-1">
              <button onClick={() => fetchRequests(meta.page - 1)} disabled={meta.page <= 1}
                className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => fetchRequests(meta.page + 1)} disabled={meta.page >= meta.totalPages}
                className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminPrayerRequestsPage;
