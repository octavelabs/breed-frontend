'use client';

import { useEffect, useState } from 'react';
import { DateSelectStep } from './DateSelectStep';
import { TimeSelectStep } from './TimeSelectStep';
import { ConfirmBookingStep, formatDate } from './ConfirmBookingStep';
import { Modal } from '@/app/components/Modal';
import Button from '@/app/components/Button';
import { mentorshipService } from '@/lib/api-services';

interface MentorInfo {
  id: string;
  name: string;
  avatarUrl?: string | null;
  specializations?: string[];
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mentorInfo: MentorInfo;
}

export function BookingModal({ isOpen, onClose, onSuccess, mentorInfo }: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [availability, setAvailability] = useState<{ schedule: any; bookedSlots: { start: string; duration: number }[] } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    mentorshipService.getMentorAvailability(mentorInfo.id)
      .then((res: any) => setAvailability(res))
      .catch(() => {});
  }, [isOpen, mentorInfo.id]);

  const canProceed =
    (currentStep === 1 && !!selectedDate) ||
    (currentStep === 2 && !!selectedTime) ||
    (currentStep === 3 && !!selectedTopic);

  const handleProceed = async () => {
    if (currentStep === 1 && selectedDate) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedTime) {
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedTopic) {
      // Build proposedSessionAt from selected date + time
      let proposedSessionAt: string | undefined;
      if (selectedDate && selectedTime) {
        // selectedTime format: "10:00am" or "2:30pm"
        const match = selectedTime.match(/^(\d+):(\d+)(am|pm)$/i);
        if (match) {
          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const ampm = match[3].toLowerCase();
          if (ampm === 'pm' && hours !== 12) hours += 12;
          if (ampm === 'am' && hours === 12) hours = 0;
          const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), hours, minutes);
          proposedSessionAt = d.toISOString();
        }
      }

      const message = additionalMessage.trim() || undefined;

      setSubmitting(true);
      setError(null);
      try {
        await mentorshipService.requestMentorship(mentorInfo.id, message, proposedSessionAt, selectedTopic);
        setSucceeded(true);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to send request. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (succeeded) {
      onSuccess();
    } else {
      onClose();
    }
    // Reset state after a brief delay so the modal animates out cleanly
    setTimeout(() => {
      setCurrentStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedTopic('');
      setAdditionalMessage('');
      setError(null);
      setSubmitting(false);
      setSucceeded(false);
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      customClass="!w-[90%] lg:!w-[60%]"
      title="Mentorship"
      name={mentorInfo.name}
      role="Request a Session"
      showHeader={!succeeded}
    >
      {succeeded ? (
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center mx-auto">
          <button onClick={handleClose} className="ml-auto block text-gray-400 hover:text-gray-600 mb-4">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-6">
            <div className="w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg width="40" height="40" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-3">Request Sent!</h2>
            <p className="text-gray-600 mb-6">
              Your session request has been sent to{' '}
              <span className="font-semibold text-[#870BD6]">{mentorInfo.name.split(' ')[0]}</span>.
              <br />
              You'll be notified once they respond.
            </p>
          </div>

          <div className="mb-6">
            {mentorInfo.avatarUrl ? (
              <img src={mentorInfo.avatarUrl} alt={mentorInfo.name} className="w-20 h-20 rounded-full mx-auto mb-3 ring-4 ring-purple-100 object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-2xl mx-auto mb-3 ring-4 ring-purple-100">
                {mentorInfo.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <p className="font-semibold mb-1">
              Session with <span className="text-purple-600">{mentorInfo.name.split(' ')[0]}</span>
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{selectedDate ? formatDate(selectedDate) : ''}</span>
            </div>
            {selectedTime && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-1">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{selectedTime}</span>
              </div>
            )}
          </div>

          <Button onClick={handleClose} customClass="!w-full !text-white">
            Done
          </Button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left panel — mentor info */}
          <div className="flex flex-col gap-4 w-full lg:w-1/2">
            <div>
              <p className="text-sm lg:text-base text-[#60666B] mb-1">Price</p>
              <p className="font-semibold text-[18px] lg:text-[20px]">Free</p>
            </div>
            <div>
              <p className="text-sm lg:text-base text-[#60666B] mb-1">Session Duration</p>
              <p className="font-semibold text-[18px] lg:text-[20px]">1 hour</p>
            </div>
            {mentorInfo.specializations?.length ? (
              <div>
                <p className="text-sm lg:text-base text-[#60666B] mb-2">Specializes in</p>
                <div className="flex flex-wrap gap-1.5">
                  {mentorInfo.specializations.map((s) => (
                    <span key={s} className="text-xs bg-[#F5EBFF] text-[#870BD6] px-2.5 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right panel — steps */}
          <div className="w-full lg:w-1/2 -order-1 lg:order-0">
            <div className="mb-8 lg:mb-4">
              <p className="text-base text-[#60666B] mb-1">Step {currentStep} of 3</p>
              <h3 className="text-[20px] leading-none font-bold">
                {currentStep === 1 && 'Select date'}
                {currentStep === 2 && 'Select Available Time'}
                {currentStep === 3 && 'Confirm your Booking'}
              </h3>
            </div>

            <div className="mb-4">
              {currentStep === 1 && (
                <DateSelectStep selectedDate={selectedDate} onSelectDate={setSelectedDate} availability={availability} />
              )}
              {currentStep === 2 && (
                <TimeSelectStep
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onSelectTime={setSelectedTime}
                  onChangeDate={() => setCurrentStep(1)}
                  availability={availability}
                />
              )}
              {currentStep === 3 && (
                <ConfirmBookingStep
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onChangeDate={() => setCurrentStep(1)}
                  selectedTopic={selectedTopic}
                  setSelectedTopic={setSelectedTopic}
                  additionalMessage={additionalMessage}
                  setAdditionalMessage={setAdditionalMessage}
                />
              )}
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{error}</p>
            )}

            <button
              onClick={handleProceed}
              disabled={!canProceed || submitting}
              className={`w-full py-4 rounded-full font-medium transition-all flex items-center justify-center gap-2 ${
                canProceed && !submitting
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-[#60666B] text-white cursor-not-allowed'
              }`}
            >
              {submitting && (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {currentStep === 3 ? 'Confirm Booking' : 'Proceed'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
