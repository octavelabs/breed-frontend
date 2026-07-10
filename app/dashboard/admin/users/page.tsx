'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Users, ChevronDown, Search, X, CheckCircle2,
  Ban, Trash2, ChevronLeft, ChevronRight, Check,
} from 'lucide-react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { adminService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';
import AdminConfirmModal from '@/app/components/admin/AdminConfirmModal';

// ── Types ──────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Role badge ────────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: 'bg-[#1A0B2E] text-white border-[#3D1A6E]',
  ADMIN:       'bg-[#FBF6FF] text-[#870BD6] border-[#E7C8FF]',
  PREACHER:    'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]',
  USER:        'bg-[#F8F9FC] text-[#363F72] border-[#D5D9EB]',
};

const RoleBadge = ({ role }: { role: string }) => (
  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${ROLE_STYLES[role] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
    {role.replace('_', ' ')}
  </span>
);

// ── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toUpperCase();
  const cls =
    s === 'ACTIVE'    ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]' :
    s === 'SUSPENDED' ? 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]' :
    s === 'INACTIVE'  ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]' :
                        'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
      {s.charAt(0) + s.slice(1).toLowerCase()}
    </span>
  );
};

// ── Role Dropdown ─────────────────────────────────────────────────────────────

const ROLES = ['USER', 'PREACHER', 'ADMIN', 'SUPER_ADMIN'];

const RoleDropdown = ({
  userId, currentRole, onChanged,
}: {
  userId: string; currentRole: string; onChanged: (role: string) => void;
}) => {
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = async (role: string) => {
    if (role === currentRole) { setOpen(false); return; }
    setLoading(true);
    try {
      await adminService.updateUserRole(userId, role);
      onChanged(role);
    } catch {
      // keep current value on error
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((p) => !p)}
        disabled={loading}
        className="flex items-center gap-1 disabled:opacity-60"
      >
        <RoleBadge role={currentRole} />
        {!loading && <ChevronDown size={12} className="text-gray-400 -ml-0.5 flex-shrink-0" />}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-[#E3E8EF] rounded-xl shadow-lg z-20 py-1 min-w-[148px]">
          {ROLES.map((r) => (
            <button key={r} onClick={() => select(r)}
              className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-[#F8F9FC] flex items-center gap-2 ${r === currentRole ? 'text-[#870BD6]' : 'text-gray-700'}`}>
              {r === currentRole && <Check size={12} className="text-[#870BD6] flex-shrink-0" />}
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers]   = useState<AdminUser[]>([]);
  const [meta, setMeta]     = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modal, setModal] = useState<{
    open: boolean;
    user: AdminUser | null;
    action: 'suspend' | 'reactivate' | 'delete' | null;
    loading: boolean;
  }>({ open: false, user: null, action: null, loading: false });

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({
        page,
        limit: 20,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      }) as { data: AdminUser[]; meta: Meta };
      setUsers(res.data ?? []);
      setMeta(res.meta ?? { total: 0, page: 1, limit: 20, totalPages: 1 });
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const openModal = (user: AdminUser, action: 'suspend' | 'reactivate' | 'delete') => {
    setModal({ open: true, user, action, loading: false });
  };

  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const handleConfirm = async () => {
    if (!modal.user || !modal.action) return;
    setModal((m) => ({ ...m, loading: true }));
    try {
      if (modal.action === 'delete') {
        await adminService.deleteUser(modal.user.id);
        setUsers((prev) => prev.filter((u) => u.id !== modal.user!.id));
        setMeta((m) => ({ ...m, total: m.total - 1 }));
      } else {
        const newStatus = modal.action === 'suspend' ? 'SUSPENDED' : 'ACTIVE';
        await adminService.updateUserStatus(modal.user.id, newStatus);
        setUsers((prev) => prev.map((u) => u.id === modal.user!.id ? { ...u, status: newStatus } : u));
      }
      closeModal();
    } catch {
      setModal((m) => ({ ...m, loading: false }));
    }
  };

  const getModalConfig = () => {
    const name = modal.user ? `${modal.user.firstName} ${modal.user.lastName}` : '';
    switch (modal.action) {
      case 'suspend':
        return { iconType: 'destructive' as const, title: 'Suspend user?', description: `${name} will not be able to log in until reactivated.`, confirmLabel: 'Suspend' };
      case 'reactivate':
        return { iconType: 'constructive' as const, title: 'Reactivate user?', description: `${name}'s account will be restored and they can log in again.`, confirmLabel: 'Reactivate' };
      case 'delete':
        return { iconType: 'destructive' as const, title: 'Delete user?', description: `This will soft-delete ${name} (${modal.user?.email}). They won't be able to log in.`, confirmLabel: 'Delete' };
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

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">Users</h1>
          <p className="text-sm text-[#60666B] mt-1">
            {loading ? 'Loading…' : `${meta.total} total user${meta.total !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or username…"
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 border border-[#D2D9DF] rounded-xl text-sm bg-white focus:outline-none focus:border-[#870BD6] min-w-[140px]"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="PREACHER">Preacher</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 border border-[#D2D9DF] rounded-xl text-sm bg-white focus:outline-none focus:border-[#870BD6] min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8EF] bg-[#F8F9FC]">
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">User</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Role</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Status</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Joined</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Last Login</th>
                  <th className="px-5 py-3.5" />
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
                      <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded-full w-20" /></td>
                      <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded-full w-16" /></td>
                      <td className="px-5 py-4"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-7 bg-gray-200 rounded-lg w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-20 text-center text-[#60666B] text-sm">
                      <Users size={32} className="mx-auto text-gray-300 mb-3" />
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
                    const isSelf   = user.id === currentUser?.id;
                    const isActive = user.status === 'ACTIVE';
                    return (
                      <tr key={user.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center flex-shrink-0 text-[#870BD6] text-xs font-bold overflow-hidden">
                              {user.avatarUrl
                                ? <img src={user.avatarUrl} alt={initials} className="w-full h-full object-cover" />
                                : initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate max-w-[180px]">
                                {user.firstName} {user.lastName}
                                {isSelf && (
                                  <span className="ml-1.5 text-[10px] text-[#870BD6] font-medium">(you)</span>
                                )}
                              </p>
                              <p className="text-[12px] text-[#60666B] truncate max-w-[180px]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <RoleDropdown
                            userId={user.id}
                            currentRole={user.role}
                            onChanged={(role) =>
                              setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role } : u))
                            }
                          />
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="px-5 py-4">
                          {!isSelf && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openModal(user, isActive ? 'suspend' : 'reactivate')}
                                title={isActive ? 'Suspend user' : 'Reactivate user'}
                                className={`p-2 rounded-lg transition-colors ${
                                  isActive
                                    ? 'text-[#B42318] hover:bg-[#FEF3F2]'
                                    : 'text-[#067647] hover:bg-[#ECFDF3]'
                                }`}
                              >
                                {isActive ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                              </button>
                              <button
                                onClick={() => openModal(user, 'delete')}
                                title="Delete user"
                                className="p-2 rounded-lg text-gray-400 hover:bg-[#FEF3F2] hover:text-[#B42318] transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-[#E3E8EF]">
              <p className="text-[12px] text-[#60666B]">
                {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total} users
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => fetchUsers(meta.page - 1)}
                  disabled={meta.page <= 1}
                  className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => fetchUsers(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                  className="p-2 rounded-lg border border-[#D2D9DF] disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
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

export default AdminUsersPage;
