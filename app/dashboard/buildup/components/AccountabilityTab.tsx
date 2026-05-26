'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Flame, Plus, ChevronRight, Loader2, X, Video, Clock,
  CheckCircle, Calendar, Trash2, Globe,
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
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  const initials = p.partner
    ? `${p.partner.firstName[0]}${p.partner.lastName[0]}`.toUpperCase()
    : '?';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {p.partner?.avatarUrl ? (
          <img src={p.partner.avatarUrl} alt={partnerName} className="w-14 h-14 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-base shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-[#180426] leading-tight">{partnerName}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
              isPending ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
            }`}>
              {isPending ? 'Pending' : 'Active'}
            </span>
          </div>
          {p.partner?.username && (
            <p className="text-xs text-[#60666B] mt-0.5">@{p.partner.username}</p>
          )}
          <div className="flex items-center gap-1 mt-1 text-xs text-[#60666B]">
            <Clock size={11} />
            {p.prayerTime}
          </div>
        </div>
      </div>

      {p.prayerDays.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {p.prayerDays.map((d) => (
            <span key={d} className="text-[11px] bg-[#F5EBFF] text-[#870BD6] px-2.5 py-0.5 rounded-full font-medium">
              {DAY_LABELS[d] ?? d}
            </span>
          ))}
        </div>
      )}

      {p.myStreak && p.myStreak.currentStreak > 0 && (
        <p className="flex items-center gap-1 text-xs font-semibold text-orange-500">
          <Flame className="w-3.5 h-3.5" />
          {p.myStreak.currentStreak} day streak
        </p>
      )}

      <div className="mt-auto pt-1">
        <div className="w-full h-10 flex items-center justify-center gap-1 bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white text-sm font-medium rounded-full">
          View Details
          <ChevronRight size={14} />
        </div>
      </div>
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
      const result = await accountabilityService.startPrayerSession(p.id) as { sessionId: string; meetingLink: string };
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
  const initials = p.partner
    ? `${p.partner.firstName[0]}${p.partner.lastName[0]}`.toUpperCase()
    : '?';

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
        </button>
        <h1 className="text-xl font-bold text-[#180426]">{partnerName}</h1>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
          isPending ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200'
        }`}>
          {isPending ? 'Pending' : 'Active'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6">
            {/* Partner avatar + name */}
            <div className="flex items-center gap-4 mb-5">
              {p.partner?.avatarUrl ? (
                <img src={p.partner.avatarUrl} alt={partnerName} className="w-14 h-14 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-lg shrink-0">
                  {initials}
                </div>
              )}
              <div>
                <p className="font-bold text-[#180426] text-lg leading-tight">{partnerName}</p>
                {p.partner?.username && <p className="text-sm text-[#60666B]">@{p.partner.username}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                isPending ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200'
              }`}>{isPending ? 'Pending' : 'Active'}</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-[#60666B] border border-gray-200">Prayer Partnership</span>
            </div>

            <div className="border-t border-gray-100 mb-5" />

            <div className="space-y-4">
              <DetailRow icon={<Calendar className="w-4 h-4 text-gray-400" />} label="Prayer Days" value={p.prayerDays.map((d) => DAY_LABELS[d] ?? d).join(', ') || '—'} />
              <DetailRow icon={<Clock className="w-4 h-4 text-gray-400" />} label="Prayer Time" value={p.prayerTime} />
              <DetailRow icon={<Globe className="w-4 h-4 text-gray-400" />} label="Timezone" value={p.timezone} />
              <DetailRow
                icon={<Calendar className="w-4 h-4 text-gray-400" />}
                label="Since"
                value={new Date(p.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              />
              {p.lastSession && (
                <DetailRow
                  icon={<CheckCircle className="w-4 h-4 text-green-500" />}
                  label="Last Session"
                  value={new Date(p.lastSession.startedAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                />
              )}
            </div>
          </div>

          {/* Streak cards */}
          {streaks.length > 0 && (
            <div>
              <h3 className="font-bold text-[#180426] mb-3">Prayer Streaks</h3>
              <div className="grid grid-cols-2 gap-3">
                {streaks.map((s, i) => (
                  <div key={s.user?.id ?? i} className="bg-white rounded-2xl p-4 border border-[#E3E8EF]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-xs">
                        {s.user?.firstName?.[0] ?? '?'}{s.user?.lastName?.[0] ?? ''}
                      </div>
                      <p className="text-sm font-semibold text-[#180426]">{s.isMe ? 'You' : (s.user?.firstName ?? 'Partner')}</p>
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
        </div>

        {/* Right column — actions + stats */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
            <h3 className="font-semibold text-[#180426] mb-4">Actions</h3>
            {p.status === 'ACTIVE' && (
              <button
                onClick={handleStartPrayer}
                disabled={starting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-xl font-semibold text-sm mb-3 hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
              >
                {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
                Start Prayer Session
              </button>
            )}
            {!showEndConfirm ? (
              <button
                onClick={() => setShowEndConfirm(true)}
                className="w-full py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> End Partnership
              </button>
            ) : (
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium mb-3">End this partnership?</p>
                <div className="flex gap-2">
                  <button
                    onClick={async () => { setEnding(true); try { await onEnd(); } finally { setEnding(false); } }}
                    disabled={ending}
                    className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold disabled:opacity-60 cursor-pointer"
                  >
                    {ending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Yes, end it'}
                  </button>
                  <button
                    onClick={() => setShowEndConfirm(false)}
                    className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {isPending && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-amber-700 mb-1">Awaiting Response</p>
              <p className="text-xs text-amber-600">
                Waiting for {p.partner ? p.partner.firstName : 'your partner'} to accept the invitation.
              </p>
            </div>
          )}

          <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#60666B]">Partner</span>
                <span className="font-medium text-[#180426] text-right truncate ml-2 max-w-[120px]">{partnerName}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="text-[#60666B]">Days / week</span>
                <span className="font-medium text-[#180426]">{p.prayerDays.length}</span>
              </div>
              {p.myStreak && (
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <span className="text-[#60666B]">My Streak</span>
                  <span className="flex items-center gap-1 font-medium text-orange-500">
                    <Flame className="w-3.5 h-3.5" />{p.myStreak.currentStreak} days
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#60666B] mb-0.5">{label}</p>
        <p className="text-sm font-medium text-[#180426]">{value}</p>
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
