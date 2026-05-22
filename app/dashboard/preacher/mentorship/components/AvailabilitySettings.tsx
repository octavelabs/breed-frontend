'use client';

import { useEffect, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { mentorshipService } from '@/lib/api-services';
import Button from '@/app/components/Button';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:00 ${ampm}`;
}

interface Schedule {
  days: number[];
  startHour: number;
  endHour: number;
  slotDuration: number;
  blockedDates: string[];
}

export default function AvailabilitySettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [schedule, setSchedule] = useState<Schedule>({
    days: [1, 2, 3, 4, 5],
    startHour: 9,
    endHour: 17,
    slotDuration: 60,
    blockedDates: [],
  });
  const [newBlockDate, setNewBlockDate] = useState('');

  useEffect(() => {
    mentorshipService.getMentorProfile()
      .then((profile: any) => {
        if (profile?.availabilitySchedule) {
          setSchedule({
            days: profile.availabilitySchedule.days ?? [1, 2, 3, 4, 5],
            startHour: profile.availabilitySchedule.startHour ?? 9,
            endHour: profile.availabilitySchedule.endHour ?? 17,
            slotDuration: profile.availabilitySchedule.slotDuration ?? 60,
            blockedDates: profile.availabilitySchedule.blockedDates ?? [],
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleDay = (d: number) => {
    setSchedule((s) => ({
      ...s,
      days: s.days.includes(d) ? s.days.filter((x) => x !== d) : [...s.days, d].sort(),
    }));
  };

  const addBlockedDate = () => {
    if (!newBlockDate) return;
    if (!schedule.blockedDates.includes(newBlockDate)) {
      setSchedule((s) => ({ ...s, blockedDates: [...s.blockedDates, newBlockDate].sort() }));
    }
    setNewBlockDate('');
  };

  const removeBlockedDate = (date: string) => {
    setSchedule((s) => ({ ...s, blockedDates: s.blockedDates.filter((d) => d !== date) }));
  };

  const handleSave = async () => {
    if (schedule.startHour >= schedule.endHour) {
      setError('End time must be after start time.');
      return;
    }
    if (schedule.days.length === 0) {
      setError('Select at least one available day.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await mentorshipService.updateMentorProfile({ availabilitySchedule: schedule });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save availability.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-4 lg:mx-10 space-y-3 pb-6">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="mx-4 lg:mx-10 pb-6">
      <div className="bg-white border border-[#E3E8EF] rounded-[16px] p-6 space-y-6">

        {/* Available days */}
        <div>
          <h3 className="text-sm font-semibold text-[#180426] mb-3">Available Days</h3>
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((label, i) => {
              const active = schedule.days.includes(i);
              return (
                <button
                  key={label}
                  onClick={() => toggleDay(i)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    active
                      ? 'bg-[#870BD6] text-white border-[#870BD6]'
                      : 'bg-white text-[#60666B] border-[#D2D9DF] hover:border-[#870BD6]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hours */}
        <div>
          <h3 className="text-sm font-semibold text-[#180426] mb-3">Available Hours</h3>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#60666B]">From</label>
              <select
                value={schedule.startHour}
                onChange={(e) => setSchedule((s) => ({ ...s, startHour: Number(e.target.value) }))}
                className="h-10 border border-[#D2D9DF] rounded-lg px-3 text-sm text-[#180426] focus:outline-none focus:border-[#870BD6]"
              >
                {HOURS.filter((h) => h < schedule.endHour).map((h) => (
                  <option key={h} value={h}>{formatHour(h)}</option>
                ))}
              </select>
            </div>
            <span className="text-[#60666B] mt-4">—</span>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#60666B]">To</label>
              <select
                value={schedule.endHour}
                onChange={(e) => setSchedule((s) => ({ ...s, endHour: Number(e.target.value) }))}
                className="h-10 border border-[#D2D9DF] rounded-lg px-3 text-sm text-[#180426] focus:outline-none focus:border-[#870BD6]"
              >
                {HOURS.filter((h) => h > schedule.startHour).map((h) => (
                  <option key={h} value={h}>{formatHour(h)}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#60666B]">Slot Duration</label>
              <select
                value={schedule.slotDuration}
                onChange={(e) => setSchedule((s) => ({ ...s, slotDuration: Number(e.target.value) }))}
                className="h-10 border border-[#D2D9DF] rounded-lg px-3 text-sm text-[#180426] focus:outline-none focus:border-[#870BD6]"
              >
                {[30, 45, 60, 90, 120].map((d) => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Blocked dates */}
        <div>
          <h3 className="text-sm font-semibold text-[#180426] mb-3">Block Specific Dates</h3>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="date"
              value={newBlockDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setNewBlockDate(e.target.value)}
              className="h-10 border border-[#D2D9DF] rounded-lg px-3 text-sm text-[#180426] focus:outline-none focus:border-[#870BD6]"
            />
            <button
              onClick={addBlockedDate}
              disabled={!newBlockDate}
              className="px-4 h-10 bg-[#F5EBFF] text-[#870BD6] text-sm font-medium rounded-lg hover:bg-[#EBD5FF] disabled:opacity-40 transition-colors"
            >
              Block
            </button>
          </div>
          {schedule.blockedDates.length === 0 ? (
            <p className="text-xs text-[#60666B]">No dates blocked.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {schedule.blockedDates.map((date) => (
                <div key={date} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3F2] border border-[#FECDCA] rounded-full">
                  <span className="text-xs font-medium text-[#B42318]">{date}</span>
                  <button onClick={() => removeBlockedDate(date)} className="text-[#B42318] hover:text-red-700">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex items-center gap-3">
          <Button
            buttonType="custom"
            customClass="!px-6 !h-10 !text-sm bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full"
            loading={saving}
            onClick={handleSave}
          >
            Save Availability
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-[#067647]">
              <Check size={14} /> Saved
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
