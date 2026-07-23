"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChapterRedirect() {
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();

  useEffect(() => {
    router.replace(`/dashboard/learn/${courseId}`);
  }, [courseId, router]);

  return null;
}
