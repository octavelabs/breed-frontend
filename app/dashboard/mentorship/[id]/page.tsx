"use client";

import DashboardLayout from "@/app/layout/DashboardLayout";
import { ArrowLeft, Zap, Calendar, CheckSquare, Users, Clock, CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { usePageTitle } from '@/app/hooks/usePageTitle';
import { mentorshipService } from "@/lib/api-services";
import { BookingModal } from "./components/BookingModal";
import Link from "next/link";

interface MentorProfile {
  bio?: string | null;
  specializations?: string[];
  sessionRate?: number | null;
  maxDisciples?: number | null;
  isAccepting?: boolean;
}

interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  discipleCount: number;
  mentorProfile?: MentorProfile | null;
}

interface Mentorship {
  id: string;
  status: string;
  message?: string | null;
  createdAt: string;
  startedAt?: string | null;
}

interface Session {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  status: string;
}

interface MentorshipTask {
  id: string;
  title: string;
  description?: string | null;
  isCompleted: boolean;
  dueDate?: string | null;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Request Pending",   cls: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]" },
  ACTIVE:    { label: "Active Mentorship", cls: "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]" },
  REJECTED:  { label: "Request Declined", cls: "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]" },
  PAUSED:    { label: "Paused",            cls: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]" },
  COMPLETED: { label: "Completed",         cls: "bg-[#F2F4F7] text-[#344054] border border-[#D0D5DD]" },
};

const SESSION_STATUS_CLASSES: Record<string, string> = {
  SCHEDULED:   "bg-[#FFFAEB] text-[#B54708]",
  IN_PROGRESS: "bg-[#EFF8FF] text-[#175CD3]",
  COMPLETED:   "bg-[#ECFDF3] text-[#067647]",
  CANCELLED:   "bg-[#FEF3F2] text-[#B42318]",
};

const MentorProfilePage = () => {
  const router = useRouter();
  const params = useParams();
  const mentorId = params?.id as string;

  const [activeTab, setActiveTab] = useState("overview");
  const { data: mentor = null, isLoading: loadingMentor, isError: mentorError } = useQuery({
    queryKey: ['mentor', mentorId],
    queryFn: () => mentorshipService.getMentorById(mentorId) as Promise<Mentor>,
    enabled: !!mentorId,
  });
  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  usePageTitle(mentor ? `${mentor.firstName} ${mentor.lastName}` : null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<MentorshipTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingMentorship, setLoadingMentorship] = useState(true);
  const [isBookingOpen, setBookingOpen] = useState(false);

  const loadMentorshipStatus = useCallback(() => {
    setLoadingMentorship(true);
    mentorshipService.getMyMentorships({ role: "disciple", limit: 50 })
      .then((res: any) => {
        const list: any[] = res?.data ?? res ?? [];
        const match = Array.isArray(list)
          ? list.find((m: any) => m.mentor?.id === mentorId || m.mentorId === mentorId)
          : null;
        setMentorship(match ?? null);

        if (match && (match.status === "ACTIVE" || match.status === "PAUSED")) {
          return mentorshipService.getMySessions({ limit: 20 });
        }
        return null;
      })
      .then((sessRes: any) => {
        if (!sessRes) return;
        const data: any[] = sessRes?.data ?? sessRes ?? [];
        if (Array.isArray(data)) {
          setSessions(data.filter((s: any) => s.mentor?.id === mentorId || s.mentorId === mentorId));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMentorship(false));
  }, [mentorId]);

  useEffect(() => { loadMentorshipStatus(); }, [loadMentorshipStatus]);

  useEffect(() => {
    if (activeTab !== "tasks" || !mentorship?.id) return;
    setLoadingTasks(true);
    mentorshipService.getMyTasks({ mentorshipId: mentorship.id, limit: 50 })
      .then((res: any) => {
        const data = res?.data ?? res;
        setTasks(Array.isArray(data) ? data : []);
      })
      .catch(() => setTasks([]))
      .finally(() => setLoadingTasks(false));
  }, [activeTab, mentorship?.id]);

  if (loadingMentor) {
    return (
      <DashboardLayout custom={true}>
        <div className="border-l border-[#D2D9DF] dark:border-[#2D313A]">
          <div className="bg-[#870BD6] h-48" />
          <div className="px-4 md:px-12 py-6 space-y-4 animate-pulse">
            <div className="flex gap-5">
              <div className="w-30 h-30 rounded-full bg-gray-200 dark:bg-[#252830] -mt-20" />
              <div className="space-y-2 pt-2">
                <div className="h-6 w-48 bg-gray-200 dark:bg-[#252830] rounded" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-[#252830] rounded" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (mentorError || !mentor) {
    return (
      <DashboardLayout custom={true}>
        <div className="border-l border-[#D2D9DF] dark:border-[#2D313A] flex flex-col items-center justify-center py-20 gap-3">
          <p className="font-semibold text-gray-700 dark:text-[#E2E4E9]">Mentor not found</p>
          <button onClick={() => router.back()} className="text-sm text-[#870BD6] hover:underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const mentorshipStatus = mentorship?.status ?? null;
  const statusInfo = mentorshipStatus ? STATUS_LABEL[mentorshipStatus] : null;
  const isActive = mentorshipStatus === "ACTIVE" || mentorshipStatus === "PAUSED";
  const isPending = mentorshipStatus === "PENDING";
  const canRequest = !mentorshipStatus || mentorshipStatus === "REJECTED" || mentorshipStatus === "COMPLETED";

  const upcomingSessions = sessions.filter((s) => s.status === "SCHEDULED" || s.status === "IN_PROGRESS");
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");

  const mentorDisplayName = `${mentor.firstName} ${mentor.lastName}`;

  return (
    <>
      {isBookingOpen && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setBookingOpen(false)}
          onSuccess={() => {
            setBookingOpen(false);
            loadMentorshipStatus();
          }}
          mentorInfo={{
            id: mentor.id,
            name: mentorDisplayName,
            avatarUrl: mentor.avatarUrl,
            specializations: mentor.mentorProfile?.specializations,
          }}
        />
      )}

      <DashboardLayout custom={true}>
        <div className="border-l border-[#D2D9DF] dark:border-[#2D313A]">
          {/* Banner */}
          <div
            className="bg-[#870BD6] h-48 relative"
            style={{ backgroundImage: "url('/dashboard-header.png')" }}
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-size-[20px_20px]" />
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 cursor-pointer px-4 md:px-12 pt-16 relative z-20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Profile header */}
          <div className="px-4 md:px-12 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-5">
              {mentor.avatarUrl ? (
                <img
                  src={mentor.avatarUrl}
                  alt={mentorDisplayName}
                  className="w-30 lg:w-45 h-30 lg:h-45 rounded-full border-[3px] border-white object-cover -mt-20 relative z-20"
                />
              ) : (
                <div className="w-30 lg:w-45 h-30 lg:h-45 rounded-full border-[3px] border-white bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-4xl -mt-20 relative z-20">
                  {`${mentor.firstName[0]}${mentor.lastName[0]}`.toUpperCase()}
                </div>
              )}

              <div className="hidden lg:block">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[24px] font-bold dark:text-white">{mentorDisplayName}</h2>
                  {statusInfo && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                  )}
                </div>
                {mentor.username && <p className="text-sm text-[#60666B] dark:text-[#9CA3AF]">@{mentor.username}</p>}
                {mentor.mentorProfile?.specializations?.length ? (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {mentor.mentorProfile.specializations.slice(0, 4).map((s) => (
                      <span key={s} className="text-xs bg-[#F5EBFF] dark:bg-[#2D1B4E] text-[#870BD6] dark:text-[#A855F7] px-2.5 py-0.5 rounded-full font-medium">{s}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Mobile name block */}
            <div className="lg:hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[24px] font-bold">{mentorDisplayName}</h2>
                {statusInfo && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.cls}`}>
                    {statusInfo.label}
                  </span>
                )}
              </div>
              {mentor.username && <p className="text-sm text-[#60666B] dark:text-[#9CA3AF]">@{mentor.username}</p>}
              {mentor.mentorProfile?.specializations?.length ? (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {mentor.mentorProfile.specializations.slice(0, 4).map((s) => (
                    <span key={s} className="text-xs bg-[#F5EBFF] dark:bg-[#2D1B4E] text-[#870BD6] dark:text-[#A855F7] px-2.5 py-0.5 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* CTA */}
            <div className="shrink-0">
              {loadingMentorship ? (
                <div className="h-11 w-44 bg-gray-200 dark:bg-[#252830] rounded-full animate-pulse" />
              ) : canRequest ? (
                <button
                  onClick={() => setBookingOpen(true)}
                  className="bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white px-8 py-3 rounded-full font-semibold cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Book a Session
                </button>
              ) : isPending ? (
                <div className="flex items-center gap-2 px-6 py-3 bg-[#FFFAEB] border border-[#FEDF89] rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#B54708]" />
                  <span className="text-sm font-semibold text-[#B54708]">Request Pending</span>
                </div>
              ) : isActive ? (
                <div className="flex items-center gap-2 px-6 py-3 bg-[#ECFDF3] border border-[#ABEFC6] rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#067647]" />
                  <span className="text-sm font-semibold text-[#067647]">Active Mentorship</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 md:px-12 pt-2">
            <div className="flex gap-8 border-b border-[#D2D9DF] dark:border-[#2D313A]">
              {["overview", ...(isActive ? ["sessions", "tasks"] : []), "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-[15px] capitalize transition-colors ${
                    activeTab === tab
                      ? "border-b-2 border-[#870BD6] font-semibold text-[#180426] dark:text-white"
                      : "text-gray-500 dark:text-[#9CA3AF] hover:text-[#180426] dark:hover:text-white"
                  }`}
                >
                  {tab}
                  {tab === "sessions" && upcomingSessions.length > 0 && (
                    <span className="ml-1.5 text-xs bg-[#870BD6] text-white px-1.5 py-0.5 rounded-full">
                      {upcomingSessions.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-4 lg:px-12 py-6 flex flex-col lg:flex-row gap-8 items-start">
            {/* Overview */}
            {activeTab === "overview" && (
              <>
                <div className="w-full lg:w-[60%] space-y-4 leading-relaxed text-[#3C3E40] dark:text-[#E2E4E9]">
                  {(mentor.mentorProfile?.bio ?? mentor.bio) ? (
                    <p>{mentor.mentorProfile?.bio ?? mentor.bio}</p>
                  ) : (
                    <p className="text-[#60666B] dark:text-[#9CA3AF] italic">No bio available yet.</p>
                  )}

                  {isActive && mentorship?.createdAt && (
                    <div className="mt-4 bg-[#F5EBFF] dark:bg-[#2D1B4E] border border-[#D4A8F0] dark:border-[#4B2A6E] rounded-2xl p-4">
                      <p className="text-sm font-semibold text-[#5B26B1] dark:text-[#A855F7] mb-1">Your Mentorship</p>
                      <p className="text-xs text-[#60666B] dark:text-[#9CA3AF]">
                        Started{" "}
                        {new Date(mentorship.startedAt ?? mentorship.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-[#181A1F] rounded-2xl p-4 shadow-[0px_4px_4px_0px_#60666B0D] flex w-full lg:w-[40%] shrink-0 gap-2 -order-1 lg:order-0">
                  <Stat
                    label="Active disciples"
                    value={String(mentor.discipleCount)}
                    icon={<Users stroke="#4287FB" className="w-5 h-5" />}
                    backgroundColor="#F0F5FF"
                  />
                  <Stat
                    label="Completed sessions"
                    value={String(completedSessions.length)}
                    icon={<Zap stroke="#4287FB" className="w-5 h-5" />}
                    backgroundColor="#F0F5FF"
                  />
                </div>
              </>
            )}

            {/* Sessions */}
            {activeTab === "sessions" && isActive && (
              <div className="w-full">
                {sessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center">
                      <Calendar size={20} className="text-[#870BD6]" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-white">No sessions yet</p>
                    <p className="text-sm text-[#60666B] dark:text-[#9CA3AF]">
                      Your mentor will schedule sessions. You can send a session request above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.length > 0 && (
                      <>
                        <p className="text-sm font-semibold text-[#60666B] dark:text-[#9CA3AF] uppercase tracking-wide mb-2">Upcoming</p>
                        {upcomingSessions.map((s) => <SessionCard key={s.id} session={s} />)}
                      </>
                    )}
                    {completedSessions.length > 0 && (
                      <>
                        <p className="text-sm font-semibold text-[#60666B] dark:text-[#9CA3AF] uppercase tracking-wide mt-4 mb-2">Completed</p>
                        {completedSessions.map((s) => <SessionCard key={s.id} session={s} />)}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tasks */}
            {activeTab === "tasks" && isActive && (
              <div className="w-full">
                {loadingTasks ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 dark:bg-[#252830] rounded-2xl animate-pulse" />)}
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <div className="w-12 h-12 rounded-full bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center">
                      <CheckSquare size={20} className="text-[#870BD6]" />
                    </div>
                    <p className="font-semibold text-gray-700 dark:text-white">No tasks yet</p>
                    <p className="text-sm text-[#60666B] dark:text-[#9CA3AF]">Tasks assigned by your mentor will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((t) => (
                      <div key={t.id} className={`bg-white dark:bg-[#181A1F] border rounded-2xl p-4 ${t.isCompleted ? "border-[#ABEFC6]" : "border-[#E3E8EF] dark:border-[#2D313A]"}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center shrink-0 ${t.isCompleted ? "bg-[#1A8454]" : "border-2 border-[#B9C2CA] dark:border-[#717784]"}`}>
                            {t.isCompleted && (
                              <svg width="10" height="8" fill="none" viewBox="0 0 10 8">
                                <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${t.isCompleted ? "text-[#60666B] dark:text-[#717784] line-through" : "text-[#180426] dark:text-white"}`}>
                              {t.title}
                            </p>
                            {t.description && <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] mt-0.5">{t.description}</p>}
                            {t.dueDate && (
                              <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] mt-1">
                                Due: {new Date(t.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            )}
                          </div>
                          {t.isCompleted && <CheckCircle2 size={16} className="text-[#1A8454] shrink-0 mt-0.5" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <div className="w-full text-[#60666B] dark:text-[#9CA3AF] py-10 text-center">
                <p className="text-sm">Reviews are not available yet.</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

function SessionCard({ session }: { session: Session }) {
  const statusCls = SESSION_STATUS_CLASSES[session.status] ?? "bg-gray-100 text-gray-600";
  const isUpcoming = session.status === "SCHEDULED" || session.status === "IN_PROGRESS";
  return (
    <Link href={`/dashboard/mentorship/sessions/${session.id}`}>
      <div className="bg-white dark:bg-[#181A1F] border border-[#E3E8EF] dark:border-[#2D313A] rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm hover:border-[#D4A8F0] transition-all cursor-pointer group">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUpcoming ? "bg-[#F5EBFF] dark:bg-[#2D1B4E]" : "bg-[#F0F2F4] dark:bg-[#252830]"}`}>
          <Calendar size={18} className={isUpcoming ? "text-[#870BD6]" : "text-[#60666B] dark:text-[#9CA3AF]"} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#180426] dark:text-white group-hover:text-[#870BD6] transition-colors">{session.title}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-[#60666B] dark:text-[#9CA3AF]">
              {new Date(session.scheduledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="text-xs text-[#60666B] dark:text-[#9CA3AF]">
              {new Date(session.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#60666B] dark:text-[#9CA3AF]">
              <Clock size={11} />
              {session.duration} min
            </span>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${statusCls}`}>
          {session.status.toLowerCase().replace("_", " ")}
        </span>
      </div>
    </Link>
  );
}

function Stat({ value, label, icon, backgroundColor }: {
  value: string;
  label: string;
  icon: React.ReactNode;
  backgroundColor: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10.5 h-10.5 flex items-center justify-center rounded-2xl" style={{ backgroundColor }}>
        {icon}
      </div>
      <div>
        <p className="font-bold text-[17px] leading-none mb-0.5">{value}</p>
        <p className="text-[15px] text-[#60666B] dark:text-[#9CA3AF] leading-tight">{label}</p>
      </div>
    </div>
  );
}

export default MentorProfilePage;
