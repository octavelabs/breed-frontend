"use client";

import { useState, useId, ChangeEvent, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

import DropdownWithMultipleSelect from "@/app/components/Dropdown/DropdownWithMultipleSelect";
import { useDebounce } from "@/utils/useDebounce";
import { CourseCategory } from "../type";
import { StepProgress } from "@/app/dashboard/community/list/components/StepProgress";
import TextArea from "@/app/components/TextArea";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import { courseService } from "@/lib/api-services";

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const CreateCourseModal = ({
  isOpen,
  onClose,
  onCreated,
}: CreateCourseModalProps) => {
  const bannerInputId = useId();
  const router = useRouter();

  const [step, setStep] = useState(1);

  // Step 1 state
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CourseCategory[]>([]);
  const [searchValueCategory, setSearchValueCategory] = useState<string>("");
  const debouncedSearchValueCategory = useDebounce(searchValueCategory, 300) ?? "";
  const [title, setTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [level, setLevel] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");

  // Step 2 state
  const [chapterName, setChapterName] = useState("");
  const [chapterDescription, setChapterDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories when modal opens
  useEffect(() => {
    if (!isOpen) return;
    courseService
      .getCategories()
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [];
        setCategories(
          list.map((c: unknown) => {
            const cat = c as { id: string; name?: string; title?: string };
            return { id: cat.id, title: cat.name ?? cat.title ?? "" };
          }),
        );
      })
      .catch(() => setCategories([]));
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredOptions = categories.filter((cat) => {
    const matchesSearch = cat.title
      .toLowerCase()
      .includes(debouncedSearchValueCategory.toLowerCase());
    const notSelected = !selectedCategories.some((s) => s.id === cat.id);
    return matchesSearch && notSelected;
  });

  const handleBannerUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveCategory = (cat: CourseCategory) => {
    setSelectedCategories((prev) => prev.filter((v) => v.id !== cat.id));
  };

  const handleAddCategory = (item: CourseCategory) => {
    if (selectedCategories.some((c) => c.id === item.id)) return;
    setSelectedCategories((prev) => [...prev, item]);
  };

  // Step 1 can proceed when title + description are filled; banner and category are optional
  const canProceedStep1 =
    title.trim().length >= 3 && courseDescription.trim().length >= 10;

  // Step 2 can submit when chapter name is filled
  const canSubmitStep2 = chapterName.trim().length > 0;

  const handleProceed = () => {
    if (canProceedStep1) setStep(2);
  };

  const handleCreate = async () => {
    if (!canSubmitStep2 || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const course = (await courseService.createCourse({
        title: title.trim(),
        description: courseDescription.trim(),
        categoryId: selectedCategories[0]?.id,
        level,
        isFree: true,
      })) as { id: string };
      onCreated?.();
      onClose();
      const qs = chapterName.trim()
        ? `?chapterName=${encodeURIComponent(chapterName.trim())}`
        : "";
      router.push(`/dashboard/preacher/showreel/${course.id}${qs}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create course. Please try again.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#B9C2CA] mb-6">
          <div className="flex items-center gap-3">
            <StepProgress step={step} totalSteps={2} />
            <div>
              <h2 className="text-lg font-bold text-[#180426]">Create Course</h2>
              <p className="text-xs text-gray-500">
                {step === 1
                  ? "Provide course information"
                  : "Chapters will contain info the lesson contain"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-8 pb-6">
          {/* ── Step 1: Course Info ── */}
          {step === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course title
                </label>
                <Input
                  id="course-title"
                  type="text"
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  placeholder="Enter title"
                  variant="outlined"
                  className="!bg-white !w-full !h-[48px] rounded-[10px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <TextArea
                  placeholder="Enter description"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Level picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course level
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      { label: "Foundational", value: "BEGINNER" },
                      { label: "Intermediate", value: "INTERMEDIATE" },
                      { label: "Advanced", value: "ADVANCED" },
                    ] as const
                  ).map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLevel(value)}
                      className={`flex-1 py-2 rounded-full text-sm font-medium border transition-all ${
                        level === value
                          ? "bg-[#180426] text-white border-[#180426]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Select one or more categories that fit your course content
                </label>
                <DropdownWithMultipleSelect
                  value={selectedCategories}
                  keySelector={["title"]}
                  isFetching={false}
                  className="!rounded-xl"
                  searchValue={searchValueCategory}
                  setSearchValue={setSearchValueCategory}
                  handleRemove={handleRemoveCategory}
                  displayFields={["title"]}
                  onChange={(item: CourseCategory) => handleAddCategory(item)}
                  objectOptions={filteredOptions}
                  placeholder="To"
                />
              </div>

              <div className="mx-auto w-fit">
                <label
                  htmlFor={bannerInputId}
                  className="mx-auto w-[116px] h-[116px] rounded-[19px] border-2 border-dashed border-[#D49CFD] bg-[#FBF6FF] flex items-center justify-center cursor-pointer transition-colors overflow-hidden"
                >
                  {bannerPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-5 h-5" stroke="#B144F9" />
                  )}
                </label>
                <input
                  id={bannerInputId}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerUpload}
                />
                <p className="text-sm mt-3 text-center">Upload Course Thumbnail</p>
              </div>

              <button
                onClick={handleProceed}
                disabled={!canProceedStep1}
                className={`w-full py-3 rounded-full text-white font-medium transition-all ${
                  canProceedStep1
                    ? "bg-black hover:bg-gray-800 active:scale-[0.98]"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Proceed
              </button>
            </div>
          )}

          {/* ── Step 2: Initial Chapter ── */}
          {step === 2 && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe the goal of this chapter..."
                  value={chapterDescription}
                  onChange={(e) => setChapterDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm flex items-start gap-1">
                  <X size={14} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              <Button
                customClass="!w-full px-3 !h-[48px] !text-white !text-sm"
                type="button"
                onClick={handleCreate}
                disabled={!canSubmitStep2 || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Course"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
