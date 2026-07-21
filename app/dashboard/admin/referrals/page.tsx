'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Link21, AddCircle, CloseCircle, People, TickSquare, Refresh,
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
            <Button
              type="button"
              buttonType="bordered"
              customClass="flex-1 !rounded-full !text-sm !text-gray-700"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              customClass="flex-1 !rounded-full !text-sm !text-white"
            >
              Create Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Signups Drawer ────────────────────────────────────────────────────────────

const SignupsDrawer = ({
  code,
  marketerName,
  onClose,
}: {
  code: string;
  marketerName: string;
  onClose: () => void;
}) => {
  const [signups, setSignups] = useState<ReferralSignup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    referralService.getSignups(code)
      .then((res) => { const r = res as { signups: ReferralSignup[] }; setSignups(r.signups); })
      .catch(() => setSignups([]))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full sm:w-[420px] h-[80vh] sm:h-full sm:max-h-screen overflow-y-auto shadow-2xl sm:border-l border-[#E3E8EF] flex flex-col rounded-t-2xl sm:rounded-none">
        <div className="flex items-center justify-between p-5 border-b border-[#E3E8EF] sticky top-0 bg-white z-10">
          <div>
            <p className="font-bold text-gray-900 text-[15px]">{marketerName}</p>
            <p className="text-xs text-[#60666B] font-mono mt-0.5">{code}</p>
          </div>
          <button onClick={onClose}>
            <CloseCircle size={20} color="#9CA3AF" />
          </button>
        </div>

        <div className="flex-1 p-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : signups.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                <People size={22} color="#870BD6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No signups yet</p>
              <p className="text-xs text-[#60666B]">Share the link and signups will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {signups.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#E3E8EF]">
                  <div className="w-8 h-8 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] text-xs font-bold flex-shrink-0">
                    {s.firstName[0]}{s.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-[#60666B] truncate">{s.email}</p>
                  </div>
                  <p className="text-[11px] text-[#60666B] flex-shrink-0">
                    {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminReferralsPage = () => {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [drawer, setDrawer] = useState<{ code: string; marketerName: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const handleCreated = (code: ReferralCode) => {
    setCodes((prev) => [{ ...code, signupCount: 0 }, ...prev]);
    setShowCreate(false);
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${BASE_URL}/welcome?ref=${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <DashboardLayout custom={true}>
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
      {drawer && (
        <SignupsDrawer
          code={drawer.code}
          marketerName={drawer.marketerName}
          onClose={() => setDrawer(null)}
        />
      )}

      <div className="bg-white min-h-full px-4 lg:px-10 pt-6 pb-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900 leading-none">Referral Links</h1>
            <p className="text-sm text-[#60666B] mt-1">
              {loading ? 'Loading…' : `${codes.length} link${codes.length !== 1 ? 's' : ''} · ${codes.reduce((a, c) => a + c.signupCount, 0)} total signups`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              buttonType="bordered"
              customClass="!rounded-full !text-sm !text-gray-700 !px-3"
              onClick={fetchCodes}
            >
              <Refresh size={14} color="#6B7280" />
              Refresh
            </Button>
            <Button
              customClass="!rounded-full !text-sm !text-white !px-4"
              onClick={() => setShowCreate(true)}
            >
              <AddCircle size={16} color="white" />
              New Link
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse border border-[#E3E8EF] rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-3 bg-gray-200 rounded w-56" />
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-lg" />
              </div>
            ))}
          </div>
        ) : codes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center border border-[#E3E8EF] rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
              <Link21 size={22} color="#870BD6" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No referral links yet</p>
            <p className="text-xs text-[#60666B]">Create a link for each marketer to track their signups.</p>
            <Button
              customClass="mt-2 !rounded-full !text-sm !text-white !px-4"
              onClick={() => setShowCreate(true)}
            >
              <AddCircle size={15} color="white" />
              Create First Link
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map((c) => (
              <div
                key={c.id}
                onClick={() => setDrawer({ code: c.code, marketerName: c.marketerName })}
                className="border border-[#E3E8EF] rounded-2xl p-5 flex flex-wrap items-center gap-4 hover:border-[#D5B4FB] transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm flex-shrink-0">
                  {c.marketerName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{c.marketerName}</p>
                  <p className="text-xs text-[#60666B] font-mono mt-0.5 truncate">
                    {BASE_URL}/welcome?ref=<span className="text-[#870BD6] font-semibold">{c.code}</span>
                  </p>
                  <p className="text-xs text-[#60666B] mt-1">
                    Created {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setDrawer({ code: c.code, marketerName: c.marketerName })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5EBFF] text-[#870BD6] text-xs font-semibold border border-[#D5B4FB] hover:bg-[#EDD5FF] transition-colors"
                  >
                    <People size={13} color="#870BD6" />
                    {c.signupCount} signup{c.signupCount !== 1 ? 's' : ''}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); copyLink(c.code); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D2D9DF] text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {copiedCode === c.code ? (
                      <><TickSquare size={13} color="#067647" variant="Bold" /><span className="text-[#067647]">Copied!</span></>
                    ) : (
                      <><Link21 size={13} color="#6B7280" />Copy Link</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminReferralsPage;
