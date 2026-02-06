"use client"
import DashboardLayout from "@/app/layout/DashboardLayout"
import { useRouter } from "next/navigation"
import { useState } from "react"

  
  const SingleCommunityPage = () => {
        const [activeTab, setActiveTab] = useState("description")
        const router = useRouter()

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

    return (
  <DashboardLayout>
    <div className="border-l border-[#D2D9DF]">
      {/* Header Banner */}
      <div className="bg-[#870BD6] h-48 relative" style={{backgroundImage: "url('/dashboard-header.png')"}}>
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_1px,_transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Profile Header */}
      <div className=" px-6 md:px-12 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
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
                        <div className="w-12 h-12 md:w-6 md:h-6 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
                          <img
                            src="/believers1.jpg"
                            alt="Member 1"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-12 h-12 md:w-6 md:h-6 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
                          <img
                            src="/believers2.jpg"
                            alt="Member 2"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-12 h-12 md:w-6 md:h-6 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
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

        <button className="bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white px-8 py-3 rounded-full font-semibold cursor-pointer" onClick={() => router.push(`/dashboard/community/list`)}>
          Join Community
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 md:px-12 pt-6">
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
      <div className="px-12 py-5 flex gap-8 items-start">
        {activeTab === "description" && (
          <>
            {/* Description */}
            <div className="w-full space-y-4 leading-relaxed text-[18px]">
              <p>
                Believers That Hangout Global crafts uplifting experiences and connection points for faith‑filled individuals around the world. Their feed features curated events, trips, staycations, and online prayer sessions, encouraging believers to come together "don't come alone, bring a friend".
              </p>
              <p>
                They also share spiritual resources like prayer reels and weekly playlists 
(“BTH Global Weekly Faves”), blending community moments with worship and devotion
              </p>
            </div>
          </>
        )}

      </div>
    </div>
 </DashboardLayout>
 )}

 export default SingleCommunityPage