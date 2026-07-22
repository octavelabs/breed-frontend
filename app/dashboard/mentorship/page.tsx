"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { mentorshipService } from "@/lib/api-services";
import {
  Search,
  Inbox,
  RefreshCw,
  Calendar,
  Clock,
  Video,
  Users,
} from "lucide-react";

interface MentorProfile {
  bio?: string | null;
  specializations?: string[];
  sessionRate?: number | null;
  maxDisciples?: number | null;
}

interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string | null;
  discipleCount: number;
  sessionCount?: number;
  reviewCount?: number;
  mentorProfile?: MentorProfile | null;
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
    mentorProfile?: MentorProfile | null;
  };
}

interface UpcomingSession {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  status: string;
  meetingLink?: string | null;
  mentor: { id: string; firstName: string; lastName: string };
}

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  ACTIVE: "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]",
  REJECTED: "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
  PAUSED: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  COMPLETED: "bg-[#F2F4F7] text-[#344054] border border-[#D0D5DD]",
};

function Avatar({
  user,
  size = "md",
}: {
  user: { firstName: string; lastName: string; avatarUrl?: string | null };
  size?: "sm" | "md" | "lg";
}) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const cls =
    size === "lg"
      ? "w-14 h-14 text-base"
      : size === "sm"
        ? "w-8 h-8 text-xs"
        : "w-10 h-10 text-sm";
  return user.avatarUrl ? (
    <img
      src={user.avatarUrl}
      alt={user.firstName}
      className={`${cls} rounded-full object-cover shrink-0`}
    />
  ) : (
    <div
      className={`${cls} rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold shrink-0`}
    >
      {initials}
    </div>
  );
}

function MentorCard({ mentor, onClick }: { mentor: Mentor; onClick: () => void }) {
  const initials = `${mentor.firstName[0]}${mentor.lastName[0]}`.toUpperCase();
  const roleText = mentor.role ?? mentor.mentorProfile?.specializations?.[0] ?? null;
  const sessions = mentor.sessionCount ?? 0;
  const reviews = mentor.reviewCount ?? 0;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#181A1F] border border-[#E3E8EF] dark:border-[#2D313A] rounded-2xl p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow cursor-pointer text-center"
    >
      {/* Avatar */}
      {mentor.avatarUrl ? (
        <img src={mentor.avatarUrl} alt={mentor.firstName} className="w-[100px] h-[100px] rounded-full object-cover" />
      ) : (
        <div className="w-[100px] h-[100px] rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-2xl">
          {initials}
        </div>
      )}

      {/* Name · username · role */}
      <div>
        <p className="font-bold text-[#180426] dark:text-white text-[15px] leading-snug">
          {mentor.firstName} {mentor.lastName}
        </p>
        {mentor.username && (
          <p className="text-xs text-[#870BD6] font-medium mt-0.5">@{mentor.username}</p>
        )}
        {roleText && (
          <p className="text-[13px] text-[#60666B] dark:text-[#9CA3AF] mt-0.5 line-clamp-1">{roleText}</p>
        )}
      </div>

      {/* Stats */}
      <div className="w-full border-t border-[#F0F1F3] dark:border-[#2D313A] pt-3 grid grid-cols-3 gap-1">
        <div>
          <p className="font-bold text-[#180426] dark:text-white text-sm">{mentor.discipleCount}</p>
          <p className="text-[11px] text-[#60666B] dark:text-[#9CA3AF]">disciples</p>
        </div>
        <div className="border-x border-[#F0F1F3] dark:border-[#2D313A]">
          <p className="font-bold text-[#180426] dark:text-white text-sm">{sessions}</p>
          <p className="text-[11px] text-[#60666B] dark:text-[#9CA3AF]">sessions</p>
        </div>
        <div>
          <p className="font-bold text-[#180426] dark:text-white text-sm">{reviews}</p>
          <p className="text-[11px] text-[#60666B] dark:text-[#9CA3AF]">reviews</p>
        </div>
      </div>
    </div>
  );
}

const MentorshipPage = () => {
  const router = useRouter();
  const [tab, setTab] = useState<"discover" | "my">("discover");
  const [myMentorships, setMyMentorships] = useState<MyMentorship[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>(
    [],
  );
  const [loadingMy, setLoadingMy] = useState(true);
  const [search, setSearch] = useState("");

  const { data: mentors = [], isLoading: loadingMentors } = useQuery({
    queryKey: ['mentors'],
    queryFn: () =>
      mentorshipService.getMentors({ limit: 50 }).then((res: any) => {
        const data = res?.data ?? res;
        return Array.isArray(data) ? (data as Mentor[]) : [];
      }),
  });

  const loadMyMentorships = useCallback(() => {
    setLoadingMy(true);
    const mentorshipsCall = mentorshipService
      .getMyMentorships({ role: "disciple", limit: 50 })
      .then((res: any) => {
        const data = res?.data ?? res;
        setMyMentorships(Array.isArray(data) ? data : []);
      })
      .catch(() => setMyMentorships([]));

    const sessionsCall = mentorshipService
      .getMySessions({ limit: 50 })
      .then((res: any) => {
        const data = res?.data ?? res;
        const now = new Date();
        const upcoming = (Array.isArray(data) ? data : []).filter(
          (s: any) =>
            (s.status === "SCHEDULED" || s.status === "IN_PROGRESS") &&
            new Date(s.scheduledAt) >= now,
        );
        upcoming.sort(
          (a: any, b: any) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        );
        setUpcomingSessions(upcoming);
      })
      .catch(() => setUpcomingSessions([]));

    Promise.all([mentorshipsCall, sessionsCall]).finally(() =>
      setLoadingMy(false),
    );
  }, []);

  useEffect(() => {
    loadMyMentorships();
  }, [loadMyMentorships]);

  const filteredMentors = mentors.filter((m) => {
    const q = search.toLowerCase();
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      (m.username ?? "").toLowerCase().includes(q) ||
      (m.bio ?? "").toLowerCase().includes(q) ||
      (m.mentorProfile?.specializations ?? []).some((s) =>
        s.toLowerCase().includes(q),
      )
    );
  });

  return (
    <DashboardLayout custom={true}>
      {/* Header */}
      <div className="flex justify-start items-center pb-[27px] lg:pb-8 px-4 lg:px-12 mt-6 lg:mt-[64px] border-b border-[#D2D9DF] dark:border-[#2D313A]">
        <h1 className="text-[24px] lg:text-[32px] leading-none font-bold dark:text-white">Mentorship</h1>
      </div>

      <div className="bg-white dark:bg-[#121316] min-h-screen">
        {/* Tab pills + search row */}
        <div className="px-4 lg:px-12 py-5 flex items-center justify-between gap-4">
          <div className="flex gap-3 overflow-x-auto">
            {(["discover", "my"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border px-4.5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
                  tab === t
                    ? "bg-white dark:bg-[#252830] border-black dark:border-transparent font-semibold text-[#180426] dark:text-white"
                    : "text-[#4E5255] dark:text-[#9CA3AF] border-[#D2D9DF] dark:border-[#2D313A] hover:border-gray-400 dark:hover:border-[#717784]"
                }`}
              >
                {t === "discover"
                  ? "Discover Mentors"
                  : `My Mentorships${myMentorships.length > 0 ? ` (${myMentorships.length})` : ""}`}
              </button>
            ))}
          </div>
          <div className="relative hidden sm:block w-56 lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#717784] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === "discover" ? "Search by name or specialty…" : "Search mentorships…"}
              className="w-full pl-9 pr-4 py-2.5 border border-[#D2D9DF] dark:border-[#2D313A] rounded-full text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10 bg-white dark:bg-[#252830] dark:text-white dark:placeholder:text-[#717784] transition-colors"
            />
          </div>
        </div>

        {/* ── Discover ── */}
        {tab === "discover" && (
          <div className="border-t border-[#D2D9DF] dark:border-[#2D313A] px-4 lg:px-12 py-6">
            {loadingMentors ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-52 bg-gray-100 dark:bg-[#252830] rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : filteredMentors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center">
                  <Users size={26} className="text-[#870BD6]" />
                </div>
                <p className="font-semibold text-gray-700 dark:text-white">No mentors found</p>
                <p className="text-sm text-[#60666B] dark:text-[#9CA3AF]">
                  There are no mentors accepting disciples right now.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    onClick={() =>
                      router.push(`/dashboard/mentorship/${mentor.id}`)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── My Mentorships ── */}
        {tab === "my" && (
          <div className="border-t border-[#D2D9DF] dark:border-[#2D313A] px-4 lg:px-12 py-6 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-[#60666B] dark:text-[#9CA3AF]">
                Your active and past mentorship relationships.
              </p>
              <button
                onClick={loadMyMentorships}
                title="Refresh"
                className="p-2 border border-gray-200 dark:border-[#2D313A] rounded-lg hover:bg-gray-50 dark:hover:bg-[#252830]"
              >
                <RefreshCw size={14} className="text-gray-500 dark:text-[#717784]" />
              </button>
            </div>

            {loadingMy ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-100 dark:bg-[#252830] rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : myMentorships.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center">
                  <Inbox size={26} className="text-[#870BD6]" />
                </div>
                <p className="font-semibold text-gray-700 dark:text-white">
                  No mentorships yet
                </p>
                <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] max-w-xs">
                  Request a mentor from the Discover tab to begin your
                  discipleship journey.
                </p>
                <button
                  onClick={() => setTab("discover")}
                  className="mt-2 px-5 py-2 bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white text-sm font-medium rounded-full"
                >
                  Find a Mentor
                </button>
              </div>
            ) : (
              <>
                {/* Upcoming sessions */}
                {upcomingSessions.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-[#60666B] dark:text-[#9CA3AF] uppercase tracking-wide mb-2">
                      Upcoming Sessions
                    </p>
                    <div className="space-y-2">
                      {upcomingSessions.map((s) => {
                        const scheduledAt = new Date(s.scheduledAt);
                        return (
                          <button
                            key={s.id}
                            onClick={() =>
                              router.push(
                                `/dashboard/mentorship/sessions/${s.id}`,
                              )
                            }
                            className="w-full bg-white dark:bg-[#181A1F] border border-[#E3E8EF] dark:border-[#2D313A] rounded-2xl p-4 cursor-pointer hover:border-[#870BD6] hover:bg-[#FBF6FF] dark:hover:bg-[#2D1B4E] transition-all text-left group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center shrink-0">
                                <Calendar
                                  size={18}
                                  className="text-[#870BD6]"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-[#180426] dark:text-white">
                                  {s.title}
                                </p>
                                <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] mt-0.5">
                                  with {s.mentor.firstName} {s.mentor.lastName}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                  <span className="flex items-center gap-1 text-xs text-[#60666B] dark:text-[#9CA3AF]">
                                    <Calendar size={11} />
                                    {scheduledAt.toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-[#60666B] dark:text-[#9CA3AF]">
                                    <Clock size={11} />
                                    {scheduledAt.toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <span className="text-xs text-[#60666B] dark:text-[#9CA3AF]">
                                    {s.duration} min
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white text-xs font-medium rounded-full shrink-0 group-hover:opacity-90 transition-opacity">
                                <Video size={11} />
                                View
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <hr className="my-4 border-[#E3E8EF] dark:border-[#2D313A]" />
                  </div>
                )}

                {/* Mentorship relationships */}
                <p className="text-xs font-semibold text-[#60666B] dark:text-[#9CA3AF] uppercase tracking-wide mb-2">
                  Mentors
                </p>
                {myMentorships.map((m) => (
                  <button
                    key={m.id}
                    onClick={() =>
                      router.push(`/dashboard/mentorship/${m.mentor.id}`)
                    }
                    className="w-full bg-white dark:bg-[#181A1F] border border-[#E3E8EF] dark:border-[#2D313A] rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow text-left"
                  >
                    <Avatar user={m.mentor} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[#180426] dark:text-white">
                          {m.mentor.firstName} {m.mentor.lastName}
                        </p>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CLASSES[m.status] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {m.status.toLowerCase()}
                        </span>
                      </div>
                      {m.mentor.username && (
                        <p className="text-xs text-[#60666B] dark:text-[#9CA3AF]">
                          @{m.mentor.username}
                        </p>
                      )}
                      {m.mentor.mentorProfile?.specializations?.length ? (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {m.mentor.mentorProfile.specializations
                            .slice(0, 3)
                            .map((s) => (
                              <span
                                key={s}
                                className="text-[10px] bg-[#F5EBFF] dark:bg-[#2D1B4E] text-[#870BD6] dark:text-[#A855F7] px-2 py-0.5 rounded-full"
                              >
                                {s}
                              </span>
                            ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-xs text-[#60666B] dark:text-[#9CA3AF] text-right shrink-0">
                      <p>Since</p>
                      <p className="font-medium text-[#180426] dark:text-white">
                        {new Date(
                          m.startedAt ?? m.createdAt,
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MentorshipPage;
