'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  People, Add, ArrowRight2, Video, Clock, TickCircle, Calendar,
  Trash, Global, UserAdd, Link2, Copy, CloseCircle, Logout, Edit2,
} from 'iconsax-react';

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.45 1.32C9.49 6.05 8.5 8.5 8.67 10.93l.01.08v.1c0 .41-.23.79-.59.99-.37.16-.72.47-.72.97v.17c.01 1.43.85 2.66 2.04 3.33-1.14-1.94-.83-4.39.61-5.93 0 1.05.12 2.12.7 3.03.78 1.25 2.23 2 2.58 3.54.29 1.25-.24 2.79-1.36 3.55 1.45 0 2.84-.79 3.7-1.95.86-1.16 1.14-2.65.86-4.06-.23-1.21-.96-2.04-1.56-2.97.77.34 1.42.85 1.93 1.5.78.96 1.14 2.19 1.15 3.43 0 .43-.05.86-.15 1.28 1.27-1.2 2-2.94 2-4.71 0-1.07-.37-2.12-1-3l-.82.7z" />
    </svg>
  );
}
import { accountabilityService, userService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/app/components/Button';
import Toast from '@/app/components/Toast';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS: Record<string, string> = {
  MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun',
};
const MAX_MEMBERS = 5;

// ── Types ──────────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string;
  email: string;
  memberRole: 'OWNER' | 'MEMBER';
  memberStatus: 'PENDING' | 'ACTIVE';
  isMe: boolean;
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastPrayedAt?: string;
}

interface PrayerSessionRecord {
  id: string;
  startedAt: string;
  endedAt?: string | null;
  startedBy?: { id: string; firstName: string; lastName: string; avatarUrl?: string } | null;
}

interface PrayerNote {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

interface Partnership {
  id: string;
  members: Member[];
  activeMemberCount: number;
  canAddMore: boolean;
  prayerDays: string[];
  prayerTime: string;
  timezone: string;
  status: 'PENDING' | 'ACTIVE' | 'ENDED';
  isCreator: boolean;
  isOwner: boolean;
  pendingInviteEmail?: string | null;
  invites?: Array<{ status: string; email: string; token?: string }>;
  myStreak?: Streak;
  streaks?: Array<{ user: Member; currentStreak: number; longestStreak: number; lastPrayedAt?: string; isMe: boolean }>;
  lastSession?: { startedAt: string };
  recentSessions?: PrayerSessionRecord[];
  createdAt: string;
}

interface UserSuggestion {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface AccountabilityTabProps {
  externalShowCreate?: boolean;
  onExternalShowCreateChange?: (val: boolean) => void;
}

// ── Tab root ───────────────────────────────────────────────────────────────────

export default function AccountabilityTab({ externalShowCreate, onExternalShowCreateChange }: AccountabilityTabProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Partnership | null>(null);
  const [internalShowCreate, setInternalShowCreate] = useState(false);

  void user;

  const showCreate = externalShowCreate ?? internalShowCreate;
  const setShowCreate = (val: boolean) => {
    onExternalShowCreateChange?.(val);
    setInternalShowCreate(val);
  };

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
        onLeave={async () => {
          await accountabilityService.leavePartnership(selected.id);
          setSelected(null);
          load();
        }}
        onAccepted={() => { refreshSelected(selected.id); }}
        onDeclined={() => { setSelected(null); load(); }}
        onPartnerAdded={() => { refreshSelected(selected.id); }}
        router={router}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-gray-500">Live prayer sessions with up to 5 people</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      ) : partnerships.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <div className="w-16 h-16 rounded-full bg-[#F5EBFF] flex items-center justify-center mb-4">
            <People size={32} color="#870BD6" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">No prayer groups yet</h3>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
            Invite up to 4 people to pray with you at a set time each week.
          </p>
          <Button onClick={() => setShowCreate(true)} customClass="!w-fit px-6 !h-[44px] !text-white">
            <p className="flex items-center gap-1.5 text-sm"><Add size={16} color="white" />Invite Prayer Partners</p>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partnerships.map((p) => (
            <PartnershipCard key={p.id} partnership={p} onClick={() => { setSelected(p); refreshSelected(p.id); }} />
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

// ── Partnership card ───────────────────────────────────────────────────────────

function MemberAvatars({ members }: { members: Member[] }) {
  const active = members.filter((m) => m.memberStatus === 'ACTIVE');
  const shown  = active.slice(0, 4);
  const extra  = active.length - shown.length;

  return (
    <div className="flex -space-x-2">
      {shown.map((m) => (
        <div
          key={m.id}
          className="w-8 h-8 rounded-full border-2 border-white bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-xs shrink-0 overflow-hidden"
          title={`${m.firstName} ${m.lastName}`}
        >
          {m.avatarUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
            : `${m.firstName[0]}${m.lastName[0]}`}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
          +{extra}
        </div>
      )}
    </div>
  );
}

function PartnershipCard({ partnership: p, onClick }: { partnership: Partnership; onClick: () => void }) {
  const isPending  = p.status === 'PENDING';
  const otherMembers = p.members.filter((m) => !m.isMe);
  const groupName  = otherMembers.length > 0
    ? otherMembers.map((m) => m.firstName).join(', ')
    : p.pendingInviteEmail ?? 'Pending invite';

  return (
    <div
      onClick={onClick}
      className="bg-white border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2">
        <MemberAvatars members={p.members} />
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
          isPending ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
        }`}>
          {isPending ? 'Pending' : 'Active'}
        </span>
      </div>

      <div>
        <p className="font-bold text-[#180426] leading-tight truncate">{groupName}</p>
        <p className="text-xs text-[#60666B] mt-0.5">
          {p.activeMemberCount} {p.activeMemberCount === 1 ? 'member' : 'members'}
          {p.canAddMore && ` · up to ${MAX_MEMBERS - p.activeMemberCount} more`}
        </p>
        <div className="flex items-center gap-1 mt-1 text-xs text-[#60666B]">
          <Clock size={11} /> {p.prayerTime}
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
          <FlameIcon className="w-3.5 h-3.5" /> {p.myStreak.currentStreak} day streak
        </p>
      )}

      <div className="mt-auto pt-1">
        <div className="w-full h-10 flex items-center justify-center gap-1 bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white text-sm font-medium rounded-full">
          View Details <ArrowRight2 size={14} />
        </div>
      </div>
    </div>
  );
}

// ── Partnership detail ─────────────────────────────────────────────────────────

function PartnershipDetail({
  partnership: p, onBack, onRefresh, onEnd, onLeave, onAccepted, onDeclined, onPartnerAdded, router,
}: {
  partnership: Partnership;
  onBack: () => void;
  onRefresh: () => void;
  onEnd: () => Promise<void>;
  onLeave: () => Promise<void>;
  onAccepted: () => void;
  onDeclined: () => void;
  onPartnerAdded: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const { user }                            = useAuth();
  const [starting, setStarting]             = useState(false);
  const [ending, setEnding]                 = useState(false);
  const [leaving, setLeaving]               = useState(false);
  const [accepting, setAccepting]           = useState(false);
  const [declining, setDeclining]           = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [streaks, setStreaks]               = useState(p.streaks ?? []);
  const [copyingLink, setCopyingLink]       = useState(false);
  const [linkCopied, setLinkCopied]         = useState(false);
  const [alertMsg, setAlertMsg]             = useState('');
  const [toast, setToast]                   = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [milestone, setMilestone]           = useState<string | null>(null);
  const [notes, setNotes]                   = useState<PrayerNote[]>([]);
  const [notesLoading, setNotesLoading]     = useState(false);

  void onRefresh;

  const loadNotes = useCallback(async () => {
    setNotesLoading(true);
    try {
      const data = await accountabilityService.getNotes(p.id) as PrayerNote[];
      setNotes(Array.isArray(data) ? data : []);
    } catch {
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  }, [p.id]);

  useEffect(() => {
    if (p.status === 'ACTIVE') { loadNotes(); }
  }, [p.id, p.status, loadNotes]);

  useEffect(() => {
    if (p.status === 'ACTIVE') {
      accountabilityService.getStreaks(p.id)
        .then((data) => setStreaks(data as typeof streaks))
        .catch(() => {});
    }
  }, [p.id, p.status]);

  useEffect(() => {
    if (!user?.id || streaks.length === 0) return;
    const mine = streaks.find((s) => s.isMe);
    if (!mine || mine.currentStreak < 1) return;
    const MILESTONES: { threshold: number; message: string }[] = [
      { threshold: 30, message: '30-day streak! A month of faithful dedication.' },
      { threshold: 7,  message: '7-day streak! A week of consistent prayer.' },
      { threshold: 1,  message: 'First prayer session! Your journey begins.' },
    ];
    for (const { threshold, message } of MILESTONES) {
      if (mine.currentStreak >= threshold) {
        const key = `breed_milestone_${user.id}_${p.id}_${threshold}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, '1');
          setMilestone(message);
        }
        break;
      }
    }
  }, [streaks, user?.id, p.id]);

  const showAlert = (msg: string) => setAlertMsg(msg);
  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const handleStartPrayer = async () => {
    setStarting(true);
    try {
      const result = await accountabilityService.startPrayerSession(p.id) as { sessionId: string; meetingId: string; meetingLink: string };
      router.push(`/room/${result.meetingId}?session=${result.sessionId}`);
    } catch (err: unknown) {
      showAlert((err as Error)?.message ?? 'Could not start session');
    } finally {
      setStarting(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await accountabilityService.acceptMembership(p.id);
      showToast('You\'ve joined the prayer group!', 'success');
      onAccepted();
    } catch (err: unknown) {
      showToast((err as Error)?.message ?? 'Could not accept partnership', 'error');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    try {
      await accountabilityService.declineMembership(p.id);
      showToast('Invitation declined', 'success');
      setTimeout(() => onDeclined(), 1500);
    } catch (err: unknown) {
      showToast((err as Error)?.message ?? 'Could not decline', 'error');
    } finally {
      setDeclining(false);
    }
  };

  const handleCopyLink = async () => {
    setCopyingLink(true);
    try {
      const result = await accountabilityService.generateInviteLink(p.id) as { inviteLink: string };
      await navigator.clipboard.writeText(result.inviteLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (err: unknown) {
      showAlert((err as Error)?.message ?? 'Could not generate invite link');
    } finally {
      setCopyingLink(false);
    }
  };

  const myMembership   = p.members.find((m) => m.isMe);
  const isPending      = p.status === 'PENDING';
  const iAmPending     = myMembership?.memberStatus === 'PENDING';
  const activeMembers  = p.members.filter((m) => m.memberStatus === 'ACTIVE');
  const pendingMembers = p.members.filter((m) => m.memberStatus === 'PENDING');
  const isOwner        = myMembership?.memberRole === 'OWNER';

  const groupTitle = p.members.filter((m) => !m.isMe).map((m) => m.firstName).join(', ') || 'Prayer Group';

  return (
    <div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
      {milestone && (
        <MilestoneToast message={milestone} onDismiss={() => setMilestone(null)} />
      )}

      {/* Alert modal — replaces browser alert() */}
      {alertMsg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAlertMsg('')}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <CloseCircle size={20} color="#ef4444" />
            </div>
            <p className="text-sm text-gray-700 text-center mb-5 leading-relaxed">{alertMsg}</p>
            <button
              onClick={() => setAlertMsg('')}
              className="w-full py-2.5 bg-[#870BD6] text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
          <ArrowRight2 size={20} color="#6b7280" className="rotate-180" />
        </button>
        <h1 className="text-xl font-bold text-[#180426] truncate">{groupTitle}</h1>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${
          isPending ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200'
        }`}>
          {isPending ? 'Pending' : 'Active'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Members card */}
          <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#180426]">
                Members ({activeMembers.length}{pendingMembers.length > 0 ? ` + ${pendingMembers.length} pending` : ''})
              </h3>
              {p.canAddMore && (
                <button
                  onClick={() => setShowAddPartner(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#870BD6] hover:opacity-75 transition-opacity cursor-pointer"
                >
                  <UserAdd size={13} color="#870BD6" /> Add partner
                </button>
              )}
            </div>

            <div className="space-y-3">
              {p.members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm shrink-0 overflow-hidden">
                    {m.avatarUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : `${m.firstName[0]}${m.lastName[0]}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#180426] leading-none">
                      {m.isMe ? 'You' : `${m.firstName} ${m.lastName}`}
                    </p>
                    {m.username && <p className="text-xs text-[#60666B] mt-0.5">@{m.username}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.memberRole === 'OWNER' && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full">Owner</span>
                    )}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      m.memberStatus === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {m.memberStatus === 'ACTIVE' ? 'Active' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {p.canAddMore && (
              <button
                onClick={() => setShowAddPartner(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-[#870BD6] text-[#870BD6] rounded-full text-sm font-semibold hover:bg-purple-50 transition-colors cursor-pointer"
              >
                <UserAdd size={15} color="#870BD6" /> Add more partners ({MAX_MEMBERS - p.members.length} spots left)
              </button>
            )}
          </div>

          {/* Schedule card */}
          <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  isPending ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-green-50 text-green-600 border-green-200'
                }`}>{isPending ? 'Pending' : 'Active'}</span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-[#60666B] border border-gray-200">Prayer Group</span>
              </div>
              {isOwner && !iAmPending && (
                <button
                  onClick={() => setShowEditSchedule(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#870BD6] hover:opacity-75 transition-opacity cursor-pointer"
                >
                  <Edit2 size={13} color="#870BD6" /> Edit
                </button>
              )}
            </div>
            <div className="space-y-4">
              <DetailRow icon={<Calendar size={16} color="#9ca3af" />} label="Prayer Days"
                value={p.prayerDays.map((d) => DAY_LABELS[d] ?? d).join(', ') || '—'} />
              <DetailRow icon={<Clock size={16} color="#9ca3af" />} label="Prayer Time" value={p.prayerTime} />
              <DetailRow icon={<Global size={16} color="#9ca3af" />} label="Timezone" value={p.timezone} />
              <DetailRow
                icon={<Calendar size={16} color="#9ca3af" />} label="Since"
                value={new Date(p.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              />
              {p.lastSession && (
                <DetailRow
                  icon={<TickCircle size={16} color="#22c55e" />} label="Last Session"
                  value={new Date(p.lastSession.startedAt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                />
              )}
            </div>
          </div>

          {/* Streaks */}
          {streaks.length > 0 && (
            <div>
              <h3 className="font-bold text-[#180426] mb-3">Prayer Streaks</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {streaks.map((s, i) => (
                  <div key={s.user?.id ?? i} className="bg-white rounded-2xl p-4 border border-[#E3E8EF]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-xs overflow-hidden">
                        {s.user?.avatarUrl
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={s.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : `${s.user?.firstName?.[0] ?? '?'}${s.user?.lastName?.[0] ?? ''}`}
                      </div>
                      <p className="text-sm font-semibold text-[#180426] truncate">
                        {s.isMe ? 'You' : (s.user?.firstName ?? 'Member')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                      <FlameIcon className="w-4 h-4" />
                      <span className="font-bold text-lg">{s.currentStreak}</span>
                      <span className="text-xs text-gray-400">day streak</span>
                    </div>
                    <p className="text-xs text-gray-400">Best: {s.longestStreak} days</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session History */}
          {p.status === 'ACTIVE' && (
            <SessionHistoryPanel sessions={p.recentSessions ?? []} members={p.members} />
          )}

          {/* Prayer Journal */}
          {p.status === 'ACTIVE' && (
            <NotesPanel
              notes={notes}
              loading={notesLoading}
              partnershipId={p.id}
              onNoteAdded={(note: PrayerNote) => setNotes((prev) => [note, ...prev])}
            />
          )}
        </div>

        {/* Right column — actions */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
            <h3 className="font-semibold text-[#180426] mb-4">Actions</h3>

            {/* Recipient pending: accept / decline */}
            {iAmPending && !p.isCreator && (
              <div className="space-y-2 mb-3">
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
                >
                  {accepting ? <span className="inline-block w-4 h-4 rounded-full border-2 border-t-white border-white/30 animate-spin" /> : <TickCircle size={16} color="white" />}
                  Accept Request
                </button>
                <button
                  onClick={handleDecline}
                  disabled={declining}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                >
                  {declining ? <span className="inline-block w-4 h-4 rounded-full border-2 border-t-red-400 border-red-200 animate-spin" /> : <CloseCircle size={16} color="#ef4444" />}
                  Decline
                </button>
              </div>
            )}

            {p.status === 'ACTIVE' && !iAmPending && (
              <button
                onClick={handleStartPrayer}
                disabled={starting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full font-semibold text-sm mb-3 hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
              >
                {starting ? <span className="inline-block w-4 h-4 rounded-full border-2 border-t-white border-white/30 animate-spin" /> : <Video size={16} color="white" />}
                Start Prayer Session
              </button>
            )}

            {p.canAddMore && !iAmPending && (
              <button
                onClick={handleCopyLink}
                disabled={copyingLink}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#870BD6] text-[#870BD6] rounded-full text-sm font-semibold hover:bg-purple-50 transition-colors mb-3 disabled:opacity-60 cursor-pointer"
              >
                {copyingLink
                  ? <span className="inline-block w-4 h-4 rounded-full border-2 border-t-[#870BD6] border-purple-200 animate-spin" />
                  : linkCopied ? <Copy size={16} color="#870BD6" /> : <Link2 size={16} color="#870BD6" />}
                {linkCopied ? 'Link copied!' : 'Copy invite link'}
              </button>
            )}

            {/* Owner: End Partnership */}
            {isOwner && !showEndConfirm && (
              <button
                onClick={() => setShowEndConfirm(true)}
                className="w-full py-2.5 border border-red-200 text-red-500 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash size={16} color="#ef4444" /> End Partnership
              </button>
            )}
            {isOwner && showEndConfirm && (
              <div className="bg-red-50 rounded-2xl p-4">
                <p className="text-sm text-red-700 font-medium mb-1">End for everyone?</p>
                <p className="text-xs text-red-500 mb-3">This will end the prayer group for all members.</p>
                <div className="flex gap-2">
                  <button
                    onClick={async () => { setEnding(true); try { await onEnd(); } finally { setEnding(false); } }}
                    disabled={ending}
                    className="flex-1 py-2 bg-[#e44e4e] text-white rounded-full text-sm font-semibold disabled:opacity-60 cursor-pointer"
                  >
                    {ending ? <span className="inline-block w-4 h-4 rounded-full border-2 border-t-white border-white/30 animate-spin mx-auto" /> : 'Yes, end it'}
                  </button>
                  <button
                    onClick={() => setShowEndConfirm(false)}
                    className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Non-owner: Leave Partnership */}
            {!isOwner && !iAmPending && !showLeaveConfirm && (
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="w-full py-2.5 border border-red-200 text-red-500 rounded-full text-sm font-semibold hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Logout size={16} color="#ef4444" /> Leave Partnership
              </button>
            )}
            {!isOwner && !iAmPending && showLeaveConfirm && (
              <div className="bg-red-50 rounded-2xl p-4">
                <p className="text-sm text-red-700 font-medium mb-1">Leave this group?</p>
                <p className="text-xs text-red-500 mb-3">
                  {activeMembers.length <= 2
                    ? 'You are one of 2 members — leaving will end the partnership.'
                    : 'Others will continue praying together without you.'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={async () => { setLeaving(true); try { await onLeave(); } finally { setLeaving(false); } }}
                    disabled={leaving}
                    className="flex-1 py-2 bg-red-500 text-white rounded-full text-sm font-semibold disabled:opacity-60 cursor-pointer"
                  >
                    {leaving ? <span className="inline-block w-4 h-4 rounded-full border-2 border-t-white border-white/30 animate-spin mx-auto" /> : 'Yes, leave'}
                  </button>
                  <button
                    onClick={() => setShowLeaveConfirm(false)}
                    className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {isPending && p.isCreator && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-amber-700 mb-1">Awaiting Responses</p>
              <p className="text-xs text-amber-600">
                Waiting for {pendingMembers.map((m) => m.firstName).join(', ')} to accept.
              </p>
            </div>
          )}

          <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#60666B]">Members</span>
                <span className="font-medium text-[#180426]">{activeMembers.length} / {MAX_MEMBERS}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="text-[#60666B]">Days / week</span>
                <span className="font-medium text-[#180426]">{p.prayerDays.length}</span>
              </div>
              {p.myStreak && (
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <span className="text-[#60666B]">My Streak</span>
                  <span className="flex items-center gap-1 font-medium text-orange-500">
                    <FlameIcon className="w-3.5 h-3.5" />{p.myStreak.currentStreak} days
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAddPartner && (
        <AddPartnerModal
          partnershipId={p.id}
          onClose={() => setShowAddPartner(false)}
          onAdded={() => { setShowAddPartner(false); onPartnerAdded(); }}
        />
      )}

      {showEditSchedule && (
        <EditScheduleModal
          partnership={p}
          onClose={() => setShowEditSchedule(false)}
          onSaved={() => {
            setShowEditSchedule(false);
            showToast('Schedule updated!', 'success');
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

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

// ── Partner search input (shared) ──────────────────────────────────────────────

function PartnerSearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'name@email.com or @username',
}: {
  value: string;
  onChange: (val: string) => void;
  onClear?: () => void;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const justSelected = useRef(false);

  useEffect(() => {
    if (justSelected.current) { justSelected.current = false; return; }
    const cleaned  = value.trim().replace(/^@/, '');
    const isUsername = !value.includes('@') || value.startsWith('@');
    if (!isUsername || cleaned.length < 2) {
      setSuggestions([]); setShowSuggestions(false); setLoading(false); return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await userService.lookup(cleaned) as UserSuggestion[];
        const results = Array.isArray(res) ? res.slice(0, 5) : [];
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch { setSuggestions([]); setShowSuggestions(false); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => { onChange(e.target.value); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#870BD6]/30 focus:border-[#870BD6] pr-8"
        />
        {(loading) && <span className="absolute right-3 top-2.5 inline-block w-4 h-4 rounded-full border-2 border-t-gray-400 border-gray-200 animate-spin" />}
        {!loading && value && onClear && (
          <button type="button" onClick={onClear} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer">
            <CloseCircle size={14} color="#9ca3af" />
          </button>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                justSelected.current = true;
                onChange(`@${s.username}`);
                setShowSuggestions(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-[#870BD6] font-bold text-xs shrink-0 overflow-hidden">
                {s.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={s.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : `${s.firstName[0]}${s.lastName[0]}`}
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
  );
}

// ── Create Partnership Modal ───────────────────────────────────────────────────

function CreatePartnershipModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<'partners' | 'schedule'>('partners');
  // Each invitee is a string (email or @username)
  const [invitees, setInvitees] = useState<string[]>(['']);
  const [prayerDays, setPrayerDays] = useState<string[]>([]);
  const [prayerTime, setPrayerTime] = useState('07:00');
  const [timezone] = useState(() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submittingRef = useRef(false);

  const addInvitee = () => {
    if (invitees.length < MAX_MEMBERS - 1) setInvitees((prev) => [...prev, '']);
  };

  const updateInvitee = (i: number, val: string) => {
    setInvitees((prev) => prev.map((v, idx) => (idx === i ? val : v)));
    setError('');
  };

  const removeInvitee = (i: number) => {
    setInvitees((prev) => prev.filter((_, idx) => idx !== i));
  };

  const toggleDay = (day: string) => {
    setPrayerDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const toInviteePayload = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.includes('@') && !trimmed.startsWith('@')) return { email: trimmed };
    return { username: trimmed.replace(/^@/, '') };
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    const filled = invitees.filter((v) => v.trim());
    if (filled.length === 0) { setError('Add at least one prayer partner'); return; }
    if (prayerDays.length === 0) { setError('Select at least one prayer day'); return; }
    submittingRef.current = true;
    setSubmitting(true); setError('');
    try {
      await accountabilityService.createPartnership({
        invitees: filled.map(toInviteePayload),
        prayerDays,
        prayerTime,
        timezone,
      });
      onCreated();
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Failed to send invite');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl mb-16 sm:mb-0 sm:max-h-[90vh] sm:flex sm:flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-gray-900">
            {step === 'partners' ? 'Add Prayer Partners' : 'Set Schedule'}
          </h3>
          <button onClick={onClose} className="cursor-pointer"><CloseCircle size={20} color="#9ca3af" /></button>
        </div>

        <div className="p-5 space-y-4 sm:overflow-y-auto sm:flex-1">
          {step === 'partners' ? (
            <>
              <p className="text-xs text-gray-400">Invite 1–{MAX_MEMBERS - 1} people to your prayer group.</p>

              <div className="space-y-2">
                {invitees.map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1">
                      <PartnerSearchInput
                        value={val}
                        onChange={(v) => updateInvitee(i, v)}
                        onClear={invitees.length > 1 ? () => removeInvitee(i) : () => updateInvitee(i, '')}
                        placeholder={i === 0 ? 'name@email.com or @username' : 'Add another partner'}
                      />
                    </div>
                    {invitees.length > 1 && (
                      <button type="button" onClick={() => removeInvitee(i)} className="shrink-0 text-gray-400 hover:text-gray-600 cursor-pointer">
                        <CloseCircle size={16} color="#9ca3af" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {invitees.length < MAX_MEMBERS - 1 && (
                <button
                  type="button"
                  onClick={addInvitee}
                  className="flex items-center gap-1.5 text-sm text-[#870BD6] font-semibold hover:opacity-75 transition-opacity cursor-pointer"
                >
                  <Add size={14} color="#870BD6" /> Add another person
                </button>
              )}

              {error && <p className="text-xs text-red-500">{error}</p>}

              <Button
                onClick={() => {
                  if (!invitees.some((v) => v.trim())) { setError('Add at least one partner'); return; }
                  setError(''); setStep('schedule');
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
                <p className="text-xs text-gray-400 mt-1.5">Everyone will be notified 30 minutes before.</p>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setStep('partners')}
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
                  Send Invites
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add Partner Modal ─────────────────────────────────────────────────────────

function AddPartnerModal({
  partnershipId,
  onClose,
  onAdded,
}: {
  partnershipId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [input, setInput]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const toPayload = (val: string) => {
    const trimmed = val.trim();
    if (trimmed.includes('@') && !trimmed.startsWith('@')) return { email: trimmed };
    return { username: trimmed.replace(/^@/, '') };
  };

  const handleAdd = async () => {
    if (!input.trim()) { setError('Enter a username or email'); return; }
    setSubmitting(true); setError('');
    try {
      await accountabilityService.addPartner(partnershipId, toPayload(input));
      onAdded();
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Failed to add partner');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl mb-16 sm:mb-0">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Add Partner</h3>
          <button onClick={onClose} className="cursor-pointer"><CloseCircle size={20} color="#9ca3af" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Partner's email or username</label>
            <PartnerSearchInput
              value={input}
              onChange={(v) => { setInput(v); setError(''); }}
              onClear={() => setInput('')}
            />
            <p className="text-xs text-gray-400 mt-1.5">They'll receive an invite to join the prayer group.</p>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button
            onClick={handleAdd}
            disabled={submitting}
            loading={submitting}
            customClass="w-full !h-[42px] !text-white text-sm"
          >
            Send Invite
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Schedule Modal ────────────────────────────────────────────────────────

function EditScheduleModal({
  partnership,
  onClose,
  onSaved,
}: {
  partnership: Partnership;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [prayerDays, setPrayerDays] = useState<string[]>(partnership.prayerDays);
  const [prayerTime, setPrayerTime] = useState(partnership.prayerTime);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const toggleDay = (day: string) => {
    setPrayerDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleSave = async () => {
    if (prayerDays.length === 0) { setError('Select at least one prayer day'); return; }
    setSaving(true); setError('');
    try {
      await accountabilityService.updatePartnership(partnership.id, { prayerDays, prayerTime });
      onSaved();
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Could not update schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-xl mb-16 sm:mb-0">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Edit Schedule</h3>
          <button onClick={onClose} className="cursor-pointer"><CloseCircle size={20} color="#9ca3af" /></button>
        </div>
        <div className="p-5 space-y-4">
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
            <p className="text-xs text-gray-400 mt-1.5">Everyone will be notified 30 minutes before.</p>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={saving}
              loading={saving}
              customClass="flex-1 !h-[42px] !text-white text-sm"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Milestone Toast ────────────────────────────────────────────────────────────

function MilestoneToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="fixed top-6 right-6 z-[9999] flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium bg-amber-50 border border-amber-200 max-w-xs w-full">
      <FlameIcon className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-bold text-amber-900">Milestone reached!</p>
        <p className="text-amber-700 text-xs mt-0.5">{message}</p>
      </div>
      <button onClick={onDismiss} className="text-amber-400 hover:text-amber-600 transition-colors shrink-0 cursor-pointer mt-0.5">
        <CloseCircle size={14} color="currentColor" />
      </button>
    </div>
  );
}

// ── Prayer Journal (Notes) Panel ──────────────────────────────────────────────

function NotesPanel({
  notes,
  loading,
  partnershipId,
  onNoteAdded,
}: {
  notes: PrayerNote[];
  loading: boolean;
  partnershipId: string;
  onNoteAdded: (note: PrayerNote) => void;
}) {
  const [input, setInput]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const handleAdd = async () => {
    const content = input.trim();
    if (!content) return;
    setSubmitting(true); setError('');
    try {
      const note = await accountabilityService.createNote(partnershipId, content) as PrayerNote;
      onNoteAdded(note);
      setInput('');
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Could not save note');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div>
      <h3 className="font-bold text-[#180426] mb-3">Prayer Journal</h3>

      {/* Input */}
      <div className="bg-white border border-[#E3E8EF] rounded-2xl p-4 mb-3">
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          placeholder="Write a prayer note or reflection…"
          rows={3}
          className="w-full text-sm text-[#180426] placeholder-[#9ca3af] resize-none focus:outline-none"
        />
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAdd}
            disabled={submitting || !input.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full text-xs font-semibold disabled:opacity-50 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {submitting
              ? <span className="inline-block w-3 h-3 rounded-full border-2 border-t-white border-white/30 animate-spin" />
              : <Add size={12} color="white" />}
            Add note
          </button>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="flex justify-center py-6">
          <span className="inline-block w-5 h-5 rounded-full border-2 border-t-[#870BD6] border-[#E7C8FF] animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-xs text-[#60666B] text-center py-4">No notes yet. Add your first prayer reflection above.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl p-4 border border-[#E3E8EF]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-[10px] overflow-hidden shrink-0">
                  {n.author.avatarUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={n.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : `${n.author.firstName[0]}${n.author.lastName[0]}`}
                </div>
                <span className="text-xs font-semibold text-[#180426]">{n.author.firstName}</span>
                <span className="text-xs text-[#60666B] ml-auto">{formatDate(n.createdAt)}</span>
              </div>
              <p className="text-sm text-[#180426] leading-relaxed whitespace-pre-wrap">{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Session History Panel ──────────────────────────────────────────────────────
// Note: PrayerSession only stores startedAt, endedAt, and startedById.
// Per-member attendance is NOT tracked in the current data model.
// To add attendance, a PrayerSessionAttendee join table would be needed.

function SessionHistoryPanel({
  sessions,
  members,
}: {
  sessions: PrayerSessionRecord[];
  members: Member[];
}) {
  const formatDuration = (startedAt: string, endedAt?: string | null) => {
    if (!endedAt) return null;
    const ms = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    const min = Math.round(ms / 60000);
    return min > 0 ? `${min} min` : null;
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  return (
    <div>
      <h3 className="font-bold text-[#180426] mb-3">Session History</h3>
      {sessions.length === 0 ? (
        <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6 flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#F5EBFF] flex items-center justify-center mb-1">
            <Video size={18} color="#870BD6" />
          </div>
          <p className="text-sm font-semibold text-[#180426]">No sessions yet</p>
          <p className="text-xs text-[#60666B] max-w-xs">Your prayer session history will appear here once you hold your first session together.</p>
        </div>
      ) : (
      <div className="space-y-3">
        {sessions.map((s, i) => {
          const starter = s.startedBy
            ? members.find((m) => m.id === s.startedBy!.id) ?? s.startedBy
            : null;
          const duration = formatDuration(s.startedAt, s.endedAt);

          return (
            <div key={s.id} className="bg-white rounded-2xl p-4 border border-[#E3E8EF] flex items-start gap-3">
              {/* Timeline dot */}
              <div className="flex flex-col items-center shrink-0 pt-0.5">
                <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-[#870BD6]' : 'bg-[#D2D9DF]'}`} />
                {i < sessions.length - 1 && <div className="w-px flex-1 bg-[#E3E8EF] mt-1" style={{ minHeight: 16 }} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#180426]">{formatDate(s.startedAt)}</p>
                  {duration && (
                    <span className="text-xs text-[#60666B] bg-[#F5EBFF] px-2 py-0.5 rounded-full font-medium shrink-0">
                      {duration}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#60666B] mt-0.5">{formatTime(s.startedAt)}</p>
                {starter && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-5 h-5 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-[9px] overflow-hidden shrink-0">
                      {(starter as Member).avatarUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={(starter as Member).avatarUrl} alt="" className="w-full h-full object-cover" />
                        : `${starter.firstName[0]}${starter.lastName[0]}`}
                    </div>
                    <p className="text-xs text-[#60666B]">
                      Started by <span className="font-medium text-[#180426]">{starter.firstName}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
