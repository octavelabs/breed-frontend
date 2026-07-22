'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Check, CheckCheck, Inbox, X } from 'lucide-react';
import { notificationService } from '@/lib/api-services';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// Map notification types to in-app navigation targets
function getNotificationHref(n: Notification): string | null {
  const d = n.data ?? {};
  switch (n.type) {
    case 'MENTORSHIP_REQUEST':
      return '/dashboard/preacher/mentorship';
    case 'MENTORSHIP_ACCEPTED':
    case 'MENTORSHIP_REJECTED':
    case 'MENTORSHIP_ENDED':
    case 'MENTORSHIP_PAUSED':
    case 'MENTORSHIP_RESUMED':
      return d.mentorId ? `/dashboard/mentorship/${d.mentorId}` : '/dashboard/mentorship';
    case 'SESSION_SCHEDULED':
    case 'SESSION_UPDATED':
    case 'SESSION_CANCELLED':
      return d.sessionId ? `/dashboard/mentorship/sessions/${d.sessionId}` : '/dashboard/mentorship';
    case 'TASK_ASSIGNED':
      return d.mentorId ? `/dashboard/mentorship/${d.mentorId}` : '/dashboard/mentorship';
    case 'TASK_COMPLETED':
      return '/dashboard/preacher/mentorship';
    case 'ASSESSMENT_GRADED':
      return d.mentorId ? `/dashboard/mentorship/${d.mentorId}` : '/dashboard/mentorship';
    case 'COMMUNITY_INVITE':
      return d.communityId ? `/dashboard/community/${d.communityId}` : '/dashboard/community';
    case 'COMMUNITY_MESSAGE':
      return d.communityId ? `/dashboard/community/${d.communityId}` : '/dashboard/community';
    case 'DEVOTIONAL_PUBLISHED':
      return d.devotionalId
        ? `/dashboard/buildup?tab=devotionals&id=${d.devotionalId}`
        : '/dashboard/buildup?tab=devotionals';
    case 'NEW_FOLLOWER':
      return '/dashboard/preacher/showreel';
    case 'PRAYER_ANSWERED':
    case 'PRAYER_PRAYED':
      return '/dashboard/buildup?tab=bulletins';
    default:
      return null;
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const POLL_INTERVAL_MS = 30_000;

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Fetch unread count (lightweight poll) ─────────────────────────────────
  const fetchCount = useCallback(() => {
    notificationService
      .getUnreadCount()
      .then((res: any) => setUnreadCount(res?.count ?? res?.data?.count ?? 0))
      .catch(() => {});
  }, []);

  // ── Fetch full notification list (only when panel opens) ──────────────────
  const fetchNotifications = useCallback(() => {
    setLoading(true);
    notificationService
      .getAll({ page: 1 })
      .then((res: any) => {
        const list: Notification[] = res?.data ?? res?.items ?? (Array.isArray(res) ? res : []);
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.isRead).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Poll unread count every 30 s ──────────────────────────────────────────
  useEffect(() => {
    fetchCount();
    const id = setInterval(fetchCount, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchCount]);

  // ── Load list when panel opens ────────────────────────────────────────────
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkAsRead = async (n: Notification) => {
    if (!n.isRead) {
      await notificationService.markAsRead(n.id).catch(() => {});
      setNotifications((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    const href = getNotificationHref(n);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    await notificationService.markAllAsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setMarkingAll(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-[#252830] rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-[#9CA3AF]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#870BD6] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel — bottom sheet on mobile, dropdown on sm+ */}
      {open && (
        <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-90 w-full bg-white dark:bg-[#181A1F] rounded-t-2xl sm:rounded-2xl shadow-[0px_8px_32px_rgba(0,0,0,0.16)] dark:shadow-[0px_8px_32px_rgba(0,0,0,0.5)] border border-[#E3E8EF] dark:border-[#2D313A] z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#F0F2F4] dark:border-[#2D313A]">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[15px] text-[#180426] dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-[#F5EBFF] text-[#870BD6] px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="flex items-center gap-1 text-xs text-[#870BD6] font-medium hover:underline px-2 py-1 rounded-lg hover:bg-[#F5EBFF] transition-colors disabled:opacity-50"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#252830] rounded-lg transition-colors"
              >
                <X size={14} className="text-gray-400 dark:text-[#717784]" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[60vh] sm:max-h-100 overflow-y-auto divide-y divide-[#F5F6F7] dark:divide-[#2D313A]">
            {loading ? (
              <div className="space-y-0 divide-y divide-[#F5F6F7] dark:divide-[#2D313A]">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 px-4 py-3.5 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#252830] shrink-0" />
                    <div className="flex-1 space-y-2 pt-0.5">
                      <div className="h-3 bg-gray-100 dark:bg-[#252830] rounded w-3/4" />
                      <div className="h-3 bg-gray-100 dark:bg-[#252830] rounded w-full" />
                      <div className="h-2.5 bg-gray-100 dark:bg-[#252830] rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center">
                  <Inbox size={20} className="text-[#870BD6] dark:text-[#A855F7]" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-[#E2E4E9]">All caught up</p>
                <p className="text-xs text-[#60666B] dark:text-[#9CA3AF]">You have no notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleMarkAsRead(n)}
                  className={`w-full flex gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[#FAFBFC] dark:hover:bg-[#252830] ${
                    !n.isRead ? 'bg-[#FBF6FF] dark:bg-[#252830]/40' : ''
                  }`}
                >
                  {/* Dot indicator */}
                  <div className="shrink-0 pt-1.5">
                    <div
                      className={`w-2 h-2 rounded-full mt-0.5 ${
                        n.isRead ? 'bg-transparent' : 'bg-[#870BD6]'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${n.isRead ? 'text-[#4E5255] dark:text-[#9CA3AF]' : 'font-semibold text-[#180426] dark:text-white'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] leading-relaxed mt-0.5 line-clamp-2">
                      {n.body}
                    </p>
                    <p className="text-[11px] text-[#B9C2CA] dark:text-[#717784] mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <div className="shrink-0 self-center">
                      <Check size={13} className="text-[#870BD6]" />
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-[#F0F2F4] dark:border-[#2D313A] px-4 py-3 text-center">
              <button
                onClick={() => { setOpen(false); router.push('/dashboard/notifications'); }}
                className="text-xs font-semibold text-[#870BD6] hover:underline"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
