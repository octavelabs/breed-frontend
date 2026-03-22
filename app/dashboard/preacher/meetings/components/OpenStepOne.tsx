import { Dispatch, SetStateAction } from "react";
import { CommunityMeetingFormData, OpenMeetingFormData } from "../types";
import Dropdown from "@/app/components/Dropdown";

export const OpenStepOne = ({
  formData,
  setFormData,
  handleProceed,
  canProceedStep1
}: {
  formData: OpenMeetingFormData;
  setFormData: Dispatch<SetStateAction<OpenMeetingFormData>>;
  handleProceed: () => void
  canProceedStep1: string
}) => {
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

      <button
        onClick={handleProceed}
        disabled={!canProceedStep1}
        className={`w-full py-3 rounded-full text-white font-medium transition-all 
                  ${
                    canProceedStep1
                      ? "bg-black hover:bg-gray-800 active:scale-[0.98]"
                      : "bg-gray-300 cursor-not-allowed"
                  }
                    `}
      >
        Proceed
      </button>
    </div>
  );
};
