"use client";

import { BookOpen, Users, BarChart2, Tag, DollarSign, Star } from "lucide-react";

interface ApiCourse {
  id: string;
  title: string;
  status: string;
  description?: string;
  level?: string;
  isFree?: boolean;
  enrollmentCount?: number;
  lessonCount?: number;
  lessons?: unknown[];
  category?: { name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

interface MetricsContentProps {
  course: ApiCourse | null;
}

const MetricCard = ({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) => (
  <div className="bg-white border border-[#E3E8EF] rounded-2xl p-6 flex items-start gap-4 shadow-sm">
    <div className="w-11 h-11 flex items-center justify-center rounded-full bg-[#F5EBFF] shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#180426]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const MetricsContent = ({ course }: MetricsContentProps) => {
  if (!course) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400 text-sm">
        No course data available.
      </div>
    );
  }

  const lessonCount = course.lessonCount ?? course.lessons?.length ?? 0;
  const enrollmentCount = course.enrollmentCount ?? 0;
  const level = course.level
    ? course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase()
    : "Beginner";
  const status =
    course.status.charAt(0).toUpperCase() + course.status.slice(1).toLowerCase();
  const createdAt = course.createdAt
    ? new Date(course.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const updatedAt = course.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="bg-white px-4 lg:px-10 py-6">
      <h2 className="text-lg font-semibold text-[#180426] mb-6">Course Metrics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard
          icon={<Users size={22} className="text-[#B144F9]" />}
          label="Enrolled Students"
          value={enrollmentCount}
          sub="Total enrollments"
        />
        <MetricCard
          icon={<BookOpen size={22} className="text-[#B144F9]" />}
          label="Total Lessons"
          value={lessonCount}
          sub="Across all chapters"
        />
        <MetricCard
          icon={<Star size={22} className="text-[#B144F9]" />}
          label="Difficulty Level"
          value={level}
        />
        <MetricCard
          icon={<BarChart2 size={22} className="text-[#B144F9]" />}
          label="Status"
          value={status}
          sub={`Published: ${createdAt}`}
        />
        <MetricCard
          icon={<DollarSign size={22} className="text-[#B144F9]" />}
          label="Pricing"
          value={course.isFree ? "Free" : "Paid"}
        />
        <MetricCard
          icon={<Tag size={22} className="text-[#B144F9]" />}
          label="Category"
          value={course.category?.name ?? "Uncategorised"}
          sub={`Last updated: ${updatedAt}`}
        />
      </div>

      <div className="bg-[#FAFAFA] border border-[#E3E8EF] rounded-2xl p-6">
        <h3 className="text-base font-semibold text-[#180426] mb-2">Description</h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {course.description ?? "No description provided."}
        </p>
      </div>
    </div>
  );
};

export default MetricsContent;
