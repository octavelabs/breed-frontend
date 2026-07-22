import { CircleUserRound } from "lucide-react";

type BubbleMessageProps = {
  message: {
    id: number;
    author: string;
    text: string;
    time: string;
    avatar: string;
  };
  isOwnMessage: boolean;
};

function renderText(text: string) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#870BD6] underline break-all hover:text-[#6B09B0]"
        onClick={(e) => e.stopPropagation()}
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

export const MessageBubble: React.FC<BubbleMessageProps> = ({ message, isOwnMessage }) => (
  <div className={`flex gap-3 mb-8 w-[85%] lg:w-[60%] min-w-0 ${!isOwnMessage ? "mr-auto" : "ml-auto"}`}>
    {!isOwnMessage && (
      <img
        src={message.avatar}
        alt={message.author}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end"
      />
    )}
    <div className={`flex-1 min-w-0 ${!isOwnMessage ? "bg-[#F6F8FA] dark:bg-[#252830]" : "bg-[#EAE1F2] dark:bg-[#2D1B4E]"} rounded-[15px] py-2 px-[13px]`}>
      <div className="text-[10px] font-semibold mb-2 text-[#60666B] dark:text-[#9CA3AF]">{message.author}</div>
      <div className="text-xs leading-relaxed mb-2 whitespace-pre-wrap break-words text-[#180426] dark:text-[#E2E4E9]">
        {renderText(message.text)}
      </div>
      <div className="text-xs font-normal text-end text-[#9CA3AF] dark:text-[#717784]">{message.time}</div>
    </div>
    {isOwnMessage && (
      <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-[#2D313A] bg-white dark:bg-[#252830] flex items-center self-end justify-center cursor-pointer flex-shrink-0 hover:bg-gray-50 dark:hover:bg-[#2D313A] transition-colors">
        <CircleUserRound />
      </button>
    )}
  </div>
);
