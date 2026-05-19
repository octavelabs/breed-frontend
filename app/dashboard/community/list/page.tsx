"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This route is superseded by /dashboard/community — redirect there.
const CommunityListPage = () => {
  const router = useRouter();
  useEffect(() => { router.replace("/dashboard/community"); }, [router]);
  return null;
};

export default CommunityListPage;
