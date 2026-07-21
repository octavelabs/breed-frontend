'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, People } from 'iconsax-react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import { referralService, type ReferralSignup } from '@/lib/api-services';

// ── Page ──────────────────────────────────────────────────────────────────────

const ReferralSignupsPage = () => {
  const router = useRouter();
  const { code } = useParams<{ code: string }>();

  const [marketerName, setMarketerName] = useState('');
  const [signups, setSignups] = useState<ReferralSignup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSignups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await referralService.getSignups(code) as { code: string; marketerName: string; signups: ReferralSignup[] };
      setMarketerName(res.marketerName ?? '');
      setSignups(res.signups ?? []);
    } catch {
      setSignups([]);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => { fetchSignups(); }, [fetchSignups]);

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white min-h-full px-4 lg:px-10 pt-6 pb-10">

        {/* Back */}
        <button
          onClick={() => router.push('/dashboard/admin/referrals')}
          className="flex items-center gap-2 text-[#60666B] hover:text-gray-900 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} color="#60666B" /> Back to Referrals
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">
            {loading && !marketerName ? 'Signups' : marketerName}
          </h1>
          <p className="text-sm text-[#60666B] mt-1">
            {loading ? 'Loading…' : `${signups.length} signup${signups.length !== 1 ? 's' : ''} via `}
            {!loading && (
              <span className="font-mono font-semibold text-[#870BD6]">{code}</span>
            )}
          </p>
        </div>

        {/* Summary card */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl border border-[#E7C8FF] bg-[#FBF6FF] p-4">
              <div className="flex items-center gap-2 mb-1">
                <People size={16} color="#870BD6" />
                <p className="text-[13px] text-[#60666B]">Total Signups</p>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{signups.length}</h3>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8EF] bg-[#F8F9FC]">
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B]">User</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B]">Email</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Signed Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8EF]">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
                          <div className="h-3.5 bg-gray-200 rounded w-32" />
                        </div>
                      </td>
                      <td className="px-5 py-4"><div className="h-3 bg-gray-200 rounded w-44" /></td>
                      <td className="px-5 py-4"><div className="h-3 bg-gray-200 rounded w-20" /></td>
                    </tr>
                  ))
                ) : signups.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-20 text-center text-[#60666B] text-sm">
                      <People size={32} className="mx-auto mb-3" color="#D1D5DB" />
                      No signups yet — share the link to get started.
                    </td>
                  </tr>
                ) : (
                  signups.map((s) => {
                    const initials = `${s.firstName[0] ?? ''}${s.lastName[0] ?? ''}`.toUpperCase();
                    return (
                      <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] text-xs font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <span className="font-semibold text-gray-900">
                              {s.firstName} {s.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-[#60666B]">{s.email}</td>
                        <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                          {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ReferralSignupsPage;
