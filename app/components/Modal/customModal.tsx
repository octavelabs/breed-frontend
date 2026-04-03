import { ReactNode } from 'react';
import { X } from 'lucide-react'; // or your preferred icon library

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
   subTitle?: string;
  children: ReactNode;
  maxWidth?: string;
  icon?: ReactNode;
}

export const CustomModal = ({ 
  isOpen, 
  onClose, 
  title, 
  subTitle,
  children,
  icon,
  maxWidth
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div 
        className={`relative w-fit ${maxWidth} bg-white rounded-[20px] h-[80vh] max-h-[500px] lg:max-h-[650px] overflow-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200">
          <div className=''>
            {icon && icon}
          <h2 className="text-[20px] font-bold leading-none mt-5">{title}</h2>
          {subTitle && <p className="text-base text-[#60666B] leading-none mt-2">{subTitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};