import PreacherCommunityIcon from "@/app/assets/icons/preacherCommunityIcon"
import { ScheduleList } from "./ScheduleList"
import Button from "@/app/components/Button"
import { Dispatch, SetStateAction } from "react";
import CustomTable from "@/app/components/Table";
import { communityMeetingsHeaders, openMeetingsHeaders } from "@/utils/tableheaders";
import { mockCommunityMeetings } from "@/utils/dummyData";
import MeetingIcon from "@/app/assets/icons/meetingIcon";
import { SearchIcon, SlidersHorizontal } from "lucide-react";
import Input from "@/app/components/Input";
import { Pagination } from "./AllMeetings";



export const OpenMeeting = (
     {
        setOpenModal,
      }: {
        setOpenModal: Dispatch<SetStateAction<{ community: boolean; open: boolean }>>;
      }
) => {
  return (
    <div className="flex gap-5 mx-4 lg:mx-10">
     <div className="w-full lg:w-[66%] flex flex-col gap-5">
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
            <Button customClass="!text-[#C83785] !h-[40px] px-5 !bg-transparent border !border-[#C83785]" buttonType="bordered" onClick={() => setOpenModal(prev => ({ ...prev, open: true }))}>
              Schedule
            </Button>
          </div>
        </div>
        <div className="bg-white  border border-[#E3E8EF] rounded-[16px] w-full">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-[21px] mx-6">
          <h2 className="text-lg font-semibold text-gray-900">Open meetings(3)</h2>
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
                className="!bg-white !border-[#B9C2CA]  !h-[36px] rounded-full"
              />
            </div>
            {/* Filter */}
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              <SlidersHorizontal className="w-4 h-4" />
              <p className="hidden lg:block">Filter</p>
            </button>
          </div>
        </div>

          <CustomTable
          columns={openMeetingsHeaders()}
          data={mockCommunityMeetings}
          tableStyles=""
        />

        {/* Pagination */}
        <Pagination />
      </div>

     </div>
     <div className="w-full lg:w-[34%]">
      <ScheduleList />
     </div>
    </div>
  )
}