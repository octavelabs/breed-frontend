"use client";

import { Users } from "lucide-react";

export const EmptyState = () => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 bg-white">
    <div className="w-16 h-16 rounded-full bg-[#F5EBFF] flex items-center justify-center">
      <Users size={26} className="text-[#870BD6]" />
    </div>
    <p className="text-base font-semibold text-[#180426]">Select a community</p>
    <p className="text-sm text-[#60666B] max-w-xs">
      Choose a community from the list on the left to start chatting.
    </p>
  </div>
);