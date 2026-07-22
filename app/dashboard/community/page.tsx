"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  SearchIcon,
  Globe,
  Lock,
  Users,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { communityService } from "@/lib/api-services";
import Button from "@/app/components/Button";
import Link from "next/link";
import { CreateCommunityModal } from "./list/components/CreateCommunityModal";
import { CommunitySidebar } from "./list/components/CommunitySidebar";
import { CommunityChatView } from "./list/components/CommunityChatView";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Community {
  id: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  privacy: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
  memberCount?: number;
  myRole?: string | null;
  _count?: { members: number; messages: number };
}

// ── Explore community card ────────────────────────────────────────────────────

// Clicking the card navigates to the community detail page.
// The Join badge / button is a visual indicator only — joining happens on the detail page.
const ExploreCard = ({
  community,
  isJoined,
}: {
  community: Community;
  isJoined: boolean;
}) => {
  const initial = community.name.charAt(0).toUpperCase();
  const memberCount = community.memberCount ?? community._count?.members ?? 0;
  const isPrivate = community.privacy !== "PUBLIC";

  return (
    <Link href={`/dashboard/community/${community.id}`}>
      <div className="bg-white dark:bg-[#181A1F] border border-[#E2E3E5] dark:border-[#2D313A] rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col cursor-pointer group">
        {/* Cover */}
        <div className="relative bg-[#180426] h-[140px] flex items-center justify-center overflow-hidden">
          {community.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={community.coverImage}
              alt={community.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <span className="text-white text-5xl font-bold opacity-15">
              {initial}
            </span>
          )}
          <span
            className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              isPrivate
                ? "bg-[#F8F9FC]/90 text-[#363F72] border border-[#D5D9EB]"
                : "bg-[#ECFDF3]/90 border border-[#ABEFC6] text-[#067647]"
            }`}
          >
            {isPrivate ? <Lock size={10} /> : <Globe size={10} />}
            {community.privacy === "PUBLIC"
              ? "Public"
              : community.privacy === "PRIVATE"
                ? "Private"
                : "Invite Only"}
          </span>
          {isJoined && (
            <span className="absolute top-3 right-3 bg-[#ECFDF3]/90 border border-[#ABEFC6] text-[#067647] text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle size={10} /> Joined
            </span>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-3 flex-1 flex flex-col gap-2">
          <h3 className="font-bold text-[#180426] dark:text-white text-sm leading-snug line-clamp-1 group-hover:text-[#870BD6] transition-colors">
            {community.name}
          </h3>
          {community.description && (
            <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] leading-relaxed line-clamp-2">
              {community.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-1">
            <span className="flex items-center gap-1.5 text-xs text-[#60666B] dark:text-[#9CA3AF]">
              <Users size={13} />
              {memberCount.toLocaleString()} member
              {memberCount !== 1 ? "s" : ""}
            </span>
            <span className="text-xs font-semibold text-[#870BD6] group-hover:underline">
              {isJoined ? "Open chat →" : "View →"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ── Explore tab ───────────────────────────────────────────────────────────────

const ExploreTab = ({
  joinedIds,
  search,
  onClearSearch,
}: {
  joinedIds: Set<string>;
  onJoined: (id: string) => void;
  onSwitchToMine: () => void;
  search: string;
  onClearSearch: () => void;
}) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    communityService
      .getAll({ limit: 50 })
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        setCommunities(Array.isArray(data) ? data : []);
      })
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="px-4 lg:px-12 py-6 border-t border-[#D2D9DF] dark:border-[#2D313A]">
      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#181A1F] border border-[#E2E3E5] dark:border-[#2D313A] rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="h-[140px] bg-gray-200 dark:bg-[#2D313A]" />
              <div className="px-4 py-3 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-[#252830] rounded w-2/3" />
                <div className="h-3 bg-gray-200 dark:bg-[#252830] rounded" />
                <div className="h-3 bg-gray-200 dark:bg-[#252830] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty: no communities at all */}
      {!loading && communities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center">
            <BookOpen size={28} className="text-[#870BD6]" />
          </div>
          <p className="text-base font-semibold text-[#180426] dark:text-white">
            No communities yet
          </p>
          <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] max-w-xs">
            No communities have been created yet. Check back soon — new
            communities are added regularly.
          </p>
        </div>
      )}

      {/* Empty: search no results */}
      {!loading && communities.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center">
            <SearchIcon size={24} className="text-[#870BD6]" />
          </div>
          <p className="text-base font-semibold text-[#180426] dark:text-white">
            No results for &quot;{search}&quot;
          </p>
          <button
            onClick={onClearSearch}
            className="text-sm text-[#870BD6] underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Grid — each card is a Link to the community detail page */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((c) => (
            <ExploreCard
              key={c.id}
              community={c}
              isJoined={joinedIds.has(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── My Communities tab ────────────────────────────────────────────────────────

const MyCommunitiesTab = ({
  openModal,
  isMobile,
  refreshKey,
  onLeave,
  search,
}: {
  openModal: () => void;
  isMobile: boolean;
  refreshKey: number;
  onLeave: (id: string) => void;
  search: string;
}) => {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    communityService
      .getMine()
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        setCommunities(Array.isArray(data) ? data : []);
      })
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleLeave = useCallback(
    (id: string) => {
      setCommunities((prev) => prev.filter((c) => c.id !== id));
      setSelectedCommunity(null);
      onLeave(id);
    },
    [onLeave],
  );

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row h-[calc(100vh-150px)] border-t border-[#D2D9DF] dark:border-[#2D313A]">
        <div className="flex flex-col gap-2 w-full lg:w-72 px-4 pt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#252830] shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-200 dark:bg-[#252830] rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-[#252830] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 gap-5 text-center border-t border-[#D2D9DF] dark:border-[#2D313A]">
        <div className="w-20 h-20 rounded-full bg-[#F5EBFF] dark:bg-[#181A1F] flex items-center justify-center">
          <img
            src="/emptyCommunity.svg"
            className="w-12 h-12"
            alt=""
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <Users size={32} className="text-[#870BD6] hidden" />
        </div>
        <div className="space-y-2 max-w-sm">
          <p className="text-lg font-bold text-[#180426] dark:text-white">No communities yet</p>
          <p className="text-sm text-[#60666B] dark:text-[#9CA3AF]">
            You haven&apos;t joined any communities yet. Discover communities
            and grow together with other believers.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            customClass="!w-fit px-6 !h-[44px] !text-white"
            type="button"
            onClick={openModal}
          >
            <p className="flex items-center gap-1.5">
              <Plus stroke="white" size={16} /> Create community
            </p>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-150px)] border-t border-[#D2D9DF] dark:border-[#2D313A]">
      <CommunitySidebar
        communities={communities}
        selectedCommunity={selectedCommunity}
        onSelectCommunity={(c) => setSelectedCommunity(c as Community)}
        externalSearch={search}
      />
      {isMobile ? (
        selectedCommunity ? (
          <CommunityChatView
            community={selectedCommunity}
            setSelectedCommunity={setSelectedCommunity}
            onLeave={handleLeave}
            onCoverUpdated={(id, url) => {
              setCommunities((prev) => prev.map((c) => c.id === id ? { ...c, coverImage: url } : c));
              setSelectedCommunity((prev) => prev?.id === id ? { ...prev, coverImage: url } : prev);
            }}
          />
        ) : null
      ) : selectedCommunity ? (
        <CommunityChatView
          community={selectedCommunity}
          setSelectedCommunity={setSelectedCommunity}
          onLeave={handleLeave}
          onCoverUpdated={(id, url) => {
            setCommunities((prev) => prev.map((c) => c.id === id ? { ...c, coverImage: url } : c));
            setSelectedCommunity((prev) => prev?.id === id ? { ...prev, coverImage: url } : prev);
          }}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
          <div className="w-16 h-16 rounded-full bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center">
            <Users size={26} className="text-[#870BD6]" />
          </div>
          <p className="text-base font-semibold text-[#180426] dark:text-white">
            Select a community
          </p>
          <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] max-w-xs">
            Choose a community from the list to start chatting.
          </p>
        </div>
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState<"communities" | "explore">(
    "communities",
  );
  const [openModal, setOpenModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  useEffect(() => {
    const check = () =>
      setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleCreateCommunity = async (formData: {
    name: string;
    description: string;
    isPrivate: boolean;
    banner: string;
    friends: Array<{ id: string; role?: "admin" | "member" | "added" }>;
  }) => {
    const created = (await communityService.create({
      name: formData.name,
      description: formData.description || undefined,
      privacy: formData.isPrivate ? "PRIVATE" : "PUBLIC",
      coverImage: formData.banner || undefined,
    })) as { id: string };

    const toInvite = formData.friends.filter(
      (f) => f.role === "added" || f.role === "admin" || f.role === "member",
    );
    if (created?.id && toInvite.length > 0) {
      await Promise.allSettled(
        toInvite.map((f) =>
          communityService.invite(created.id, { recipientId: f.id }),
        ),
      );
    }
    setOpenModal(false);
    setRefreshKey((k) => k + 1);
  };

  const handleJoined = (id: string) => {
    setJoinedIds((prev) => new Set([...prev, id]));
    setRefreshKey((k) => k + 1);
  };

  const handleLeft = (id: string) => {
    setJoinedIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setRefreshKey((k) => k + 1);
  };

  const TABS = [
    { value: "communities" as const, label: "Your Communities" },
    { value: "explore" as const, label: "Explore" },
  ];

  const switchTab = (tab: "communities" | "explore") => {
    setActiveTab(tab);
    setSearch("");
  };

  return (
    <DashboardLayout custom={true}>
      {openModal && (
        <CreateCommunityModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onComplete={handleCreateCommunity}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center px-4 lg:px-12 mt-6 lg:mt-16 pb-[27px] lg:pb-8 border-b border-[#D2D9DF] dark:border-[#2D313A]">
        <h1 className="text-2xl lg:text-[32px] leading-none font-bold dark:text-white">
          Community
        </h1>
        <div className="flex items-center gap-3">
          <Button
            customClass="!w-fit px-5 !h-[44px] !text-white hidden lg:flex"
            type="button"
            onClick={() => setOpenModal(true)}
          >
            <p className="flex items-center gap-1.5">
              <Plus stroke="white" size={16} /> Create a community
            </p>
          </Button>
          {isMobile && (
            <button
              onClick={() => setOpenModal(true)}
              className="w-10 h-10 rounded-full bg-linear-to-b from-[#A967F1] to-[#5B26B1] flex items-center justify-center text-white"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-[#121316] min-h-screen">
        {/* Tab pills + search row */}
        <div className="px-4 lg:px-12 py-5 flex items-center justify-between gap-4">
          <div className="flex gap-3 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => switchTab(tab.value)}
                className={`border px-4.5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.value
                    ? "bg-white dark:bg-[#252830] border-black dark:border-transparent font-semibold text-[#180426] dark:text-white"
                    : "text-[#4E5255] dark:text-[#9CA3AF] border-[#D2D9DF] dark:border-[#2D313A] hover:border-gray-400 dark:hover:border-[#717784]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative hidden sm:block w-56 lg:w-72 shrink-0">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#717784] pointer-events-none" />
            <input
              type="text"
              placeholder={
                activeTab === "communities"
                  ? "Search your communities…"
                  : "Search communities…"
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-[#D2D9DF] dark:border-[#2D313A] rounded-full text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10 bg-white dark:bg-[#252830] dark:text-white dark:placeholder:text-[#717784] transition-colors"
            />
          </div>
        </div>
        {activeTab === "communities" && (
          <MyCommunitiesTab
            openModal={() => setOpenModal(true)}
            isMobile={isMobile}
            refreshKey={refreshKey}
            onLeave={handleLeft}
            search={search}
          />
        )}
        {activeTab === "explore" && (
          <ExploreTab
            joinedIds={joinedIds}
            onJoined={handleJoined}
            onSwitchToMine={() => setActiveTab("communities")}
            search={search}
            onClearSearch={() => setSearch("")}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CommunityPage;
