"use client";

import {
  ArrowLeft,
  BellOff,
  ChartAreaIcon,
  LogOut,
  MoreVerticalIcon,
  Search,
  Send,
  Settings,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import Button from "@/app/components/Button";
import CustomPopover from "@/app/components/Popover";
import { communityService } from "@/lib/api-services";
import { useAuth } from "@/context/AuthContext";

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
  <div className="text-center my-4 relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-[#F0F2F4]" />
    </div>
    <span className="relative inline-block bg-white px-3 text-xs text-[#60666B] font-medium">
      {date}
    </span>
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
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [localCoverImage] = useState<string | null | undefined>(community.coverImage);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [popover, setPopover] = useState<PopoverState>({
    visible: false,
    rowData: null,
  });

  const isOwnerOrAdmin = community.myRole === 'OWNER' || community.myRole === 'ADMIN';

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

  const fetchMessages = useCallback(() => {
    communityService
      .getMessages(community.id, { limit: 50 })
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        const items: ApiMessage[] = Array.isArray(data) ? data : [];
        setMessages([...items].reverse()); // API returns newest first
      })
      .catch(() => {});
  }, [community.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Poll every 5 s for new messages
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || sending) return;
    setSending(true);
    setMessageText("");
    try {
      await communityService.sendMessage(community.id, text);
      fetchMessages();
    } catch {
      setMessageText(text);
    } finally {
      setSending(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm(`Leave "${community.name}"? You can rejoin anytime.`))
      return;
    setLeaving(true);
    setPopover({ visible: false, rowData: null });
    try {
      await communityService.leave(community.id);
      setSelectedCommunity(null);
      onLeave?.(community.id);
    } catch {
      setLeaving(false);
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
        item: "Mute",
        icon: <BellOff className="w-3.5 h-3.5" />,
        onClick: () => {},
      },
      {
        item: "Leave Community",
        icon: <LogOut className="w-3.5 h-3.5" />,
        onClick: handleLeave,
      },
    ],
    [handleLeave, isOwnerOrAdmin, router, community.id],
  );

  const formatTime = (iso: string) =>
    new Date(iso)
      .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      .toLowerCase();

  const memberCount = community.memberCount ?? community._count?.members ?? 0;

  return (
    <div
      className="flex-1 flex flex-col h-[calc(100vh-150px)] relative overflow-hidden"
      ref={parentRef}
    >
      {/* Header */}
      <div className="h-14 px-5 py-3 border-b border-[#D2D9DF] flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2.5">
          <button
            className="block lg:hidden"
            onClick={() => setSelectedCommunity(null)}
          >
            <ArrowLeft size={20} className="text-[#60666B]" />
          </button>
          <button
            onClick={() => router.push(`/dashboard/community/${community.id}`)}
            className="flex items-center gap-2.5 hover:opacity-75 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm shrink-0">
              {localCoverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={localCoverImage}
                  alt={community.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                community.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-[#180426] leading-none">
                {community.name}
              </p>
              {memberCount > 0 && (
                <p className="text-[11px] text-[#60666B] mt-0.5 flex items-center gap-1">
                  <Users size={10} /> {memberCount.toLocaleString()} members
                </p>
              )}
            </div>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#60666B]">
            <Search size={18} />
          </button>
          <Button
            customClass="!bg-transparent !p-1.5"
            buttonType="custom"
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 hide-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5EBFF] flex items-center justify-center">
              <ChartAreaIcon size={26} className="text-[#870BD6]" />
            </div>
            <p className="text-base font-semibold text-[#180426]">
              No conversations yet
            </p>
            <p className="text-sm text-[#60666B] max-w-xs">
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
                  id: 0,
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
      <div className="px-5 py-3 pb-5 bg-white border-t border-[#E3E8EF] shrink-0">
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#F8FAFC] rounded-2xl border border-[#E3E8EF] focus-within:border-[#870BD6] transition-colors">
          <input
            type="text"
            placeholder="Write a message…"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-none bg-transparent outline-none text-sm text-[#180426] placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
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

    </div>
  );
};
