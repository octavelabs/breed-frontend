"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Video } from "lucide-react";

export default function JoinRedirectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/room/${id}`);
  }, [id, router]);

  return (
    <div className="fixed inset-0 bg-[#0d0d1a] flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-full bg-linear-to-b from-[#A967F1] to-[#5B26B1] flex items-center justify-center">
        <Video size={28} className="text-white" />
      </div>
      <p className="text-white font-semibold text-lg">Joining meeting…</p>
      <div className="flex gap-1 mt-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-2 h-2 rounded-full bg-[#870BD6] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}
