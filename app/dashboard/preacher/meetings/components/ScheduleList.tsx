"use client";

import { useEffect, useState } from "react";
import MeetingIcon from "@/app/assets/icons/meetingIcon";
import Button from "@/app/components/Button";
import { daysLabel, getWeekDates, getWeekRange } from "@/utils/commonHelpers";
import { ChevronLeft, ChevronRight, Clock4, ListFilter, MicOff, MoreVertical } from "lucide-react";
import { meetingsService } from "@/lib/api-services";

interface UpcomingMeeting {
  id: string;
  title: string;
  scheduledAt: string;
  type: 'COMMUNITY' | 'OPEN';
  community?: { name: string } | null;
}

export const ScheduleList = () => {
  const { startOfWeek, endOfWeek } = getWeekRange(new Date());
  const weekDates = getWeekDates(startOfWeek, endOfWeek)?.map((date) => new Date(date).getDate());
  const today = new Date().getDate();
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const [upcoming, setUpcoming] = useState<UpcomingMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meetingsService.getUpcoming()
      .then((res: unknown) => {
        setUpcoming(Array.isArray(res) ? (res as UpcomingMeeting[]) : []);
      })
      .catch(() => setUpcoming([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white border border-[#D2D9DF] rounded-[16px] w-full px-5 py-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>

        {/* Mini calendar */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">{monthLabel}</h3>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-xl text-xs text-gray-600 hover:bg-gray-50">
                Filter <ListFilter className="w-2.5 h-2.5" />
              </button>
              <button className="p-1 border border-gray-300 rounded-full hover:bg-gray-50">
                <ChevronLeft className="w-3 h-3 text-gray-800" />
              </button>
              <button className="p-1 border border-gray-300 rounded-full hover:bg-gray-50">
                <ChevronRight className="w-3 h-3 text-gray-800" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {daysLabel.map((d) => <div key={d} className="text-xs font-medium text-gray-900">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {weekDates.map((day) => (
              <div
                key={day}
                className={`w-[35px] h-[35px] rounded-lg flex items-center justify-center text-sm font-medium mx-auto cursor-pointer ${
                  day === today ? 'bg-[#FBF6FF] border border-[#870BD6] text-[#870BD6]' : 'text-[#60666B] hover:bg-gray-50'
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <hr className="flex-1 border-[#D2D9DF]" />
          <span className="text-sm text-[#1D1B20] font-medium">Today</span>
          <hr className="flex-1 border-[#D2D9DF]" />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : upcoming.length > 0 ? (
          <div className="flex flex-col gap-3">
            {upcoming.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] border border-[#E3E8EF] rounded-[12px] hover:border-[#D2D9DF] transition-colors group">
                <div className="w-[40px] h-[40px] rounded-[10px] border border-[#E3E8EF] bg-white flex items-center justify-center flex-shrink-0">
                  <MeetingIcon color="#60666B" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1D1B20] truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[10px] text-[#60666B]">
                      <Clock4 className="w-3 h-3" />
                      {new Date(item.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                    {item.community?.name && (
                      <span className="text-[10px] text-[#870BD6] truncate">{item.community.name}</span>
                    )}
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center pt-4">
            <MicOff className="w-16 h-16 text-gray-300" strokeWidth={2} />
            <p className="mt-3 text-sm text-center text-[#60666B]">You have no meetings scheduled for today.</p>
            <Button customClass="!w-fit px-6 !text-white mt-3" buttonType="primary">
              <Clock4 className="w-4 h-4" /> Schedule
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
