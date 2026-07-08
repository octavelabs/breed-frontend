"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Save, Tag, X } from "lucide-react";
import ImageUpload from "@/app/components/upload/ImageUpload";
import Button from "@/app/components/Button";
import { courseService } from "@/lib/api-services";

interface CourseSettings {
  title: string;
  description: string;
  coverImageUrl: string;
  level: string;
  isFree: boolean;
  tags: string[];
}

const LEVELS = [
  { value: "BEGINNER",     label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED",     label: "Advanced" },
];

const SettingsContent = ({
  course,
  onUpdate,
}: {
  course: { title?: string; description?: string; coverImageUrl?: string | null; level?: string; isFree?: boolean; tags?: string[] } | null;
  onUpdate: () => void;
}) => {
  const params  = useParams();
  const courseId = params.courseId as string;

  const [form, setForm] = useState<CourseSettings>({
    title:        "",
    description:  "",
    coverImageUrl: "",
    level:        "BEGINNER",
    isFree:       true,
    tags:         [],
  });
  const [tagInput,  setTagInput]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [message,   setMessage]   = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!course) return;
    setForm({
      title:         course.title        ?? "",
      description:   course.description  ?? "",
      coverImageUrl: course.coverImageUrl ?? "",
      level:         course.level        ?? "BEGINNER",
      isFree:        course.isFree       ?? true,
      tags:          course.tags         ?? [],
    });
  }, [course]);

  const set = <K extends keyof CourseSettings>(k: K, v: CourseSettings[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => set("tags", form.tags.filter((x) => x !== t));

  const handleSave = async () => {
    if (!form.title.trim()) {
      setMessage({ type: "error", text: "Title is required." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await courseService.updateCourse(courseId, {
        title:         form.title.trim(),
        description:   form.description.trim() || undefined,
        coverImageUrl: form.coverImageUrl       || undefined,
        level:         form.level,
        isFree:        form.isFree,
        tags:          form.tags,
      });
      setMessage({ type: "success", text: "Settings saved." });
      onUpdate();
    } catch (err: unknown) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to save." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3500);
    }
  };

  return (
    <div className="px-4 lg:px-10 py-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-[#180426] mb-6">Course Settings</h2>

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
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Faith That Moves Mountains"
            className="w-full px-4 py-2.5 border border-[#D2D9DF] rounded-xl text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10 transition-colors"
          />
        </section>

        {/* Description */}
        <section>
          <label className="block text-sm font-semibold text-[#180426] mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Describe what learners will get from this course…"
            rows={4}
            className="w-full px-4 py-2.5 border border-[#D2D9DF] rounded-xl text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10 resize-none transition-colors"
          />
        </section>

        {/* Level + Price row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <section>
            <label className="block text-sm font-semibold text-[#180426] mb-2">Level</label>
            <select
              value={form.level}
              onChange={(e) => set("level", e.target.value)}
              className="w-full px-4 py-2.5 border border-[#D2D9DF] rounded-xl text-sm focus:outline-none focus:border-[#870BD6] bg-white transition-colors"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </section>

          <section>
            <label className="block text-sm font-semibold text-[#180426] mb-2">Pricing</label>
            <div className="flex items-center gap-3 mt-0.5 h-[42px]">
              <label className="relative inline-flex items-center cursor-pointer gap-3 select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.isFree}
                  onChange={(e) => set("isFree", e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#870BD6]" />
                <span className="text-sm text-[#4E5255]">{form.isFree ? "Free" : "Paid"}</span>
              </label>
            </div>
          </section>
        </div>

        {/* Tags */}
        <section>
          <label className="block text-sm font-semibold text-[#180426] mb-2">Tags</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="Add a tag and press Enter"
              className="flex-1 px-4 py-2.5 border border-[#D2D9DF] rounded-xl text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10 transition-colors"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2.5 bg-[#F5EBFF] text-[#870BD6] rounded-xl text-sm font-semibold hover:bg-[#ECD9FF] transition-colors flex items-center gap-1.5"
            >
              <Tag size={14} /> Add
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.tags.map((t) => (
                <span key={t} className="flex items-center gap-1.5 bg-[#F5EBFF] text-[#870BD6] text-xs font-medium px-3 py-1.5 rounded-full">
                  {t}
                  <button onClick={() => removeTag(t)} className="hover:text-[#5B26B1]">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
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

export default SettingsContent;
