'use client';

import React from 'react';
import { Request } from '../types';
import ModalIcon from './ModalIcon';
import { CustomModal } from '@/app/components/Modal/customModal';
import Button from '@/app/components/Button';
import Dropdown from '@/app/components/Dropdown';

interface AcceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: Request | null
}

const RejectModal: React.FC<AcceptModalProps> = ({ isOpen, onClose, selectedRequest }) => {


  if (!isOpen) return null;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}
      title='Reject Request'
      icon={<ModalIcon color='#FBAFAF' stroke='#FED3D3' iconColor='#DB2929' />}
      subTitle='Reject this user lorem ipsum'>
      <div className="">
        <p className="text-base text-[#292A2B] pb-4 border-b border-dashed border-[#B9C2CA]">
          <span className="font-semibold">{`${selectedRequest?.firstName} ${selectedRequest?.lastName}`}</span> will be removed lorem ipsum dolor lorem ipsum dolor
        </p>
        <div className='mb-8 mt-4 flex flex-col gap-3'>
          <div className="">
            <label
              htmlFor="reason"
              className="block text-sm font-medium  mb-1"
            >
              Select a reason(optional)
            </label>
            <Dropdown
              value=""
              options={['daily', 'weekly']}
              keySelector="interval"
              onChange={(item) => console.log(item)}
              className="!h-[48px]"
            />
          </div>
          <div className="">
            <label
              htmlFor="message"
              className="block text-sm font-medium  mb-1"
            >
              Leave a message(optional)
            </label>
            <Dropdown
              value=""
              options={['daily', 'weekly']}
              keySelector="interval"
              onChange={(item) => console.log(item)}
              className="!h-[48px]"
            />
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <Button buttonType="bordered" customClass="!w-1/2 !h-[48px] !border-[#60666B] !text-[#60666B]" onClick={onClose}>
            Cancel
          </Button>
          <Button buttonType="custom" customClass="!w-1/2 !h-[48px] text-white !bg-[#E44E4E]" onClick={onClose}>
            Yes, Reject
          </Button>
        </div>
      </div>

    </CustomModal>
  );
};

export default RejectModal;

