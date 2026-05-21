'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/app/components/Button';
import { mentorshipService } from '@/lib/api-services';

interface Props {
  isOpen: boolean;
  onClose: (refreshNeeded?: boolean) => void;
  selectedRequest: { id: string; disciple: { firstName: string; lastName: string } } | null;
}

const REASONS = [
  "Currently at capacity",
  "Not the right fit",
  "Insufficient information provided",
  "Taking a break from mentorship",
  "Other",
];

const RejectModal: React.FC<Props> = ({ isOpen, onClose, selectedRequest }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !selectedRequest) return null;

  const handleReject = async () => {
    setLoading(true);
    setError(null);
    try {
      await mentorshipService.respondToRequest(selectedRequest.id, 'reject', reason || undefined);
      onClose(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to reject request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => onClose()}>
      <div className="relative w-full max-w-sm bg-white rounded-[20px] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <div className="w-[46px] h-[46px] rounded-full bg-[#FBAFAF] border-[6px] border-[#FED3D3] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="#DB2929" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="text-[20px] font-bold mt-4">Reject Request</h2>
              <p className="text-sm text-[#60666B] mt-1">This action cannot be undone</p>
            </div>
            <button onClick={() => onClose()} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-base text-[#292A2B] pb-4 border-b border-dashed border-[#B9C2CA]">
            <span className="font-semibold">{selectedRequest.disciple.firstName} {selectedRequest.disciple.lastName}</span>'s mentorship request will be declined.
          </p>

          <div>
            <label className="block text-sm font-medium text-[#180426] mb-2">
              Reason <span className="text-[#60666B] font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(reason === r ? '' : r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    reason === r
                      ? 'bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]'
                      : 'border-[#D0D5DD] text-[#60666B] hover:bg-gray-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button buttonType="bordered" customClass="!w-1/2 !h-[48px] !border-[#60666B] !text-[#60666B]" onClick={() => onClose()} disabled={loading}>
              Cancel
            </Button>
            <Button buttonType="custom" customClass="!w-1/2 !h-[48px] text-white !bg-[#E44E4E]" loading={loading} onClick={handleReject}>
              Yes, Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
