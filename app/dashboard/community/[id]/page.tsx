"use client"
import DashboardLayout from "@/app/layout/DashboardLayout"
import { ArrowLeft, Globe, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { JoinCommunityModal } from "../list/components/JoinCommunityModal"
import Button from "@/app/components/Button"

  
  const SingleCommunityPage = () => {
        const [activeTab, setActiveTab] = useState("description")
        const router = useRouter()
        const [openModal, setOpenModal] = useState(false)
        const [isMobile, setIsMobile] = useState(false)
        
          useEffect(() => {
            const checkMobile = () => {
              setIsMobile(window.matchMedia("(max-width: 767px)").matches)
            }
            checkMobile()
            window.addEventListener('resize', checkMobile)
            return () => window.removeEventListener('resize', checkMobile)
          }, [])

        const community = {
         id: 1,
         title: "Believers That Hangout",
         role: "Senior Software Engineer",
         image: "/dashboardCommunity1.jpg",
         about: "General Mentorship",
         duration: '1 hour',
         contact: "john.doe@example.com",
        completedSessions: 10,
        totalTime: 720,
     }

       const guidelines = [
    'Be respectful and kind to all members',
    'No spam or self-promotion without permission',
    'Keep discussions relevant to the community topic',
    'Report inappropriate behavior to moderators',
    'Follow all applicable laws and regulations',
    'Respect intellectual property and privacy rights'
  ];

    return (
  <DashboardLayout custom={true}>
    {openModal && <JoinCommunityModal isOpen={openModal} onClose={() => setOpenModal(false)} communityName={community.title} guidelines={guidelines}/>}
    <div className="border-l border-[#D2D9DF]">
      {/* Header Banner */}
      <div className="bg-[#870BD6] h-[250px] lg:h-48 relative bg-center bg-cover bg-no-repeat" style={{backgroundImage: `url('${
      isMobile ? `${community.image}` : '/dashboard-header.png'
    }')`}}>
        {/* Pattern overlay */}
         <button
        onClick={() => router.back()}
        className="flex items-center gap-2 cursor-pointer px-6 md:px-12 pt-16 relative z-20"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
        <div className="absolute inset-0 opacity-80 bg-gradient-to-b from-[#00000000] to-[#000000] lg:bg-none" />
        <div className="block lg:hidden px-4 absolute bottom-[20px]">
            <h2 className="text-[20px] text-white font-bold mb-1">{community?.title}</h2>
             <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-3">
                        <div className="w-5 h-5 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
                          <img
                            src="/believers1.jpg"
                            alt="Member 1"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-5 h-5 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
                          <img
                            src="/believers2.jpg"
                            alt="Member 2"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-5 h-5 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
                          <img
                            src="/believers3.jpg"
                            alt="Member 3"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Count badge */}
                      <div className="text-white text-sm font-semibold">
                        2000+
                      </div>
                    </div>
          </div>
      </div>

      {/* Profile Header */}
      <div className="hidden lg:flex px-6 md:px-12 py-6 flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={community?.image}
            alt="mentor"
            className="w-[180px] h-[180px] rounded-full border-[3px] border-white object-cover -mt-20 relative z-20"
          />

          <div>
            <h2 className="text-2xl font-bold mb-1">{community?.title}</h2>
             <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-3">
                        <div className="w-5 h-5  rounded-full border-[1.2px] border-[#870BD6] overflow-hidden bg-gray-300">
                          <img
                            src="/believers1.jpg"
                            alt="Member 1"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-5 h-5  rounded-full border-[1.2px] border-[#870BD6] overflow-hidden bg-gray-300">
                          <img
                            src="/believers2.jpg"
                            alt="Member 2"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-5 h-5  rounded-full border-[1.2px] border-[#870BD6] overflow-hidden bg-gray-300">
                          <img
                            src="/believers3.jpg"
                            alt="Member 3"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Count badge */}
                      <div className="text-sm font-semibold">
                        2000+
                      </div>
                    </div>
          </div>
        </div>

        <button className="bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white px-8 py-3 rounded-full font-semibold cursor-pointer" onClick={() => setOpenModal(true)}>
          Join Community
        </button>
      </div>

      {/* Tabs */}
      <div className="hidden lg:block px-6 md:px-12 pt-6">
        <div className="flex gap-8 border-b border-[#D2D9DF]">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3 text-[18px] ${
              activeTab === "description"
                ? "border-b-2 border-[#870BD6] font-semibold"
                : ""
            }`}
          >
            Description
          </button>
        </div>
      </div>
     

      {/* Content */}
      <div className="px-4 lg:px-12 py-5 flex gap-8 items-star">
        {activeTab === "description" && (
          <div>
            {/* Description */}
            <div className="w-full space-y-4 leading-relaxed text-base lg:text-[18px]">
               <p className="text-sm font-bold mb-2">Description</p>
              <p>
                Believers That Hangout Global crafts uplifting experiences and connection points for faith‑filled individuals around the world. Their feed features curated events, trips, staycations, and online prayer sessions, encouraging believers to come together "don't come alone, bring a friend".
              </p>
              <p>
                They also share spiritual resources like prayer reels and weekly playlists 
(“BTH Global Weekly Faves”), blending community moments with worship and devotion
              </p>
              <div className="space-y-2 lg:space-y-8 text-base lg:text-[18px]">
            <div className="flex items-center gap-2 text-[#4E5255]">
              <Globe stroke='#870BD6' className="w-5 h-5" />
              <p>This is an open community. Anyone can join this community.</p>
            </div>
            
            <div className="flex items-center gap-2  text-[#4E5255]">
              <Users stroke='#870BD6'className="w-5 h-5" />
              <p>Everyone can interact in this community</p>
            </div>
          </div>
            </div>
             <Button
              customClass="!w-full px-6 !h-[48px] !text-white absolute mt-4 lg:hidden"
              type="button"
              onClick={() => setOpenModal(true)}
            >
              <p className="flex items-center gap-[6px]">
                Join community
              </p>
            </Button>
          </div>
        )}

      </div>
    </div>
 </DashboardLayout>
 )}

 export default SingleCommunityPage