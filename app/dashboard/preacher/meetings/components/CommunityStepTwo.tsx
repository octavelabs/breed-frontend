import { Dispatch, SetStateAction } from "react";
import { CommunityMeetingFormData } from "../types";
import Input from "@/app/components/Input";
import Dropdown from "@/app/components/Dropdown";

export const CommunityStepTwo = (
    {
      formData,
      setFormData,
       handleProceed,
  canProceedStep2
      
    }: {
      formData: CommunityMeetingFormData;
      setFormData: Dispatch<SetStateAction<CommunityMeetingFormData>>;
       handleProceed: () => void
  canProceedStep2: string| boolean | 0
    }
) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-[6px]">
          Date
        </label>
        <Input
          id="date"
          type="date"
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          value={formData.date}
          placeholder=""
          variant="outlined"
          className="!bg-white !border-[#B9C2CA] !w-full !h-[48px] rounded-[10px]"
        />
      </div>
      <div className="w-full flex gap-2">
        <div className="w-[80%]">
          <label
            htmlFor="duration"
            className="block text-sm font-medium  mb-[6px]"
          >
            Time
          </label>
          <Dropdown
            value={formData.time}
            options={[
              "6:00",
              "7:00",
              "8:00",
              "9:00",
              "10:00",
              "11:00",
              "12:00",
            ]}
            keySelector="interval"
            onChange={(item) => setFormData({ ...formData, time: item })}
            className="!h-[48px]"
          />
        </div>
        <div className="w-[20%]">
          <Dropdown
            value={formData.timeFormat}
            options={["AM", "PM"]}
            keySelector="interval"
            onChange={(item) => setFormData({ ...formData, timeFormat: item })}
            className="!h-[48px] mt-[26px]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="duration"
          className="block text-sm font-medium  mb-[6px]"
        >
          Time Zone
        </label>
        <Dropdown
          value=""
          options={[
            "UTC-12:00",
            "UTC-08:00 (PST)",
            "UTC-05:00 (EST)",
            "UTC+00:00 (GMT)",
            "UTC+01:00 (WAT)",
            "UTC+05:30 (IST)",
            "UTC+08:00 (CST)",
          ]}
          keySelector="interval"
          onChange={(item) => setFormData({ ...formData, timeZone: item })}
          className="!h-[48px]"
        />
      </div>
      <div>
        <label
          htmlFor="duration"
          className="block text-sm font-medium  mb-[6px]"
        >
          Meeting frequency
        </label>
        <Dropdown
          value={formData.meetingFrequency}
          options={["once", "daily", "weekly", "monthly", "custom"]}
          keySelector="interval"
          onChange={(item) =>
            setFormData({ ...formData, meetingFrequency: item })
          }
          className="!h-[48px]"
        />
      </div>
      {formData.meetingFrequency === "custom" && (
        <>
          <div className="border-t border-dashed border-[#B9C2CA]" />
          <div className="bg-[#F6F8FA] rounded-[12px] p-[18px]">
            <div className="w-full flex gap-2 mb-5">
              <div className="w-[50%]">
                <label
                  htmlFor="repeatInterval"
                  className="block text-sm font-medium  mb-[6px]"
                >
                  Repeats every
                </label>
                <Input
                  id="repeatInterval"
                  type="number"
                  onChange={(e) =>
                    setFormData({ ...formData, repeatInterval: e.target.value })
                  }
                  value={String(formData.repeatInterval)}
                  placeholder=""
                  variant="outlined"
                  className="!bg-white !border-[#B9C2CA] !w-full !h-[48px] rounded-[10px]"
                />
              </div>
              <div className="w-[50%]">
                <Dropdown
                  value={formData.repeatPattern}
                  options={["days", "weeks"]}
                  keySelector="interval"
                  onChange={(item) =>
                    setFormData({ ...formData, repeatPattern: item })
                  }
                  className="!h-[48px] mt-[26px]"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                const active = formData.repeatDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        repeatDays: [...formData.repeatDays, day],
                      })
                    }
                    className={`w-10 h-10 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                      active
                        ? "bg-[#870BD6] text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Description */}

      {/* Proceed Button */}
      <button
        onClick={handleProceed}
        disabled={!canProceedStep2}
        className={`w-full py-3 rounded-full text-white font-medium transition-all 
                  ${
                    canProceedStep2
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
