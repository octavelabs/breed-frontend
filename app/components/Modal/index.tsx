import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  name?: string;
  role?: string;
  showHeader?: boolean;
  customClass?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  name,
  role,
  showHeader,
  customClass
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className={`bg-white z-100 h-[80vh] w-fit rounded-[20px] p-[50px] overflow-auto ${customClass}`}  onClick={(e) => e.stopPropagation()}>
        {
          showHeader && <div className="flex justify-between items-start mb-8 pb-4 border-b border-[#D2D9DF]">
          <div className="">
            <p className="text-base text-[#60666B] mb-1">{title}</p>
            <h2 className="text-[20px] font-bold ">
              {name}
              <span className="">.</span>
              <span className="text-[#60666B] text-base"> {role}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className=""
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
         }
        <div className="">{children}</div>
      </div>
    </div>
  );
}
