'use client';

import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

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
        ? <CheckCircle size={18} className="text-green-500 shrink-0" />
        : <XCircle size={18} className="text-red-400 shrink-0" />
      }
      <span className="flex-1 text-[#180426]">{message}</span>
      <button onClick={onDismiss} className="text-[#B9C2CA] hover:text-[#60666B] transition-colors shrink-0">
        <X size={14} />
      </button>
    </div>
  );
}
