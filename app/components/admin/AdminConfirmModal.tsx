'use client';

import { useEffect } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

type IconType = 'constructive' | 'destructive' | 'neutral';

interface AdminConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  iconType?: IconType;
}

// ── Icon badges ───────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M5 12L10 17L19 7" stroke="#1A8454" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const XIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="#DB2929" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InfoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 8V12M12 16H12.01" stroke="#870BD6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="9" stroke="#870BD6" strokeWidth="2.5" />
  </svg>
);

const BADGE_STYLES: Record<IconType, string> = {
  constructive: 'bg-[#B4F6D5] border-[6px] border-[#D6FBE9]',
  destructive:  'bg-[#FBAFAF] border-[6px] border-[#FED3D3]',
  neutral:      'bg-[#EDD9FF] border-[6px] border-[#F3EBFF]',
};

const CONFIRM_STYLES: Record<IconType, string> = {
  constructive: 'bg-[#1FA564] hover:bg-[#177A4B]',
  destructive:  'bg-[#E44E4E] hover:bg-[#C13838]',
  neutral:      'bg-[#870BD6] hover:bg-[#6A09AA]',
};

const IconBadge = ({ iconType }: { iconType: IconType }) => (
  <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center mb-5 flex-shrink-0 ${BADGE_STYLES[iconType]}`}>
    {iconType === 'constructive' && <CheckIcon />}
    {iconType === 'destructive'  && <XIcon />}
    {iconType === 'neutral'      && <InfoIcon />}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────

const AdminConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title,
  description,
  confirmLabel = 'Confirm',
  iconType = 'neutral',
}: AdminConfirmModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-7 max-w-[380px] w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <IconBadge iconType={iconType} />

        <div className="mb-5">
          <h3 className="text-[17px] font-bold text-gray-900 leading-snug">{title}</h3>
          <div className="border-t border-dashed border-[#E3E8EF] my-3" />
          <p className="text-sm text-[#60666B] leading-relaxed">{description}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-10 rounded-full border border-[#D2D9DF] text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 h-10 rounded-full text-sm font-semibold text-white transition-colors disabled:opacity-60 ${CONFIRM_STYLES[iconType]}`}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {confirmLabel}…
              </span>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminConfirmModal;
