"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { communityService } from "@/lib/api-services";
import {
  ArrowLeft, Users, MessageSquareText, Globe, Lock,
  Shield, UserX, MoreVertical, Settings, Save, Trash2,
  UserCheck, Crown, ChevronDown,
} from "lucide-react";
import Button from "@/app/components/Button";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Community {
  id: string;
  name: string;
  description?: string | null;
  coverImage?: string | null;
  privacy: "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
  maxMembers?: number;
  createdAt?: string;
  _count?: { members: number; messages: number };
}

interface Member {
  id: string;
  role: "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER";
  status: "ACTIVE" | "PENDING" | "BANNED" | "LEFT";
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    username?: string;
  };
}

// ── Role helpers ──────────────────────────────────────────────────────────────

const ROLES = ["OWNER", "ADMIN", "MODERATOR", "MEMBER"] as const;

const roleColor: Record<string, string> = {
  OWNER:     "bg-[#FBF6FF] text-[#870BD6] border border-[#E7C8FF]",
  ADMIN:     "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  MODERATOR: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  MEMBER:    "bg-[#F8F9FC] text-[#363F72] border border-[#D5D9EB]",
};

const roleIcon: Record<string, React.ReactNode> = {
  OWNER:     <Crown size={11} />,
  ADMIN:     <Shield size={11} />,
  MODERATOR: <UserCheck size={11} />,
  MEMBER:    <Users size={11} />,
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon, value, label, color }: {
  icon: React.ReactNode; value: string | number; label: string; color: string;
}) => (
  <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-[#180426] leading-none">{value}</p>
      <p className="text-sm text-[#60666B] mt-0.5">{label}</p>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const PreacherCommunityDetail = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers]     = useState<Member[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "members" | "settings">("overview");

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({ name: "", description: "", privacy: "PUBLIC" as string });
  const [saving, setSaving]             = useState(false);
  const [saveMsg, setSaveMsg]           = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Member action state
  const [memberAction, setMemberAction] = useState<string | null>(null); // userId in flight
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const loadCommunity = useCallback(async () => {
    setLoading(true);
    try {
      const [comm, mem] = await Promise.all([
        communityService.getById(id) as Promise<Community>,
        communityService.getMembers(id, { limit: 50 }) as Promise<unknown>,
      ]);
      setCommunity(comm);
      setSettingsForm({
        name: comm.name,
        description: comm.description ?? "",
        privacy: comm.privacy,
      });
      const mData = (mem as any)?.data ?? mem;
      setMembers(Array.isArray(mData) ? mData : []);
    } catch {
      setCommunity(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadCommunity(); }, [loadCommunity]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenDropdown(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await communityService.updateCommunity(id, {
        name: settingsForm.name,
        description: settingsForm.description || undefined,
        privacy: settingsForm.privacy,
      });
      setSaveMsg({ type: "success", text: "Community updated successfully." });
      loadCommunity();
    } catch (err: unknown) {
      setSaveMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to save changes." });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!window.confirm("Are you sure you want to delete this community? This cannot be undone.")) return;
    try {
      await communityService.deleteCommunity(id);
      router.push("/dashboard/preacher/community");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete community.");
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    setMemberAction(userId);
    setOpenDropdown(null);
    try {
      await communityService.updateMemberRole(id, userId, role);
      setMembers((prev) =>
        prev.map((m) => m.user.id === userId ? { ...m, role: role as Member["role"] } : m)
      );
    } catch {
      // silent
    } finally {
      setMemberAction(null);
    }
  };

  const handleBan = async (userId: string, isBanned: boolean) => {
    setMemberAction(userId);
    setOpenDropdown(null);
    try {
      if (isBanned) await communityService.unbanMember(id, userId);
      else          await communityService.banMember(id, userId);
      setMembers((prev) =>
        prev.map((m) =>
          m.user.id === userId ? { ...m, status: isBanned ? "ACTIVE" : "BANNED" } : m
        )
      );
    } catch {
      // silent
    } finally {
      setMemberAction(null);
    }
  };

  const initial      = community?.name?.charAt(0)?.toUpperCase() ?? "C";
  const memberCount  = community?._count?.members ?? 0;
  const messageCount = community?._count?.messages ?? 0;
  const isPrivate    = community?.privacy !== "PUBLIC";

  if (loading) {
    return (
      <DashboardLayout custom={true}>
        <div className="animate-pulse">
          <div className="h-48 bg-[#870BD6]" />
          <div className="px-4 md:px-12 py-8 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!community) {
    return (
      <DashboardLayout custom={true}>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-gray-500">Community not found.</p>
          <button onClick={() => router.back()} className="text-[#870BD6] text-sm underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout custom={true}>
      <div className="border-l border-[#D2D9DF] min-h-screen bg-[#F8F9FC]">

        {/* ── Banner ──────────────────────────────────────────────────────── */}
        <div
          className="bg-[#870BD6] h-48 relative"
          style={{ backgroundImage: "url('/dashboard-header.png')" }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 cursor-pointer px-4 md:px-12 pt-16 relative z-20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_1px,_transparent_1px)] [background-size:20px_20px]" />
        </div>

        {/* ── Profile header ───────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border-b border-[#E3E8EF]">
          <div className="flex items-center gap-5">
            {/* Cover image / initial */}
            {community.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={community.coverImage}
                alt={community.name}
                className="w-[120px] h-[120px] rounded-full border-4 border-white object-cover -mt-16 relative z-20 shadow-lg"
              />
            ) : (
              <div className="w-[120px] h-[120px] rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] text-4xl font-bold border-4 border-white -mt-16 relative z-20 shadow-lg shrink-0">
                {initial}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-bold text-[#180426]">{community.name}</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  isPrivate
                    ? "bg-[#F8F9FC] text-[#363F72] border border-[#D5D9EB]"
                    : "bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]"
                }`}>
                  {isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                  {community.privacy === "PUBLIC" ? "Public" : community.privacy === "PRIVATE" ? "Private" : "Invite Only"}
                </span>
              </div>
              {community.description && (
                <p className="text-[#60666B] text-sm mt-1 max-w-md">{community.description}</p>
              )}
            </div>
          </div>

          <Button
            customClass="!w-fit px-5 !h-[40px] !text-white shrink-0"
            type="button"
            onClick={() => setActiveTab("settings")}
          >
            <span className="flex items-center gap-2"><Settings size={15} /> Settings</span>
          </Button>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 bg-white border-b border-[#D2D9DF]">
          <div className="flex gap-8">
            {(["overview", "members", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 pt-4 font-medium capitalize transition-colors text-sm ${
                  activeTab === tab
                    ? "border-b-2 border-[#870BD6] text-[#870BD6] font-semibold"
                    : "text-[#60666B] hover:text-[#180426]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 py-8">

          {/* ── Overview ────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-4xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  icon={<Users size={22} className="text-[#870BD6]" />}
                  value={memberCount.toLocaleString()}
                  label="Total Members"
                  color="bg-[#F5EBFF]"
                />
                <StatCard
                  icon={<MessageSquareText size={22} className="text-[#175CD3]" />}
                  value={messageCount.toLocaleString()}
                  label="Total Messages"
                  color="bg-[#EFF8FF]"
                />
                <StatCard
                  icon={isPrivate ? <Lock size={22} className="text-[#B54708]" /> : <Globe size={22} className="text-[#067647]" />}
                  value={community.privacy === "PUBLIC" ? "Public" : community.privacy === "PRIVATE" ? "Private" : "Invite Only"}
                  label="Visibility"
                  color={isPrivate ? "bg-[#FFFAEB]" : "bg-[#ECFDF3]"}
                />
              </div>

              <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold text-[#180426]">About this community</h3>
                <p className="text-[#60666B] text-sm leading-relaxed">
                  {community.description ?? "No description provided."}
                </p>
                {community.createdAt && (
                  <p className="text-xs text-[#60666B]">
                    Created on {new Date(community.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Members ─────────────────────────────────────────────────── */}
          {activeTab === "members" && (
            <div className="max-w-4xl">
              <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F0F2F4] flex items-center justify-between">
                  <h3 className="font-semibold text-[#180426]">
                    Members <span className="text-[#60666B] font-normal text-sm">({members.length})</span>
                  </h3>
                </div>

                {members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                      <Users size={22} className="text-[#870BD6]" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">No members yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#F0F2F4]">
                    {members.map((member) => {
                      const fullName = `${member.user.firstName} ${member.user.lastName}`.trim();
                      const isBanned = member.status === "BANNED";
                      const isOwner  = member.role === "OWNER";
                      const isInFlight = memberAction === member.user.id;

                      return (
                        <div key={member.id} className={`flex items-center justify-between px-6 py-4 ${isBanned ? "opacity-60 bg-[#FEF3F2]" : "hover:bg-[#FAFAFA]"} transition-colors`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm overflow-hidden shrink-0">
                              {member.user.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={member.user.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                              ) : (
                                fullName.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#180426]">{fullName}</p>
                              <p className="text-xs text-[#60666B]">
                                Joined {new Date(member.joinedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Role badge */}
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${roleColor[member.role]}`}>
                              {roleIcon[member.role]} {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                            </span>

                            {isBanned && (
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]">
                                Banned
                              </span>
                            )}

                            {/* Actions (not available for owner) */}
                            {!isOwner && (
                              <div className="relative" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === member.user.id ? null : member.user.id)}
                                  disabled={isInFlight}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-[#60666B] disabled:opacity-50 transition-colors"
                                >
                                  {isInFlight ? (
                                    <span className="inline-block w-4 h-4 rounded-full border-t-2 border-[#870BD6] animate-spin" />
                                  ) : (
                                    <MoreVertical size={16} />
                                  )}
                                </button>

                                {openDropdown === member.user.id && (
                                  <div className="absolute right-0 mt-1 w-48 bg-white border border-[#E3E8EF] rounded-xl shadow-lg z-20 overflow-hidden">
                                    <p className="px-4 py-2 text-[10px] font-semibold text-[#60666B] uppercase tracking-wider border-b border-[#F0F2F4]">
                                      Change Role
                                    </p>
                                    {ROLES.filter((r) => r !== "OWNER" && r !== member.role).map((role) => (
                                      <button
                                        key={role}
                                        onClick={() => handleRoleChange(member.user.id, role)}
                                        className="w-full text-left px-4 py-2.5 text-sm text-[#180426] hover:bg-[#FBF6FF] flex items-center gap-2"
                                      >
                                        {roleIcon[role]}
                                        <span>Make {role.charAt(0) + role.slice(1).toLowerCase()}</span>
                                      </button>
                                    ))}
                                    <div className="border-t border-[#F0F2F4]">
                                      <button
                                        onClick={() => handleBan(member.user.id, isBanned)}
                                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-[#FEF3F2] text-[#B42318]"
                                      >
                                        <UserX size={14} />
                                        {isBanned ? "Unban Member" : "Ban Member"}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Settings ────────────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6 space-y-5">
                <h3 className="font-semibold text-[#180426]">Community Settings</h3>

                {saveMsg && (
                  <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                    saveMsg.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {saveMsg.text}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#180426] mb-2">Community Name</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#180426] mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={settingsForm.description}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    placeholder="Describe your community..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#180426] mb-2">Visibility</label>
                  <select
                    value={settingsForm.privacy}
                    onChange={(e) => setSettingsForm({ ...settingsForm, privacy: e.target.value })}
                    className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                  >
                    <option value="PUBLIC">Public — Anyone can find and join</option>
                    <option value="PRIVATE">Private — Invite only</option>
                    <option value="INVITE_ONLY">Invite Only — Hidden from search</option>
                  </select>
                </div>

                <Button
                  customClass="!w-fit px-6 !h-[44px] !text-white"
                  type="button"
                  loading={saving}
                  onClick={handleSaveSettings}
                  disabled={!settingsForm.name.trim()}
                >
                  <span className="flex items-center gap-2"><Save size={15} /> Save Changes</span>
                </Button>
              </div>

              {/* Danger zone */}
              <div className="bg-white border border-[#FECDCA] rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold text-[#B42318]">Danger Zone</h3>
                <p className="text-sm text-[#60666B]">
                  Deleting this community is permanent and cannot be undone. All messages and member records will be removed.
                </p>
                <button
                  onClick={handleDeleteCommunity}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#FECDCA] text-[#B42318] rounded-lg text-sm font-semibold hover:bg-[#FEF3F2] transition-colors"
                >
                  <Trash2 size={15} /> Delete Community
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PreacherCommunityDetail;
