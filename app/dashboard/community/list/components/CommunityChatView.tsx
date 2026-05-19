"use client";

import {
  ArrowLeft, BellOff, ChartAreaIcon, LogOut, MoreVerticalIcon,
  Search, Settings, Send, Trash,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EventCard } from "./EventCard";
import { MessageBubble } from "./MessageBubble";
import Button from "@/app/components/Button";
import CustomPopover from "@/app/components/Popover";
import { communityService } from "@/lib/api-services";
import { useAuth } from "@/context/AuthContext";

interface ApiMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

type CommunityChatViewProps = {
  community: {
    id: string;
    name: string;
    [key: string]: unknown;
  };
  setSelectedCommunity: (community: any) => void;
};

type PopoverState = { visible: boolean; rowData: null | any };

export const CommunityChatView: React.FC<CommunityChatViewProps> = ({ community, setSelectedCommunity }) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [popover, setPopover] = useState<PopoverState>({ visible: false, rowData: null });

  const fetchMessages = useCallback(() => {
    communityService.getMessages(community.id, { limit: 50 })
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        const items: ApiMessage[] = Array.isArray(data) ? data : [];
        // API returns newest first — reverse for chronological display
        setMessages([...items].reverse());
      })
      .catch(() => {});
  }, [community.id]);

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Poll every 5 seconds for new messages
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || sending) return;
    setSending(true);
    setMessageText('');
    try {
      await communityService.sendMessage(community.id, text);
      fetchMessages();
    } catch {
      setMessageText(text); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = useCallback(() => {
    setPopover((prev) => ({ ...prev, visible: false, rowData: null }));
  }, []);

  const popoverContent = useMemo(() => [
    { item: "Settings", icon: <Settings className="w-[14px] h-[14px]" />, onClick: () => {} },
    { item: "Leave",    icon: <LogOut className="w-[14px] h-[14px] rotate-180" />, onClick: () => {} },
    { item: "Mute",     icon: <BellOff className="w-[14px] h-[14px]" />, onClick: () => {} },
    { item: "Delete",   icon: <Trash className="w-[14px] h-[14px]" stroke="red" />, onClick: () => {} },
  ], []);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  };

  return (
    <div className="h-[calc(100vh-150px)] relative" ref={parentRef}>
      {/* Header */}
      <div className="h-[56px] px-5 py-3 border-b border-[#D2D9DF] flex items-center justify-between relative">
        <div className="flex gap-2 items-center">
          <ArrowLeft className="block lg:hidden cursor-pointer" onClick={() => setSelectedCommunity(null)} />
          <p className="font-semibold text-[#180426]">{community.name}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Search />
          <Button
            customClass="!bg-transparent"
            buttonType="custom"
            onClick={() => setPopover((prev) => ({ ...prev, visible: !prev.visible }))}
            ref={anchorRef}
          >
            <MoreVerticalIcon />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-full max-h-[78%] overflow-auto px-8 pt-6 hide-scrollbar w-full">
        <EventCard />
        {messages.length === 0 ? (
          <p className="text-center text-sm text-[#60666B] mt-8">No messages yet. Be the first to say something!</p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={{
                id: 0,
                author: msg.sender
                  ? `${msg.sender.firstName} ${msg.sender.lastName}`
                  : 'Unknown',
                text: msg.content,
                time: formatTime(msg.createdAt),
                avatar: msg.sender?.avatarUrl ?? '',
              }}
              isOwnMessage={msg.senderId === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-8 py-4 pb-6 bg-white border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#fafafa] rounded-3xl border border-gray-200">
          <ChartAreaIcon className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Write a message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border-none bg-transparent outline-none text-sm font-normal text-black placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || sending}
            className="shrink-0 text-[#870BD6] disabled:opacity-30 hover:text-[#5B26B1] transition-colors"
          >
            <Send size={18} />
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
