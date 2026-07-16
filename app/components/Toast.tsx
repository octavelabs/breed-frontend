'use client';

import { useEffect } from 'react';
import { TickCircle, CloseCircle } from 'iconsax-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  onDismiss: () => void;
  duration?: number; // ms — default 3500
}

export default function Toast({ message, type = 'success', onDismiss, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  return (
    <div className="fixed top-6 right-6 z-9999 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium animate-fade-in-up bg-white border border-[#E3E8EF] max-w-xs w-full">
      {type === 'success'
        ? <TickCircle size={18} color="#22c55e" variant="Bold" />
        : <CloseCircle size={18} color="#f87171" variant="Bold" />
      }
      <span className="flex-1 text-[#180426]">{message}</span>
      <button onClick={onDismiss} className="text-[#B9C2CA] hover:text-[#60666B] transition-colors shrink-0 cursor-pointer">
        <CloseCircle size={14} color="currentColor" />
      </button>
    </div>
  );
}
