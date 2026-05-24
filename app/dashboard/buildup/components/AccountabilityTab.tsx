'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Flame, Plus, ChevronRight, Loader2, X, Video, Clock,
  CheckCircle, Calendar, Trash2,
} from 'lucide-react';
import { accountabilityService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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

export default function AccountabilityTab() {
  const { user } = useAuth();
  const router = useRouter();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Partnership | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // suppress unused warning
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
        <div>
          <h2 className="text-xl font-bold text-gray-900">Prayer Partners</h2>
          <p className="text-sm text-gray-500 mt-1">1-on-1 live prayer sessions with your partner</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#870BD6] text-white rounded-full text-sm font-semibold hover:bg-[#7009b8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" />
        </div>
      ) : partnerships.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#870BD6]" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">No prayer partners yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            Invite someone to pray with you at a set time each week.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2.5 bg-[#870BD6] text-white rounded-full text-sm font-semibold hover:bg-[#7009b8] transition-colors"
          >
            Invite a Prayer Partner
          </button>
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

  // suppress unused warning
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
      // meetingLink is absolute; extract the path
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
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-700">
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
        <button
          onClick={handleStartPrayer}
          disabled={starting}
          className="w-full py-3.5 bg-[#870BD6] text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#7009b8] transition-colors disabled:opacity-60 mb-5"
        >
          {starting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Video className="w-5 h-5" />
              Start Prayer Session
            </>
          )}
        </button>
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
                className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {ending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Yes, end it'}
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
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
  const [prayerDays, setPrayerDays] = useState<string[]>([]);
  const [prayerTime, setPrayerTime] = useState('07:00');
  const [timezone] = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleDay = (day: string) => {
    setPrayerDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const isEmail = partnerInput.includes('@');

  const handleSubmit = async () => {
    if (prayerDays.length === 0) { setError('Select at least one prayer day'); return; }
    setSubmitting(true);
    setError('');
    try {
      await accountabilityService.createPartnership({
        ...(isEmail ? { email: partnerInput.trim() } : { username: partnerInput.trim().replace('@', '') }),
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
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-4">
          {step === 'partner' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Partner&apos;s email or username
                </label>
                <input
                  type="text"
                  value={partnerInput}
                  onChange={(e) => setPartnerInput(e.target.value)}
                  placeholder="name@email.com or @username"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#870BD6]/30 focus:border-[#870BD6]"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  They&apos;ll receive an invite to join your prayer partnership.
                </p>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                onClick={() => {
                  if (!partnerInput.trim()) { setError('Enter your partner\'s email or username'); return; }
                  setError('');
                  setStep('schedule');
                }}
                className="w-full py-2.5 bg-[#870BD6] text-white rounded-xl font-semibold text-sm hover:bg-[#7009b8] transition-colors"
              >
                Next: Set Schedule
              </button>
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
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
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
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#870BD6] text-white rounded-xl font-semibold text-sm hover:bg-[#7009b8] transition-colors disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Invite'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
