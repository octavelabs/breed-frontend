import { useEffect, useState } from "react";
import { Check, Copy, Search, Loader2 } from "lucide-react";
import Button from "@/app/components/Button";
import { meetingsService } from "@/lib/api-services";
import { useAuth } from "@/context/AuthContext";

interface FollowUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
}

export const OpenStepThree = ({
  meetingId,
  handleDone,
}: {
  meetingId: string;
  handleDone: () => void;
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [inviting, setInviting] = useState<Record<string, boolean>>({});
  const [invited, setInvited] = useState<Record<string, boolean>>({});

  const joinLink = typeof window !== 'undefined'
    ? `${window.location.origin}/join/${meetingId}`
    : `/join/${meetingId}`;

  useEffect(() => {
    if (!user?.id) return;
    meetingsService.getFollowing(user.id, { limit: 100 })
      .then((res: any) => setFollowing(res?.data ?? []))
      .catch(() => setFollowing([]))
      .finally(() => setLoadingFollowing(false));
  }, [user?.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinLink).catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSendInvite = async (person: FollowUser) => {
    setInviting((prev) => ({ ...prev, [person.id]: true }));
    try {
      await meetingsService.addAttendee(meetingId, person.id);
      setInvited((prev) => ({ ...prev, [person.id]: true }));
    } catch {
      // silently fail — the invite link still works as a fallback
    } finally {
      setInviting((prev) => ({ ...prev, [person.id]: false }));
    }
  };

  const filtered = following.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.username}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Shareable link */}
      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 truncate select-all">
          {joinLink}
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className="flex items-center gap-1 px-4 py-2 bg-[#E2E3E5] border border-[#B9C2CA] rounded-lg text-xs font-medium text-[#60666B] hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          {linkCopied ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="border-t border-dashed border-gray-200" />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search people you follow"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* People list */}
      <div className="space-y-4 max-h-52 overflow-y-auto pr-1">
        {loadingFollowing ? (
          <div className="flex items-center justify-center py-6 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">
            {following.length === 0 ? "You're not following anyone yet." : "No results."}
          </p>
        ) : (
          filtered.map((person) => (
            <div key={person.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#EDD9FF] flex items-center justify-center text-[#870BD6] font-semibold text-sm overflow-hidden flex-shrink-0">
                  {person.avatarUrl ? (
                    <img src={person.avatarUrl} alt={person.firstName} className="w-full h-full object-cover" />
                  ) : (
                    `${person.firstName[0]}${person.lastName[0]}`
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{person.firstName} {person.lastName}</p>
                  <p className="text-xs text-gray-400">@{person.username}</p>
                </div>
              </div>

              {invited[person.id] ? (
                <Button buttonType="bordered" customClass="!px-4 !py-1 text-[#5B26B1]">
                  <Check className="w-4 h-4 text-[#A967F1]" strokeWidth={2} />
                  Sent
                </Button>
              ) : (
                <Button
                  buttonType="custom"
                  onClick={() => handleSendInvite(person)}
                  disabled={inviting[person.id]}
                  customClass="!bg-[#C83785] !text-white !py-1 px-4 !font-medium"
                >
                  {inviting[person.id] ? <Loader2 size={13} className="animate-spin" /> : 'Invite'}
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      <Button
        onClick={handleDone}
        buttonType="primary"
        customClass="!w-full !text-white"
      >
        Done
      </Button>
    </div>
  );
};
