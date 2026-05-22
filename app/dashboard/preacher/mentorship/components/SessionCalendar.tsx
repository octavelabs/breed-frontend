"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CalendarDays, Clock4, X, ExternalLink, Plus, Link } from "lucide-react";
import { mentorshipService } from "@/lib/api-services";
import Button from "@/app/components/Button";

// ── Types ──────────────────────────────────────────────────────────────────

interface SessionUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  username?: string;
}

interface Session {
  id: string;
  title: string;
  description?: string | null;
  scheduledAt: string;
  duration: number;
  status: string;
  meetingLink?: string | null;
  mentor: SessionUser;
  disciple: SessionUser;
}

const STATUS_CLASSES: Record<string, { bg: string; text: string }> = {
  SCHEDULED:   { bg: "bg-[#FFFAEB]", text: "text-[#B54708]" },
  IN_PROGRESS: { bg: "bg-[#EFF8FF]", text: "text-[#175CD3]" },
  COMPLETED:   { bg: "bg-[#ECFDF3]", text: "text-[#067647]" },
  CANCELLED:   { bg: "bg-[#FEF3F2]", text: "text-[#B42318]" },
  NO_SHOW:     { bg: "bg-[#F2F4F7]", text: "text-[#344054]" },
};

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ── Session Detail Modal ───────────────────────────────────────────────────

function SessionDetailModal({
  session,
  onClose,
  onCancelled,
}: {
  session: Session;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduledAt = new Date(session.scheduledAt);
  const statusStyle = STATUS_CLASSES[session.status] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  const canCancel = session.status === "SCHEDULED" || session.status === "IN_PROGRESS";

  const handleCancel = async () => {
    setCancelling(true);
    setError(null);
    try {
      await mentorshipService.cancelSession(session.id);
      onCancelled();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to cancel session.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-[20px] shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#870BD6] px-6 py-5 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-size-[20px_20px]" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-white/70 text-xs font-medium mb-0.5">Mentorship Session</p>
              <h2 className="text-white font-bold text-lg leading-tight">{session.title}</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white/80 mt-0.5">
              <X size={18} />
            </button>
          </div>
          <span className={`mt-2 inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
            {session.status.toLowerCase().replace("_", " ")}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#F5EBFF] flex items-center justify-center shrink-0">
                <CalendarDays size={15} className="text-[#870BD6]" />
              </div>
              <div>
                <p className="text-xs text-[#60666B]">Date & Time</p>
                <p className="font-semibold text-[#180426]">
                  {scheduledAt.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="text-xs text-[#60666B]">
                  {scheduledAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#F5EBFF] flex items-center justify-center shrink-0">
                <Clock4 size={15} className="text-[#870BD6]" />
              </div>
              <div>
                <p className="text-xs text-[#60666B]">Duration</p>
                <p className="font-semibold text-[#180426]">{session.duration} minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-[#F5EBFF] flex items-center justify-center shrink-0">
                <Users size={15} className="text-[#870BD6]" />
              </div>
              <div>
                <p className="text-xs text-[#60666B]">Mentee</p>
                <p className="font-semibold text-[#180426]">{session.disciple.firstName} {session.disciple.lastName}</p>
                {session.disciple.username && <p className="text-xs text-[#60666B]">@{session.disciple.username}</p>}
              </div>
            </div>

            {session.description && (
              <div className="bg-[#F8FAFC] rounded-xl p-3">
                <p className="text-xs text-[#60666B] mb-1 font-medium">Description</p>
                <p className="text-sm text-[#292A2B]">{session.description}</p>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            {session.meetingLink && (
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-[44px] flex items-center justify-center gap-2 bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
              >
                <Video size={15} />
                Join Session
              </a>
            )}

            {canCancel && !confirmCancel && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="w-full h-[44px] flex items-center justify-center border border-red-200 text-red-600 text-sm font-medium rounded-full hover:bg-red-50 transition-colors"
              >
                Cancel Session
              </button>
            )}

            {confirmCancel && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-700 font-medium mb-2">Cancel this session?</p>
                <p className="text-xs text-red-600 mb-3">Both you and {session.disciple.firstName} will be notified by email.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmCancel(false)} disabled={cancelling} className="flex-1 h-9 text-xs border border-gray-300 rounded-full text-[#60666B] hover:bg-gray-50">
                    Keep it
                  </button>
                  <Button
                    buttonType="custom"
                    customClass="flex-1 !h-9 !text-xs !bg-red-600 text-white rounded-full"
                    loading={cancelling}
                    onClick={handleCancel}
                  >
                    Yes, cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Full Calendar Modal ────────────────────────────────────────────────────

function CalendarModal({ sessions, onClose, onSelectSession }: {
  sessions: Session[];
  onClose: () => void;
  onSelectSession: (s: Session) => void;
}) {
  const [month, setMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selected, setSelected] = useState<Date | null>(null);

  const year = month.getFullYear();
  const mon = month.getMonth();
  const firstDay = new Date(year, mon, 1).getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, mon, i + 1)),
  ];

  const hasSession = (d: Date) => sessions.some((s) => isSameDay(new Date(s.scheduledAt), d));
  const daySessions = selected ? sessions.filter((s) => isSameDay(new Date(s.scheduledAt), selected)) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E8EF]">
          <h2 className="font-semibold text-[#180426] text-base">Full Calendar</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={18} className="text-gray-400" /></button>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMonth(new Date(year, mon - 1, 1))} className="p-1.5 border border-gray-200 rounded-full hover:bg-gray-50">
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-[#180426]">
              {month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button onClick={() => setMonth(new Date(year, mon + 1, 1))} className="p-1.5 border border-gray-200 rounded-full hover:bg-gray-50">
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAY_LABELS.map((d) => <div key={d} className="text-center text-xs font-medium text-[#60666B] py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />;
              const isToday = isSameDay(date, new Date());
              const isSelected = selected ? isSameDay(date, selected) : false;
              const hasDot = hasSession(date);
              return (
                <button key={i} onClick={() => setSelected(isSelected ? null : date)}
                  className={`relative w-full aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all ${
                    isSelected ? "bg-[#870BD6] text-white" :
                    isToday ? "bg-[#FBF6FF] border border-[#870BD6] text-[#870BD6]" :
                    "text-[#60666B] hover:bg-gray-50"
                  }`}
                >
                  {date.getDate()}
                  {hasDot && <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#870BD6]"}`} />}
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="mt-5 border-t border-[#E3E8EF] pt-4">
              <p className="text-xs font-semibold text-[#60666B] uppercase tracking-wider mb-3">
                {selected.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              {daySessions.length === 0 ? (
                <p className="text-sm text-[#60666B] text-center py-4">No sessions this day.</p>
              ) : (
                <div className="space-y-2">
                  {daySessions.map((s) => {
                    const st = STATUS_CLASSES[s.status] ?? { bg: "bg-gray-100", text: "text-gray-600" };
                    return (
                      <button key={s.id} onClick={() => { onSelectSession(s); onClose(); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#E3E8EF] hover:border-[#870BD6] hover:bg-[#FBF6FF] transition-all text-left group">
                        <div className="w-2 h-2 rounded-full bg-[#870BD6] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#180426] truncate">{s.title}</p>
                          <p className="text-xs text-[#60666B]">
                            {new Date(s.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            {" · "}{s.disciple.firstName} {s.disciple.lastName}
                          </p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                          {s.status.toLowerCase().replace("_", " ")}
                        </span>
                        <ExternalLink size={12} className="text-gray-300 group-hover:text-[#870BD6] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Session Card ──────────────────────────────────────────────────────────

function SessionCard({ session: s, onClick }: { session: Session; onClick: () => void }) {
  const st = STATUS_CLASSES[s.status] ?? { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 p-3 bg-[#F8FAFC] border border-[#E3E8EF] rounded-xl hover:border-[#870BD6] hover:bg-[#FBF6FF] transition-all group text-left w-full"
    >
      <div className="w-10 h-10 rounded-[10px] bg-[#FBF6FF] border border-[#E3E8EF] flex items-center justify-center shrink-0">
        <CalendarDays size={16} className="text-[#870BD6]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1D1B20] truncate">{s.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="flex items-center gap-1 text-[10px] text-[#60666B]">
            <Clock4 className="w-3 h-3" />
            {new Date(s.scheduledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            {" · "}
            {new Date(s.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
          <span className="text-[10px] text-[#60666B] truncate">· {s.disciple.firstName} {s.disciple.lastName}</span>
        </div>
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${st.bg} ${st.text}`}>
        {s.status.toLowerCase().replace("_", " ")}
      </span>
    </button>
  );
}

// ── Schedule Session Modal ─────────────────────────────────────────────────

interface Mentee { mentorshipId: string; firstName: string; lastName: string; }

function ScheduleSessionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loadingMentees, setLoadingMentees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mentorshipId, setMentorshipId] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState("");

  useEffect(() => {
    mentorshipService.getDisciples({ status: "ACTIVE", limit: 50 })
      .then((res: any) => {
        const data = res?.data ?? res;
        const list: Mentee[] = (Array.isArray(data) ? data : []).map((m: any) => ({
          mentorshipId: m.id,
          firstName: m.disciple?.firstName ?? "",
          lastName: m.disciple?.lastName ?? "",
        }));
        setMentees(list);
        if (list.length === 1) setMentorshipId(list[0].mentorshipId);
      })
      .catch(() => {})
      .finally(() => setLoadingMentees(false));
  }, []);

  // Set default date to tomorrow
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setDate(d.toISOString().slice(0, 10));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorshipId || !title || !date || !time) {
      setError("Please fill in all required fields.");
      return;
    }
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    setSubmitting(true);
    setError(null);
    try {
      await mentorshipService.createSession({
        mentorshipId,
        title,
        scheduledAt,
        duration,
        meetingLink: meetingLink || undefined,
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to schedule session.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-[20px] shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#870BD6] px-6 py-5 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Schedule Session</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 text-white/80"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#60666B] mb-1">Mentee <span className="text-red-500">*</span></label>
            {loadingMentees ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ) : mentees.length === 0 ? (
              <p className="text-sm text-[#60666B] bg-[#F8FAFC] rounded-lg p-3">No active mentees yet.</p>
            ) : (
              <select
                value={mentorshipId} onChange={(e) => setMentorshipId(e.target.value)} required
                className="w-full h-10 border border-[#D2D9DF] rounded-lg px-3 text-sm text-[#180426] focus:outline-none focus:border-[#870BD6]"
              >
                <option value="">Select a mentee…</option>
                {mentees.map((m) => (
                  <option key={m.mentorshipId} value={m.mentorshipId}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#60666B] mb-1">Session Title <span className="text-red-500">*</span></label>
            <input
              value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Weekly check-in"
              className="w-full h-10 border border-[#D2D9DF] rounded-lg px-3 text-sm text-[#180426] focus:outline-none focus:border-[#870BD6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#60666B] mb-1">Date <span className="text-red-500">*</span></label>
              <input
                type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                min={new Date().toISOString().slice(0, 10)}
                className="w-full h-10 border border-[#D2D9DF] rounded-lg px-3 text-sm text-[#180426] focus:outline-none focus:border-[#870BD6]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#60666B] mb-1">Time <span className="text-red-500">*</span></label>
              <input
                type="time" value={time} onChange={(e) => setTime(e.target.value)} required
                className="w-full h-10 border border-[#D2D9DF] rounded-lg px-3 text-sm text-[#180426] focus:outline-none focus:border-[#870BD6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#60666B] mb-1">Duration</label>
            <select
              value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-10 border border-[#D2D9DF] rounded-lg px-3 text-sm text-[#180426] focus:outline-none focus:border-[#870BD6]"
            >
              {[15, 30, 45, 60, 90, 120].map((d) => (
                <option key={d} value={d}>{d} minutes</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#60666B] mb-1">Meeting Link <span className="text-[#A0A8B0]">(optional)</span></label>
            <div className="relative">
              <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A8B0]" />
              <input
                type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..."
                className="w-full h-10 border border-[#D2D9DF] rounded-lg pl-8 pr-3 text-sm text-[#180426] focus:outline-none focus:border-[#870BD6]"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 border border-[#D2D9DF] rounded-full text-sm text-[#60666B] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <Button buttonType="custom" customClass="flex-1 !h-10 !text-sm bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full"
              loading={submitting} onClick={() => {}}>
              Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── SessionCalendar ────────────────────────────────────────────────────────

export const SessionCalendar = ({ refreshSignal = 0 }: { refreshSignal?: number }) => {
  const today = new Date();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay());
    return d;
  });
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const monthLabel = selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(false);
    mentorshipService.getMySessions({ limit: 100 })
      .then((res: any) => {
        // Unwrap paginated response: { data: [...], meta: {...} } OR plain array
        const inner = res?.data ?? res;
        const sessions: Session[] = Array.isArray(inner) ? inner : [];
        setAllSessions(sessions);
        if (sessions.length > 0) {
          // Navigate to the session closest to now (past or future)
          const now = Date.now();
          const nearest = [...sessions].sort(
            (a, b) => Math.abs(new Date(a.scheduledAt).getTime() - now) - Math.abs(new Date(b.scheduledAt).getTime() - now),
          )[0];
          const d = new Date(nearest.scheduledAt);
          setSelectedDate(d);
          const ws = new Date(d);
          ws.setDate(d.getDate() - d.getDay());
          setWeekStart(ws);
        }
      })
      .catch(() => { setAllSessions([]); setLoadError(true); })
      .finally(() => setLoading(false));
  }, [refreshSignal]);

  useEffect(() => { load(); }, [load]);

  const daySessions = allSessions.filter((s) => isSameDay(new Date(s.scheduledAt), selectedDate));
  const hasSessionOnDay = (d: Date) => allSessions.some((s) => isSameDay(new Date(s.scheduledAt), d));

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };

  const selectedLabel = isSameDay(selectedDate, today) ? "Today"
    : isSameDay(selectedDate, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)) ? "Tomorrow"
    : selectedDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  // Show all non-cancelled sessions sorted soonest first (includes past sessions)
  const upcomingSessions = allSessions
    .filter((s) => s.status !== 'CANCELLED' && s.status !== 'NO_SHOW')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const goToSession = (s: Session) => router.push(`/dashboard/mentorship/sessions/${s.id}`);

  return (
    <>
      {showCalendar && (
        <CalendarModal sessions={allSessions} onClose={() => setShowCalendar(false)} onSelectSession={goToSession} />
      )}
      {showSchedule && (
        <ScheduleSessionModal onClose={() => setShowSchedule(false)} onCreated={load} />
      )}

      <div className="bg-white border border-[#D2D9DF] rounded-[16px] w-full px-5 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Session Schedule</h2>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowCalendar(true)} className="flex items-center gap-1.5 text-xs text-[#870BD6] font-medium hover:underline">
                <CalendarDays size={13} /> Full Calendar
              </button>
              <button
                onClick={() => setShowSchedule(true)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-[#870BD6] text-white rounded-full hover:bg-[#6f09b3] transition-colors"
              >
                <Plus size={12} /> Schedule
              </button>
            </div>
          </div>

          {/* Week mini-calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{monthLabel}</h3>
              <div className="flex items-center gap-1">
                <button onClick={prevWeek} className="p-1 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronLeft className="w-3 h-3 text-gray-800" /></button>
                <button onClick={nextWeek} className="p-1 border border-gray-300 rounded-full hover:bg-gray-50"><ChevronRight className="w-3 h-3 text-gray-800" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {DAY_LABELS.map((d) => <div key={d} className="text-xs font-medium text-gray-400">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekDates.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);
                const hasDot = hasSessionOnDay(date);
                return (
                  <button key={date.toISOString()} onClick={() => setSelectedDate(date)}
                    className={`relative w-[35px] h-[35px] rounded-lg flex flex-col items-center justify-center text-sm font-medium mx-auto transition-all ${
                      isSelected ? "bg-[#870BD6] text-white" :
                      isToday ? "bg-[#FBF6FF] border border-[#870BD6] text-[#870BD6]" :
                      "text-[#60666B] hover:bg-gray-50"
                    }`}
                  >
                    {date.getDate()}
                    {hasDot && <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#870BD6]"}`} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <hr className="flex-1 border-[#D2D9DF]" />
            <span className="text-sm text-[#1D1B20] font-medium">{selectedLabel}</span>
            <hr className="flex-1 border-[#D2D9DF]" />
          </div>

          {loading ? (
            <div className="space-y-2">{[1, 2].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : loadError ? (
            <div className="flex flex-col items-center py-6 gap-2">
              <p className="text-sm text-red-500 font-medium">Failed to load sessions</p>
              <button onClick={load} className="text-xs text-[#870BD6] underline">Retry</button>
            </div>
          ) : daySessions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {daySessions.map((s) => <SessionCard key={s.id} session={s} onClick={() => goToSession(s)} />)}
            </div>
          ) : allSessions.length === 0 ? (
            <div className="flex flex-col items-center py-6 gap-1">
              <CalendarDays className="w-10 h-10 text-gray-200" strokeWidth={1.5} />
              <p className="mt-2 text-sm font-medium text-[#180426]">No sessions yet</p>
              <p className="text-xs text-[#60666B]">Sessions you schedule with mentees will appear here.</p>
            </div>
          ) : (
            <div>
              <div className="flex flex-col items-center py-3">
                <p className="text-sm text-[#60666B]">No sessions on this day</p>
              </div>
              <div className="border-t border-[#E3E8EF] pt-4">
                <p className="text-xs font-semibold text-[#60666B] uppercase tracking-wider mb-3">All Sessions</p>
                <div className="flex flex-col gap-2">
                  {upcomingSessions.slice(0, 5).map((s) => <SessionCard key={s.id} session={s} onClick={() => goToSession(s)} />)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
