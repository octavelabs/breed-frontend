"use client";

import { useCallback, useEffect, useState } from "react";
import { SearchIcon, SlidersHorizontal, RefreshCw } from "lucide-react";
import Input from "@/app/components/Input";
import RecordingCard, { MeetingRecording } from "./RecordingCard";
import { Pagination } from "./AllMeetings";
import { meetingsService } from "@/lib/api-services";

const EmptyState = () => (
  <div className="flex justify-center h-[350px] items-center">
    <div className="flex flex-col gap-4 items-center text-center px-6">
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M64.0013 28.2752V113.768C63.0946 113.768 62.1346 113.608 61.388 113.182L61.1746 113.075C50.9346 107.475 33.068 101.608 21.4946 100.062L19.948 99.8485C14.828 99.2085 10.668 94.4085 10.668 89.2885V24.8618C10.668 18.5152 15.8413 13.7152 22.188 14.2485C33.388 15.1552 50.348 20.8085 59.8413 26.7285L61.1746 27.5285C61.9746 28.0085 62.988 28.2752 64.0013 28.2752Z" fill="#E2E3E5" />
        <path d="M117.333 24.9042V89.2775C117.333 94.3976 113.173 99.1975 108.053 99.8375L106.293 100.051C94.6667 101.598 76.7467 107.518 66.5067 113.171C65.8133 113.598 64.96 113.758 64 113.758V28.2642C65.0133 28.2642 66.0267 27.9975 66.8267 27.5175L67.7333 26.9309C77.2267 20.9576 94.24 15.2509 105.44 14.2909H105.76C112.107 13.7576 117.333 18.5042 117.333 24.9042Z" fill="#CDC8D3" />
        <path d="M41.332 49.2705H29.332C27.1454 49.2705 25.332 47.4572 25.332 45.2705C25.332 43.0838 27.1454 41.2705 29.332 41.2705H41.332C43.5187 41.2705 45.332 43.0838 45.332 45.2705C45.332 47.4572 43.5187 49.2705 41.332 49.2705Z" fill="#CDC8D3" />
        <path d="M45.332 65.2705H29.332C27.1454 65.2705 25.332 63.4572 25.332 61.2705C25.332 59.0838 27.1454 57.2705 29.332 57.2705H45.332C47.5187 57.2705 49.332 59.0838 49.332 61.2705C49.332 63.4572 47.5187 65.2705 45.332 65.2705Z" fill="#CDC8D3" />
      </svg>
      <p className="text-base font-semibold text-gray-700">No completed meetings yet</p>
      <p className="text-sm text-[#60666B]">Completed meetings will appear here as recordings.</p>
    </div>
  </div>
);

const PublishedRecordings = () => {
  const [recordings, setRecordings] = useState<MeetingRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    meetingsService.getAll({ status: "COMPLETED" as any, limit: 50 })
      .then((res: unknown) => {
        const data = (res as any)?.data ?? res;
        setRecordings(Array.isArray(data) ? data : []);
      })
      .catch(() => setRecordings([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = recordings.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    (r.community?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-[16px]">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-[21px] mx-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Completed meetings
          <span className="ml-2 text-[#60666B] font-normal text-sm">({filtered.length})</span>
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              type="text" id="pr-search" name="pr-search"
              onChange={(e) => setSearch(e.target.value)} value={search}
              placeholder="Search recordings…" variant="outlined"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-[#E2E3E5] overflow-hidden animate-pulse">
              <div className="bg-gray-100 p-3.5">
                <div className="aspect-video bg-gray-200 rounded-xl" />
              </div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
          {filtered.map((r) => (
            <RecordingCard key={r.id} data={r} />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && <Pagination />}
    </div>
  );
};

export default PublishedRecordings;
