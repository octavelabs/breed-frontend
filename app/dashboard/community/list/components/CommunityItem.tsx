import { useState } from "react";

type CommunityItemProps = {
  community: {
    id: number;
    name: string;
    avatar: string;
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
      <img 
        src={community.avatar}
        alt={community.name}
        className="w-[50px] h-[50px] rounded-full object-cover flex-shrink-0"
      />
      <span className="text-base font-medium leading-tight">
        {community.name}
      </span>
    </div>
  );
};

export default CommunityItem