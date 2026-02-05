"use client"

import FlameIcon from "@/app/assets/icons/flame";
import DashboardLayout from "@/app/layout/DashboardLayout"
import { ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import MentorCard from "./components/MentorCard";
import { useRouter } from "next/navigation";

 const mentorsData = [
      {
        id: 1,
        name: "Bisola Badejo",
        role: "Pastor @ Celebration Church",
        avatar: "/bisola.jpg",
        sessions: 10,
        reviews: 7,
        completedSessions: 10,
        totalTime: 720,
        bio: "Bisola Badejo, a pastor at Celebration Church, is passionate about transforming lives through faith-centered entrepreneurship, storytelling, and spiritual growth. As a seasoned coach, writer, and visionary executor, she merges biblical wisdom with practical strategies to help believers turn everyday routines into intentional spiritual rhythms."
      },
      {
        id: 2,
        name: "Clinton Adabanya",
        role: "Lead @ Waxing Strong Community",
        avatar: "/bisola.jpg",
        sessions: 0,
        reviews: 0,
        completedSessions: 0,
        totalTime: 0,
        bio: "Clinton Adabanya leads the Waxing Strong Community with a heart for developing strong Christian leaders."
      },
      {
        id: 3,
        name: "Mimi Okigbo",
        role: "Lead @ Believers That Hangout",
        avatar: "/bisola.jpg",
        sessions: 10,
        reviews: 7,
        completedSessions: 10,
        totalTime: 720,
        bio: "Mimi Okigbo creates spaces for authentic fellowship and spiritual growth."
      },
      {
        id: 4,
        name: "Elvis Okhifo",
        role: "Pastor @ Burning Heart Ministries",
        avatar: "/bisola.jpg",
        sessions: 10,
        reviews: 7,
        completedSessions: 10,
        totalTime: 720,
        bio: "Elvis Okhifo is passionate about igniting hearts with the fire of God's love."
      },
      {
        id: 5,
        name: "Oge Ogwe",
        role: "Pastor @ Circle Church Global",
        avatar: "/bisola.jpg",
        sessions: 0,
        reviews: 0,
        completedSessions: 0,
        totalTime: 0,
        bio: "Oge Ogwe leads with grace and wisdom at Circle Church Global."
      },
      {
        id: 6,
        name: "Oyin Oludapo",
        role: "Pastor @ Celebration Church",
        avatar: "/bisola.jpg",
        sessions: 0,
        reviews: 0,
        completedSessions: 0,
        totalTime: 0,
        bio: "Oyin Oludapo brings fresh perspective and vibrant energy to ministry."
      }
    ];


const  MentorShipPage = () => {
     const [searchQuery, setSearchQuery] = useState('');
     const router = useRouter()
      
      const filteredMentors = mentorsData.filter(mentor =>
        mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mentor.role.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return (
        <DashboardLayout>
            <div className="mx-auto">
      <h1 className="text-[32px] leading-none font-bold mb-2">Mentorship Hub</h1>
<p className="text-base leading-none mb-8">
                Step into a space designed to help you grow with guidance, structure, and support. The Mentorship Hub connects you with a trusted mentor who walks alongside you in your spiritual journey. Stay accountable, share your challenges, and grow stronger in community as your mentor helps you walk in truth and purpose.
              </p>
 <div className="mb-10 animate-fade-in-up stagger-1">
              <div className="relative max-w-2xl">
                <svg 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  width="20" 
                  height="20" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-[10px] border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all bg-white "
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

  <div>
              <h2 className="text-2xl font-bold mb-6 clash-display animate-fade-in-up stagger-2">
                Select a Mentor
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {filteredMentors.map((mentor, index) => (
                  <div key={mentor.id} className={`stagger-${Math.min(index + 3, 5)}`}>
                    <MentorCard mentor={mentor} onClick={() => router.push(`/dashboard/buildup/mentorshipHub/${mentor.id}`)} />
                  </div>
                ))}
              </div>
            </div>
    </div>
        </DashboardLayout>
    )
}

export default MentorShipPage