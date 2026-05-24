'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Users, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import { accountabilityService } from '@/lib/api-services';
import { useAuth } from '@/context/AuthContext';

const DAY_LABELS: Record<string, string> = {
  MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun',
};

interface InviteInfo {
  invitedBy: { firstName: string; lastName: string; avatarUrl?: string };
  email: string;
  prayerDays: string[];
  prayerTime: string;
  timezone: string;
  status: string;
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
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC]">
        <Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Invite unavailable</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-sm">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">You&apos;re prayer partners! 🙏</h2>
          <p className="text-sm text-gray-500">Taking you to your prayer room...</p>
        </div>
      </div>
    );
  }

  const inviterName = info ? `${info.invitedBy.firstName} ${info.invitedBy.lastName}` : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FC] p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-sm">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7 text-[#870BD6]" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#870BD6]">Breed — Prayer Partner</p>
        </div>

        <h1 className="text-xl font-bold text-gray-900 text-center mb-1">You&apos;ve been invited</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          <strong>{inviterName}</strong> wants to be your prayer partner on Breed
        </p>

        {info && (
          <div className="bg-purple-50 rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-[#870BD6]" />
              <span>Prayer time: <strong>{info.prayerTime}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-[#870BD6]" />
              <span>{info.prayerDays.map((d) => DAY_LABELS[d] ?? d).join(', ')}</span>
            </div>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full py-3 bg-[#870BD6] text-white rounded-xl font-semibold hover:bg-[#7009b8] transition-colors disabled:opacity-60"
        >
          {accepting ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
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
