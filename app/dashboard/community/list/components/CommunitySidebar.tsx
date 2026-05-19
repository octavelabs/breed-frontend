"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import CommunityItem from "./CommunityItem";

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
  const [isMobile, setIsMobile]       = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeSearch = externalSearch !== undefined ? externalSearch : searchQuery;

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(activeSearch.toLowerCase())
  );

  const isHidden = isMobile && !!selectedCommunity;

  return (
    <div className={`${isHidden ? "hidden" : "flex"} lg:flex flex-col w-full lg:w-72 shrink-0 border-r border-[#E3E8EF] h-full overflow-hidden`}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <p className="text-xs font-semibold text-[#60666B] uppercase tracking-widest mb-3">
          Communities ({communities.length})
        </p>

        {/* Internal search — only shown when no external search is controlling filtering */}
        {externalSearch === undefined && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search communities"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] border border-[#E3E8EF] rounded-lg outline-none focus:border-[#870BD6] focus:ring-1 focus:ring-[#870BD6]/20 transition-colors"
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-sm text-[#60666B] text-center">
            {activeSearch ? `No results for "${activeSearch}"` : "No communities yet."}
          </p>
        ) : (
          filtered.map((community) => (
            <CommunityItem
              key={community.id}
              community={community}
              isSelected={selectedCommunity?.id === community.id}
              onClick={() => onSelectCommunity(community)}
            />
          ))
        )}
      </div>
    </div>
  );
};
