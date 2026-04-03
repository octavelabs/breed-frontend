import { daysLabel, getWeekDays } from "@/utils/commonHelpers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const CalendarStrip = () => {
      const [weekOffset, setWeekOffset]       = useState(0);
  const [selectedDate, setSelectedDate]   = useState(new Date());
    const days = getWeekDays(weekOffset);
  return (
     <div className="px-8 pt-3 pb-3 border-b border-[#E3E8EF] flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-[#1A1C1E]">
              {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setWeekOffset((p) => p - 1)} className="p-1 rounded-full border border-[#D3D3D3]">
                <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
              </button>
              <button onClick={() => setWeekOffset((p) => p + 1)} className="p-1 rounded-full border border-[#D3D3D3]">
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '4px' }}>
            {days.map((day, i) => {
              const isSelected = day.toDateString() === selectedDate.toDateString();
              return (
                <button key={i} onClick={() => setSelectedDate(day)} className="flex flex-col items-center gap-0.5 py-1 hover:opacity-80 transition-opacity">
                  <span className="text-[9px] text-[#9CA3AF]">{daysLabel[i % 7]}</span>
                  <span className={`w-7 h-7 flex items-center justify-center text-xs font-semibold rounded-lg transition-colors ${
                    isSelected ? 'border-2 border-[#870BD6] text-[#870BD6]' : 'text-[#1A1C1E]'
                  }`}>
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
  )
}

export default CalendarStrip