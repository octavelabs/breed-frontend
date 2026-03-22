import { useState, useId, ChangeEvent } from 'react';
import { X, Upload, Search, Check, Plus } from 'lucide-react';

import Button from '@/app/components/Button';
import Dropdown from '@/app/components/Dropdown';
import DropdownWithMultipleSelect from '@/app/components/Dropdown/DropdownWithMultipleSelect';
import { useDebounce } from '@/utils/useDebounce';
import { StepProgress } from '@/app/dashboard/community/list/components/StepProgress';
import { CourseFormData } from '../../showreel/type';
import Input from '@/app/components/Input';
import { CommunityMeetingFormData } from '../types';
import { CommunityStepThree } from './CommunityStepThree';
import { CommunityStepTwo } from './CommunityStepTwo';
import { CommunityStepOne } from './CommunityStepOne';


interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: CommunityMeetingFormData) => void;
}


export const CreateCommunityMeetingModal = ({
  isOpen,
  onClose,
  onComplete,
}: CreateCommunityModalProps) => {
  const bannerInputId = useId();
  const [step, setStep] = useState(1);
    const [selectedCategories, setSelectedCategories] = useState<[]>([]);
      const [searchValueCategory, setSearchValueCategory] = useState<string>("");
  const debouncedSearchValueCategory = useDebounce(searchValueCategory, 1000) ?? "";
  const isLoading = false

  const [formData, setFormData] = useState<CommunityMeetingFormData>({
    title:"",
 community: "",
 guests: "",
 description: "",
 date: "",
 timeZone: "",
 time: "",
 timeFormat:"",
 meetingFrequency: "",
 repeatInterval: 0,
 repeatPattern:"",
 repeatDays:[],
 saveDraftOfRecordings: false,
 lateInterval: "",
  });



  const canProceedStep1 = formData.title.trim() && formData.community.trim() && formData.guests && formData.description.trim();
    const canProceedStep2 = formData.meetingFrequency === 'custom' ? formData.repeatInterval && formData.repeatPattern && formData.repeatDays.length > 0 :  formData.date.trim() && formData.time.trim() && formData.timeFormat.trim() && formData.timeZone.trim() && formData.meetingFrequency.trim() ;
    const canProceedStep3 = formData.lateInterval

    

  const handleProceed = () => {
    if (step === 1 && canProceedStep1) {
      setStep(2);
    } else if (step === 2 && canProceedStep2) {
      setStep(3);
    }
  };

  const handleComplete = () => {
    onComplete?.(formData);
    onClose();
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
           <CommunityStepOne formData={formData} setFormData={setFormData} handleProceed={handleProceed} canProceedStep1={canProceedStep1} />
          )}

          {/* Step 2: Permissions */}
          {step === 2 && (
            <CommunityStepTwo formData={formData} setFormData={setFormData} handleProceed={handleProceed} canProceedStep2={canProceedStep2}/>
          )}
          {step === 3 && (
           <CommunityStepThree formData={formData} setFormData={setFormData} handleComplete={handleComplete} canProceedStep3={canProceedStep3}/>
          )}

        </div>
      </div>
    </div>
  );
};
