'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Availability {
  schedule: { days: number[]; startHour: number; endHour: number; slotDuration?: number; blockedDates?: string[] } | null;
  bookedSlots: { start: string; duration: number }[];
}

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availability?: Availability | null;
}

export function Calendar({ selectedDate, onSelectDate, availability }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const daysOfWeek = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const previousMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const handleDateClick = (day: number) => {
    onSelectDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
  };

  const isSelected = (day: number) =>
    !!selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === currentMonth.getMonth() &&
    selectedDate.getFullYear() === currentMonth.getFullYear();

  const isPastDay = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < today;
  };

  const isUnavailable = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const schedule = availability?.schedule;
    if (!schedule) return false;

    // Check day-of-week availability
    if (schedule.days && !schedule.days.includes(date.getDay())) return true;

    // Check blocked dates (YYYY-MM-DD)
    if (schedule.blockedDates?.length) {
      const iso = date.toISOString().slice(0, 10);
      if (schedule.blockedDates.includes(iso)) return true;
    }

    return false;
  };

  const isFullyBooked = (day: number): boolean => {
    if (!availability?.bookedSlots?.length || !availability?.schedule) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const schedule = availability.schedule;
    const slotDuration = schedule.slotDuration ?? 60;
    const totalSlots = Math.floor((schedule.endHour - schedule.startHour) * 60 / slotDuration);

    const dayBookings = availability.bookedSlots.filter((bs) => {
      const bsDate = new Date(bs.start);
      return bsDate.getFullYear() === date.getFullYear() &&
             bsDate.getMonth() === date.getMonth() &&
             bsDate.getDate() === date.getDate();
    });

    return dayBookings.length >= totalSlots;
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(<div key={`empty-${i}`} />);
  for (let day = 1; day <= daysInMonth; day++) {
    const isPast = isPastDay(day);
    const unavail = isUnavailable(day);
    const fullyBooked = isFullyBooked(day);
    const disabled = isPast || unavail || fullyBooked;
    days.push(
      <button
        key={day}
        onClick={() => !disabled && handleDateClick(day)}
        disabled={disabled}
        title={unavail ? 'Not available' : fullyBooked ? 'Fully booked' : undefined}
        className={`w-[45px] h-[45px] flex items-center justify-center rounded-lg text-sm font-medium transition-colors relative ${
          disabled
            ? 'text-gray-300 cursor-not-allowed'
            : isSelected(day)
            ? 'bg-black text-white hover:bg-gray-800'
            : 'text-gray-900 hover:bg-gray-100'
        }`}
      >
        {day}
        {fullyBooked && !isPast && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-400" />}
      </button>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[17px] font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button onClick={previousMonth}>
            <ChevronLeft className="w-[15px] h-[24px] font-medium" stroke="#870BD6" />
          </button>
          <button onClick={nextMonth}>
            <ChevronRight className="w-[15px] h-[24px] font-medium" stroke="#870BD6" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((d) => (
          <div key={d} className="text-xs font-medium text-[#3C3C434D] text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">{days}</div>
      {availability?.schedule && (
        <p className="text-[10px] text-[#60666B] mt-3 text-center">
          Available {availability.schedule.days.map((d) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}
          {' · '}{formatHour(availability.schedule.startHour)}–{formatHour(availability.schedule.endHour)}
        </p>
      )}
    </div>
  );
}

function formatHour(h: number) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
  return `${hour}${ampm}`;
}
