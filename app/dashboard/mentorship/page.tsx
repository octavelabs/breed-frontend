'use client';

import { useCallback, useEffect, useState } from 'react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Button from '@/app/components/Button';
import { mentorshipService } from '@/lib/api-services';
import { Search, Users, BookOpen, Star, ChevronRight, Inbox } from 'lucide-react';

interface MentorProfile {
  bio?: string | null;
  specializations?: string[];
  sessionRate?: number | null;
  maxDisciples?: number | null;
}

interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  mentorProfile?: MentorProfile | null;
  discipleCount: number;
}

interface MyMentorship {
  id: string;
  status: string;
  startedAt?: string | null;
  createdAt: string;
  mentor: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    username?: string;
    mentorProfile?: MentorProfile | null;
  };
}

const STATUS_CLASSES: Record<string, string> = {
  PENDING:   'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]',
  ACTIVE:    'bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]',
  REJECTED:  'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]',
  PAUSED:    'bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]',
  COMPLETED: 'bg-[#F2F4F7] text-[#344054] border border-[#D0D5DD]',
};

function Avatar({
  user, size = 'md',
}: {
  user: { firstName: string; lastName: string; avatarUrl?: string | null };
  size?: 'sm' | 'md' | 'lg';
}) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const cls = size === 'lg' ? 'w-14 h-14 text-base' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt={user.firstName} className={`${cls} rounded-full object-cover shrink-0`} />
  ) : (
    <div className={`${cls} rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function RequestModal({
  mentor,
  onClose,
  onSuccess,
}: {
  mentor: Mentor;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await mentorshipService.requestMentorship(mentor.id, message || undefined);
      onSuccess();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-[20px] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-1">
            <Avatar user={mentor} size="md" />
            <div>
              <p className="font-bold text-[#180426]">{mentor.firstName} {mentor.lastName}</p>
              {mentor.username && <p className="text-xs text-[#60666B]">@{mentor.username}</p>}
            </div>
          </div>
          <h2 className="text-lg font-bold mt-4">Request Mentorship</h2>
          <p className="text-sm text-[#60666B] mt-0.5">Send a personal message to introduce yourself.</p>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#180426] mb-1.5">
              Message <span className="text-[#60666B] font-normal">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell them about yourself, your spiritual journey, and what you're hoping to learn…"
              className="w-full border border-[#B9C2CA] rounded-[10px] px-4 py-3 text-sm text-[#180426] placeholder:text-[#B9C2CA] resize-none focus:outline-none focus:border-[#870BD6] focus:ring-1 focus:ring-[#870BD6]"
            />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3">
            <Button buttonType="bordered" customClass="!w-1/2 !h-[48px] !border-[#60666B] !text-[#60666B]" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button customClass="!w-1/2 !h-[48px]" loading={loading} onClick={handleSubmit}>
              Send Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const MentorshipPage = () => {
  const [tab, setTab] = useState<'discover' | 'my'>('discover');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [myMentorships, setMyMentorships] = useState<MyMentorship[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [loadingMy, setLoadingMy] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const loadMentors = useCallback(() => {
    setLoadingMentors(true);
    mentorshipService.getMentors({ limit: 50 })
      .then((res: any) => {
        const data = res?.data ?? res;
        setMentors(Array.isArray(data) ? data : []);
      })
      .catch(() => setMentors([]))
      .finally(() => setLoadingMentors(false));
  }, []);

  const loadMyMentorships = useCallback(() => {
    setLoadingMy(true);
    mentorshipService.getMyMentorships({ role: 'disciple', limit: 50 })
      .then((res: any) => {
        const data = res?.data ?? res;
        setMyMentorships(Array.isArray(data) ? data : []);
      })
      .catch(() => setMyMentorships([]))
      .finally(() => setLoadingMy(false));
  }, []);

  useEffect(() => { loadMentors(); loadMyMentorships(); }, [loadMentors, loadMyMentorships]);

  const filteredMentors = mentors.filter((m) => {
    const q = search.toLowerCase();
    return (
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
      (m.username ?? '').toLowerCase().includes(q) ||
      (m.bio ?? '').toLowerCase().includes(q) ||
      (m.mentorProfile?.specializations ?? []).some((s) => s.toLowerCase().includes(q))
    );
  });

  const handleRequestSuccess = () => {
    if (selectedMentor) setSuccessId(selectedMentor.id);
    setSelectedMentor(null);
    loadMyMentorships();
    setTab('my');
  };

  return (
    <DashboardLayout>
      {selectedMentor && (
        <RequestModal
          mentor={selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onSuccess={handleRequestSuccess}
        />
      )}

      <div className="px-4 lg:px-10 pt-6 pb-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-[28px] font-bold text-[#180426]">Mentorship</h1>
          <p className="text-sm text-[#60666B] mt-1">Find a spiritual mentor or track your mentorship journey.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#F6F8FA] p-1 rounded-full w-fit mb-6">
          {(['discover', 'my'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                tab === t ? 'bg-white shadow text-[#180426]' : 'text-[#60666B] hover:text-[#180426]'
              }`}
            >
              {t === 'discover' ? 'Discover Mentors' : 'My Mentorships'}
            </button>
          ))}
        </div>

        {/* ── Discover tab ──────────────────────────────────── */}
        {tab === 'discover' && (
          <div>
            {/* Search */}
            <div className="relative mb-6 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B9C2CA]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, specialty…"
                className="w-full pl-10 pr-4 py-2.5 border border-[#B9C2CA] rounded-full text-sm bg-white focus:outline-none focus:border-[#870BD6] focus:ring-1 focus:ring-[#870BD6]"
              />
            </div>

            {loadingMentors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredMentors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                  <Users size={26} className="text-[#870BD6]" />
                </div>
                <p className="font-semibold text-gray-700">No mentors found</p>
                <p className="text-sm text-[#60666B]">There are no mentors accepting disciples right now.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMentors.map((mentor) => (
                  <MentorCard
                    key={mentor.id}
                    mentor={mentor}
                    alreadyRequested={successId === mentor.id || myMentorships.some((m) => m.mentor.id === mentor.id)}
                    onRequest={() => setSelectedMentor(mentor)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── My Mentorships tab ────────────────────────────── */}
        {tab === 'my' && (
          <div className="space-y-3">
            {loadingMy ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : myMentorships.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                  <Inbox size={26} className="text-[#870BD6]" />
                </div>
                <p className="font-semibold text-gray-700">No mentorships yet</p>
                <p className="text-sm text-[#60666B] max-w-xs">
                  Request a mentor from the Discover tab to begin your discipleship journey.
                </p>
                <button
                  onClick={() => setTab('discover')}
                  className="mt-2 px-5 py-2 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white text-sm font-medium rounded-full"
                >
                  Find a Mentor
                </button>
              </div>
            ) : (
              myMentorships.map((m) => (
                <div key={m.id} className="bg-white border border-[#E3E8EF] rounded-2xl p-4 flex items-center gap-4">
                  <Avatar user={m.mentor} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#180426]">{m.mentor.firstName} {m.mentor.lastName}</p>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CLASSES[m.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {m.status.toLowerCase()}
                      </span>
                    </div>
                    {m.mentor.username && <p className="text-xs text-[#60666B]">@{m.mentor.username}</p>}
                    {m.mentor.mentorProfile?.specializations?.length ? (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {m.mentor.mentorProfile.specializations.slice(0, 3).map((s) => (
                          <span key={s} className="text-[10px] bg-[#F5EBFF] text-[#870BD6] px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-xs text-[#60666B] text-right shrink-0">
                    <p>Since</p>
                    <p className="font-medium text-[#180426]">
                      {new Date(m.startedAt ?? m.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

function MentorCard({
  mentor,
  alreadyRequested,
  onRequest,
}: {
  mentor: Mentor;
  alreadyRequested: boolean;
  onRequest: () => void;
}) {
  const specs = mentor.mentorProfile?.specializations ?? [];

  return (
    <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Top row */}
      <div className="flex items-start gap-3">
        <Avatar user={mentor} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#180426] truncate">{mentor.firstName} {mentor.lastName}</p>
          {mentor.username && <p className="text-xs text-[#60666B]">@{mentor.username}</p>}
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-[#60666B]">
              <Users size={11} />
              {mentor.discipleCount} disciple{mentor.discipleCount !== 1 ? 's' : ''}
            </span>
            {mentor.mentorProfile?.sessionRate != null && (
              <span className="flex items-center gap-1 text-xs text-[#60666B]">
                <Star size={11} />
                {mentor.mentorProfile.sessionRate}/session
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      {(mentor.mentorProfile?.bio ?? mentor.bio) && (
        <p className="text-xs text-[#60666B] line-clamp-2 leading-relaxed">
          {mentor.mentorProfile?.bio ?? mentor.bio}
        </p>
      )}

      {/* Specializations */}
      {specs.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {specs.slice(0, 4).map((s) => (
            <span key={s} className="text-[11px] bg-[#F5EBFF] text-[#870BD6] px-2.5 py-0.5 rounded-full font-medium">
              {s}
            </span>
          ))}
          {specs.length > 4 && (
            <span className="text-[11px] bg-gray-100 text-[#60666B] px-2.5 py-0.5 rounded-full">+{specs.length - 4}</span>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto pt-1">
        {alreadyRequested ? (
          <div className="w-full h-[40px] flex items-center justify-center bg-[#F5EBFF] rounded-full text-sm font-medium text-[#870BD6]">
            Request Sent
          </div>
        ) : (
          <button
            onClick={onRequest}
            className="w-full h-[40px] flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
          >
            Request Mentorship
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default MentorshipPage;
