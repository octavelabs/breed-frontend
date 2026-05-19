"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, SearchIcon, Globe, Lock, Users, BookOpen, X } from "lucide-react";
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
  _count?: { members: number; messages: number };
}

const GUIDELINES = [
  "Be respectful and kind to all members",
  "No spam or self-promotion without permission",
  "Keep discussions relevant to the community topic",
  "Report inappropriate behaviour to moderators",
  "Follow all applicable laws and regulations",
  "Respect intellectual property and privacy rights",
];

// ── Toast ─────────────────────────────────────────────────────────────────────

const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium ${type === "success" ? "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]" : "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]"}`}>
    {message}
    <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100"><X size={14} /></button>
  </div>
);

// ── Explore community card ────────────────────────────────────────────────────

const ExploreCard = ({
  community,
  isJoined,
  isJoining,
  onJoin,
}: {
  community: Community;
  isJoined: boolean;
  isJoining: boolean;
  onJoin: (c: Community) => void;
}) => {
  const initial     = community.name.charAt(0).toUpperCase();
  const memberCount = community._count?.members ?? 0;
  const isPrivate   = community.privacy !== "PUBLIC";

  return (
    <div className="bg-white border border-[#E2E3E5] rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Cover */}
      <div className="relative bg-[#180426] h-[140px] flex items-center justify-center overflow-hidden">
        {community.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={community.coverImage} alt={community.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-white text-5xl font-bold opacity-15">{initial}</span>
        )}
        <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
          isPrivate
            ? "bg-[#F8F9FC]/90 text-[#363F72] border border-[#D5D9EB]"
            : "bg-[#ECFDF3]/90 border border-[#ABEFC6] text-[#067647]"
        }`}>
          {isPrivate ? <Lock size={10} /> : <Globe size={10} />}
          {community.privacy === "PUBLIC" ? "Public" : community.privacy === "PRIVATE" ? "Private" : "Invite Only"}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 py-3 flex-1 flex flex-col gap-2">
        <h3 className="font-bold text-[#180426] text-sm leading-snug line-clamp-1">{community.name}</h3>
        {community.description && (
          <p className="text-xs text-[#60666B] leading-relaxed line-clamp-2">{community.description}</p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-[#60666B] mt-auto pt-1">
          <Users size={13} />
          <span>{memberCount.toLocaleString()} member{memberCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Action */}
      <div className="px-4 pb-4">
        {isJoined ? (
          <div className="w-full py-2 rounded-full text-center text-sm font-semibold text-[#067647] bg-[#ECFDF3] border border-[#ABEFC6]">
            ✓ Joined
          </div>
        ) : (
          <button
            onClick={() => onJoin(community)}
            disabled={isJoining}
            className="w-full py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-b from-[#A967F1] to-[#5B26B1] hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
          >
            {isJoining ? (
              <span className="inline-block w-4 h-4 rounded-full border-t-2 border-white animate-spin" />
            ) : null}
            {isPrivate ? "Request to Join" : "Join Community"}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Explore tab ───────────────────────────────────────────────────────────────

const ExploreTab = ({
  joinedIds,
  onJoined,
  onSwitchToMine,
}: {
  joinedIds: Set<string>;
  onJoined: (id: string) => void;
  onSwitchToMine: () => void;
}) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [joinModal, setJoinModal]     = useState<Community | null>(null);
  const [joiningId, setJoiningId]     = useState<string | null>(null);
  const [joinError, setJoinError]     = useState<string | null>(null);
  const [toast, setToast]             = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    communityService.getAll({ limit: 50 })
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        setCommunities(Array.isArray(data) ? data : []);
      })
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleJoinConfirm = async () => {
    if (!joinModal) return;
    setJoiningId(joinModal.id);
    setJoinError(null);
    try {
      await communityService.join(joinModal.id);
      // Optimistically update member count
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === joinModal.id
            ? { ...c, _count: { members: (c._count?.members ?? 0) + 1, messages: c._count?.messages ?? 0 } }
            : c
        )
      );
      onJoined(joinModal.id);
      setJoinModal(null);
      showToast(`You've joined "${joinModal.name}"!`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("already")) {
        // Already a member — treat as success
        onJoined(joinModal.id);
        setJoinModal(null);
      } else {
        setJoinError("Failed to join. Please try again.");
      }
    } finally {
      setJoiningId(null);
    }
  };

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 lg:px-12 py-6 border-t border-[#D2D9DF]">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Join modal */}
      {joinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setJoinModal(null)}>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#180426]">Join Community</h2>
              <button onClick={() => setJoinModal(null)} className="p-1 rounded-full hover:bg-gray-100">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#FBF6FF] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm shrink-0 overflow-hidden">
                {joinModal.coverImage
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={joinModal.coverImage} alt={joinModal.name} className="w-full h-full object-cover" />
                  : joinModal.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm text-[#180426]">{joinModal.name}</p>
                <p className="text-xs text-[#60666B]">
                  {(joinModal._count?.members ?? 0).toLocaleString()} members
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-[#4E5255]">
              <div className="flex items-center gap-2">
                {joinModal.privacy === "PUBLIC" ? <Globe stroke="#870BD6" size={14} /> : <Lock stroke="#870BD6" size={14} />}
                <p>{joinModal.privacy === "PUBLIC" ? "Anyone can join this community." : "This community requires approval to join."}</p>
              </div>
              <div className="flex items-center gap-2">
                <Users stroke="#870BD6" size={14} />
                <p>Everyone can interact in this community</p>
              </div>
            </div>

            <div className="bg-[#F6F8FA] rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-[#180426]">Community Guidelines</p>
              <ul className="space-y-1.5 text-xs text-[#60666B]">
                {GUIDELINES.map((g, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-[#870BD6] mt-0.5">•</span>{g}</li>
                ))}
              </ul>
            </div>

            {joinError && <p className="text-red-500 text-sm text-center">{joinError}</p>}

            <Button
              customClass="!w-full !h-[48px] !text-white"
              loading={joiningId === joinModal.id}
              onClick={handleJoinConfirm}
            >
              {joinModal.privacy === "PUBLIC" ? "Join Community" : "Request to Join"}
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search communities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-[#E2E3E5] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#870BD6]/20 focus:border-[#870BD6]"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-[#E2E3E5] rounded-2xl overflow-hidden animate-pulse">
              <div className="h-[140px] bg-gray-200" />
              <div className="px-4 py-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="px-4 pb-4"><div className="h-9 bg-gray-200 rounded-full" /></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty: no communities at all */}
      {!loading && communities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5EBFF] flex items-center justify-center">
            <BookOpen size={28} className="text-[#870BD6]" />
          </div>
          <p className="text-base font-semibold text-[#180426]">No communities yet</p>
          <p className="text-sm text-[#60666B] max-w-xs">
            No communities have been created yet. Check back soon — new communities are added regularly.
          </p>
        </div>
      )}

      {/* Empty: search no results */}
      {!loading && communities.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F5EBFF] flex items-center justify-center">
            <SearchIcon size={24} className="text-[#870BD6]" />
          </div>
          <p className="text-base font-semibold text-[#180426]">No results for &quot;{search}&quot;</p>
          <button onClick={() => setSearch("")} className="text-sm text-[#870BD6] underline">Clear search</button>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ExploreCard
              key={c.id}
              community={c}
              isJoined={joinedIds.has(c.id)}
              isJoining={joiningId === c.id}
              onJoin={setJoinModal}
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
}: {
  openModal: () => void;
  isMobile: boolean;
  refreshKey: number;
  onLeave: (id: string) => void;
}) => {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [communities, setCommunities]             = useState<Community[]>([]);
  const [loading, setLoading]                     = useState(true);

  useEffect(() => {
    setLoading(true);
    communityService.getMine()
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        setCommunities(Array.isArray(data) ? data : []);
      })
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleLeave = useCallback((id: string) => {
    setCommunities((prev) => prev.filter((c) => c.id !== id));
    setSelectedCommunity(null);
    onLeave(id);
  }, [onLeave]);

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row h-[calc(100vh-150px)] border-t border-[#D2D9DF]">
        <div className="flex flex-col gap-2 w-full lg:w-72 px-4 pt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 gap-5 text-center border-t border-[#D2D9DF]">
        <div className="w-20 h-20 rounded-full bg-[#F5EBFF] flex items-center justify-center">
          <img src="/emptyCommunity.svg" className="w-12 h-12" alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <Users size={32} className="text-[#870BD6] hidden" />
        </div>
        <div className="space-y-2 max-w-sm">
          <p className="text-lg font-bold text-[#180426]">No communities yet</p>
          <p className="text-sm text-[#60666B]">
            You haven&apos;t joined any communities yet. Discover communities and grow together with other believers.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button customClass="!w-fit px-6 !h-[44px] !text-white" type="button" onClick={openModal}>
            <p className="flex items-center gap-1.5"><Plus stroke="white" size={16} /> Create community</p>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-150px)] border-t border-[#D2D9DF]">
      <CommunitySidebar
        communities={communities}
        selectedCommunity={selectedCommunity}
        onSelectCommunity={setSelectedCommunity}
      />
      {isMobile ? (
        selectedCommunity ? (
          <CommunityChatView community={selectedCommunity} setSelectedCommunity={setSelectedCommunity} onLeave={handleLeave} />
        ) : null
      ) : (
        selectedCommunity ? (
          <CommunityChatView community={selectedCommunity} setSelectedCommunity={setSelectedCommunity} onLeave={handleLeave} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-full bg-[#F5EBFF] flex items-center justify-center">
              <Users size={26} className="text-[#870BD6]" />
            </div>
            <p className="text-base font-semibold text-[#180426]">Select a community</p>
            <p className="text-sm text-[#60666B] max-w-xs">Choose a community from the list to start chatting.</p>
          </div>
        )
      )}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState<"communities" | "explore">("communities");
  const [openModal, setOpenModal] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [joinedIds, setJoinedIds]   = useState<Set<string>>(new Set());

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleCreateCommunity = async (formData: {
    name: string;
    description: string;
    isPrivate: boolean;
    friends: Array<{ id: string; role?: "admin" | "member" | "added" }>;
  }) => {
    const created = await communityService.create({
      name: formData.name,
      description: formData.description || undefined,
      privacy: formData.isPrivate ? "PRIVATE" : "PUBLIC",
    }) as { id: string };

    const toInvite = formData.friends.filter((f) => f.role === "added" || f.role === "admin" || f.role === "member");
    if (created?.id && toInvite.length > 0) {
      await Promise.allSettled(
        toInvite.map((f) => communityService.invite(created.id, { recipientId: f.id }))
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
    setJoinedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setRefreshKey((k) => k + 1);
  };

  const TABS = [
    { value: "communities" as const, label: "Your Communities" },
    { value: "explore"     as const, label: "Explore" },
  ];

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
      <div className="flex justify-between items-center px-4 lg:px-12 mt-6 lg:mt-16 pb-0">
        <h1 className="text-2xl lg:text-[32px] leading-none font-bold">Community</h1>
        <div className="flex items-center gap-3">
          <Button customClass="!w-fit px-5 !h-[44px] !text-white hidden lg:flex" type="button" onClick={() => setOpenModal(true)}>
            <p className="flex items-center gap-1.5"><Plus stroke="white" size={16} /> Create a community</p>
          </Button>
          {isMobile && (
            <button onClick={() => setOpenModal(true)} className="w-10 h-10 rounded-full bg-[#870BD6] flex items-center justify-center text-white">
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 lg:px-12 mt-6 border-b border-[#D2D9DF]">
        <div className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? "border-b-2 border-[#870BD6] text-[#870BD6] font-semibold"
                  : "text-[#60666B] hover:text-[#180426]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white">
        {activeTab === "communities" && (
          <MyCommunitiesTab
            openModal={() => setOpenModal(true)}
            isMobile={isMobile}
            refreshKey={refreshKey}
            onLeave={handleLeft}
          />
        )}
        {activeTab === "explore" && (
          <ExploreTab
            joinedIds={joinedIds}
            onJoined={handleJoined}
            onSwitchToMine={() => setActiveTab("communities")}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CommunityPage;
