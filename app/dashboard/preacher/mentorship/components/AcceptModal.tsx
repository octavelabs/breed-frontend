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

const AcceptModal: React.FC<Props> = ({ isOpen, onClose, selectedRequest }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !selectedRequest) return null;

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      await mentorshipService.respondToRequest(selectedRequest.id, 'accept');
      onClose(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to accept request. Please try again.');
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
              <div className="w-[46px] h-[46px] rounded-full bg-[#B4F6D5] border-[6px] border-[#D6FBE9] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#1A8454" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-[20px] font-bold mt-4">Accept Request</h2>
              <p className="text-sm text-[#60666B] mt-1">Begin this mentorship relationship</p>
            </div>
            <button onClick={() => onClose()} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-base text-[#292A2B] pb-4 border-b border-dashed border-[#B9C2CA]">
            <span className="font-semibold">{selectedRequest.disciple.firstName} {selectedRequest.disciple.lastName}</span> will be added as your disciple and you will begin a mentorship relationship together.
          </p>
          <p className="text-sm text-[#60666B] mt-4 mb-6">Are you ready to commit to discipling this believer?</p>
          {error && <p className="text-sm text-red-500 mb-4 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3">
            <Button buttonType="bordered" customClass="!w-1/2 !h-[48px] !border-[#60666B] !text-[#60666B]" onClick={() => onClose()} disabled={loading}>
              Cancel
            </Button>
            <Button buttonType="custom" customClass="!w-1/2 !h-[48px] text-white !bg-[#1FA564]" loading={loading} onClick={handleAccept}>
              Yes, Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptModal;
