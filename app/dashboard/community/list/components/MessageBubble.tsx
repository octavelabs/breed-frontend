import { useState } from "react";

type BubbleMessageProps = {
  message: {
    id: string;
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

function AvatarFallback({ author }: { author: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-xs flex-shrink-0 self-end select-none">
      {author.charAt(0).toUpperCase()}
    </div>
  );
}

export const MessageBubble: React.FC<BubbleMessageProps> = ({ message, isOwnMessage }) => {
  const [avatarError, setAvatarError] = useState(false);

  const showImg = !isOwnMessage && !!message.avatar && !avatarError;
  const showFallback = !isOwnMessage && (!message.avatar || avatarError);

  return (
    <div className={`flex gap-3 mb-8 w-[85%] lg:w-[60%] min-w-0 ${!isOwnMessage ? "mr-auto" : "ml-auto"}`}>
      {showImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={message.avatar}
          alt={message.author}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-end"
          onError={() => setAvatarError(true)}
        />
      )}
      {showFallback && <AvatarFallback author={message.author} />}

      <div className={`flex-1 min-w-0 ${!isOwnMessage ? "bg-[#F6F8FA] dark:bg-[#252830]" : "bg-[#EAE1F2] dark:bg-[#2D1B4E]"} rounded-[15px] py-2 px-[13px]`}>
        {!isOwnMessage && (
          <div className="text-xs font-semibold mb-2 text-[#60666B] dark:text-[#9CA3AF]">{message.author}</div>
        )}
        <div className="text-xs leading-relaxed mb-2 whitespace-pre-wrap break-words text-[#180426] dark:text-[#E2E4E9]">
          {renderText(message.text)}
        </div>
        <div className="text-xs font-normal text-end text-[#9CA3AF] dark:text-[#717784]">{message.time}</div>
      </div>

    </div>
  );
};
