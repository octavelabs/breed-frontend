'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  People, SearchNormal1, CloseCircle, Trash, ShieldSlash, ShieldTick, ArrowLeft2, ArrowRight2, Lock1, Global,
} from 'iconsax-react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { adminService } from '@/lib/api-services';
import AdminConfirmModal from '@/app/components/admin/AdminConfirmModal';
import Toast from '@/app/components/Toast';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminCommunity {
  id: string;
  name: string;
  slug: string;
  privacy: string;
  isActive: boolean;
  memberCount: number;
  owner: { id: string; firstName: string; lastName: string; email: string } | null;
  createdAt: string;
  deletedAt: string | null;
}

interface Meta { total: number; page: number; limit: number; totalPages: number; }

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminCommunitiesPage = () => {
  const [communities,  setCommunities]  = useState<AdminCommunity[]>([]);
  const [meta,         setMeta]         = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [modal, setModal] = useState<{
    open: boolean;
    item: AdminCommunity | null;
    action: 'suspend' | 'unsuspend' | 'delete' | null;
    loading: boolean;
  }>({ open: false, item: null, action: null, loading: false });

  const fetchCommunities = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getCommunities({
        page, limit: 20,
        search: search || undefined,
        status: statusFilter || undefined,
      }) as { data: AdminCommunity[]; meta: Meta };
      setCommunities(res.data ?? []);
      setMeta(res.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch {
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchCommunities(1); }, [fetchCommunities]);

  const openModal = (item: AdminCommunity, action: 'suspend' | 'unsuspend' | 'delete') => {
    setModal({ open: true, item, action, loading: false });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleConfirm = async () => {
    if (!modal.item || !modal.action) return;
    const { item, action } = modal;
    setModal((m) => ({ ...m, loading: true }));
    try {
      if (action === 'delete') {
        await adminService.deleteCommunity(item.id);
        setCommunities((prev) => prev.filter((c) => c.id !== item.id));
        setMeta((m) => ({ ...m, total: m.total - 1 }));
        setToast({ message: `"${item.name}" has been deleted.`, type: 'success' });
      } else {
        const isActive = action === 'unsuspend';
        await adminService.updateCommunityStatus(item.id, isActive);
        setCommunities((prev) => prev.map((c) => c.id === item.id ? { ...c, isActive } : c));
        setToast({
          message: isActive ? `"${item.name}" has been restored.` : `"${item.name}" has been suspended.`,
          type: 'success',
        });
      }
      closeModal();
    } catch {
      setModal((m) => ({ ...m, loading: false }));
      setToast({ message: `Failed to ${action} community. Please try again.`, type: 'error' });
    }
  };

  const getModalConfig = () => {
    const name = modal.item?.name ?? '';
    switch (modal.action) {
      case 'suspend':
        return { iconType: 'destructive' as const, title: 'Suspend community?', description: `"${name}" will be hidden from users and members won't be able to post.`, confirmLabel: 'Suspend' };
      case 'unsuspend':
        return { iconType: 'constructive' as const, title: 'Unsuspend community?', description: `"${name}" will be restored and visible to members again.`, confirmLabel: 'Unsuspend' };
      case 'delete':
        return { iconType: 'destructive' as const, title: 'Delete community?', description: `This will remove "${name}" and all its content. This action cannot be undone.`, confirmLabel: 'Delete' };
      default:
        return { iconType: 'neutral' as const, title: '', description: '', confirmLabel: 'Confirm' };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white min-h-full px-4 lg:px-10 pt-6 pb-10">

        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

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

        <div className="mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">Communities</h1>
          <p className="text-sm text-[#60666B] mt-1">
            {loading ? 'Loading…' : `${meta.total} total communit${meta.total !== 1 ? 'ies' : 'y'}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <SearchNormal1 size={15} className="absolute left-3 top-1/2 -translate-y-1/2" color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search by name or owner…"
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
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8EF] bg-[#F8F9FC]">
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B]">Community</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Owner</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Privacy</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Members</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Created</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8EF]">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                      <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded-full w-16" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-10" /></td>
                      <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-7 bg-gray-200 rounded-lg w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : communities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center text-[#60666B] text-sm">
                      <People size={32} className="mx-auto mb-3" color="#D1D5DB" />
                      No communities found
                    </td>
                  </tr>
                ) : (
                  communities.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#F0FDF9] flex items-center justify-center flex-shrink-0">
                            <People size={16} color="#0F766E" />
                          </div>
                          <p className="font-semibold text-gray-900 truncate max-w-[180px]">{c.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#60666B] whitespace-nowrap">
                        {c.owner ? `${c.owner.firstName} ${c.owner.lastName}` : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1 text-[12px] text-[#60666B]">
                          {c.privacy === 'PUBLIC'
                            ? <><Global size={12} color="#60666B" /> Public</>
                            : <><Lock1 size={12} color="#60666B" /> Private</>}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-[#60666B]">{c.memberCount}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                          c.isActive
                            ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]'
                            : 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]'
                        }`}>
                          {c.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openModal(c, c.isActive ? 'suspend' : 'unsuspend')}
                            title={c.isActive ? 'Suspend' : 'Unsuspend'}
                            className={`p-2 rounded-lg transition-colors ${
                              c.isActive
                                ? 'text-[#B42318] hover:bg-[#FEF3F2]'
                                : 'text-[#067647] hover:bg-[#ECFDF3]'
                            }`}
                          >
                            {c.isActive
                              ? <ShieldSlash size={15} color="#B42318" />
                              : <ShieldTick size={15} color="#067647" />
                            }
                          </button>
                          <button
                            onClick={() => openModal(c, 'delete')}
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
                {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} communities
              </p>
              <div className="flex gap-1">
                <button onClick={() => fetchCommunities(meta.page - 1)} disabled={meta.page <= 1}
                  className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors">
                  <ArrowLeft2 size={15} color="#6B7280" />
                </button>
                <button onClick={() => fetchCommunities(meta.page + 1)} disabled={meta.page >= meta.totalPages}
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

export default AdminCommunitiesPage;
