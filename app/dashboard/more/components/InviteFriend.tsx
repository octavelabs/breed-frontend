"use client";

import { useState } from "react";
import { ArrowLeft, Copy, Check, Share2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const InviteFriend = ({
  setShowSelectedTab,
}: {
  setShowSelectedTab: (val: boolean) => void;
}) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.username ?? user?.id ?? "breed";
  const inviteLink = `https://joinbreed.com/signup?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback for older browsers
      const el = document.createElement("input");
      el.value = inviteLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join Breed",
        text: "Come grow in faith with me on Breed — a platform for spiritual growth, courses, and community.",
        url: inviteLink,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <ArrowLeft
        className="lg:hidden mb-4 cursor-pointer"
        stroke="#60666B"
        onClick={() => setShowSelectedTab(false)}
      />
      <h2 className="text-2xl font-bold mb-2">Invite a Friend</h2>
      <p className="text-sm text-[#60666B] mb-8">
        Share Breed with someone you care about and grow in faith together.
      </p>

      <div className="w-full lg:w-[40%] space-y-6">
        {/* Illustration / banner */}
        <div className="w-full rounded-2xl bg-linear-to-br from-[#A967F1] to-[#5B26B1] p-6 text-white text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <p className="font-bold text-lg mb-1">Grow together</p>
          <p className="text-sm text-white/80">
            Invite your friends to Breed and build your spiritual community.
          </p>
        </div>

        {/* Referral link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Your invite link
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 border border-[#E2E3E5] rounded-xl px-4 py-3 text-sm text-[#60666B] bg-gray-50 truncate select-all">
              {inviteLink}
            </div>
            <button
              onClick={handleCopy}
              className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border border-[#D49CFD] bg-[#F5EBFF] text-[#870BD6] text-sm font-semibold hover:bg-[#EDD9FF] transition-colors cursor-pointer"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="w-full h-14 rounded-full font-semibold text-sm text-white bg-linear-to-b from-[#A967F1] to-[#5B26B1] hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
        >
          <Share2 size={16} />
          Share Invite
        </button>
      </div>
    </>
  );
};

export default InviteFriend;
