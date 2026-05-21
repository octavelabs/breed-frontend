"use client";

import { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import Button from "@/app/components/Button";
import { mentorshipService } from "@/lib/api-services";

interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatarUrl?: string | null;
  mentorProfile?: { specializations?: string[] } | null;
}

interface Props {
  mentor: Mentor;
  onClose: (refreshNeeded?: boolean) => void;
}

const MIN_LENGTH = 10;

export function RequestMentorshipModal({ mentor, onClose }: Props) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initials = `${mentor.firstName[0]}${mentor.lastName[0]}`.toUpperCase();
  const canSubmit = message.trim().length >= MIN_LENGTH;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await mentorshipService.requestMentorship(mentor.id, message.trim());
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => onClose(success)}
    >
      <div
        className="w-full max-w-md bg-white rounded-[20px] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {mentor.avatarUrl ? (
              <img src={mentor.avatarUrl} alt={mentor.firstName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm">
                {initials}
              </div>
            )}
            <div>
              <p className="font-bold text-[#180426] leading-tight">{mentor.firstName} {mentor.lastName}</p>
              {mentor.username && <p className="text-xs text-[#60666B]">@{mentor.username}</p>}
            </div>
          </div>
          <button onClick={() => onClose(success)} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {success ? (
          <div className="p-8 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#D6FBE9] border-[6px] border-[#ECFDF3] flex items-center justify-center">
              <CheckCircle size={28} className="text-[#1A8454]" />
            </div>
            <h2 className="text-xl font-bold text-[#180426]">Request Sent!</h2>
            <p className="text-sm text-[#60666B]">
              Your mentorship request has been sent to{" "}
              <span className="font-semibold text-[#180426]">{mentor.firstName}</span>.
              You'll be notified once they respond.
            </p>
            {mentor.mentorProfile?.specializations?.length ? (
              <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                {mentor.mentorProfile.specializations.slice(0, 4).map((s) => (
                  <span key={s} className="text-xs bg-[#F5EBFF] text-[#870BD6] px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            ) : null}
            <Button onClick={() => onClose(true)} customClass="!w-full !text-white mt-2">
              Done
            </Button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <p className="text-[17px] font-bold text-[#180426]">Request Mentorship</p>
              <p className="text-sm text-[#60666B] mt-0.5">
                Introduce yourself and tell {mentor.firstName} what you're hoping to grow in.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#180426] mb-1.5">
                Your message
                <span className="ml-1 text-[#60666B] font-normal">({MIN_LENGTH}–500 characters)</span>
              </label>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                placeholder={`e.g. "Hi ${mentor.firstName}, I'm looking for a mentor to help me grow in my prayer life and understanding of Scripture…"`}
                className="w-full border border-[#B9C2CA] rounded-[10px] px-4 py-3 text-sm text-[#180426] placeholder:text-[#B9C2CA] resize-none focus:outline-none focus:border-[#870BD6] focus:ring-1 focus:ring-[#870BD6]"
              />
              <p className="text-xs text-[#60666B] text-right mt-1">{message.length}/500</p>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button
                buttonType="bordered"
                customClass="!w-1/2 !h-[48px] !border-[#60666B] !text-[#60666B]"
                onClick={() => onClose()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                customClass="!w-1/2 !h-[48px] !text-white"
                loading={loading}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Send Request
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
