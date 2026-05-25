'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Bookmark, BookmarkCheck, Plus, Loader2, ChevronRight,
  UserPlus, UserCheck, Clock, Tag, X, Users,
} from 'lucide-react';
import { devotionalService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';
import Button from '@/app/components/Button';

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface DevotionalSeries {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  author: Author;
  articleCount: number;
  subscriberCount: number;
  isSubscribed: boolean;
}

interface DevotionalArticle {
  id: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  author: Author;
  series?: { id: string; title: string; slug: string };
  category?: { id: string; name: string; slug: string };
  tags: string[];
  status: string;
  estimatedMinutes: number;
  isBookmarked: boolean;
  bookmarkCount: number;
  publishedAt?: string;
}

type FeedMode = 'feed' | 'browse' | 'bookmarks';

export default function DevotionalsTab() {
  const { user } = useAuth();
  const isPreacher = user?.role === 'PREACHER';
  const [mode, setMode] = useState<FeedMode>('feed');

  // Feed
  const [feedArticles, setFeedArticles] = useState<DevotionalArticle[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Browse (series list)
  const [seriesList, setSeriesList] = useState<DevotionalSeries[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(false);

  // Series detail
  const [selectedSeries, setSelectedSeries] = useState<DevotionalSeries | null>(null);
  const [seriesDetail, setSeriesDetail] = useState<(DevotionalSeries & { articles: DevotionalArticle[] }) | null>(null);
  const [loadingSeriesDetail, setLoadingSeriesDetail] = useState(false);

  // Article detail
  const [selectedArticle, setSelectedArticle] = useState<DevotionalArticle | null>(null);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<DevotionalArticle[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Modals
  const [showCreateSeries, setShowCreateSeries] = useState(false);
  const [showAddArticle, setShowAddArticle] = useState(false);

  const loadFeed = useCallback(async () => {
    setLoadingFeed(true);
    try {
      const res = await devotionalService.getSeriesFeed({ limit: 20 }) as { data?: DevotionalArticle[] };
      setFeedArticles(res?.data ?? []);
    } catch {
      setFeedArticles([]);
    } finally {
      setLoadingFeed(false);
    }
  }, []);

  const loadSeries = useCallback(async () => {
    setLoadingSeries(true);
    try {
      const res = await devotionalService.getAllSeries({ limit: 20 }) as { data?: DevotionalSeries[] };
      setSeriesList(res?.data ?? []);
    } catch {
      setSeriesList([]);
    } finally {
      setLoadingSeries(false);
    }
  }, []);

  const loadBookmarks = useCallback(async () => {
    setLoadingBookmarks(true);
    try {
      const res = await devotionalService.getBookmarks({ limit: 20 }) as { data?: DevotionalArticle[] };
      setBookmarks(res?.data ?? []);
    } catch {
      setBookmarks([]);
    } finally {
      setLoadingBookmarks(false);
    }
  }, []);

  const loadSeriesDetail = useCallback(async (seriesId: string) => {
    setLoadingSeriesDetail(true);
    try {
      const data = await devotionalService.getSeriesById(seriesId) as DevotionalSeries & { articles: DevotionalArticle[] };
      setSeriesDetail(data);
    } catch {
      setSeriesDetail(null);
    } finally {
      setLoadingSeriesDetail(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => { if (mode === 'browse') loadSeries(); }, [mode, loadSeries]);
  useEffect(() => { if (mode === 'bookmarks') loadBookmarks(); }, [mode, loadBookmarks]);
  useEffect(() => {
    if (selectedSeries) loadSeriesDetail(selectedSeries.id);
  }, [selectedSeries, loadSeriesDetail]);

  const toggleBookmark = async (article: DevotionalArticle) => {
    try {
      await devotionalService.toggleBookmark(article.id);
      const update = (a: DevotionalArticle) =>
        a.id === article.id ? { ...a, isBookmarked: !a.isBookmarked } : a;
      setFeedArticles((prev) => prev.map(update));
      setBookmarks((prev) =>
        mode === 'bookmarks' ? prev.filter((a) => a.id !== article.id) : prev.map(update),
      );
      if (seriesDetail) {
        setSeriesDetail((prev) =>
          prev ? { ...prev, articles: prev.articles.map(update) } : null,
        );
      }
      if (selectedArticle?.id === article.id) {
        setSelectedArticle((prev) => prev ? update(prev) : null);
      }
    } catch {}
  };

  const toggleSeriesSubscription = async (series: DevotionalSeries) => {
    try {
      const res = await devotionalService.toggleSeriesSubscription(series.id) as { subscribed: boolean };
      const update = (s: DevotionalSeries) =>
        s.id === series.id
          ? { ...s, isSubscribed: res.subscribed, subscriberCount: s.subscriberCount + (res.subscribed ? 1 : -1) }
          : s;
      setSeriesList((prev) => prev.map(update));
      if (seriesDetail?.id === series.id) {
        setSeriesDetail((prev) =>
          prev ? { ...prev, isSubscribed: res.subscribed, subscriberCount: prev.subscriberCount + (res.subscribed ? 1 : -1) } : null,
        );
      }
      if (selectedSeries?.id === series.id) {
        setSelectedSeries((prev) => prev ? update(prev) : null);
      }
    } catch {}
  };

  // ── Render: article detail ────────────────────────────────────────────────
  if (selectedArticle) {
    return (
      <ArticleDetail
        article={selectedArticle}
        onBack={() => setSelectedArticle(null)}
        onBookmark={() => toggleBookmark(selectedArticle)}
      />
    );
  }

  // ── Render: series detail ─────────────────────────────────────────────────
  if (selectedSeries && mode === 'browse') {
    return (
      <SeriesDetail
        series={selectedSeries}
        detail={seriesDetail}
        loading={loadingSeriesDetail}
        isOwner={isPreacher && user?.id === selectedSeries.author.id}
        onBack={() => { setSelectedSeries(null); setSeriesDetail(null); }}
        onSelectArticle={setSelectedArticle}
        onBookmark={toggleBookmark}
        onToggleSubscription={() => toggleSeriesSubscription(selectedSeries)}
        onAddArticle={() => setShowAddArticle(true)}
      />
    );
  }

  // ── Render: main view ─────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Articles and teachings from devotionals you follow</p>
        {isPreacher && (
          <Button onClick={() => setShowCreateSeries(true)} customClass="!w-fit px-5 !h-[44px] !text-white">
            <p className="flex items-center gap-1.5 text-sm"><Plus stroke="white" size={16} />New Devotional</p>
          </Button>
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
            className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${mode === m.id ? 'bg-white text-[#870BD6] shadow-sm' : 'text-gray-500'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {mode === 'feed' && (
        loadingFeed ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" /></div>
        ) : feedArticles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-[#870BD6]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Your feed is empty</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">Subscribe to devotionals in Browse All to see new articles here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {feedArticles.map((a) => (
              <ArticleCard key={a.id} article={a} onClick={() => setSelectedArticle(a)} onBookmark={() => toggleBookmark(a)} />
            ))}
          </div>
        )
      )}

      {/* Browse All — shows series */}
      {mode === 'browse' && (
        loadingSeries ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" /></div>
        ) : seriesList.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-[#870BD6]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">No devotionals yet</h3>
            <p className="text-sm text-gray-500">Check back later for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {seriesList.map((s) => (
              <SeriesCard
                key={s.id}
                series={s}
                onSelect={() => setSelectedSeries(s)}
                onToggleSubscription={() => toggleSeriesSubscription(s)}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )
      )}

      {/* Bookmarks */}
      {mode === 'bookmarks' && (
        loadingBookmarks ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" /></div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-[#870BD6]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">No saved articles</h3>
            <p className="text-sm text-gray-500">Bookmark articles to find them here easily.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarks.map((a) => (
              <ArticleCard key={a.id} article={a} onClick={() => setSelectedArticle(a)} onBookmark={() => toggleBookmark(a)} />
            ))}
          </div>
        )
      )}

      {showCreateSeries && (
        <CreateSeriesModal
          onClose={() => setShowCreateSeries(false)}
          onCreated={(series) => {
            setShowCreateSeries(false);
            setSeriesList((prev) => [series, ...prev]);
            setMode('browse');
            setSelectedSeries(series);
          }}
        />
      )}

      {showAddArticle && selectedSeries && seriesDetail && (
        <AddArticleModal
          seriesId={selectedSeries.id}
          seriesTitle={selectedSeries.title}
          onClose={() => setShowAddArticle(false)}
          onCreated={() => {
            setShowAddArticle(false);
            loadSeriesDetail(selectedSeries.id);
          }}
        />
      )}
    </div>
  );
}

// ── Series Card ───────────────────────────────────────────────────────────────

function SeriesCard({
  series: s, onSelect, onToggleSubscription, currentUserId,
}: {
  series: DevotionalSeries;
  onSelect: () => void;
  onToggleSubscription: () => void;
  currentUserId?: string;
}) {
  const [toggling, setToggling] = useState(false);

  const handleSubscribe = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (toggling) return;
    setToggling(true);
    try { await onToggleSubscription(); } finally { setToggling(false); }
  };

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer group"
      onClick={onSelect}
    >
      {s.coverImageUrl ? (
        <img src={s.coverImageUrl} alt={s.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-linear-to-br from-purple-100 to-purple-50 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-purple-300" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 leading-tight mb-1 group-hover:text-[#870BD6] transition-colors">{s.title}</h3>
        {s.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{s.description}</p>}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[9px] font-bold text-[#870BD6]">
            {s.author.firstName[0]}
          </div>
          <span className="text-xs text-gray-500">{s.author.firstName} {s.author.lastName}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{s.articleCount} articles</span>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.subscriberCount}</span>
          </div>
          {currentUserId && currentUserId !== s.author.id && (
            <button
              onClick={handleSubscribe}
              disabled={toggling}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                s.isSubscribed
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white'
              }`}
            >
              {toggling ? <Loader2 className="w-3 h-3 animate-spin" /> : s.isSubscribed ? <UserCheck className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
              {s.isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Series Detail ─────────────────────────────────────────────────────────────

function SeriesDetail({
  series, detail, loading, isOwner, onBack, onSelectArticle, onBookmark, onToggleSubscription, onAddArticle,
}: {
  series: DevotionalSeries;
  detail: (DevotionalSeries & { articles: DevotionalArticle[] }) | null;
  loading: boolean;
  isOwner: boolean;
  onBack: () => void;
  onSelectArticle: (a: DevotionalArticle) => void;
  onBookmark: (a: DevotionalArticle) => void;
  onToggleSubscription: () => void;
  onAddArticle: () => void;
}) {
  const { user } = useAuth();
  const [toggling, setToggling] = useState(false);

  const handleSubscribe = async () => {
    if (toggling) return;
    setToggling(true);
    try { await onToggleSubscription(); } finally { setToggling(false); }
  };

  const currentSeries = detail ?? series;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-700 cursor-pointer">
        <ChevronRight className="w-5 h-5 rotate-180" />
        <span className="text-sm">Back</span>
      </button>

      {/* Series header */}
      <div className="flex flex-col sm:flex-row gap-5 mb-6 pb-6 border-b border-gray-100">
        <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-linear-to-br from-purple-100 to-purple-50 flex items-center justify-center">
          {currentSeries.coverImageUrl ? (
            <img src={currentSeries.coverImageUrl} alt={currentSeries.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-10 h-10 text-purple-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{currentSeries.title}</h1>
          {currentSeries.description && <p className="text-sm text-gray-500 mb-3">{currentSeries.description}</p>}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-[#870BD6]">
              {currentSeries.author.firstName[0]}
            </div>
            <span className="text-sm font-medium text-gray-700">{currentSeries.author.firstName} {currentSeries.author.lastName}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{currentSeries.articleCount} articles</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{currentSeries.subscriberCount} subscribers</span>
            </div>
            {user && user.id !== currentSeries.author.id && (
              <button
                onClick={handleSubscribe}
                disabled={toggling}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  currentSeries.isSubscribed
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white'
                }`}
              >
                {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> : currentSeries.isSubscribed ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {currentSeries.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
            {isOwner && (
              <Button onClick={onAddArticle} customClass="!w-fit px-4 !h-[36px] !text-white !text-xs">
                <p className="flex items-center gap-1.5 text-xs"><Plus stroke="white" size={14} />Add Article</p>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Articles */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" /></div>
      ) : !detail || detail.articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No articles published yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {detail.articles.map((a) => (
            <ArticleCard key={a.id} article={a} onClick={() => onSelectArticle(a)} onBookmark={() => onBookmark(a)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Article Card ──────────────────────────────────────────────────────────────

function ArticleCard({ article: a, onClick, onBookmark }: { article: DevotionalArticle; onClick: () => void; onBookmark: () => void }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer" onClick={onClick}>
      {a.coverImageUrl ? (
        <img src={a.coverImageUrl} alt={a.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-linear-to-br from-purple-100 to-purple-50 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-purple-300" />
        </div>
      )}
      <div className="p-4">
        {a.series && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#870BD6] mb-1 block">{a.series.title}</span>
        )}
        {!a.series && a.category && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#870BD6] mb-1 block">{a.category.name}</span>
        )}
        <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2 select-none">{a.title}</h3>
        {a.excerpt && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{a.excerpt}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-[#870BD6]">
              {a.author.firstName[0]}
            </div>
            <span className="text-xs text-gray-500">{a.author.firstName} {a.author.lastName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-400"><Clock className="w-3 h-3" />{a.estimatedMinutes}m</span>
            <button
              onClick={(e) => { e.stopPropagation(); onBookmark(); }}
              className="text-gray-400 hover:text-[#870BD6] transition-colors cursor-pointer"
            >
              {a.isBookmarked ? <BookmarkCheck className="w-4 h-4 text-[#870BD6]" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Article Detail ────────────────────────────────────────────────────────────

function ArticleDetail({ article: a, onBack, onBookmark }: { article: DevotionalArticle; onBack: () => void; onBookmark: () => void }) {
  return (
    <div className="max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-700 cursor-pointer">
        <ChevronRight className="w-5 h-5 rotate-180" />
        <span className="text-sm">Back</span>
      </button>

      {a.coverImageUrl && (
        <img src={a.coverImageUrl} alt={a.title} className="w-full h-56 object-cover rounded-2xl mb-6" />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {a.series && <span className="text-xs font-bold text-[#870BD6] uppercase tracking-wide">{a.series.title}</span>}
          {!a.series && a.category && <span className="text-xs font-bold text-[#870BD6] uppercase tracking-wide">{a.category.name}</span>}
          <h1 className="text-2xl font-bold text-gray-900 mt-1 leading-tight">{a.title}</h1>
        </div>
        <button onClick={onBookmark} className="ml-4 p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
          {a.isBookmarked ? <BookmarkCheck className="w-5 h-5 text-[#870BD6]" /> : <Bookmark className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      {/* Author & read time */}
      <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-bold text-[#870BD6]">
          {a.author.firstName[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{a.author.firstName} {a.author.lastName}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{a.estimatedMinutes} min read</p>
        </div>
      </div>

      {/* Tags */}
      {a.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {a.tags.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-[#870BD6] text-xs font-medium rounded-full">
              <Tag className="w-3 h-3" />{t}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="text-gray-700 leading-relaxed text-base">
        {a.excerpt && <p className="text-base text-gray-600 font-medium mb-4">{a.excerpt}</p>}
      </div>
    </div>
  );
}

// ── Create Series Modal ───────────────────────────────────────────────────────

function CreateSeriesModal({ onClose, onCreated }: { onClose: () => void; onCreated: (series: DevotionalSeries) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      const series = await devotionalService.createSeries({
        title: title.trim(),
        description: description.trim() || undefined,
      }) as DevotionalSeries;
      onCreated(series);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Create Devotional</h3>
          <button onClick={onClose} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Name *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rise Devotional"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#870BD6]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this devotional about?"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#870BD6] resize-none"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!title.trim()}
          loading={submitting}
          customClass="w-full mt-6 !h-[48px] !text-white"
        >
          <p className="text-sm font-semibold">Create Devotional</p>
        </Button>
      </div>
    </div>
  );
}

// ── Add Article Modal ─────────────────────────────────────────────────────────

function AddArticleModal({
  seriesId, seriesTitle, onClose, onCreated,
}: {
  seriesId: string;
  seriesTitle: string;
  onClose: () => void;
  onCreated: () => void;
}) {
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
      await devotionalService.create({
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt || undefined,
        seriesId,
        tags,
        status,
      });
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-900">Add Article</h3>
          <button onClick={onClose} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <p className="text-xs text-gray-400 mb-5">Publishing under <span className="font-semibold text-[#870BD6]">{seriesTitle}</span></p>

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
              placeholder="Write your article..."
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
              <button onClick={addTag} type="button" className="px-3 py-2 bg-gray-100 rounded-xl text-sm cursor-pointer hover:bg-gray-200 transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-[#870BD6] rounded-full text-xs font-medium">
                  {t}<button onClick={() => setTags((p) => p.filter((x) => x !== t))} className="cursor-pointer"><X className="w-3 h-3" /></button>
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

        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim()}
          loading={submitting}
          customClass="w-full mt-6 !h-[48px] !text-white"
        >
          <p className="text-sm font-semibold">{status === 'PUBLISHED' ? 'Publish Article' : 'Save Draft'}</p>
        </Button>
      </div>
    </div>
  );
}
