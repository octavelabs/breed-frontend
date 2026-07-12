import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CommunityMeetingFormData } from "../types";
import { communityService } from "@/lib/api-services";

export const CommunityStepOne = ({
  formData,
  setFormData,
  handleProceed,
  canProceedStep1,
  lockedCommunityName,
}: {
  formData: CommunityMeetingFormData;
  setFormData: Dispatch<SetStateAction<CommunityMeetingFormData>>;
  handleProceed: () => void;
  canProceedStep1: string | boolean;
  lockedCommunityName?: string;
}) => {
  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (lockedCommunityName) return;
    communityService.getMine().then((res: unknown) => {
      const data = (res as any)?.data ?? res;
      setCommunities(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, [lockedCommunityName]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-[6px]">
          Title
        </label>
        <input
          type="text"
          placeholder="Enter title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-[6px]">
          Community
        </label>
        {lockedCommunityName ? (
          <div className="w-full h-[48px] px-4 flex items-center border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500">
            {lockedCommunityName}
          </div>
        ) : (
          <select
            value={formData.community}
            onChange={(e) => setFormData({ ...formData, community: e.target.value })}
            className="w-full h-[48px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
          >
            <option value="">Select a community</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-[6px]">
          Meeting Audience
        </label>
        <select
          value={formData.guests}
          onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
          className="w-full h-[48px] px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
        >
          <option value="">Who can attend this meeting?</option>
          <option value="All Members">All Members</option>
          <option value="Leaders Only">Leaders Only</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          placeholder="Describe the goal of this meeting..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
        />
      </div>

      <button
        onClick={handleProceed}
        disabled={!canProceedStep1}
        className={`w-full py-3 rounded-full text-white font-medium transition-all
          ${canProceedStep1
            ? "bg-black hover:bg-gray-800 active:scale-[0.98]"
            : "bg-gray-300 cursor-not-allowed"
          }`}
      >
        Proceed
      </button>
    </div>
  );
};
