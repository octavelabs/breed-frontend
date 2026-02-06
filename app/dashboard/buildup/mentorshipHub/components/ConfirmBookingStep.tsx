import Dropdown from '@/app/components/Dropdown';
import { Calendar, Clock, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ConfirmBookingStepProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  onChangeDate: () => void;
  topics?: string[];
  selectedTopic: string;
  setSelectedTopic: (item: string) => void
}

const defaultTopics = [
  'Spiritual growth',
  'Career guidance',
  'Leadership development',
  'Personal development',
  'Ministry direction',
];

 export const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const dayName = days[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();

    return `${dayName}, ${month} ${day}`;
  };

export function ConfirmBookingStep({
  selectedDate,
  selectedTime,
  onChangeDate,
  topics = defaultTopics,
  selectedTopic,
  setSelectedTopic
}: ConfirmBookingStepProps) {
  
  const [additionalQuestion, setAdditionalQuestion] = useState('');

 

  return (
    <div>
      <div className="space-y-4 mb-4">
        <div className="flex items-center gap-3 text-sm">
          <Calendar size={16} stroke='#60666B' />
          <span className="font-semibold">
            {selectedDate ? formatDate(selectedDate) : 'No date selected'}
          </span>
          <button
            onClick={onChangeDate}
            className="ml-auto text-purple-600 font-medium hover:text-purple-700 transition-colors"
          >
            Change
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Clock size={16} stroke='#60666B' />
          <span className="font-semibold">{selectedTime || 'No time selected'}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm  mb-2">
            Select main topic
          </label>
          <Dropdown
            value={selectedTopic}
            options={topics}
            keySelector="name"
            onChange={(item) => setSelectedTopic(item)}
            className="!h-[48px] focus:ring-2 focus:ring-blue-500 outline-none bg-white z-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Question
          </label>
          <textarea
            value={additionalQuestion}
            onChange={(e) => setAdditionalQuestion(e.target.value)}
            placeholder="e.g. Spiritual growth"
            rows={4}
            className="w-full px-4 py-3 border border-[#60666B] rounded-lg text-base resize-none"
          />
        </div>
      </div>
    </div>
  );
}
