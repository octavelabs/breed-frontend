"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { meetingsService } from "@/lib/api-services";
import { ArrowLeft, Save } from "lucide-react";
import Button from "@/app/components/Button";
import Input from "@/app/components/Input";
import Link from "next/link";

interface MeetingDetail {
  id: string;
  title: string;
  description?: string | null;
  type: "COMMUNITY" | "OPEN";
  status: string;
  scheduledAt: string;
  duration: number;
  meetingLink?: string | null;
  platform?: string | null;
}

function toLocalDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditMeetingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    duration: 60,
    meetingLink: "",
    platform: "",
  });

  const load = useCallback(async () => {
    try {
      const data = await meetingsService.getById(id) as MeetingDetail;
      setMeeting(data);
      setForm({
        title: data.title,
        description: data.description ?? "",
        scheduledAt: toLocalDateTime(data.scheduledAt),
        duration: data.duration ?? 60,
        meetingLink: data.meetingLink ?? "",
        platform: data.platform ?? "",
      });
    } catch {
      setError("Failed to load meeting.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await meetingsService.update(id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
        duration: Number(form.duration) || 60,
        meetingLink: form.meetingLink.trim() || undefined,
        platform: form.platform.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => router.push(`/dashboard/preacher/meetings/${id}`), 800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout custom={true}>
        <div className="bg-white">
          <div className="pt-6 pb-8 px-4 lg:px-10 animate-pulse">
            <div className="w-full lg:w-[60%] space-y-4">
              <div className="h-7 bg-gray-200 rounded w-1/3" />
              <div className="h-96 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !meeting) {
    return (
      <DashboardLayout custom={true}>
        <div className="bg-white flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-gray-500">{error}</p>
          <button onClick={() => router.back()} className="text-[#870BD6] text-sm underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 lg:px-10 pt-6 pb-5 border-b border-[#F0F2F4]">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={18} className="text-[#60666B]" />
            </button>
            <div>
              <h1 className="text-[22px] lg:text-[26px] leading-tight font-bold text-[#180426]">Edit Meeting</h1>
              <div className="text-sm text-[#60666B] mt-0.5">
                <Link href="/dashboard/preacher/meetings" className="hover:text-[#870BD6]">Meetings</Link>
                <span className="mx-2">/</span>
                <Link href={`/dashboard/preacher/meetings/${id}`} className="hover:text-[#870BD6]">{meeting?.title}</Link>
                <span className="mx-2">/</span>
                <span className="text-[#180426] font-medium">Edit</span>
              </div>
            </div>
          </div>
          <Button
            buttonType="custom"
            customClass="!w-fit px-6 !h-[40px] !bg-[#870BD6] text-white"
            loading={saving}
            onClick={handleSave}
            disabled={!form.title.trim() || saved}
          >
            <Save size={15} /> {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>

        {/* Form */}
        <div className="pt-6 pb-10 px-4 lg:px-10">
          <div className="w-full lg:w-[60%] space-y-5">

            {error && (
              <div className="bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold text-[#180426]">Meeting Details</h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-[#180426] mb-1.5">Title <span className="text-red-500">*</span></label>
                <Input
                  type="text" id="title" name="title"
                  value={form.title} onChange={field("title")}
                  placeholder="Meeting title"
                  variant="outlined"
                  className="!h-[44px]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#180426] mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={field("description")}
                  placeholder="What is this meeting about?"
                  rows={4}
                  className="w-full border border-[#B9C2CA] rounded-xl px-4 py-3 text-sm text-[#180426] placeholder:text-[#B9C2CA] outline-none focus:border-[#870BD6] resize-none transition-colors"
                />
              </div>

              {/* Date/time + Duration */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#180426] mb-1.5">Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={field("scheduledAt")}
                    className="w-full border border-[#B9C2CA] rounded-xl px-4 py-3 text-sm text-[#180426] outline-none focus:border-[#870BD6] transition-colors h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#180426] mb-1.5">Duration (minutes)</label>
                  <Input
                    type="number" id="duration" name="duration"
                    value={String(form.duration)} onChange={field("duration")}
                    placeholder="60"
                    variant="outlined"
                    className="!h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6 space-y-5">
              <h2 className="font-semibold text-[#180426]">Optional Settings</h2>

              {/* Platform */}
              <div>
                <label className="block text-sm font-medium text-[#180426] mb-1.5">Platform</label>
                <Input
                  type="text" id="platform" name="platform"
                  value={form.platform} onChange={field("platform")}
                  placeholder="e.g. Breed Live, Zoom, Google Meet"
                  variant="outlined"
                  className="!h-[44px]"
                />
              </div>

              {/* Meeting link */}
              <div>
                <label className="block text-sm font-medium text-[#180426] mb-1.5">External Meeting Link</label>
                <Input
                  type="url" id="meetingLink" name="meetingLink"
                  value={form.meetingLink} onChange={field("meetingLink")}
                  placeholder="https://…"
                  variant="outlined"
                  className="!h-[44px]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                buttonType="bordered"
                customClass="!h-[44px] px-6 !border-[#60666B] !text-[#60666B]"
                onClick={() => router.back()}
              >
                Discard
              </Button>
              <Button
                buttonType="custom"
                customClass="!h-[44px] px-8 !bg-[#870BD6] text-white"
                loading={saving}
                onClick={handleSave}
                disabled={!form.title.trim() || saved}
              >
                <Save size={15} /> {saved ? "Saved!" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
