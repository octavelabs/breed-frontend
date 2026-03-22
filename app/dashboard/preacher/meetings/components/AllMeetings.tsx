"use client";

import { Dispatch, SetStateAction } from "react";
import { SearchIcon, SlidersHorizontal} from "lucide-react";
import CustomTable from "@/app/components/Table";
import { recentMeetingsHeaders } from "@/utils/tableheaders";
import { mockRecentMeetings } from "@/utils/dummyData";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import MeetingIcon from "@/app/assets/icons/meetingIcon";
import PreacherCommunityIcon from "@/app/assets/icons/preacherCommunityIcon";
import { ScheduleList } from "./ScheduleList";

const AllMeetingsList = (
  {
    setOpenModal,
  }: {
    setOpenModal: Dispatch<SetStateAction<{ community: boolean; open: boolean }>>;
  }
) => {
  return (
    <>
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
        <div className="bg-[#FBEAF3] border border-[#F3C4DD] rounded-[16px] ">
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
      <div className="flex gap-5 mx-4 lg:mx-10">
      <div className="bg-white  border border-[#E3E8EF] rounded-[16px] w-[66%]">
        <div className="flex items-center justify-between my-[21px] mx-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent meetings</h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Input
                type="text"
                id="firstName"
                name="firstName"
                onChange={() => console.log("k")}
                value=""
                placeholder="Search by name or community"
                variant="outlined"
                icon={
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2  w-5 h-5 opacity-50" />
                }
                className="!bg-white !border-[#B9C2CA] !w-[300px] !h-[36px] rounded-full"
              />
            </div>
            {/* Filter */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <CustomTable
          
          columns={recentMeetingsHeaders()}
          data={mockRecentMeetings}
          tableStyles=""
        />

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200">
          <button className="px-[14px] py-2 text-sm font-medium text-[#3C3E40] border border-[#CDD5DF] rounded-full">
            ← Previous
          </button>
          {[1, 2, 3, "...", 8, 9, 10].map((page, index) => (
            <button
              key={index}
              className={`flex justify-center items-center w-10 h-10 text-sm font-medium rounded-[8px] text-[#4E5255] ${page === 1 ? "bg-[#E2E3E5]" : "bg-white"
                }`}
            >
              {page}
            </button>
          ))}
          <button className="px-[14px] py-2 text-sm font-medium text-[#3C3E40] border border-[#CDD5DF] rounded-full">
            Next →
          </button>
        </div>
      </div>
      <div className="w-[34%]">
      <ScheduleList />
      </div>
      </div>
    </>
  );
};

export default AllMeetingsList;
