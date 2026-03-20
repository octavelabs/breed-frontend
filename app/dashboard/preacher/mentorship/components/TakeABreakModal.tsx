'use client';

import React, { useState } from 'react';
import { CustomModal } from '@/app/components/Modal/customModal';
import Input from '@/app/components/Input';
import Dropdown from '@/app/components/Dropdown';
import Button from '@/app/components/Button';
import PauseIcon from './PauseIcon';

interface TakeABreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TakeABreakModal: React.FC<TakeABreakModalProps> = ({ isOpen, onClose }) => {
  const [breakPeriod, setBreakPeriod] = useState('0');
  const [timeUnit, setTimeUnit] = useState('weeks');
  const [pauseMode, setPauseMode] = useState<'pause' | 'full'>('full');
  const [informed, setInformed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Handle the break confirmation logic here
    console.log({ breakPeriod, timeUnit, pauseMode, informed });
    onClose();
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} maxWidth='!w-[640px]'
      title='Take a break'
      subTitle='You can pause new requests or temporarily stop all sessions. Taking a break helps you recharge and maintain the quality of mentorship you provide.'>
      <div>
        <div className="mt-6 mb-8 flex flex-col gap-5">
          <div className='w-full flex gap-2'>
            <div className="w-[80%]">
              <label
                htmlFor="duration"
                className="block text-sm font-medium  mb-[6px]"
              >
                Break period
              </label>
              <Input
                id='duration'
                type="number"
                onChange={() => console.log('k')}
                value=""
                placeholder=""
                variant="outlined"
                className="!bg-white !border-[#B9C2CA] !w-full !h-[48px] rounded-[10px]"
              />
            </div>
            <div className="w-[20%]">
              
              <Dropdown
                value="weeks"
                options={['days', 'weeks']}
                keySelector="interval"
                onChange={(item) => console.log(item)}
                className="!h-[48px] mt-[26px]"
              />
            </div>
          </div>
          {/* Pause Mode Options */}
          <div className="flex gap-5">
            {/* Pause New Requests */}
            <button
              onClick={() => setPauseMode('pause')}
              className={`w-full p-6 rounded-[18px] border transition-all ${pauseMode === 'pause'
                ? 'border-[#5B26B1] bg-[#FBF6FF]'
                : 'border-[#B9C2CA]'
                }`}
            >
              <div className='flex justify-between mb-6'>
                <div className={`w-[34px] h-[34px] rounded-[8px] flex items-center justify-center ${pauseMode === 'pause' ? 'bg-[#E7C8FF]' : 'bg-[#D2D9DF]'
                  }`}>
                  <PauseIcon color={pauseMode === 'pause' ? '#5B26B1' : '#60666B'} />
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${pauseMode === 'pause' ? 'border-[#5B26B1]' : 'border-[#D0D5DD]'
                  }`}>
                  {pauseMode === 'pause' && (
                    <div className="w-3 h-3 rounded-full bg-[#5B26B1]"></div>
                  )}
                </div>
              </div>
              <div className='text-left'>
                <h3 className="font-bold text-[#292A2B]">Pause new Requests</h3>
                <p className="text-sm text-[#3C3E40] mt-2">
                  New requests paused. You're still mentoring your current mentees.
                </p>
              </div>

            </button>

            <button
              onClick={() => setPauseMode('full')}
              className={`w-full p-6 rounded-[18px] border transition-all ${pauseMode === 'full'
                ? 'border-[#5B26B1] bg-[#FBF6FF]'
                : 'border-[#B9C2CA]'
                }`}
            >
              <div className='flex justify-between mb-6'>
                <div className={`w-[34px] h-[34px] rounded-[8px] flex items-center justify-center ${pauseMode === 'full' ? 'bg-[#E7C8FF]' : 'bg-[#D2D9DF]'
                  }`}>
                  <PauseIcon color={pauseMode === 'full' ? '#5B26B1' : '#60666B'} />
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${pauseMode === 'full' ? 'border-[#5B26B1]' : 'border-[#D0D5DD]'
                  }`}>
                  {pauseMode === 'full' && (
                    <div className="w-3 h-3 rounded-full bg-[#5B26B1]"></div>
                  )}
                </div>
              </div>
              <div className='text-left'>
                <h3 className="font-bold text-[#292A2B]">Full Pause Mode</h3>
                <p className="text-sm text-[#3C3E40] mt-2">
                  Temporarily stop all sessions and new requests.
                </p>
              </div>

            </button>
          </div>

          {/* Checkbox */}
          <label className="bg-[#F6F8FA] flex items-start p-5 gap-3 cursor-pointer rounded-[12px]">
            
            <span className="text-sm font-medium">
              I have informed my mentees<br />
              <span className="text-gray-600 font-normal">
                If you're currently mentoring people, please inform them before pausing. Pausing without communicating with active mentees may result in account review and possible suspension.
              </span>
            </span>
            <input
              type="checkbox"
              checked={informed}
              onChange={(e) => setInformed(e.target.checked)}
              className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
          </label>

          {/* Confirm Button */}

        </div>
        <Button
          onClick={onClose}
          customClass='w-full text-white h-[48px]'
        >
          Confirm
        </Button>
      </div>
    </CustomModal>
  );
};

export default TakeABreakModal;
