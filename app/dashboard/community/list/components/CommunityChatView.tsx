import { ArrowLeft, BellOff, ChartAreaIcon, LogOut, MoreVerticalIcon, Search, Settings, Trash } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { EventCard } from "./EventCard";
import { MessageBubble } from "./MessageBubble";
import Button from "@/app/components/Button";
import CustomPopover from "@/app/components/Popover";

type CommunityChatViewProps = {
  community: {
    id: number;
    name: string;
    description: string;
    avatar: string;
    members: number;
    events: Array<{
      id: number;
      title: string;
      date: string;
      time: string;
      location: string;
      attendees: number;
      image: string;
    }>;
  };
  setSelectedCommunity: (community: any) => void
};  

 type PopoverState = {
  visible: boolean;
  rowData: null | any;
}

export const CommunityChatView: React.FC<CommunityChatViewProps> = ({ community, setSelectedCommunity }) => {
  const [messageText, setMessageText] = useState('');

  const messages = [
    {
      id: 1,
      author: 'Tolu',
      text: "Yo, last night's prayer call was 🔥🔥🔥\nCan we talk about that moment when we prayed over anxiety? I felt such peace.",
      time: '7:31am',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      isOwn: false
    },
    {
      id: 2,
      author: 'Amaka',
      text: "Yesss! That part hit deep for me too.\nIt's like BTH is that safe space to breathe, share, and just be real without judgment.",
      time: '7:31am',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      isOwn: false
    },
    {
      id: 3,
      author: 'Amber',
      text: "That's what we're here for real people, real faith, real growth.\n\nWe've got another virtual hangout this Sunday. You guys in?",
      time: '7:31am',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
      isOwn: true
    },
    {
      id: 4,
      author: 'Tolu',
      text: "Absolutely! What's the topic this time? 👀",
      time: '7:31am',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      isOwn: false
    },
    {
      id: 5,
      author: 'Amber',
      text: '"Peace in the Pressure."\nHosted by Uche. Sunday at 6PM.\n\nCome as you are, and don\'t come alone 🌸',
      time: '7:31am',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
      isOwn: true
    },
    {
      id: 6,
      author: 'Amaka',
      text: "Bet! I'm inviting two friends already.\nLet's keep building this tribe that lifts each other up.",
      time: '7:31am',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      isOwn: false
    }
  ];

    const parentRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
    const [popover, setPopover] = useState<PopoverState>({
    visible: false,
    rowData: null,
  });

    const handleClose = useCallback(() => {
    setPopover((prevState) => ({
      ...prevState,
      visible: false,
      rowData: null,
    }));
  }, [setPopover]);

    const popoverContent = useMemo(() => {
    // if (!popover.rowData) return [];

    return [
      {
        item: "Settings",
        icon: <Settings className="w-[14px] h-[14px]" />,
        onClick: () => {
        
        },
      },
      {
        item: "Leave",
        icon: <LogOut className="w-[14px] h-[14px] rotate-180" />,
        onClick: () => {
         
        },
      },
         {
        item: "Mute",
        icon: <BellOff className="w-[14px] h-[14px]" />,
        onClick: () => {
        
        },
      },
         {
        item: "Delete",
        icon: <Trash className="w-[14px] h-[14px]" stroke='red' />,
        onClick: () => {
          
        },
      },
    ];
  }, [popover.rowData]);

  return (
    <div className=" h-[calc(100vh-150px)] relative" ref={parentRef}>
      <div className='h-[56px] px-5 py-3 border-b border-[#D2D9DF] flex items-center justify-between relative'>
        <div className="flex gap-2 items-center"><ArrowLeft className="block lg:hidden" onClick={() => setSelectedCommunity(null)} /><p>{community.name}</p></div>
        <div className="flex gap-2 items-center"><Search />
        <Button
                      customClass="!bg-transparent"
                      buttonType="custom"
                      onClick={() => {
                        setPopover((prev) => ({
                          ...prev,
                          visible: !prev.visible,
                        }));
                      }}
                      ref={anchorRef}
                    ><MoreVerticalIcon /></Button></div>
      </div>
      
      <div className="h-full max-h-[78%] overflow-auto px-8 pt-[70px]  hide-scrollbar w-full overflow-auto">
        <EventCard />
        <DateDivider date="Saturday 5th July, 2025" />
        {messages.map((message) => (
          <MessageBubble
            key={message.id} 
            message={message}
            isOwnMessage={message.isOwn}
          />
        ))}
      </div>

      {/* Input */}
       <div className="px-8 py-4 pb-6 bg-white border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#fafafa] rounded-3xl border border-gray-200">
          <ChartAreaIcon />
          <input
            type="text"
            placeholder="Write a Message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 border-none bg-transparent outline-none text-sm font-normal text-black placeholder:text-gray-400"
          />
        </div>
      </div>
      {popover.visible && (
              <CustomPopover
                parentRef={parentRef}
                buttonRef={anchorRef}
                content={popoverContent}
                handleClose={handleClose}
                hasIcon={true}
                leftOffset={80}
              />
            )}
    </div>
  );
};

const DateDivider = ({ date }: { date: string }) => (
  <div className="text-center my-6 relative">
    <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium text-gray-600">
      {date}
    </span>
  </div>
);