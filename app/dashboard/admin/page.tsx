'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Users, UserCheck, UserPlus, BookOpen, BookMarked,
  Users2, ShieldAlert, ChevronDown, Search, X,
  CheckCircle2, Ban, Trash2, MoreHorizontal, ChevronLeft, ChevronRight,
} from 'lucide-react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { adminService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';

// ── Types ──────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  totalCourses: number;
  publishedCourses: number;
  totalDevotionals: number;
  publishedDevotionals: number;
  totalCommunities: number;
  activeCommunities: number;
  totalMentorships: number;
  activeMentorships: number;
  pendingReports: number;
  openPrayerRequests: number;
  totalEnrollments: number;
  topCourses: { title: string; enrollmentCount: number }[];
}

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

// ── Palette ───────────────────────────────────────────────────────────────────

type Palette = { bg: string; border: string; iconBg: string; accent: string };
const PURPLE: Palette = { bg: '#FBF6FF', border: '#E7C8FF', iconBg: '#E7C8FF', accent: '#870BD6' };
const GREEN:  Palette = { bg: '#ECFDF3', border: '#ABEFC6', iconBg: '#ABEFC6', accent: '#067647' };
const AMBER:  Palette = { bg: '#FFFAEB', border: '#FEDF89', iconBg: '#FEDF89', accent: '#B54708' };
const BLUE:   Palette = { bg: '#EFF8FF', border: '#B2DDFF', iconBg: '#B2DDFF', accent: '#175CD3' };
const RED:    Palette = { bg: '#FEF3F2', border: '#FECDCA', iconBg: '#FECDCA', accent: '#B42318' };
const TEAL:   Palette = { bg: '#F0FDF9', border: '#99F6E4', iconBg: '#99F6E4', accent: '#0F766E' };

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub, Icon, palette, loading,
}: {
  label: string; value: number | string; sub?: string;
  Icon: React.ElementType; palette: Palette; loading?: boolean;
}) => (
  <div className="rounded-2xl border p-5" style={{ backgroundColor: palette.bg, borderColor: palette.border }}>
    <div className="flex items-start gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: palette.iconBg }}>
        <Icon size={20} color={palette.accent} />
      </div>
      <div>
        <p className="text-[13px] text-[#60666B]">{label}</p>
        {loading
          ? <div className="animate-pulse bg-gray-200 rounded h-6 w-10 mt-1" />
          : <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{value}</h3>
        }
        {sub && <p className="text-[12px] text-[#60666B] mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

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

// ── Confirm Delete Modal ──────────────────────────────────────────────────────

const ConfirmDeleteModal = ({
  user, onConfirm, onCancel, loading,
}: {
  user: AdminUser; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
      <div className="w-11 h-11 rounded-full bg-[#FEF3F2] flex items-center justify-center mb-4">
        <Trash2 size={20} color="#B42318" />
      </div>
      <h3 className="text-base font-bold text-gray-900">Delete user?</h3>
      <p className="text-sm text-[#60666B] mt-2">
        This will soft-delete <span className="font-semibold text-gray-900">{user.firstName} {user.lastName}</span> ({user.email}).
        They won&apos;t be able to log in.
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

// ── Role Dropdown ─────────────────────────────────────────────────────────────

const ROLES = ['USER', 'PREACHER', 'ADMIN', 'SUPER_ADMIN'];

const RoleDropdown = ({
  userId, currentRole, onChanged,
}: {
  userId: string; currentRole: string; onChanged: (role: string) => void;
}) => {
  const [open, setOpen] = useState(false);
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
      // silently keep current value on error
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        disabled={loading}
        className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors hover:opacity-80 disabled:opacity-60"
        style={{
          backgroundColor: ROLE_STYLES[currentRole]?.includes('#1A0B2E') ? '#1A0B2E' : undefined,
        }}
      >
        <RoleBadge role={currentRole} />
        {!loading && <ChevronDown size={11} className="text-gray-400 -ml-1" />}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-[#E3E8EF] rounded-xl shadow-lg z-20 py-1 min-w-[140px]">
          {ROLES.map((r) => (
            <button key={r} onClick={() => select(r)}
              className={`w-full text-left px-3 py-2 text-[12px] font-medium hover:bg-[#F8F9FC] flex items-center gap-2 ${r === currentRole ? 'text-[#870BD6]' : 'text-gray-700'}`}>
              {r === currentRole && <CheckCircle2 size={12} className="text-[#870BD6] flex-shrink-0" />}
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Users Table ───────────────────────────────────────────────────────────────

const UsersTable = ({ currentUserId }: { currentUserId: string }) => {
  const [users, setUsers]   = useState<AdminUser[]>([]);
  const [meta, setMeta]     = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [toDelete, setToDelete]     = useState<AdminUser | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleStatusToggle = async (user: AdminUser) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoading(user.id);
    try {
      await adminService.updateUserStatus(user.id, newStatus);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: newStatus } : u));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteUser(toDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== toDelete.id));
      setMeta((m) => ({ ...m, total: m.total - 1 }));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const handleRoleChange = (userId: string, role: string) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
  };

  return (
    <div className="space-y-4">
      {toDelete && (
        <ConfirmDeleteModal
          user={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or username…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 border border-[#D2D9DF] rounded-xl text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10"
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
                Array.from({ length: 8 }).map((_, i) => (
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
                    <td className="px-5 py-4"><div className="h-7 bg-gray-200 rounded-lg w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-[#60666B] text-sm">
                    <Users size={32} className="mx-auto text-gray-300 mb-3" />
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
                  const isSelf = user.id === currentUserId;
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
                              {isSelf && <span className="ml-1.5 text-[10px] text-[#870BD6] font-medium">(you)</span>}
                            </p>
                            <p className="text-[12px] text-[#60666B] truncate max-w-[180px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <RoleDropdown
                          userId={user.id}
                          currentRole={user.role}
                          onChanged={(role) => handleRoleChange(user.id, role)}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                        {user.lastLoginAt
                          ? new Date(user.lastLoginAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => handleStatusToggle(user)}
                                disabled={actionLoading === user.id}
                                title={isActive ? 'Suspend user' : 'Reactivate user'}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                  isActive
                                    ? 'text-[#B42318] hover:bg-[#FEF3F2]'
                                    : 'text-[#067647] hover:bg-[#ECFDF3]'
                                }`}
                              >
                                {isActive ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                              </button>
                              <button
                                onClick={() => setToDelete(user)}
                                title="Delete user"
                                className="p-2 rounded-lg text-gray-400 hover:bg-[#FEF3F2] hover:text-[#B42318] transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
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

      {!loading && (
        <p className="text-[12px] text-[#60666B]">
          {meta.total} total user{meta.total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

// ── Overview Tab ──────────────────────────────────────────────────────────────

const OverviewTab = () => {
  const [stats, setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then((data) => setStats(data as DashboardStats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">

      {/* Users row */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Users</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users"       value={stats?.totalUsers ?? 0}        sub="All time"         Icon={Users}      palette={PURPLE} loading={loading} />
          <StatCard label="New This Month"    value={stats?.newUsersThisMonth ?? 0} sub="Since 1st"        Icon={UserPlus}   palette={GREEN}  loading={loading} />
          <StatCard label="New This Week"     value={stats?.newUsersThisWeek ?? 0}  sub="Last 7 days"      Icon={UserCheck}  palette={BLUE}   loading={loading} />
          <StatCard label="Total Enrollments" value={stats?.totalEnrollments ?? 0}  sub="Course sign-ups"  Icon={BookMarked} palette={AMBER}  loading={loading} />
        </div>
      </section>

      {/* Content row */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Content</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Active Communities"   value={stats?.activeCommunities ?? 0}    sub={`of ${stats?.totalCommunities ?? 0} total`}    Icon={Users2}      palette={TEAL}   loading={loading} />
          <StatCard label="Published Courses"    value={stats?.publishedCourses ?? 0}     sub={`of ${stats?.totalCourses ?? 0} total`}         Icon={BookOpen}    palette={PURPLE} loading={loading} />
          <StatCard label="Published Devotionals" value={stats?.publishedDevotionals ?? 0} sub={`of ${stats?.totalDevotionals ?? 0} total`}    Icon={BookMarked}  palette={BLUE}   loading={loading} />
        </div>
      </section>

      {/* Moderation + Top Courses row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Moderation */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Moderation</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Pending Reports"      value={stats?.pendingReports ?? 0}      sub="Awaiting review"    Icon={ShieldAlert}    palette={RED}   loading={loading} />
            <StatCard label="Open Prayer Requests" value={stats?.openPrayerRequests ?? 0}  sub="Unanswered"         Icon={MoreHorizontal} palette={AMBER} loading={loading} />
          </div>
        </section>

        {/* Top Courses */}
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top Courses by Enrollment</h2>
          <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#E3E8EF] last:border-0 animate-pulse">
                  <div className="flex-1 h-3.5 bg-gray-200 rounded" />
                  <div className="h-5 bg-gray-200 rounded-full w-10" />
                </div>
              ))
            ) : !stats?.topCourses?.length ? (
              <div className="px-5 py-10 text-center text-sm text-[#60666B]">No courses yet</div>
            ) : (
              stats.topCourses.map((c, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-[#E3E8EF] last:border-0">
                  <span className="text-[12px] font-bold text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                  <p className="flex-1 text-sm font-medium text-gray-900 truncate">{c.title}</p>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FBF6FF] text-[#870BD6] border border-[#E7C8FF] whitespace-nowrap">
                    {c.enrollmentCount} enrolled
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Users'] as const;
type Tab = typeof TABS[number];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white min-h-full px-4 lg:px-10 pt-6 pb-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">Admin Dashboard</h1>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#1A0B2E] text-white border border-[#3D1A6E]">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-[#60666B] mt-1">Manage users and monitor platform health.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#E3E8EF] mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === tab
                  ? 'border-[#870BD6] text-[#870BD6]'
                  : 'border-transparent text-[#60666B] hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Overview' && <OverviewTab />}
        {activeTab === 'Users'    && <UsersTable currentUserId={user?.id ?? ''} />}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
