'use client';

import { Users, MessageCircle, UserRound, MessageSquareText, ChevronRight, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RecordingCardDetails } from '../types';
import PublishIcon from '@/app/assets/icons/publishIcon';


interface RecordingCardProps {
  data: RecordingCardDetails;
 
}

const RecordingCard: React.FC<RecordingCardProps> = ({
  data
}) => {
    
  const router = useRouter();

  const handleClick = () => {
    router.push(`/courses/${data?.id}`);
  };

  return (
    <div className='border border-[#E2E3E5] shadow-[0px_1px_2px_0px_#1018280D] cursor-pointer rounded-[16px]'>
  <div className="bg-gray-100  rounded-t-[16px] w-full p-[14px]">
    <div className="w-full aspect-video overflow-hidden bg-[#180426] rounded-[12px]">
      <img src={data?.thumbnail} alt={data.title} className="w-full h-full object-cover" />
    </div>
   
  </div>
   <div className="flex flex-col gap-1.5 bg-white rounded-b-[16px] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold line-clamp-1">{data.title}</p>
        <button className="flex items-center gap-0.5 text-sm text-[#330750] font-medium whitespace-nowrap hover:underline flex-shrink-0">
          View <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <p className="text-xs text-[#60666B]">{data.date}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-[#60666B]">
          {data.time}
        </span>
        <span className="text-[#D2D9DF]">·</span>
        <span className="text-xs text-[#60666B]">{data.duration}</span>
        <span className="text-[#D2D9DF]">·</span>
        <AvatarStack count={data.attendees} />
      </div>
      {data?.status === 'draft' ? (
        <button className="flex items-center gap-1 text-base font-medium text-[#870BD6] mt-0.5 w-fit hover:underline">
          Publish <PublishIcon />
        </button>
      ) : 
      <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-[5.57px]">
            <Eye size={20} strokeWidth={1.5} />
            <span className="text-[15px] font-medium">{data?.attendees}</span>
          </div>
          <div className="flex items-center gap-[5.57px]">
            <MessageSquareText size={20} strokeWidth={1.5} />
            <span className="text-[15px] font-medium">{data?.comments}</span>
          </div>
        </div>}
    </div>
  </div>
  );
};

const AvatarStack = ({ count }: { count: number }) => (
  <div className="flex items-center gap-1">
    <div className="flex -space-x-1.5">
      {['#6941C6', '#3538CD', '#007AFF'].map((color, i) => (
        <div key={i} className="w-5 h-5 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: color, zIndex: 3 - i }}>
          {String.fromCharCode(65 + i)}
        </div>
      ))}
    </div>
    {count > 3 && <span className="text-xs text-[#60666B]">+{count - 3} others</span>}
  </div>
);

export default RecordingCard;
