"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { meetingsService } from "@/lib/api-services";
import {
  ArrowLeft, Calendar, Clock, Users, Globe, Lock, Copy,
  Check, Video, Pencil, XCircle, ExternalLink, UserCircle, Repeat,
} from "lucide-react";
import Button from "@/app/components/Button";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────

interface MeetingDetail {
  id: string;
  title: string;
  description?: string | null;
  type: "COMMUNITY" | "OPEN";
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  scheduledAt: string;
  duration: number;
  meetingLink?: string | null;
  platform?: string | null;
  isRecurring: boolean;
  recurrence?: { frequency: string; endsAt: string } | null;
  organizerId: string;
  organizer: { id: string; firstName: string; lastName: string; avatarUrl?: string | null; username?: string };
  community?: { id: string; name: string } | null;
  attendances: Array<{
    id: string;
    userId: string;
    attended: boolean;
    joinedAt?: string | null;
    leftAt?: string | null;
    user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null; username?: string };
  }>;
  _count: { attendances: number };
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SCHEDULED:   { label: "Scheduled",   classes: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]" },
  IN_PROGRESS: { label: "In Progress", classes: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]" },
  COMPLETED:   { label: "Completed",   classes: "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]" },
  CANCELLED:   { label: "Cancelled",   classes: "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]" },
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F0F2F4] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-[#FBF6FF] flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-[#870BD6]" />
      </div>
      <div>
        <p className="text-xs text-[#60666B] mb-0.5">{label}</p>
        <div className="text-sm font-medium text-[#180426]">{value}</div>
      </div>
    </div>
  );
}

function Avatar({ user, size = 9 }: { user: { firstName: string; lastName: string; avatarUrl?: string | null }; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm overflow-hidden shrink-0`;
  return (
    <div className={cls}>
      {user.avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
        : `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      }
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await meetingsService.getById(id) as MeetingDetail;
      setMeeting(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load meeting.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const joinLink = meeting
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${id}`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* fallback */ }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Cancel "${meeting?.title}"? This cannot be undone.`)) return;
    setCancelling(true);
    try {
      await meetingsService.cancel(id);
      setMeeting((prev) => prev ? { ...prev, status: "CANCELLED" } : prev);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to cancel meeting.");
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout custom={true}>
        <div className="bg-white">
          <div className="pt-6 pb-8 px-4 lg:px-10 animate-pulse">
            <div className="w-full lg:w-[60%] lg:mx-auto space-y-4">
            <div className="h-7 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
              <div className="space-y-4">
                <div className="h-48 bg-gray-200 rounded-2xl" />
                <div className="h-64 bg-gray-200 rounded-2xl" />
              </div>
              <div className="h-80 bg-gray-200 rounded-2xl" />
            </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !meeting) {
    return (
      <DashboardLayout custom={true}>
        <div className="bg-white flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-gray-500">{error ?? "Meeting not found."}</p>
          <button onClick={() => router.back()} className="text-[#870BD6] text-sm underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[meeting.status] ?? STATUS_CONFIG.SCHEDULED;
  const scheduledDate = new Date(meeting.scheduledAt);
  const endTime = new Date(scheduledDate.getTime() + (meeting.duration ?? 60) * 60000);
  const canJoin = meeting.status === "SCHEDULED" || meeting.status === "IN_PROGRESS";
  const canCancel = meeting.status === "SCHEDULED";

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 lg:px-10 pt-6 pb-5 border-b border-[#F0F2F4]">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={18} className="text-[#60666B]" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[22px] lg:text-[26px] leading-tight font-bold text-[#180426]">{meeting.title}</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.classes}`}>{statusCfg.label}</span>
              </div>
              <div className="text-sm text-[#60666B] mt-0.5">
                <Link href="/dashboard/preacher/meetings" className="hover:text-[#870BD6]">Meetings</Link>
                <span className="mx-2">/</span>
                <span className="text-[#180426] font-medium">{meeting.title}</span>
              </div>
            </div>
          </div>
          {canJoin && (
            <Link
              href={`/dashboard/preacher/meetings/${id}/room`}
              className="flex items-center gap-2 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full px-6 py-2.5 text-sm font-bold hover:shadow-lg hover:scale-[1.01] transition-all"
            >
              <Video size={15} /> Join Meeting
            </Link>
          )}
        </div>

        <div className="pt-6 pb-8 px-4 lg:px-10">
        <div className="w-full lg:w-[60%] lg:mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">

          {/* ── Left column (40%) ──────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Main card */}
            <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.classes}`}>
                      {statusCfg.label}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      meeting.type === "COMMUNITY" ? "bg-[#FBF6FF] text-[#870BD6]" : "bg-[#FBEAF3] text-[#C83785]"
                    }`}>
                      {meeting.type === "COMMUNITY" ? "Community" : "Open"}
                    </span>
                    {meeting.isRecurring && (
                      <span className="flex items-center gap-1 text-xs text-[#60666B] bg-[#F8F9FC] border border-[#E3E8EF] px-2.5 py-1 rounded-full">
                        <Repeat size={11} /> Recurring
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-[#180426]">{meeting.title}</h1>
                </div>
              </div>

              {meeting.description && (
                <p className="text-[#4E5255] text-sm leading-relaxed mb-5 pb-5 border-b border-[#F0F2F4]">
                  {meeting.description}
                </p>
              )}

              <InfoRow icon={Calendar} label="Date" value={
                scheduledDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
              } />
              <InfoRow icon={Clock} label="Time" value={
                `${scheduledDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} — ${endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
              } />
              <InfoRow icon={Clock} label="Duration" value={`${meeting.duration ?? 60} minutes`} />
              {meeting.community && (
                <InfoRow icon={Users} label="Community" value={
                  <Link href={`/dashboard/community/${meeting.community.id}`} className="text-[#870BD6] hover:underline flex items-center gap-1">
                    {meeting.community.name} <ExternalLink size={11} />
                  </Link>
                } />
              )}
              <InfoRow
                icon={meeting.type === "COMMUNITY" ? Lock : Globe}
                label="Visibility"
                value={meeting.type === "COMMUNITY" ? "Community members only" : "Open to anyone with the link"}
              />
              <InfoRow icon={UserCircle} label="Host" value={`${meeting.organizer.firstName} ${meeting.organizer.lastName}`} />
              {meeting.isRecurring && meeting.recurrence && (
                <InfoRow icon={Repeat} label="Recurrence" value={
                  `${meeting.recurrence.frequency} · until ${new Date(meeting.recurrence.endsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                } />
              )}
            </div>

            {/* Attendees */}
            <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6">
              <h2 className="font-semibold text-[#180426] mb-4">
                Attendees <span className="text-[#60666B] font-normal text-sm">({meeting._count.attendances})</span>
              </h2>
              {meeting.attendances.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                  <Users size={28} className="text-gray-200" />
                  <p className="text-sm text-[#60666B]">No attendees yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meeting.attendances.map((a) => (
                    <div key={a.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar user={a.user} size={9} />
                        <div>
                          <p className="text-sm font-semibold text-[#180426]">
                            {a.user.firstName} {a.user.lastName}
                          </p>
                          {a.user.username && <p className="text-xs text-[#60666B]">@{a.user.username}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.attended && (
                          <span className="text-xs bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6] px-2 py-0.5 rounded-full">
                            Attended
                          </span>
                        )}
                        {a.joinedAt && !a.leftAt && (
                          <span className="flex items-center gap-1 text-xs bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF] px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#175CD3] animate-pulse" /> Live
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column (1/3) ──────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Actions */}
            <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold text-[#180426] text-sm mb-1">Actions</h3>

              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold border transition-all ${
                  copied
                    ? "bg-[#ECFDF3] border-[#ABEFC6] text-[#067647]"
                    : "border-[#D2D9DF] text-[#4E5255] hover:border-[#870BD6] hover:text-[#870BD6]"
                }`}
              >
                {copied ? <><Check size={15} /> Link Copied!</> : <><Copy size={15} /> Copy Join Link</>}
              </button>

              {canCancel && (
                <Button
                  buttonType="custom"
                  customClass="!w-full !h-[42px] !bg-[#FEF3F2] !text-[#B42318] border border-[#FECDCA] hover:!bg-[#FECDCA]"
                  loading={cancelling}
                  onClick={handleCancel}
                >
                  <XCircle size={15} /> Cancel Meeting
                </Button>
              )}

              <Link
                href={`/dashboard/preacher/meetings/${id}/edit`}
                className="w-full flex items-center justify-center gap-2 border border-[#D2D9DF] text-[#4E5255] rounded-full py-3 text-sm font-semibold hover:border-[#870BD6] hover:text-[#870BD6] transition-all"
              >
                <Pencil size={14} /> Edit Meeting
              </Link>
            </div>

            {/* Join link card */}
            <div className="bg-[#FBF6FF] border border-[#E7C8FF] rounded-2xl p-5">
              <h3 className="font-semibold text-[#180426] text-sm mb-3">Meeting Link</h3>
              <div className="bg-white border border-[#E7C8FF] rounded-xl px-3 py-2.5 mb-3">
                <p className="text-xs text-[#60666B] font-mono break-all leading-relaxed">{joinLink}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className="w-full text-xs font-semibold text-[#870BD6] hover:underline flex items-center justify-center gap-1"
              >
                {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy link</>}
              </button>
            </div>

            {/* Meeting info summary */}
            <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#60666B]">Platform</span>
                <span className="font-medium text-[#180426]">{meeting.platform ?? "Breed Live"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#60666B]">Duration</span>
                <span className="font-medium text-[#180426]">{meeting.duration ?? 60} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#60666B]">Invited</span>
                <span className="font-medium text-[#180426]">{meeting._count.attendances}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
