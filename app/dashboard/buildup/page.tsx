"use client";

import { Suspense, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import AccountabilityTab from "./components/AccountabilityTab";
import DevotionalsTab from "./components/DevotionalsTab";
import EdifyTab, { EdifyTabHandle } from "./components/EdifyTab";
import PrayerBullletinsTab from "./components/PrayerBullletinsTab";
import { Add, StopCircle, Timer1 } from "iconsax-react";

const TABS = [
  { id: "edify", label: "Edify" },
  { id: "accountability", label: "Bonds" },
  { id: "devotionals", label: "Devotionals" },
  { id: "bulletins", label: "Prayer Bulletins" },
];

function BuildupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") ?? "edify";
  const [showCreate, setShowCreate] = useState(false);
  const [partnershipDetailOpen, setPartnershipDetailOpen] = useState(false);
  const [edifyTimerState, setEdifyTimerState] = useState<'idle' | 'running' | 'details'>('idle');
  const edifyTabRef = useRef<EdifyTabHandle>(null);

  return (
    <DashboardLayout custom={true}>
      {/* Header */}
      <div className="flex justify-between items-center pb-6.75 lg:pb-8 px-4 lg:px-12 mt-6 lg:mt-16 border-b border-[#D2D9DF]">
        <h1 className="text-[24px] lg:text-[32px] leading-none font-bold">
          Build Up
        </h1>

        {/* Context-sensitive header button */}
        {activeTab === "accountability" && !partnershipDetailOpen && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold rounded-full transition-colors cursor-pointer px-3 py-3 text-sm"
          >
            <Add size={16} color="white" />
            <span className="hidden sm:inline">Add Partner</span>
          </button>
        )}
        {activeTab === "edify" && edifyTimerState !== "details" && (
          <button
            onClick={() =>
              edifyTimerState === "running"
                ? edifyTabRef.current?.stopTimer()
                : edifyTabRef.current?.startTimer()
            }
            className="flex items-center gap-2 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold rounded-full transition-colors cursor-pointer px-3 py-3 text-sm"
          >
            {edifyTimerState === "running" ? (
              <StopCircle size={16} color="white" />
            ) : (
              <Timer1 size={16} color="white" />
            )}
            <span className="hidden sm:inline">
              {edifyTimerState === "running" ? "Stop Session" : "Start Praying"}
            </span>
          </button>
        )}
      </div>

      {/* White content area */}
      <div className="bg-white pt-5 min-h-screen">
        {/* Tab pills */}
        <div className="flex gap-3 px-4 lg:px-12 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(`/dashboard/buildup?tab=${tab.id}`)}
              className={`border px-[18px] py-3 whitespace-nowrap rounded-[12px] font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white border-black font-semibold text-[#180426]"
                  : "text-[#4E5255] border-[#D2D9DF] hover:border-gray-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="border-t border-[#D2D9DF] mt-5 px-4 lg:px-12 py-6">
          {activeTab === "edify" && (
            <EdifyTab ref={edifyTabRef} onTimerStateChange={setEdifyTimerState} />
          )}
          {activeTab === "accountability" && (
            <AccountabilityTab
              externalShowCreate={showCreate}
              onExternalShowCreateChange={setShowCreate}
              onDetailOpen={setPartnershipDetailOpen}
            />
          )}
          {activeTab === "devotionals" && <DevotionalsTab />}
          {activeTab === "bulletins" && <PrayerBullletinsTab />}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function BuildupPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout custom={true}>
          <div className="pb-8 px-4 lg:px-12 mt-6 lg:mt-[64px] border-b border-[#D2D9DF]">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
          <div className="bg-white pt-5 px-4 lg:px-12">
            <div className="h-10 bg-gray-100 rounded-xl w-72 animate-pulse" />
          </div>
        </DashboardLayout>
      }
    >
      <BuildupContent />
    </Suspense>
  );
}
