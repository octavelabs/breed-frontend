'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { notificationService } from '@/lib/api-services';
import { Bell, CheckCheck, Inbox, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// ── Helpers ────────────────────────────────────────────────────────────────

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
      return d.sessionId
        ? `/dashboard/mentorship/sessions/${d.sessionId}`
        : '/dashboard/mentorship';
    case 'TASK_ASSIGNED':
      return d.mentorId ? `/dashboard/mentorship/${d.mentorId}` : '/dashboard/mentorship';
    case 'TASK_COMPLETED':
      return '/dashboard/preacher/mentorship';
    case 'ASSESSMENT_GRADED':
      return d.mentorId ? `/dashboard/mentorship/${d.mentorId}` : '/dashboard/mentorship';
    case 'COMMUNITY_INVITE':
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

// Icon color per notification type
function typeAccent(type: string): string {
  if (type.startsWith('MENTORSHIP') || type.startsWith('SESSION') || type.startsWith('TASK') || type.startsWith('ASSESSMENT'))
    return 'bg-[#F5EBFF] text-[#870BD6]';
  if (type.startsWith('COMMUNITY'))
    return 'bg-[#EFF8FF] text-[#175CD3]';
  if (type.startsWith('DEVOTIONAL') || type.startsWith('NEW_FOLLOWER'))
    return 'bg-[#FFF6E5] text-[#B54708]';
  if (type.startsWith('PRAYER'))
    return 'bg-[#ECFDF3] text-[#067647]';
  return 'bg-[#F0F2F4] text-[#60666B]';
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
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupByDate(items: Notification[]): { label: string; items: Notification[] }[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups: Record<string, Notification[]> = {};
  for (const n of items) {
    const d = new Date(n.createdAt);
    let label: string;
    if (d.toDateString() === today.toDateString()) label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    (groups[label] ??= []).push(n);
  }

  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

// ── Skeleton ───────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="divide-y divide-[#F5F6F7]">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex gap-4 px-4 lg:px-12 py-4 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-2.5 bg-gray-100 rounded w-1/5" />
        </div>
      </div>
    ))}
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'unread';

export default function NotificationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<FilterTab>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    notificationService
      .getAll({ page: 1 })
      .then((res: any) => {
        const list: Notification[] = res?.data ?? res?.items ?? (Array.isArray(res) ? res : []);
        setNotifications(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await notificationService.markAsRead(n.id).catch(() => {});
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    }
    const href = getNotificationHref(n);
    if (href) router.push(href);
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    await notificationService.markAllAsRead().catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setMarkingAll(false);
  };

  const displayed = tab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const groups = groupByDate(displayed);

  return (
    <DashboardLayout custom={true}>
      {/* Header */}
      <div className="flex justify-between items-center pb-[27px] lg:pb-8 px-4 lg:px-12 mt-6 lg:mt-[64px] border-b border-[#D2D9DF]">
        <h1 className="text-[24px] lg:text-[32px] leading-none font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#870BD6] hover:underline disabled:opacity-50"
          >
            <CheckCheck size={15} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white min-h-screen">
        {/* Tab row */}
        <div className="px-4 lg:px-12 py-5 flex items-center gap-3">
          {(['all', 'unread'] as FilterTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border px-4.5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                tab === t
                  ? 'bg-white border-black font-semibold text-[#180426]'
                  : 'text-[#4E5255] border-[#D2D9DF] hover:border-gray-400'
              }`}
            >
              {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>

        <div className="border-t border-[#D2D9DF]">
          {loading ? (
            <Skeleton />
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
              <div className="w-14 h-14 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                {tab === 'unread' ? (
                  <CheckCheck size={24} className="text-[#870BD6]" />
                ) : (
                  <Inbox size={24} className="text-[#870BD6]" />
                )}
              </div>
              <p className="font-semibold text-gray-700">
                {tab === 'unread' ? "You're all caught up" : 'No notifications yet'}
              </p>
              <p className="text-sm text-[#60666B] max-w-xs">
                {tab === 'unread'
                  ? 'No unread notifications. Check back later.'
                  : "Activity from your mentorships, communities, and devotionals will appear here."}
              </p>
            </div>
          ) : (
            <div>
              {groups.map(({ label, items }) => (
                <div key={label}>
                  {/* Date group header */}
                  <p className="text-xs font-semibold text-[#60666B] uppercase tracking-wide px-4 lg:px-12 py-3 bg-[#F8F9FC] border-b border-[#F0F2F4]">
                    {label}
                  </p>

                  <div className="divide-y divide-[#F5F6F7]">
                    {items.map((n) => {
                      const accent = typeAccent(n.type);
                      const initial = n.title.charAt(0).toUpperCase();
                      const isClickable = !!getNotificationHref(n);

                      return (
                        <div
                          key={n.id}
                          onClick={() => handleClick(n)}
                          className={`flex gap-4 px-4 lg:px-12 py-4 transition-colors ${
                            !n.isRead ? 'bg-[#FBF6FF]' : 'bg-white'
                          } ${isClickable ? 'cursor-pointer hover:bg-[#F8F9FC]' : ''}`}
                        >
                          {/* Type icon bubble */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${accent}`}>
                            <Bell size={16} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm leading-snug ${!n.isRead ? 'font-semibold text-[#180426]' : 'text-[#3C3E40]'}`}>
                                {n.title}
                              </p>
                              <span className="text-[11px] text-[#B9C2CA] shrink-0 mt-0.5">
                                {timeAgo(n.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-[#60666B] leading-relaxed mt-0.5 line-clamp-2">
                              {n.body}
                            </p>
                          </div>

                          {/* Unread dot */}
                          {!n.isRead && (
                            <div className="shrink-0 self-center">
                              <div className="w-2 h-2 rounded-full bg-[#870BD6]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
