"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { mentorshipService } from "@/lib/api-services";
import {
  ArrowLeft, Calendar, Clock, Users, Copy, Check,
  Video, XCircle, X, UserCircle,
} from "lucide-react";
import Button from "@/app/components/Button";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────

interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  username?: string | null;
}

interface SessionDetail {
  id: string;
  title: string;
  description?: string | null;
  scheduledAt: string;
  duration: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  meetingLink?: string | null;
  roomCode?: string | null;
  notes?: string | null;
  mentorId: string;
  discipleId: string;
  mentor: SessionUser;
  disciple: SessionUser;
  mentorship: { id: string };
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  SCHEDULED:   { label: "Scheduled",   classes: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]" },
  IN_PROGRESS: { label: "In Progress", classes: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]" },
  COMPLETED:   { label: "Completed",   classes: "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]" },
  CANCELLED:   { label: "Cancelled",   classes: "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]" },
  NO_SHOW:     { label: "No Show",     classes: "bg-[#F2F4F7] text-[#344054] border border-[#D0D5DD]" },
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F0F2F4] dark:border-[#2D313A] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-[#FBF6FF] dark:bg-[#2D1B4E] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-[#870BD6]" />
      </div>
      <div>
        <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] mb-0.5">{label}</p>
        <div className="text-sm font-medium text-[#180426] dark:text-white">{value}</div>
      </div>
    </div>
  );
}

function Avatar({ user }: { user: SessionUser }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm overflow-hidden shrink-0">
      {user.avatarUrl
        ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
        : initials}
    </div>
  );
}

// ── Cancel Modal ───────────────────────────────────────────────────────────

function CancelModal({ title, cancelling, onClose, onConfirm }: {
  title: string; cancelling: boolean; onClose: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-sm bg-white dark:bg-[#181A1F] rounded-[20px] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-200 dark:border-[#2D313A] flex items-start justify-between">
          <div>
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <XCircle size={22} className="text-red-600" />
            </div>
            <h2 className="text-[20px] font-bold leading-none dark:text-white">Cancel Session</h2>
            <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] mt-1">This cannot be undone.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#252830] text-gray-400 dark:text-[#717784]"><X size={18} /></button>
        </div>
        <div className="p-6">
          <p className="text-sm text-[#292A2B] dark:text-[#E2E4E9] pb-4 border-b border-dashed border-[#B9C2CA] dark:border-[#2D313A]">
            <span className="font-semibold">&ldquo;{title}&rdquo;</span> will be cancelled. Both you and your mentee will be notified.
          </p>
          <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] mt-4 mb-5">Are you sure you want to continue?</p>
          <div className="flex gap-3">
            <Button buttonType="bordered" customClass="!w-1/2 !h-[44px] !border-[#60666B] dark:!border-[#2D313A] !text-[#60666B] dark:!text-[#9CA3AF]" onClick={onClose} disabled={cancelling}>
              Keep It
            </Button>
            <Button buttonType="custom" customClass="!w-1/2 !h-[44px] text-white !bg-[#E44E4E]" loading={cancelling} onClick={onConfirm}>
              Yes, Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await mentorshipService.getSessionById(id) as SessionDetail;
      setSession(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load session.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const joinLink = session?.roomCode
    ? `https://meet.joinbreed.com/${session.roomCode}`
    : (typeof window !== "undefined" ? `${window.location.origin}/join/${id}` : `https://joinbreed.com/join/${id}`);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await mentorshipService.cancelSession(id);
      setSession((s) => s ? { ...s, status: "CANCELLED" } : s);
      setShowCancel(false);
    } catch (err: any) {
      alert(err?.message ?? "Failed to cancel session.");
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout custom={true}>
        <div className="bg-white dark:bg-[#121316] pt-6 pb-8 px-4 lg:px-10 animate-pulse">
          <div className="h-7 bg-gray-200 dark:bg-[#252830] rounded w-1/3 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 lg:w-[75%]">
            <div className="space-y-5">
              <div className="h-56 bg-gray-200 dark:bg-[#252830] rounded-2xl" />
            </div>
            <div className="h-64 bg-gray-200 dark:bg-[#252830] rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !session) {
    return (
      <DashboardLayout custom={true}>
        <div className="bg-white dark:bg-[#121316] flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-gray-500 dark:text-[#9CA3AF]">{error ?? "Session not found."}</p>
          <button onClick={() => router.back()} className="text-[#870BD6] text-sm underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.SCHEDULED;
  const scheduledDate = new Date(session.scheduledAt);
  const endTime = new Date(scheduledDate.getTime() + session.duration * 60000);
  const now = Date.now();
  const sessionStart = scheduledDate.getTime() - 15 * 60 * 1000; // allow 15 min early
  const sessionEnd   = endTime.getTime();
  const withinWindow = now >= sessionStart && now <= sessionEnd;
  const canJoin = (session.status === "SCHEDULED" || session.status === "IN_PROGRESS") && withinWindow;
  const canCancel = session.status === "SCHEDULED" || session.status === "IN_PROGRESS";

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white dark:bg-[#121316]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 lg:px-10 pt-6 pb-5 border-b border-[#F0F2F4] dark:border-[#2D313A]">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-[#252830] rounded-full transition-colors">
            <ArrowLeft size={18} className="text-[#60666B] dark:text-[#9CA3AF]" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[22px] lg:text-[26px] leading-tight font-bold text-[#180426] dark:text-white">{session.title}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.classes}`}>{statusCfg.label}</span>
            </div>
            <p className="text-sm text-[#60666B] dark:text-[#9CA3AF] mt-0.5">
              <span className="hover:text-[#870BD6] cursor-pointer" onClick={() => router.back()}>Mentorship</span>
              <span className="mx-2">/</span>
              <span className="text-[#180426] dark:text-white font-medium">{session.title}</span>
            </p>
          </div>
        </div>

        <div className="pt-6 pb-10 px-4 lg:px-10">
          <div className="w-full lg:w-[75%]">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">

              {/* Left column */}
              <div className="space-y-5">
                <div className="bg-white dark:bg-[#181A1F] border border-[#E3E8EF] dark:border-[#2D313A] rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.classes}`}>{statusCfg.label}</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FBF6FF] dark:bg-[#2D1B4E] text-[#870BD6]">Mentorship Session</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#180426] dark:text-white mb-1">{session.title}</h2>
                  {session.description && (
                    <p className="text-[#4E5255] dark:text-[#9CA3AF] text-sm leading-relaxed mb-5 pb-5 border-b border-[#F0F2F4] dark:border-[#2D313A]">{session.description}</p>
                  )}

                  <InfoRow icon={Calendar} label="Date" value={scheduledDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
                  <InfoRow icon={Clock} label="Time" value={`${scheduledDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} — ${endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`} />
                  <InfoRow icon={Clock} label="Duration" value={`${session.duration} minutes`} />
                  <InfoRow icon={UserCircle} label="Mentor" value={
                    <div className="flex items-center gap-2">
                      <Avatar user={session.mentor} />
                      <div>
                        <p className="font-semibold text-[#180426] dark:text-white text-sm">{session.mentor.firstName} {session.mentor.lastName}</p>
                        {session.mentor.username && <p className="text-xs text-[#60666B] dark:text-[#9CA3AF]">@{session.mentor.username}</p>}
                      </div>
                    </div>
                  } />
                  <InfoRow icon={Users} label="Mentee" value={
                    <div className="flex items-center gap-2">
                      <Avatar user={session.disciple} />
                      <div>
                        <p className="font-semibold text-[#180426] dark:text-white text-sm">{session.disciple.firstName} {session.disciple.lastName}</p>
                        {session.disciple.username && <p className="text-xs text-[#60666B] dark:text-[#9CA3AF]">@{session.disciple.username}</p>}
                      </div>
                    </div>
                  } />
                  {session.notes && (
                    <div className="mt-4 pt-4 border-t border-[#F0F2F4] dark:border-[#2D313A]">
                      <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] mb-1 font-medium">Notes</p>
                      <p className="text-sm text-[#292A2B] dark:text-[#E2E4E9] leading-relaxed">{session.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-5">
                {/* Actions */}
                <div className="bg-white dark:bg-[#181A1F] border border-[#E3E8EF] dark:border-[#2D313A] rounded-2xl p-5 space-y-3">
                  <h3 className="font-semibold text-[#180426] dark:text-white text-sm mb-1">Actions</h3>

                  {(session.status === "SCHEDULED" || session.status === "IN_PROGRESS") && (
                    canJoin ? (
                      <Link
                        href={`/room/${id}`}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full py-3 text-sm font-bold hover:shadow-lg hover:scale-[1.01] transition-all"
                      >
                        <Video size={16} /> Join Session
                      </Link>
                    ) : (
                      <div className="w-full text-center py-3 rounded-full text-sm font-medium bg-[#F8F9FC] dark:bg-[#252830] text-[#60666B] dark:text-[#9CA3AF] border border-[#E3E8EF] dark:border-[#2D313A]">
                        {now < sessionStart
                          ? `Opens at ${scheduledDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                          : "Session has ended"}
                      </div>
                    )
                  )}

                  <button
                    onClick={handleCopy}
                    className={`w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold border transition-all ${
                      copied
                        ? "bg-[#ECFDF3] border-[#ABEFC6] text-[#067647]"
                        : "border-[#D2D9DF] dark:border-[#2D313A] text-[#4E5255] dark:text-[#9CA3AF] hover:border-[#870BD6] hover:text-[#870BD6]"
                    }`}
                  >
                    {copied ? <><Check size={15} /> Link Copied!</> : <><Copy size={15} /> Copy Join Link</>}
                  </button>

                  {canCancel && (
                    <Button
                      buttonType="custom"
                      customClass="!w-full !h-[42px] !bg-[#FEF3F2] !text-[#B42318] border border-[#FECDCA] hover:!bg-[#FECDCA]"
                      onClick={() => setShowCancel(true)}
                    >
                      <XCircle size={15} /> Cancel Session
                    </Button>
                  )}
                </div>

                {/* Join link card */}
                <div className="bg-[#FBF6FF] dark:bg-[#2D1B4E] border border-[#E7C8FF] dark:border-[#4B2A6E] rounded-2xl p-5">
                  <h3 className="font-semibold text-[#180426] dark:text-white text-sm mb-3">Session Link</h3>
                  <div className="bg-white dark:bg-[#181A1F] border border-[#E7C8FF] dark:border-[#2D313A] rounded-xl px-3 py-2.5 mb-3">
                    <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] font-mono break-all leading-relaxed">{joinLink}</p>
                  </div>
                  <button onClick={handleCopy} className="w-full text-xs font-semibold text-[#870BD6] hover:underline flex items-center justify-center gap-1">
                    {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy link</>}
                  </button>
                </div>

                {/* Session info */}
                <div className="bg-white dark:bg-[#181A1F] border border-[#E3E8EF] dark:border-[#2D313A] rounded-2xl p-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#60666B] dark:text-[#9CA3AF]">Platform</span>
                    <span className="font-medium text-[#180426] dark:text-white">Breed Live</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#60666B] dark:text-[#9CA3AF]">Duration</span>
                    <span className="font-medium text-[#180426] dark:text-white">{session.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#60666B] dark:text-[#9CA3AF]">Status</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.classes}`}>{statusCfg.label}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {showCancel && session && (
        <CancelModal title={session.title} cancelling={cancelling} onClose={() => setShowCancel(false)} onConfirm={handleCancel} />
      )}
    </DashboardLayout>
  );
}
