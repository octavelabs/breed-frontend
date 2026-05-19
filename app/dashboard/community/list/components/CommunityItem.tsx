import { useState } from "react";

type CommunityItemProps = {
  community: {
    id: string;
    name: string;
    coverImage?: string | null;
    [key: string]: unknown;
  };
  isSelected: boolean;
  onClick: () => void;
};

const CommunityItem: React.FC<CommunityItemProps> = ({ community, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getBackgroundClass = () => {
    if (isSelected) return 'bg-[#E7C8FF80]';
    if (isHovered) return 'bg-gray-50';
    return 'bg-transparent';
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center gap-5 px-4 lg:px-[44px] py-3 cursor-pointer transition-colors ${getBackgroundClass()}`}
    >
      {community.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={community.coverImage as string}
          alt={community.name}
          className="w-[50px] h-[50px] rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-[50px] h-[50px] rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-lg flex-shrink-0">
          {community.name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-base font-medium leading-tight">
        {community.name}
      </span>
    </div>
  );
};

export default CommunityItem