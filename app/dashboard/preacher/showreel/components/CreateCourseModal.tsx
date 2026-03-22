import { useState, useId, ChangeEvent } from 'react';
import { X, Upload, Search, Check, Plus } from 'lucide-react';

import Button from '@/app/components/Button';
import Dropdown from '@/app/components/Dropdown';
import DropdownWithMultipleSelect from '@/app/components/Dropdown/DropdownWithMultipleSelect';
import { useDebounce } from '@/utils/useDebounce';
import { CourseCategory, CourseFormData } from '../type';
import { StepProgress } from '@/app/dashboard/community/list/components/StepProgress';
import TextArea from '@/app/components/TextArea';
import Input from '@/app/components/Input';


// Types
interface Friend {
  id: string;
  name: string;
  status: string;
  avatar: string;
  role?: 'admin' | 'member' | 'added';
}

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: CourseFormData) => void;
}


export const CreateCourseModal = ({
  isOpen,
  onClose,
  onComplete,
}: CreateCommunityModalProps) => {
  const bannerInputId = useId();
  const [step, setStep] = useState(1);
    const [selectedCategories, setSelectedCategories] = useState<CourseCategory[]>([]);
      const [searchValueCategory, setSearchValueCategory] = useState<string>("");
  const debouncedSearchValueCategory = useDebounce(searchValueCategory, 1000) ?? "";
  const isLoading = false

  const [formData, setFormData] = useState<CourseFormData>({
    banner: null,
    title: '',
    courseDescription: '',
    categories: [],
    chapterName: '',
    chapterDescription:''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);



  const courseCategories = [{id: "1", title: "salvation"}]

    const filteredOptions = courseCategories.filter(
    (category: CourseCategory) =>
      !selectedCategories.some((selected) => selected.id === category.id)
  );

  if (!isOpen) return null;

  const handleBannerUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, banner: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const canProceedStep1 = formData.title.trim() && formData.courseDescription.trim() && formData.categories.length > 0 && formData.banner;
    const canProceedStep2 = formData.chapterName.trim() && formData.chapterDescription.trim();


  const handleProceed = () => {
    if (step === 1 && canProceedStep1) {
      setStep(2);
    } 
  };

  const handleComplete = () => {
    onComplete?.(formData);
    onClose();
  };

  const handleRemove = (category: CourseCategory) => {
    setSelectedCategories((prev) =>
      prev.filter(
        (v) =>
          !(    
         v.id === category.id
          )
      )
    );
  };

   const handleAddition = (item: CourseCategory) => {
    const isAlreadySelected = selectedCategories.some(
      (category) => category.id === item.id
    );
    if (isAlreadySelected) return;

    setSelectedCategories((prev) => {
      return [...prev, item];
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50  p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#B9C2CA] mb-6">
          <div className="flex items-center gap-3">
            <StepProgress step={step} totalSteps={2} />
            <div>
              <h2 className="text-lg font-bold text-[#180426]">Create Course</h2>
              <p className="text-xs text-gray-500">
                {step === 1 && 'Provide course information'}
                {step === 2 && 'Chapters will contain info the lesson contain'}
       
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
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course title
                </label>
          
                <Input
                                        id="title"
                                        type="text"
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        value={formData.title}
                                        placeholder="Enter title"
                                        variant="outlined"
                                        className="!bg-white  !w-full !h-[48px] rounded-[10px]"
                                      />
              </div>

        
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <TextArea
                  placeholder="Enter description"
                  value={formData.courseDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, courseDescription: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Select one or more categories that fit your course content
                  </label>

                   <DropdownWithMultipleSelect
                    value={selectedCategories}
                    keySelector={[
                      "title",
    
                    ]}
                    // disabled={selectedCategories.some(
                    //   (staff) => staff.id === "all",
                    // )}
                    isFetching={isLoading}
                    className="!rounded-xl"
                    searchValue={searchValueCategory}
                    setSearchValue={setSearchValueCategory}
                    handleRemove={handleRemove}
                    displayFields={["title"]}
                  
                    
                    onChange={(item: CourseCategory) => {
                      handleAddition(item);
                    }}
                    objectOptions={filteredOptions}
                    placeholder="To"
                  />
                </div>
                <div className='mx-auto w-fit'>
              <label
                  htmlFor={bannerInputId}
                  className="mx-auto w-[116px] h-[116px] rounded-[19px] border-2 border-dashed border-[#D49CFD] bg-[#FBF6FF] flex items-center justify-center cursor-pointer transition-colors overflow-hidden"
                >
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-5 h-5" stroke='#B144F9' />
                  )}
                </label>
                 <input
                  id={bannerInputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
                <p className='text-sm mt-3'>Upload Course Thumbnail</p>
                </div>

        
              <button
                onClick={handleProceed}
                disabled={!canProceedStep1}
                className={`w-full py-3 rounded-full text-white font-medium transition-all ${
                  canProceedStep1
                    ? 'bg-black hover:bg-gray-800 active:scale-[0.98]'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Proceed
              </button>
            </div>
          )}

          {/* Step 2: Permissions */}
          {step === 2 && (
            <div className="space-y-3">
            

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={formData.chapterName}
                  onChange={(e) => setFormData({ ...formData, chapterName: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe the goal of this community..."
                  value={formData.chapterDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, chapterDescription: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              {/* Proceed Button */}
               <Button
                                  customClass="!w-full px-3  !h-[48px] !text-white !text-sm"
                                  type="button"
                                  onClick={handleComplete}
                                  disabled={!canProceedStep2}
                                >
Create Course
                                </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
