"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchIcon, RefreshCw, FileText } from "lucide-react";
import Input from "@/app/components/Input";
import { mentorshipService } from "@/lib/api-services";

interface Report {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  mentorship: {
    disciple: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  };
}

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

const ReportList: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    mentorshipService.getMyReports({ limit: 50 })
      .then((res: any) => {
        const data = res?.data ?? res;
        setReports(Array.isArray(data) ? data : []);
        setTotal(res?.meta?.total ?? res?.total ?? (Array.isArray(data) ? data.length : 0));
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    const disciple = r.mentorship?.disciple;
    return (
      r.title.toLowerCase().includes(q) ||
      (disciple ? `${disciple.firstName} ${disciple.lastName}`.toLowerCase().includes(q) : false)
    );
  });

  return (
    <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-2xl">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-5 mx-6">
        <h2 className="text-base font-semibold text-gray-900">
          Reports
          <span className="ml-2 text-[#60666B] font-normal text-sm">({total})</span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input type="text" id="r-search" name="r-search"
              onChange={(e) => setSearch(e.target.value)} value={search}
              placeholder="Search by title or disciple…" variant="outlined"
              icon={<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />}
              className="!bg-white !border-[#B9C2CA] !h-[36px] rounded-full" />
          </div>
          <button onClick={load} title="Refresh" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw size={14} className="text-gray-500" />
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
            <FileText size={22} className="text-[#870BD6]" />
          </div>
          <p className="text-sm font-semibold text-gray-700">No reports yet</p>
          <p className="text-xs text-[#60666B]">Progress reports you generate for disciples will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] border-y border-[#E3E8EF]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-[#60666B]">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Disciple</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Period</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F4]">
              {filtered.map((r) => {
                const disciple = r.mentorship?.disciple;
                return (
                  <tr key={r.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-3 font-medium text-[#180426] text-sm max-w-50 truncate">{r.title}</td>
                    <td className="px-4 py-3">
                      {disciple ? (
                        <div className="flex items-center gap-2">
                          <Avatar user={disciple} />
                          <span className="text-sm text-[#180426]">{disciple.firstName} {disciple.lastName}</span>
                        </div>
                      ) : <span className="text-xs text-[#60666B]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#60666B] whitespace-nowrap">
                      {new Date(r.periodStart).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      {" — "}
                      {new Date(r.periodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#60666B] whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportList;
