import { useState } from 'react';
import { X } from 'lucide-react';
import { StepProgress } from '@/app/dashboard/community/list/components/StepProgress';
import { OpenMeetingFormData } from '../types';
import { OpenStepOne } from './OpenStepOne';
import { OpenStepTwo } from './OpenStepTwo';
import { OpenStepThree } from './OpenStepThree';
import { meetingsService } from '@/lib/api-services';

function toScheduledAt(date: string, time: string, fmt: string): string {
  if (!date || !time) return new Date().toISOString();
  const [timePart] = time.split(':');
  let h = parseInt(timePart, 10) || 0;
  const m = time.includes(':30') ? 30 : 0;
  if (fmt === 'PM' && h !== 12) h += 12;
  if (fmt === 'AM' && h === 12) h = 0;
  const [y, mo, d] = date.split('-').map(Number);
  return new Date(y, mo - 1, d, h, m, 0).toISOString();
}

interface CreateOpenMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: OpenMeetingFormData) => void;
}

export const CreateOpenMeetingModal = ({
  isOpen,
  onClose,
  onComplete,
}: CreateOpenMeetingModalProps) => {
  const [step, setStep] = useState(1);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<OpenMeetingFormData>({
    title: '', guests: [], description: '',
    date: '', timeZone: '', time: '', timeFormat: '',
    meetingFrequency: '', repeatInterval: 0, repeatPattern: '',
    repeatDays: [], saveDraftOfRecordings: false, lateInterval: '',
  });

  const canProceedStep1 = formData.title.trim() && formData.description.trim();
  const canProceedStep2 = formData.meetingFrequency === 'custom'
    ? formData.repeatInterval && formData.repeatPattern && formData.repeatDays.length > 0
    : formData.date.trim() && formData.time.trim() && formData.timeFormat.trim() && formData.timeZone.trim() && formData.meetingFrequency.trim();

  const handleProceedStep1 = () => {
    if (canProceedStep1) setStep(2);
  };

  // Create the meeting when advancing from step 2, so step 3 has a real ID/link
  const handleProceedStep2 = async () => {
    if (!canProceedStep2) return;
    setCreatingMeeting(true);
    setCreateError(null);
    try {
      const isRecurring = formData.meetingFrequency !== 'once' && !!formData.meetingFrequency;
      const freq = formData.meetingFrequency === 'custom' ? formData.repeatPattern : formData.meetingFrequency;
      const res = await meetingsService.create({
        title: formData.title,
        description: formData.description || undefined,
        scheduledAt: toScheduledAt(formData.date, formData.time, formData.timeFormat),
        type: 'OPEN',
        isRecurring,
        recurrence: isRecurring && freq
          ? { frequency: freq as 'daily' | 'weekly' | 'monthly', endsAt: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0] }
          : undefined,
      }) as { id: string };
      setMeetingId(res.id);
      setStep(3);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create meeting. Please try again.');
    } finally {
      setCreatingMeeting(false);
    }
  };

  const handleDone = () => {
    onComplete?.(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-[520px] bg-white rounded-3xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#B9C2CA] mb-6">
          <div className="flex items-center gap-3">
            <StepProgress step={step} totalSteps={3} />
            <div>
              <h2 className="text-lg font-bold text-[#180426]">Create Open Meeting</h2>
              <p className="text-xs text-gray-500">
                {step === 1 && 'Add meeting information'}
                {step === 2 && 'Set meeting schedule'}
                {step === 3 && 'Share link and invite people'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-8 pb-6">
          {step === 1 && (
            <OpenStepOne formData={formData} setFormData={setFormData} handleProceed={handleProceedStep1} canProceedStep1={canProceedStep1} />
          )}
          {step === 2 && (
            <>
              {createError && <p className="text-red-500 text-sm mb-3">{createError}</p>}
              <OpenStepTwo
                formData={formData}
                setFormData={setFormData}
                handleProceed={handleProceedStep2}
                canProceedStep2={canProceedStep2}
                loading={creatingMeeting}
              />
            </>
          )}
          {step === 3 && meetingId && (
            <OpenStepThree meetingId={meetingId} handleDone={handleDone} />
          )}
        </div>
      </div>
    </div>
  );
};
