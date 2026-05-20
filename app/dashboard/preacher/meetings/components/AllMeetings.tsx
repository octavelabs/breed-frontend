"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SearchIcon, SlidersHorizontal, Calendar, Users } from "lucide-react";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import MeetingIcon from "@/app/assets/icons/meetingIcon";
import PreacherCommunityIcon from "@/app/assets/icons/preacherCommunityIcon";
import { ScheduleList } from "./ScheduleList";
import { meetingsService } from "@/lib/api-services";

interface Meeting {
  id: string;
  title: string;
  type: 'COMMUNITY' | 'OPEN';
  status: string;
  scheduledAt: string;
  duration: number;
  _count?: { attendances: number };
  community?: { name: string } | null;
}

const AllMeetingsList = ({
  setOpenModal,
}: {
  setOpenModal: Dispatch<SetStateAction<{ community: boolean; open: boolean }>>;
}) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    meetingsService.getAll({ limit: 20 })
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        setMeetings(Array.isArray(data) ? data : []);
      })
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    (m.community?.name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Meeting type cards */}
      <div className="mb-5 mx-4 lg:mx-10 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#FBF6FF] border border-[#E7C8FF] rounded-[16px]">
          <div className="flex items-center justify-between gap-6 p-6">
            <div className="flex items-start gap-4">
              <div className="w-[48px] h-[48px] rounded-xl bg-[#E7C8FF] flex items-center justify-center flex-shrink-0">
                <PreacherCommunityIcon color="#870BD6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Community meeting</h3>
                <p className="text-[13px] text-[#60666B] mt-1">Recurring meetings for all members of a community you've created or are a leader in.</p>
              </div>
            </div>
            <Button customClass="!w-fit px-5 !h-[40px] !text-white !bg-[#870BD6]" buttonType="custom" onClick={() => setOpenModal(prev => ({ ...prev, community: true }))}>
              Schedule
            </Button>
          </div>
        </div>
        <div className="bg-[#FBEAF3] border border-[#F3C4DD] rounded-[16px]">
          <div className="flex items-center justify-between gap-6 p-6">
            <div className="flex items-start gap-4">
              <div className="w-[48px] h-[48px] rounded-xl bg-[#F3C4DD] flex items-center justify-center flex-shrink-0">
                <MeetingIcon color="#C83785" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Open meeting</h3>
                <p className="text-[13px] text-[#60666B] mt-1">Create a one-time or recurring meeting and invite anyone to join.</p>
              </div>
            </div>
            <Button customClass="!w-fit px-5 !h-[40px] !text-white !bg-[#C83785]" buttonType="custom" onClick={() => setOpenModal(prev => ({ ...prev, open: true }))}>
              Schedule
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 mx-4 lg:mx-10">
        {/* Meetings table */}
        <div className="bg-white border border-[#E3E8EF] rounded-[16px] w-full lg:w-[66%]">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-[21px] mx-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent meetings</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  type="text"
                  id="search"
                  name="search"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                  placeholder="Search by name or community"
                  variant="outlined"
                  icon={<SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />}
                  className="!bg-white !border-[#B9C2CA] !h-[36px] rounded-full"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                <SlidersHorizontal className="w-4 h-4" />
                <p className="hidden lg:block">Filter</p>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 px-6 pb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                <MeetingIcon color="#870BD6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No meetings yet</p>
              <p className="text-xs text-[#60666B]">Schedule your first meeting using the buttons above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] border-y border-[#E3E8EF]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#60666B]">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Attendees</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[#60666B]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F2F4]">
                  {filtered.map((m) => (
                    <tr key={m.id} className="hover:bg-[#FAFAFA] cursor-pointer" onClick={() => window.location.href = `/dashboard/preacher/meetings/${m.id}`}>
                      <td className="px-6 py-3 font-medium text-[#180426] truncate max-w-[200px] hover:text-[#870BD6] transition-colors">{m.title}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          m.type === 'COMMUNITY'
                            ? 'bg-[#FBF6FF] text-[#870BD6]'
                            : 'bg-[#FBEAF3] text-[#C83785]'
                        }`}>
                          {m.type === 'COMMUNITY' ? 'Community' : 'Open'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#60666B] whitespace-nowrap">
                        {new Date(m.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-[#60666B]">
                        <span className="flex items-center gap-1">
                          <Users size={13} /> {m._count?.attendances ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                          m.status === 'SCHEDULED' ? 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]'
                          : m.status === 'COMPLETED' ? 'bg-[#ECFDF3] text-[#067647] border border-[#ABEFC6]'
                          : m.status === 'CANCELLED' ? 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]'
                          : 'bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]'
                        }`}>
                          {m.status.toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Schedule sidebar */}
        <div className="w-full lg:w-[34%]">
          <ScheduleList onSchedule={() => setOpenModal((prev) => ({ ...prev, community: true }))} />
        </div>
      </div>
    </>
  );
};

export const Pagination = () => (
  <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200">
    <button className="px-[14px] py-2 text-sm font-medium text-[#3C3E40] border border-[#CDD5DF] rounded-full">
      ← <span className="hidden lg:inline">Previous</span>
    </button>
    {[1, 2, 3, "...", 8, 9, 10].map((page, index) => (
      <button
        key={index}
        className={`flex justify-center items-center w-10 h-10 text-sm font-medium rounded-[8px] text-[#4E5255] ${page === 1 ? "bg-[#E2E3E5]" : "bg-white"}`}
      >
        {page}
      </button>
    ))}
    <button className="px-[14px] py-2 text-sm font-medium text-[#3C3E40] border border-[#CDD5DF] rounded-full">
      <span className="hidden lg:inline">Next</span> →
    </button>
  </div>
);

export default AllMeetingsList;
