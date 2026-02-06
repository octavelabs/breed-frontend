import { useState } from 'react';

import { DateSelectStep } from './DateSelectStep';
import { TimeSelectStep } from './TimeSelectStep';
import { ConfirmBookingStep, formatDate } from './ConfirmBookingStep';
import { Modal } from '@/app/components/Modal';
;

interface MentorInfo {
  name: string;
  role: string;
  about: string
  duration: string;
  image: string
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorInfo: MentorInfo;
  onConfirmBooking?: (bookingData: {
    date: Date | null;
    time: string | null;
  }) => void;
}

export function BookingModal({
  isOpen,
  onClose,
  mentorInfo,
  onConfirmBooking,
}: BookingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false)


  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleProceed = () => {
    if (currentStep === 1 && selectedDate) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedTime) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // onConfirmBooking?.({ date: selectedDate, time: selectedTime });
      setSuccessModalOpen(true);
    }
  };

  const handleChangeDate = () => {
    setCurrentStep(1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    onClose()
  };

  const handleSuccessModalClose = () => {
    setSuccessModalOpen(false);
    setCurrentStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const canProceed =
    (currentStep === 1 && selectedDate) ||
    (currentStep === 2 && selectedTime) ||
    currentStep === 3 && selectedTopic;

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} customClass='!w-[60%]' title='Mentorship' name={mentorInfo?.name} role={mentorInfo?.role} showHeader={true}>
        {isSuccessModalOpen ?
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-scale-in">
          <button 
            onClick={handleSuccessModalClose}
            className="ml-auto block text-gray-400 hover:text-gray-600 mb-4"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
              <svg width="40" height="40" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-3 clash-display">Confirmed Booking</h2>
            <p className="text-gray-600 mb-6">
              Your session has been confirmed.<br/>
              Mentor has accepted your request, check<br/>
              email for calendar invite.
            </p>
          </div>

          {/* Mentor Info */}
          <div className="mb-6">
            <img 
              src={mentorInfo?.image}
              alt={mentorInfo.name}
              className="w-20 h-20 rounded-full mx-auto mb-3 ring-4 ring-purple-100"
            />
            <p className="font-semibold mb-1">Mentorship session with <span className="text-purple-600">{mentorInfo.name.split(' ')[0]}</span></p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{selectedDate ? formatDate(selectedDate): ""}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mt-1">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{selectedTime}</span>
            </div>
          </div>

          <button
            onClick={handleSuccessModalClose}
            className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-purple-700 btn-hover-lift"
          >
            Manage Booking
          </button>
        </div> :
      <div className="flex">
          <div className="flex flex-col gap-4 w-1/2">
            <div>
              <p className="text-base text-[#60666B] mb-1">Price</p>
              <p className="font-semibold text-[20px]">Free</p>
            </div>

            <div>
              <p className="text-base text-[#60666B] mb-1">Session Duration</p>
              <p className="font-semibold text-[20px]">{mentorInfo.duration}</p>
            </div>

            <div>
              <p className="text-base text-[#60666B] mb-1">About</p>
              <p className="font-semibold text-[20px]">{mentorInfo.about}</p>
            </div>
          </div>
      

        <div className="w-1/2">
          <div className="mb-4">
            <p className="text-base text-[#60666B] mb-1">Step {currentStep} of 3</p>
            <h3 className="text-[20px] leading-none font-bold">
              {currentStep === 1 && 'Select date'}
              {currentStep === 2 && 'Select Available Time'}
              {currentStep === 3 && 'Confirm your Booking'}
            </h3>
          </div>

          <div className="mb-4">
            {currentStep === 1 && (
              <DateSelectStep
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
              />
            )}
            {currentStep === 2 && (
              <TimeSelectStep
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onSelectTime={handleTimeSelect}
                onChangeDate={handleChangeDate}
              />
            )}
            {currentStep === 3 && (
              <ConfirmBookingStep
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onChangeDate={handleChangeDate}
                selectedTopic={selectedTopic}
                setSelectedTopic={(item) => setSelectedTopic(item)}
              />
            )}
          </div>

          <button
            onClick={handleProceed}
            disabled={!canProceed}
            className={`
              w-full py-4 rounded-full font-medium transition-all
              ${
                canProceed
                  ? 'bg-black text-white'
                  : 'bg-[#60666B] text-white cursor-not-allowed'
              }
            `}
          >
            {currentStep === 3 ? 'Confirm Booking' : 'Proceed'}
          </button>
        </div>
      </div>
}
    </Modal>
    </>
  );
}