"use client"

import FlameIcon from "@/app/assets/icons/flame";
import DashboardLayout from "@/app/layout/DashboardLayout"
import { ChevronRight, Clock, Clock1, RollerCoaster, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";



const  MentorProfilePage = () => {
     const router = useRouter()
      const [activeTab, setActiveTab] = useState("overview")

     const mentor = {
        id: 1,
         name: "John Doe",
         role: "Senior Software Engineer",
         image: "/courseImage1.png",
         bio: "John has over 10 years of experience in software development and has worked with top tech companies. He specializes in full-stack development and has a passion for mentoring junior developers.",
         expertise: ["Full-Stack Development", "React", "Node.js", "JavaScript", "TypeScript"],
         availability: "Monday to Friday, 9 AM - 5 PM",
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
            src="/bisola.jpg"
            alt="mentor"
            className="w-[180px] h-[180px] rounded-full border-[3px] border-white object-cover -mt-20 relative z-20"
          />

          <div>
            <h2 className="text-2xl font-bold">Bisola Badejo</h2>
            <p className="text-gray-600">
              Pastor @ Celebration Church
            </p>
          </div>
        </div>

        <button className="bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white px-8 py-3 rounded-full font-semibold">
          Book a Session
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 md:px-12 pt-6">
        <div className="flex gap-8 border-b border-[#D2D9DF]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-[18px] ${
              activeTab === "overview"
                ? "border-b-2 border-[#870BD6] font-semibold"
                : ""
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 font-medium ${
              activeTab === "reviews"
                ? "border-b-2 border-purple-600 text-black"
                : "text-gray-500"
            }`}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-12 py-5 flex gap-8 items-start">
        {activeTab === "overview" && (
          <>
            {/* Description */}
            <div className="w-[60%] space-y-4 leading-relaxed">
              <p>
                Bisola Badejo, a pastor at Celebration Church, is passionate
                about transforming lives through faith-centered
                entrepreneurship, storytelling, and spiritual growth.
              </p>
              <p>
                As a seasoned coach, writer, and visionary executor, she
                merges biblical wisdom with practical strategies to help
                believers turn everyday routines into intentional spiritual
                rhythms.
              </p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-4 shadow-[0px_4.29px_4.29px_0px_#60666B0D] flex w-[40%] flex-shrink-0">
              <Stat
                label="Completed Sessions"
                value="10"
                icon={<Zap stroke='#4287FB' className="w-5 h-5"/>}
                backgroundColor="#F0F5FF"
              />

              <Stat
                label="Total mentoring time"
                value="720 mins"
                icon={<Clock1 stroke='#EE6C6C' className="w-5 h-5"/>}
                backgroundColor="#FFF5F5"
              />
            </div>
          </>
        )}

        {activeTab === "reviews" && (
          <div className="md:col-span-3 text-gray-500">
            No reviews yet.
          </div>
        )}
      </div>
    </div>
 </DashboardLayout>
    )
}

const Stat = ({ value, label, icon, backgroundColor }: {
    value: string
    label: string
    icon: React.ReactNode
    backgroundColor: string
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-[42px] h-[42px] flex items-center justify-center rounded-[16px]" style={{backgroundColor }}>
        {icon}
      </div>

      <div>
        <p className="font-bold text-[17px] leading-none mb-[2px]">{value}</p>
        <p className="text-[15px] text-[#60666B] leading-tight">{label}</p>
      </div>
    </div>
  )
}

export default MentorProfilePage