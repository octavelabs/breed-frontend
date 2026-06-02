'use client';

import { useEffect, useRef, useState } from 'react';
import { Video, Loader2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useUpload, VideoJobStatus, VideoUploadResult } from '@/app/hooks/useUpload';
import VideoPlayer from './VideoPlayer';

interface VideoUploadProps {
  value?: { hlsUrl: string; thumbnailUrl?: string; durationSeconds?: number } | null;
  onReady: (data: { hlsUrl: string; thumbnailUrl?: string; durationSeconds?: number }) => void;
  onClear?: () => void;
  maxGb?: number;
  className?: string;
}

type Stage = 'idle' | 'uploading' | 'processing' | 'ready' | 'failed';

const POLL_INTERVAL_MS = 5000;

export default function VideoUpload({
  value,
  onReady,
  onClear,
  maxGb = 2,
  className = '',
}: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef  = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const { upload, pollVideoStatus, uploading, progress, error, setError } = useUpload();

  const [stage, setStage]   = useState<Stage>(value ? 'ready' : 'idle');
  const [jobId, setJobId]   = useState<string | null>(null);
  const [ready, setReady]   = useState<VideoJobStatus | null>(null);
  const [fileName, setFileName] = useState('');

  // Stop polling on unmount
  useEffect(() => () => clearInterval(pollRef.current), []);

  const startPolling = (id: string) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const status = await pollVideoStatus(id);
        if (status.status === 'READY') {
          clearInterval(pollRef.current);
          setStage('ready');
          setReady(status);
          onReady({ hlsUrl: status.hlsUrl!, thumbnailUrl: status.thumbnailUrl, durationSeconds: status.durationSeconds });
        } else if (status.status === 'FAILED') {
          clearInterval(pollRef.current);
          setStage('failed');
          setError('Video processing failed. Please try again.');
        }
      } catch { /* keep polling */ }
    }, POLL_INTERVAL_MS);
  };

  const handleFile = async (file: File) => {
    setError(null);
    setStage('idle');

    if (file.size > maxGb * 1024 * 1024 * 1024) {
      setError(`File too large. Max ${maxGb}GB.`);
      return;
    }
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file.');
      return;
    }

    setFileName(file.name);
    setStage('uploading');

    try {
      const result = await upload(file, 'video') as VideoUploadResult;
      setJobId(result.jobId);
      setStage('processing');
      startPolling(result.jobId);
    } catch {
      setStage('failed');
    }
  };

  const clear = () => {
    clearInterval(pollRef.current);
    setStage('idle');
    setJobId(null);
    setReady(null);
    setFileName('');
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    onClear?.();
  };

  // ── Ready state — show player ─────────────────────────────────────────────
  if (stage === 'ready' && (ready?.hlsUrl || value?.hlsUrl)) {
    const hlsUrl = ready?.hlsUrl ?? value!.hlsUrl;
    const thumb  = ready?.thumbnailUrl ?? value?.thumbnailUrl;
    return (
      <div className={`space-y-2 ${className}`}>
        <VideoPlayer src={hlsUrl} poster={thumb} />
        <button
          onClick={clear}
          className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
        >
          <X size={12} /> Remove video
        </button>
      </div>
    );
  }

  // ── Upload / processing state ─────────────────────────────────────────────
  if (stage === 'uploading' || stage === 'processing') {
    return (
      <div className={`rounded-2xl border border-[#D2D9DF] bg-[#FAFBFC] p-6 flex flex-col items-center gap-4 ${className}`}>
        <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
          <Loader2 size={22} className="text-[#870BD6] animate-spin" />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-[#180426]">
            {stage === 'uploading' ? 'Uploading…' : 'Processing video…'}
          </p>
          <p className="text-xs text-[#60666B] mt-0.5 max-w-xs">
            {stage === 'uploading'
              ? `${progress}% — ${fileName}`
              : 'Transcoding to HLS (1080p / 720p / 480p). This takes 1–3 minutes.'}
          </p>
        </div>

        {stage === 'uploading' && (
          <div className="w-full max-w-xs h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#870BD6] rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {stage === 'processing' && (
          <div className="flex items-center gap-1.5 text-xs text-[#60666B]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#870BD6] animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#870BD6] animate-pulse [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#870BD6] animate-pulse [animation-delay:0.4s]" />
          </div>
        )}

        <button onClick={clear} className="text-xs text-[#60666B] hover:text-red-500 transition-colors">
          Cancel
        </button>
      </div>
    );
  }

  // ── Failed state ──────────────────────────────────────────────────────────
  if (stage === 'failed') {
    return (
      <div className={`rounded-2xl border border-red-200 bg-red-50 p-6 flex flex-col items-center gap-3 ${className}`}>
        <AlertCircle size={28} className="text-red-400" />
        <p className="text-sm font-semibold text-red-700">Video processing failed</p>
        <p className="text-xs text-red-500 text-center">{error ?? 'An unexpected error occurred.'}</p>
        <button
          onClick={clear}
          className="text-xs font-semibold text-[#870BD6] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Idle — drop zone ──────────────────────────────────────────────────────
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-2xl border-2 border-dashed border-[#D2D9DF] hover:border-[#870BD6] bg-[#FAFBFC] hover:bg-[#F5EBFF]/30 transition-colors cursor-pointer p-8 flex flex-col items-center gap-3 group"
      >
        <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#F5EBFF] flex items-center justify-center transition-colors">
          <Video size={22} className="text-gray-400 group-hover:text-[#870BD6] transition-colors" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[#180426]">Click or drag to upload video</p>
          <p className="text-xs text-[#60666B] mt-1">MP4, MOV, AVI, MKV — max {maxGb}GB</p>
          <p className="text-xs text-[#B9C2CA] mt-0.5">Transcoded to HLS for adaptive streaming</p>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
