'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Users, Flame, Clock, ChevronRight, Loader2, X, Check, Mail } from 'lucide-react';
import { accountabilityService } from '@/lib/api-services';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

interface Group {
  id: string;
  name: string;
  description?: string;
  frequency: string;
  prayerTime?: string;
  memberCount: number;
  checkinCount: number;
  myRole: string;
  myStreak: number;
  isActive: boolean;
  prayerDays: string[];
  focusTopics: string[];
}

interface GroupDetail extends Group {
  members: Array<{ userId: string; user: { id: string; firstName: string; lastName: string; avatarUrl?: string }; role: string; currentStreak: number }>;
  checkedInToday: boolean;
  prayerRoom?: {
    id: string;
    checkins: Array<{ id: string; user: { firstName: string; lastName: string; avatarUrl?: string }; note?: string; checkedAt: string }>;
    roomRequests: Array<{ id: string; user: { firstName: string; lastName: string }; content: string; isAnswered: boolean; createdAt: string }>;
  };
}

export default function AccountabilityTab() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<GroupDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [checkinNote, setCheckinNote] = useState('');
  const [prayerInput, setPrayerInput] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  const loadGroups = useCallback(async () => {
    try {
      const data = await accountabilityService.getMyGroups() as Group[];
      setGroups(Array.isArray(data) ? data : []);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  const openGroup = async (id: string) => {
    setLoadingDetail(true);
    try {
      const data = await accountabilityService.getGroupById(id) as GroupDetail;
      setSelectedGroup(data);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCheckin = async () => {
    if (!selectedGroup || checkingIn) return;
    setCheckingIn(true);
    try {
      await accountabilityService.checkin(selectedGroup.id, checkinNote || undefined);
      setCheckinNote('');
      const data = await accountabilityService.getGroupById(selectedGroup.id) as GroupDetail;
      setSelectedGroup(data);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === selectedGroup.id ? { ...g, myStreak: (g.myStreak ?? 0) + 1 } : g,
        ),
      );
    } finally {
      setCheckingIn(false);
    }
  };

  const handlePrayerRequest = async () => {
    if (!selectedGroup || !prayerInput.trim() || submitting) return;
    setSubmitting(true);
    try {
      await accountabilityService.createPrayerRequest(selectedGroup.id, prayerInput.trim());
      setPrayerInput('');
      const data = await accountabilityService.getGroupById(selectedGroup.id) as GroupDetail;
      setSelectedGroup(data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedGroup || !inviteEmail.trim() || submitting) return;
    setSubmitting(true);
    try {
      await accountabilityService.inviteMember(selectedGroup.id, { email: inviteEmail.trim() });
      setInviteEmail('');
      setShowInvite(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedGroup) {
    return (
      <GroupDetailView
        group={selectedGroup}
        onBack={() => setSelectedGroup(null)}
        onCheckin={handleCheckin}
        checkingIn={checkingIn}
        checkinNote={checkinNote}
        setCheckinNote={setCheckinNote}
        prayerInput={prayerInput}
        setPrayerInput={setPrayerInput}
        onPrayerRequest={handlePrayerRequest}
        submitting={submitting}
        showInvite={showInvite}
        setShowInvite={setShowInvite}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        onInvite={handleInvite}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Accountability Groups</h2>
          <p className="text-sm text-gray-500 mt-1">Pray together, grow together</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#870BD6] text-white rounded-full text-sm font-semibold hover:bg-[#7009b8] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Group
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" /></div>
      ) : groups.length === 0 ? (
        <EmptyGroups onCreate={() => setShowCreate(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} onClick={() => openGroup(g.id)} loading={loadingDetail} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreated={(newGroup) => {
            setGroups((prev) => [newGroup, ...prev]);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

function EmptyGroups({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-[#870BD6]" />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">No accountability groups yet</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
        Create a group to start praying regularly with friends and build streaks together.
      </p>
      <button
        onClick={onCreate}
        className="px-6 py-2.5 bg-[#870BD6] text-white rounded-full text-sm font-semibold hover:bg-[#7009b8] transition-colors"
      >
        Create Your First Group
      </button>
    </div>
  );
}

function GroupCard({ group, onClick, loading }: { group: Group; onClick: () => void; loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="text-left bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all border border-gray-100 w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <Users className="w-5 h-5 text-[#870BD6]" />
        </div>
        {group.myStreak > 0 && (
          <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold text-orange-600">{group.myStreak}</span>
          </div>
        )}
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{group.name}</h3>
      {group.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{group.description}</p>}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{group.memberCount} members</span>
        {group.prayerTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{group.prayerTime}</span>}
      </div>
      {group.focusTopics.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {group.focusTopics.slice(0, 3).map((t) => (
            <span key={t} className="px-2 py-0.5 bg-purple-50 text-[#870BD6] text-[10px] font-medium rounded-full">{t}</span>
          ))}
        </div>
      )}
    </button>
  );
}

function GroupDetailView({
  group, onBack, onCheckin, checkingIn, checkinNote, setCheckinNote,
  prayerInput, setPrayerInput, onPrayerRequest, submitting,
  showInvite, setShowInvite, inviteEmail, setInviteEmail, onInvite,
}: {
  group: GroupDetail;
  onBack: () => void;
  onCheckin: () => void;
  checkingIn: boolean;
  checkinNote: string;
  setCheckinNote: (v: string) => void;
  prayerInput: string;
  setPrayerInput: (v: string) => void;
  onPrayerRequest: () => void;
  submitting: boolean;
  showInvite: boolean;
  setShowInvite: (v: boolean) => void;
  inviteEmail: string;
  setInviteEmail: (v: string) => void;
  onInvite: () => void;
}) {
  const [activeRoom, setActiveRoom] = useState<'checkins' | 'requests' | 'members' | 'streaks'>('checkins');

  return (
    <div>
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
          {group.description && <p className="text-sm text-gray-500">{group.description}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-3 py-2 border border-[#870BD6] text-[#870BD6] rounded-full text-sm font-semibold hover:bg-purple-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Invite
          </button>
        </div>
      </div>

      {/* Check-in card */}
      <div className={`rounded-2xl p-5 mb-6 ${group.checkedInToday ? 'bg-green-50 border border-green-200' : 'bg-[#870BD6]'}`}>
        {group.checkedInToday ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-800">You prayed today! 🙏</p>
              <p className="text-sm text-green-600">Streak: {group.myStreak} days</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-white font-bold mb-3">Did you pray today?</p>
            <input
              value={checkinNote}
              onChange={(e) => setCheckinNote(e.target.value)}
              placeholder="Add a short note (optional)..."
              className="w-full bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-xl px-3 py-2 text-sm mb-3 outline-none"
            />
            <button
              onClick={onCheckin}
              disabled={checkingIn}
              className="flex items-center gap-2 px-5 py-2 bg-white text-[#870BD6] rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              {checkingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />}
              I Prayed
            </button>
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit text-sm">
        {(['checkins', 'requests', 'members', 'streaks'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveRoom(t)}
            className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${activeRoom === t ? 'bg-white text-[#870BD6] shadow-sm' : 'text-gray-500'}`}
          >
            {t === 'requests' ? 'Prayer Requests' : t}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeRoom === 'checkins' && (
        <div className="space-y-3">
          {(group.prayerRoom?.checkins ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No check-ins yet. Be the first!</p>
          ) : (
            group.prayerRoom!.checkins.map((c) => (
              <div key={c.id} className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-[#870BD6]">
                  {c.user.firstName[0]}{c.user.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{c.user.firstName} {c.user.lastName}</p>
                  {c.note && <p className="text-xs text-gray-500">{c.note}</p>}
                  <p className="text-[11px] text-gray-400 mt-1">{new Date(c.checkedAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeRoom === 'requests' && (
        <div>
          <div className="flex gap-2 mb-4">
            <input
              value={prayerInput}
              onChange={(e) => setPrayerInput(e.target.value)}
              placeholder="Share a prayer request with the group..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#870BD6]"
            />
            <button
              onClick={onPrayerRequest}
              disabled={submitting || !prayerInput.trim()}
              className="px-4 py-2 bg-[#870BD6] text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Share'}
            </button>
          </div>
          <div className="space-y-3">
            {(group.prayerRoom?.roomRequests ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No prayer requests yet.</p>
            ) : (
              group.prayerRoom!.roomRequests.map((r) => (
                <div key={r.id} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${r.isAnswered ? 'border-green-400' : 'border-[#870BD6]'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-800">{r.user.firstName} {r.user.lastName}</span>
                    {r.isAnswered && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Answered 🙌</span>}
                  </div>
                  <p className="text-sm text-gray-600">{r.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeRoom === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {group.members.map((m) => (
            <div key={m.userId} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-[#870BD6]">
                {m.user.firstName[0]}{m.user.lastName[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{m.user.firstName} {m.user.lastName}</p>
                <p className="text-xs text-gray-400 capitalize">{m.role.toLowerCase()}</p>
              </div>
              {m.currentStreak > 0 && (
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-bold text-orange-600">{m.currentStreak}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeRoom === 'streaks' && (
        <div className="space-y-3">
          {group.members
            .slice()
            .sort((a, b) => b.currentStreak - a.currentStreak)
            .map((m, idx) => (
              <div key={m.userId} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                  {idx + 1}
                </span>
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-[#870BD6]">
                  {m.user.firstName[0]}
                </div>
                <p className="flex-1 text-sm font-semibold text-gray-800">{m.user.firstName} {m.user.lastName}</p>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-orange-600">{m.currentStreak}</span>
                  <span className="text-xs text-gray-400">days</span>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Invite to Group</h3>
              <button onClick={() => setShowInvite(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#870BD6] mb-4"
            />
            <button
              onClick={onInvite}
              disabled={submitting || !inviteEmail.trim()}
              className="w-full py-2.5 bg-[#870BD6] text-white rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: (g: Group) => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prayerDays, setPrayerDays] = useState<string[]>([]);
  const [prayerTime, setPrayerTime] = useState('');
  const [focusTopic, setFocusTopic] = useState('');
  const [focusTopics, setFocusTopics] = useState<string[]>([]);
  const [frequency, setFrequency] = useState('daily');
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (day: string) => {
    setPrayerDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const addTopic = () => {
    if (focusTopic.trim() && !focusTopics.includes(focusTopic.trim())) {
      setFocusTopics((prev) => [...prev, focusTopic.trim()]);
      setFocusTopic('');
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    try {
      const group = await accountabilityService.createGroup({
        name: name.trim(),
        description: description || undefined,
        frequency,
        prayerDays,
        prayerTime: prayerTime || undefined,
        focusTopics,
      }) as Group;
      onCreated(group);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Create Accountability Group</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Group Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Prayer Warriors"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#870BD6]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this group about?"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#870BD6] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Prayer Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#870BD6]"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">Prayer Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${prayerDays.includes(day) ? 'bg-[#870BD6] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {DAY_LABELS[day]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Prayer Time</label>
            <input
              type="time"
              value={prayerTime}
              onChange={(e) => setPrayerTime(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#870BD6]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">Focus Topics</label>
            <div className="flex gap-2 mb-2">
              <input
                value={focusTopic}
                onChange={(e) => setFocusTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTopic()}
                placeholder="e.g. Healing, Family..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#870BD6]"
              />
              <button onClick={addTopic} type="button" className="px-3 py-2 bg-gray-100 rounded-xl text-sm font-medium">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {focusTopics.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-[#870BD6] rounded-full text-xs font-medium">
                  {t}
                  <button onClick={() => setFocusTopics((prev) => prev.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || submitting}
          className="w-full mt-6 py-3 bg-[#870BD6] text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-[#7009b8] transition-colors"
        >
          {submitting ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  );
}
