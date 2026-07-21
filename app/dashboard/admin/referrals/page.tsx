'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Link21, AddCircle, CloseCircle, People, TickSquare, Refresh, ArrowLeft2, ArrowRight2,
} from 'iconsax-react';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Button from '@/app/components/Button';
import { referralService, type ReferralCode, type ReferralSignup } from '@/lib/api-services';

// ── Create Modal ──────────────────────────────────────────────────────────────

const CreateModal = ({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (code: ReferralCode) => void;
}) => {
  const [marketerName, setMarketerName] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketerName.trim()) { setError('Marketer name is required.'); return; }
    setLoading(true);
    setError(null);
    try {
      const created = await referralService.createCode(marketerName.trim(), customCode.trim() || undefined) as ReferralCode;
      onCreated(created);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-bold text-gray-900">New Referral Link</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseCircle size={20} color="#9CA3AF" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Marketer Name *</label>
            <input
              autoFocus
              value={marketerName}
              onChange={(e) => setMarketerName(e.target.value)}
              placeholder="e.g. Sarah Johnson"
              className="w-full h-10 border border-[#D2D9DF] rounded-xl px-3 text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Custom Code <span className="font-normal text-[#60666B]">(optional — auto-generated if blank)</span>
            </label>
            <input
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="e.g. SARAH2024"
              maxLength={20}
              className="w-full h-10 border border-[#D2D9DF] rounded-xl px-3 text-sm font-mono uppercase focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="button" buttonType="bordered" customClass="flex-1 !rounded-full !text-sm !text-gray-700" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} customClass="flex-1 !rounded-full !text-sm !text-white">
              Create Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminReferralsPage = () => {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [selected, setSelected] = useState<ReferralCode | null>(null);
  const [signups, setSignups] = useState<ReferralSignup[]>([]);
  const [signupsLoading, setSignupsLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://joinbreed.com';

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await referralService.listCodes() as ReferralCode[];
      setCodes(res);
    } catch {
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const handleSelectRow = async (code: ReferralCode) => {
    if (selected?.code === code.code) {
      setSelected(null);
      setSignups([]);
      return;
    }
    setSelected(code);
    setSignupsLoading(true);
    setSignups([]);
    try {
      const res = await referralService.getSignups(code.code) as { signups: ReferralSignup[] };
      setSignups(res.signups);
    } catch {
      setSignups([]);
    } finally {
      setSignupsLoading(false);
    }
  };

  const handleCreated = (code: ReferralCode) => {
    setCodes((prev) => [{ ...code, signupCount: 0 }, ...prev]);
    setShowCreate(false);
  };

  const copyLink = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${BASE_URL}/welcome?ref=${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <DashboardLayout custom={true}>
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}

      <div className="bg-white min-h-full px-4 lg:px-10 pt-6 pb-10">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">Referral Links</h1>
            <p className="text-sm text-[#60666B] mt-1">
              {loading ? 'Loading…' : `${codes.length} link${codes.length !== 1 ? 's' : ''} · ${codes.reduce((a, c) => a + c.signupCount, 0)} total signups`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button buttonType="bordered" customClass="!rounded-full !text-sm !text-gray-700 !px-3" onClick={fetchCodes}>
              <Refresh size={14} color="#6B7280" />
              Refresh
            </Button>
            <Button customClass="!rounded-full !text-sm !text-white !px-4" onClick={() => setShowCreate(true)}>
              <AddCircle size={16} color="white" />
              New Link
            </Button>
          </div>
        </div>

        {/* Referral Codes Table */}
        <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8EF] bg-[#F8F9FC]">
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Marketer</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Code</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Link</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Signups</th>
                  <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Created</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E8EF]">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                      <td className="px-5 py-4"><div className="h-6 bg-gray-200 rounded-full w-24" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-48" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-7 bg-gray-200 rounded-full w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : codes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-20 text-center text-[#60666B] text-sm">
                      <Link21 size={32} className="mx-auto mb-3" color="#D1D5DB" />
                      No referral links yet
                      <div className="mt-4">
                        <Button customClass="!rounded-full !text-sm !text-white !px-4" onClick={() => setShowCreate(true)}>
                          <AddCircle size={15} color="white" />
                          Create First Link
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  codes.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => handleSelectRow(c)}
                      className={`transition-colors cursor-pointer ${selected?.code === c.code ? 'bg-[#FAF5FF]' : 'hover:bg-[#FAFAFA]'}`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-xs flex-shrink-0">
                            {c.marketerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900">{c.marketerName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[12px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#F5EBFF] text-[#870BD6] border border-[#D5B4FB]">
                          {c.code}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#60666B] font-mono">
                        {BASE_URL}/welcome?ref={c.code}
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1.5 text-[13px] text-[#870BD6] font-semibold">
                          <People size={13} color="#870BD6" />
                          {c.signupCount}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={(e) => copyLink(e, c.code)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D2D9DF] text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                          >
                            {copiedCode === c.code ? (
                              <><TickSquare size={12} color="#067647" variant="Bold" /><span className="text-[#067647]">Copied!</span></>
                            ) : (
                              <><Link21 size={12} color="#6B7280" />Copy Link</>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signups Table */}
        {selected && (
          <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3E8EF] bg-[#F8F9FC]">
              <div>
                <p className="text-[13px] font-bold text-gray-900">
                  Signups via <span className="text-[#870BD6]">{selected.code}</span>
                  <span className="ml-1.5 font-normal text-[#60666B]">· {selected.marketerName}</span>
                </p>
              </div>
              <button onClick={() => { setSelected(null); setSignups([]); }} className="text-gray-400 hover:text-gray-600">
                <CloseCircle size={18} color="#9CA3AF" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E3E8EF] bg-[#FAFAFA]">
                    <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B]">Name</th>
                    <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B]">Email</th>
                    <th className="text-left px-5 py-3.5 text-[12px] font-semibold text-[#60666B] whitespace-nowrap">Signed Up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E8EF]">
                  {signupsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-44" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                      </tr>
                    ))
                  ) : signups.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-12 text-center text-[#60666B] text-sm">
                        <People size={28} className="mx-auto mb-2" color="#D1D5DB" />
                        No signups yet — share the link to get started.
                      </td>
                    </tr>
                  ) : (
                    signups.map((s) => (
                      <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] text-xs font-bold flex-shrink-0">
                              {s.firstName[0]}{s.lastName[0]}
                            </div>
                            <span className="font-semibold text-gray-900 text-[13px]">{s.firstName} {s.lastName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[13px] text-[#60666B]">{s.email}</td>
                        <td className="px-5 py-4 text-[12px] text-[#60666B] whitespace-nowrap">
                          {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminReferralsPage;
