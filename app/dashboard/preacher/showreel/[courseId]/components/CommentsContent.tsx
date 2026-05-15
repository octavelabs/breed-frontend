"use client";

import { MessageSquareText } from "lucide-react";

const CommentsContent = () => {
  return (
    <div className="bg-white px-4 lg:px-10 py-6">
      <h2 className="text-lg font-semibold text-[#180426] mb-6">Student Comments</h2>
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#F5EBFF]">
          <MessageSquareText size={28} className="text-[#B144F9]" />
        </div>
        <p className="text-gray-500 text-sm max-w-xs">
          Student comments and discussion threads will appear here once learners enroll and engage with your course.
        </p>
      </div>
    </div>
  );
};

export default CommentsContent;
