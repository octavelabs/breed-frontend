'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Users2, Search, X, Trash2, ShieldOff, ShieldCheck, ChevronLeft, ChevronRight, Lock, Globe,
} from 'lucide-react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { adminService } from '@/lib/api-services';

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

// ── Confirm Delete Modal ──────────────────────────────────────────────────────

const ConfirmDeleteModal = ({
  community, onConfirm, onCancel, loading,
}: {
  community: AdminCommunity; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
      <div className="w-11 h-11 rounded-full bg-[#FEF3F2] flex items-center justify-center mb-4">
        <Trash2 size={20} color="#B42318" />
      </div>
      <h3 className="text-base font-bold text-gray-900">Delete community?</h3>
      <p className="text-sm text-[#60666B] mt-2">
        This will remove <span className="font-semibold text-gray-900">{community.name}</span> and all its content. This action cannot be undone.
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

const AdminCommunitiesPage = () => {
  const [communities,  setCommunities]  = useState<AdminCommunity[]>([]);
  const [meta,         setMeta]         = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toDelete,     setToDelete]     = useState<AdminCommunity | null>(null);
  const [deleting,     setDeleting]     = useState(false);
  const [toggling,     setToggling]     = useState<string | null>(null);

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

  const handleToggleStatus = async (community: AdminCommunity) => {
    setToggling(community.id);
    try {
      await adminService.updateCommunityStatus(community.id, !community.isActive);
      setCommunities((prev) => prev.map((c) => c.id === community.id ? { ...c, isActive: !c.isActive } : c));
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteCommunity(toDelete.id);
      setCommunities((prev) => prev.filter((c) => c.id !== toDelete.id));
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
            community={toDelete}
            onConfirm={handleDelete}
            onCancel={() => setToDelete(null)}
            loading={deleting}
          />
        )}

        <div className="mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">Communities</h1>
          <p className="text-sm text-[#60666B] mt-1">
            {loading ? 'Loading…' : `${meta.total} total communit${meta.total !== 1 ? 'ies' : 'y'}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or owner…"
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
                      <Users2 size={32} className="mx-auto text-gray-300 mb-3" />
                      No communities found
                    </td>
                  </tr>
                ) : (
                  communities.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#F0FDF9] flex items-center justify-center flex-shrink-0">
                            <Users2 size={16} className="text-[#0F766E]" />
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
                            ? <><Globe size={12} /> Public</>
                            : <><Lock size={12} /> Private</>}
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
                            onClick={() => handleToggleStatus(c)}
                            disabled={toggling === c.id}
                            title={c.isActive ? 'Suspend' : 'Unsuspend'}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              c.isActive
                                ? 'text-[#B42318] hover:bg-[#FEF3F2]'
                                : 'text-[#067647] hover:bg-[#ECFDF3]'
                            }`}
                          >
                            {c.isActive ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}
                          </button>
                          <button
                            onClick={() => setToDelete(c)}
                            className="p-2 rounded-lg text-gray-400 hover:bg-[#FEF3F2] hover:text-[#B42318] transition-colors"
                          >
                            <Trash2 size={15} />
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
                  <ChevronLeft size={15} />
                </button>
                <button onClick={() => fetchCommunities(meta.page + 1)} disabled={meta.page >= meta.totalPages}
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

export default AdminCommunitiesPage;
