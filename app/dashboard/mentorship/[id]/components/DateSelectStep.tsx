import { Calendar } from './Calendar';

interface Availability {
  schedule: { days: number[]; startHour: number; endHour: number; slotDuration?: number; blockedDates?: string[] } | null;
  bookedSlots: { start: string; duration: number }[];
}

interface DateSelectStepProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availability?: Availability | null;
}

export function DateSelectStep({ selectedDate, onSelectDate, availability }: DateSelectStepProps) {
  return <Calendar selectedDate={selectedDate} onSelectDate={onSelectDate} availability={availability} />;
}
