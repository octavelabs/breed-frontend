"use client";

import React from "react";
import { SearchIcon, SlidersHorizontal } from "lucide-react";
import CustomTable from "@/app/components/Table";
import { discipleHeaders } from "@/utils/tableheaders";
import { mockDisciples } from "@/utils/dummyData";
import Input from "@/app/components/Input";

const DisciplesList: React.FC = () => {
  return (
    <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-[16px]">
      <div className="flex items-center justify-between my-[21px] mx-6">
        <h2 className="text-lg font-semibold text-gray-900">Disciples (23)</h2>
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
        checkboxes={true}
        columns={discipleHeaders()}
        data={mockDisciples}
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
      </div>
    </div>
  );
};

export default DisciplesList;
