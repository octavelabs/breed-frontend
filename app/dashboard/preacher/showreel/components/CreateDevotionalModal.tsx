import { useState, ChangeEvent } from 'react';
import { X, Upload, Search, Check, Plus } from 'lucide-react';

import Button from '@/app/components/Button';
import Dropdown from '@/app/components/Dropdown';
import DropdownWithMultipleSelect from '@/app/components/Dropdown/DropdownWithMultipleSelect';
import { useDebounce } from '@/utils/useDebounce';
import { CourseCategory, CourseFormData } from '../type';
import { StepProgress } from '@/app/dashboard/community/list/components/StepProgress';
import { Modal } from '@/app/components/Modal';
import { CustomModal } from '@/app/components/Modal/customModal';
import Input from '@/app/components/Input';
import TextArea from '@/app/components/TextArea';


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



const GUIDELINES = [
  'Lorem ipsum',
  'Lorem ipsum',
  'Lorem ipsum',
  'Lorem ipsum',
  'Lorem ipsum',
];

export const CreateDevotionalModal = ({
  isOpen,
  onClose,
  onComplete,
}: CreateCommunityModalProps) => {
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
          <CustomModal isOpen={isOpen} onClose={handleComplete} title="Create Devotional" subTitle="Provide devotional information" maxWidth='!w-[520px]'>
            <div className="space-y-3">
               <div>
                      <label className="block text-sm font-medium text-gray-700 mb-[6px]">
                        Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        onChange={(e) => console.log(e.target.value)}
                        value={''}
                        placeholder=""
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
               <div>
                      <label className="block text-sm font-medium text-gray-700 mb-[6px]">
                        Date
                      </label>
                      <Input
                        id="date"
                        type="date"
                        onChange={(e) => console.log(e.target.value)}
                        value={''}
                        placeholder=""
                        variant="outlined"
                        className="!bg-white !border-[#B9C2CA] !w-full !h-[48px] rounded-[10px]"
                      />
                    </div>
            
                <div className='mx-auto w-fit'>
              <label
                  htmlFor="banner-upload"
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
                <p className='text-sm mt-3'>Upload Devotional Thumbnail</p>
                </div>
<Button
        onClick={handleComplete}
        buttonType="primary"
        customClass='!w-full !text-white'
      >
        Create
      </Button>
        
            </div>
            </CustomModal>)
};