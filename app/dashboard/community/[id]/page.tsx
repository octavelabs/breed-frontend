"use client";

import DashboardLayout from "@/app/layout/DashboardLayout";
import { ArrowLeft, Globe, Lock, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from '@/app/hooks/usePageTitle';
import { JoinCommunityModal } from "../list/components/JoinCommunityModal";
import Button from "@/app/components/Button";
import { communityService } from "@/lib/api-services";
import { useAuth } from "@/context/AuthContext";

const GUIDELINES = [
  'Be respectful and kind to all members',
  'No spam or self-promotion without permission',
  'Keep discussions relevant to the community topic',
  'Report inappropriate behaviour to moderators',
  'Follow all applicable laws and regulations',
  'Respect intellectual property and privacy rights',
];

interface Community {
  id: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  privacy: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  isJoined?: boolean;
  myRole?: string | null;
  memberCount?: number;
  _count?: { members: number; messages: number };
}

const SingleCommunityPage = () => {
  const [activeTab, setActiveTab] = useState("description");
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const { data: communityData, isLoading: loading } = useQuery({
    queryKey: ['community', id],
    queryFn: async () => {
      const comm = await communityService.getById(id) as Community;
      let member = false;
      if (comm.isJoined || !!comm.myRole) {
        member = true;
      } else {
        const mine = await communityService.getMine() as unknown;
        const list: { id: string }[] = Array.isArray((mine as any)?.data)
          ? (mine as any).data
          : Array.isArray(mine) ? mine as { id: string }[] : [];
        member = list.some((c) => c.id === id);
      }
      return { community: comm, isMember: member };
    },
    enabled: !!id,
  });
  const community = communityData?.community ?? null;
  const isMember = communityData?.isMember ?? false;
  usePageTitle(community?.name);
  const [openModal, setOpenModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleJoin = async () => {
    if (!id) return;
    await communityService.join(id);
    queryClient.setQueryData<{ community: Community; isMember: boolean }>(
      ['community', id],
      (prev) => {
        if (!prev) return prev;
        const current = prev.community.memberCount ?? prev.community._count?.members ?? 0;
        return {
          isMember: true,
          community: {
            ...prev.community,
            isJoined: true,
            memberCount: current + 1,
            ...(prev.community._count
              ? { _count: { ...prev.community._count, members: current + 1 } }
              : {}),
          },
        };
      },
    );
    setOpenModal(false);
  };
  const isPrivate = community?.privacy !== 'PUBLIC';
  const memberCount = community?.memberCount ?? community?._count?.members ?? 0;

  if (loading) {
    return (
      <DashboardLayout custom={true}>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="px-6 md:px-12 py-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!community) {
    return (
      <DashboardLayout custom={true}>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-gray-500">Community not found.</p>
          <button onClick={() => router.back()} className="text-[#870BD6] text-sm underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout custom={true}>
      {openModal && (
        <JoinCommunityModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          communityName={community.name}
          communityId={id}
          privacy={community.privacy}
          guidelines={GUIDELINES}
          onJoin={handleJoin}
        />
      )}

      <div className="border-l border-[#D2D9DF]">
        {/* Banner */}
        <div
          className="bg-[#870BD6] h-[250px] lg:h-48 relative bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: isMobile && community.coverImage ? `url('${community.coverImage}')` : "url('/dashboard-header.png')" }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 cursor-pointer px-6 md:px-12 pt-16 relative z-20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="absolute inset-0 opacity-80 bg-gradient-to-b from-[#00000000] to-[#000000] lg:bg-none" />
          {/* Mobile title overlay */}
          <div className="block lg:hidden px-4 absolute bottom-[20px]">
            <h2 className="text-[20px] text-white font-bold mb-1">{community.name}</h2>
            <div className="flex items-center gap-2 text-white text-sm">
              <Users size={14} /> {memberCount.toLocaleString()} members
            </div>
          </div>
        </div>

        {/* Profile header (desktop) */}
        <div className="hidden lg:flex px-6 md:px-12 py-6 flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            {community.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={community.coverImage}
                alt={community.name}
                className="w-[150px] h-[150px] rounded-full border-[3px] border-white object-cover -mt-20 relative z-20 shadow-lg"
              />
            ) : (
              <div className="w-[150px] h-[150px] rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] text-4xl font-bold border-[3px] border-white -mt-20 relative z-20 shadow-lg">
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold mb-1">{community.name}</h2>
              <div className="flex items-center gap-2 text-[#60666B] text-sm">
                <Users size={14} /> {memberCount.toLocaleString()} members
              </div>
            </div>
          </div>

          {isMember ? (
            <button
              onClick={() => router.push('/dashboard/community')}
              className="bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white px-8 py-3 rounded-full font-semibold cursor-pointer"
            >
              Go to Community
            </button>
          ) : (
            <button
              onClick={() => setOpenModal(true)}
              className="bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white px-8 py-3 rounded-full font-semibold cursor-pointer"
            >
              Join Community
            </button>
          )}
        </div>

        {/* Tabs (desktop) */}
        <div className="hidden lg:block px-6 md:px-12 pt-2">
          <div className="flex gap-8 border-b border-[#D2D9DF]">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-3 text-[18px] font-medium transition-colors ${
                activeTab === "description" ? "border-b-2 border-[#870BD6] text-[#870BD6] font-semibold" : "text-[#60666B]"
              }`}
            >
              Description
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 lg:px-12 py-5">
          {activeTab === "description" && (
            <div className="max-w-2xl space-y-4 leading-relaxed">
              <p className="text-sm font-bold text-[#180426]">Description</p>
              <p className="text-[#60666B] text-sm whitespace-pre-wrap">
                {community.description ?? "No description available."}
              </p>

              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2 text-[#4E5255] text-sm">
                  {isPrivate ? <Lock stroke="#870BD6" className="w-5 h-5" /> : <Globe stroke="#870BD6" className="w-5 h-5" />}
                  <p>
                    {community.privacy === 'PUBLIC'
                      ? 'This is an open community. Anyone can join.'
                      : community.privacy === 'PRIVATE'
                        ? 'This is a private community. Invite only.'
                        : 'This community requires an invitation to join.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[#4E5255] text-sm">
                  <Users stroke="#870BD6" className="w-5 h-5" />
                  <p>Everyone can interact in this community</p>
                </div>
              </div>

              {isMember ? (
                <Button
                  customClass="!w-full px-6 !h-[48px] !text-white mt-6 lg:hidden"
                  type="button"
                  onClick={() => router.push('/dashboard/community')}
                >
                  Go to Community
                </Button>
              ) : (
                <Button
                  customClass="!w-full px-6 !h-[48px] !text-white mt-6 lg:hidden"
                  type="button"
                  onClick={() => setOpenModal(true)}
                >
                  Join Community
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SingleCommunityPage;
