import { useState, ChangeEvent } from 'react';
import { X, Upload, Search, Check, Plus } from 'lucide-react';
import { StepProgress } from './StepProgress';
import Button from '@/app/components/Button';

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
  onComplete?: (data: CommunityFormData) => void;
}

interface CommunityFormData {
  banner: File | null;
  name: string;
  description: string;
  isPrivate: boolean;
  onlyAdminsCanMessage: boolean;
  guidelinesAccepted: boolean;
  friends: Friend[];
}

const GUIDELINES = [
  'Lorem ipsum',
  'Lorem ipsum',
  'Lorem ipsum',
  'Lorem ipsum',
  'Lorem ipsum',
];

export const CreateCommunityModal = ({
  isOpen,
  onClose,
  onComplete,
}: CreateCommunityModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CommunityFormData>({
    banner: null,
    name: '',
    description: '',
    isPrivate: false,
    onlyAdminsCanMessage: false,
    guidelinesAccepted: false,
    friends: [
      {
        id: '1',
        name: 'Kristin Watson',
        status: 'Added you',
        avatar: '/avatar1.jpg',
        role: 'added',
      },
      {
        id: '2',
        name: 'Guy Hawkins',
        status: 'Added you',
        avatar: '/avatar2.jpg',
      },
      {
        id: '3',
        name: 'Theresa Webb',
        status: 'Added you',
        avatar: '/avatar3.jpg',
      },
      {
        id: '4',
        name: 'Floyd Miles',
        status: 'Added you',
        avatar: '/avatar4.jpg',
      },
    ],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

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

  const handleToggleFriend = (friendId: string, role: 'admin' | 'member') => {
    setFormData({
      ...formData,
      friends: formData.friends.map((friend) =>
        friend.id === friendId ? { ...friend, role } : friend
      ),
    });
  };

  const handleRemoveFriend = (friendId: string) => {
    setFormData({
      ...formData,
      friends: formData.friends.map((friend) =>
        friend.id === friendId ? { ...friend, role: undefined } : friend
      ),
    });
  };

  const canProceedStep1 = formData.name.trim() !== '' && formData.description.trim() !== '';
  const canProceedStep2 = formData.guidelinesAccepted;
  const hasSelectedFriends = formData.friends.some((f) => f.role);

  const filteredFriends = formData.friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#B9C2CA] mb-6">
          <div className="flex items-center gap-3">
            <StepProgress step={step} totalSteps={3} />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Community</h2>
              <p className="text-xs text-gray-500">
                {step === 1 && 'Provide community information'}
                {step === 2 && 'Set permissions and access'}
                {step === 3 && 'Add friends'}
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

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Banner Upload */}
              <div className="flex flex-col items-center">
                <label
                  htmlFor="banner-upload"
                  className="w-24 h-24 rounded-full border-2 border-dashed border-[#D49CFD] bg-[#FBF6FF] flex items-center justify-center cursor-pointer transition-colors overflow-hidden"
                >
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-purple-400" />
                  )}
                </label>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
                <p className="text-xs text-gray-500 mt-2">Upload Banner</p>
              </div>

              {/* Community Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              {/* Proceed Button */}
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
            <div className="space-y-5">
              {/* Make community private */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Make community private
                  </p>
                  <p className="text-xs text-gray-500">
                    Admins will have to invite new members
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isPrivate}
                    onChange={(e) =>
                      setFormData({ ...formData, isPrivate: e.target.checked })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Only admins can send message */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Only admins can send a message
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.onlyAdminsCanMessage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        onlyAdminsCanMessage: e.target.checked,
                      })
                    }
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none  rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Guidelines */}
              <div className=" bg-[#F6F8FA] rounded-[16px] p-5">
                <div className="flex items-start gap-3">
                 
                  <div className='flex-1'>
                    <label
                      htmlFor="guidelines"
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      Accept Breed's community guidelines
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      The following will serve as rules for your community
                    </p>
                  </div>
                   <input
                    type="checkbox"
                    id="guidelines"
                    checked={formData.guidelinesAccepted}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guidelinesAccepted: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer mt-0.5"
                  />
                </div>

                <ul className="mt-3 ml-7 space-y-1.5">
                  {GUIDELINES.map((guideline, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>{guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceed}
                disabled={!canProceedStep2}
                className={`w-full py-3 rounded-full text-white font-medium transition-all ${
                  canProceedStep2
                    ? 'bg-black hover:bg-gray-800 active:scale-[0.98]'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Proceed
              </button>
            </div>
          )}

          {/* Step 3: Add Friends */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Friends List */}
              <div className="space-y-6 max-h-64 overflow-y-auto">
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
                        {friend.avatar ? (
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{friend.name}</p>
                        <p className="text-xs text-gray-500">{friend.status}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {friend.role === 'added' ? (
                        <>
                        
                           <Button
                                            customClass="!w-fit px-3 !h-[32px] !text-[#5B26B1]"
                                            buttonType='bordered'
                                            type="button"
                                            onClick={() => handleRemoveFriend(friend.id)}
                                          >
                                            <p className="flex items-center gap-[6px] text-sm"><Check stroke='#5B26B1' className='w-[18px] h-[18px]' /> Added</p>
                                            
                                          </Button>
        
                             <Button
                                            customClass="!w-fit px-3 !h-[32px] !text-[#5B26B1] !bg-[#C83785]"
                                            buttonType='custom'
                                            type="button"
                                            onClick={() => handleToggleFriend(friend.id, 'admin')}
                                          >
                                            <p className="flex items-center gap-[6px] text-white text-sm"><Plus stroke='white' className='w-[18px] h-[18px]' /> Make Admin</p>
                                            
                                          </Button>
                        </>
                      ) : friend.role === 'admin' ? (
        
                         <Button
                                  customClass="!w-fit px-3 !h-[32px] !text-white"
                                  type="button"
                                  onClick={() => handleToggleFriend(friend.id, 'member')}
                                >
                                  Admin
                                </Button>
                      ) : friend.role === 'member' ? (
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="px-4 py-1.5 bg-purple-600 rounded-full text-xs font-medium text-white hover:bg-purple-700 transition-colors"
                        >
                          Add
                        </button>
                      ) : (
                       
                         <Button
                                  customClass="!w-fit px-3  !h-[32px] !text-white !text-sm"
                                  type="button"
                                  onClick={() => handleToggleFriend(friend.id, 'member')}
                                >
                                                                              <p className="flex items-center gap-[6px] text-white text-sm"><Plus stroke='white' className='w-[18px] h-[18px]' /> Add</p>

                                </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

               <Button
                                  customClass="!w-full px-3  !h-[48px] !text-white !text-sm"
                                  type="button"
                                  onClick={handleComplete}
                                >
Create Community
                                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};