import { ReactNode } from 'react';
import { X } from 'lucide-react'; // or your preferred icon library

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}

export const CustomModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'max-w-lg'
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-[20px] font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};