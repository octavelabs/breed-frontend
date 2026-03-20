"use client";

import React, { Dispatch, SetStateAction } from "react";
import { Plus, SearchIcon, SlidersHorizontal } from "lucide-react";
import { mockDevotionals } from "@/utils/dummyData";
import Input from "@/app/components/Input";
import CourseCard from "./CourseCard";
import Button from "@/app/components/Button";

const DevotionalList = ({
  setOpenModal,
}: {
  setOpenModal: Dispatch<SetStateAction<{ course: boolean; devotional: boolean }>>;
}) => {
  return (
    <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-[16px]">
      <div className="flex items-center justify-between my-[21px] mx-6">
        <h2 className="text-lg font-semibold text-gray-900">Devotionals(23)</h2>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Input
              type="text"
              id="firstName"
              name="firstName"
              onChange={() => console.log("k")}
              value=""
              placeholder="Search by name"
              variant="outlined"
              icon={
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2  w-5 h-5 opacity-50" />
              }
              className="!bg-white !border-[#B9C2CA] !w-[300px] !h-[36px] rounded-full"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <SlidersHorizontal className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>
      {mockDevotionals.length < 1 ? (
        <div className="flex justify-center h-[350px] items-center">
          <div className="flex flex-col gap-4 items-center">
            <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M115.522 55.6719L110.296 77.9652C105.816 97.2186 96.9623 105.005 80.3223 103.405C77.6556 103.192 74.7756 102.712 71.6823 101.965L62.7223 99.8319C40.4823 94.5519 33.6023 83.5652 38.8289 61.2719L44.0556 38.9252C45.1223 34.3919 46.4023 30.4452 48.0023 27.1919C54.2423 14.2852 64.8556 10.8186 82.6689 15.0319L91.5756 17.1119C113.922 22.3386 120.749 33.3786 115.522 55.6719Z" fill="#E2E3E5"/>
<path d="M80.3218 103.421C77.0152 105.661 72.8552 107.528 67.7885 109.181L59.3618 111.955C38.1885 118.781 27.0418 113.075 20.1618 91.9013L13.3352 70.8347C6.50849 49.6613 12.1618 38.4613 33.3352 31.6347L41.7618 28.8613C43.9485 28.168 46.0285 27.5813 48.0018 27.208C46.4018 30.4613 45.1218 34.408 44.0552 38.9413L38.8285 61.288C33.6018 83.5813 40.4818 94.568 62.7218 99.848L71.6818 101.981C74.7752 102.728 77.6552 103.208 80.3218 103.421Z" fill="#CDC8D3"/>
<path d="M93.2754 56.0629C92.9554 56.0629 92.6354 56.0096 92.2621 55.9562L66.3954 49.3962C64.2621 48.8629 62.9821 46.6762 63.5154 44.5429C64.0488 42.4096 66.2354 41.1296 68.3688 41.6629L94.2354 48.2229C96.3688 48.7562 97.6488 50.9429 97.1154 53.0762C96.6888 54.8362 95.0354 56.0629 93.2754 56.0629Z" fill="#CDC8D3"/>
<path d="M77.6475 74.0746C77.3275 74.0746 77.0075 74.0212 76.6342 73.9679L61.1142 70.0212C58.9808 69.4879 57.7008 67.3012 58.2342 65.1679C58.7675 63.0346 60.9542 61.7546 63.0875 62.2879L78.6075 66.2346C80.7408 66.7679 82.0208 68.9546 81.4875 71.0879C81.0608 72.9012 79.4608 74.0746 77.6475 74.0746Z" fill="#CDC8D3"/>
</svg>

            <p className="text-base text-gray-500">
              You haven’t created any devotional yet
            </p>
            <Button
              customClass="!w-fit px-6 !h-[48px] !text-white"
              type="button"
              onClick={() =>
                setOpenModal((prev) => ({ ...prev, devotional: true }))
              }
            >
              <p className="flex items-center gap-[6px]">
                <Plus stroke="white" /> Create Devotional
              </p>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5 p-6">
          {mockDevotionals?.map((course, index) => (
            <CourseCard key={course?.id ?? index} data={course} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {mockDevotionals.length > 0 && <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200">
        <button className="px-[14px] py-2 text-sm font-medium text-[#3C3E40] border border-[#CDD5DF] rounded-full">
          ← Previous
        </button>
        {[1, 2, 3, "...", 8, 9, 10].map((page, index) => (
          <button
            key={index}
            className={`flex justify-center items-center w-10 h-10 text-sm font-medium rounded-[8px] text-[#4E5255] ${
              page === 1 ? "bg-[#E2E3E5]" : "bg-white"
            }`}
          >
            {page}
          </button>
        ))}
        <button className="px-[14px] py-2 text-sm font-medium text-[#3C3E40] border border-[#CDD5DF] rounded-full">
          Next →
        </button>
      </div>}
    </div>
  );
};

export default DevotionalList;
