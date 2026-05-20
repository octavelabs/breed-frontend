'use client';

import { Users, ChevronRight, Eye, Clock, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface MeetingRecording {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  status: string;
  _count?: { attendances: number };
  community?: { name: string } | null;
}

interface RecordingCardProps {
  data: MeetingRecording;
}

const RecordingCard: React.FC<RecordingCardProps> = ({ data }) => {
  const router = useRouter();

  const date = new Date(data.scheduledAt);
  const dateLabel = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const attendees = data._count?.attendances ?? 0;

  return (
    <div
      onClick={() => router.push(`/dashboard/preacher/meetings/${data.id}`)}
      className="border border-[#E2E3E5] shadow-[0px_1px_2px_0px_#1018280D] cursor-pointer rounded-[16px] hover:shadow-md transition-shadow"
    >
      {/* Thumbnail placeholder */}
      <div className="bg-gray-100 rounded-t-[16px] w-full p-[14px]">
        <div className="w-full aspect-video overflow-hidden bg-gradient-to-br from-[#180426] to-[#5B26B1] rounded-[12px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
              <Eye size={20} className="text-white/60" />
            </div>
            <p className="text-white/40 text-xs">Meeting recording</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 bg-white rounded-b-[16px] p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold line-clamp-1">{data.title}</p>
          <button className="flex items-center gap-0.5 text-sm text-[#330750] font-medium whitespace-nowrap hover:underline flex-shrink-0">
            View <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {data.community?.name && (
          <p className="text-xs text-[#870BD6] truncate">{data.community.name}</p>
        )}

        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          <span className="flex items-center gap-1 text-xs text-[#60666B]">
            <Calendar size={11} /> {dateLabel}
          </span>
          <span className="text-[#D2D9DF]">·</span>
          <span className="flex items-center gap-1 text-xs text-[#60666B]">
            <Clock size={11} /> {timeLabel}
          </span>
          <span className="text-[#D2D9DF]">·</span>
          <span className="text-xs text-[#60666B]">{data.duration ?? 60} min</span>
        </div>

        <div className="flex items-center gap-4 text-gray-600 mt-1">
          <div className="flex items-center gap-1.5">
            <Users size={14} strokeWidth={1.5} className="text-[#60666B]" />
            <span className="text-xs text-[#60666B]">{attendees} attendee{attendees !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingCard;
