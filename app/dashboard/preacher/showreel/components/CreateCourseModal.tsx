"use client";

import { useState, useId, ChangeEvent, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

import DropdownWithMultipleSelect from "@/app/components/Dropdown/DropdownWithMultipleSelect";
import { useDebounce } from "@/utils/useDebounce";
import { CourseCategory } from "../type";
import TextArea from "@/app/components/TextArea";
import Input from "@/app/components/Input";
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

  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CourseCategory[]>([]);
  const [searchValueCategory, setSearchValueCategory] = useState<string>("");
  const debouncedSearchValueCategory = useDebounce(searchValueCategory, 300) ?? "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on open
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

  const filteredOptions = categories.filter(
    (cat) => {
      const matchesSearch = cat.title
        .toLowerCase()
        .includes(debouncedSearchValueCategory.toLowerCase());
      const notSelected = !selectedCategories.some((s) => s.id === cat.id);
      return matchesSearch && notSelected;
    },
  );

  const handleBannerUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemove = (cat: CourseCategory) => {
    setSelectedCategories((prev) => prev.filter((v) => v.id !== cat.id));
  };

  const handleAddition = (item: CourseCategory) => {
    if (selectedCategories.some((c) => c.id === item.id)) return;
    setSelectedCategories((prev) => [...prev, item]);
  };

  const canSubmit = title.trim().length >= 3 && description.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const course = await courseService.createCourse({
        title: title.trim(),
        description: description.trim(),
        categoryId: selectedCategories[0]?.id,
        isFree: true,
      }) as { id: string };
      onCreated?.();
      onClose();
      router.push(`/dashboard/preacher/showreel/${course.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create course. Please try again.";
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
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-[#B9C2CA] mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#180426]">Create Course</h2>
            <p className="text-xs text-gray-500">Provide course information</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-8 pb-6 space-y-3">
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Category (optional)
            </label>
            <DropdownWithMultipleSelect
              value={selectedCategories}
              keySelector={["title"]}
              isFetching={false}
              className="!rounded-xl"
              searchValue={searchValueCategory}
              setSearchValue={setSearchValueCategory}
              handleRemove={handleRemove}
              displayFields={["title"]}
              onChange={(item: CourseCategory) => handleAddition(item)}
              objectOptions={filteredOptions}
              placeholder="Select category"
            />
          </div>

          <div className="mx-auto w-fit">
            <label
              htmlFor={bannerInputId}
              className="mx-auto w-[116px] h-[116px] rounded-[19px] border-2 border-dashed border-[#D49CFD] bg-[#FBF6FF] flex items-center justify-center cursor-pointer transition-colors overflow-hidden"
            >
              {bannerPreview ? (
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
            <p className="text-sm mt-3 text-center">Upload Thumbnail (optional)</p>
          </div>

          {error && (
            <p className="text-red-500 text-sm flex items-start gap-1">
              <X size={14} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`w-full py-3 rounded-full text-white font-medium transition-all ${
              canSubmit && !isSubmitting
                ? "bg-black hover:bg-gray-800 active:scale-[0.98]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Course"}
          </button>
        </div>
      </div>
    </div>
  );
};
