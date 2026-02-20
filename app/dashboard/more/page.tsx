"use client"

import DashboardLayout from "@/app/layout/DashboardLayout";
import { useState, useEffect } from "react";
import MyProfile from "./components/MyProfile";
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
    { id: "inviteFriend", label: "Invite a friend" },
    { id: "about", label: "About" },
    { id: "support", label: "Support" }
  ];

  const mobileTabs =  [
    { id: "myProfile", label: "My Profile", subLabel: "", icon: <CircleUserRound className="w-6 h-6" stroke='#60666B'/> },
    { id: "security", label: "Privacy and Security", subLabel: "", icon: <Shield className="w-6 h-6" stroke='#60666B'/> },
        { id: "display", label: "Display Preference", subLabel: "Edit app appearance and size", icon: <Settings2 className="w-6 h-6" stroke='#60666B'/> },
    { id: "inviteFriend", label: "Invite a friend", subLabel: "", icon: <UsersRound className="w-6 h-6" stroke='#60666B'/> },
    { id: "about", label: "About", subLabel: "", icon: <Info className="w-6 h-6" stroke='#60666B'/> },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-[32px] leading-none font-bold mb-8">More</h1>
      <p className={`${isMobile && !showSelectedTab ? "block" : "hidden" }  lg:hidden mb-2 text-sm text-[#60666B]`}>General Settings</p>
      {/* Tabs */}
      <div className="border-b border-[#D2D9DF] mb-8 hidden lg:block">
        <div className="flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-base font-medium ${
                activeTab === tab.id
                  ? "border-b-2 border-[#870BD6] text-black font-semibold"
                  : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {isMobile && !showSelectedTab && <><div className="block lg:hidden flex flex-col gap-2">
        {
          mobileTabs.map((tab, idx) => (
             <div className="p-[18px] flex justify-between items-center bg-white" key={idx}>
              <div className="flex gap-4 items-center">
                {tab.icon}
                <div>
                <p className="text-base font-semibold">{tab.label}</p>
                {tab.subLabel && <p className="text-sm text-[#60666B] mb-1">{tab.subLabel}</p>}
                </div>
                </div>

                <ChevronRight className="w-6 h-6" stroke="#60666B" onClick={() => {
                  setActiveTab(tab.id)
                  setShowSelectedTab(true)}}/>
              </div>
          ))
        }
      </div>
      <div>
      <p className="mt-6 mb-2 text-sm text-[#60666B]">Support</p>
      <div className="p-[18px] flex justify-between items-center bg-white">
              <div className="flex gap-4 items-center">
                <MessageCircleQuestionMark className="w-6 h-6" stroke="#60666B" />
                <div>
                <p className="text-base font-semibold">Get help and support</p>
                <p className="text-sm text-[#60666B] mb-1">Visit our help center, share feedback or contact us</p>
                </div>
                </div>

                <ChevronRight className="w-6 h-6" stroke="#60666B" onClick={() => {
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
    <div className="bg-[#F8F9FC] lg:bg-white rounded-lg p-0 lg:p-8 ">
        {activeTab === "myProfile" && <MyProfile setShowSelectedTab={setShowSelectedTab} />}
        {activeTab === "security" && (
          <div className="text-gray-500">
            Security settings will be displayed here.
          </div>
        )}

        {activeTab === "inviteFriend" && (
          <div className="text-gray-500">
            Invite a friend feature will be displayed here.
          </div>
        )}
        {activeTab === "about" && <About />}
        {activeTab === "support" && <Support />}
      </div>
   )
}

export default MorePage;
