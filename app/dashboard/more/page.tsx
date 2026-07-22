"use client"

import DashboardLayout from "@/app/layout/DashboardLayout";
import { useState, useEffect } from "react";
import MyProfile from "./components/MyProfile";
import Security from "./components/Security";
import DisplayPreference from "./components/DisplayPreference";
import InviteFriend from "./components/InviteFriend";
import About from "./components/About";
import Support from "./components/Support";
import { ChevronRight, CircleUserRound, Info, MessageCircleQuestionMark, Settings2, Shield, User2, UsersRound } from "lucide-react";

const MorePage = () => {
  const [activeTab, setActiveTab] = useState("myProfile");
  const [showSelectedTab, setShowSelectedTab] = useState(false)
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
    { id: "myProfile", label: "My Profile" },
    { id: "security", label: "Security" },
    { id: "display", label: "Display" },
    { id: "inviteFriend", label: "Invite a friend" },
    { id: "about", label: "About" },
    { id: "support", label: "Support" }
  ];

  const mobileTabs =  [
    { id: "myProfile", label: "My Profile", subLabel: "", icon: <CircleUserRound className="w-6 h-6 text-[#60666B] dark:text-[#9CA3AF]" /> },
    { id: "security", label: "Privacy and Security", subLabel: "", icon: <Shield className="w-6 h-6 text-[#60666B] dark:text-[#9CA3AF]" /> },
    { id: "display", label: "Display Preference", subLabel: "Edit app appearance and size", icon: <Settings2 className="w-6 h-6 text-[#60666B] dark:text-[#9CA3AF]" /> },
    { id: "inviteFriend", label: "Invite a friend", subLabel: "", icon: <UsersRound className="w-6 h-6 text-[#60666B] dark:text-[#9CA3AF]" /> },
    { id: "about", label: "About", subLabel: "", icon: <Info className="w-6 h-6 text-[#60666B] dark:text-[#9CA3AF]" /> },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-[32px] leading-none font-bold mb-8">More</h1>
      <p className={`${isMobile && !showSelectedTab ? "block" : "hidden" }  lg:hidden mb-2 text-sm text-[#60666B] dark:text-[#9CA3AF]`}>General Settings</p>
      {/* Tabs */}
      <div className="border-b border-[#D2D9DF] dark:border-[#2D313A] mb-8 hidden lg:block">
        <div className="flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-base font-medium ${
                activeTab === tab.id
                  ? "border-b-2 border-[#870BD6] text-black dark:text-white font-semibold"
                  : "text-gray-500 dark:text-[#9CA3AF]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {isMobile && !showSelectedTab && <><div className="lg:hidden flex flex-col gap-2">
        {
          mobileTabs.map((tab, idx) => (
             <div className="p-4.5 flex justify-between items-center bg-white dark:bg-[#181A1F]" key={idx}>
              <div className="flex gap-4 items-center">
                {tab.icon}
                <div>
                <p className="text-base font-semibold dark:text-white">{tab.label}</p>
                {tab.subLabel && <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] mb-1">{tab.subLabel}</p>}
                </div>
                </div>

                <ChevronRight className="w-6 h-6 text-[#60666B] dark:text-[#9CA3AF]" onClick={() => {
                  setActiveTab(tab.id)
                  setShowSelectedTab(true)}}/>
              </div>
          ))
        }
      </div>
      <div>
      <p className="mt-6 mb-2 text-sm text-[#60666B] dark:text-[#9CA3AF]">Support</p>
      <div className="p-4.5 flex justify-between items-center bg-white dark:bg-[#181A1F]">
              <div className="flex gap-4 items-center">
                <MessageCircleQuestionMark className="w-6 h-6 text-[#60666B] dark:text-[#9CA3AF]" />
                <div>
                <p className="text-base font-semibold dark:text-white">Get help and support</p>
                <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] mb-1">Visit our help center, share feedback or contact us</p>
                </div>
                </div>

                <ChevronRight className="w-6 h-6 text-[#60666B] dark:text-[#9CA3AF]" onClick={() => {
                  setActiveTab('support')
                  setShowSelectedTab(true)}}/>
              </div>
              </div></>}

      {isMobile ? (showSelectedTab && <ActiveTabContent activeTab={activeTab} setShowSelectedTab={setShowSelectedTab} />) : <ActiveTabContent activeTab={activeTab} setShowSelectedTab={setShowSelectedTab} />}
    </DashboardLayout>
  );
};

const ActiveTabContent = ({ activeTab, setShowSelectedTab } : {activeTab : string, setShowSelectedTab: (val: boolean) => void}) => {
   return (
    <div className="bg-[#F8F9FC] dark:bg-[#121316] lg:bg-white lg:dark:bg-transparent rounded-2xl p-0 lg:p-8 lg:max-w-2xl">
        {activeTab === "myProfile" && <MyProfile setShowSelectedTab={setShowSelectedTab} />}
        {activeTab === "security" && <Security setShowSelectedTab={setShowSelectedTab} />}
        {activeTab === "display" && <DisplayPreference setShowSelectedTab={setShowSelectedTab} />}
        {activeTab === "inviteFriend" && <InviteFriend setShowSelectedTab={setShowSelectedTab} />}
        {activeTab === "about" && <About />}
        {activeTab === "support" && <Support />}
      </div>
   )
}

export default MorePage;
