"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MeetingIcon from "@/app/assets/icons/meetingIcon";
import { ScheduleList } from "./ScheduleList";
import Button from "@/app/components/Button";
import { SearchIcon, SlidersHorizontal, Users, RefreshCw } from "lucide-react";
import Input from "@/app/components/Input";
import { Pagination } from "./AllMeetings";
import { meetingsService } from "@/lib/api-services";
import Link from "next/link";

interface Meeting {
  id: string;
  title: string;
  type: "COMMUNITY" | "OPEN";
  status: string;
  scheduledAt: string;
  duration: number;
  _count?: { attendances: number };
}

const STATUS_CLASSES: Record<string, string> = {
  SCHEDULED:   "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]",
  COMPLETED:   "bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]",
  CANCELLED:   "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]",
  IN_PROGRESS: "bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]",
};

export const OpenMeeting = ({
  setOpenModal,
}: {
  setOpenModal: Dispatch<SetStateAction<{ community: boolean; open: boolean }>>;
}) => {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const load = useCallback(() => {
    setLoading(true);
    meetingsService.getAll({ type: "OPEN", limit: 50 })
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        setMeetings(Array.isArray(data) ? data : []);
      })
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col lg:flex-row gap-5 mx-4 lg:mx-10">
      <div className="w-full lg:w-[66%] flex flex-col gap-5">
        {/* Header card */}
        <div className="bg-[#FBEAF3] border border-[#F3C4DD] rounded-[16px]">
          <div className="flex items-center justify-between gap-6 p-6">
            <div className="flex items-start gap-4">
              <div className="w-[48px] h-[48px] rounded-xl bg-[#F3C4DD] flex items-center justify-center flex-shrink-0">
                <MeetingIcon color="#C83785" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Open meeting</h3>
                <p className="text-[13px] text-[#60666B] mt-1">
                  Create a one-time or recurring meeting and invite anyone to join.
                </p>
              </div>
            </div>
            <Button
              customClass="!text-[#C83785] !h-[40px] px-5 !bg-transparent border !border-[#C83785]"
              buttonType="bordered"
              onClick={() => setOpenModal((prev) => ({ ...prev, open: true }))}
            >
              Schedule
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#E3E8EF] rounded-[16px] w-full">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-5 mx-6">
            <h2 className="text-base font-semibold text-gray-900">
              Open meetings
              <span className="ml-2 text-[#60666B] font-normal text-sm">({filtered.length})</span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text" id="om-search" name="om-search"
                  onChange={(e) => setSearch(e.target.value)} value={search}
                  placeholder="Search meetings…" variant="outlined"
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
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-[#FBEAF3] flex items-center justify-center">
                <MeetingIcon color="#C83785" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No open meetings yet</p>
              <p className="text-xs text-[#60666B]">Schedule your first open meeting using the button above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] border-y border-[#E3E8EF]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#60666B]">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Attendees</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2F4]">
                  {filtered.map((m) => (
                    <tr key={m.id}
                      onClick={() => router.push(`/dashboard/preacher/meetings/${m.id}`)}
                      className="hover:bg-[#FAFAFA] cursor-pointer transition-colors">
                      <td className="px-6 py-3">
                        <Link href={`/dashboard/preacher/meetings/${m.id}`} className="font-medium text-[#180426] hover:text-[#C83785] block truncate max-w-[200px]">
                          {m.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[#60666B] whitespace-nowrap text-xs">
                        {new Date(m.scheduledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        <span className="block text-[10px]">
                          {new Date(m.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#60666B] text-xs">{m.duration ?? 60} min</td>
                      <td className="px-4 py-3 text-[#60666B]">
                        <span className="flex items-center gap-1"><Users size={13} /> {m._count?.attendances ?? 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_CLASSES[m.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {m.status.toLowerCase().replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filtered.length > 0 && <Pagination />}
        </div>
      </div>

      <div className="w-full lg:w-[34%]">
        <ScheduleList onSchedule={() => setOpenModal((prev) => ({ ...prev, open: true }))} />
      </div>
    </div>
  );
};
