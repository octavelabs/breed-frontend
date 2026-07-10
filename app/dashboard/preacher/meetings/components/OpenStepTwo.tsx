import { Dispatch, SetStateAction } from "react";
import { Loader2 } from "lucide-react";
import { OpenMeetingFormData } from "../types";
import Input from "@/app/components/Input";
import Dropdown from "@/app/components/Dropdown";

const TIME_OPTIONS = [
  "12:00", "12:30",
  "1:00",  "1:30",
  "2:00",  "2:30",
  "3:00",  "3:30",
  "4:00",  "4:30",
  "5:00",  "5:30",
  "6:00",  "6:30",
  "7:00",  "7:30",
  "8:00",  "8:30",
  "9:00",  "9:30",
  "10:00", "10:30",
  "11:00", "11:30",
];

const TIMEZONE_OPTIONS = [
  "UTC-12:00",
  "UTC-08:00 (PST)",
  "UTC-05:00 (EST)",
  "UTC+00:00 (GMT)",
  "UTC+01:00 (WAT)",
  "UTC+05:30 (IST)",
  "UTC+08:00 (CST)",
];

export const OpenStepTwo = ({
  formData,
  setFormData,
  handleProceed,
  canProceedStep2,
  loading = false,
}: {
  formData: OpenMeetingFormData;
  setFormData: Dispatch<SetStateAction<OpenMeetingFormData>>;
  handleProceed: () => void;
  canProceedStep2: string | boolean | 0;
  loading?: boolean;
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-[6px]">Date</label>
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
          <label className="block text-sm font-medium mb-[6px]">Time</label>
          <Dropdown
            value={formData.time}
            options={TIME_OPTIONS}
            keySelector="time"
            onChange={(item) => setFormData({ ...formData, time: item })}
            className="!h-[48px]"
          />
        </div>
        <div className="w-[20%]">
          <Dropdown
            value={formData.timeFormat}
            options={["AM", "PM"]}
            keySelector="timeFormat"
            onChange={(item) => setFormData({ ...formData, timeFormat: item })}
            className="!h-[48px] mt-[26px]"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-[6px]">Time Zone</label>
        <Dropdown
          value={formData.timeZone}
          options={TIMEZONE_OPTIONS}
          keySelector="timezone"
          onChange={(item) => setFormData({ ...formData, timeZone: item })}
          className="!h-[48px]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-[6px]">Meeting frequency</label>
        <Dropdown
          value={formData.meetingFrequency}
          options={["once", "daily", "weekly", "monthly", "custom"]}
          keySelector="frequency"
          onChange={(item) => setFormData({ ...formData, meetingFrequency: item })}
          className="!h-[48px]"
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
                  className="!bg-white !border-[#B9C2CA] !w-full !h-[48px] rounded-[10px]"
                />
              </div>
              <div className="w-[50%]">
                <Dropdown
                  value={formData.repeatPattern}
                  options={["days", "weeks"]}
                  keySelector="pattern"
                  onChange={(item) => setFormData({ ...formData, repeatPattern: item })}
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
                        repeatDays: active
                          ? formData.repeatDays.filter((d) => d !== day)
                          : [...formData.repeatDays, day],
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

      <button
        onClick={handleProceed}
        disabled={!canProceedStep2 || loading}
        className={`w-full py-3 rounded-full text-white font-medium transition-all flex items-center justify-center gap-2 ${
          canProceedStep2 && !loading
            ? "bg-black hover:bg-gray-800 active:scale-[0.98]"
            : "bg-gray-300 cursor-not-allowed"
        }`}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Creating…
          </>
        ) : (
          'Proceed'
        )}
      </button>
    </div>
  );
};
