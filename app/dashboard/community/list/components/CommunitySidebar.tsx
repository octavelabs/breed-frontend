"use client";

import { Search } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import CommunityItem from "./CommunityItem";
import { communityService } from "@/lib/api-services";
import {
  getUnreadCount,
  subscribe as subscribeUnread,
  updateMessages,
} from "../../lib/unreadTracker";
import { useIsMobile } from "../../lib/useIsMobile";

type CommunityEntry = {
  id: string;
  name: string;
  coverImage?: string | null;
  privacy?: string;
  memberCount?: number;
  _count?: { members?: number; messages?: number };
};

type CommunitySidebarProps = {
  communities: CommunityEntry[];
  selectedCommunity: CommunityEntry | null;
  onSelectCommunity: (community: CommunityEntry) => void;
  externalSearch?: string;
};

export const CommunitySidebar: React.FC<CommunitySidebarProps> = ({
  communities,
  selectedCommunity,
  onSelectCommunity,
  externalSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const prevSelectedIdRef = useRef<string | null>(null);

  // Restore focus to the previously selected community item when the chat closes.
  useEffect(() => {
    if (!selectedCommunity && prevSelectedIdRef.current) {
      itemRefs.current.get(prevSelectedIdRef.current)?.focus();
      prevSelectedIdRef.current = null;
    } else if (selectedCommunity) {
      prevSelectedIdRef.current = selectedCommunity.id;
    }
  }, [selectedCommunity]);

  // Re-render whenever unread counts change.
  useEffect(() => subscribeUnread(forceUpdate), []);

  // While no chat is open, poll all communities every 30s so badges stay current.
  useEffect(() => {
    if (selectedCommunity || communities.length === 0) return;

    const poll = () => {
      communities.forEach((c) => {
        communityService
          .getMessages(c.id, { limit: 20 })
          .then((res: unknown) => {
            const data = (res as any)?.data ?? res;
            const items = Array.isArray(data) ? data : [];
            updateMessages(c.id, [...items].reverse());
          })
          .catch(() => {});
      });
    };

    poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, [communities, selectedCommunity]);

  // On mobile the header search bar is hidden, so always use the internal field there.
  const activeSearch = (externalSearch !== undefined && !isMobile) ? externalSearch : searchQuery;

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(activeSearch.toLowerCase())
  );

  const isHidden = isMobile && !!selectedCommunity;

  return (
    <div className={`${isHidden ? "hidden" : "flex"} lg:flex flex-col w-full lg:w-72 shrink-0 border-r border-[#E3E8EF] dark:border-[#2D313A] h-full overflow-hidden`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <p className="text-xs font-semibold text-[#60666B] dark:text-[#9CA3AF] uppercase tracking-widest mb-3">
          Communities ({communities.length})
        </p>

        {/* On desktop, defer to the header search bar when one is provided.
            On mobile, the header search is hidden so always show the internal field. */}
        {(externalSearch === undefined || isMobile) && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#717784]" />
            <input
              type="text"
              placeholder="Search communities"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] dark:bg-[#252830] border border-[#E3E8EF] dark:border-[#2D313A] rounded-lg outline-none focus:border-[#870BD6] focus:ring-1 focus:ring-[#870BD6]/20 transition-colors dark:text-white dark:placeholder:text-[#717784]"
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[#60666B] dark:text-[#9CA3AF] text-center">
            {activeSearch ? `No results for "${activeSearch}"` : "No communities yet."}
          </p>
        ) : (
          filtered.map((community) => (
            <CommunityItem
              key={community.id}
              ref={(el) => {
                if (el) itemRefs.current.set(community.id, el);
                else itemRefs.current.delete(community.id);
              }}
              community={community}
              isSelected={selectedCommunity?.id === community.id}
              unreadCount={getUnreadCount(community.id)}
              onClick={() => onSelectCommunity(community)}
            />
          ))
        )}
      </div>
    </div>
  );
};
