'use client';

import { useState, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import Button from '@/app/components/Button';
import { CustomModal } from '@/app/components/Modal/customModal';
import Input from '@/app/components/Input';
import TextArea from '@/app/components/TextArea';
import { devotionalService } from '@/lib/api-services';

interface CreateDevotionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export const CreateDevotionalModal = ({
  isOpen,
  onClose,
  onCreated,
}: CreateDevotionalModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleBannerUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setBannerPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await devotionalService.createSeries({
        title: title.trim(),
        description: description.trim() || undefined,
        coverImageUrl: bannerPreview ?? undefined,
      });
      setTitle('');
      setDescription('');
      setBannerPreview(null);
      onCreated?.();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Devotional"
      subTitle="Provide devotional information"
      maxWidth="!w-[520px]"
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
          <Input
            id="devotional-title"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            placeholder="e.g. Rise Devotional"
            variant="outlined"
            className="bg-white! w-full! h-12! rounded-[10px]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
          <TextArea
            placeholder="What is this devotional about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="mx-auto w-fit">
          <label
            htmlFor="devotional-banner-upload"
            className="mx-auto w-29 h-29 rounded-[19px] border-2 border-dashed border-[#D49CFD] bg-[#FBF6FF] flex items-center justify-center cursor-pointer transition-colors overflow-hidden"
          >
            {bannerPreview ? (
              <img src={bannerPreview} alt="Cover preview" className="w-full h-full object-cover" />
            ) : (
              <Upload className="w-5 h-5" stroke="#B144F9" />
            )}
          </label>
          <input
            id="devotional-banner-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerUpload}
          />
          <p className="text-sm mt-3 text-center">Upload Cover Image</p>
        </div>

        <Button
          onClick={handleCreate}
          buttonType="primary"
          disabled={!title.trim()}
          loading={submitting}
          customClass="!w-full !text-white"
        >
          Create
        </Button>
      </div>
    </CustomModal>
  );
};
