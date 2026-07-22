"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePageTitle } from '@/app/hooks/usePageTitle';
import DashboardLayout from "@/app/layout/DashboardLayout";
import { meetingsService } from "@/lib/api-services";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Globe,
  Lock,
  Copy,
  Check,
  Video,
  Pencil,
  XCircle,
  ExternalLink,
  UserCircle,
  Repeat,
  X,
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
  roomCode?: string | null;
  platform?: string | null;
  isRecurring: boolean;
  recurrence?: { frequency: string; endsAt: string } | null;
  organizerId: string;
  organizer: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    username?: string;
  };
  community?: { id: string; name: string } | null;
  attendances: Array<{
    id: string;
    userId: string;
    attended: boolean;
    joinedAt?: string | null;
    leftAt?: string | null;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
      username?: string;
    };
  }>;
  _count: { attendances: number };
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  SCHEDULED: {
    label: "Scheduled",
    classes: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  },
  IN_PROGRESS: {
    label: "In Progress",
    classes: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]",
  },
  CANCELLED: {
    label: "Cancelled",
    classes: "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
  },
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
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

function Avatar({
  user,
  size = 9,
}: {
  user: { firstName: string; lastName: string; avatarUrl?: string | null };
  size?: number;
}) {
  const cls = `w-${size} h-${size} rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm overflow-hidden shrink-0`;
  return (
    <div className={cls}>
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      )}
    </div>
  );
}

// ── Cancel Modal ───────────────────────────────────────────────────────────

function CancelMeetingModal({
  title,
  cancelling,
  onClose,
  onConfirm,
}: {
  title: string;
  cancelling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-[20px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="relative w-[46px] h-[46px]">
                <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
                  <rect
                    x="3"
                    y="3"
                    width="40"
                    height="40"
                    rx="20"
                    fill="#FBAFAF"
                  />
                  <rect
                    x="3"
                    y="3"
                    width="40"
                    height="40"
                    rx="20"
                    stroke="#FED3D3"
                    strokeWidth="6"
                  />
                  <path
                    d="M23 17v7M23 28v1"
                    stroke="#DB2929"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2 className="text-[20px] font-bold leading-none mt-4">
                Cancel Meeting
              </h2>
              <p className="text-base text-[#60666B] leading-none mt-2">
                This action cannot be undone
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-base text-[#292A2B] pb-4 border-b border-dashed border-[#B9C2CA]">
            <span className="font-semibold">&ldquo;{title}&rdquo;</span> will be
            cancelled. All attendees will be notified.
          </p>
          <p className="text-sm text-[#60666B] mt-4 mb-6">
            Are you sure you want to continue? This cannot be reversed.
          </p>
          <div className="flex gap-3 w-full">
            <Button
              buttonType="bordered"
              customClass="!w-1/2 !h-[48px] !border-[#60666B] !text-[#60666B]"
              onClick={onClose}
              disabled={cancelling}
            >
              Keep Meeting
            </Button>
            <Button
              buttonType="custom"
              customClass="!w-1/2 !h-[48px] text-white !bg-[#E44E4E]"
              loading={cancelling}
              onClick={onConfirm}
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  usePageTitle(meeting?.title);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await meetingsService.getById(id)) as MeetingDetail;
      setMeeting(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load meeting.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const joinLink = meeting
    ? (meeting.roomCode ? `https://meet.joinbreed.com/${meeting.roomCode}` : `${typeof window !== "undefined" ? window.location.origin : ""}/join/${id}`)
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback */
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await meetingsService.cancel(id);
      setMeeting((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
      setShowCancelModal(false);
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
            <div className="w-full lg:w-[60%] space-y-4">
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
          <button
            onClick={() => router.back()}
            className="text-[#870BD6] text-sm underline"
          >
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const statusCfg = STATUS_CONFIG[meeting.status] ?? STATUS_CONFIG.SCHEDULED;
  const scheduledDate = new Date(meeting.scheduledAt);
  const endTime = new Date(
    scheduledDate.getTime() + (meeting.duration ?? 60) * 60000,
  );

  // Compute actual duration from attendance records (earliest join → latest leave)
  const joinTimes = meeting.attendances.map((a) => a.joinedAt ? new Date(a.joinedAt).getTime() : null).filter(Boolean) as number[];
  const leaveTimes = meeting.attendances.map((a) => a.leftAt ? new Date(a.leftAt).getTime() : null).filter(Boolean) as number[];
  const actualDurationMins =
    joinTimes.length > 0 && leaveTimes.length > 0
      ? Math.round((Math.max(...leaveTimes) - Math.min(...joinTimes)) / 60000)
      : null;
  // Allow joining 15 minutes before the scheduled start, up to the scheduled end time
  const now = Date.now();
  const meetingStart = scheduledDate.getTime() - 15 * 60 * 1000;
  const meetingEnd   = endTime.getTime();
  const withinWindow = now >= meetingStart && now <= meetingEnd;
  const canJoin =
    (meeting.status === "SCHEDULED" || meeting.status === "IN_PROGRESS") && withinWindow;
  const canCancel = meeting.status === "SCHEDULED";

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 lg:px-10 pt-6 pb-5 border-b border-[#F0F2F4]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={18} className="text-[#60666B]" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[22px] lg:text-[26px] leading-tight font-bold text-[#180426]">
                  {meeting.title}
                </h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.classes}`}
                >
                  {statusCfg.label}
                </span>
              </div>
              <div className="text-sm text-[#60666B] mt-0.5">
                <Link
                  href="/dashboard/preacher/meetings"
                  className="hover:text-[#870BD6]"
                >
                  Meetings
                </Link>
                <span className="mx-2">/</span>
                <span className="text-[#180426] font-medium">
                  {meeting.title}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 pb-8 px-4 lg:px-10">
          <div className="w-full lg:w-[75%]">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
              {/* ── Left column (40%) ──────────────────────────────────────── */}
              <div className="space-y-5">
                {/* Main card */}
                <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.classes}`}
                        >
                          {statusCfg.label}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            meeting.type === "COMMUNITY"
                              ? "bg-[#FBF6FF] text-[#870BD6]"
                              : "bg-[#FBEAF3] text-[#C83785]"
                          }`}
                        >
                          {meeting.type === "COMMUNITY" ? "Community" : "Open"}
                        </span>
                        {meeting.isRecurring && (
                          <span className="flex items-center gap-1 text-xs text-[#60666B] bg-[#F8F9FC] border border-[#E3E8EF] px-2.5 py-1 rounded-full">
                            <Repeat size={11} /> Recurring
                          </span>
                        )}
                      </div>
                      <h1 className="text-2xl font-bold text-[#180426]">
                        {meeting.title}
                      </h1>
                    </div>
                  </div>

                  {meeting.description && (
                    <p className="text-[#4E5255] text-sm leading-relaxed mb-5 pb-5 border-b border-[#F0F2F4]">
                      {meeting.description}
                    </p>
                  )}

                  <InfoRow
                    icon={Calendar}
                    label="Date"
                    value={scheduledDate.toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Time"
                    value={`${scheduledDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} — ${endTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Duration"
                    value={
                      actualDurationMins != null
                        ? `${actualDurationMins} min (actual) · ${meeting.duration ?? 60} min scheduled`
                        : `${meeting.duration ?? 60} minutes`
                    }
                  />
                  {meeting.community && (
                    <InfoRow
                      icon={Users}
                      label="Community"
                      value={
                        <Link
                          href={`/dashboard/community/${meeting.community.id}`}
                          className="text-[#870BD6] hover:underline flex items-center gap-1"
                        >
                          {meeting.community.name} <ExternalLink size={11} />
                        </Link>
                      }
                    />
                  )}
                  <InfoRow
                    icon={meeting.type === "COMMUNITY" ? Lock : Globe}
                    label="Visibility"
                    value={
                      meeting.type === "COMMUNITY"
                        ? "Community members only"
                        : "Open to anyone with the link"
                    }
                  />
                  <InfoRow
                    icon={UserCircle}
                    label="Host"
                    value={`${meeting.organizer.firstName} ${meeting.organizer.lastName}`}
                  />
                  {meeting.isRecurring && meeting.recurrence && (
                    <InfoRow
                      icon={Repeat}
                      label="Recurrence"
                      value={`${meeting.recurrence.frequency} · until ${new Date(meeting.recurrence.endsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                    />
                  )}
                </div>

                {/* Attendees */}
                <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6">
                  <h2 className="font-semibold text-[#180426] mb-4">
                    Attendees{" "}
                    <span className="text-[#60666B] font-normal text-sm">
                      ({meeting._count.attendances})
                    </span>
                  </h2>
                  {meeting.attendances.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                      <Users size={28} className="text-gray-200" />
                      <p className="text-sm text-[#60666B]">
                        No attendees yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meeting.attendances.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar user={a.user} size={9} />
                            <div>
                              <p className="text-sm font-semibold text-[#180426]">
                                {a.user.firstName} {a.user.lastName}
                              </p>
                              {a.user.username && (
                                <p className="text-xs text-[#60666B]">
                                  @{a.user.username}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5">
                              {a.attended && (
                                <span className="text-xs bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6] px-2 py-0.5 rounded-full">
                                  Attended
                                </span>
                              )}
                              {a.joinedAt && !a.leftAt && (
                                <span className="flex items-center gap-1 text-xs bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF] px-2 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#175CD3] animate-pulse" />{" "}
                                  Live
                                </span>
                              )}
                            </div>
                            {a.joinedAt && (
                              <p className="text-[10px] text-[#60666B]">
                                Joined {new Date(a.joinedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                {a.leftAt && ` · Left ${new Date(a.leftAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
                              </p>
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
                  <h3 className="font-semibold text-[#180426] text-sm mb-4">
                    Actions
                  </h3>

                  {(meeting.status === "SCHEDULED" || meeting.status === "IN_PROGRESS") && (
                    canJoin ? (
                      <Link
                        href={`/dashboard/preacher/meetings/${id}/room`}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full py-3 text-sm font-bold hover:shadow-lg hover:scale-[1.01] transition-all"
                      >
                        <Video size={16} /> Join Meeting
                      </Link>
                    ) : (
                      <div className="w-full text-center py-3 rounded-full text-sm font-medium bg-[#F8F9FC] text-[#60666B] border border-[#E3E8EF]">
                        {now < meetingStart
                          ? `Opens at ${scheduledDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`
                          : "Meeting has ended"}
                      </div>
                    )
                  )}

                  <button
                    onClick={handleCopyLink}
                    className={`w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold border transition-all ${
                      copied
                        ? "bg-[#ECFDF3] border-[#ABEFC6] text-[#067647]"
                        : "border-[#D2D9DF] text-[#4E5255] hover:border-[#870BD6] hover:text-[#870BD6]"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={15} /> Link Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={15} /> Copy Join Link
                      </>
                    )}
                  </button>

                  {canCancel && (
                    <Button
                      buttonType="custom"
                      customClass="!w-full !h-[42px] !bg-[#FEF3F2] !text-[#B42318] border border-[#FECDCA] hover:!bg-[#FECDCA]"
                      onClick={() => setShowCancelModal(true)}
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
                  <h3 className="font-semibold text-[#180426] text-sm mb-3">
                    Meeting Link
                  </h3>
                  <div className="bg-white border border-[#E7C8FF] rounded-xl px-3 py-2.5 mb-3">
                    <p className="text-xs text-[#60666B] font-mono break-all leading-relaxed">
                      {joinLink}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="w-full text-xs font-semibold text-[#870BD6] hover:underline flex items-center justify-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check size={11} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={11} /> Copy link
                      </>
                    )}
                  </button>
                </div>

                {/* Meeting info summary */}
                <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#60666B]">Platform</span>
                    <span className="font-medium text-[#180426]">
                      {meeting.platform ?? "Breed Live"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#60666B]">Duration</span>
                    <span className="font-medium text-[#180426]">
                      {meeting.duration ?? 60} min
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#60666B]">Invited</span>
                    <span className="font-medium text-[#180426]">
                      {meeting._count.attendances}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCancelModal && meeting && (
        <CancelMeetingModal
          title={meeting.title}
          cancelling={cancelling}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancel}
        />
      )}
    </DashboardLayout>
  );
}
