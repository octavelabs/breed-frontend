'use client'

import Button from "@/app/components/Button";
import { CustomModal } from "@/app/components/Modal/customModal";
import { Globe, Users } from "lucide-react";
import { useState } from "react";

interface JoinCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityName: string;
  guidelines: string[];

}

export const JoinCommunityModal = ({
  isOpen,
  onClose,
  communityName,
  guidelines,
  

}: JoinCommunityModalProps) => {
    const [isGuidelinesAccepted, setIsGuidelinesAccepted] = useState(false);

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Join Community">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium">
            Join '{communityName}'
          </p>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2 text-sm text-[#4E5255]">
              <Globe stroke='#870BD6' className="w-3 h-3" />
              <p>This is an open community. Anyone can join this community.</p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-[#4E5255]">
              <Users stroke='#870BD6'className="w-3 h-3" />
              <p>Everyone can interact in this community</p>
            </div>
          </div>
        </div>

        {/* Guidelines Section */}
        <div className="space-y-3 bg-[#F6F8FA] rounded-[16px] p-5">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <label 
                htmlFor="accept-guidelines" 
                className="text-sm text-[#4E5255] font-medium cursor-pointer"
              >
                Accept Breed's community guidelines
              </label>
              <p className="text-xs text-gray-500 mt-1">
                The following will serve as rules for your community
              </p>
            </div>
             <input
              type="checkbox"
              id="accept-guidelines"
              checked={isGuidelinesAccepted}
              onChange={() => setIsGuidelinesAccepted(!isGuidelinesAccepted)}
              className="w-5 h-5 text-purple-600  rounded cursor-pointer mt-0.5"
            />
          </div>

          {/* Guidelines List */}
          <ul className="ml-4 space-y-2 text-sm text-[#4E5255]">
            {guidelines.map((guideline, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-[#4E5255]">•</span>
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </div>
        <Button
        disabled={!isGuidelinesAccepted}
                  customClass="!w-full px-6 !h-[48px] !text-white !bg-black"
                  type="button"
                  onClick={onClose}
                >
                  Join   
                </Button>
      </div>
    </CustomModal>
  );
};