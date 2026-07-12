import { useState } from 'react';
import { X } from 'lucide-react';
import { StepProgress } from '@/app/dashboard/community/list/components/StepProgress';
import { CommunityMeetingFormData } from '../types';
import { CommunityStepThree } from './CommunityStepThree';
import { CommunityStepTwo } from './CommunityStepTwo';
import { CommunityStepOne } from './CommunityStepOne';
import { meetingsService } from '@/lib/api-services';

function toScheduledAt(date: string, time: string, minute: string, fmt: string): string {
  if (!date || !time) return new Date().toISOString();
  const [y, m, d] = date.split('-').map(Number);
  let h = parseInt(time, 10) || 0;
  const min = parseInt(minute, 10) || 0;
  if (fmt === 'PM' && h !== 12) h += 12;
  if (fmt === 'AM' && h === 12) h = 0;
  return new Date(y, m - 1, d, h, min, 0).toISOString();
}


interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: CommunityMeetingFormData) => void;
  defaultCommunityId?: string;
  defaultCommunityName?: string;
}


export const CreateCommunityMeetingModal = ({
  isOpen,
  onClose,
  onComplete,
  defaultCommunityId,
  defaultCommunityName,
}: CreateCommunityModalProps) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CommunityMeetingFormData>({
    title: "", community: defaultCommunityId ?? "", guests: "", description: "",
    date: "", timeZone: "", time: "", timeMinute: "", timeFormat: "",
    meetingFrequency: "", repeatInterval: 0, repeatPattern: "",
    repeatDays: [], saveDraftOfRecordings: false, lateInterval: "",
  });

  const canProceedStep1 = formData.title.trim() && formData.community.trim() && formData.guests.trim() && formData.description.trim();
  const canProceedStep2 = formData.meetingFrequency === 'custom'
    ? formData.repeatInterval && formData.repeatPattern && formData.repeatDays.length > 0
    : formData.date.trim() && formData.time.trim() && formData.timeMinute.trim() && formData.timeFormat.trim() && formData.meetingFrequency.trim();
  const canProceedStep3 = formData.lateInterval;

  const handleProceed = () => {
    if (step === 1 && canProceedStep1) setStep(2);
    else if (step === 2 && canProceedStep2) setStep(3);
  };

  const handleComplete = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const isRecurring = formData.meetingFrequency !== 'once' && !!formData.meetingFrequency;
      const freq = formData.meetingFrequency === 'custom' ? formData.repeatPattern : formData.meetingFrequency;
      await meetingsService.create({
        title: formData.title,
        description: formData.description || undefined,
        scheduledAt: toScheduledAt(formData.date, formData.time, formData.timeMinute, formData.timeFormat),
        communityId: formData.community || undefined,
        type: 'COMMUNITY',
        isRecurring,
        recurrence: isRecurring && freq
          ? { frequency: freq as 'daily' | 'weekly' | 'monthly', endsAt: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0] }
          : undefined,
      });
      onComplete?.(formData);
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to schedule meeting.');
      setSubmitting(false);
    }
  };

 


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  p-4"
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
              <h2 className="text-lg font-bold text-[#180426]">Create Community Meeting</h2>
              <p className="text-xs text-gray-500">
                {step === 1 && 'Add Meeting information'}
                {step === 2 && 'Set meeting schedule'}
                {step === 3 && 'Customize settings'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="px-8 pb-6">
          {step === 1 && (
           <CommunityStepOne formData={formData} setFormData={setFormData} handleProceed={handleProceed} canProceedStep1={canProceedStep1} lockedCommunityName={defaultCommunityName} />
          )}

          {/* Step 2: Permissions */}
          {step === 2 && (
            <CommunityStepTwo formData={formData} setFormData={setFormData} handleProceed={handleProceed} canProceedStep2={canProceedStep2}/>
          )}
          {step === 3 && (
            <>
              {submitError && <p className="text-red-500 text-sm mb-2">{submitError}</p>}
              <CommunityStepThree formData={formData} setFormData={setFormData} handleComplete={handleComplete} canProceedStep3={canProceedStep3} submitting={submitting} />
            </>
          )}

        </div>
      </div>
    </div>
  );
};
