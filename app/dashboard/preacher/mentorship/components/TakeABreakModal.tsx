'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { CustomModal } from '@/app/components/Modal/customModal';
import Input from '@/app/components/Input';
import Button from '@/app/components/Button';
import PauseIcon from './PauseIcon';
import { mentorshipService } from '@/lib/api-services';

interface TakeABreakModalProps {
  isOpen: boolean;
  onClose: (refreshNeeded?: boolean) => void;
  isCurrentlyOnBreak?: boolean;
}

const TakeABreakModal: React.FC<TakeABreakModalProps> = ({ isOpen, onClose, isCurrentlyOnBreak }) => {
  const [breakPeriod, setBreakPeriod] = useState('');
  const [timeUnit, setTimeUnit] = useState<'days' | 'weeks'>('weeks');
  const [pauseMode, setPauseMode] = useState<'pause' | 'full'>('full');
  const [informed, setInformed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const computeBreakEndsAt = (): string | undefined => {
    const n = parseInt(breakPeriod, 10);
    if (!n || n <= 0) return undefined;
    const days = timeUnit === 'weeks' ? n * 7 : n;
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  };

  const handleConfirm = async () => {
    if (!isCurrentlyOnBreak && !informed) {
      setError('Please confirm you have informed your mentees before taking a break.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await mentorshipService.toggleBreak(computeBreakEndsAt());
      onClose(true);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update break status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isCurrentlyOnBreak) {
    return (
      <CustomModal isOpen={isOpen} onClose={() => onClose()} title="End Break" subTitle="Resume accepting new disciples and conducting sessions.">
        <div className="pt-2">
          <p className="text-base text-[#292A2B] mb-6">
            Your break will end and you will start receiving new mentorship requests again.
          </p>
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-4">{error}</p>}
          <div className="flex gap-3">
            <Button buttonType="bordered" customClass="!w-1/2 !h-[48px] !border-[#60666B] !text-[#60666B]" onClick={() => onClose()} disabled={loading}>
              Cancel
            </Button>
            <Button buttonType="custom" customClass="!w-1/2 !h-[48px] text-white !bg-[#870BD6]" loading={loading} onClick={handleConfirm}>
              End Break
            </Button>
          </div>
        </div>
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={() => onClose()}
      maxWidth="!w-[640px]"
      title="Take a break"
      subTitle="Pause new requests or temporarily stop all sessions. Taking a break helps you recharge and maintain the quality of mentorship you provide."
    >
      <div className="mt-6 mb-2 flex flex-col gap-5">
        {/* Break period */}
        <div className="w-full flex gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-[6px]">Break period</label>
            <Input
              id="duration"
              type="number"
              onChange={(e) => setBreakPeriod(e.target.value)}
              value={breakPeriod}
              placeholder="e.g. 2"
              variant="outlined"
              className="!bg-white !border-[#B9C2CA] !w-full !h-[48px] rounded-[10px]"
            />
          </div>
          <div className="w-[100px] pt-[26px]">
            <div className="flex rounded-[10px] border border-[#B9C2CA] overflow-hidden h-[48px]">
              {(['days', 'weeks'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setTimeUnit(u)}
                  className={`flex-1 text-sm font-medium transition-colors ${
                    timeUnit === u ? 'bg-[#870BD6] text-white' : 'bg-white text-[#60666B] hover:bg-gray-50'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode selection */}
        <div className="flex gap-4">
          {(['pause', 'full'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setPauseMode(mode)}
              className={`flex-1 p-5 rounded-[18px] border transition-all text-left ${
                pauseMode === mode ? 'border-[#5B26B1] bg-[#FBF6FF]' : 'border-[#B9C2CA] hover:bg-gray-50'
              }`}
            >
              <div className="flex justify-between mb-4">
                <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center ${pauseMode === mode ? 'bg-[#E7C8FF]' : 'bg-[#D2D9DF]'}`}>
                  <PauseIcon color={pauseMode === mode ? '#5B26B1' : '#60666B'} />
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${pauseMode === mode ? 'border-[#5B26B1]' : 'border-[#D0D5DD]'}`}>
                  {pauseMode === mode && <div className="w-2.5 h-2.5 rounded-full bg-[#5B26B1]" />}
                </div>
              </div>
              <h3 className="font-bold text-[#292A2B] text-sm">
                {mode === 'pause' ? 'Pause new Requests' : 'Full Pause Mode'}
              </h3>
              <p className="text-xs text-[#3C3E40] mt-1.5">
                {mode === 'pause'
                  ? "New requests paused. You're still mentoring your current mentees."
                  : 'Temporarily stop all sessions and new requests.'}
              </p>
            </button>
          ))}
        </div>

        {/* Confirmation checkbox */}
        <label className="bg-[#F6F8FA] flex items-start p-4 gap-3 cursor-pointer rounded-[12px]">
          <input
            type="checkbox"
            checked={informed}
            onChange={(e) => setInformed(e.target.checked)}
            className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 shrink-0"
          />
          <span className="text-sm font-medium">
            I have informed my mentees
            <span className="block text-[#60666B] font-normal mt-0.5">
              If you're currently mentoring people, please inform them before pausing. Pausing without communicating may result in account review.
            </span>
          </span>
        </label>

        {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <Button onClick={handleConfirm} loading={loading} disabled={!informed} customClass="w-full text-white h-[48px]">
          Confirm Break
        </Button>
      </div>
    </CustomModal>
  );
};

export default TakeABreakModal;
