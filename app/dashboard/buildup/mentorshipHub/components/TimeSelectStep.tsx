import { ChevronRight } from 'lucide-react';

interface TimeSelectStepProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  onChangeDate: () => void;
  availableTimeSlots?: string[];
}

const defaultTimeSlots = [
  '6:00am',
  '6:15am',
  '6:30am',
  '6:45am',
  '7:00am',
  '7:15am',
  '7:30am',
  '7:45am',
  '8:00am',
];

export function TimeSelectStep({
  selectedDate,
  selectedTime,
  onSelectTime,
  onChangeDate,
  availableTimeSlots = defaultTimeSlots,
}: TimeSelectStepProps) {
  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
        ? 'rd'
        : 'th';
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day}${suffix} ${month} ${year}`;
  };

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
          <button
            onClick={onChangeDate}
            className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
          >
            Change
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-[17px]">Available time slots</h4>
          <ChevronRight size={20} className="" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {availableTimeSlots.map((time) => (
            <button
              key={time}
              onClick={() => onSelectTime(time)}
              className={`
                px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
                ${
                  selectedTime === time
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
