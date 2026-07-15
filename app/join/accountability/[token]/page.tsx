'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Profile2User, TickCircle, CloseCircle, Clock, Calendar } from 'iconsax-react';
import { accountabilityService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';

const DAY_LABELS: Record<string, string> = {
  MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun',
};

interface InviteInfo {
  invitedBy: { firstName: string; lastName: string; avatarUrl?: string };
  email: string | null;
  isLinkInvite: boolean;
  prayerDays: string[];
  prayerTime: string;
  timezone: string;
  status: string;
}

function Logo() {
  return (
    <div className="flex justify-center mb-8">
      <a href="https://joinbreed.com">
        <img src="/Logo.png" alt="Breed" className="h-[30px] w-[80px] object-contain" />
      </a>
    </div>
  );
}

export default function AccountabilityInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    accountabilityService.getInviteInfo(token)
      .then((data) => setInfo(data as InviteInfo))
      .catch((err) => setError(err?.message ?? 'Invite not found or expired'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/join/accountability/${token}`);
      return;
    }
    setAccepting(true);
    try {
      await accountabilityService.acceptInvite(token);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/buildup?tab=accountability'), 2000);
    } catch (err: unknown) {
      setError((err as Error)?.message ?? 'Failed to accept invite');
    } finally {
      setAccepting(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8edfe]">
        <div className="w-8 h-8 rounded-full border-2 border-t-[#870BD6] border-[#E9D5FF] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8edfe] p-4">
        <Logo />
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <CloseCircle size={48} color="#f87171" className="mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Invite unavailable</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8edfe] p-4">
        <Logo />
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <TickCircle size={48} color="#22c55e" className="mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">You&apos;ve joined the prayer group!</h2>
          <p className="text-sm text-gray-500">Taking you to your prayer room...</p>
        </div>
      </div>
    );
  }

  const inviterName = info ? `${info.invitedBy.firstName} ${info.invitedBy.lastName}` : '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8edfe] p-4">
      <Logo />
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
            <Profile2User size={28} color="#870BD6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#870BD6]">Breed — Prayer Partner</p>
        </div>

        <h1 className="text-xl font-bold text-gray-900 text-center mb-1">You&apos;ve been invited</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          <strong>{inviterName}</strong> {info?.isLinkInvite ? 'has invited you to join their prayer group on Breed' : 'wants to be your prayer partner on Breed'}
        </p>

        {info && (
          <div className="bg-purple-50 rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock size={16} color="#870BD6" />
              <span>Prayer time: <strong>{info.prayerTime}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar size={16} color="#870BD6" />
              <span>{info.prayerDays.map((d) => DAY_LABELS[d] ?? d).join(', ')}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full py-3 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {accepting ? (
            <span className="inline-block w-4 h-4 rounded-full border-2 border-t-white border-white/30 animate-spin mx-auto" />
          ) : isAuthenticated ? (
            'Accept & Start Praying Together'
          ) : (
            'Sign in to Accept'
          )}
        </button>

        {!isAuthenticated && (
          <p className="text-xs text-center text-gray-400 mt-3">
            You&apos;ll be redirected back here after signing in.
          </p>
        )}
      </div>
    </div>
  );
}
