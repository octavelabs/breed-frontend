"use client";

import { useEffect, useState } from "react";
import { Plus, Users, MessageSquareText, Lock, Globe, SearchIcon, SlidersHorizontal } from "lucide-react";
import DashboardLayout from "@/app/layout/DashboardLayout";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import { communityService } from "@/lib/api-services";
import { CreateCommunityModal } from "../../community/list/components/CreateCommunityModal";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/utils/useDebounce";
import PreacherCommunityIcon from "@/app/assets/icons/preacherCommunityIcon";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Community {
  id: string;
  name: string;
  description?: string;
  privacy?: string;
  coverImage?: string;
  image?: string;
  createdAt?: string;
  _count?: { members?: number; messages?: number };
  memberCount?: number;
  messageCount?: number;
}

// ── Community Card ────────────────────────────────────────────────────────────

const CommunityCard = ({ data, onClick }: { data: Community; onClick: () => void }) => {
  const memberCount = data._count?.members ?? data.memberCount ?? 0;
  const messageCount = data._count?.messages ?? data.messageCount ?? 0;
  const isPrivate = data.privacy?.toLowerCase() === "private";
  const cover = data.coverImage ?? data.image ?? null;
  const initial = data.name?.charAt(0)?.toUpperCase() ?? "C";

  return (
    <div
      onClick={onClick}
      className="border border-[#E2E3E5] shadow-[0px_1px_2px_0px_#1018280D] cursor-pointer rounded-[16px] bg-white hover:shadow-md transition-shadow"
    >
      {/* Cover */}
      <div className="bg-gray-100 rounded-t-[16px] w-full p-[14px]">
        <div className="relative bg-[#180426] rounded-[12px] h-[160px] overflow-hidden flex items-center justify-center">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={data.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-5xl font-bold opacity-20">{initial}</span>
          )}
          {/* Privacy badge */}
          <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 ${
            isPrivate
              ? "bg-[#F8F9FC] text-[#363F72] border border-[#D5D9EB]"
              : "bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]"
          }`}>
            {isPrivate ? <Lock size={10} /> : <Globe size={10} />}
            {isPrivate ? "Private" : "Public"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-[18px]">
        <h3 className="text-sm font-semibold mb-1 leading-tight line-clamp-1">{data.name}</h3>
        {data.description && (
          <p className="text-[13px] text-[#60666B] mb-3 line-clamp-2">{data.description}</p>
        )}
        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-[5.57px]">
            <Users size={16} strokeWidth={1.5} />
            <span className="text-[13px] font-medium">{memberCount}</span>
          </div>
          <div className="flex items-center gap-[5.57px]">
            <MessageSquareText size={16} strokeWidth={1.5} />
            <span className="text-[13px] font-medium">{messageCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyCommunities = ({ onCreate }: { onCreate: () => void }) => (
  <div className="flex justify-center h-[350px] items-center">
    <div className="flex flex-col gap-4 items-center text-center max-w-xs">
      <div className="w-[80px] h-[80px] rounded-full bg-[#E7C8FF] flex items-center justify-center">
        <PreacherCommunityIcon color="#870BD6" />
      </div>
      <p className="text-base text-gray-500">
        You haven&apos;t created any community yet.
      </p>
      <p className="text-[13px] text-[#60666B]">
        Create your first community — for members, leaders, fellow pastors, or any group you serve.
      </p>
      <Button
        customClass="!w-fit px-6 !h-[48px] !text-white"
        type="button"
        onClick={onCreate}
      >
        <p className="flex items-center gap-[6px]">
          <Plus stroke="white" /> Create community
        </p>
      </Button>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const PreacherCommunityPage = () => {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350) ?? "";

  const fetchCommunities = () => {
    setLoading(true);
    communityService
      .getMine()
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        setCommunities(Array.isArray(data) ? data : []);
      })
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  };

  const handleCreateCommunity = async (formData: {
    name: string;
    description: string;
    isPrivate: boolean;
    friends: Array<{ id: string; role?: 'admin' | 'member' | 'added' }>;
  }) => {
    const created = await communityService.create({
      name: formData.name,
      description: formData.description || undefined,
      privacy: formData.isPrivate ? 'PRIVATE' : 'PUBLIC',
    }) as { id: string };

    const toInvite = formData.friends.filter((f) => f.role === 'added' || f.role === 'admin' || f.role === 'member');
    if (created?.id && toInvite.length > 0) {
      await Promise.allSettled(
        toInvite.map((f) => communityService.invite(created.id, { recipientId: f.id }))
      );
    }

    setOpenModal(false);
    fetchCommunities();
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const filtered = communities.filter((c) =>
    c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  return (
    <DashboardLayout custom={true}>
      {openModal && (
        <CreateCommunityModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onComplete={handleCreateCommunity}
        />
      )}

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 lg:px-10 pt-6 bg-white">
        <h1 className="text-[24px] lg:text-[28px] leading-none font-bold">Community</h1>
      </div>

      {/* ── List panel ── */}
      <div className="bg-white pt-6 pb-10">
        <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-[16px]">

          {/* Panel header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-[21px] mx-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Communities{!loading && `(${communities.length})`}
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  id="communitySearch"
                  name="communitySearch"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                  placeholder="Search by name"
                  variant="outlined"
                  icon={
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
                  }
                  className="!bg-white !border-[#B9C2CA] !h-[36px] rounded-full"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <SlidersHorizontal className="w-4 h-4" />
                <p className="hidden lg:block">Filter</p>
              </button>
              <Button
                customClass="!w-fit px-5 !h-[36px] !text-white !text-sm"
                type="button"
                onClick={() => setOpenModal(true)}
              >
                <p className="flex items-center gap-[6px]">
                  <Plus stroke="white" size={16} /> New
                </p>
              </Button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border border-[#E2E3E5] rounded-[16px] animate-pulse">
                  <div className="bg-gray-100 rounded-t-[16px] p-[14px]">
                    <div className="bg-gray-200 rounded-[12px] h-[160px]" />
                  </div>
                  <div className="px-4 py-[18px] space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            communities.length === 0
              ? <EmptyCommunities onCreate={() => setOpenModal(true)} />
              : (
                <div className="flex justify-center h-[200px] items-center text-gray-400 text-sm">
                  No communities match &quot;{search}&quot;
                </div>
              )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
              {filtered.map((community) => (
                <CommunityCard
                  key={community.id}
                  data={community}
                  onClick={() => router.push(`/dashboard/preacher/community/${community.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setOpenModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
        >
          <Plus stroke="white" />
        </button>
      </div>
    </DashboardLayout>
  );
};

export default PreacherCommunityPage;
