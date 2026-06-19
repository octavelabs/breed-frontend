'use client';

import { useState, useCallback } from 'react';
import { getAccessToken } from '@/lib/api';

export type UploadType = 'avatar' | 'cover' | 'community' | 'content' | 'attachment' | 'video';

export interface UploadResult {
  url: string;
  key: string;
  type: UploadType;
  mimeType: string;
  size: number;
}

export interface VideoUploadResult {
  jobId?: string;
  rawKey: string;
  rawUrl?: string;
  status: 'PROCESSING' | 'READY';
  hlsUrl?: string;
  thumbnailUrl?: string;
}

export interface VideoJobStatus {
  jobId: string;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  hlsUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState<string | null>(null);

  const upload = useCallback(async (
    file: File,
    type: UploadType,
  ): Promise<UploadResult | VideoUploadResult> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      });

      xhr.addEventListener('load', () => {
        setUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            setProgress(100);
            resolve(res.data);
          } catch {
            const msg = 'Invalid response from server';
            setError(msg);
            reject(new Error(msg));
          }
        } else {
          let msg = `Upload failed (${xhr.status})`;
          try { msg = JSON.parse(xhr.responseText)?.message ?? msg; } catch {}
          setError(msg);
          reject(new Error(msg));
        }
      });

      xhr.addEventListener('error', () => {
        setUploading(false);
        const msg = 'Network error during upload';
        setError(msg);
        reject(new Error(msg));
      });

      xhr.addEventListener('abort', () => {
        setUploading(false);
        const msg = 'Upload cancelled';
        setError(msg);
        reject(new Error(msg));
      });

      xhr.open('POST', `${BASE_URL}/upload?type=${type}`);
      const token = getAccessToken();
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  }, []);

  const pollVideoStatus = useCallback(async (jobId: string): Promise<VideoJobStatus> => {
    const token = getAccessToken();
    const res = await fetch(`${BASE_URL}/upload/video/${jobId}/status`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error('Failed to fetch video status');
    const json = await res.json();
    // Global interceptor wraps as { data: ... }; the actual status is in json.data
    return (json.data ?? json) as VideoJobStatus;
  }, []);

  return { upload, pollVideoStatus, uploading, progress, error, setError };
}
