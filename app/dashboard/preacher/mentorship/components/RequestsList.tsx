"use client";

import React, { useState } from "react";
import { Search, SearchIcon, SlidersHorizontal } from "lucide-react";
import CustomTable from "@/app/components/Table";
import { Request } from "../types";
import AcceptModal from "./AcceptModal";
import RejectModal from "./RejectModal";
import { pastRequestHeaders, requestHeaders } from "@/utils/tableheaders";
import { mockPastRequests, mockPendingRequests } from "@/utils/dummyData";
import Input from "@/app/components/Input";

const RequestsList: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState({
    accept: false,
    reject: false,
  });
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const handleButtonClick = (request: Request, type: string) => {
    setSelectedRequest(request);
    type === "accept"
      ? setModalOpen({ ...isModalOpen, accept: true })
      : setModalOpen({ ...isModalOpen, reject: true });
  };

  const onClose = () => {
    setModalOpen({ ...isModalOpen, accept: false, reject: false });
  };

  return (
    <div className="bg-white">
      {isModalOpen.accept && (
        <AcceptModal
          isOpen={isModalOpen.accept}
          onClose={onClose}
          selectedRequest={selectedRequest}
        />
      )}
      {isModalOpen.reject && (
        <RejectModal
          isOpen={isModalOpen.reject}
          onClose={onClose}
          selectedRequest={selectedRequest}
        />
      )}

      {/* Pending Requests */}
      <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-[16px] mb-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-[21px] mx-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Request (2)
          </h2>
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
          checkboxes={true}
          columns={requestHeaders(handleButtonClick)}
          data={mockPendingRequests}
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

      {/* Past Requests */}
      <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-[16px]">
        <div className="flex items-center justify-between my-[21px] mx-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Past Request (2)
          </h2>
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
          columns={pastRequestHeaders()}
          data={mockPastRequests}
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
    </div>
  );
};

export default RequestsList;
