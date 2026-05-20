import { Dispatch, SetStateAction } from "react";
import { CommunityMeetingFormData } from "../types";
import Input from "@/app/components/Input";
import Dropdown from "@/app/components/Dropdown";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

const selectCls =
  "w-full h-[48px] border border-[#B9C2CA] rounded-[10px] px-3 text-sm text-[#60666B] bg-white outline-none focus:border-[#870BD6] transition-colors cursor-pointer appearance-none";

export const CommunityStepTwo = ({
  formData,
  setFormData,
  handleProceed,
  canProceedStep2,
}: {
  formData: CommunityMeetingFormData;
  setFormData: Dispatch<SetStateAction<CommunityMeetingFormData>>;
  handleProceed: () => void;
  canProceedStep2: string | boolean | 0;
}) => {
  return (
    <div className="space-y-3">
      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-[6px]">Date</label>
        <Input
          id="date"
          type="date"
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          value={formData.date}
          placeholder=""
          variant="outlined"
          className="!bg-white !border-[#B9C2CA] !w-full !h-[48px] rounded-[10px] cursor-pointer"
        />
      </div>

      {/* Time — hour : minute  AM/PM */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-[6px]">Time</label>
        <div className="flex items-center gap-2">
          {/* Hour */}
          <div className="relative flex-1">
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className={selectCls}
            >
              <option value="" disabled>HH</option>
              {HOURS.map((h) => (
                <option key={h} value={h}>{h.padStart(2, "0")}</option>
              ))}
            </select>
          </div>

          <span className="text-[#60666B] font-semibold text-lg">:</span>

          {/* Minute */}
          <div className="relative flex-1">
            <select
              value={formData.timeMinute}
              onChange={(e) => setFormData({ ...formData, timeMinute: e.target.value })}
              className={selectCls}
            >
              <option value="" disabled>MM</option>
              {MINUTES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* AM / PM */}
          <div className="w-[90px]">
            <Dropdown
              value={formData.timeFormat}
              options={["AM", "PM"]}
              keySelector="interval"
              onChange={(item) => setFormData({ ...formData, timeFormat: item })}
              className="!h-[48px] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Meeting frequency */}
      <div>
        <label className="block text-sm font-medium mb-[6px]">Meeting frequency</label>
        <Dropdown
          value={formData.meetingFrequency}
          options={["once", "daily", "weekly", "monthly", "custom"]}
          keySelector="interval"
          onChange={(item) => setFormData({ ...formData, meetingFrequency: item })}
          className="!h-[48px] cursor-pointer"
        />
      </div>

      {formData.meetingFrequency === "custom" && (
        <>
          <div className="border-t border-dashed border-[#B9C2CA]" />
          <div className="bg-[#F6F8FA] rounded-[12px] p-[18px]">
            <div className="w-full flex gap-2 mb-5">
              <div className="w-[50%]">
                <label className="block text-sm font-medium mb-[6px]">Repeats every</label>
                <Input
                  id="repeatInterval"
                  type="number"
                  onChange={(e) => setFormData({ ...formData, repeatInterval: e.target.value })}
                  value={String(formData.repeatInterval)}
                  placeholder=""
                  variant="outlined"
                  className="!bg-white !border-[#B9C2CA] !w-full !h-[48px] rounded-[10px] cursor-pointer"
                />
              </div>
              <div className="w-[50%]">
                <Dropdown
                  value={formData.repeatPattern}
                  options={["days", "weeks"]}
                  keySelector="interval"
                  onChange={(item) => setFormData({ ...formData, repeatPattern: item })}
                  className="!h-[48px] mt-[26px] cursor-pointer"
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
                        repeatDays: active
                          ? formData.repeatDays.filter((d) => d !== day)
                          : [...formData.repeatDays, day],
                      })
                    }
                    className={`w-10 h-10 rounded-full text-xs font-medium transition-colors flex-shrink-0 cursor-pointer ${
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

      <button
        onClick={handleProceed}
        disabled={!canProceedStep2}
        className={`w-full py-3 rounded-full text-white font-medium transition-all ${
          canProceedStep2
            ? "bg-black hover:bg-gray-800 active:scale-[0.98] cursor-pointer"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        Proceed
      </button>
    </div>
  );
};
