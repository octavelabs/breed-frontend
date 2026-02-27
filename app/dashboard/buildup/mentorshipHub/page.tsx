"use client";

import FlameIcon from "@/app/assets/icons/flame";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { ArrowLeft, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import MentorCard from "./components/MentorCard";
import { useRouter } from "next/navigation";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";

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
    bio: "Bisola Badejo, a pastor at Celebration Church, is passionate about transforming lives through faith-centered entrepreneurship, storytelling, and spiritual growth. As a seasoned coach, writer, and visionary executor, she merges biblical wisdom with practical strategies to help believers turn everyday routines into intentional spiritual rhythms.",
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
    bio: "Clinton Adabanya leads the Waxing Strong Community with a heart for developing strong Christian leaders.",
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
    bio: "Mimi Okigbo creates spaces for authentic fellowship and spiritual growth.",
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
    bio: "Elvis Okhifo is passionate about igniting hearts with the fire of God's love.",
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
    bio: "Oge Ogwe leads with grace and wisdom at Circle Church Global.",
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
    bio: "Oyin Oludapo brings fresh perspective and vibrant energy to ministry.",
  },
];

const MentorShipPage = () => {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState(1);
  const router = useRouter();



  return (
    <DashboardLayout>
      {/* Mobile: Show step controls, Desktop: Show only StepTwo */}
      <div className="lg:hidden">
        {step === 1 ? <StepOne onNext={() => setStep(2)} /> : <StepTwo searchQuery={searchQuery} setSearchQuery={setSearchQuery} router={router} />}
      </div>
      {/* Desktop: Show only StepTwo */}
      <div className="hidden lg:block">
        <StepTwo searchQuery={searchQuery} setSearchQuery={setSearchQuery} router={router} />
      </div>
    </DashboardLayout>
  );
};

const StepOne = ({ onNext }: { onNext: () => void }) => {
  const router = useRouter()
  return (
    <div className="relative -mx-4 -mt-6 -mb-6 min-h-[calc(100vh-68px)]">
    <div className="h-[250px] flex flex-col bg-top" style={{backgroundImage: "url('/mentorShipBanner.png')"}}>
        <button
        onClick={() => router.back()}
        className="flex items-center gap-2 cursor-pointer px-6 md:px-12 pt-16 relative z-20"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
      </div>
      <div className="p-[18px] bg-white">
         <p className="font-bold text-sm mb-2">Description</p>
         <div className="space-y-2">
          <p> Step into a space designed to help you grow with guidance, structure, and support. </p>
          <p>The Mentorship Hub connects you with a trusted mentor who walks alongside you in your spiritual journey. </p>
        <p>Stay accountable, share your challenges, and grow stronger in community as your mentor helps you walk in truth and purpose.</p>
 <p>Everything you need to grow deeper one check-in, one prayer, one step at a time.
 </p>
 </div>
      </div>
        <div className="px-4">
        <Button
                    onClick={onNext}
                    customClass="!w-full !text-white !h-[58px]"
                  >
                    Get Started
                  </Button>
        </div>
    </div>
  )
}

const StepTwo = ({ searchQuery, setSearchQuery, router }: { searchQuery: string; setSearchQuery: (val: string) => void; router: any }) => {
    const filteredMentors = mentorsData.filter(
    (mentor) =>
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  return (
    <div className="mx-auto">
        <h1 className="text-[32px] leading-none font-bold mb-2">
          Mentorship Hub
        </h1>
        <p className="text-base leading-tight mb-8">
          Step into a space designed to help you grow with guidance, structure,
          and support. The Mentorship Hub connects you with a trusted mentor who
          walks alongside you in your spiritual journey. Stay accountable, share
          your challenges, and grow stronger in community as your mentor helps
          you walk in truth and purpose.
        </p>
        <div className="mb-10 animate-fade-in-up stagger-1"></div>

        <div>
          <h2 className="text-base font-semibold  whitespace-nowrap mb-2">
            Select a Mentor
          </h2>

          <Input
            type="text"
            id="firstName"
            name="firstName"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name"
            variant="outlined"
            icon={
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2  w-5 h-5 opacity-50" />
            }
            className="!bg-white !border-[#F2F2F7] !w-full !mb-6"
          />

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {filteredMentors.map((mentor, index) => (
              <div
                key={mentor.id}
                className={`stagger-${Math.min(index + 3, 5)}`}
              >
                <MentorCard
                  mentor={mentor}
                  onClick={() =>
                    router.push(`/dashboard/buildup/mentorshipHub/${mentor.id}`)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
  )
}

export default MentorShipPage;
