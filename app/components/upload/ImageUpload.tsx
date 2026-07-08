'use client';

import { useRef, useState } from 'react';
import { ImageIcon, Loader2, X } from 'lucide-react';
import { useUpload, UploadType } from '@/app/hooks/useUpload';

interface ImageUploadProps {
  type: UploadType;
  value?: string;               // current image URL (for preview)
  onUpload: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  label?: string;
  hint?: string;
  aspectRatio?: 'square' | 'cover' | 'banner'; // square=1:1, cover=16:9, banner=3:1
  maxMb?: number;
  className?: string;
}

const ASPECT: Record<string, string> = {
  square: 'aspect-square',
  cover:  'aspect-video',
  banner: 'aspect-[3/1]',
};

export default function ImageUpload({
  type,
  value,
  onUpload,
  onUploadingChange,
  label,
  hint,
  aspectRatio = 'cover',
  maxMb = 5,
  className = '',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const { upload, uploading, progress, error, setError } = useUpload();

  const handleFile = async (file: File) => {
    setError(null);

    if (file.size > maxMb * 1024 * 1024) {
      setError(`File too large. Max ${maxMb}MB.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    onUploadingChange?.(true);
    try {
      const result = await upload(file, type) as { url: string };
      onUpload(result.url);
    } catch (e: unknown) {
      setPreview(value ?? null);
    } finally {
      onUploadingChange?.(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onUpload('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <p className="text-xs font-semibold text-gray-600">{label}</p>}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`relative ${ASPECT[aspectRatio]} w-full rounded-2xl overflow-hidden border-2 border-dashed transition-colors cursor-pointer group
          ${error ? 'border-red-300 bg-red-50' : 'border-[#D2D9DF] hover:border-[#870BD6] bg-[#FAFBFC] hover:bg-[#F5EBFF]/30'}`}
      >
        {/* Preview image */}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 z-10">
            <Loader2 size={24} className="text-white animate-spin" />
            <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-white text-xs">{progress}%</p>
          </div>
        )}

        {/* Placeholder */}
        {!preview && !uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#B9C2CA] group-hover:text-[#870BD6] transition-colors">
            <ImageIcon size={28} />
            <p className="text-xs font-medium">Click or drag to upload</p>
          </div>
        )}

        {/* Remove button */}
        {preview && !uploading && (
          <button
            onClick={clear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
          >
            <X size={14} />
          </button>
        )}

        {/* Hover overlay on existing image */}
        {preview && !uploading && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <p className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Click to change
            </p>
          </div>
        )}
      </div>

      {/* Progress bar (outside the box) */}
      {uploading && (
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#870BD6] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-[#60666B]">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
