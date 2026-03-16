'use client';

import React from 'react';
import { Request } from '../types';
import ModalIcon from './ModalIcon';
import { CustomModal } from '@/app/components/Modal/customModal';
import Button from '@/app/components/Button';

interface AcceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest: Request | null
}

const AcceptModal: React.FC<AcceptModalProps> = ({ isOpen, onClose, selectedRequest }) => {

  if (!isOpen) return null;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}
      title='Accept Request'
      icon={<ModalIcon color='#8CF0BE' stroke='#B4F6D5' iconColor='#1A8454' />}
      subTitle='Accept this user lorem ipsum'>
      <div className="">
        <p className="text-base text-[#292A2B] mb-8">
          <span className="font-semibold">{`${selectedRequest?.firstName} ${selectedRequest?.lastName}`}</span> will be added lorem ipsum dolor lorem ipsum dolor
        </p>

        <div className="flex gap-3 w-full">
          <Button buttonType="bordered" customClass="!w-1/2 !h-[48px] !border-[#60666B] !text-[#60666B]" onClick={onClose}>
            Cancel
          </Button>
          <Button buttonType="custom" customClass="!w-1/2 !h-[48px] text-white !bg-[#1FA564]" onClick={onClose}>
            Yes, Accept
          </Button>
        </div>
      </div>

    </CustomModal>
  );
};

export default AcceptModal;
