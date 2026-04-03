"use client";

import { useState } from "react";
import { Plus, SearchIcon, SlidersHorizontal } from "lucide-react";

import { mockCourses,  mockPublishedRecordings } from "@/utils/dummyData";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";
import RecordingCard from "./RecordingCard";
import { Pagination } from "./AllMeetings";

const PublishedRecordings = () => {
    const [openModal, setOpenModal] = useState(false)
  return (
    <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-[16px]">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-[21px] mx-6">
        <h2 className="text-lg font-semibold text-gray-900">Published recording(3)</h2>
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
              className="!bg-white !border-[#B9C2CA]  !h-[36px] rounded-full"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <SlidersHorizontal className="w-4 h-4" />
            <p className="hidden lg:block">Filter</p>
          </button>
        </div>
      </div>
      {mockCourses.length < 1 ? (
        <div className="flex justify-center h-[350px] items-center">
          <div className="flex flex-col gap-4 items-center">
            <svg
              width="128"
              height="128"
              viewBox="0 0 128 128"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M64.0013 28.2752V113.768C63.0946 113.768 62.1346 113.608 61.388 113.182L61.1746 113.075C50.9346 107.475 33.068 101.608 21.4946 100.062L19.948 99.8485C14.828 99.2085 10.668 94.4085 10.668 89.2885V24.8618C10.668 18.5152 15.8413 13.7152 22.188 14.2485C33.388 15.1552 50.348 20.8085 59.8413 26.7285L61.1746 27.5285C61.9746 28.0085 62.988 28.2752 64.0013 28.2752Z"
                fill="#E2E3E5"
              />
              <path
                d="M117.333 24.9042V89.2775C117.333 94.3976 113.173 99.1975 108.053 99.8375L106.293 100.051C94.6667 101.598 76.7467 107.518 66.5067 113.171C65.8133 113.598 64.96 113.758 64 113.758V28.2642C65.0133 28.2642 66.0267 27.9975 66.8267 27.5175L67.7333 26.9309C77.2267 20.9576 94.24 15.2509 105.44 14.2909H105.76C112.107 13.7576 117.333 18.5042 117.333 24.9042Z"
                fill="#CDC8D3"
              />
              <path
                d="M41.332 49.2705H29.332C27.1454 49.2705 25.332 47.4572 25.332 45.2705C25.332 43.0838 27.1454 41.2705 29.332 41.2705H41.332C43.5187 41.2705 45.332 43.0838 45.332 45.2705C45.332 47.4572 43.5187 49.2705 41.332 49.2705Z"
                fill="#CDC8D3"
              />
              <path
                d="M45.332 65.2705H29.332C27.1454 65.2705 25.332 63.4572 25.332 61.2705C25.332 59.0838 27.1454 57.2705 29.332 57.2705H45.332C47.5187 57.2705 49.332 59.0838 49.332 61.2705C49.332 63.4572 47.5187 65.2705 45.332 65.2705Z"
                fill="#CDC8D3"
              />
            </svg>
            <p className="text-base text-gray-500">
              You haven’t created any recording yet
            </p>
            <Button
              customClass="!w-fit px-6 !h-[48px] !text-white"
              type="button"
              onClick={() => setOpenModal(true)}
            >
              <p className="flex items-center gap-[6px]">
                <Plus stroke="white" /> Create Recording
              </p>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
          {mockPublishedRecordings?.map((recording) => (
            <RecordingCard data={recording} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {mockPublishedRecordings.length > 0 && 
      <Pagination />}
    </div>
  );
};

export default PublishedRecordings;
