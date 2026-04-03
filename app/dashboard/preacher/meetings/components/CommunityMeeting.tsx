import PreacherCommunityIcon from "@/app/assets/icons/preacherCommunityIcon"
import { ScheduleList } from "./ScheduleList"
import Button from "@/app/components/Button"
import { Dispatch, SetStateAction } from "react";
import CustomTable from "@/app/components/Table";
import { communityMeetingsHeaders } from "@/utils/tableheaders";
import { mockCommunityMeetings } from "@/utils/dummyData";
import { SearchIcon, SlidersHorizontal } from "lucide-react";
import Input from "@/app/components/Input";
import { Pagination } from "./AllMeetings";



export const CommunityMeeting = (
     {
        setOpenModal,
      }: {
        setOpenModal: Dispatch<SetStateAction<{ community: boolean; open: boolean }>>;
      }
) => {
  return (
    <div className="flex flex-col lg:flex-row gap-5 mx-4 lg:mx-10">
     <div className="w-full lg:w-[66%] flex flex-col gap-5">
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
            <Button customClass='!h-[40px] px-5 !text-[#870BD6]' buttonType="bordered" onClick={() => setOpenModal(prev => ({ ...prev, community: true }))}>
              Schedule
            </Button>
          </div>
        </div>
        <div className="bg-white  border border-[#E3E8EF] rounded-[16px] w-full">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-[21px] mx-6">
          <h2 className="text-lg font-semibold text-gray-900">Community meetings(3)</h2>
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
                className="!bg-white !border-[#B9C2CA] !h-[36px] rounded-full"
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
          columns={communityMeetingsHeaders()}
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