"use client";

import { Users } from "lucide-react";
import { useState } from "react";

type CommunityItemProps = {
  community: {
    id: string;
    name: string;
    coverImage?: string | null;
    _count?: { members?: number; messages?: number };
  };
  isSelected: boolean;
  onClick: () => void;
};

const CommunityItem: React.FC<CommunityItemProps> = ({ community, isSelected, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const memberCount = community._count?.members ?? 0;
  const initial     = community.name.charAt(0).toUpperCase();

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
        isSelected
          ? "bg-[#F5EBFF] border-r-2 border-[#870BD6]"
          : hovered
          ? "bg-[#FAFAFA]"
          : "bg-transparent"
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm shrink-0 overflow-hidden">
        {community.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={community.coverImage}
            alt={community.name}
            className="w-full h-full object-cover"
          />
        ) : (
          initial
        )}
      </div>

      {/* Name + member count */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight truncate ${isSelected ? "text-[#870BD6]" : "text-[#180426]"}`}>
          {community.name}
        </p>
        {memberCount > 0 && (
          <p className="text-[11px] text-[#60666B] mt-0.5 flex items-center gap-1">
            <Users size={10} /> {memberCount.toLocaleString()} member{memberCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default CommunityItem;
