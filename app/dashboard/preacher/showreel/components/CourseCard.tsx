'use client';

import { Users, MessageCircle, UserRound, MessageSquareText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CourseDetails } from '../type';

interface CourseCardProps {
  data: CourseDetails;
 
}

const CourseCard: React.FC<CourseCardProps> = ({
  data
}) => {
    
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/preacher/showreel/${data?.id}`);
  };

  return (
    <div className='border border-[#E2E3E5] shadow-[0px_1px_2px_0px_#1018280D] cursor-pointer rounded-[16px]'>
    <div
      onClick={handleClick}
      className="bg-gray-100  rounded-t-[16px] w-full p-[14px]"
    >
      {/* Image Section */}
      <div className="relative bg-[#180426] rounded-[12px] h-[188px] overflow-hidden">
        {data?.imageUrl ? (
          <img
            src={data?.imageUrl}
            alt={data?.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full" />
        )}
          <span className={`absolute top-4 left-4  text-sm font-semibold px-4 py-1.5 rounded-full capitalize ${getStatusColor(data?.status)}`}>
            {data?.status}
          </span>
      </div>
       </div>

      {/* Content Section */}
      <div className="bg-white rounded-b-[16px] px-4 py-[18px]">
        <h3 className="text-sm font-semibold  mb-2 leading-tight line-clamp-2">
          {data?.title}
        </h3>

        <div className="flex items-center gap-2 mb-3 text-gray-600 text-sm flex-wrap">
          <span>{data?.date}</span>
          <span>•</span>
          <span>{data?.chapters} chapters</span>
          <span>•</span>
          <span>{data?.lessons} lessons</span>
        </div>

        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-[5.57px]">
            <UserRound size={20} strokeWidth={1.5} />
            <span className="text-[15px] font-medium">{data?.participants}</span>
          </div>
          <div className="flex items-center gap-[5.57px]">
            <MessageSquareText size={20} strokeWidth={1.5} />
            <span className="text-[15px] font-medium">{data?.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'live':
      return 'bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]';
    case 'suspended':
      return 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]';
    case 'draft':
      return 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]';
      case 'archived':
      return 'bg-[#F8F9FC] text-[#363F72] border border-[#D5D9EB]';
    default:
      return 'bg-transparent text-[#363F72]';
  }
};

export default CourseCard;
