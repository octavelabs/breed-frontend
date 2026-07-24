"use client";

import { Users } from "lucide-react";
import { forwardRef } from "react";

type CommunityItemProps = {
  community: {
    id: string;
    name: string;
    coverImage?: string | null;
    memberCount?: number;
    unreadCount?: number;
    _count?: { members?: number; messages?: number };
  };
  isSelected: boolean;
  unreadCount?: number;
  onClick: () => void;
};

const CommunityItem = forwardRef<HTMLButtonElement, CommunityItemProps>(
  ({ community, isSelected, unreadCount, onClick }, ref) => {
    const memberCount = community.memberCount ?? community._count?.members ?? 0;
    const initial     = community.name.charAt(0).toUpperCase();
    const unread      = unreadCount ?? community.unreadCount ?? 0;
    const badgeLabel  = unread > 9 ? "9+" : `${unread} new`;

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-pressed={isSelected}
        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
          isSelected
            ? "bg-[#F5EBFF] dark:bg-[#2D1B4E] border-r-2 border-[#870BD6]"
            : "bg-transparent hover:bg-[#FAFAFA] dark:hover:bg-[#252830]"
        }`}
      >
        {/* Avatar — fallback letter always rendered; img overlays and hides itself on error */}
        <div className="relative w-10 h-10 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm shrink-0 overflow-hidden">
          <span aria-hidden="true">{initial}</span>
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

        {/* Name + member count */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-tight truncate ${isSelected ? "text-[#870BD6]" : "text-[#180426] dark:text-white"}`}>
            {community.name}
          </p>
          {memberCount > 0 && (
            <p className="text-[11px] text-[#60666B] dark:text-[#9CA3AF] mt-0.5 flex items-center gap-1">
              <Users size={10} /> {memberCount.toLocaleString()} member{memberCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Unread pill badge */}
        {unread > 0 && !isSelected && (
          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-semibold">
            {badgeLabel}
          </span>
        )}
      </button>
    );
  }
);

CommunityItem.displayName = "CommunityItem";

export default CommunityItem;
