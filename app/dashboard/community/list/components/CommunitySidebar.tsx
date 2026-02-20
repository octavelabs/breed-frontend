import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import CommunityItem from "./CommunityItem";


type CommunitySidebarProps = {
  communities: Array<{
    id: number;
    name: string;
    avatar: string;
  }>;
  selectedCommunity: {
    id: number;
    name: string;
    avatar: string;
  } | null;
  onSelectCommunity: (community: any) => void;
};

export const CommunitySidebar: React.FC<CommunitySidebarProps> = ({ communities, selectedCommunity, onSelectCommunity }) => {
  const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(false)
  
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.matchMedia("(max-width: 767px)").matches)
      }
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
    }, [])

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={` ${isMobile && !selectedCommunity ? "block" : "hidden"}w-full lg:w-[40%] overflow-hidden h-[calc(100vh-150px)] border-r border-gray-200 flex flex-col `}>
      {/* Header */}
      <div className="px-4 lg:px-[44px] pt-6 pb-4">
        <p className="text-sm font-medium text-[#60666B] mb-3 leading-none">
          Community
        </p>

        {/* Search */}
        {/* <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm font-normal text-black bg-white border border-gray-200 rounded-lg outline-none focus:border-purple-400 transition-colors"
          />
        </div> */}
      </div>

      {/* Communities List */}
      <div className="flex-1 overflow-y-auto pb-5">
        {filteredCommunities.map(community => (
          <CommunityItem
            key={community.id}
            community={community}
            isSelected={selectedCommunity?.id === community.id}
            onClick={() => onSelectCommunity(community)}
          />
        ))}
      </div>
    </div>
  );
};