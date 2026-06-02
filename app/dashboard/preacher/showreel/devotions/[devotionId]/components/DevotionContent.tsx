'use client';

import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  Plus, Trash2, Image as ImageIcon, Video, Code, Check, Loader2, X, BookOpen,
} from 'lucide-react';

// ── Publish Success Modal ─────────────────────────────────────────────────────

const PublishSuccessModal = ({ onClose }: { onClose: () => void }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-sm bg-white rounded-[20px] shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="w-11.5 h-11.5 rounded-full bg-[#B4F6D5] border-[6px] border-[#D6FBE9] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#1A8454" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold mt-4">Article Published!</h2>
            <p className="text-sm text-[#60666B] mt-1">
              Your article is now live and visible to your subscribers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm text-[#60666B] mb-6">
          Subscribers to this devotional series will be able to read the article in their feed.
        </p>
        <button
          onClick={onClose}
          className="w-full h-12 rounded-xl font-semibold text-sm text-white bg-linear-to-b from-[#A967F1] to-[#5B26B1] hover:opacity-90 transition-opacity cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  </div>
);
import { devotionalService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';
import { useUpload } from '@/app/hooks/useUpload';
import VideoPlayer from '@/app/components/upload/VideoPlayer';

// ── Types ─────────────────────────────────────────────────────────────────────

interface DevArticle {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  publishedAt?: string;
  status: 'DRAFT' | 'PUBLISHED';
  tags: string[];
  estimatedMinutes: number;
}

interface EditForm {
  title: string;
  content: string;
  excerpt: string;
  publishedAt: string;
  status: 'DRAFT' | 'PUBLISHED';
  tags: string[];
  tagInput: string;
  publishedTime: string;
  videoUrl: string;
  videoThumbnailUrl: string;
  videoDuration: number;
}

const BLANK_FORM: EditForm = {
  title: '',
  content: '',
  excerpt: '',
  publishedAt: '',
  publishedTime: '',
  status: 'DRAFT',
  tags: [],
  tagInput: '',
  videoUrl: '',
  videoThumbnailUrl: '',
  videoDuration: 0,
};

function articleToForm(a: DevArticle): EditForm {
  const dt = a.publishedAt ? new Date(a.publishedAt) : null;
  return {
    title: a.title,
    content: a.content,
    excerpt: a.excerpt ?? '',
    publishedAt: dt ? dt.toISOString().slice(0, 10) : '',
    publishedTime: dt ? dt.toTimeString().slice(0, 5) : '',
    status: a.status,
    tags: a.tags ?? [],
    tagInput: '',
    videoUrl: (a as any).videoUrl ?? '',
    videoThumbnailUrl: (a as any).videoThumbnailUrl ?? '',
    videoDuration: (a as any).videoDuration ?? 0,
  };
}

function formatDate(iso?: string) {
  if (!iso) return 'No date';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Rich Text Editor ──────────────────────────────────────────────────────────

interface RteHandle {
  insertImageUrl: (url: string) => void;
  insertCodeBlock: () => void;
}

const RichTextEditor = React.forwardRef<
  RteHandle,
  { articleId: string; value: string; onChange: (v: string) => void }
>(({ articleId, value, onChange }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const syncedId  = useRef('');

  useEffect(() => {
    if (!editorRef.current) return;
    if (syncedId.current === articleId) return;
    syncedId.current = articleId;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [articleId, value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const insertAt = useCallback((html: string) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && el.contains(sel.anchorNode)) {
      const r = sel.getRangeAt(0);
      r.deleteContents();
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const frag = document.createDocumentFragment();
      let last: Node | null = null;
      while (tmp.firstChild) last = frag.appendChild(tmp.firstChild);
      r.insertNode(frag);
      if (last) {
        const nr = document.createRange();
        nr.setStartAfter(last);
        nr.collapse(true);
        sel.removeAllRanges();
        sel.addRange(nr);
      }
    } else {
      el.innerHTML += html;
    }
    onChange(el.innerHTML);
  }, [onChange]);

  React.useImperativeHandle(ref, () => ({
    insertImageUrl: (url: string) => {
      insertAt(
        `<div contenteditable="false" style="margin:12px 0;text-align:center;">` +
        `<img src="${url}" style="max-width:100%;height:auto;border-radius:8px;display:inline-block;"/>` +
        `</div><p><br/></p>`,
      );
    },
    insertCodeBlock: () => {
      insertAt(
        `<div contenteditable="false" style="margin:12px 0;"><pre style="background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;overflow-x:auto;font-size:14px;line-height:1.5;"><code contenteditable="true">// Write your code here</code></pre></div><p><br/></p>`,
      );
    },
  }), [insertAt]);

  return (
    <div className="relative h-full">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="w-full min-h-100 pl-6 pr-2 pt-2 focus:outline-none prose prose-sm max-w-none"
        onInput={handleInput}
        data-placeholder="Write your devotional content here…"
      />
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
      `}</style>
    </div>
  );
});
RichTextEditor.displayName = 'RichTextEditor';

// ── DevotionContent ───────────────────────────────────────────────────────────

let _seq = 0;
const tempId = () => `tmp_${++_seq}`;

export interface DevotionContentHandle {
  publish: () => Promise<void>;
}

const DevotionContent = React.forwardRef<DevotionContentHandle, { seriesId: string }>(({ seriesId }, ref) => {
  const { user } = useAuth();
  const { upload, uploading: imageUploading } = useUpload();
  const { upload: uploadVideo, uploading: videoUploading, pollVideoStatus } = useUpload();
  const [videoProcessing, setVideoProcessing] = useState(false);
  const [articles, setArticles]       = useState<DevArticle[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeId, setActiveId]       = useState<string | null>(null);
  const [isNew, setIsNew]             = useState(false);
  const [form, setForm]               = useState<EditForm>(BLANK_FORM);
  const [saving, setSaving]           = useState(false);
  const [saveStatus, setSaveStatus]   = useState<'idle' | 'saved' | 'error'>('idle');
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);

  const rteRef      = useRef<RteHandle>(null);
  const imageRef    = useRef<HTMLInputElement>(null);
  const videoRef    = useRef<HTMLInputElement>(null);

  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    try {
      const result = await uploadVideo(file, 'video') as { jobId: string };
      setVideoProcessing(true);
      const poll = setInterval(async () => {
        try {
          const status = await pollVideoStatus(result.jobId);
          if (status.status === 'READY') {
            clearInterval(poll);
            setVideoProcessing(false);
            setForm((f) => ({ ...f, videoUrl: status.hlsUrl!, videoThumbnailUrl: status.thumbnailUrl ?? '', videoDuration: status.durationSeconds ?? 0 }));
          } else if (status.status === 'FAILED') {
            clearInterval(poll);
            setVideoProcessing(false);
          }
        } catch {}
      }, 5000);
    } catch {}
  };

  // ── Load articles ──────────────────────────────────────────────────────────

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await devotionalService.getSeriesById(seriesId) as any;
      setArticles(data?.articles ?? []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  // ── Select article ─────────────────────────────────────────────────────────

  const selectArticle = (a: DevArticle) => {
    setActiveId(a.id);
    setIsNew(false);
    setForm(articleToForm(a));
    setSaveStatus('idle');
  };

  const startNew = () => {
    const tid = tempId();
    setActiveId(tid);
    setIsNew(true);
    setForm({ ...BLANK_FORM });
    setSaveStatus('idle');
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const save = async () => {
    if (!form.title.trim() || saving) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      let publishedAt: string | undefined;
      if (form.publishedAt) {
        const timeStr = form.publishedTime || '00:00';
        publishedAt = new Date(`${form.publishedAt}T${timeStr}:00`).toISOString();
      }
      const payload = {
        title: form.title.trim(),
        content: form.content,
        excerpt: form.excerpt.trim() || undefined,
        scheduledFor: publishedAt,
        status: form.status,
        tags: form.tags,
        seriesId,
        videoUrl: form.videoUrl || undefined,
        videoThumbnailUrl: form.videoThumbnailUrl || undefined,
      };

      if (isNew) {
        const created = await devotionalService.create(payload) as DevArticle;
        setArticles((prev) => [created, ...prev]);
        setActiveId(created.id);
        setIsNew(false);
      } else if (activeId) {
        const updated = await devotionalService.update(activeId, payload) as DevArticle;
        setArticles((prev) => prev.map((a) => a.id === activeId ? updated : a));
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const deleteArticle = async (id: string) => {
    if (id.startsWith('tmp_')) {
      setActiveId(null);
      return;
    }
    setDeleting(id);
    try {
      await devotionalService.delete(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      if (activeId === id) setActiveId(null);
    } finally {
      setDeleting(null);
    }
  };

  // ── Publish active article ─────────────────────────────────────────────────

  const publishActive = useCallback(async () => {
    if (!form.title.trim() || saving || !activeId) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
      let publishedAt: string | undefined;
      if (form.publishedAt) {
        const timeStr = form.publishedTime || '00:00';
        publishedAt = new Date(`${form.publishedAt}T${timeStr}:00`).toISOString();
      }
      const payload = {
        title: form.title.trim(),
        content: form.content,
        excerpt: form.excerpt.trim() || undefined,
        scheduledFor: publishedAt,
        status: 'PUBLISHED' as const,
        tags: form.tags,
        seriesId,
        videoUrl: form.videoUrl || undefined,
        videoThumbnailUrl: form.videoThumbnailUrl || undefined,
      };
      if (isNew) {
        const created = await devotionalService.create(payload) as DevArticle;
        setArticles((prev) => [created, ...prev]);
        setActiveId(created.id);
        setIsNew(false);
        setForm((f) => ({ ...f, status: 'PUBLISHED' }));
      } else {
        const updated = await devotionalService.update(activeId, payload) as DevArticle;
        setArticles((prev) => prev.map((a) => (a.id === activeId ? updated : a)));
        setForm((f) => ({ ...f, status: 'PUBLISHED' }));
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
      setShowPublishSuccess(true);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }, [form, saving, activeId, isNew, seriesId]);

  React.useImperativeHandle(ref, () => ({ publish: publishActive }), [publishActive]);

  // ── Tag helpers ────────────────────────────────────────────────────────────

  const addTag = () => {
    const t = form.tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t], tagInput: '' }));
    } else {
      setForm((f) => ({ ...f, tagInput: '' }));
    }
  };

  // ── Active article merged with local form for display ─────────────────────

  const activeArticle = isNew
    ? null
    : articles.find((a) => a.id === activeId) ?? null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white px-4 lg:px-10 pb-8">
      {showPublishSuccess && <PublishSuccessModal onClose={() => setShowPublishSuccess(false)} />}
      {loading ? (
        <div className="flex justify-center items-center h-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      ) : (
        <div className="flex h-[calc(100vh-220px)] border border-[#E3E8EF] rounded-2xl overflow-hidden">

          {/* ── Left: article list ──────────────────────────────────────── */}
          <div className="w-70 shrink-0 border-r border-[#E3E8EF] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-[#E3E8EF]">
              <h2 className="text-base font-semibold text-[#180426]">Articles</h2>
              <button
                onClick={startNew}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                title="New article"
              >
                <Plus size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              {/* New unsaved article placeholder */}
              {isNew && (
                <div className="mx-2 mb-1 px-3 py-2.5 rounded-xl bg-[#F5EBFF] border border-[#D49CFD] cursor-pointer">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-[#870BD6] font-medium">New article</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89] font-medium">Draft</span>
                  </div>
                  <p className="text-sm font-medium text-[#180426] truncate mt-0.5">
                    {form.title.trim() || <span className="text-gray-400 italic">Untitled</span>}
                  </p>
                </div>
              )}

              {articles.length === 0 && !isNew ? (
                <div className="flex flex-col items-center justify-center gap-3 h-full py-16 px-4 text-center">
                  <BookOpen className="w-8 h-8 text-gray-300" />
                  <p className="text-xs text-gray-400">No articles yet.<br />Click + to add your first.</p>
                </div>
              ) : (
                articles.map((a) => {
                  const active = a.id === activeId && !isNew;
                  return (
                    <div
                      key={a.id}
                      onClick={() => selectArticle(a)}
                      className={`group mx-2 mb-1 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        active ? 'bg-[#F5EBFF] border border-[#D49CFD]' : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-medium ${active ? 'text-[#870BD6]' : 'text-gray-400'}`}>
                          {formatDate(a.publishedAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                            a.status === 'PUBLISHED'
                              ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]'
                              : 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                          }`}>
                            {a.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteArticle(a.id); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-50 rounded transition-all cursor-pointer"
                          >
                            {deleting === a.id
                              ? <Loader2 size={12} className="animate-spin text-red-400" />
                              : <Trash2 size={12} className="text-red-400" />
                            }
                          </button>
                        </div>
                      </div>
                      <p className={`text-sm truncate mt-0.5 ${active ? 'font-semibold text-[#180426]' : 'font-medium text-gray-700'}`}>
                        {a.title || <span className="italic text-gray-400">Untitled</span>}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Right: editor ───────────────────────────────────────────── */}
          {activeId ? (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

              {/* Title + save */}
              <div className="flex items-center gap-3 px-6 pt-5 pb-3 shrink-0">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Article title"
                  className="flex-1 text-xl font-semibold border-none focus:outline-none focus:ring-0 text-[#180426] placeholder:text-gray-300"
                />
                <div className="flex items-center gap-3 shrink-0">
                  {saveStatus === 'saved' && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Check size={12} /> Saved
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="text-xs text-red-500">Failed to save</span>
                  )}
                  <button
                    onClick={save}
                    disabled={saving || !form.title.trim()}
                    className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Draft'}
                  </button>
                </div>
              </div>

              {/* Date + status + excerpt row */}
              <div className="flex flex-wrap items-center gap-4 px-6 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Date</label>
                  <input
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#870BD6] text-[#180426]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Time</label>
                  <input
                    type="time"
                    value={form.publishedTime}
                    onChange={(e) => setForm((f) => ({ ...f, publishedTime: e.target.value }))}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#870BD6] text-[#180426]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 font-medium uppercase tracking-wide">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'DRAFT' | 'PUBLISHED' }))}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#870BD6] text-[#180426]"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
                <div className="flex-1 min-w-50">
                  <input
                    type="text"
                    value={form.excerpt}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    placeholder="Short excerpt (optional)…"
                    className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-[#870BD6] text-[#180426] placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Tags row */}
              <div className="flex flex-wrap items-center gap-2 px-6 pb-3 shrink-0">
                {form.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-[#F5EBFF] text-[#870BD6] rounded-full text-xs font-medium">
                    {t}
                    <button onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))} className="cursor-pointer">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={form.tagInput}
                    onChange={(e) => setForm((f) => ({ ...f, tagInput: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    placeholder="Add tag…"
                    className="text-xs border border-gray-200 rounded-full px-2.5 py-1 focus:outline-none focus:border-[#870BD6] w-20"
                  />
                </div>
              </div>

              {/* Article video — compact status/player */}
              {(form.videoUrl || videoProcessing || videoUploading) && (
                <div className="px-6 pb-2 shrink-0">
                  {videoUploading && (
                    <div className="flex items-center gap-2 text-xs text-[#870BD6]">
                      <Loader2 size={12} className="animate-spin" />Uploading video…
                    </div>
                  )}
                  {videoProcessing && !videoUploading && (
                    <div className="flex items-center gap-2 text-xs text-[#60666B]">
                      <Loader2 size={12} className="animate-spin" />Processing video (1–3 min)…
                    </div>
                  )}
                  {form.videoUrl && (
                    <div className="space-y-1">
                      <VideoPlayer src={form.videoUrl} poster={form.videoThumbnailUrl || undefined} />
                      <button onClick={() => setForm((f) => ({ ...f, videoUrl: '', videoThumbnailUrl: '', videoDuration: 0 }))} className="text-[10px] text-red-400 hover:text-red-500">Remove video</button>
                    </div>
                  )}
                </div>
              )}
              <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoFileSelected} />

              {/* BIU toolbar */}
              <div className="flex items-center gap-1 px-5 pb-2 border-t border-[#E3E8EF] pt-2 shrink-0">
                {([
                  { label: 'B', cmd: 'bold', cls: 'font-bold' },
                  { label: 'I', cmd: 'italic', cls: 'italic' },
                  { label: 'U', cmd: 'underline', cls: 'underline' },
                ] as const).map(({ label, cmd, cls }) => (
                  <button
                    key={cmd}
                    onMouseDown={(e) => { e.preventDefault(); document.execCommand(cmd, false); }}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm text-[#60666B] hover:text-[#870BD6] hover:bg-[#F5EBFF] transition-colors cursor-pointer ${cls}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Editor + media sidebar */}
              <div className="flex gap-4 flex-1 min-h-0 overflow-hidden pr-4 py-4">
                <div className="flex-1 overflow-y-auto pl-6">
                  <RichTextEditor
                    ref={rteRef}
                    articleId={activeId}
                    value={form.content}
                    onChange={(v) => setForm((f) => ({ ...f, content: v }))}
                  />
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const result = await upload(file, 'content') as { url: string };
                          rteRef.current?.insertImageUrl(result.url);
                        } catch {}
                      }
                      e.target.value = '';
                    }}
                  />
                </div>

                <div className="flex flex-col gap-5 pt-1 w-10 shrink-0">
                  <button title="Image" onClick={() => imageRef.current?.click()} disabled={imageUploading} className="flex flex-col items-center cursor-pointer disabled:opacity-50">
                    <div className="w-9 h-9 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] hover:bg-[#D1D5DB] transition-colors">
                      {imageUploading ? <Loader2 size={18} className="text-gray-500 animate-spin" /> : <ImageIcon size={18} className="text-gray-500" />}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5">Image</span>
                  </button>
                  <button title="Video" onClick={() => videoRef.current?.click()} disabled={videoUploading || videoProcessing} className="flex flex-col items-center cursor-pointer disabled:opacity-50">
                    <div className="w-9 h-9 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] hover:bg-[#D1D5DB] transition-colors">
                      {(videoUploading || videoProcessing) ? <Loader2 size={18} className="text-gray-500 animate-spin" /> : <Video size={18} className="text-gray-500" />}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5">Video</span>
                  </button>
                  <button title="Embed" onClick={() => rteRef.current?.insertCodeBlock()} className="flex flex-col items-center cursor-pointer">
                    <div className="w-9 h-9 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] hover:bg-[#D1D5DB] transition-colors">
                      <Code size={18} className="text-gray-500" />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1.5">Embed</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-[#870BD6]" />
              </div>
              <p className="text-sm font-medium text-gray-500">Select an article to edit,<br />or click + to create one.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
DevotionContent.displayName = 'DevotionContent';

export default DevotionContent;
