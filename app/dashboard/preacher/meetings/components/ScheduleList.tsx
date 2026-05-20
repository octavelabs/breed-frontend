"use client";

import { useEffect, useState, useCallback } from "react";
import MeetingIcon from "@/app/assets/icons/meetingIcon";
import Button from "@/app/components/Button";
import { ChevronLeft, ChevronRight, Clock4, X, CalendarDays, ExternalLink } from "lucide-react";
import { meetingsService } from "@/lib/api-services";
import Link from "next/link";

interface UpcomingMeeting {
  id: string;
  title: string;
  scheduledAt: string;
  type: "COMMUNITY" | "OPEN";
  status: string;
  community?: { name: string } | null;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// ── Full Calendar Modal ────────────────────────────────────────────────────

function CalendarModal({
  meetings,
  onClose,
}: {
  meetings: UpcomingMeeting[];
  onClose: () => void;
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

  const hasMeeting = (d: Date) => meetings.some((m) => isSameDay(new Date(m.scheduledAt), d));

  const dayMeetings = selected
    ? meetings.filter((m) => isSameDay(new Date(m.scheduledAt), selected))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E8EF]">
          <h2 className="font-semibold text-[#180426] text-base">Full Calendar</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Month nav */}
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

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-[#60666B] py-1">{d}</div>
            ))}
          </div>

          {/* Date grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />;
              const isToday = isSameDay(date, new Date());
              const isSelected = selected ? isSameDay(date, selected) : false;
              const hasDot = hasMeeting(date);
              return (
                <button
                  key={i}
                  onClick={() => setSelected(isSelected ? null : date)}
                  className={`relative w-full aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all ${
                    isSelected ? "bg-[#870BD6] text-white" :
                    isToday ? "bg-[#FBF6FF] border border-[#870BD6] text-[#870BD6]" :
                    "text-[#60666B] hover:bg-gray-50"
                  }`}
                >
                  {date.getDate()}
                  {hasDot && (
                    <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#870BD6]"}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected day meetings */}
          {selected && (
            <div className="mt-5 border-t border-[#E3E8EF] pt-4">
              <p className="text-xs font-semibold text-[#60666B] uppercase tracking-wider mb-3">
                {selected.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              {dayMeetings.length === 0 ? (
                <p className="text-sm text-[#60666B] text-center py-4">No meetings this day.</p>
              ) : (
                <div className="space-y-2">
                  {dayMeetings.map((m) => (
                    <Link key={m.id} href={`/dashboard/preacher/meetings/${m.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[#E3E8EF] hover:border-[#870BD6] hover:bg-[#FBF6FF] transition-all group">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${m.type === "COMMUNITY" ? "bg-[#870BD6]" : "bg-[#C83785]"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#180426] truncate">{m.title}</p>
                        <p className="text-xs text-[#60666B]">
                          {new Date(m.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                          {m.community?.name && ` · ${m.community.name}`}
                        </p>
                      </div>
                      <ExternalLink size={14} className="text-gray-300 group-hover:text-[#870BD6] shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── ScheduleList Component ────────────────────────────────────────────────

export const ScheduleList = ({ onSchedule, refreshKey = 0 }: { onSchedule?: () => void; refreshKey?: number }) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay()); // Sunday
    return d;
  });
  const [allMeetings, setAllMeetings] = useState<UpcomingMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const monthLabel = selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const loadMeetings = useCallback(() => {
    setLoading(true);
    const from = new Date();
    from.setDate(from.getDate() - 7);
    const to = new Date();
    to.setDate(to.getDate() + 60);

    meetingsService.getAll({ limit: 100, from: from.toISOString(), to: to.toISOString() })
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        setAllMeetings(Array.isArray(data) ? data : []);
      })
      .catch(() => setAllMeetings([]))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  useEffect(() => { loadMeetings(); }, [loadMeetings]);

  const dayMeetings = allMeetings.filter((m) => isSameDay(new Date(m.scheduledAt), selectedDate));

  const hasMeetingOnDay = (d: Date) => allMeetings.some((m) => isSameDay(new Date(m.scheduledAt), d));

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const selectedLabel = isSameDay(selectedDate, today) ? "Today"
    : isSameDay(selectedDate, new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)) ? "Tomorrow"
    : selectedDate.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  return (
    <>
      {showCalendar && <CalendarModal meetings={allMeetings} onClose={() => setShowCalendar(false)} />}

      <div className="bg-white border border-[#D2D9DF] rounded-[16px] w-full px-5 py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
            <button
              onClick={() => setShowCalendar(true)}
              className="flex items-center gap-1.5 text-xs text-[#870BD6] font-medium hover:underline"
            >
              <CalendarDays size={13} /> Full Calendar
            </button>
          </div>

          {/* Week mini-calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{monthLabel}</h3>
              <div className="flex items-center gap-1">
                <button onClick={prevWeek} className="p-1 border border-gray-300 rounded-full hover:bg-gray-50">
                  <ChevronLeft className="w-3 h-3 text-gray-800" />
                </button>
                <button onClick={nextWeek} className="p-1 border border-gray-300 rounded-full hover:bg-gray-50">
                  <ChevronRight className="w-3 h-3 text-gray-800" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {DAY_LABELS.map((d) => <div key={d} className="text-xs font-medium text-gray-400">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {weekDates.map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, today);
                const hasDot = hasMeetingOnDay(date);
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`relative w-[35px] h-[35px] rounded-lg flex flex-col items-center justify-center text-sm font-medium mx-auto transition-all ${
                      isSelected ? "bg-[#870BD6] text-white" :
                      isToday ? "bg-[#FBF6FF] border border-[#870BD6] text-[#870BD6]" :
                      "text-[#60666B] hover:bg-gray-50"
                    }`}
                  >
                    {date.getDate()}
                    {hasDot && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#870BD6]"}`} />
                    )}
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
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : dayMeetings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {dayMeetings.map((item) => (
                <Link
                  key={item.id}
                  href={`/dashboard/preacher/meetings/${item.id}`}
                  className="flex items-center gap-3 p-3 bg-[#F8FAFC] border border-[#E3E8EF] rounded-[12px] hover:border-[#870BD6] hover:bg-[#FBF6FF] transition-all group"
                >
                  <div className={`w-[40px] h-[40px] rounded-[10px] border border-[#E3E8EF] bg-white flex items-center justify-center flex-shrink-0 ${
                    item.type === "COMMUNITY" ? "bg-[#FBF6FF]" : "bg-[#FBEAF3]"
                  }`}>
                    <MeetingIcon color={item.type === "COMMUNITY" ? "#870BD6" : "#C83785"} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1D1B20] truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[10px] text-[#60666B]">
                        <Clock4 className="w-3 h-3" />
                        {new Date(item.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                      {item.community?.name && (
                        <span className="text-[10px] text-[#870BD6] truncate">{item.community.name}</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.status === "SCHEDULED" ? "bg-[#FFFAEB] text-[#B54708]" :
                    item.status === "IN_PROGRESS" ? "bg-[#EFF8FF] text-[#175CD3]" :
                    "bg-[#ECFDF3] text-[#067647]"
                  }`}>
                    {item.status.toLowerCase().replace("_", " ")}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center pt-4">
              <CalendarDays className="w-12 h-12 text-gray-200" strokeWidth={1.5} />
              <p className="mt-3 text-sm font-medium text-[#180426]">No meetings scheduled</p>
              <p className="text-xs text-[#60666B] mt-1 text-center">
                Nothing on{" "}
                {selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}.
              </p>
              {onSchedule && (
                <Button customClass="!w-fit px-5 !text-white mt-3 !h-[36px] !text-xs" buttonType="primary" onClick={onSchedule}>
                  <Clock4 className="w-3.5 h-3.5" /> Schedule
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
