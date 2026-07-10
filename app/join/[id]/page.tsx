"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Video, Calendar, User, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { meetingsService } from "@/lib/api-services";

interface PublicMeetingInfo {
  id: string;
  title: string;
  type: string;
  status: string;
  scheduledAt: string;
  duration: number;
  organizer: { firstName: string; lastName: string; avatarUrl: string | null };
}

const EARLY_ACCESS_MINUTES = 15;

function getMeetingWindow(meeting: PublicMeetingInfo) {
  const start = new Date(meeting.scheduledAt).getTime();
  const end = start + (meeting.duration ?? 60) * 60_000;
  const openAt = start - EARLY_ACCESS_MINUTES * 60_000;
  return { start, end, openAt };
}

export default function JoinPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [meeting, setMeeting] = useState<PublicMeetingInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [timeState, setTimeState] = useState<"loading" | "too_early" | "open" | "ended">("loading");

  useEffect(() => {
    meetingsService.getPublicInfo(id)
      .then((res) => setMeeting(res as PublicMeetingInfo))
      .catch(() => setNotFound(true));
  }, [id]);

  // Derive time state once meeting is loaded, re-check every 30s
  useEffect(() => {
    if (!meeting) return;

    const evaluate = () => {
      const { openAt, end } = getMeetingWindow(meeting);
      const now = Date.now();
      if (meeting.status === "CANCELLED") { setTimeState("ended"); return; }
      if (now < openAt) setTimeState("too_early");
      else if (now > end) setTimeState("ended");
      else setTimeState("open");
    };

    evaluate();
    const interval = setInterval(evaluate, 30_000);
    return () => clearInterval(interval);
  }, [meeting]);

  // Redirect logged-in users only when the window is open
  useEffect(() => {
    if (!isLoading && user && timeState === "open") {
      router.replace(`/room/${id}`);
    }
  }, [isLoading, user, timeState, id, router]);

  // Auth still resolving, or logged in and about to redirect
  if (isLoading || (!isLoading && user && timeState === "open")) {
    return (
      <div className="fixed inset-0 bg-[#0d0d1a] flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-linear-to-b from-[#A967F1] to-[#5B26B1] flex items-center justify-center">
          <Video size={28} className="text-white" />
        </div>
        <p className="text-white font-semibold text-lg">Joining meeting…</p>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#870BD6] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="fixed inset-0 bg-[#0d0d1a] flex flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1a1a2e] flex items-center justify-center mb-2">
          <Video size={28} className="text-gray-500" />
        </div>
        <p className="text-white font-bold text-xl">Meeting not found</p>
        <p className="text-gray-400 text-sm">This link may have expired or the meeting was cancelled.</p>
      </div>
    );
  }

  // Logged-in user blocked by timing
  if (!isLoading && user && (timeState === "too_early" || timeState === "ended")) {
    const scheduledDate = meeting
      ? new Date(meeting.scheduledAt).toLocaleString("en-US", {
          weekday: "short", month: "short", day: "numeric",
          hour: "numeric", minute: "2-digit",
        })
      : null;

    return (
      <div className="fixed inset-0 bg-[#0d0d1a] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1a1a2e] flex items-center justify-center mb-2">
          <Clock size={28} className={timeState === "ended" ? "text-gray-500" : "text-[#A967F1]"} />
        </div>
        {timeState === "too_early" ? (
          <>
            <p className="text-white font-bold text-xl">Meeting hasn't started yet</p>
            <p className="text-gray-400 text-sm">
              You can join up to {EARLY_ACCESS_MINUTES} minutes before it starts.
            </p>
            {scheduledDate && (
              <p className="text-[#A967F1] text-sm font-medium">{scheduledDate}</p>
            )}
          </>
        ) : (
          <>
            <p className="text-white font-bold text-xl">This meeting has ended</p>
            <p className="text-gray-400 text-sm">The meeting is no longer available to join.</p>
          </>
        )}
      </div>
    );
  }

  // Not logged in — show landing card
  const redirect = encodeURIComponent(`/join/${id}`);
  const scheduledDate = meeting?.scheduledAt
    ? new Date(meeting.scheduledAt).toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : null;

  return (
    <div className="fixed inset-0 bg-[#0d0d1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#13102B] rounded-3xl overflow-hidden shadow-2xl">
        {/* Top banner */}
        <div className="bg-linear-to-br from-[#A967F1] to-[#5B26B1] px-8 py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Video size={28} className="text-white" />
          </div>
          <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-1">You're invited to</p>
          {meeting ? (
            <h1 className="text-white font-bold text-2xl leading-snug">{meeting.title}</h1>
          ) : (
            <div className="h-7 w-48 bg-white/20 rounded-lg mx-auto animate-pulse" />
          )}
        </div>

        {/* Details */}
        <div className="px-8 py-6 space-y-3">
          {meeting && (
            <>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <User size={15} className="text-[#A967F1] shrink-0" />
                <span>Hosted by <strong className="text-white">{meeting.organizer.firstName} {meeting.organizer.lastName}</strong></span>
              </div>
              {scheduledDate && (
                <div className="flex items-center gap-3 text-gray-300 text-sm">
                  <Calendar size={15} className="text-[#A967F1] shrink-0" />
                  <span>{scheduledDate}</span>
                </div>
              )}
            </>
          )}

          <div className="pt-4 space-y-3">
            <Link
              href={`/login?redirect=${redirect}`}
              className="block w-full text-center py-3.5 rounded-full bg-[#870BD6] hover:bg-[#6A09AA] text-white font-semibold text-sm transition-colors"
            >
              Sign in to join
            </Link>
            <Link
              href={`/signup?redirect=${redirect}`}
              className="block w-full text-center py-3.5 rounded-full border border-[#3D2A6E] hover:bg-[#1e1840] text-white font-semibold text-sm transition-colors"
            >
              Create an account
            </Link>
          </div>

          <p className="text-center text-gray-500 text-xs pt-2">
            You need a Breed account to join this meeting.
          </p>
        </div>
      </div>
    </div>
  );
}
