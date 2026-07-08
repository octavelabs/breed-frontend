"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import ImageUpload from "@/app/components/upload/ImageUpload";
import Button from "@/app/components/Button";
import { devotionalService } from "@/lib/api-services";

interface DevotionSettingsProps {
  seriesId: string;
}

interface SeriesForm {
  title: string;
  description: string;
  coverImageUrl: string;
}

const DevotionSettings = ({ seriesId }: DevotionSettingsProps) => {
  const [form,    setForm]    = useState<SeriesForm>({ title: "", description: "", coverImageUrl: "" });
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!seriesId) return;
    devotionalService
      .getSeriesById(seriesId)
      .then((data: any) => {
        setForm({
          title:         data?.title         ?? "",
          description:   data?.description   ?? "",
          coverImageUrl: data?.coverImageUrl ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [seriesId]);

  const set = <K extends keyof SeriesForm>(k: K, v: SeriesForm[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      setMessage({ type: "error", text: "Title is required." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await devotionalService.updateSeries(seriesId, {
        title:         form.title.trim(),
        description:   form.description.trim() || undefined,
        coverImageUrl: form.coverImageUrl       || undefined,
      });
      setMessage({ type: "success", text: "Settings saved." });
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  if (loading) {
    return (
      <div className="px-4 lg:px-10 py-6 max-w-2xl space-y-5 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40" />
        <div className="aspect-video bg-gray-200 rounded-2xl" />
        <div className="h-10 bg-gray-200 rounded-xl" />
        <div className="h-24 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-10 py-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-[#180426] mb-6">Series Settings</h2>

      {message && (
        <div
          className={`mb-5 px-4 py-2.5 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]"
              : "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Cover Image */}
        <section>
          <label className="block text-sm font-semibold text-[#180426] mb-2">Cover Image</label>
          <ImageUpload
            type="cover"
            value={form.coverImageUrl}
            onUpload={(url) => set("coverImageUrl", url)}
            aspectRatio="cover"
            hint="Recommended: 16:9 ratio, at least 1280×720px"
          />
        </section>

        {/* Title */}
        <section>
          <label className="block text-sm font-semibold text-[#180426] mb-2">
            Series Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Foundations of Faith"
            className="w-full px-4 py-2.5 border border-[#D2D9DF] rounded-xl text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10 transition-colors"
          />
        </section>

        {/* Description */}
        <section>
          <label className="block text-sm font-semibold text-[#180426] mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What is this devotional series about?"
            rows={4}
            className="w-full px-4 py-2.5 border border-[#D2D9DF] rounded-xl text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10 resize-none transition-colors"
          />
        </section>

        {/* Save */}
        <div className="pt-2 border-t border-[#F0F2F4]">
          <Button
            customClass="!w-fit px-8 !h-[44px] !text-white"
            loading={saving}
            onClick={handleSave}
          >
            <Save size={15} className="mr-1.5" /> Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DevotionSettings;
