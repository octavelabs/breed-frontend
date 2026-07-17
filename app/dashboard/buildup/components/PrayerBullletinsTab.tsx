'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bookmark, ArrowRight2, ArrowLeft2, Share, Heart,
  Candle, Lovely, Buildings, Cup, Profile2User, Flash,
  ShieldCross, HeartCircle, Global, Wallet, MedalStar, Sun1, Crown, Briefcase,
  Timer1, People, TickCircle, HeartAdd, MessageQuestion, Flag2,
} from 'iconsax-react';
import type { Icon } from 'iconsax-react';
import { prayerService } from '@/lib/api-services';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  label: string;
  Icon: Icon;
  gradient: string;
  vector: string;
}

interface Bulletin {
  id: string;
  title: string;
  content: string;
  points?: string[];
  category: string;
  bibleVerse?: string;
  isFeatured: boolean;
  isBookmarked?: boolean;
  hasPrayed?: boolean;
  requestCount: number;
  prayerCount?: number;
  scheduledAt?: string;
  createdAt: string;
}

type ViewMode = 'today' | 'categories' | 'bookmarks';
type TodayState = 'loading' | 'error' | 'empty' | 'success';

// ── Category definitions ───────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id: 'PERSONAL_DEVOTION', label: 'Personal Devotion', Icon: Candle, gradient: 'linear-gradient(135deg, #5B26B1, #3B0764)', vector: '/assets/clarity-vector2.svg' },
  { id: 'INTERCESSION', label: 'Intercession', Icon: Lovely, gradient: 'linear-gradient(135deg, #1D4ED8, #1E3A8A)', vector: '/assets/clarity-vector1.svg' },
  { id: 'INTERCESSION_FOR_NATION', label: 'Intercession for Nation', Icon: Flag2, gradient: 'linear-gradient(135deg, #1E40AF, #1E3A8A)', vector: '/assets/clarity-vector1.svg' },
  { id: 'HEALTH_AND_COMFORT', label: 'Health & Comfort', Icon: HeartAdd, gradient: 'linear-gradient(135deg, #047857, #064E3B)', vector: '/assets/clarity-vector3.svg' },
  { id: 'SPECIAL_REQUEST', label: 'Special Request', Icon: MessageQuestion, gradient: 'linear-gradient(135deg, #6D28D9, #4C1D95)', vector: '/assets/clarity-vector4.svg' },
  { id: 'HEALING', label: 'Healing', Icon: Heart, gradient: 'linear-gradient(135deg, #059669, #064E3B)', vector: '/assets/clarity-vector3.svg' },
  { id: 'NATION_AND_CHURCH', label: 'Nation & Church', Icon: Buildings, gradient: 'linear-gradient(135deg, #870BD6, #5B26B1)', vector: '/assets/clarity-vector2.svg' },
  { id: 'THANKSGIVING_AND_TESTIMONIES', label: 'Thanksgiving', Icon: Cup, gradient: 'linear-gradient(135deg, #D97706, #92400E)', vector: '/assets/clarity-vector4.svg' },
  { id: 'FAMILY', label: 'Family', Icon: Profile2User, gradient: 'linear-gradient(135deg, #DB2777, #9D174D)', vector: '/assets/clarity-vector3.svg' },
  { id: 'PURPOSE_AND_CALLING', label: 'Purpose & Calling', Icon: Flash, gradient: 'linear-gradient(135deg, #4338CA, #312E81)', vector: '/assets/clarity-vector1.svg' },
  { id: 'SPIRITUAL_WARFARE', label: 'Spiritual Warfare', Icon: ShieldCross, gradient: 'linear-gradient(135deg, #7F1D1D, #450A0A)', vector: '/assets/clarity-vector4.svg' },
  { id: 'MARRIAGES_AND_RELATIONSHIPS', label: 'Marriages & Relationships', Icon: HeartCircle, gradient: 'linear-gradient(135deg, #BE123C, #881337)', vector: '/assets/clarity-vector2.svg' },
  { id: 'MISSIONS_AND_EVANGELISM', label: 'Missions & Evangelism', Icon: Global, gradient: 'linear-gradient(135deg, #0F766E, #134E4A)', vector: '/assets/clarity-vector3.svg' },
  { id: 'PROVISION_AND_FINANCE', label: 'Provision & Finance', Icon: Wallet, gradient: 'linear-gradient(135deg, #A16207, #713F12)', vector: '/assets/clarity-vector4.svg' },
  { id: 'YOUTH_AND_NEXT_GENERATION', label: 'Youth & Next Generation', Icon: MedalStar, gradient: 'linear-gradient(135deg, #0E7490, #164E63)', vector: '/assets/clarity-vector1.svg' },
  { id: 'PEACE_AND_MENTAL_HEALTH', label: 'Peace & Mental Health', Icon: Sun1, gradient: 'linear-gradient(135deg, #0369A1, #0C4A6E)', vector: '/assets/clarity-vector2.svg' },
  { id: 'SALVATION', label: 'Salvation', Icon: Crown, gradient: 'linear-gradient(135deg, #EA580C, #9A3412)', vector: '/assets/clarity-vector3.svg' },
  { id: 'WORK_AND_CALLING', label: 'Work & Calling', Icon: Briefcase, gradient: 'linear-gradient(135deg, #475569, #1E293B)', vector: '/assets/clarity-vector4.svg' },
];

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #870BD6, #5B26B1)';

function formatDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getBulletinAgeLabel(bulletin: Bulletin): { label: string; isToday: boolean } {
  const dateStr = bulletin.scheduledAt ?? bulletin.createdAt;
  if (!dateStr) return { label: '', isToday: false };
  const bulletinDate = new Date(dateStr);
  const now = new Date();
  const bDay = new Date(bulletinDate.getFullYear(), bulletinDate.getMonth(), bulletinDate.getDate());
  const tDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = tDay.getTime() - bDay.getTime();
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays === 0) return { label: 'Today', isToday: true };
  if (diffDays === 1) return { label: 'Yesterday', isToday: false };
  if (diffDays < 0) return { label: 'Upcoming', isToday: false };
  return { label: `${diffDays} days ago`, isToday: false };
}

// ── Local prayer persistence (survives refresh without backend confirmation) ────

const PRAYED_KEY = 'breed_bulletin_prayed';

function getLocalPrayedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(PRAYED_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function saveLocalPrayed(bulletinId: string): void {
  try {
    const set = getLocalPrayedSet();
    set.add(bulletinId);
    localStorage.setItem(PRAYED_KEY, JSON.stringify([...set]));
  } catch {}
}

function hydratePrayed(bulletins: Bulletin[]): Bulletin[] {
  if (typeof window === 'undefined') return bulletins;
  const prayed = getLocalPrayedSet();
  return bulletins.map((b) => prayed.has(b.id) ? { ...b, hasPrayed: true } : b);
}

function parsePrayerPoints(points?: string[], content?: string): string[] {
  if (points && points.length > 0) return points;
  if (!content) return [];
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const parsed = lines
    .filter((l) => /^(\d+\.|•|-)\s/.test(l))
    .map((l) => l.replace(/^(\d+\.|•|-)\s*/, '').trim());
  return parsed.length >= 2 ? parsed : [];
}

// ── Main tab ───────────────────────────────────────────────────────────────────

export default function PrayerBullletinsTab() {
  const [mode, setMode] = useState<ViewMode>('today');

  // Today / archive state
  const [todayState, setTodayState] = useState<TodayState>('loading');
  const [bulletinList, setBulletinList] = useState<Bulletin[]>([]);
  const [viewingIndex, setViewingIndex] = useState(0); // 0 = most recent

  const viewing = bulletinList[viewingIndex] ?? null;

  // Category drill-down
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryBulletins, setCategoryBulletins] = useState<Bulletin[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bulletin[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Detail view for category/bookmarks
  const [selected, setSelected] = useState<Bulletin | null>(null);

  // ── Load today + recent archive ───────────────────────────────────────────

  const loadToday = useCallback(async () => {
    setTodayState('loading');
    try {
      // Load today's bulletin and the recent archive in parallel
      const [todayData, archiveData] = await Promise.all([
        prayerService.getTodaysBulletin() as Promise<Bulletin>,
        prayerService.getBulletins({ limit: 20 }) as Promise<{ data?: Bulletin[] }>,
      ]);

      const archiveList: Bulletin[] = archiveData?.data ?? [];

      // Merge: today goes at index 0, then remaining list without duplicates
      const merged: Bulletin[] = [todayData];
      for (const b of archiveList) {
        if (!merged.some((m) => m.id === b.id)) merged.push(b);
      }

      setBulletinList(hydratePrayed(merged));
      setViewingIndex(0);
      setTodayState('success');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      // Even if today's bulletin 404s, try to load the archive
      try {
        const archiveData = await prayerService.getBulletins({ limit: 20 }) as { data?: Bulletin[] };
        const list = archiveData?.data ?? [];
        if (list.length > 0) {
          setBulletinList(hydratePrayed(list));
          setViewingIndex(0);
          setTodayState('success');
          return;
        }
      } catch {}
      setBulletinList([]);
      setTodayState(status === 404 ? 'empty' : 'error');
    }
  }, []);

  const loadBookmarks = useCallback(async () => {
    setLoadingBookmarks(true);
    try {
      const res = await prayerService.getBulletinBookmarks({ limit: 20 }) as { data?: Bulletin[] };
      setBookmarks(res?.data ?? []);
    } catch {
      setBookmarks([]);
    } finally {
      setLoadingBookmarks(false);
    }
  }, []);

  const loadCategory = useCallback(async (cat: string) => {
    setLoadingCategory(true);
    try {
      const res = await prayerService.getBulletinsByCategory(cat, { limit: 20 }) as { data?: Bulletin[] };
      setCategoryBulletins(res?.data ?? []);
    } catch {
      setCategoryBulletins([]);
    } finally {
      setLoadingCategory(false);
    }
  }, []);

  useEffect(() => { loadToday(); }, [loadToday]);
  useEffect(() => { if (mode === 'bookmarks') loadBookmarks(); }, [mode, loadBookmarks]);
  useEffect(() => { if (selectedCategory) loadCategory(selectedCategory); }, [selectedCategory, loadCategory]);

  // ── Optimistic bulletin state updates ────────────────────────────────────

  const updateBulletinInList = useCallback((updated: Bulletin) => {
    setBulletinList((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    if (selected?.id === updated.id) setSelected(updated);
    setBookmarks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setCategoryBulletins((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }, [selected]);

  const toggleBookmark = async (bulletin: Bulletin) => {
    try {
      const res = await prayerService.toggleBulletinBookmark(bulletin.id) as { isBookmarked: boolean };
      const updated = { ...bulletin, isBookmarked: res.isBookmarked };
      updateBulletinInList(updated);
      if (mode === 'bookmarks' && !res.isBookmarked) {
        setBookmarks((prev) => prev.filter((b) => b.id !== bulletin.id));
      }
    } catch {}
  };

  const markPrayed = async (bulletin: Bulletin) => {
    if (bulletin.hasPrayed) return;
    // Optimistic update + localStorage — survives refresh regardless of backend state
    updateBulletinInList({ ...bulletin, hasPrayed: true });
    saveLocalPrayed(bulletin.id);
    try {
      const res = await prayerService.prayBulletin(bulletin.id) as { hasPrayed: boolean; prayerCount: number };
      updateBulletinInList({ ...bulletin, hasPrayed: res.hasPrayed, prayerCount: res.prayerCount });
    } catch {
      // localStorage already set; state already updated — nothing to undo
    }
  };

  // ── Category/bookmark detail (separate selected state) ────────────────────

  if (selected) {
    return (
      <BulletinDetail
        bulletin={selected}
        onBack={() => setSelected(null)}
        onBookmark={() => toggleBookmark(selected)}
        onPray={() => markPrayed(selected)}
      />
    );
  }

  if (selectedCategory && mode === 'categories') {
    return (
      <CategoryBulletins
        category={CATEGORIES.find((c) => c.id === selectedCategory)!}
        bulletins={categoryBulletins}
        loading={loadingCategory}
        onBack={() => setSelectedCategory(null)}
        onSelect={setSelected}
        onBookmark={toggleBookmark}
      />
    );
  }

  return (
    <div>
      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit text-sm">
        {([
          { id: 'today', label: "Today's Bulletin" },
          { id: 'categories', label: 'Categories' },
          { id: 'bookmarks', label: 'Saved' },
        ] as const).map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id);
              if (m.id !== 'categories') setSelectedCategory(null);
            }}
            className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${mode === m.id ? 'bg-white text-[#870BD6] shadow-sm' : 'text-gray-500'}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Today ── */}
      {mode === 'today' && (
        todayState === 'loading' ? (
          <FeaturedSkeleton />
        ) : todayState === 'error' ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Candle size={32} color="#ef4444" variant="Bold" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Couldn&apos;t load bulletin</h3>
            <p className="text-sm text-gray-500 mb-4">Check your connection and try again.</p>
            <button onClick={loadToday} className="text-sm font-semibold text-[#870BD6] hover:underline cursor-pointer">
              Retry
            </button>
          </div>
        ) : todayState === 'empty' || !viewing ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Candle size={32} color="#870BD6" variant="Bold" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">No bulletin today</h3>
            <p className="text-sm text-gray-500">Check back soon — prayer bulletins are published regularly.</p>
          </div>
        ) : (
          <TodayBulletinInline
            bulletin={viewing}
            index={viewingIndex}
            total={bulletinList.length}
            onPrev={() => setViewingIndex((i) => i + 1)}
            onNext={() => setViewingIndex((i) => i - 1)}
            onBookmark={() => toggleBookmark(viewing)}
            onPray={() => markPrayed(viewing)}
          />
        )
      )}

      {/* ── Categories ── */}
      {mode === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const { Icon } = cat;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="relative h-36 rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer text-left"
                style={{ background: cat.gradient }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <img
                  src={cat.vector}
                  alt=""
                  aria-hidden="true"
                  className="absolute -bottom-3 -right-3 h-[125%] w-auto pointer-events-none select-none opacity-50"
                />
                <div className="relative z-10 p-5 h-full flex flex-col justify-end">
                  <Icon size={28} color="rgba(255,255,255,0.9)" variant="Bold" className="mb-2" />
                  <h3 className="text-white font-bold text-base leading-tight">{cat.label}</h3>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Bookmarks ── */}
      {mode === 'bookmarks' && (
        loadingBookmarks ? (
          <Spinner />
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Bookmark size={32} color="#870BD6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">No saved bulletins</h3>
            <p className="text-sm text-gray-500">Bookmark prayer bulletins to revisit them anytime.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarks.map((b) => (
              <BulletinCard key={b.id} bulletin={b} onSelect={() => setSelected(b)} onBookmark={() => toggleBookmark(b)} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ── Shared spinner ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#870BD6]" />
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function FeaturedSkeleton() {
  return (
    <div className="max-w-2xl">
      <div className="rounded-2xl overflow-hidden mb-6 animate-pulse" style={{ background: 'linear-gradient(135deg, #c4b5fd, #7c3aed)' }}>
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="h-3 w-24 bg-white/30 rounded-full" />
            <div className="h-8 w-8 bg-white/20 rounded-full" />
          </div>
          <div className="h-7 w-3/4 bg-white/30 rounded-lg mb-3" />
          <div className="space-y-2 mb-4">
            <div className="h-3 w-full bg-white/20 rounded" />
            <div className="h-3 w-5/6 bg-white/20 rounded" />
            <div className="h-3 w-4/6 bg-white/20 rounded" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ── Today inline view (no click-through needed) ────────────────────────────────

function TodayBulletinInline({
  bulletin: b,
  index,
  total,
  onPrev,
  onNext,
  onBookmark,
  onPray,
}: {
  bulletin: Bulletin;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onBookmark: () => void;
  onPray: () => void;
}) {
  const router = useRouter();
  const cat = CATEGORIES.find((c) => c.id === b.category);
  const prayerPoints = parsePrayerPoints(b.points, b.content);
  const [checkedPoints, setCheckedPoints] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const publishDate = formatDate(b.scheduledAt ?? b.createdAt);
  const { label: ageLabel, isToday } = getBulletinAgeLabel(b);

  // Reset checklist when bulletin changes
  useEffect(() => { setCheckedPoints(new Set()); }, [b.id]);

  const togglePoint = (idx: number) => {
    setCheckedPoints((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `"${b.title}" — Prayer Bulletin`;
    if (navigator.share) {
      try { await navigator.share({ title: b.title, text, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const handleStartPraying = () => {
    const pts = parsePrayerPoints(b.points, b.content);
    try {
      sessionStorage.setItem('edify_bulletin_ctx', JSON.stringify({
        bulletinId: b.id,
        title: b.title,
        category: b.category,
        points: pts.length > 0 ? pts : (b.content ? [b.content.slice(0, 300)] : []),
      }));
    } catch {}
    router.push(`/dashboard/buildup?tab=edify&startCategory=${b.category}`);
  };

  return (
    <div className="max-w-2xl">
      {/* Archive nav */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isToday ? (
            <span className="text-xs font-bold uppercase tracking-widest text-[#870BD6]">Today</span>
          ) : (
            <span className="text-xs font-medium text-gray-400">{ageLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onNext}
            disabled={index === 0}
            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Newer bulletin"
          >
            <ArrowLeft2 size={16} color="#6b7280" />
          </button>
          <span className="text-xs text-gray-400 px-1">{index + 1} / {total}</span>
          <button
            onClick={onPrev}
            disabled={index >= total - 1}
            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Older bulletin"
          >
            <ArrowRight2 size={16} color="#6b7280" />
          </button>
        </div>
      </div>

      {/* Hero card */}
      <div
        className="relative rounded-2xl p-6 mb-6 overflow-hidden"
        style={{ background: cat?.gradient ?? DEFAULT_GRADIENT }}
      >
        {cat && (
          <img
            src={cat.vector}
            alt=""
            aria-hidden="true"
            className="absolute -bottom-3 -right-3 h-[120%] w-auto pointer-events-none select-none opacity-40"
          />
        )}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {cat && <cat.Icon size={36} color="rgba(255,255,255,0.9)" variant="Bold" />}
            <span className="text-xs font-bold uppercase tracking-widest text-white/60 mt-3 block">{cat?.label}</span>
            <h1 className="text-2xl font-bold text-white mt-2 leading-tight">{b.title}</h1>
            {publishDate && <p className="text-white/50 text-xs mt-1">{publishDate}</p>}
          </div>
          <button
            onClick={onBookmark}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors cursor-pointer shrink-0 ml-4"
          >
            {b.isBookmarked
              ? <Bookmark variant="Bold" size={16} color="white" />
              : <Bookmark size={16} color="white" />}
          </button>
        </div>

        {(b.requestCount > 0 || (b.prayerCount ?? 0) > 0) && (
          <div className="relative z-10 flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
            {b.requestCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <People size={14} color="rgba(255,255,255,0.7)" />
                {b.requestCount} {b.requestCount === 1 ? 'prayer request' : 'prayer requests'}
              </span>
            )}
            {(b.prayerCount ?? 0) > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <Heart size={14} color="rgba(255,255,255,0.7)" />
                {b.prayerCount} prayed this
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bible verse */}
      {b.bibleVerse && (
        <div className="bg-purple-50 border-l-4 border-[#870BD6] rounded-r-2xl p-4 mb-5">
          <p className="text-sm italic text-[#870BD6] font-medium">&ldquo;{b.bibleVerse}&rdquo;</p>
        </div>
      )}

      {/* Prayer points or prose content */}
      {prayerPoints.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Prayer Points</h2>
          <div className="space-y-3">
            {prayerPoints.map((point, idx) => (
              <button
                key={idx}
                onClick={() => togglePoint(idx)}
                className="w-full flex items-start gap-3 text-left group cursor-pointer"
              >
                <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checkedPoints.has(idx) ? 'border-[#870BD6] bg-[#870BD6]' : 'border-gray-300 group-hover:border-[#870BD6]'}`}>
                  {checkedPoints.has(idx) && <TickCircle size={12} color="white" variant="Bold" />}
                </span>
                <span className={`text-sm leading-relaxed transition-colors ${checkedPoints.has(idx) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {point}
                </span>
              </button>
            ))}
          </div>
          {checkedPoints.size > 0 && (
            <p className="text-xs text-[#870BD6] mt-3 font-medium">
              {checkedPoints.size} of {prayerPoints.length} covered
            </p>
          )}
        </div>
      ) : (
        <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap mb-6">{b.content}</div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onClick={onPray}
          disabled={b.hasPrayed}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full font-semibold text-sm transition-all cursor-pointer ${
            b.hasPrayed
              ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
              : 'bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white hover:opacity-90'
          }`}
        >
          {b.hasPrayed ? (
            <><TickCircle size={16} color="#16a34a" variant="Bold" /> Prayed</>
          ) : (
            <><Heart size={16} color="white" variant="Bold" /> I prayed this</>
          )}
        </button>

        <button
          onClick={handleStartPraying}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full font-semibold text-sm border border-[#870BD6] text-[#870BD6] hover:bg-purple-50 transition-colors cursor-pointer"
        >
          <Timer1 size={16} color="#870BD6" />
          Start Praying
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-full font-semibold text-sm border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors cursor-pointer"
        >
          <Share size={16} color="#6b7280" />
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>
    </div>
  );
}

// ── Bulletin card (grid) ───────────────────────────────────────────────────────

function BulletinCard({
  bulletin: b,
  onSelect,
  onBookmark,
}: {
  bulletin: Bulletin;
  onSelect: () => void;
  onBookmark: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === b.category);
  const publishDate = formatDate(b.scheduledAt ?? b.createdAt);

  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-xs font-bold uppercase tracking-wide text-white px-2.5 py-1 rounded-full flex items-center gap-1.5"
          style={{ background: cat?.gradient ?? DEFAULT_GRADIENT }}
        >
          {cat && <cat.Icon size={10} color="white" variant="Bold" />}
          {cat?.label ?? b.category}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(); }}
          className="text-gray-400 hover:text-[#870BD6] cursor-pointer"
        >
          {b.isBookmarked
            ? <Bookmark variant="Bold" size={16} color="#870BD6" />
            : <Bookmark size={16} color="#9ca3af" />}
        </button>
      </div>
      <h3 className="font-bold text-gray-900 mb-2 leading-tight">{b.title}</h3>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{b.content}</p>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        {publishDate && <span>{publishDate}</span>}
        {b.requestCount > 0 && (
          <span className="flex items-center gap-1">
            <People size={11} color="#9ca3af" />
            {b.requestCount}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Category drill-down ────────────────────────────────────────────────────────

function CategoryBulletins({
  category,
  bulletins,
  loading,
  onBack,
  onSelect,
  onBookmark,
}: {
  category: Category;
  bulletins: Bulletin[];
  loading: boolean;
  onBack: () => void;
  onSelect: (b: Bulletin) => void;
  onBookmark: (b: Bulletin) => void;
}) {
  const { Icon } = category;
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
          <ArrowLeft2 size={20} color="#6b7280" />
        </button>
        <Icon size={22} color="#180426" variant="Bold" />
        <h2 className="text-xl font-bold text-gray-900">{category.label}</h2>
      </div>
      {loading ? (
        <Spinner />
      ) : bulletins.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No bulletins in this category yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bulletins.map((b) => (
            <BulletinCard key={b.id} bulletin={b} onSelect={() => onSelect(b)} onBookmark={() => onBookmark(b)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bulletin detail (for category / bookmarks click-through) ───────────────────

function BulletinDetail({
  bulletin: b,
  onBack,
  onBookmark,
  onPray,
}: {
  bulletin: Bulletin;
  onBack: () => void;
  onBookmark: () => void;
  onPray: () => void;
}) {
  const router = useRouter();
  const cat = CATEGORIES.find((c) => c.id === b.category);
  const prayerPoints = parsePrayerPoints(b.points, b.content);
  const [checkedPoints, setCheckedPoints] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);
  const publishDate = formatDate(b.scheduledAt ?? b.createdAt);

  const togglePoint = (idx: number) => {
    setCheckedPoints((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `"${b.title}" — Prayer Bulletin`;
    if (navigator.share) {
      try { await navigator.share({ title: b.title, text, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const handleStartPraying = () => {
    const pts = parsePrayerPoints(b.points, b.content);
    try {
      sessionStorage.setItem('edify_bulletin_ctx', JSON.stringify({
        bulletinId: b.id,
        title: b.title,
        category: b.category,
        points: pts.length > 0 ? pts : (b.content ? [b.content.slice(0, 300)] : []),
      }));
    } catch {}
    router.push(`/dashboard/buildup?tab=edify&startCategory=${b.category}`);
  };

  return (
    <div className="max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-700 cursor-pointer">
        <ArrowLeft2 size={20} color="#6b7280" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div
        className="relative rounded-2xl p-6 mb-6 overflow-hidden"
        style={{ background: cat?.gradient ?? DEFAULT_GRADIENT }}
      >
        {cat && (
          <img
            src={cat.vector}
            alt=""
            aria-hidden="true"
            className="absolute -bottom-3 -right-3 h-[120%] w-auto pointer-events-none select-none opacity-40"
          />
        )}
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {cat && <cat.Icon size={36} color="rgba(255,255,255,0.9)" variant="Bold" />}
            <span className="text-xs font-bold uppercase tracking-widest text-white/60 mt-3 block">{cat?.label}</span>
            <h1 className="text-2xl font-bold text-white mt-2 leading-tight">{b.title}</h1>
            {publishDate && <p className="text-white/50 text-xs mt-1">{publishDate}</p>}
          </div>
          <button
            onClick={onBookmark}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors cursor-pointer shrink-0 ml-4"
          >
            {b.isBookmarked
              ? <Bookmark variant="Bold" size={16} color="white" />
              : <Bookmark size={16} color="white" />}
          </button>
        </div>

        {(b.requestCount > 0 || (b.prayerCount ?? 0) > 0) && (
          <div className="relative z-10 flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
            {b.requestCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <People size={14} color="rgba(255,255,255,0.7)" />
                {b.requestCount} {b.requestCount === 1 ? 'prayer request' : 'prayer requests'}
              </span>
            )}
            {(b.prayerCount ?? 0) > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                <Heart size={14} color="rgba(255,255,255,0.7)" />
                {b.prayerCount} prayed this
              </span>
            )}
          </div>
        )}
      </div>

      {b.bibleVerse && (
        <div className="bg-purple-50 border-l-4 border-[#870BD6] rounded-r-2xl p-4 mb-5">
          <p className="text-sm italic text-[#870BD6] font-medium">&ldquo;{b.bibleVerse}&rdquo;</p>
        </div>
      )}

      {prayerPoints.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Prayer Points</h2>
          <div className="space-y-3">
            {prayerPoints.map((point, idx) => (
              <button
                key={idx}
                onClick={() => togglePoint(idx)}
                className="w-full flex items-start gap-3 text-left group cursor-pointer"
              >
                <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checkedPoints.has(idx) ? 'border-[#870BD6] bg-[#870BD6]' : 'border-gray-300 group-hover:border-[#870BD6]'}`}>
                  {checkedPoints.has(idx) && <TickCircle size={12} color="white" variant="Bold" />}
                </span>
                <span className={`text-sm leading-relaxed transition-colors ${checkedPoints.has(idx) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {point}
                </span>
              </button>
            ))}
          </div>
          {checkedPoints.size > 0 && (
            <p className="text-xs text-[#870BD6] mt-3 font-medium">
              {checkedPoints.size} of {prayerPoints.length} covered
            </p>
          )}
        </div>
      ) : (
        <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap mb-6">{b.content}</div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onClick={onPray}
          disabled={b.hasPrayed}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full font-semibold text-sm transition-all cursor-pointer ${
            b.hasPrayed
              ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
              : 'bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white hover:opacity-90'
          }`}
        >
          {b.hasPrayed ? (
            <><TickCircle size={16} color="#16a34a" variant="Bold" /> Prayed</>
          ) : (
            <><Heart size={16} color="white" variant="Bold" /> I prayed this</>
          )}
        </button>

        <button
          onClick={handleStartPraying}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full font-semibold text-sm border border-[#870BD6] text-[#870BD6] hover:bg-purple-50 transition-colors cursor-pointer"
        >
          <Timer1 size={16} color="#870BD6" />
          Start Praying
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-full font-semibold text-sm border border-gray-200 text-gray-600 hover:border-gray-300 transition-colors cursor-pointer"
        >
          <Share size={16} color="#6b7280" />
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>
    </div>
  );
}
