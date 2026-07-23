'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bookmark, ArrowRight2, ArrowLeft2, Share, Heart,
  Candle, Lovely, Buildings, Cup, Profile2User, Flash,
  ShieldCross, HeartCircle, Global, Wallet, MedalStar, Sun1, Crown, Briefcase,
  Timer1, People, TickCircle, HeartAdd, MessageQuestion, Flag2,
  DocumentDownload,
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

// ── Sticky note palette (per category) ────────────────────────────────────────

const STICKY_NOTE_COLORS: Record<string, { bg: string; pinColor: string; textColor: string }> = {
  PERSONAL_DEVOTION:            { bg: 'linear-gradient(180deg,#EDE9FE 0%,#EDE9FE 12%,#DDD6FE 75%,#C4B5FD 100%)', pinColor: '#5B26B1', textColor: '#4C1D95' },
  INTERCESSION:                 { bg: 'linear-gradient(180deg,#DBEAFE 0%,#DBEAFE 12%,#BFDBFE 75%,#93C5FD 100%)', pinColor: '#1D4ED8', textColor: '#1E3A8A' },
  INTERCESSION_FOR_NATION:      { bg: 'linear-gradient(180deg,#DBEAFE 0%,#DBEAFE 12%,#BFDBFE 75%,#93C5FD 100%)', pinColor: '#1E40AF', textColor: '#1E3A8A' },
  HEALTH_AND_COMFORT:           { bg: 'linear-gradient(180deg,#D1FAE5 0%,#D1FAE5 12%,#A7F3D0 75%,#6EE7B7 100%)', pinColor: '#047857', textColor: '#064E3B' },
  SPECIAL_REQUEST:              { bg: 'linear-gradient(180deg,#EDE9FE 0%,#EDE9FE 12%,#DDD6FE 75%,#C4B5FD 100%)', pinColor: '#6D28D9', textColor: '#4C1D95' },
  HEALING:                      { bg: 'linear-gradient(180deg,#D1FAE5 0%,#D1FAE5 12%,#A7F3D0 75%,#6EE7B7 100%)', pinColor: '#059669', textColor: '#064E3B' },
  NATION_AND_CHURCH:            { bg: 'linear-gradient(180deg,#F3E8FF 0%,#F3E8FF 12%,#E9D5FF 75%,#DDD6FE 100%)', pinColor: '#870BD6', textColor: '#5B21B6' },
  THANKSGIVING_AND_TESTIMONIES: { bg: 'linear-gradient(180deg,#FEF9C3 0%,#FEF9C3 12%,#FDE68A 75%,#FCD34D 100%)', pinColor: '#D97706', textColor: '#92400E' },
  FAMILY:                       { bg: 'linear-gradient(180deg,#FCE7F3 0%,#FCE7F3 12%,#FBCFE8 75%,#F9A8D4 100%)', pinColor: '#DB2777', textColor: '#9D174D' },
  PURPOSE_AND_CALLING:          { bg: 'linear-gradient(180deg,#E0E7FF 0%,#E0E7FF 12%,#C7D2FE 75%,#A5B4FC 100%)', pinColor: '#4338CA', textColor: '#312E81' },
  SPIRITUAL_WARFARE:            { bg: 'linear-gradient(180deg,#FEE2E2 0%,#FEE2E2 12%,#FECACA 75%,#FCA5A5 100%)', pinColor: '#DC2626', textColor: '#7F1D1D' },
  MARRIAGES_AND_RELATIONSHIPS:  { bg: 'linear-gradient(180deg,#FFE4E6 0%,#FFE4E6 12%,#FECDD3 75%,#FDA4AF 100%)', pinColor: '#BE123C', textColor: '#881337' },
  MISSIONS_AND_EVANGELISM:      { bg: 'linear-gradient(180deg,#CCFBF1 0%,#CCFBF1 12%,#99F6E4 75%,#5EEAD4 100%)', pinColor: '#0F766E', textColor: '#134E4A' },
  PROVISION_AND_FINANCE:        { bg: 'linear-gradient(180deg,#FEF9C3 0%,#FEF9C3 12%,#FDE68A 75%,#FCD34D 100%)', pinColor: '#A16207', textColor: '#713F12' },
  YOUTH_AND_NEXT_GENERATION:    { bg: 'linear-gradient(180deg,#CFFAFE 0%,#CFFAFE 12%,#A5F3FC 75%,#67E8F9 100%)', pinColor: '#0E7490', textColor: '#164E63' },
  PEACE_AND_MENTAL_HEALTH:      { bg: 'linear-gradient(180deg,#DBEAFE 0%,#DBEAFE 12%,#BAD5FD 75%,#93C5FD 100%)', pinColor: '#0369A1', textColor: '#0C4A6E' },
  SALVATION:                    { bg: 'linear-gradient(180deg,#FFEDD5 0%,#FFEDD5 12%,#FED7AA 75%,#FDC592 100%)', pinColor: '#EA580C', textColor: '#9A3412' },
  WORK_AND_CALLING:             { bg: 'linear-gradient(180deg,#F1F5F9 0%,#F1F5F9 12%,#E2E8F0 75%,#CBD5E1 100%)', pinColor: '#475569', textColor: '#1E293B' },
};

const DEFAULT_STICKY = { bg: 'linear-gradient(180deg,#EDE9FE 0%,#EDE9FE 12%,#DDD6FE 75%,#C4B5FD 100%)', pinColor: '#870BD6', textColor: '#4C1D95' };

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

      // Merge: today first, then archive — deduplicate by id AND by calendar date
      // (guards against multiple DB rows for the same day caused by cron race conditions)
      const merged: Bulletin[] = [todayData];
      const seenDates = new Set<string>();
      const toDateKey = (b: Bulletin) => {
        const d = new Date(b.scheduledAt ?? b.createdAt);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      };
      seenDates.add(toDateKey(todayData));
      for (const b of archiveList) {
        const dateKey = toDateKey(b);
        if (!merged.some((m) => m.id === b.id) && !seenDates.has(dateKey)) {
          merged.push(b);
          seenDates.add(dateKey);
        }
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
      <div className="flex gap-1 bg-gray-100 dark:bg-[#252830] rounded-xl p-1 mb-6 w-fit text-sm">
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
            className={`px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${mode === m.id ? 'bg-white dark:bg-[#181A1F] text-[#870BD6] dark:text-[#A855F7] shadow-sm' : 'text-gray-500 dark:text-[#717784]'}`}
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
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Couldn&apos;t load bulletin</h3>
            <p className="text-sm text-gray-500 dark:text-[#9CA3AF] mb-4">Check your connection and try again.</p>
            <button onClick={loadToday} className="text-sm font-semibold text-[#870BD6] hover:underline cursor-pointer">
              Retry
            </button>
          </div>
        ) : todayState === 'empty' || !viewing ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-[#2D1B4E] flex items-center justify-center mx-auto mb-4">
              <Candle size={32} color="#870BD6" variant="Bold" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">No bulletin today</h3>
            <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">Check back soon — prayer bulletins are published regularly.</p>
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
            <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-[#2D1B4E] flex items-center justify-center mx-auto mb-4">
              <Bookmark size={32} color="#870BD6" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">No saved bulletins</h3>
            <p className="text-sm text-gray-500 dark:text-[#9CA3AF]">Bookmark prayer bulletins to revisit them anytime.</p>
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
        <div className="h-4 w-1/3 bg-gray-200 dark:bg-[#2D313A] rounded" />
        <div className="h-4 w-full bg-gray-100 dark:bg-[#252830] rounded" />
        <div className="h-4 w-full bg-gray-100 dark:bg-[#252830] rounded" />
      </div>
    </div>
  );
}

// ── Breed logo as base64 data URI so html2canvas captures it without network requests ──
const BREED_LOGO_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI0IiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTI0IDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNOS4yNTE1NiAxNy44NTIzQzEwLjk2NTYgMTYuMDE4IDEzLjE5MDkgMTUuMTAwOCAxNS45MjczIDE1LjEwMDhDMTkuMTQ0OSAxNS4xMDA4IDIxLjYyNTggMTYuMTUzMyAyMy4zNjk5IDE4LjI1ODJDMjUuMTE0IDIwLjMzMzEgMjUuOTg2IDIzLjQxNTQgMjUuOTg2IDI3LjUwNUMyNS45ODYgMzEuNjI0OCAyNS4xMTQgMzQuNzM3MSAyMy4zNjk5IDM2Ljg0MjFDMjEuNjI1OCAzOC45NDcgMTkuMTQ0OSAzOS45OTk1IDE1LjkyNzMgMzkuOTk5NUMxMi42MTk1IDM5Ljk5OTUgMTAuMDkzNiAzOC42OTE0IDguMzQ5NDQgMzYuMDc1M0w3LjU4MjYzIDM5LjQ1ODJIMC4yNzUzOTFWNi43NTYxSDkuMjUxNTZWMTcuODUyM1pNMTMuMTMwNyAyMS43MzE0QzExLjgwNzYgMjEuNzMxNCAxMC44MTUzIDIyLjIxMjYgMTAuMTUzNyAyMy4xNzQ4QzkuNDkyMTMgMjQuMTA3IDkuMTYxMzUgMjUuMzI0OSA5LjE2MTM1IDI2LjgyODVWMjguMzE3QzkuMTYxMzUgMjkuODIwNSA5LjQ5MjEzIDMxLjAzODQgMTAuMTUzNyAzMS45NzA2QzEwLjgxNTMgMzIuOTAyOCAxMS44MDc2IDMzLjM2ODkgMTMuMTMwNyAzMy4zNjg5QzE1LjcxNjggMzMuMzY4OSAxNy4wMDk5IDMxLjgzNTMgMTcuMDA5OSAyOC43NjhWMjYuMzc3NEMxNy4wMDk5IDIzLjI4MDEgMTUuNzE2OCAyMS43MzE0IDEzLjEzMDcgMjEuNzMxNFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik00MC40NjU1IDE1LjU5NjlDNDEuMTU3MSAxNS41OTY5IDQxLjc3MzYgMTUuNjg3MSA0Mi4zMTQ4IDE1Ljg2NzZDNDIuODU2MSAxNi4wMTc5IDQzLjEyNjggMTYuMTA4MSA0My4xMjY4IDE2LjEzODJWMjMuNjcxSDQwLjIzOTlDMzguMzc1NiAyMy42NzEgMzcuMDIyNCAyNC4xNTIxIDM2LjE4MDQgMjUuMTE0NEMzNS4zNjg1IDI2LjA3NjYgMzQuOTYyNSAyNy41MDUgMzQuOTYyNSAyOS4zOTk1VjM5Ljk5OTVIMjUuOTg2M1YxNi4xODMzSDMzLjMzODdMMzMuOTI1MSAxOS43OTE4QzM0LjQ2NjMgMTguNDA4NiAzNS4zMjM0IDE3LjM3MTEgMzYuNDk2MSAxNi42Nzk1QzM3LjY2ODkgMTUuOTU3OCAzOC45OTIgMTUuNTk2OSA0MC40NjU1IDE1LjU5NjlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTYuNTIyNiAxNS4xMDExQzYwLjg4MjkgMTUuMTAxMSA2NC4yMDU3IDE2LjEyMzUgNjYuNDkxMSAxOC4xNjgzQzY4LjgwNjUgMjAuMjEzMSA2OS45NjQzIDIzLjM0MDUgNjkuOTY0MyAyNy41NTA0VjI5LjA4NDFINTIuMTAyMUM1Mi4xMDIxIDMwLjc5ODEgNTIuNDc4IDMyLjA5MTEgNTMuMjI5OCAzMi45NjMyQzU0LjAxMTcgMzMuODM1MyA1NS4yMjk1IDM0LjI3MTMgNTYuODgzNCAzNC4yNzEzQzU4LjM4NyAzNC4yNzEzIDU5LjQ4NDYgMzMuOTU1NSA2MC4xNzYyIDMzLjMyNDFDNjAuODk3OSAzMi42OTI2IDYxLjI1ODcgMzEuODUwNiA2MS4yNTg3IDMwLjc5ODFINjkuOTY0M0M2OS45NjQzIDMzLjY4NDkgNjguODY2NyAzNS45NDAyIDY2LjY3MTUgMzcuNTY0MUM2NC40NzYzIDM5LjE4NzkgNjEuMjczOCAzOS45OTk4IDU3LjA2MzkgMzkuOTk5OEM1Mi42NDM0IDM5Ljk5OTggNDkuMjE1MyAzOC45Nzc0IDQ2Ljc3OTYgMzYuOTMyNkM0NC4zNDM4IDM0Ljg1NzcgNDMuMTI2IDMxLjczMDMgNDMuMTI2IDI3LjU1MDRDNDMuMTI2IDIzLjQ2MDggNDQuMzEzOCAyMC4zNjM1IDQ2LjY4OTQgMTguMjU4NUM0OS4wNjUgMTYuMTUzNiA1Mi4zNDI3IDE1LjEwMTEgNTYuNTIyNiAxNS4xMDExWk01Ni44ODM0IDIwLjgyOTZDNTQuMDU2OCAyMC44Mjk2IDUyLjQ3OCAyMi4xNjc3IDUyLjE0NzMgMjQuODQ0MUg2MC44OTc5QzYwLjg5NzkgMjMuNjExMSA2MC41MzcgMjIuNjMzOCA1OS44MTUzIDIxLjkxMjFDNTkuMTIzNyAyMS4xOTA0IDU4LjE0NjQgMjAuODI5NiA1Ni44ODM0IDIwLjgyOTZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODMuMzYxNCAxNS4xMDA4Qzg3LjcyMTcgMTUuMTAwOCA5MS4wNDQ2IDE2LjEyMzIgOTMuMzMgMTguMTY4MUM5NS42NDU0IDIwLjIxMjkgOTYuODAzMSAyMy4zNDAzIDk2LjgwMzEgMjcuNTUwMlYyOS4wODM4SDc4Ljk0MUM3OC45NDEgMzAuNzk3OSA3OS4zMTY5IDMyLjA5MDkgODAuMDY4NyAzMi45NjNDODAuODUwNSAzMy44MzUgODIuMDY4NCAzNC4yNzEgODMuNzIyMyAzNC4yNzFDODUuMjI1OCAzNC4yNzEgODYuMzIzNCAzMy45NTUzIDg3LjAxNTEgMzMuMzIzOEM4Ny43MzY4IDMyLjY5MjMgODguMDk3NiAzMS44NTAzIDg4LjA5NzYgMzAuNzk3OUg5Ni44MDMxQzk2LjgwMzEgMzMuNjg0NyA5NS43MDU2IDM1Ljk0IDkzLjUxMDQgMzcuNTYzOEM5MS4zMTUyIDM5LjE4NzYgODguMTEyNiAzOS45OTk2IDgzLjkwMjcgMzkuOTk5NkM3OS40ODIzIDM5Ljk5OTYgNzYuMDU0MiAzOC45NzcxIDczLjYxODUgMzYuOTMyM0M3MS4xODI3IDM0Ljg1NzQgNjkuOTY0OCAzMS43MzAxIDY5Ljk2NDggMjcuNTUwMkM2OS45NjQ4IDIzLjQ2MDUgNzEuMTUyNiAyMC4zNjMyIDczLjUyODIgMTguMjU4M0M3NS45MDM5IDE2LjE1MzMgNzkuMTgxNiAxNS4xMDA4IDgzLjM2MTQgMTUuMTAwOFpNODMuNzIyMyAyMC44MjkzQzgwLjg5NTYgMjAuODI5MyA3OS4zMTY5IDIyLjE2NzUgNzguOTg2MSAyNC44NDM4SDg3LjczNjhDODcuNzM2OCAyMy42MTA5IDg3LjM3NTkgMjIuNjMzNiA4Ni42NTQyIDIxLjkxMTlDODUuOTYyNiAyMS4xOTAyIDg0Ljk4NTMgMjAuODI5MyA4My43MjIzIDIwLjgyOTNaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTE1LjIwNiAzOS40NTg1TDExNC40MzkgMzYuMDc1NUMxMTIuNjk1IDM4LjY5MTcgMTEwLjE2OSAzOS45OTk4IDEwNi44NjEgMzkuOTk5OEMxMDMuNjQ0IDM5Ljk5OTggMTAxLjE2MyAzOC45NDczIDk5LjQxODkgMzYuODQyM0M5Ny42NzQ4IDM0LjczNzQgOTYuODAyNyAzMS42MjUgOTYuODAyNyAyNy41MDUzQzk2LjgwMjcgMjMuNDE1NiA5Ny42NzQ4IDIwLjMzMzQgOTkuNDE4OSAxOC4yNTg1QzEwMS4xNjMgMTYuMTUzNSAxMDMuNjQ0IDE1LjEwMSAxMDYuODYxIDE1LjEwMUMxMDkuNTk4IDE1LjEwMSAxMTEuODIzIDE2LjAxODIgMTEzLjUzNyAxNy44NTI1VjYuNzU2MzVIMTIyLjUxM1YzOS40NTg1SDExNS4yMDZaTTEwOS42NTggMjEuNzMxN0MxMDcuMDcyIDIxLjczMTcgMTA1Ljc3OSAyMy4yODAzIDEwNS43NzkgMjYuMzc3NlYyOC43NjgzQzEwNS43NzkgMzEuODM1NSAxMDcuMDcyIDMzLjM2OTEgMTA5LjY1OCAzMy4zNjkxQzExMC45ODEgMzMuMzY5MSAxMTEuOTc0IDMyLjkwMyAxMTIuNjM1IDMxLjk3MDhDMTEzLjI5NyAzMS4wMzg2IDExMy42MjcgMjkuODIwOCAxMTMuNjI3IDI4LjMxNzJWMjYuODI4N0MxMTMuNjI3IDI1LjMyNTEgMTEzLjI5NyAyNC4xMDczIDExMi42MzUgMjMuMTc1MUMxMTEuOTc0IDIyLjIxMjggMTEwLjk4MSAyMS43MzE3IDEwOS42NTggMjEuNzMxN1oiIGZpbGw9IndoaXRlIi8+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8xMjg3XzE1NDc0KSI+CjxwYXRoIGQ9Ik0xMy4wMzE1IDEzLjIwMTlMMTEuNTMyNiAxMC4xMDIzQzEwLjQwNTkgNy43NzI2MyAxMS4wNjU5IDUuMDQxNTcgMTIuOTcyNCAzLjQ2MDY3QzE0LjE1OTIgMi40NzY1NiAxNS4yOTE1IDEuNDI4NTEgMTYuMzMwNiAwLjI4OTUzOUwxNi41OTQ4IDBMMTcuMjA5IDAuODExNTI4QzE3Ljk2NjkgMS44MTI4NiAxOC41NDUyIDIuODc3NjIgMTguODg2OSAzLjk1NjUxTDEzLjAzMTUgMTMuMjAxOVoiIGZpbGw9IiMwMEFBOTUiLz4KPHBhdGggZD0iTTIyLjE4NjQgMy44NjU5TDIxLjk4NjggMi44Njc5MkMyMSA1LjE5MzkgMTguNDY5IDYuNDI5ODIgMTcuMDE4MyA4LjAzNDc4QzE0LjQ4MTMgMTAuODQxNSAxMy4wMzEyIDEzLjIwMTYgMTMuMDMxMiAxMy4yMDE2SDE0LjUzMzRDMjEuMjA5OCAxMy4yMDE2IDIzLjE1MjYgOC42OTU0OSAyMi4xODY0IDMuODY1OVoiIGZpbGw9IiMwMENDNzYiLz4KPHBhdGggZD0iTTIxLjk4NjggMi44Njc5MkwyMS42MjI5IDMuMDEzNThDMjAuNzI2MyAzLjM3MjQ4IDE5LjgxMjMgMy42ODMzNCAxOC44ODY3IDMuOTU2MjdWMy45NTYzQzE4LjMzNDYgNC4xMTkxMSAxNy43NzgzIDQuMjY4NCAxNy4yMTkxIDQuNDA2MzVDMTQuODE0NCA0Ljk5OTUzIDEzLjAzMTIgNy4xNzA4NSAxMy4wMzEyIDkuNzU4NjVWMTMuMjAxNkMxMy4wMzEzIDEzLjIwMTYgMTkuMjc0MyA5LjI2MTU1IDIxLjk4NjggMi44Njc5MloiIGZpbGw9IiNBNUU4ODciLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xMjg3XzE1NDc0Ij4KPHJlY3Qgd2lkdGg9IjEzLjIwMTkiIGhlaWdodD0iMTMuMjAxOSIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwLjA5OTYpIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==';

// ── Prayer Poster Modal ────────────────────────────────────────────────────────

function PrayerPosterModal({ bulletin, cat, onClose }: {
  bulletin: Bulletin;
  cat: Category | undefined;
  onClose: () => void;
}) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'done'>('idle');

  const prayerPoints = parsePrayerPoints(bulletin.points, bulletin.content);
  const publishDate = formatDate(bulletin.scheduledAt ?? bulletin.createdAt);
  const gradient = cat?.gradient ?? DEFAULT_GRADIENT;

  const [c1, c2] = (() => {
    const m = gradient.match(/#[0-9A-Fa-f]{6}/g);
    return m && m.length >= 2 ? [m[0], m[1]] : ['#870BD6', '#5B26B1'];
  })();

  const capture = async (): Promise<Blob> => {
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(posterRef.current!, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
  };

  // Single handler: native share sheet on mobile (shows "Save to Photos" / "Save to images"),
  // falls back to <a download> on desktop browsers that don't support file sharing.
  const handleShare = async () => {
    setStatus('generating');
    try {
      const blob = await capture();
      const file = new File([blob], 'breed-prayer-poster.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: bulletin.title });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'breed-prayer-poster.png';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch (err) {
      // user dismissed the share sheet — not an error
      if (err instanceof Error && err.name !== 'AbortError') console.error(err);
    } finally {
      setStatus('idle');
    }
  };

  const displayPoints = prayerPoints.slice(0, 5);
  const busy = status === 'generating';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center gap-5 max-h-[90vh] overflow-y-auto py-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Poster */}
        <div
          ref={posterRef}
          style={{
            width: '360px',
            flexShrink: 0,
            background: `linear-gradient(145deg, ${c1}, ${c2})`,
            borderRadius: '20px',
            padding: '32px 28px 28px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative orbs */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', top: '40%', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BREED_LOGO_SRC} alt="Breed" style={{ height: '22px', width: 'auto', opacity: 0.85 }} />
            {publishDate && <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>{publishDate}</span>}
          </div>

          {/* Category */}
          {cat && (
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', display: 'block', marginBottom: '10px', position: 'relative' }}>
              {cat.label}
            </span>
          )}

          {/* Title */}
          <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 800, lineHeight: 1.25, margin: '0 0 22px', position: 'relative' }}>
            {bulletin.title}
          </h2>

          {/* Bible verse */}
          {bulletin.bibleVerse && (
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', marginBottom: '22px', borderLeft: '3px solid rgba(255,255,255,0.35)', position: 'relative' }}>
              <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.65, margin: 0 }}>
                &ldquo;{bulletin.bibleVerse}&rdquo;
              </p>
            </div>
          )}

          {/* Prayer points */}
          {displayPoints.length > 0 && (
            <div style={{ position: 'relative' }}>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
                Prayer Points
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {displayPoints.map((pt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', lineHeight: 1, flexShrink: 0, marginTop: '1px' }}>•</span>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: 1.55, margin: 0, flex: 1 }}>
                      {pt.length > 90 ? pt.slice(0, 87) + '…' : pt}
                    </p>
                  </div>
                ))}
                {prayerPoints.length > 5 && (
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginTop: '2px' }}>
                    +{prayerPoints.length - 5} more on Breed
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={handleShare}
            disabled={busy}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {busy
              ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <DocumentDownload size={16} color="white" />
            }
            Save / Share
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center px-6 py-3 rounded-full border border-white/25 text-white font-semibold text-sm hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
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
  const [showPoster, setShowPoster] = useState(false);
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
            <span className="text-xs font-medium text-gray-400 dark:text-[#717784]">{ageLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onNext}
            disabled={index === 0}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#252830] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Newer bulletin"
          >
            <ArrowLeft2 size={16} color="#6b7280" />
          </button>
          <span className="text-xs text-gray-400 dark:text-[#717784] px-1">{index + 1} / {total}</span>
          <button
            onClick={onPrev}
            disabled={index >= total - 1}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#252830] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
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
        <div className="bg-purple-50 dark:bg-[#2D1B4E] border-l-4 border-[#870BD6] rounded-r-2xl p-4 mb-5">
          <p className="text-sm italic text-[#870BD6] dark:text-[#A855F7] font-medium">&ldquo;{b.bibleVerse}&rdquo;</p>
        </div>
      )}

      {/* Prayer points or prose content */}
      {prayerPoints.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wide mb-3">Prayer Points</h2>
          <div className="space-y-3">
            {prayerPoints.map((point, idx) => (
              <button
                key={idx}
                onClick={() => togglePoint(idx)}
                className="w-full flex items-start gap-3 text-left group cursor-pointer"
              >
                <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checkedPoints.has(idx) ? 'border-[#870BD6] bg-[#870BD6]' : 'border-gray-300 dark:border-[#717784] group-hover:border-[#870BD6]'}`}>
                  {checkedPoints.has(idx) && <TickCircle size={12} color="white" variant="Bold" />}
                </span>
                <span className={`text-sm leading-relaxed transition-colors ${checkedPoints.has(idx) ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-[#E2E4E9]'}`}>
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
        <div className="text-gray-700 dark:text-[#E2E4E9] leading-relaxed text-base whitespace-pre-wrap mb-6">{b.content}</div>
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
          className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full font-semibold text-sm border border-[#870BD6] text-[#870BD6] hover:bg-purple-50 dark:hover:bg-[#2D1B4E] transition-colors cursor-pointer"
        >
          <Timer1 size={16} color="#870BD6" />
          Start Praying
        </button>

        <button
          onClick={() => setShowPoster(true)}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-full font-semibold text-sm border border-gray-200 dark:border-[#2D313A] text-gray-600 dark:text-[#9CA3AF] hover:border-gray-300 transition-colors cursor-pointer"
        >
          <Share size={16} color="#6b7280" />
          Share
        </button>
      </div>

      {showPoster && (
        <PrayerPosterModal bulletin={b} cat={cat} onClose={() => setShowPoster(false)} />
      )}
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
      className="bg-white dark:bg-[#181A1F] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-[#2D313A] cursor-pointer"
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
          className="text-gray-400 dark:text-[#717784] hover:text-[#870BD6] cursor-pointer"
        >
          {b.isBookmarked
            ? <Bookmark variant="Bold" size={16} color="#870BD6" />
            : <Bookmark size={16} color="#9ca3af" />}
        </button>
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-2 leading-tight">{b.title}</h3>
      <p className="text-xs text-gray-500 dark:text-[#9CA3AF] line-clamp-2 mb-3">{b.content}</p>
      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-[#717784]">
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

// ── Sticky note pin ────────────────────────────────────────────────────────────

function StickyPin({ color }: { color: string }) {
  return (
    <svg width="22" height="32" viewBox="0 0 22 32" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="10" fill={color} />
      <circle cx="11" cy="11" r="6" fill="rgba(255,255,255,0.2)" />
      <circle cx="8.5" cy="8.5" r="2.5" fill="rgba(255,255,255,0.35)" />
      <line x1="11" y1="21" x2="11" y2="32" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Sticky note card (category drill-down only) ────────────────────────────────

function StickyBulletinCard({
  bulletin: b,
  onSelect,
  onBookmark,
}: {
  bulletin: Bulletin;
  onSelect: () => void;
  onBookmark: () => void;
}) {
  const cat = CATEGORIES.find((c) => c.id === b.category);
  const note = STICKY_NOTE_COLORS[b.category] ?? DEFAULT_STICKY;
  const publishDate = formatDate(b.scheduledAt ?? b.createdAt);

  return (
    <div className="relative pt-4 cursor-pointer group" onClick={onSelect}>
      {/* Pushpin — drop-shadow makes it look like it protrudes from the wall */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
        style={{ filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.55))' }}
      >
        <StickyPin color={note.pinColor} />
      </div>

      {/* Small shadow cast by the pin onto the paper surface */}
      <div
        className="absolute z-10 pointer-events-none rounded-full"
        style={{ width: 12, height: 5, top: 22, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.22)', filter: 'blur(2px)' }}
      />

      {/* Note face */}
      <div
        className="relative w-full px-6 pt-6 pb-12"
        style={{ clipPath: 'url(#stickyClip)', background: note.bg, minHeight: '210px' }}
      >
        {/* Bookmark */}
        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(); }}
          className="absolute top-3 right-3 z-10 cursor-pointer p-2.5 rounded-full opacity-70 hover:opacity-100 hover:bg-black/5 transition-all"
          aria-label={b.isBookmarked ? 'Remove bookmark' : 'Save bulletin'}
        >
          {b.isBookmarked
            ? <Bookmark variant="Bold" size={15} color={note.pinColor} />
            : <Bookmark size={15} color={note.textColor} />}
        </button>

        {/* Category eyebrow */}
        <p
          className="text-[9px] font-bold uppercase tracking-widest mb-2 pr-5"
          style={{ color: note.pinColor, fontFamily: 'var(--font-inter)' }}
        >
          {cat?.label ?? b.category}
        </p>

        {/* Title */}
        <h3
          className="text-sm leading-snug mb-3 pr-1 group-hover:underline underline-offset-2 decoration-current"
          style={{ color: note.textColor, fontFamily: 'var(--font-courgette)' }}
        >
          {b.title}
        </h3>

        {/* Content excerpt */}
        <p
          className="text-sm leading-relaxed line-clamp-4"
          style={{ color: note.textColor, opacity: 0.72, fontFamily: 'var(--font-courgette)' }}
        >
          {b.content}
        </p>

        {/* Date */}
        {publishDate && (
          <p
            className="mt-3 text-[9px]"
            style={{ color: note.textColor, opacity: 0.5, fontFamily: 'var(--font-inter)' }}
          >
            {publishDate}
          </p>
        )}
      </div>
    </div>
  );
}

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
      {/* Shared clip-path definition for sticky notes */}
      <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
        <defs>
          <clipPath id="stickyClip" clipPathUnits="objectBoundingBox">
            <path
              d="M 0 0 Q 0 0.69, 0.03 0.96 0.03 0.96, 1 0.96 Q 0.96 0.69, 0.96 0 0.96 0, 0 0"
              strokeLinejoin="round"
              strokeLinecap="square"
            />
          </clipPath>
        </defs>
      </svg>

      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-[#252830] rounded-full cursor-pointer">
          <ArrowLeft2 size={20} color="#6b7280" />
        </button>
        <Icon size={22} color="#180426" variant="Bold" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{category.label}</h2>
      </div>
      {loading ? (
        <Spinner />
      ) : bulletins.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-[#717784] text-sm">No bulletins in this category yet.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-12">
          {bulletins.map((b) => (
            <StickyBulletinCard key={b.id} bulletin={b} onSelect={() => onSelect(b)} onBookmark={() => onBookmark(b)} />
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
  const [showPoster, setShowPoster] = useState(false);
  const publishDate = formatDate(b.scheduledAt ?? b.createdAt);

  const togglePoint = (idx: number) => {
    setCheckedPoints((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
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
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-500 dark:text-[#9CA3AF] hover:text-gray-700 dark:hover:text-white cursor-pointer">
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
        <div className="bg-purple-50 dark:bg-[#2D1B4E] border-l-4 border-[#870BD6] rounded-r-2xl p-4 mb-5">
          <p className="text-sm italic text-[#870BD6] dark:text-[#A855F7] font-medium">&ldquo;{b.bibleVerse}&rdquo;</p>
        </div>
      )}

      {prayerPoints.length > 0 ? (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-gray-500 dark:text-[#9CA3AF] uppercase tracking-wide mb-3">Prayer Points</h2>
          <div className="space-y-3">
            {prayerPoints.map((point, idx) => (
              <button
                key={idx}
                onClick={() => togglePoint(idx)}
                className="w-full flex items-start gap-3 text-left group cursor-pointer"
              >
                <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checkedPoints.has(idx) ? 'border-[#870BD6] bg-[#870BD6]' : 'border-gray-300 dark:border-[#717784] group-hover:border-[#870BD6]'}`}>
                  {checkedPoints.has(idx) && <TickCircle size={12} color="white" variant="Bold" />}
                </span>
                <span className={`text-sm leading-relaxed transition-colors ${checkedPoints.has(idx) ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-[#E2E4E9]'}`}>
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
        <div className="text-gray-700 dark:text-[#E2E4E9] leading-relaxed text-base whitespace-pre-wrap mb-6">{b.content}</div>
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
          className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-full font-semibold text-sm border border-[#870BD6] text-[#870BD6] hover:bg-purple-50 dark:hover:bg-[#2D1B4E] transition-colors cursor-pointer"
        >
          <Timer1 size={16} color="#870BD6" />
          Start Praying
        </button>

        <button
          onClick={() => setShowPoster(true)}
          className="flex items-center justify-center gap-2 py-3 px-5 rounded-full font-semibold text-sm border border-gray-200 dark:border-[#2D313A] text-gray-600 dark:text-[#9CA3AF] hover:border-gray-300 transition-colors cursor-pointer"
        >
          <Share size={16} color="#6b7280" />
          Share
        </button>
      </div>

      {showPoster && (
        <PrayerPosterModal bulletin={b} cat={cat} onClose={() => setShowPoster(false)} />
      )}
    </div>
  );
}
