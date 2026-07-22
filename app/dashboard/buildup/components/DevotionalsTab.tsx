'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Book1, Bookmark, ArrowRight2, UserAdd, ProfileTick, Clock, Tag, People,
} from 'iconsax-react';
import { devotionalService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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

interface DevotionalArticleFull extends DevotionalArticle {
  content?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  user: Author;
}

type FeedMode = 'feed' | 'browse' | 'bookmarks';

export default function DevotionalsTab() {
  const { user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<FeedMode>('feed');
  const [selectedArticle, setSelectedArticle] = useState<DevotionalArticle | null>(null);
  const savedScrollY = useRef(0);

  // Feed
  const [feedArticles, setFeedArticles] = useState<DevotionalArticle[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  // Browse (series list)
  const [seriesList, setSeriesList] = useState<DevotionalSeries[]>([]);
  const [loadingSeries, setLoadingSeries] = useState(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<DevotionalArticle[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

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

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => { if (mode === 'browse') loadSeries(); }, [mode, loadSeries]);
  useEffect(() => { if (mode === 'bookmarks') loadBookmarks(); }, [mode, loadBookmarks]);

  const openArticle = (article: DevotionalArticle) => {
    savedScrollY.current = window.scrollY;
    window.scrollTo(0, 0);
    setSelectedArticle(article);
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    setTimeout(() => window.scrollTo(0, savedScrollY.current), 0);
  };

  const syncBookmark = (id: string, isBookmarked: boolean) => {
    const upd = (a: DevotionalArticle) => a.id === id ? { ...a, isBookmarked } : a;
    setFeedArticles((prev) => prev.map(upd));
    setBookmarks((prev) =>
      mode === 'bookmarks' && !isBookmarked
        ? prev.filter((a) => a.id !== id)
        : prev.map(upd),
    );
  };

  const toggleBookmark = async (article: DevotionalArticle) => {
    try {
      await devotionalService.toggleBookmark(article.id);
      syncBookmark(article.id, !article.isBookmarked);
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
    } catch {}
  };

  // ── In-tab article reader ────────────────────────────────────────────────────
  if (selectedArticle) {
    return (
      <ArticleReader
        article={selectedArticle}
        onBack={closeArticle}
        onBookmarkChange={(id, isBookmarked) => syncBookmark(id, isBookmarked)}
      />
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">Articles and teachings from devotionals you follow</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-100 dark:bg-[#252830] rounded-xl p-1 mb-6 w-fit text-sm">
        {([
          { id: 'feed' as FeedMode, label: 'My Feed' },
          { id: 'browse' as FeedMode, label: 'Browse All' },
          { id: 'bookmarks' as FeedMode, label: 'Saved' },
        ] as const).map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${mode === m.id ? 'bg-white dark:bg-[#181A1F] text-[#870BD6] dark:text-[#A855F7] shadow-sm' : 'text-gray-500 dark:text-[#717784]'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {mode === 'feed' && (
        loadingFeed ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
          </div>
        ) : feedArticles.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Book1 size={32} color="#870BD6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Your feed is empty</h3>
            <p className="text-sm text-gray-500 dark:text-[#9CA3AF] max-w-xs mx-auto">Subscribe to devotionals in Browse All to see new articles here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {feedArticles.map((a) => (
              <ArticleCard key={a.id} article={a} onClick={() => openArticle(a)} onBookmark={() => toggleBookmark(a)} />
            ))}
          </div>
        )
      )}

      {/* Browse All — shows series */}
      {mode === 'browse' && (
        loadingSeries ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
          </div>
        ) : seriesList.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Book1 size={32} color="#870BD6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">No devotionals yet</h3>
            <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">Check back later for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {seriesList.map((s) => (
              <SeriesCard
                key={s.id}
                series={s}
                onSelect={() => router.push(`/dashboard/buildup/devotionals/${s.id}`)}
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
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Bookmark size={32} color="#870BD6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">No saved articles</h3>
            <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">Bookmark articles to find them here easily.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarks.map((a) => (
              <ArticleCard key={a.id} article={a} onClick={() => openArticle(a)} onBookmark={() => toggleBookmark(a)} />
            ))}
          </div>
        )
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
      className="bg-white dark:bg-[#181A1F] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-[#2D313A] cursor-pointer group"
      onClick={onSelect}
    >
      {s.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.coverImageUrl} alt={s.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-linear-to-br from-purple-100 to-purple-50 flex items-center justify-center">
          <Book1 size={40} color="#d8b4fe" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-[#870BD6] dark:group-hover:text-[#A855F7] transition-colors">{s.title}</h3>
        {s.description && <p className="text-xs text-gray-500 dark:text-[#9CA3AF] line-clamp-2 mb-3">{s.description}</p>}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-[#2D1B4E] flex items-center justify-center text-[9px] font-bold text-[#870BD6]">
            {s.author.firstName[0]}
          </div>
          <span className="text-xs text-gray-500 dark:text-[#9CA3AF]">{s.author.firstName} {s.author.lastName}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-[#717784]">
            <span className="flex items-center gap-1"><Book1 size={12} color="#9ca3af" />{s.articleCount} articles</span>
            <span className="flex items-center gap-1"><People size={12} color="#9ca3af" />{s.subscriberCount}</span>
          </div>
          {currentUserId && currentUserId !== s.author.id && (
            <button
              onClick={handleSubscribe}
              disabled={toggling}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                s.isSubscribed
                  ? 'bg-gray-100 dark:bg-[#252830] text-gray-600 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#2D313A]'
                  : 'bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white'
              }`}
            >
              {toggling
                ? <span className="inline-block w-3 h-3 rounded-full border-2 border-t-current border-current/30 animate-spin" />
                : s.isSubscribed
                  ? <ProfileTick size={12} color="#4b5563" />
                  : <UserAdd size={12} color="white" />}
              {s.isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Article Card ──────────────────────────────────────────────────────────────

function ArticleCard({ article: a, onClick, onBookmark }: { article: DevotionalArticle; onClick: () => void; onBookmark: () => void }) {
  return (
    <div className="bg-white dark:bg-[#181A1F] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-[#2D313A] cursor-pointer" onClick={onClick}>
      {a.coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={a.coverImageUrl} alt={a.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-linear-to-br from-purple-100 to-purple-50 flex items-center justify-center">
          <Book1 size={40} color="#d8b4fe" />
        </div>
      )}
      <div className="p-4">
        {a.series && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#870BD6] dark:text-[#A855F7] mb-1 block">{a.series.title}</span>
        )}
        {!a.series && a.category && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-[#870BD6] dark:text-[#A855F7] mb-1 block">{a.category.name}</span>
        )}
        <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2 select-none">{a.title}</h3>
        {a.excerpt && <p className="text-xs text-gray-500 dark:text-[#9CA3AF] line-clamp-2 mb-3">{a.excerpt}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-[#2D1B4E] flex items-center justify-center text-[10px] font-bold text-[#870BD6]">
              {a.author.firstName[0]}
            </div>
            <span className="text-xs text-gray-500 dark:text-[#9CA3AF]">{a.author.firstName} {a.author.lastName}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-[#717784]">
              <Clock size={12} color="#9ca3af" />{a.estimatedMinutes}m
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onBookmark(); }}
              className="text-gray-400 hover:text-[#870BD6] transition-colors cursor-pointer"
            >
              {a.isBookmarked
                ? <Bookmark variant="Bold" size={16} color="#870BD6" />
                : <Bookmark size={16} color="#9ca3af" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── In-tab Article Reader ─────────────────────────────────────────────────────

const REACTION_TYPES = [
  { type: 'LIKE', label: 'Amen', emoji: '🙏' },
  { type: 'LOVE', label: 'Love', emoji: '❤️' },
  { type: 'FIRE', label: 'Fire', emoji: '🔥' },
];

interface ReactionCount { type: string; count: number; hasReacted: boolean; }

function ArticleReader({
  article: initialArticle,
  onBack,
  onBookmarkChange,
}: {
  article: DevotionalArticle;
  onBack: () => void;
  onBookmarkChange: (id: string, isBookmarked: boolean) => void;
}) {
  const [article, setArticle] = useState<DevotionalArticleFull>(initialArticle);
  const [loadingContent, setLoadingContent] = useState(true);
  const [bookmarked, setBookmarked] = useState(initialArticle.isBookmarked);
  const [bookmarking, setBookmarking] = useState(false);
  const [reactions, setReactions] = useState<ReactionCount[]>(
    REACTION_TYPES.map((r) => ({ type: r.type, count: 0, hasReacted: false })),
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch full article content
  useEffect(() => {
    setLoadingContent(true);
    devotionalService.getById(initialArticle.id)
      .then((data) => {
        const full = data as DevotionalArticleFull;
        setArticle(full);
        setBookmarked(full.isBookmarked ?? initialArticle.isBookmarked);
      })
      .catch(() => {})
      .finally(() => setLoadingContent(false));
  }, [initialArticle.id, initialArticle.isBookmarked]);

  // Fetch comments
  useEffect(() => {
    setLoadingComments(true);
    devotionalService.getComments(initialArticle.id)
      .then((data) => setComments(Array.isArray(data) ? data as Comment[] : []))
      .catch(() => setComments([]))
      .finally(() => setLoadingComments(false));
  }, [initialArticle.id]);

  const handleBookmark = async () => {
    if (bookmarking) return;
    const next = !bookmarked;
    setBookmarking(true);
    setBookmarked(next);
    try {
      await devotionalService.toggleBookmark(article.id);
      onBookmarkChange(article.id, next);
    } catch {
      setBookmarked(!next);
    } finally {
      setBookmarking(false);
    }
  };

  const handleReact = async (type: string) => {
    try {
      await devotionalService.react(article.id, type);
      setReactions((prev) =>
        prev.map((r) =>
          r.type === type
            ? { ...r, hasReacted: !r.hasReacted, count: r.count + (r.hasReacted ? -1 : 1) }
            : r,
        ),
      );
    } catch {}
  };

  const handleAddComment = async () => {
    const text = commentInput.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const res = await devotionalService.addComment(article.id, text) as Comment;
      setComments((prev) => [res, ...prev]);
      setCommentInput('');
    } catch {} finally {
      setSubmitting(false);
    }
  };

  const categoryLabel = article.series?.title ?? article.category?.name ?? null;

  return (
    <div>
      {/* Back button — same pattern as PartnershipDetail */}
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-500 dark:text-[#9CA3AF] hover:text-gray-700 dark:hover:text-white cursor-pointer">
        <ArrowRight2 size={20} color="#6b7280" className="rotate-180" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="max-w-2xl">
        {/* Cover image */}
        {article.coverImageUrl && (
          <div className="w-full h-52 lg:h-64 rounded-2xl overflow-hidden mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.coverImageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-bold text-[#180426] dark:text-white mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Category + read time + bookmark row */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {categoryLabel && (
              <span className="bg-[#F7EDFF] dark:bg-[#2D1B4E] text-[#870BD6] dark:text-[#A855F7] font-medium text-xs px-3 py-1.5 rounded-full">
                {categoryLabel}
              </span>
            )}
            {article.tags?.map((t) => (
              <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-[#252830] text-gray-500 dark:text-[#9CA3AF] text-xs font-medium rounded-full">
                <Tag size={10} color="#6b7280" />{t}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {article.estimatedMinutes != null && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-[#9CA3AF]">
                <Clock size={14} color="#9ca3af" />{article.estimatedMinutes}m
              </span>
            )}
            <button
              onClick={handleBookmark}
              disabled={bookmarking}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#252830] rounded-xl transition-colors cursor-pointer"
            >
              {bookmarked
                ? <Bookmark variant="Bold" size={20} color="#870BD6" />
                : <Bookmark size={20} color="#9ca3af" />}
            </button>
          </div>
        </div>

        {/* Author row */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#252830] rounded-2xl p-4 mb-6">
          <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center font-bold text-[#870BD6] text-sm shrink-0 overflow-hidden">
            {article.author.avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={article.author.avatarUrl} alt="" className="w-full h-full object-cover" />
              : `${article.author.firstName[0]}${article.author.lastName[0]}`}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{article.author.firstName} {article.author.lastName}</p>
            {article.publishedAt && (
              <p className="text-xs text-gray-400 dark:text-[#717784]">
                {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-base text-gray-600 dark:text-[#9CA3AF] font-medium mb-6 leading-relaxed">{article.excerpt}</p>
        )}

        {/* Full content */}
        {loadingContent ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-t-[#870BD6] border-[#E9D5FF] animate-spin" />
          </div>
        ) : article.content ? (
          <div
            className="prose prose-base max-w-none text-gray-700 dark:text-[#E2E4E9] leading-relaxed
              prose-headings:text-[#180426] dark:prose-headings:text-white prose-a:text-[#870BD6] dark:prose-a:text-[#A855F7]
              prose-blockquote:border-l-[#870BD6] prose-blockquote:text-gray-600 dark:prose-blockquote:text-[#9CA3AF]
              prose-img:rounded-xl prose-pre:bg-[#1e1e1e] prose-pre:text-[#d4d4d4]"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <p className="text-gray-400 dark:text-[#717784] italic text-sm">No content available.</p>
        )}

        {/* ── Reactions ──────────────────────────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#2D313A]">
          <p className="text-xs font-semibold text-gray-400 dark:text-[#717784] uppercase tracking-wide mb-3">Reactions</p>
          <div className="flex gap-2 flex-wrap">
            {REACTION_TYPES.map((r) => {
              const current = reactions.find((rx) => rx.type === r.type);
              return (
                <button
                  key={r.type}
                  onClick={() => handleReact(r.type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                    current?.hasReacted
                      ? 'bg-[#F5EBFF] dark:bg-[#2D1B4E] border-[#D49CFD] text-[#870BD6] dark:text-[#A855F7]'
                      : 'bg-white dark:bg-[#252830] border-gray-200 dark:border-[#2D313A] text-gray-600 dark:text-[#9CA3AF] hover:border-[#D49CFD] hover:bg-[#F5EBFF] dark:hover:bg-[#2D1B4E]'
                  }`}
                >
                  <span>{r.emoji}</span>
                  <span>{r.label}</span>
                  {(current?.count ?? 0) > 0 && (
                    <span className="text-xs font-bold">{current?.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Comments ───────────────────────────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#2D313A]">
          <p className="text-xs font-semibold text-gray-400 dark:text-[#717784] uppercase tracking-wide mb-4">
            Comments {comments.length > 0 && `(${comments.length})`}
          </p>

          {/* Add comment */}
          <div className="flex gap-3 mb-6">
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
              placeholder="Share a reflection…"
              rows={2}
              className="flex-1 border border-gray-200 dark:border-[#2D313A] bg-white dark:bg-[#252830] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#717784] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#870BD6]/30 focus:border-[#870BD6] resize-none"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentInput.trim() || submitting}
              className="self-end px-4 py-2.5 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full text-sm font-semibold disabled:opacity-50 cursor-pointer hover:opacity-90 transition-opacity"
            >
              {submitting
                ? <span className="inline-block w-4 h-4 rounded-full border-2 border-t-white border-white/30 animate-spin" />
                : 'Post'}
            </button>
          </div>

          {/* Comment list */}
          {loadingComments ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-t-[#870BD6] border-[#E9D5FF] animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-[#717784] text-center py-6">Be the first to share a reflection.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-xs shrink-0 overflow-hidden">
                    {c.user?.avatarUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={c.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : `${c.user?.firstName?.[0] ?? '?'}${c.user?.lastName?.[0] ?? ''}`}
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-[#252830] rounded-2xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-[#180426] dark:text-white">
                        {c.user?.firstName} {c.user?.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-[#717784]">
                        {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
