import { Calendar } from './Calendar';

interface DateSelectStepProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
}

export function DateSelectStep({
  selectedDate,
  onSelectDate,
}: DateSelectStepProps) {
  return (
    <div>
      <Calendar selectedDate={selectedDate} onSelectDate={onSelectDate} />
    </div>
  );
}
