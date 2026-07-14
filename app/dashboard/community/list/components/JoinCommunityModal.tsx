'use client';

import Button from "@/app/components/Button";
import { CustomModal } from "@/app/components/Modal/customModal";
import { Globe, Link2, Lock, Users } from "lucide-react";
import { useState } from "react";

interface JoinCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityName: string;
  communityId: string;
  privacy: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  guidelines: string[];
  onJoin: () => Promise<void>;
}

const PRIVACY_META: Record<string, { icon: React.ReactNode; text: string }> = {
  PUBLIC:       { icon: <Globe stroke="#870BD6" className="w-3 h-3 shrink-0" />,  text: 'This is an open community. Anyone can join.' },
  PRIVATE:      { icon: <Link2 stroke="#870BD6" className="w-3 h-3 shrink-0" />,  text: 'This is a private community. Access is granted via invite link.' },
  INVITE_ONLY:  { icon: <Lock  stroke="#870BD6" className="w-3 h-3 shrink-0" />,  text: 'This community is invite-only.' },
};

export const JoinCommunityModal = ({
  isOpen,
  onClose,
  communityName,
  privacy,
  guidelines,
  onJoin,
}: JoinCommunityModalProps) => {
  const [isGuidelinesAccepted, setIsGuidelinesAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const privacyMeta = PRIVACY_META[privacy] ?? PRIVACY_META.PUBLIC;

  const handleJoin = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onJoin();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join community.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Join Community">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium">Join &apos;{communityName}&apos;</p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2 text-sm text-[#4E5255]">
              {privacyMeta.icon}
              <p>{privacyMeta.text}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#4E5255]">
              <Users stroke="#870BD6" className="w-3 h-3 shrink-0" />
              <p>Everyone can interact in this community</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-[#F6F8FA] rounded-[16px] p-5">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <label htmlFor="accept-guidelines" className="text-sm text-[#4E5255] font-medium cursor-pointer">
                Accept Breed&apos;s community guidelines
              </label>
              <p className="text-xs text-gray-500 mt-1">The following will serve as rules for your community</p>
            </div>
            <input
              type="checkbox"
              id="accept-guidelines"
              checked={isGuidelinesAccepted}
              onChange={() => setIsGuidelinesAccepted(!isGuidelinesAccepted)}
              disabled={submitting}
              className="w-5 h-5 text-purple-600 rounded cursor-pointer mt-0.5 disabled:opacity-50"
            />
          </div>
          <ul className="ml-4 space-y-2 text-sm text-[#4E5255]">
            {guidelines.map((guideline, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="text-[#4E5255]">•</span>
                <span>{guideline}</span>
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          disabled={!isGuidelinesAccepted || submitting}
          loading={submitting}
          customClass="!w-full px-6 !h-[48px] !text-white !bg-black"
          type="button"
          onClick={handleJoin}
        >
          {submitting ? "Joining..." : "Join Community"}
        </Button>
      </div>
    </CustomModal>
  );
};
