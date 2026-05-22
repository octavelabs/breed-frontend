"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchIcon, SlidersHorizontal, RefreshCw, Users, Calendar, BookOpen, ClipboardList } from "lucide-react";
import Input from "@/app/components/Input";
import { mentorshipService } from "@/lib/api-services";

interface Disciple {
  id: string;
  status: string;
  startedAt: string | null;
  disciple: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    username?: string;
    bio?: string;
  };
  _count?: { sessions: number; tasks: number; assessments: number };
}

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE:   "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]",
  PAUSED:   "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  COMPLETED:"bg-[#F2F4F7] text-[#344054] border border-[#D0D5DD]",
};

function Avatar({ user }: { user: { firstName: string; lastName: string; avatarUrl?: string | null } }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt={user.firstName} className="w-9 h-9 rounded-full object-cover" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-[#E7C8FF] flex items-center justify-center text-[#870BD6] font-bold text-sm">
      {initials}
    </div>
  );
}

const DisciplesList: React.FC<{ refreshSignal?: number }> = ({ refreshSignal }) => {
  const [disciples, setDisciples] = useState<Disciple[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    mentorshipService.getDisciples({ status: "ACTIVE", limit: 50 })
      .then((res: any) => {
        const data = res?.data ?? res;
        setDisciples(Array.isArray(data) ? data : []);
        setTotal(res?.meta?.total ?? res?.total ?? (Array.isArray(data) ? data.length : 0));
      })
      .catch(() => setDisciples([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load, refreshSignal]);

  const filtered = disciples.filter((d) => {
    const name = `${d.disciple.firstName} ${d.disciple.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || (d.disciple.username ?? "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-[16px]">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-[21px] mx-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Mentees
          <span className="ml-2 text-[#60666B] font-normal text-sm">({total})</span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              type="text" id="d-search" name="d-search"
              onChange={(e) => setSearch(e.target.value)} value={search}
              placeholder="Search disciples…" variant="outlined"
              icon={<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />}
              className="!bg-white !border-[#B9C2CA] !h-[36px] rounded-full"
            />
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
        <div className="space-y-3 px-6 pb-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
          <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
            <Users size={22} className="text-[#870BD6]" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No mentees yet</p>
          <p className="text-xs text-[#60666B]">Accept mentorship requests to start mentoring believers.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-y border-[#E3E8EF]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#60666B]">Mentee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Since</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Sessions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Tasks</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F4]">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={d.disciple} />
                      <div>
                        <p className="font-medium text-[#180426]">{d.disciple.firstName} {d.disciple.lastName}</p>
                        {d.disciple.username && <p className="text-xs text-[#60666B]">@{d.disciple.username}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#60666B] text-xs">
                    {d.startedAt
                      ? new Date(d.startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#60666B]">
                    <span className="flex items-center gap-1"><Calendar size={13} /> {d._count?.sessions ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 text-[#60666B]">
                    <span className="flex items-center gap-1"><ClipboardList size={13} /> {d._count?.tasks ?? 0}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_CLASSES[d.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {d.status.toLowerCase()}
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

export default DisciplesList;
