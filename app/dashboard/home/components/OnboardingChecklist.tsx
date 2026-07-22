"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ChevronRight, X, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Step {
  id: string;
  label: string;
  description: string;
  href: string;
}

const BELIEVER_STEPS: Step[] = [
  {
    id: "profile",
    label: "Complete your profile",
    description: "Add a photo, bio and church details so others can connect with you.",
    href: "/dashboard/more",
  },
  {
    id: "community",
    label: "Join a community",
    description: "Find and join a faith community that matches your interests.",
    href: "/dashboard/community",
  },
  {
    id: "devotional",
    label: "Read a devotional",
    description: "Start your spiritual journey with today's devotional.",
    href: "/dashboard/buildup?tab=devotionals",
  },
  {
    id: "invite",
    label: "Invite your prayer partner",
    description: "Invite someone you trust to join you on your faith journey.",
    href: "/dashboard/buildup?tab=accountability",
  },
  {
    id: "course",
    label: "Start a course",
    description: "Grow in your faith by enrolling in a course.",
    href: "/dashboard/learn",
  },
];

const PREACHER_STEPS: Step[] = [
  {
    id: "profile",
    label: "Complete your profile",
    description: "Add a photo, bio and church details to build your ministry's identity.",
    href: "/dashboard/more",
  },
  {
    id: "community",
    label: "Create a community",
    description: "Start a community where your congregation can connect and grow.",
    href: "/dashboard/preacher/community",
  },
  {
    id: "meeting",
    label: "Schedule a meeting",
    description: "Set up your first community or open meeting.",
    href: "/dashboard/preacher/meetings",
  },
  {
    id: "course",
    label: "Create a course",
    description: "Package your teachings into a structured course for your followers.",
    href: "/dashboard/preacher/showreel",
  },
  {
    id: "mentorship",
    label: "Offer mentorship",
    description: "Open yourself to mentorship requests from believers.",
    href: "/dashboard/preacher/mentorship",
  },
];

function storageKey(userId: string) {
  return `breed_onboarding_v1_${userId}`;
}

export function OnboardingChecklist() {
  const { user, userType } = useAuth();
  const steps = userType === "preacher" ? PREACHER_STEPS : BELIEVER_STEPS;

  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const raw = localStorage.getItem(storageKey(user.id));
      const parsed: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      // Auto-complete profile step when the user has filled in their bio and avatar
      if (user.avatarUrl && (user as any).bio) {
        parsed["profile"] = true;
      }
      setCompleted(parsed);
      setDismissed(!!parsed["__dismissed__"]);
    } catch {
      setCompleted({});
    }
    setMounted(true);
  }, [user?.id, user?.avatarUrl, (user as any)?.bio]);

  const persist = (next: Record<string, boolean>) => {
    if (!user?.id) return;
    localStorage.setItem(storageKey(user.id), JSON.stringify(next));
  };

  const toggle = (id: string) => {
    const next = { ...completed, [id]: !completed[id] };
    setCompleted(next);
    persist(next);
  };

  const dismiss = () => {
    const next = { ...completed, __dismissed__: true };
    persist(next);
    setDismissed(true);
  };

  const doneCount = steps.filter((s) => completed[s.id]).length;
  const allDone = doneCount === steps.length;
  const progress = Math.round((doneCount / steps.length) * 100);

  // Wait for localStorage to load before rendering to avoid a flash of wrong state
  if (!mounted || dismissed) return null;

  return (
    <div className="bg-white dark:bg-[#181A1F] border border-[#E3E8EF] dark:border-[#2D313A] rounded-2xl overflow-hidden mb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3E8EF] dark:border-[#2D313A]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F5EBFF] dark:bg-[#2D1B4E] flex items-center justify-center shrink-0">
            <Sparkles size={15} className="text-[#870BD6] dark:text-[#A855F7]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#180426] dark:text-white">Getting started</h2>
            <p className="text-xs text-[#60666B] dark:text-[#9CA3AF]">{doneCount} of {steps.length} completed</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 h-1.5 bg-[#F0F2F4] dark:bg-[#252830] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#870BD6] dark:bg-[#A855F7] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-medium text-[#60666B] dark:text-[#9CA3AF]">{progress}%</span>
          </div>
          <button
            onClick={dismiss}
            title="Dismiss"
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#252830] transition-colors text-[#60666B] dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* All done */}
      {allDone ? (
        <div className="px-6 py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-[#ECFDF3] dark:bg-[#0D2B1D] flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={24} className="text-[#067647] dark:text-[#34D399]" />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">You're all set!</p>
          <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] mt-1 max-w-xs mx-auto">
            You've completed your Breed setup. Welcome to the community.
          </p>
          <button
            onClick={dismiss}
            className="mt-4 text-xs text-[#870BD6] dark:text-[#A855F7] font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#F0F2F4] dark:divide-[#2D313A]">
          {steps.map((step) => {
            const done = !!completed[step.id];
            return (
              <div
                key={step.id}
                className={`flex items-center gap-4 px-6 py-4 transition-colors ${done ? "bg-[#FAFAFA] dark:bg-[#252830]/40" : "hover:bg-[#FAFAFA] dark:hover:bg-[#252830]/40"}`}
              >
                <button
                  onClick={() => toggle(step.id)}
                  className="shrink-0 transition-colors hover:scale-110"
                  title={done ? "Mark as incomplete" : "Mark as done"}
                >
                  {done
                    ? <CheckCircle2 size={20} className="text-[#067647] dark:text-[#34D399]" />
                    : <Circle size={20} className="text-[#D0D5DD] dark:text-[#717784] hover:text-[#870BD6] dark:hover:text-[#A855F7]" />
                  }
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-snug ${done ? "line-through text-[#60666B] dark:text-[#717784]" : "text-[#180426] dark:text-[#E2E4E9]"}`}>
                    {step.label}
                  </p>
                  {!done && (
                    <p className="text-xs text-[#60666B] dark:text-[#9CA3AF] mt-0.5 truncate">{step.description}</p>
                  )}
                </div>

                {!done && (
                  <Link
                    href={step.href}
                    className="shrink-0 flex items-center gap-0.5 text-xs font-semibold text-[#870BD6] dark:text-[#A855F7] hover:underline"
                  >
                    Go <ChevronRight size={13} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
