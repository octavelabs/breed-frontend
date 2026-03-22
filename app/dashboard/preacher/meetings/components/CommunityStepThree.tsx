import Button from "@/app/components/Button";
import Dropdown from "@/app/components/Dropdown";
import { CommunityMeetingFormData } from "../types";
import { Dispatch, SetStateAction } from "react";

export const CommunityStepThree = (
    {
      formData,
      setFormData,
      handleComplete,
  canProceedStep3
    }: {
      formData: CommunityMeetingFormData;
      setFormData: Dispatch<SetStateAction<CommunityMeetingFormData>>;
      handleComplete: () => void
  canProceedStep3: string
    }
) => {
  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="duration"
          className="block text-sm font-medium  mb-[6px]"
        >
          Guests will be flagged as late after
        </label>
        <Dropdown
          value={formData.lateInterval}
          options={["5 minutes", "10 minutes", "15 minutes", "30 minutes"]}
          keySelector="interval"
          onChange={(item) => setFormData({ ...formData, lateInterval: item })}
          className="!h-[48px]"
        />
      </div>
      <div className=" bg-[#F6F8FA] rounded-[16px] p-5">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <label
              htmlFor="guidelines"
              className="text-sm font-medium text-gray-900 cursor-pointer"
            >
              Save draft recordings of meetings
            </label>
            <p className="text-xs text-gray-500 mt-0.5">
              These meetings will be recorded and a draft copy will be saved.
              You can then choose to publish the draft on Breed.{" "}
            </p>
          </div>
          <input
            type="checkbox"
            id="guidelines"
            checked={formData.saveDraftOfRecordings}
            onChange={(e) =>
              setFormData({
                ...formData,
                saveDraftOfRecordings: e.target.checked,
              })
            }
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer mt-0.5"
          />
        </div>
      </div>
      <Button
        customClass="!w-full px-3  !h-[48px] !text-white !text-sm"
        type="button"
        onClick={handleComplete}
        disabled={!canProceedStep3}
      >
        Create Meeting
      </Button>
    </div>
  );
};
