"use client";

import {
  ArrowLeft,
  BellOff,
  ChevronUp,
  LogOut,
  MessagesSquare,
  MoreVerticalIcon,
  Send,
  Settings,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import Button from "@/app/components/Button";
import CustomPopover from "@/app/components/Popover";
import Toast from "@/app/components/Toast";
import { communityService } from "@/lib/api-services";
import { useAuth } from "@/context/AuthContext";
import { markRead, updateMessages } from "../../lib/unreadTracker";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApiMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
}

type CommunityChatViewProps = {
  community: {
    id: string;
    name: string;
    coverImage?: string | null;
    memberCount?: number;
    myRole?: string | null;
    _count?: { members?: number; messages?: number };
  };
  setSelectedCommunity: (community: any) => void;
  onLeave?: (communityId: string) => void;
  onCoverUpdated?: (communityId: string, url: string) => void;
};

type PopoverState = { visible: boolean; rowData: null | any };

// ── Date divider ──────────────────────────────────────────────────────────────

const DateDivider = ({ date }: { date: string }) => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 border-t border-[#F0F2F4] dark:border-[#2D313A]" />
    <span className="shrink-0 text-xs text-[#60666B] dark:text-[#9CA3AF] font-medium">
      {date}
    </span>
    <div className="flex-1 border-t border-[#F0F2F4] dark:border-[#2D313A]" />
  </div>
);

const formatDateLabel = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ── Chat view ─────────────────────────────────────────────────────────────────

export const CommunityChatView: React.FC<CommunityChatViewProps> = ({
  community,
  setSelectedCommunity,
  onLeave,
  onCoverUpdated: _onCoverUpdated, // destructured — available for future use
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [popover, setPopover] = useState<PopoverState>({
    visible: false,
    rowData: null,
  });

  const isOwnerOrAdmin = community.myRole === "OWNER" || community.myRole === "ADMIN";

  // Group messages by day for dividers
  const messagesWithDividers = useMemo(() => {
    const result: Array<
      { type: "message"; data: ApiMessage } | { type: "divider"; label: string }
    > = [];
    let lastDate = "";
    for (const msg of messages) {
      const dateLabel = formatDateLabel(msg.createdAt);
      if (dateLabel !== lastDate) {
        result.push({ type: "divider", label: dateLabel });
        lastDate = dateLabel;
      }
      result.push({ type: "message", data: msg });
    }
    return result;
  }, [messages]);

  // isInitial=true replaces the list and sets hasMore.
  // isInitial=false (polls) merges only new arrivals to preserve paginated history.
  const fetchMessages = useCallback((isInitial = false) => {
    communityService
      .getMessages(community.id, { limit: 50 })
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        const items: ApiMessage[] = Array.isArray(data) ? data : [];
        const newest = [...items].reverse(); // API returns newest first

        // Mark as read on every fetch so unread count stays 0 while in this chat.
        markRead(community.id);
        updateMessages(community.id, newest);

        if (isInitial) {
          setHasMore(items.length === 50);
          setMessages(newest);
        } else {
          setMessages((prev) => {
            if (prev.length === 0) return newest;
            const confirmedIds = new Set(prev.filter((m) => !m.id.startsWith("opt-")).map((m) => m.id));
            const brandNew = newest.filter((m) => !confirmedIds.has(m.id));
            if (brandNew.length === 0) return prev;
            // New messages confirmed — safe to flush any pending optimistic entries.
            return [...prev.filter((m) => !m.id.startsWith("opt-")), ...brandNew];
          });
        }
      })
      .catch(() => {});
  }, [community.id]);

  // Restart the poll interval — called after a manual fetch to avoid concurrent requests.
  const restartPoll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => fetchMessages(false), 5000);
  }, [fetchMessages]);

  // On community change: clear state, initial fetch (which also marks read), start polling.
  useEffect(() => {
    setMessages([]);
    setHasMore(false);
    fetchMessages(true);
    restartPoll();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchMessages, restartPoll]);

  // Focus the message input when the chat view mounts (Fix 6).
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Update the aria-live region whenever a new real message arrives (Fix 3).
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.id.startsWith("opt-")) return;
    const author = last.sender
      ? `${last.sender.firstName} ${last.sender.lastName}`.trim()
      : "Unknown";
    setLiveAnnouncement(`${author}: ${last.content}`);
  }, [messages]);

  // Only auto-scroll to bottom when the user is already near the bottom,
  // so reading older messages isn't interrupted by poll updates.
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load older messages via cursor-based pagination.
  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    const cursor = messages[0]?.id;
    const container = scrollContainerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;
    try {
      const res = await communityService.getMessages(community.id, { limit: 50, cursor });
      const data = (res as any)?.data ?? res;
      const items: ApiMessage[] = Array.isArray(data) ? data : [];
      const older = [...items].reverse();

      if (older.length === 0) {
        setHasMore(false);
        return;
      }
      if (older.length < 50) setHasMore(false);

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        return [...older.filter((m) => !existingIds.has(m.id)), ...prev];
      });

      // Restore scroll position after prepending older messages.
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevScrollHeight;
        }
      });
    } catch {
      // Silent — user can retry by clicking again.
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || sending) return;
    setSending(true);
    setMessageText("");

    // Append an optimistic placeholder immediately so the message appears without a round-trip.
    const optId = `opt-${Date.now()}`;
    const optMsg: ApiMessage = {
      id: optId,
      senderId: user?.id ?? "",
      content: text,
      createdAt: new Date().toISOString(),
      sender: user
        ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
          }
        : undefined,
    };
    setMessages((prev) => [...prev, optMsg]);

    try {
      const res = await communityService.sendMessage(community.id, text);
      const created = (res as any)?.data ?? res;
      setMessages((prev) => {
        const withoutOpt = prev.filter((m) => m.id !== optId);
        if (created?.id && created?.createdAt) {
          // API returned the real message — swap opt for real immediately, no extra GET needed.
          return withoutOpt.some((m) => m.id === created.id)
            ? withoutOpt
            : [...withoutOpt, created as ApiMessage];
        }
        // API didn't echo the message — keep the optimistic entry; next poll will replace it.
        return [...withoutOpt, optMsg];
      });
      restartPoll();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optId));
      setMessageText(text);
      setToast({ message: "Failed to send message. Please try again.", type: "error" });
    } finally {
      setSending(false);
    }
  };

  const handleLeave = async () => {
    setLeaveConfirmOpen(false);
    setLeaving(true);
    try {
      await communityService.leave(community.id);
      setSelectedCommunity(null);
      onLeave?.(community.id);
    } catch {
      setLeaving(false);
      setToast({ message: "Failed to leave community. Please try again.", type: "error" });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = useCallback(() => {
    setPopover((prev) => ({ ...prev, visible: false, rowData: null }));
  }, []);

  const popoverContent = useMemo(
    () => [
      ...(isOwnerOrAdmin
        ? [
            {
              item: "Manage Community",
              icon: <Settings className="w-3.5 h-3.5" />,
              onClick: () => {
                setPopover({ visible: false, rowData: null });
                router.push(`/dashboard/community/${community.id}/manage`);
              },
            },
          ]
        : []),
      {
        item: "Mute (coming soon)",
        icon: <BellOff className="w-3.5 h-3.5 opacity-50" />,
        onClick: () => {
          setPopover({ visible: false, rowData: null });
          setToast({ message: "Mute notifications is coming soon.", type: "success" });
        },
      },
      {
        item: "Leave Community",
        icon: <LogOut className="w-3.5 h-3.5" />,
        onClick: () => {
          setPopover({ visible: false, rowData: null });
          setLeaveConfirmOpen(true);
        },
      },
    ],
    [isOwnerOrAdmin, router, community.id],
  );

  const formatTime = (iso: string) =>
    new Date(iso)
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .toLowerCase();

  const memberCount = community.memberCount ?? community._count?.members ?? 0;

  return (
    <div
      className="flex-1 flex flex-col relative overflow-hidden"
      ref={parentRef}
    >
      {/* Header */}
      <div className="h-14 px-5 py-3 border-b border-[#D2D9DF] dark:border-[#2D313A] flex items-center justify-between shrink-0 bg-white dark:bg-[#181A1F]">
        <div className="flex items-center gap-2.5">
          <button
            className="block lg:hidden"
            aria-label="Go back"
            onClick={() => setSelectedCommunity(null)}
          >
            <ArrowLeft size={20} className="text-[#60666B]" />
          </button>
          <button
            onClick={() => router.push(`/dashboard/community/${community.id}`)}
            aria-label={`View ${community.name} details`}
            className="flex items-center gap-2.5 hover:opacity-75 cursor-pointer transition-opacity"
          >
            {/* Cover image — fallback letter always rendered; img hides itself on error */}
            <div className="relative w-8 h-8 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm shrink-0 overflow-hidden">
              <span aria-hidden="true">{community.name.charAt(0).toUpperCase()}</span>
              {community.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={community.coverImage}
                  alt={community.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-[#180426] dark:text-white leading-none">
                {community.name}
              </p>
              {memberCount > 0 && (
                <p className="text-[11px] text-[#60666B] dark:text-[#9CA3AF] mt-0.5 flex items-center gap-1">
                  <Users size={10} /> {memberCount.toLocaleString()} members
                </p>
              )}
            </div>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            customClass="!bg-transparent !p-1.5"
            buttonType="custom"
            aria-label="Community options"
            onClick={() =>
              setPopover((prev) => ({ ...prev, visible: !prev.visible }))
            }
            ref={anchorRef}
          >
            {leaving ? (
              <span className="inline-block w-4 h-4 rounded-full border-t-2 border-[#870BD6] animate-spin" />
            ) : (
              <MoreVerticalIcon size={18} className="text-[#60666B]" />
            )}
          </Button>
        </div>
      </div>

      {/* Visually-hidden aria-live region — announces new messages to screen readers (Fix 3) */}
      <div role="log" aria-live="polite" aria-atomic="false" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Messages — explicit bg keeps DateDivider lines and text from bleeding on any inherited surface */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar bg-white dark:bg-[#121316]">
        {/* Pagination: load older messages */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              onClick={loadMoreMessages}
              disabled={loadingMore}
              className="flex items-center gap-1.5 text-xs font-medium text-[#870BD6] hover:text-[#6B09B0] disabled:opacity-50 transition-colors"
            >
              {loadingMore ? (
                <span className="inline-block w-3.5 h-3.5 rounded-full border-t-2 border-[#870BD6] animate-spin" />
              ) : (
                <ChevronUp size={14} />
              )}
              {loadingMore ? "Loading…" : "Load earlier messages"}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center">
              <MessagesSquare size={26} className="text-[#870BD6]" />
            </div>
            <p className="text-base font-semibold text-[#180426] dark:text-white">
              No conversations yet
            </p>
            <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] max-w-xs">
              Be the first to encourage the community. Send a message below!
            </p>
          </div>
        ) : (
          messagesWithDividers.map((item, i) =>
            item.type === "divider" ? (
              <DateDivider key={`d-${i}`} date={item.label} />
            ) : (
              <MessageBubble
                key={item.data.id}
                message={{
                  id: item.data.id,
                  author: item.data.sender
                    ? `${item.data.sender.firstName} ${item.data.sender.lastName}`.trim()
                    : "Unknown",
                  text: item.data.content,
                  time: formatTime(item.data.createdAt),
                  avatar: item.data.sender?.avatarUrl ?? "",
                }}
                isOwnMessage={item.data.senderId === user?.id}
              />
            ),
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-3 bg-white dark:bg-[#181A1F] border-t border-[#E3E8EF] dark:border-[#2D313A] shrink-0">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#F8FAFC] dark:bg-[#252830] rounded-2xl border border-[#E3E8EF] dark:border-[#2D313A] focus-within:border-[#870BD6] transition-colors">
          <input
            ref={inputRef}
            type="text"
            aria-label="Write a message"
            placeholder="Write a message…"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-none bg-transparent outline-none text-sm text-[#180426] dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#717784]"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            aria-label="Send message"
            className="shrink-0 w-8 h-8 rounded-full bg-[#870BD6] flex items-center justify-center text-white disabled:opacity-30 hover:bg-[#6B09B0] transition-colors"
          >
            {sending ? (
              <span className="inline-block w-3.5 h-3.5 rounded-full border-t-2 border-white animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Leave confirmation modal */}
      {leaveConfirmOpen && (
        <div
          className="absolute inset-0 bg-black/50 z-20 flex items-end sm:items-center justify-center p-4"
          onClick={() => setLeaveConfirmOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#181A1F] rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-[#180426] dark:text-white text-base mb-1">
              Leave community?
            </h3>
            <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] mb-5">
              You can rejoin{" "}
              <span className="font-medium text-[#180426] dark:text-white">
                &ldquo;{community.name}&rdquo;
              </span>{" "}
              anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLeaveConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#D2D9DF] dark:border-[#2D313A] text-sm font-semibold text-[#180426] dark:text-white hover:bg-gray-50 dark:hover:bg-[#252830] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {leaving ? (
                  <span className="inline-block w-4 h-4 rounded-full border-t-2 border-white animate-spin" />
                ) : (
                  "Leave"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {popover.visible && (
        <CustomPopover
          parentRef={parentRef}
          buttonRef={anchorRef}
          content={popoverContent}
          handleClose={handleClose}
          hasIcon={true}
          leftOffset={80}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
};
