import { CircleUserRound} from "lucide-react";


type BubbleMessageProps = {
    message: {
        id: number;
        author: string;
        text: string;
        time: string;
        avatar: string;
    };
    isOwnMessage: boolean;
}

export const MessageBubble: React.FC<BubbleMessageProps> = ({ message, isOwnMessage }) => (
  <div className={`flex gap-3 mb-8 w-[60%] ${!isOwnMessage ? "mr-auto" : "ml-auto"}`}>
    {!isOwnMessage && (
      <img 
        src={message.avatar}
        alt={message.author}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end"
      />
    )}
    <div className={`flex-1  ${!isOwnMessage ? "bg-[#F6F8FA]" : "bg-[#EAE1F2]"} rounded-[15px] py-2 px-[13px]`}>
      <div className="text-[10px] font-semibold mb-2">
        {message.author}
      </div>
      <div className="text-xs leading-relaxed mb-2 whitespace-pre-wrap">
        {message.text}
      </div>
      <div className="text-xs font-normal text-end">
        {message.time}
      </div>
    </div>
    {isOwnMessage && (
      <button className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center self-end justify-center cursor-pointer flex-shrink-0 hover:bg-gray-50 transition-colors">
        <CircleUserRound />
      </button>
    )}
  </div>
);