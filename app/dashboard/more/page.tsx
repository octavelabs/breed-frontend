"use client"

import DashboardLayout from "@/app/layout/DashboardLayout";
import { useState } from "react";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import MyProfile from "./components/MyProfile";
import About from "./components/About";
import Support from "./components/Support";

const MorePage = () => {
  const [activeTab, setActiveTab] = useState("myProfile");


  const tabs = [
    { id: "myProfile", label: "My Profile" },
    { id: "security", label: "Security" },
    { id: "inviteFriend", label: "Invite a friend" },
    { id: "about", label: "About" },
    { id: "support", label: "Support" }
  ];

  return (
    <DashboardLayout>
      <h1 className="text-[32px] leading-none font-bold mb-8">More</h1>
      
      {/* Tabs */}
      <div className="border-b border-[#D2D9DF] mb-8">
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

      {/* Content */}
      <div className="bg-white rounded-lg p-8 ">
        {activeTab === "myProfile" && <MyProfile />}
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
    </DashboardLayout>
  );
};

export default MorePage;
