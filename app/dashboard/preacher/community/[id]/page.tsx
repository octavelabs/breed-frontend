"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { communityService, userService } from "@/lib/api-services";
import {
  ArrowLeft,
  Users,
  Globe,
  Lock,
  Shield,
  UserX,
  MoreVertical,
  Settings,
  Save,
  Trash2,
  UserCheck,
  Crown,
  Copy,
  Check,
  UserPlus,
  Search,
  AlertTriangle,
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
  memberCount?: number;
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

interface LookupUser {
  id: string;
  firstName: string;
  lastName: string;
  username?: string;
  avatarUrl?: string | null;
}

// ── Brand palette (matches preacher dashboard) ────────────────────────────────

type Palette = { bg: string; border: string; icon: string; accent: string };
const PURPLE: Palette = {
  bg: "#FBF6FF",
  border: "#E7C8FF",
  icon: "#E7C8FF",
  accent: "#870BD6",
};
const GREEN: Palette = {
  bg: "#ECFDF3",
  border: "#ABEFC6",
  icon: "#ABEFC6",
  accent: "#067647",
};
const AMBER: Palette = {
  bg: "#FFFAEB",
  border: "#FEDF89",
  icon: "#FEDF89",
  accent: "#B54708",
};
const BLUE: Palette = {
  bg: "#EFF8FF",
  border: "#B2DDFF",
  icon: "#B2DDFF",
  accent: "#175CD3",
};

// ── Role helpers ──────────────────────────────────────────────────────────────

const ROLES = ["OWNER", "ADMIN", "MODERATOR", "MEMBER"] as const;

const roleColor: Record<string, string> = {
  OWNER: "bg-[#FBF6FF] text-[#870BD6] border border-[#E7C8FF]",
  ADMIN: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  MODERATOR: "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  MEMBER: "bg-[#F8F9FC] text-[#363F72] border border-[#D5D9EB]",
};

const roleIcon: Record<string, React.ReactNode> = {
  OWNER: <Crown size={11} />,
  ADMIN: <Shield size={11} />,
  MODERATOR: <UserCheck size={11} />,
  MEMBER: <Users size={11} />,
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  sub,
  Icon,
  palette,
}: {
  label: string;
  value: number | string;
  sub?: string;
  Icon: React.ElementType;
  palette: Palette;
}) => (
  <div
    className="rounded-[16px] border p-6"
    style={{ backgroundColor: palette.bg, borderColor: palette.border }}
  >
    <div className="flex items-start gap-4">
      <div
        className="w-[48px] h-[48px] rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: palette.icon }}
      >
        <Icon size={22} color={palette.accent} />
      </div>
      <div>
        <p className="text-[13px] text-[#60666B]">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{value}</h3>
        {sub && <p className="text-[13px] text-[#60666B] mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

// ── Member Growth Chart ───────────────────────────────────────────────────────

type GrowthPoint = { label: string; count: number };

function buildRealGrowthData(
  members: Member[],
  createdAt?: string,
  pts = 8,
): GrowthPoint[] {
  const active = members.filter(
    (m) => m.status !== "BANNED" && m.status !== "LEFT",
  );
  const now = Date.now();

  // Start from community creation or oldest join date, whichever is earlier
  const joinTimes = active.map((m) => new Date(m.joinedAt).getTime());
  const created = createdAt
    ? new Date(createdAt).getTime()
    : joinTimes.length
      ? Math.min(...joinTimes)
      : now;
  const start = Math.min(
    created,
    joinTimes.length ? Math.min(...joinTimes) : created,
  );

  // Guarantee at least `pts` days of range so the chart isn't a single point
  const minRange = pts * 24 * 60 * 60 * 1000;
  const effectiveStart = Math.min(start, now - minRange);
  const interval = (now - effectiveStart) / pts;

  return Array.from({ length: pts }, (_, i) => {
    const cutoff = effectiveStart + (i + 1) * interval;
    const count = active.filter(
      (m) => new Date(m.joinedAt).getTime() <= cutoff,
    ).length;
    const mid = new Date(effectiveStart + (i + 0.5) * interval);
    const label = mid.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    return { label, count };
  });
}

const MemberGrowthChart = ({
  members,
  createdAt,
}: {
  members: Member[];
  createdAt?: string;
}) => {
  const data = buildRealGrowthData(members, createdAt);
  const totalMembers = data[data.length - 1]?.count ?? 0;

  const W = 300;
  const H = 190;
  const pad = { t: 14, b: 28, l: 28, r: 10 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const maxV = Math.max(...data.map((d) => d.count), 1);

  const pts = data.map((d, i) => ({
    x: pad.l + (i / (data.length - 1)) * cW,
    y: pad.t + cH - (d.count / maxV) * cH,
  }));

  const linePath = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cx = ((prev.x + p.x) / 2).toFixed(1);
    return `${acc} Q ${cx} ${prev.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }, "");

  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(pad.t + cH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(pad.t + cH).toFixed(1)} Z`;

  const yLabels = [0, Math.round(maxV / 2), maxV];

  return (
    <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#180426]">Member Growth</h3>
        <span className="text-xs text-[#870BD6] bg-[#FBF6FF] border border-[#E7C8FF] px-2.5 py-0.5 rounded-full">
          Since creation
        </span>
      </div>

      <div className="flex-1 min-h-[180px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
          <defs>
            <linearGradient id="mgFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#870BD6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#870BD6" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {/* Horizontal grid lines */}
          {[0, 0.5, 1].map((t, i) => (
            <line
              key={i}
              x1={pad.l}
              y1={pad.t + (1 - t) * cH}
              x2={W - pad.r}
              y2={pad.t + (1 - t) * cH}
              stroke="#F0F2F4"
              strokeWidth="1"
            />
          ))}
          {/* Area fill */}
          <path d={areaPath} fill="url(#mgFill)" />
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#870BD6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Dots on each data point */}
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === pts.length - 1 ? 4 : 2.5}
              fill="#870BD6"
              fillOpacity={i === pts.length - 1 ? 1 : 0.5}
            />
          ))}
          {/* Pulse ring on last point */}
          <circle
            cx={pts[pts.length - 1].x}
            cy={pts[pts.length - 1].y}
            r="8"
            fill="#870BD6"
            fillOpacity="0.12"
          />
          {/* Y-axis labels */}
          {yLabels.map((v, i) => (
            <text
              key={i}
              x={pad.l - 4}
              y={pad.t + cH - (v / maxV) * cH + 3.5}
              textAnchor="end"
              fontSize="8"
              fill="#60666B"
            >
              {v}
            </text>
          ))}
          {/* X-axis date labels (every other) */}
          {pts.map((p, i) =>
            i % 2 === 0 ? (
              <text
                key={i}
                x={p.x}
                y={H - 8}
                textAnchor="middle"
                fontSize="7"
                fill="#9CA3AF"
              >
                {data[i].label}
              </text>
            ) : null,
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0F2F4]">
        <p className="text-xs text-[#60666B]">Total members</p>
        <p className="text-xl font-bold text-[#870BD6]">
          {totalMembers.toLocaleString()}
        </p>
      </div>
    </div>
  );
};

// ── Invite Modal ──────────────────────────────────────────────────────────────

const InviteModal = ({
  communityId,
  communityName,
  onClose,
}: {
  communityId: string;
  communityName: string;
  onClose: () => void;
}) => {
  const [tab, setTab] = useState<"link" | "username">("link");
  const [copied, setCopied] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<LookupUser | null | "notfound">(
    null,
  );
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);
  const [inviteErr, setInviteErr] = useState("");

  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/community/${communityId}`
      : `/dashboard/community/${communityId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select input
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setFoundUser(null);
    setInvited(false);
    setInviteErr("");
    try {
      const res = (await userService.lookup(query.trim())) as LookupUser | null;
      setFoundUser(res ?? "notfound");
    } catch {
      setFoundUser("notfound");
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async () => {
    if (!foundUser || foundUser === "notfound") return;
    setInviting(true);
    setInviteErr("");
    try {
      await communityService.invite(communityId, { recipientId: foundUser.id });
      setInvited(true);
    } catch (err: unknown) {
      setInviteErr(
        err instanceof Error ? err.message : "Failed to send invite.",
      );
    } finally {
      setInviting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#E3E8EF]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FBF6FF] flex items-center justify-center">
                <UserPlus size={18} className="text-[#870BD6]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#180426]">
                  Add Members
                </h2>
                <p className="text-xs text-[#60666B]">{communityName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-[#F8F9FC] rounded-xl p-1">
            {(["link", "username"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  tab === t
                    ? "bg-white text-[#180426] shadow-sm"
                    : "text-[#60666B] hover:text-[#180426]"
                }`}
              >
                {t === "link" ? "Invite Link" : "By Username"}
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-5">
          {tab === "link" && (
            <div className="space-y-4">
              <p className="text-sm text-[#60666B]">
                Share this link with anyone you&apos;d like to invite. They can
                open it and join the community directly.
              </p>
              <div className="flex items-center gap-2 bg-[#F8F9FC] border border-[#E3E8EF] rounded-xl px-4 py-3">
                <p className="text-sm text-[#180426] flex-1 truncate">
                  {inviteLink}
                </p>
                <button
                  onClick={handleCopy}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    copied
                      ? "bg-[#ECFDF3] text-[#067647]"
                      : "bg-[#870BD6] text-white hover:bg-[#6B09B0]"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={12} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {tab === "username" && (
            <div className="space-y-4">
              <p className="text-sm text-[#60666B]">
                Enter the exact Breed username or email address of the person
                you want to invite.
              </p>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Username or email..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setFoundUser(null);
                      setInvited(false);
                      setInviteErr("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="w-full pl-9 pr-4 py-2.5 border border-[#E3E8EF] rounded-xl text-sm focus:outline-none focus:border-[#870BD6] focus:ring-2 focus:ring-[#870BD6]/10"
                  />
                </div>
                <Button
                  customClass="!w-fit px-4 !h-[42px] !text-white shrink-0"
                  type="button"
                  loading={searching}
                  onClick={handleSearch}
                  disabled={!query.trim()}
                >
                  Find
                </Button>
              </div>

              {/* Result */}
              {foundUser === "notfound" && (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#FEF3F2] border border-[#FECDCA] rounded-xl">
                  <p className="text-sm text-[#B42318]">
                    No user found with that username or email.
                  </p>
                </div>
              )}

              {foundUser && foundUser !== "notfound" && !invited && (
                <div className="flex items-center justify-between px-4 py-3 bg-[#F8F9FC] border border-[#E3E8EF] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm overflow-hidden shrink-0">
                      {foundUser.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={foundUser.avatarUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        `${foundUser.firstName.charAt(0)}${foundUser.lastName.charAt(0)}`
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#180426]">
                        {foundUser.firstName} {foundUser.lastName}
                      </p>
                      {foundUser.username && (
                        <p className="text-xs text-[#60666B]">
                          @{foundUser.username}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    customClass="!w-fit px-3 !h-[34px] !text-white !text-xs"
                    type="button"
                    loading={inviting}
                    onClick={handleInvite}
                  >
                    Send Invite
                  </Button>
                </div>
              )}

              {invited && (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#ECFDF3] border border-[#ABEFC6] rounded-xl">
                  <Check size={14} className="text-[#067647]" />
                  <p className="text-sm text-[#067647] font-medium">
                    Invite sent successfully!
                  </p>
                </div>
              )}

              {inviteErr && (
                <div className="flex items-center gap-2 px-4 py-3 bg-[#FEF3F2] border border-[#FECDCA] rounded-xl">
                  <p className="text-sm text-[#B42318]">{inviteErr}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

const DeleteConfirmModal = ({
  communityName,
  deleting,
  onClose,
  onConfirm,
}: {
  communityName: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    onClick={onClose}
  >
    <div
      className="relative w-full max-w-sm bg-white rounded-[20px] shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            {/* Red warning icon */}
            <div className="relative w-[46px] h-[46px]">
              <svg
                width="46"
                height="46"
                viewBox="0 0 46 46"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="3"
                  y="3"
                  width="40"
                  height="40"
                  rx="20"
                  fill="#FBAFAF"
                />
                <rect
                  x="3"
                  y="3"
                  width="40"
                  height="40"
                  rx="20"
                  stroke="#FED3D3"
                  strokeWidth="6"
                />
                <path
                  d="M23 17v7M23 28v1"
                  stroke="#DB2929"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold leading-none mt-4">
              Delete Community
            </h2>
            <p className="text-base text-[#60666B] leading-none mt-2">
              This action cannot be undone
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <p className="text-base text-[#292A2B] pb-4 border-b border-dashed border-[#B9C2CA]">
          <span className="font-semibold">&ldquo;{communityName}&rdquo;</span>{" "}
          will be permanently deleted. All messages, member records, and
          community data will be lost forever.
        </p>

        <p className="text-sm text-[#60666B] mt-4 mb-6">
          Are you sure you want to continue? This cannot be reversed.
        </p>

        <div className="flex gap-3 w-full">
          <Button
            buttonType="bordered"
            customClass="!w-1/2 !h-[48px] !border-[#60666B] !text-[#60666B]"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            buttonType="custom"
            customClass="!w-1/2 !h-[48px] text-white !bg-[#E44E4E]"
            loading={deleting}
            onClick={onConfirm}
          >
            Yes, Delete
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const PreacherCommunityDetail = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "settings"
  >("overview");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    name: "",
    description: "",
    privacy: "PUBLIC" as string,
  });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [memberAction, setMemberAction] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");

  const loadCommunity = useCallback(async () => {
    setLoading(true);
    try {
      const [comm, mem] = await Promise.all([
        communityService.getById(id) as Promise<Community>,
        communityService.getMembers(id, { limit: 100 }) as Promise<unknown>,
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

  useEffect(() => {
    loadCommunity();
  }, [loadCommunity]);

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
      setSaveMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save changes.",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };

  const handleDeleteCommunity = async () => {
    setDeleting(true);
    try {
      await communityService.deleteCommunity(id);
      setShowDeleteModal(false);
      router.push("/dashboard/preacher/community");
    } catch (err: unknown) {
      setShowDeleteModal(false);
      setSaveMsg({
        type: "error",
        text:
          err instanceof Error ? err.message : "Failed to delete community.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    setMemberAction(userId);
    setOpenDropdown(null);
    try {
      await communityService.updateMemberRole(id, userId, role);
      setMembers((prev) =>
        prev.map((m) =>
          m.user.id === userId ? { ...m, role: role as Member["role"] } : m,
        ),
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
      else await communityService.banMember(id, userId);
      setMembers((prev) =>
        prev.map((m) =>
          m.user.id === userId
            ? { ...m, status: isBanned ? "ACTIVE" : "BANNED" }
            : m,
        ),
      );
    } catch {
      // silent
    } finally {
      setMemberAction(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setMemberAction(userId);
    setOpenDropdown(null);
    try {
      await communityService.removeMember(id, userId);
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
    } catch {
      // silent
    } finally {
      setMemberAction(null);
    }
  };

  const initial = community?.name?.charAt(0)?.toUpperCase() ?? "C";
  const memberCount = community?.memberCount ?? community?._count?.members ?? 0;
  const isPrivate = community?.privacy !== "PUBLIC";

  const adminModCount = members.filter(
    (m) =>
      (m.role === "ADMIN" || m.role === "MODERATOR") && m.status === "ACTIVE",
  ).length;

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout custom={true}>
        <div className="animate-pulse">
          <div className="h-48 bg-[#870BD6]" />
          <div className="px-4 md:px-12 py-8 space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
              ))}
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
          <button
            onClick={() => router.back()}
            className="text-[#870BD6] text-sm underline"
          >
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout custom={true}>
      {showInviteModal && (
        <InviteModal
          communityId={id}
          communityName={community.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmModal
          communityName={community.name}
          deleting={deleting}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteCommunity}
        />
      )}

      <div className="border-l border-[#D2D9DF] min-h-screen bg-[#F8F9FC]">
        {/* ── Banner ────────────────────────────────────────────────────────── */}
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

        {/* ── Profile header ─────────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border-b border-[#E3E8EF]">
          <div className="flex items-center gap-5">
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
                <h2 className="text-2xl font-bold text-[#180426]">
                  {community.name}
                </h2>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    isPrivate
                      ? "bg-[#F8F9FC] text-[#363F72] border border-[#D5D9EB]"
                      : "bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]"
                  }`}
                >
                  {isPrivate ? <Lock size={10} /> : <Globe size={10} />}
                  {community.privacy === "PUBLIC"
                    ? "Public"
                    : community.privacy === "PRIVATE"
                      ? "Private"
                      : "Invite Only"}
                </span>
              </div>
              {community.description && (
                <p className="text-[#60666B] text-sm mt-1 max-w-md">
                  {community.description}
                </p>
              )}
            </div>
          </div>

          <Button
            customClass="!w-fit px-5 !h-[40px] !text-white shrink-0"
            type="button"
            onClick={() => setActiveTab("settings")}
          >
            <span className="flex items-center gap-2">
              <Settings size={15} /> Settings
            </span>
          </Button>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
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

        {/* ── Content ───────────────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 py-8">
          {/* ── Overview ──────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-5xl">
              {/* Stat cards row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  Icon={Users}
                  label="Total Members"
                  value={memberCount.toLocaleString()}
                  palette={PURPLE}
                />
                <StatCard
                  Icon={isPrivate ? Lock : Globe}
                  label="Visibility"
                  value={
                    community.privacy === "PUBLIC"
                      ? "Public"
                      : community.privacy === "PRIVATE"
                        ? "Private"
                        : "Invite Only"
                  }
                  sub={
                    isPrivate ? "Invite required to join" : "Open to everyone"
                  }
                  palette={isPrivate ? AMBER : GREEN}
                />
                <StatCard
                  Icon={Shield}
                  label="Admins & Mods"
                  value={adminModCount}
                  sub={adminModCount === 1 ? "moderator" : "moderators"}
                  palette={BLUE}
                />
              </div>

              {/* Two-column: About + Growth chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6 space-y-3">
                  <h3 className="font-semibold text-[#180426]">
                    About this community
                  </h3>
                  <p className="text-[#60666B] text-sm leading-relaxed">
                    {community.description ?? "No description provided."}
                  </p>
                  {community.createdAt && (
                    <p className="text-xs text-[#60666B] mt-2 pt-3 border-t border-[#F0F2F4]">
                      Created on{" "}
                      {new Date(community.createdAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  )}
                </div>

                <MemberGrowthChart
                  members={members}
                  createdAt={community.createdAt}
                />
              </div>
            </div>
          )}

          {/* ── Members ───────────────────────────────────────────────────── */}
          {activeTab === "members" &&
            (() => {
              const filteredMembers = members.filter((m) => {
                const name =
                  `${m.user.firstName} ${m.user.lastName}`.toLowerCase();
                const username = (m.user.username ?? "").toLowerCase();
                const q = memberSearch.toLowerCase();
                return !q || name.includes(q) || username.includes(q);
              });

              return (
                <div className="max-w-4xl">
                  <div className="bg-white border border-[#E3E8EF] rounded-2xl">
                    {/* Header row */}
                    <div className="px-6 py-4 border-b border-[#F0F2F4]">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                        <h3 className="font-semibold text-[#180426] shrink-0">
                          Members{" "}
                          <span className="text-[#60666B] font-normal text-sm">
                            ({members.length})
                          </span>
                        </h3>
                        <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                              type="text"
                              placeholder="Search members..."
                              value={memberSearch}
                              onChange={(e) => setMemberSearch(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8F9FC] border border-[#E3E8EF] rounded-lg outline-none focus:border-[#870BD6] focus:ring-1 focus:ring-[#870BD6]/20 transition-colors"
                            />
                          </div>
                          <Button
                            customClass="!w-fit px-4 !h-[36px] !text-white !text-xs shrink-0"
                            type="button"
                            onClick={() => setShowInviteModal(true)}
                          >
                            <span className="flex items-center gap-1.5">
                              <UserPlus size={13} /> Add
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {members.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                          <Users size={22} className="text-[#870BD6]" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          No members yet
                        </p>
                        <button
                          onClick={() => setShowInviteModal(true)}
                          className="text-sm text-[#870BD6] underline"
                        >
                          Invite the first member
                        </button>
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                        <Search size={22} className="text-gray-300" />
                        <p className="text-sm text-[#60666B]">
                          No members match &ldquo;{memberSearch}&rdquo;
                        </p>
                        <button
                          onClick={() => setMemberSearch("")}
                          className="text-xs text-[#870BD6] underline"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#F0F2F4]">
                        {filteredMembers.map((member) => {
                          const fullName =
                            `${member.user.firstName} ${member.user.lastName}`.trim();
                          const isBanned = member.status === "BANNED";
                          const isOwner = member.role === "OWNER";
                          const isInFlight = memberAction === member.user.id;

                          // Only show roles the member can be promoted/demoted to (not OWNER)
                          const promotionRoles = (
                            ["ADMIN", "MODERATOR", "MEMBER"] as const
                          ).filter((r) => r !== member.role);

                          return (
                            <div
                              key={member.id}
                              className={`flex items-center justify-between px-6 py-4 transition-colors ${
                                isBanned
                                  ? "opacity-60 bg-[#FEF3F2]"
                                  : "hover:bg-[#FAFAFA]"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm overflow-hidden shrink-0">
                                  {member.user.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={member.user.avatarUrl}
                                      alt={fullName}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    fullName.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-[#180426]">
                                    {fullName}
                                  </p>
                                  <p className="text-xs text-[#60666B]">
                                    Joined{" "}
                                    {new Date(
                                      member.joinedAt,
                                    ).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${roleColor[member.role]}`}
                                >
                                  {roleIcon[member.role]}{" "}
                                  {member.role.charAt(0) +
                                    member.role.slice(1).toLowerCase()}
                                </span>
                                {isBanned && (
                                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]">
                                    Banned
                                  </span>
                                )}

                                {!isOwner && (
                                  <div
                                    className="relative"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={() =>
                                        setOpenDropdown(
                                          openDropdown === member.user.id
                                            ? null
                                            : member.user.id,
                                        )
                                      }
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
                                      <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E3E8EF] rounded-xl shadow-lg z-50 overflow-hidden">
                                        {/* Role changes */}
                                        <p className="px-4 py-2 text-[10px] font-semibold text-[#60666B] uppercase tracking-wider border-b border-[#F0F2F4]">
                                          Change Role
                                        </p>
                                        {promotionRoles.map((role) => (
                                          <button
                                            key={role}
                                            onClick={() =>
                                              handleRoleChange(
                                                member.user.id,
                                                role,
                                              )
                                            }
                                            className="w-full text-left px-4 py-2.5 text-sm text-[#180426] hover:bg-[#FBF6FF] flex items-center gap-2"
                                          >
                                            {roleIcon[role]}
                                            <span>
                                              {role === "ADMIN"
                                                ? "Promote to Admin"
                                                : role === "MODERATOR"
                                                  ? "Promote to Moderator"
                                                  : "Demote to Member"}
                                            </span>
                                          </button>
                                        ))}

                                        {/* Remove */}
                                        <div className="border-t border-[#F0F2F4]">
                                          <button
                                            onClick={() =>
                                              handleRemoveMember(member.user.id)
                                            }
                                            className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-[#FEF3F2] text-[#B42318]"
                                          >
                                            <UserX size={14} />
                                            Remove from Community
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
              );
            })()}

          {/* ── Settings ──────────────────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6 space-y-5">
                <h3 className="font-semibold text-[#180426]">
                  Community Settings
                </h3>

                {saveMsg && (
                  <div
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                      saveMsg.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {saveMsg.text}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#180426] mb-2">
                    Community Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#180426] mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={settingsForm.description}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe your community..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#180426] mb-2">
                    Visibility
                  </label>
                  <select
                    value={settingsForm.privacy}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        privacy: e.target.value,
                      })
                    }
                    className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white"
                  >
                    <option value="PUBLIC">
                      Public — Anyone can find and join
                    </option>
                    <option value="PRIVATE">Private — Invite only</option>
                    <option value="INVITE_ONLY">
                      Invite Only — Hidden from search
                    </option>
                  </select>
                </div>

                <Button
                  customClass="!w-fit px-6 !h-[44px] !text-white"
                  type="button"
                  loading={saving}
                  onClick={handleSaveSettings}
                  disabled={!settingsForm.name.trim()}
                >
                  <span className="flex items-center gap-2">
                    <Save size={15} /> Save Changes
                  </span>
                </Button>
              </div>

              {/* Danger zone */}
              <div className="bg-white border border-[#FECDCA] rounded-2xl p-6 space-y-3">
                <h3 className="font-semibold text-[#B42318]">Danger Zone</h3>
                <p className="text-sm text-[#60666B]">
                  Deleting this community is permanent and cannot be undone. All
                  messages and member records will be removed.
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-[#FECDCA] text-[#B42318] rounded-full cursor-pointer text-sm font-semibold hover:bg-[#FEF3F2] transition-colors"
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
