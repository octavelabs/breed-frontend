"use client";

import DashboardLayout from "@/app/layout/DashboardLayout";
import { ArrowLeft, SearchIcon, Inbox, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import MentorCard from "./components/MentorCard";
import { useRouter } from "next/navigation";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import { mentorshipService } from "@/lib/api-services";

interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  discipleCount: number;
  mentorProfile?: {
    bio?: string | null;
    specializations?: string[];
    sessionRate?: number | null;
    maxDisciples?: number | null;
  } | null;
}

interface MyMentorship {
  id: string;
  status: string;
  startedAt?: string | null;
  createdAt: string;
  mentor: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    username?: string;
    mentorProfile?: { specializations?: string[] } | null;
  };
}

const STATUS_CLASSES: Record<string, string> = {
  PENDING:   "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  ACTIVE:    "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]",
  REJECTED:  "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
  PAUSED:    "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  COMPLETED: "bg-[#F2F4F7] text-[#344054] border border-[#D0D5DD]",
};

function MentorAvatar({ user }: { user: { firstName: string; lastName: string; avatarUrl?: string | null } }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt={user.firstName} className="w-11 h-11 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-11 h-11 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm shrink-0">
      {initials}
    </div>
  );
}

const MentorShipPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [step, setStep] = useState(1);
  const router = useRouter();

  return (
    <DashboardLayout custom={true}>
      {/* Page header — hidden on mobile step 1 (StepOne has its own banner) */}
      <div className={`flex justify-start items-center pb-[27px] lg:pb-8 px-4 lg:px-12 mt-6 lg:mt-[64px] border-b border-[#D2D9DF] ${step === 1 ? "hidden lg:flex" : "flex"}`}>
        <h1 className="text-[24px] lg:text-[32px] leading-none font-bold">Mentorship Hub</h1>
      </div>

      <div className="bg-white pt-5 min-h-screen">
        <div className="lg:hidden">
          {step === 1
            ? <StepOne onNext={() => setStep(2)} />
            : <StepTwo searchQuery={searchQuery} setSearchQuery={setSearchQuery} router={router} />
          }
        </div>
        <div className="hidden lg:block">
          <StepTwo searchQuery={searchQuery} setSearchQuery={setSearchQuery} router={router} />
        </div>
      </div>
    </DashboardLayout>
  );
};

const StepOne = ({ onNext }: { onNext: () => void }) => {
  const router = useRouter();
  return (
    <div className="min-h-[calc(100vh-68px)]">
      <div className="h-62.5 flex flex-col bg-top" style={{ backgroundImage: "url('/mentorShipBanner.png')" }}>
        <button onClick={() => router.back()} className="flex items-center gap-2 cursor-pointer px-6 pt-16 relative z-20">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="p-4.5 bg-white">
        <p className="font-bold text-sm mb-2">Description</p>
        <div className="space-y-2 text-sm text-[#3C3E40]">
          <p>Step into a space designed to help you grow with guidance, structure, and support.</p>
          <p>The Mentorship Hub connects you with a trusted mentor who walks alongside you in your spiritual journey.</p>
          <p>Stay accountable, share your challenges, and grow stronger in community as your mentor helps you walk in truth and purpose.</p>
          <p>Everything you need to grow deeper — one check-in, one prayer, one step at a time.</p>
        </div>
      </div>
      <div className="px-4">
        <Button onClick={onNext} customClass="!w-full !text-white !h-[58px]">Get Started</Button>
      </div>
    </div>
  );
};

const StepTwo = ({
  searchQuery,
  setSearchQuery,
  router,
}: {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  router: ReturnType<typeof useRouter>;
}) => {
  const [activeTab, setActiveTab] = useState<"discover" | "mine">("discover");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [myMentorships, setMyMentorships] = useState<MyMentorship[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingMine, setLoadingMine] = useState(true);

  const loadMentors = useCallback(() => {
    setLoadingMentors(true);
    mentorshipService.getMentors({ limit: 100 })
      .then((res: any) => {
        const data = res?.data ?? res;
        setMentors(Array.isArray(data) ? data : []);
      })
      .catch(() => setMentors([]))
      .finally(() => setLoadingMentors(false));
  }, []);

  const loadMine = useCallback(() => {
    setLoadingMine(true);
    mentorshipService.getMyMentorships({ role: "disciple", limit: 50 })
      .then((res: any) => {
        const data = res?.data ?? res;
        setMyMentorships(Array.isArray(data) ? data : []);
      })
      .catch(() => setMyMentorships([]))
      .finally(() => setLoadingMine(false));
  }, []);

  useEffect(() => { loadMentors(); loadMine(); }, [loadMentors, loadMine]);

  const filteredMentors = mentors.filter((mentor) => {
    const q = searchQuery.toLowerCase();
    const name = `${mentor.firstName} ${mentor.lastName}`.toLowerCase();
    const specs = (mentor.mentorProfile?.specializations ?? []).join(" ").toLowerCase();
    return name.includes(q) || (mentor.username ?? "").toLowerCase().includes(q) || specs.includes(q);
  });

  return (
    <div>
      {/* Tabs + Search row */}
      <div className="flex items-center justify-between gap-4 px-4 lg:px-12">
        <div className="flex gap-3 overflow-x-auto">
          {(["discover", "mine"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`border px-4.5 py-3 whitespace-nowrap rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                activeTab === t
                  ? "bg-white border-black font-semibold text-[#180426]"
                  : "text-[#4E5255] border-[#D2D9DF] hover:border-gray-400"
              }`}
            >
              {t === "discover" ? "Discover Mentors" : `My Mentorships${myMentorships.length > 0 ? ` (${myMentorships.length})` : ""}`}
            </button>
          ))}
        </div>
        {activeTab === "discover" && (
          <div className="relative hidden sm:block w-56 lg:w-72 shrink-0">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or specialty…"
              className="w-full pl-9 pr-4 py-2.5 border border-[#D2D9DF] rounded-full text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10 bg-white transition-colors"
            />
          </div>
        )}
      </div>

      <div className="border-t border-[#D2D9DF] mt-5 px-4 lg:px-12 py-6">

      {/* ── Discover tab ── */}
      {activeTab === "discover" && (
        <>

          {loadingMentors ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                <Inbox size={24} className="text-[#870BD6]" />
              </div>
              <p className="font-semibold text-gray-700">No mentors found</p>
              <p className="text-sm text-[#60666B]">No mentors are accepting disciples right now. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {filteredMentors.map((mentor, index) => (
                <div key={mentor.id} className={`stagger-${Math.min(index + 3, 5)}`}>
                  <MentorCard
                    mentor={mentor}
                    onClick={() => router.push(`/dashboard/buildup/mentorshipHub/${mentor.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── My Mentorships tab ── */}
      {activeTab === "mine" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-[#60666B]">Your active and past mentorship relationships.</p>
            <button onClick={loadMine} title="Refresh" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <RefreshCw size={14} className="text-gray-500" />
            </button>
          </div>

          {loadingMine ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : myMentorships.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                <Inbox size={24} className="text-[#870BD6]" />
              </div>
              <p className="font-semibold text-gray-700">No mentorships yet</p>
              <p className="text-sm text-[#60666B] max-w-xs">
                Find a mentor in the Discover tab and send a request to begin your discipleship journey.
              </p>
              <button
                onClick={() => setActiveTab("discover")}
                className="mt-2 px-5 py-2 bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white text-sm font-medium rounded-full"
              >
                Find a Mentor
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myMentorships.map((m) => (
                <button
                  key={m.id}
                  onClick={() => router.push(`/dashboard/buildup/mentorshipHub/${m.mentor.id}`)}
                  className="w-full bg-white border border-[#E3E8EF] rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow text-left"
                >
                  <MentorAvatar user={m.mentor} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#180426] text-sm">{m.mentor.firstName} {m.mentor.lastName}</p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASSES[m.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {m.status.toLowerCase()}
                      </span>
                    </div>
                    {m.mentor.username && <p className="text-xs text-[#60666B]">@{m.mentor.username}</p>}
                    {m.mentor.mentorProfile?.specializations?.length ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.mentor.mentorProfile.specializations.slice(0, 3).map((s) => (
                          <span key={s} className="text-[10px] bg-[#F5EBFF] text-[#870BD6] px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <p className="text-xs text-[#60666B] shrink-0">
                    {new Date(m.startedAt ?? m.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      </div>
    </div>
  );
};

export default MentorShipPage;
