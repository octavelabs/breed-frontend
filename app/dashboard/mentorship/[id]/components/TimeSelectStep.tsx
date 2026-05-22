'use client';

import { ChevronRight } from 'lucide-react';

interface Availability {
  schedule: { days: number[]; startHour: number; endHour: number; slotDuration?: number; blockedDates?: string[] } | null;
  bookedSlots: { start: string; duration: number }[];
}

interface TimeSelectStepProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  onChangeDate: () => void;
  availability?: Availability | null;
}

const defaultSlots = [
  '8:00am','9:00am','10:00am','11:00am',
  '12:00pm','1:00pm','2:00pm','3:00pm','4:00pm','5:00pm',
];

function formatHour(hour: number, minutes: number): string {
  const ampm = hour >= 12 ? 'pm' : 'am';
  const h = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  return `${h}:${minutes.toString().padStart(2, '0')}${ampm}`;
}

function generateSlots(
  schedule: Availability['schedule'],
  bookedSlots: Availability['bookedSlots'],
  selectedDate: Date | null,
): { time: string; booked: boolean }[] {
  if (!schedule) {
    return defaultSlots.map((t) => ({ time: t, booked: false }));
  }

  const { startHour, endHour, slotDuration = 60 } = schedule;
  const slots: { time: string; booked: boolean }[] = [];

  for (let totalMinutes = startHour * 60; totalMinutes < endHour * 60; totalMinutes += slotDuration) {
    const hour = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const time = formatHour(hour, minutes);

    let booked = false;
    if (selectedDate && bookedSlots.length) {
      const slotStart = new Date(
        selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hour, minutes,
      ).getTime();
      booked = bookedSlots.some((bs) => {
        const bsStart = new Date(bs.start).getTime();
        const bsEnd = bsStart + bs.duration * 60 * 1000;
        return slotStart >= bsStart && slotStart < bsEnd;
      });
    }

    slots.push({ time, booked });
  }

  return slots;
}

export function TimeSelectStep({
  selectedDate,
  selectedTime,
  onSelectTime,
  onChangeDate,
  availability,
}: TimeSelectStepProps) {
  const formatDate = (date: Date) => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const day = date.getDate();
    const suffix =
      day === 1 || day === 21 || day === 31 ? 'st' :
      day === 2 || day === 22 ? 'nd' :
      day === 3 || day === 23 ? 'rd' : 'th';
    return `${days[date.getDay()]}, ${day}${suffix} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const slots = generateSlots(availability?.schedule ?? null, availability?.bookedSlots ?? [], selectedDate);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-600">Date: </span>
            <span className="font-semibold">
              {selectedDate ? formatDate(selectedDate) : 'No date selected'}
            </span>
          </div>
          <button onClick={onChangeDate} className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
            Change
          </button>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-[17px]">Available time slots</h4>
          <ChevronRight size={20} />
        </div>
        {slots.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No available slots for this day.</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {slots.map(({ time, booked }) => (
              <button
                key={time}
                onClick={() => !booked && onSelectTime(time)}
                disabled={booked}
                title={booked ? 'Already booked' : undefined}
                className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  booked
                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                    : selectedTime === time
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
