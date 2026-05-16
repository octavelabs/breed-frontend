"use client";

import { BookOpen, Users, Layers, Activity, Tag, BadgeCheck } from "lucide-react";

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

// ── Brand card tokens ──────────────────────────────────────────────────────────

type Palette = { bg: string; border: string; icon: string; accent: string };

const PURPLE:  Palette = { bg: "#FBF6FF", border: "#E7C8FF", icon: "#E7C8FF", accent: "#870BD6" };
const BLUE:    Palette = { bg: "#EFF8FF", border: "#B2DDFF", icon: "#B2DDFF", accent: "#175CD3" };
const AMBER:   Palette = { bg: "#FFFAEB", border: "#FEDF89", icon: "#FEDF89", accent: "#B54708" };
const GREEN:   Palette = { bg: "#ECFDF3", border: "#ABEFC6", icon: "#ABEFC6", accent: "#067647" };
const PINK:    Palette = { bg: "#FBEAF3", border: "#F3C4DD", icon: "#F3C4DD", accent: "#C83785" };
const INDIGO:  Palette = { bg: "#EEF4FF", border: "#C7D7FD", icon: "#C7D7FD", accent: "#3538CD" };

interface CardConfig {
  label: string;
  value: string | number | React.ReactNode;
  sub?: string;
  Icon: React.ElementType;
  palette: Palette;
}

const MetricCard = ({ label, value, sub, Icon, palette }: CardConfig) => (
  <div
    className="rounded-[16px] border p-6"
    style={{ backgroundColor: palette.bg, borderColor: palette.border }}
  >
    <div className="flex items-start gap-4">
      <div
        className="w-[48px] h-[48px] rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: palette.icon }}
      >
        <Icon size={22} color={palette.accent} />
      </div>
      <div>
        <p className="text-[13px] text-[#60666B]">{label}</p>
        {typeof value === "string" || typeof value === "number"
          ? <h3 className="text-base font-bold text-gray-900 mt-0.5">{value}</h3>
          : <div className="mt-0.5">{value}</div>}
        {sub && <p className="text-[13px] text-[#60666B] mt-1">{sub}</p>}
      </div>
    </div>
  </div>
);

const MetricsContent = ({ course }: MetricsContentProps) => {
  if (!course) {
    return (
      <div className="flex justify-center items-center h-64 text-[#60666B] text-sm">
        No course data available.
      </div>
    );
  }

  const lessonCount = course.lessonCount ?? course.lessons?.length ?? 0;
  const enrollmentCount = course.enrollmentCount ?? 0;
  const levelMap: Record<string, string> = {
    BEGINNER: "Foundational",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
  };
  const level = course.level ? (levelMap[course.level] ?? course.level) : "Foundational";
  const status =
    course.status === "PUBLISHED"
      ? "Live"
      : course.status.charAt(0).toUpperCase() + course.status.slice(1).toLowerCase();
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

  const cards: CardConfig[] = [
    {
      label: "Enrolled Students",
      value: enrollmentCount,
      sub: "Total enrollments",
      Icon: Users,
      palette: PURPLE,
    },
    {
      label: "Total Lessons",
      value: lessonCount,
      sub: "Across all chapters",
      Icon: BookOpen,
      palette: BLUE,
    },
    {
      label: "Difficulty Level",
      value: (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mt-0.5"
          style={{ backgroundColor: AMBER.icon, color: AMBER.accent }}>
          {level}
        </span>
      ),
      Icon: Layers,
      palette: AMBER,
    },
    {
      label: "Status",
      value: status,
      sub: `Since ${createdAt}`,
      Icon: Activity,
      palette: GREEN,
    },
    {
      label: "Pricing",
      value: course.isFree ? "Free" : "Paid",
      Icon: BadgeCheck,
      palette: PINK,
    },
    {
      label: "Category",
      value: (
        <div className="flex flex-wrap gap-1.5 mt-0.5">
          {course.category?.name ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
              style={{ backgroundColor: INDIGO.icon, color: INDIGO.accent }}>
              {course.category.name}
            </span>
          ) : (
            <span className="text-base font-bold text-gray-900">Uncategorised</span>
          )}
        </div>
      ),
      sub: `Updated ${updatedAt}`,
      Icon: Tag,
      palette: INDIGO,
    },
  ];

  return (
    <div className="bg-white px-4 lg:px-10 py-6">
      <h2 className="text-lg font-semibold text-[#180426] mb-6">Course Metrics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="bg-white border border-[#E3E8EF] rounded-[16px] p-6">
        <h3 className="text-base font-bold text-gray-900 mb-2">Description</h3>
        <p className="text-[13px] text-[#60666B] leading-relaxed whitespace-pre-line">
          {course.description ?? "No description provided."}
        </p>
      </div>
    </div>
  );
};

export default MetricsContent;
