'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Bookmark, BookmarkCheck, ChevronRight, Loader2, Flame, X, Plus } from 'lucide-react';
import { prayerService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';
import Button from '@/app/components/Button';

const CATEGORIES = [
  { id: 'PERSONAL_DEVOTION', label: 'Personal Devotion', emoji: '🙏', color: 'from-purple-500 to-purple-700' },
  { id: 'INTERCESSION', label: 'Intercession', emoji: '✝️', color: 'from-blue-500 to-blue-700' },
  { id: 'HEALING', label: 'Healing', emoji: '💚', color: 'from-green-500 to-green-700' },
  { id: 'NATION_AND_CHURCH', label: 'Nation & Church', emoji: '🌍', color: 'from-amber-500 to-amber-700' },
  { id: 'THANKSGIVING_AND_TESTIMONIES', label: 'Thanksgiving', emoji: '🎉', color: 'from-yellow-500 to-orange-600' },
  { id: 'FAMILY', label: 'Family', emoji: '👨‍👩‍👧', color: 'from-pink-500 to-pink-700' },
  { id: 'PURPOSE_AND_CALLING', label: 'Purpose & Calling', emoji: '⭐', color: 'from-indigo-500 to-indigo-700' },
];

interface Bulletin {
  id: string;
  title: string;
  content: string;
  category: string;
  bibleVerse?: string;
  isFeatured: boolean;
  isBookmarked?: boolean;
  requestCount: number;
  scheduledAt?: string;
  createdAt: string;
}

type ViewMode = 'today' | 'categories' | 'bookmarks';

export default function PrayerBullletinsTab() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const [mode, setMode] = useState<ViewMode>('today');
  const [todayBulletin, setTodayBulletin] = useState<Bulletin | null>(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryBulletins, setCategoryBulletins] = useState<Bulletin[]>([]);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bulletin[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const [selected, setSelected] = useState<Bulletin | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadToday = useCallback(async () => {
    setLoadingToday(true);
    try {
      const data = await prayerService.getTodaysBulletin() as Bulletin;
      setTodayBulletin(data);
    } catch {
      setTodayBulletin(null);
    } finally {
      setLoadingToday(false);
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

  const toggleBookmark = async (bulletin: Bulletin) => {
    try {
      await prayerService.toggleBulletinBookmark(bulletin.id);
      const update = (b: Bulletin) => b.id === bulletin.id ? { ...b, isBookmarked: !b.isBookmarked } : b;
      if (todayBulletin?.id === bulletin.id) setTodayBulletin((prev) => prev ? update(prev) : null);
      setCategoryBulletins((prev) => prev.map(update));
      setBookmarks((prev) => mode === 'bookmarks' ? prev.filter((b) => b.id !== bulletin.id) : prev.map(update));
      if (selected?.id === bulletin.id) setSelected((prev) => prev ? update(prev) : null);
    } catch {}
  };

  if (selected) {
    return (
      <BulletinDetail
        bulletin={selected}
        onBack={() => setSelected(null)}
        onBookmark={() => toggleBookmark(selected)}
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Focused prayer points for every season</p>
        {isAdmin && (
          <Button onClick={() => setShowCreate(true)} customClass="!w-fit px-5 !h-[44px] !text-white">
            <p className="flex items-center gap-1.5 text-sm"><Plus stroke="white" size={16} />New Bulletin</p>
          </Button>
        )}
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit text-sm">
        {([
          { id: 'today', label: "Today's Bulletin" },
          { id: 'categories', label: 'Categories' },
          { id: 'bookmarks', label: 'Saved' },
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

      {/* Today */}
      {mode === 'today' && (
        loadingToday ? (
          <div className="flex justify-center items-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" /></div>
        ) : todayBulletin ? (
          <FeaturedBulletin bulletin={todayBulletin} onSelect={() => setSelected(todayBulletin)} onBookmark={() => toggleBookmark(todayBulletin)} />
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400">No bulletin for today yet.</p>
          </div>
        )
      )}

      {/* Categories */}
      {mode === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`relative h-36 rounded-2xl overflow-hidden bg-linear-to-br ${cat.color} group hover:scale-[1.02] transition-transform cursor-pointer`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="relative z-10 p-5 text-left h-full flex flex-col justify-end">
                <span className="text-3xl mb-2 block">{cat.emoji}</span>
                <h3 className="text-white font-bold text-base leading-tight">{cat.label}</h3>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Bookmarks */}
      {mode === 'bookmarks' && (
        loadingBookmarks ? (
          <div className="flex justify-center items-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" /></div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-[#870BD6]" />
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

      {showCreate && isAdmin && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">Create Bulletin (Admin)</h3>
              <button onClick={() => setShowCreate(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500">Bulletin creation requires admin access through the admin panel.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FeaturedBulletin({ bulletin: b, onSelect, onBookmark }: { bulletin: Bulletin; onSelect: () => void; onBookmark: () => void }) {
  const cat = CATEGORIES.find((c) => c.id === b.category);
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-linear-to-br ${cat?.color ?? 'from-purple-600 to-purple-800'} p-6 md:p-8 mb-6 cursor-pointer`} onClick={onSelect}>
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-white/70">Today's Prayer</span>
          <button
            onClick={(e) => { e.stopPropagation(); onBookmark(); }}
            className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors cursor-pointer"
          >
            {b.isBookmarked ? <BookmarkCheck className="w-4 h-4 text-white" /> : <Bookmark className="w-4 h-4 text-white" />}
          </button>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight">{b.title}</h2>
        <p className="text-white/80 text-sm leading-relaxed line-clamp-3 mb-4">{b.content}</p>
        {b.bibleVerse && (
          <p className="text-white/60 text-xs italic">"{b.bibleVerse}"</p>
        )}
        <div className="flex items-center justify-between mt-4">
          {cat && <span className="text-xs text-white/70 font-medium">{cat.emoji} {cat.label}</span>}
          <div className="flex items-center gap-1 text-white/70 text-xs">
            <ChevronRight className="w-4 h-4" />
            <span>Read more</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BulletinCard({ bulletin: b, onSelect, onBookmark }: { bulletin: Bulletin; onSelect: () => void; onBookmark: () => void }) {
  const cat = CATEGORIES.find((c) => c.id === b.category);
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-bold uppercase tracking-wide text-white px-2 py-1 rounded-full bg-linear-to-r ${cat?.color ?? 'from-purple-500 to-purple-700'}`}>
          {cat?.emoji} {cat?.label ?? b.category}
        </span>
        <button onClick={(e) => { e.stopPropagation(); onBookmark(); }} className="text-gray-400 hover:text-[#870BD6] cursor-pointer">
          {b.isBookmarked ? <BookmarkCheck className="w-4 h-4 text-[#870BD6]" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>
      <h3 className="font-bold text-gray-900 mb-2 leading-tight">{b.title}</h3>
      <p className="text-xs text-gray-500 line-clamp-2">{b.content}</p>
    </div>
  );
}

function CategoryBulletins({
  category, bulletins, loading, onBack, onSelect, onBookmark,
}: {
  category: { id: string; label: string; emoji: string; color: string };
  bulletins: Bulletin[];
  loading: boolean;
  onBack: () => void;
  onSelect: (b: Bulletin) => void;
  onBookmark: (b: Bulletin) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
          <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">{category.emoji} {category.label}</h2>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" /></div>
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

function BulletinDetail({ bulletin: b, onBack, onBookmark }: { bulletin: Bulletin; onBack: () => void; onBookmark: () => void }) {
  const cat = CATEGORIES.find((c) => c.id === b.category);
  return (
    <div className="max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-700 cursor-pointer">
        <ChevronRight className="w-5 h-5 rotate-180" />
        <span className="text-sm">Back</span>
      </button>

      <div className={`rounded-2xl p-6 bg-linear-to-br ${cat?.color ?? 'from-purple-600 to-purple-800'} mb-6`}>
        <div className="flex items-start justify-between">
          <span className="text-3xl">{cat?.emoji}</span>
          <button onClick={onBookmark} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors cursor-pointer">
            {b.isBookmarked ? <BookmarkCheck className="w-4 h-4 text-white" /> : <Bookmark className="w-4 h-4 text-white" />}
          </button>
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-white/60 mt-2 block">{cat?.label}</span>
        <h1 className="text-2xl font-bold text-white mt-2 leading-tight">{b.title}</h1>
      </div>

      {b.bibleVerse && (
        <div className="bg-purple-50 border-l-4 border-[#870BD6] rounded-r-2xl p-4 mb-5">
          <p className="text-sm italic text-[#870BD6] font-medium">"{b.bibleVerse}"</p>
        </div>
      )}

      <div className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">{b.content}</div>
    </div>
  );
}
