'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Bookmark, BookmarkCheck, Plus, Loader2, ChevronRight,
  UserPlus, UserCheck, Clock, Tag, RefreshCw, X, Image as ImageIcon,
} from 'lucide-react';
import { devotionalService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface Devotional {
  id: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  author: Author;
  category?: { id: string; name: string; slug: string };
  tags: string[];
  status: string;
  estimatedMinutes: number;
  isBookmarked: boolean;
  bookmarkCount: number;
  reactionCount: number;
  commentCount: number;
  publishedAt?: string;
}

type FeedMode = 'feed' | 'browse' | 'bookmarks';

export default function DevotionalsTab() {
  const { user } = useAuth();
  const isPreacher = user?.role === 'PREACHER';
  const [mode, setMode] = useState<FeedMode>('feed');
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Devotional | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadDevotionals = useCallback(async () => {
    setLoading(true);
    try {
      let res: unknown;
      if (mode === 'feed') {
        res = await devotionalService.getFeed({ limit: 20 });
      } else if (mode === 'browse') {
        res = await devotionalService.getAll({ limit: 20 });
      } else {
        res = await devotionalService.getBookmarks({ limit: 20 });
      }
      const items = (res as { data?: Devotional[] })?.data ?? (Array.isArray(res) ? res : []);
      setDevotionals(items);
    } catch {
      setDevotionals([]);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { loadDevotionals(); }, [loadDevotionals]);

  const toggleBookmark = async (d: Devotional) => {
    try {
      await devotionalService.toggleBookmark(d.id);
      setDevotionals((prev) =>
        prev.map((x) =>
          x.id === d.id
            ? { ...x, isBookmarked: !x.isBookmarked, bookmarkCount: x.bookmarkCount + (x.isBookmarked ? -1 : 1) }
            : x,
        ),
      );
      if (selected?.id === d.id) {
        setSelected((prev) => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
      }
    } catch {}
  };

  if (selected) {
    return (
      <DevotionalDetail
        devotional={selected}
        onBack={() => setSelected(null)}
        onBookmark={() => toggleBookmark(selected)}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Devotionals</h2>
          <p className="text-sm text-gray-500 mt-1">Articles and teachings from creators you follow</p>
        </div>
        {isPreacher && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#870BD6] text-white rounded-full text-sm font-semibold hover:bg-[#7009b8] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Publish
          </button>
        )}
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit text-sm">
        {([
          { id: 'feed' as FeedMode, label: 'My Feed' },
          { id: 'browse' as FeedMode, label: 'Browse All' },
          { id: 'bookmarks' as FeedMode, label: 'Saved' },
        ] as const).map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all ${mode === m.id ? 'bg-white text-[#870BD6] shadow-sm' : 'text-gray-500'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" /></div>
      ) : devotionals.length === 0 ? (
        <EmptyDevotionals mode={mode} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devotionals.map((d) => (
            <DevotionalCard
              key={d.id}
              devotional={d}
              onClick={() => setSelected(d)}
              onBookmark={() => toggleBookmark(d)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateDevotionalModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadDevotionals(); }}
        />
      )}
    </div>
  );
}

function EmptyDevotionals({ mode }: { mode: FeedMode }) {
  const messages: Record<FeedMode, { title: string; body: string }> = {
    feed: {
      title: 'Your feed is empty',
      body: 'Subscribe to devotional creators to see their latest posts here.',
    },
    browse: { title: 'No devotionals yet', body: 'Check back later for new content.' },
    bookmarks: { title: 'No saved devotionals', body: 'Bookmark devotionals to find them here easily.' },
  };
  const msg = messages[mode];
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-8 h-8 text-[#870BD6]" />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{msg.title}</h3>
      <p className="text-sm text-gray-500 max-w-xs mx-auto">{msg.body}</p>
    </div>
  );
}

function DevotionalCard({ devotional: d, onClick, onBookmark }: { devotional: Devotional; onClick: () => void; onBookmark: () => void }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100">
      {d.coverImageUrl ? (
        <img src={d.coverImageUrl} alt={d.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-purple-300" />
        </div>
      )}
      <div className="p-4">
        {d.category && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#870BD6] mb-1 block">{d.category.name}</span>
        )}
        <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2 cursor-pointer hover:text-[#870BD6]" onClick={onClick}>
          {d.title}
        </h3>
        {d.excerpt && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{d.excerpt}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-[#870BD6]">
              {d.author.firstName[0]}
            </div>
            <span className="text-xs text-gray-500">{d.author.firstName} {d.author.lastName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-400"><Clock className="w-3 h-3" />{d.estimatedMinutes}m</span>
            <button onClick={(e) => { e.stopPropagation(); onBookmark(); }} className="text-gray-400 hover:text-[#870BD6] transition-colors">
              {d.isBookmarked ? <BookmarkCheck className="w-4 h-4 text-[#870BD6]" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DevotionalDetail({ devotional: d, onBack, onBookmark }: { devotional: Devotional; onBack: () => void; onBookmark: () => void }) {
  const { user } = useAuth();
  const [authorStats, setAuthorStats] = useState<{ followerCount: number; devotionalCount: number; isSubscribed: boolean } | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    devotionalService.getAuthorStats(d.author.id)
      .then((s) => setAuthorStats(s as typeof authorStats))
      .catch(() => null);
  }, [d.author.id]);

  const toggleSubscription = async () => {
    if (subscribing || !user) return;
    setSubscribing(true);
    try {
      const res = await devotionalService.toggleSubscription(d.author.id) as { subscribed: boolean };
      setAuthorStats((prev) => prev ? { ...prev, isSubscribed: res.subscribed, followerCount: prev.followerCount + (res.subscribed ? 1 : -1) } : null);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-700">
        <ChevronRight className="w-5 h-5 rotate-180" />
        <span className="text-sm">Back</span>
      </button>

      {d.coverImageUrl && (
        <img src={d.coverImageUrl} alt={d.title} className="w-full h-56 object-cover rounded-2xl mb-6" />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {d.category && <span className="text-xs font-bold text-[#870BD6] uppercase tracking-wide">{d.category.name}</span>}
          <h1 className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{d.title}</h1>
        </div>
        <button onClick={onBookmark} className="ml-4 p-2 hover:bg-gray-100 rounded-xl transition-colors">
          {d.isBookmarked ? <BookmarkCheck className="w-5 h-5 text-[#870BD6]" /> : <Bookmark className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      {/* Author */}
      <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-[#870BD6]">
            {d.author.firstName[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{d.author.firstName} {d.author.lastName}</p>
            {authorStats && <p className="text-xs text-gray-500">{authorStats.followerCount} subscribers</p>}
          </div>
        </div>
        {user && user.id !== d.author.id && (
          <button
            onClick={toggleSubscription}
            disabled={subscribing}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              authorStats?.isSubscribed
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-[#870BD6] text-white hover:bg-[#7009b8]'
            }`}
          >
            {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : authorStats?.isSubscribed ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {authorStats?.isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        )}
      </div>

      {/* Tags */}
      {d.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {d.tags.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-[#870BD6] text-xs font-medium rounded-full">
              <Tag className="w-3 h-3" />{t}
            </span>
          ))}
        </div>
      )}

      {/* Reading time */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
        <Clock className="w-3.5 h-3.5" />
        <span>{d.estimatedMinutes} min read</span>
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
        {d.excerpt && <p className="text-base text-gray-600 font-medium mb-4">{d.excerpt}</p>}
      </div>
    </div>
  );
}

function CreateDevotionalModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await devotionalService.create({ title: title.trim(), content: content.trim(), excerpt: excerpt || undefined, tags, status });
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Publish Devotional</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Finding Peace in Uncertainty"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#870BD6]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Excerpt (optional)</label>
            <input
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#870BD6]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your devotional..."
              rows={8}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#870BD6] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add a tag..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#870BD6]"
              />
              <button onClick={addTag} type="button" className="px-3 py-2 bg-gray-100 rounded-xl text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-[#870BD6] rounded-full text-xs font-medium">
                  {t}<button onClick={() => setTags((p) => p.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#870BD6]"
            >
              <option value="DRAFT">Save as Draft</option>
              <option value="PUBLISHED">Publish Now</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || submitting}
          className="w-full mt-6 py-3 bg-[#870BD6] text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-[#7009b8] transition-colors"
        >
          {submitting ? 'Publishing...' : status === 'PUBLISHED' ? 'Publish Devotional' : 'Save Draft'}
        </button>
      </div>
    </div>
  );
}
