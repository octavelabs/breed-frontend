'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Flame, Plus, ChevronRight, Loader2, X, Video, Clock,
  CheckCircle, Calendar, Trash2,
} from 'lucide-react';
import { accountabilityService, userService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/Button';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS: Record<string, string> = {
  MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun',
};

interface Partner {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string;
  email: string;
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastPrayedAt?: string;
}

interface Partnership {
  id: string;
  partner?: Partner;
  prayerDays: string[];
  prayerTime: string;
  timezone: string;
  status: 'PENDING' | 'ACTIVE' | 'ENDED';
  isCreator: boolean;
  invite?: { status: string; email: string };
  myStreak?: Streak;
  streaks?: Array<{ user: Partner; currentStreak: number; longestStreak: number; lastPrayedAt?: string; isMe: boolean }>;
  lastSession?: { startedAt: string };
  createdAt: string;
}

interface UserSuggestion {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export default function AccountabilityTab() {
  const { user } = useAuth();
  const router = useRouter();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Partnership | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  void user;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountabilityService.getMyPartnerships() as Partnership[];
      setPartnerships(Array.isArray(data) ? data : []);
    } catch {
      setPartnerships([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const refreshSelected = async (id: string) => {
    try {
      const data = await accountabilityService.getPartnershipById(id) as Partnership;
      setSelected(data);
      setPartnerships((prev) => prev.map((p) => (p.id === id ? data : p)));
    } catch {}
  };

  if (selected) {
    return (
      <PartnershipDetail
        partnership={selected}
        onBack={() => setSelected(null)}
        onRefresh={() => refreshSelected(selected.id)}
        onEnd={async () => {
          await accountabilityService.endPartnership(selected.id);
          setSelected(null);
          load();
        }}
        router={router}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">1-on-1 live prayer sessions with your partner</p>
        <Button onClick={() => setShowCreate(true)} customClass="!w-fit px-5 !h-[44px] !text-white">
          <p className="flex items-center gap-1.5 text-sm"><Plus stroke="white" size={16} />Add Partner</p>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" />
        </div>
      ) : partnerships.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <div className="w-16 h-16 rounded-full bg-[#F5EBFF] flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-[#870BD6]" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">No prayer partners yet</h3>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
            Invite someone to pray with you at a set time each week.
          </p>
          <Button onClick={() => setShowCreate(true)} customClass="!w-fit px-6 !h-[44px] !text-white">
            <p className="flex items-center gap-1.5 text-sm"><Plus stroke="white" size={16} />Invite a Prayer Partner</p>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partnerships.map((p) => (
            <PartnershipCard
              key={p.id}
              partnership={p}
              onClick={() => setSelected(p)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePartnershipModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}

function PartnershipCard({ partnership: p, onClick }: { partnership: Partnership; onClick: () => void }) {
  const isPending = p.status === 'PENDING';
  const partnerName = p.partner
    ? `${p.partner.firstName} ${p.partner.lastName}`
    : p.invite?.email ?? 'Pending invite';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#870BD6] to-[#5B26B1] flex items-center justify-center text-white font-bold text-sm">
            {p.partner ? `${p.partner.firstName[0]}${p.partner.lastName[0]}` : '?'}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{partnerName}</p>
            {p.partner?.username && (
              <p className="text-xs text-gray-400">@{p.partner.username}</p>
            )}
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          isPending ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
        }`}>
          {isPending ? 'Pending' : 'Active'}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {p.prayerTime}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {p.prayerDays.map((d) => DAY_LABELS[d] ?? d).join(', ')}
        </span>
      </div>

      {p.myStreak && p.myStreak.currentStreak > 0 && (
        <div className="flex items-center gap-1 text-xs font-semibold text-orange-500">
          <Flame className="w-3.5 h-3.5" />
          {p.myStreak.currentStreak} day streak
        </div>
      )}
    </div>
  );
}

function PartnershipDetail({
  partnership: p, onBack, onRefresh, onEnd, router,
}: {
  partnership: Partnership;
  onBack: () => void;
  onRefresh: () => void;
  onEnd: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [streaks, setStreaks] = useState(p.streaks ?? []);

  void onRefresh;

  useEffect(() => {
    if (p.status === 'ACTIVE') {
      accountabilityService.getStreaks(p.id)
        .then((data) => setStreaks(data as typeof streaks))
        .catch(() => {});
    }
  }, [p.id, p.status]);

  const handleStartPrayer = async () => {
    setStarting(true);
    try {
      const result = await accountabilityService.startPrayerSession(p.id) as {
        sessionId: string;
        meetingLink: string;
      };
      const url = new URL(result.meetingLink, window.location.origin);
      router.push(url.pathname + url.search);
    } catch (err: unknown) {
      alert((err as Error)?.message ?? 'Could not start session');
    } finally {
      setStarting(false);
    }
  };

  const partnerName = p.partner
    ? `${p.partner.firstName} ${p.partner.lastName}`
    : p.invite?.email ?? 'Pending invite';

  const isPending = p.status === 'PENDING';

  return (
    <div className="max-w-xl">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-700 cursor-pointer">
        <ChevronRight className="w-5 h-5 rotate-180" />
        <span className="text-sm">Back</span>
      </button>

      {/* Partner header */}
      <div className="bg-linear-to-br from-[#870BD6] to-[#5B26B1] rounded-2xl p-6 mb-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-base">
              {p.partner ? `${p.partner.firstName[0]}${p.partner.lastName[0]}` : '?'}
            </div>
            <div>
              <p className="font-bold text-lg">{partnerName}</p>
              {p.partner?.username && <p className="text-sm text-white/70">@{p.partner.username}</p>}
            </div>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            isPending ? 'bg-amber-400/20 text-amber-200' : 'bg-white/20 text-white'
          }`}>
            {isPending ? 'Awaiting response' : 'Active'}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-white/80">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {p.prayerTime}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {p.prayerDays.map((d) => DAY_LABELS[d] ?? d).join(', ')}
          </span>
        </div>
      </div>

      {/* Start prayer button */}
      {p.status === 'ACTIVE' && (
        <Button
          onClick={handleStartPrayer}
          disabled={starting}
          loading={starting}
          customClass="w-full !h-[50px] !text-white mb-5"
        >
          <p className="flex items-center gap-2 font-bold text-base"><Video className="w-5 h-5" />Start Prayer Session</p>
        </Button>
      )}

      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <p className="text-sm text-amber-700 font-medium">
            Waiting for {p.partner ? p.partner.firstName : 'your partner'} to accept the invitation.
          </p>
        </div>
      )}

      {/* Streak cards */}
      {streaks.length > 0 && (
        <div className="mb-5">
          <h3 className="font-bold text-gray-900 mb-3">Prayer Streaks</h3>
          <div className="grid grid-cols-2 gap-3">
            {streaks.map((s) => (
              <div key={s.user.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-[#870BD6] font-bold text-xs">
                    {s.user.firstName[0]}{s.user.lastName[0]}
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{s.isMe ? 'You' : s.user.firstName}</p>
                </div>
                <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold text-lg">{s.currentStreak}</span>
                  <span className="text-xs text-gray-400">day streak</span>
                </div>
                <p className="text-xs text-gray-400">Best: {s.longestStreak} days</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last session */}
      {p.lastSession && (
        <div className="bg-green-50 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Last prayer session</p>
            <p className="text-xs text-green-600">
              {new Date(p.lastSession.startedAt).toLocaleDateString(undefined, {
                weekday: 'long', month: 'short', day: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}

      {/* End partnership */}
      <div className="pt-4 border-t border-gray-100">
        {showEndConfirm ? (
          <div className="bg-red-50 rounded-2xl p-4">
            <p className="text-sm text-red-700 font-medium mb-3">End this prayer partnership?</p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setEnding(true);
                  try { await onEnd(); } finally { setEnding(false); }
                }}
                disabled={ending}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {ending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Yes, end it'}
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            End partnership
          </button>
        )}
      </div>
    </div>
  );
}

function CreatePartnershipModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<'partner' | 'schedule'>('partner');
  const [partnerInput, setPartnerInput] = useState('');
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [prayerDays, setPrayerDays] = useState<string[]>([]);
  const [prayerTime, setPrayerTime] = useState('07:00');
  const [timezone] = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cleaned = partnerInput.trim().replace(/^@/, '');
    const isUsername = !partnerInput.includes('@') || partnerInput.startsWith('@');
    if (!isUsername || cleaned.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await userService.lookup(cleaned) as UserSuggestion[];
        const results = Array.isArray(res) ? res : [];
        setSuggestions(results.slice(0, 5));
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [partnerInput]);

  const toggleDay = (day: string) => {
    setPrayerDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const isEmail = partnerInput.includes('@') && !partnerInput.startsWith('@');

  const handleSubmit = async () => {
    if (prayerDays.length === 0) { setError('Select at least one prayer day'); return; }
    setSubmitting(true);
    setError('');
    try {
      await accountabilityService.createPartnership({
        ...(isEmail ? { email: partnerInput.trim() } : { username: partnerInput.trim().replace(/^@/, '') }),
        prayerDays,
        prayerTime,
        timezone,
      });
      onCreated();
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Failed to send invite');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">
            {step === 'partner' ? 'Add Prayer Partner' : 'Set Schedule'}
          </h3>
          <button onClick={onClose} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          {step === 'partner' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Partner&apos;s email or username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={partnerInput}
                    onChange={(e) => { setPartnerInput(e.target.value); setError(''); }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="name@email.com or @username"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#870BD6]/30 focus:border-[#870BD6]"
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-2.5 w-4 h-4 animate-spin text-gray-400" />
                  )}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {suggestions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseDown={() => {
                            setPartnerInput(`@${s.username}`);
                            setShowSuggestions(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-[#870BD6] font-bold text-xs shrink-0">
                            {s.firstName[0]}{s.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{s.firstName} {s.lastName}</p>
                            <p className="text-xs text-gray-400">@{s.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  They&apos;ll receive an invite to join your prayer partnership.
                </p>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button
                onClick={() => {
                  if (!partnerInput.trim()) { setError('Enter your partner\'s email or username'); return; }
                  setError('');
                  setStep('schedule');
                }}
                customClass="w-full !h-[42px] !text-white text-sm"
              >
                Next: Set Schedule
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Prayer days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDay(d)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        prayerDays.includes(d)
                          ? 'bg-[#870BD6] text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {DAY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prayer time</label>
                <input
                  type="time"
                  value={prayerTime}
                  onChange={(e) => setPrayerTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#870BD6]/30 focus:border-[#870BD6]"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Both of you will be notified 30 minutes before.
                </p>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep('partner')}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  loading={submitting}
                  customClass="flex-1 !h-[42px] !text-white text-sm"
                >
                  Send Invite
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
