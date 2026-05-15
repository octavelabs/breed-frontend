"use client";

import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { Plus, SearchIcon, SlidersHorizontal } from "lucide-react";
import Input from "@/app/components/Input";
import CourseCard from "./CourseCard";
import Button from "@/app/components/Button";
import { courseService } from "@/lib/api-services";
import { useAuth } from "@/context/AuthContext";
import { useDebounce } from "@/utils/useDebounce";
import { CourseDetails } from "../type";

interface ApiCourse {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  coverImageUrl?: string | null;
  enrollmentCount?: number;
  lessonCount?: number;
  _count?: { lessons?: number; enrollments?: number };
}

interface PaginatedCourses {
  data: ApiCourse[];
  meta: { total: number; page: number; totalPages: number };
}

function mapToCourseDetails(c: ApiCourse): CourseDetails {
  return {
    id: c.id,
    title: c.title,
    status: c.status?.toLowerCase() ?? "draft",
    date: new Date(c.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    chapters: 1,
    lessons: c.lessonCount ?? c._count?.lessons ?? 0,
    participants: c.enrollmentCount ?? c._count?.enrollments ?? 0,
    comments: 0,
    imageUrl: c.coverImageUrl ?? undefined,
  };
}

const CourseList = ({
  setOpenModal,
}: {
  setOpenModal: Dispatch<SetStateAction<{ course: boolean; devotional: boolean }>>;
}) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const debouncedSearch = useDebounce(search, 400) ?? "";

  const fetchCourses = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const result = (await courseService.getAll({
        authorId: user.id,
        search: debouncedSearch || undefined,
        page,
        limit,
      })) as PaginatedCourses;

      const list: ApiCourse[] = Array.isArray(result)
        ? (result as ApiCourse[])
        : result?.data ?? [];
      const totalCount: number = Array.isArray(result)
        ? (result as ApiCourse[]).length
        : result?.meta?.total ?? list.length;

      setCourses(list.map(mapToCourseDetails));
      setTotal(totalCount);
    } catch {
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id, debouncedSearch, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset to page 1 on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-[16px]">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-[21px] mx-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Courses{loading ? "" : `(${total})`}
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              id="courseSearch"
              name="courseSearch"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              placeholder="Search by name"
              variant="outlined"
              icon={
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
              }
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
        <div className="flex justify-center items-center h-[350px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
        </div>
      ) : courses.length < 1 ? (
        <div className="flex justify-center h-[350px] items-center">
          <div className="flex flex-col gap-4 items-center">
            <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M64.0013 28.2752V113.768C63.0946 113.768 62.1346 113.608 61.388 113.182L61.1746 113.075C50.9346 107.475 33.068 101.608 21.4946 100.062L19.948 99.8485C14.828 99.2085 10.668 94.4085 10.668 89.2885V24.8618C10.668 18.5152 15.8413 13.7152 22.188 14.2485C33.388 15.1552 50.348 20.8085 59.8413 26.7285L61.1746 27.5285C61.9746 28.0085 62.988 28.2752 64.0013 28.2752Z" fill="#E2E3E5" />
              <path d="M117.333 24.9042V89.2775C117.333 94.3976 113.173 99.1975 108.053 99.8375L106.293 100.051C94.6667 101.598 76.7467 107.518 66.5067 113.171C65.8133 113.598 64.96 113.758 64 113.758V28.2642C65.0133 28.2642 66.0267 27.9975 66.8267 27.5175L67.7333 26.9309C77.2267 20.9576 94.24 15.2509 105.44 14.2909H105.76C112.107 13.7576 117.333 18.5042 117.333 24.9042Z" fill="#CDC8D3" />
              <path d="M41.332 49.2705H29.332C27.1454 49.2705 25.332 47.4572 25.332 45.2705C25.332 43.0838 27.1454 41.2705 29.332 41.2705H41.332C43.5187 41.2705 45.332 43.0838 45.332 45.2705C45.332 47.4572 43.5187 49.2705 41.332 49.2705Z" fill="#CDC8D3" />
              <path d="M45.332 65.2705H29.332C27.1454 65.2705 25.332 63.4572 25.332 61.2705C25.332 59.0838 27.1454 57.2705 29.332 57.2705H45.332C47.5187 57.2705 49.332 59.0838 49.332 61.2705C49.332 63.4572 47.5187 65.2705 45.332 65.2705Z" fill="#CDC8D3" />
            </svg>
            <p className="text-base text-gray-500">
              {search ? "No courses match your search" : "You haven't created any course yet"}
            </p>
            {!search && (
              <Button
                customClass="!w-fit px-6 !h-[48px] !text-white"
                type="button"
                onClick={() => setOpenModal((prev) => ({ ...prev, course: true }))}
              >
                <p className="flex items-center gap-[6px]">
                  <Plus stroke="white" /> Create course
                </p>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
          {courses.map((course) => (
            <CourseCard data={course} key={course.id} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-center gap-4 py-4 border-t border-gray-200">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-[14px] py-2 text-sm font-medium text-[#3C3E40] border border-[#CDD5DF] rounded-full disabled:opacity-40"
          >
            ← Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-sm text-gray-400">…</span>
                )}
                <button
                  onClick={() => setPage(p)}
                  className={`flex justify-center items-center w-10 h-10 text-sm font-medium rounded-[8px] ${
                    p === page ? "bg-[#E2E3E5] text-[#180426] font-semibold" : "bg-white text-[#4E5255]"
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-[14px] py-2 text-sm font-medium text-[#3C3E40] border border-[#CDD5DF] rounded-full disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseList;
