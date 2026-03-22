import { Dispatch, SetStateAction, useState } from "react";
import { CommunityMeetingFormData, Guest, OpenMeetingFormData } from "../types";
import Dropdown from "@/app/components/Dropdown";
import { Check, Copy, Search } from "lucide-react";
import Button from "@/app/components/Button";

export const MOCK_GUESTS: Guest[] = [
  { id: '1', name: 'Kristin Watson', subtitle: 'Follows you', avatar: '/bisola.jpg', invited: true },
  { id: '2', name: 'Guy Hawkins', subtitle: 'Follows you', avatar: '/bisola.jpg', invited: false },
  { id: '3', name: 'Theresa Webb', subtitle: 'Follows you', avatar: '/bisola.jpg', invited: false },
  { id: '4', name: 'Floyd Miles', subtitle: 'Follows you', avatar: '/bisola.jpg', invited: false },
];

export const OpenStepThree = ({
  formData,
  setFormData,
   handleComplete,

}: {
  formData: OpenMeetingFormData;
  setFormData: Dispatch<SetStateAction<OpenMeetingFormData>>;
   handleComplete: () => void
}) => {
  const [searchQuery, setSearchQuery] = useState('');
      const [linkCopied, setLinkCopied] = useState(false);
  const [guests, setGuests] = useState<Guest[]>(MOCK_GUESTS);

  const handleSendInvite = (guestId: string) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, invited: true } : g))
    );
  
  };

      const handleCopyLink = () => {
    navigator.clipboard.writeText('https://breed/m3J342').catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

   const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className=" space-y-3">
      {/* Shareable link row */}
      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-2 bg-[#fffff] border border-gray-300 rounded-lg text-sm text-gray-600 truncate">
          https://breed/m3J342
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-4 py-2 bg-[#E2E3E5] border border-[#B9C2CA] rounded-lg text-xs font-medium text-[#60666B] hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          {linkCopied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-gray-500" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
<div className='border-t-2 border-dashed border-gray-200 space-y-4'></div>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#fffff] border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Friends list */}
      <div className="space-y-6 max-h-52 overflow-y-auto">
        {guests.map((guest) => (
          <div key={guest.id} className="flex items-center justify-between">
            {/* Avatar + name */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                <img
                  src={'/bisola.jpg'}
                  alt={guest.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{guest.name}</p>
                <p className="text-xs text-gray-500">{guest.subtitle}</p>
              </div>
            </div>

            {/* Invite button */}
            {guest.invited ? (
              // <div className="flex items-center gap-1 px-4 py-1.5 bg-white border border-[#5B26B1] rounded-full text-xs font-medium text-[#5B26B1]">
                <Button
                buttonType='bordered'
                customClass='!px-4 !py-1 text-[#5B26B1]'>
                <Check className="w-4 h-4 text-[#A967F1]" strokeWidth={2} />
                Sent
                </Button>
              // </div>
            ) : (
              <Button
                buttonType="custom"
                onClick={() => handleSendInvite(guest.id)}
                customClass='!bg-[#C83785] !text-white !py-1 px-4 !font-medium'
              >
                Send Invite
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Create Meeting button */}
      <Button
        onClick={handleComplete}
        buttonType="primary"
        customClass='!w-full !text-white'
      >
        Create Meeting
      </Button>
    </div>
  );
};
