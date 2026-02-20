"use client";

import FlameIcon from "@/app/assets/icons/flame";
import Tabs from "@/app/components/Tabs";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { ChevronRight, Clock, Plus, SearchIcon } from "lucide-react";
import Link from "next/link";
import { CommunitySidebar } from "./list/components/CommunitySidebar";
import { CommunityChatView } from "./list/components/CommunityChatView";
import { EmptyState } from "./list/components/EmptyState";
import { useEffect, useState } from "react";
import Button from "@/app/components/Button";
import { CreateCommunityModal } from "./list/components/CreateCommunityModal";

const CommunityPage = () => {
  const [openModal, setOpenModal] = useState(false);
   const [isMobile, setIsMobile] = useState(false)
  
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.matchMedia("(max-width: 767px)").matches)
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

  const tabs = [
    {
      label: "Your Communities",
      value: "communities",
      content: <Communities setOpenModal={setOpenModal} isMobile={isMobile} />,
    },
    {
      label: "Explore",
      value: "explore",
      content: <Explore />,
    },
  ];

  return (
    <DashboardLayout custom={true}>
      {openModal && (
        <CreateCommunityModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
        />
      )}
      <div className="flex justify-between items-center pb-8 px-4 lg:px-12 mt-6 lg:mt-[64px] border-b border-[#D2D9DF]">
        <h1 className="text-[24px] lg:text-[32px] leading-none font-bold ">Community</h1>
        <Button
          customClass="!w-fit px-6 !h-[48px] !text-white hidden"
          type="button"
          onClick={() => setOpenModal(true)}
        >
          <p className="flex items-center gap-[6px]">
            <Plus stroke="white" /> Create a community
          </p>
        </Button>
        <SearchIcon className="block lg:hidden" /> 
      </div>
      <div className=" bg-white pt-5">
        <Tabs tabs={tabs} defaultTab="communities" className="px-4 lg:px-12" />
      </div>
      {/* <Button
                    customClass="!w-full px-6 !h-[48px] !text-white absolute mt-4 lg:hidden"
                    type="button"
                    onClick={() => setOpenModal(true)}
                  >
                    <p className="flex items-center gap-[6px]">
                      Join community
                    </p>
                  </Button> */}
    </DashboardLayout>
  );
};

const Explore = () => {
  const content = [
    {
      title: "Believers that Hangout",
      image: "/dashboardCommunity1.jpg",
      id: 1,
    },
    {
      title: "Growth Community",
      image: "/dashboardCommunity2.jpg",
      id: 2,
    },
    {
      title: "Waxing Strong Community",
      image: "/dashboardCommunity1.jpg",
      id: 3,
    },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-[32px] lg:gap-4 px-4 lg:px-[44px] bg-[#fafafa] pt-6 border-t border-[#D2D9DF]">
      {content.map((item, index) => (
        <Link href={`/dashboard/community/${item.id}`} key={index}>
          <div className="bg-white rounded-[10px] py-3 px-4 flex  items-center gap-4">
            <div className="w-[88px] h-[88px] md:w-[64px] md:h-[64px] rounded-[10px] overflow-hidden">
              <img
                src={item?.image}
                alt="Believers group"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>

            {/* Center: Title and avatars */}
            <div className="flex-1 flex flex-col gap-2">
              <h2 className="text-base font-bold">{item?.title}</h2>

              {/* Avatar group with count */}
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
                    <img
                      src="/believers1.jpg"
                      alt="Member 1"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
                    <img
                      src="/believers2.jpg"
                      alt="Member 2"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
                    <img
                      src="/believers3.jpg"
                      alt="Member 3"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const Communities = ({
  setOpenModal,
  isMobile,
}: {
  setOpenModal: (val: boolean) => void;
  isMobile: boolean;
}) => {
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const communities = [
    {
      id: 1,
      name: "Believers That Hangout",
      avatar:
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=100&h=100&fit=crop",
    },
    {
      id: 2,
      name: "GrowT Community",
      avatar:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop",
    },
  ];
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-150px)] border-t border-[#D2D9DF] pt-6">
      {communities.length < 1 ? (
        <div className="bg-white h-full w-full flex justify-center items-center">
          <div className="flex flex-col gap-4 w-[400px] items-center">
            <img src="/emptyCommunity.svg" className="w-[128px] h-[128px]" />
            <p className="text-sm text-[#60666B]">
              You haven’t joined any community yet. Explore communities on Breed
              or create yours and invite your friends
            </p>
            <Button
              customClass="!w-fit px-6 !h-[48px] !text-white"
              type="button"
              onClick={() => setOpenModal(true)}
            >
              <p className="flex items-center gap-[6px]">
                <Plus stroke="white" /> Create a community
              </p>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <CommunitySidebar
            communities={communities}
            selectedCommunity={selectedCommunity}
            onSelectCommunity={setSelectedCommunity}
          />
          {isMobile ? (
            selectedCommunity ? (
              <CommunityChatView community={selectedCommunity} setSelectedCommunity={setSelectedCommunity} />
            ) : null
          ) : (
            selectedCommunity ? (
              <CommunityChatView community={selectedCommunity} setSelectedCommunity={setSelectedCommunity}/>
            ) : (
              <EmptyState />
            )
          )}
        </>
      )}
    </div>
  );
};

export default CommunityPage;
