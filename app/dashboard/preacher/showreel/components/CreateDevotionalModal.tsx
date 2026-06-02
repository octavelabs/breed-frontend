'use client';

import { useState } from 'react';
import Button from '@/app/components/Button';
import { CustomModal } from '@/app/components/Modal/customModal';
import Input from '@/app/components/Input';
import TextArea from '@/app/components/TextArea';
import { devotionalService } from '@/lib/api-services';
import ImageUpload from '@/app/components/upload/ImageUpload';

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
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await devotionalService.createSeries({
        title: title.trim(),
        description: description.trim() || undefined,
        coverImageUrl: coverImageUrl || undefined,
      });
      setTitle('');
      setDescription('');
      setCoverImageUrl('');
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

        <ImageUpload
          type="cover"
          value={coverImageUrl}
          onUpload={setCoverImageUrl}
          label="Cover Image (optional)"
          hint="Recommended: 1200×675px"
          aspectRatio="cover"
        />

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
