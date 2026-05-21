"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchIcon, SlidersHorizontal, RefreshCw, Calendar } from "lucide-react";
import Input from "@/app/components/Input";
import { mentorshipService } from "@/lib/api-services";

interface Session {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  status: string;
  mentor: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  disciple: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

const STATUS_CLASSES: Record<string, string> = {
  SCHEDULED:   "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  COMPLETED:   "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]",
  CANCELLED:   "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
  IN_PROGRESS: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
  NO_SHOW:     "bg-[#F2F4F7] text-[#344054] border border-[#D0D5DD]",
};

function Avatar({ user }: { user: { firstName: string; lastName: string; avatarUrl?: string | null } }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt={user.firstName} className="w-7 h-7 rounded-full object-cover" />
  ) : (
    <div className="w-7 h-7 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-xs shrink-0">
      {initials}
    </div>
  );
}

const SessionsList: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    mentorshipService.getMySessions({ limit: 50 })
      .then((res: any) => {
        const data = res?.data ?? res;
        setSessions(Array.isArray(data) ? data : []);
        setTotal(res?.meta?.total ?? res?.total ?? (Array.isArray(data) ? data.length : 0));
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = sessions.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      `${s.disciple.firstName} ${s.disciple.lastName}`.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-2xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-5 mx-6">
        <h2 className="text-base font-semibold text-gray-900">
          Sessions
          <span className="ml-2 text-[#60666B] font-normal text-sm">({total})</span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input type="text" id="s-search" name="s-search"
              onChange={(e) => setSearch(e.target.value)} value={search}
              placeholder="Search by title or disciple…" variant="outlined"
              icon={<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />}
              className="!bg-white !border-[#B9C2CA] !h-[36px] rounded-full" />
          </div>
          <button onClick={load} title="Refresh" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw size={14} className="text-gray-500" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <SlidersHorizontal className="w-4 h-4" />
            <p className="hidden lg:block">Filter</p>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 px-6 pb-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
          <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
            <Calendar size={22} className="text-[#870BD6]" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No sessions yet</p>
          <p className="text-xs text-[#60666B]">Sessions will appear here once scheduled with your disciples.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-y border-[#E3E8EF]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#60666B]">Session</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Disciple</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F4]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-3 font-medium text-[#180426] text-sm">{s.title}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar user={s.disciple} />
                      <span className="text-sm text-[#180426]">{s.disciple.firstName} {s.disciple.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#60666B] whitespace-nowrap">
                    {new Date(s.scheduledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    <span className="block text-[10px]">
                      {new Date(s.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#60666B]">{s.duration ?? 60} min</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_CLASSES[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {s.status.toLowerCase().replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SessionsList;
