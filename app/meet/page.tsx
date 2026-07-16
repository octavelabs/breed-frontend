"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";

function formatCode(raw: string): string {
  const letters = raw.replace(/[^a-zA-Z]/g, "").toLowerCase().slice(0, 9);
  const parts = [letters.slice(0, 3), letters.slice(3, 6), letters.slice(6, 9)].filter(Boolean);
  return parts.join("-");
}

export default function MeetLanding() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setCode(formatCode(e.target.value));
  };

  const handleJoin = () => {
    const clean = code.replace(/-/g, "");
    if (clean.length < 3) {
      setError("Enter a valid room code to join.");
      inputRef.current?.focus();
      return;
    }
    router.push(`/${code}`);
  };

  return (
    <div className="min-h-screen bg-[#f8edfe] flex flex-col">

      {/* Nav — centered pill, same as main site */}
      <nav className="shadow-[0px_16px_50px_0px_#0310271A] px-4 sm:px-[40px] lg:px-[60px] flex w-full lg:w-fit lg:min-w-[680px] h-[80px] box-border mx-auto items-center gap-0 lg:gap-[72px] justify-between left-1/2 -translate-x-1/2 fixed top-0 lg:top-[40px] z-20 bg-white lg:bg-[#FBF6FF] lg:rounded-full border-[5px] border-white">
        <a href="https://joinbreed.com" className="h-[30px] w-[80px]">
          <img src="/Logo.png" alt="logo" className="h-full w-full" />
        </a>
        <div className="flex gap-4">
          <button className="whitespace-nowrap px-5 py-4 bg-white text-[#5B26B1] border-[1.5px] border-[#5B26B1] rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300">
            <a href="https://joinbreed.com/login">Sign in</a>
          </button>
          <button className="whitespace-nowrap px-5 py-4 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300">
            <a href="https://joinbreed.com/signup">Get started</a>
          </button>
        </div>
      </nav>

      {/* Hero — centered */}
      <main className="flex-1 flex flex-col items-center justify-center text-center pt-[80px] lg:pt-[120px] px-6">

        <div className="inline-flex items-center gap-2 bg-[#F5EEFF] text-[#870BD6] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Video size={12} />
          Breed Live
        </div>

        <h1 className="text-[42px] lg:text-[80px] font-[800] text-[#180426] leading-tight mb-6 font-almarai">
          Gather in faith,<br />wherever you are.
        </h1>

        <p className="text-base lg:text-[24px] text-[#4E5255] mb-12 max-w-2xl font-medium">
          Join community meetings, mentorship sessions, and prayer partnerships — all in one place.
        </p>

        {/* Input + button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <input
            ref={inputRef}
            type="text"
            value={code}
            onChange={handleInput}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="Enter a room code"
            spellCheck={false}
            autoComplete="off"
            className={`flex-1 h-[52px] px-5 rounded-full border text-[#180426] text-sm font-medium placeholder:text-[#A0A8B0] bg-white focus:outline-none focus:ring-2 transition-all ${
              error
                ? "border-red-400 focus:ring-red-200"
                : "border-[#D2D9DF] focus:ring-[#D4A8FF] focus:border-[#870BD6]"
            }`}
          />
          <button
            onClick={handleJoin}
            className="h-[52px] px-7 rounded-full bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            Join meeting
          </button>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <p className="mt-4 text-xs text-[#A0A8B0]">
          Room codes look like{" "}
          <span className="font-mono font-medium text-[#60666B]">abc-def-ghi</span>
        </p>

      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-5 flex items-center justify-between">
        <p className="text-xs text-[#A0A8B0]">© 2026 Breed. All rights reserved.</p>
        <div className="flex items-center gap-4 text-xs text-[#A0A8B0]">
          <a href="https://joinbreed.com/privacy" className="hover:text-[#870BD6] transition-colors">Privacy</a>
          <a href="https://joinbreed.com/terms" className="hover:text-[#870BD6] transition-colors">Terms</a>
        </div>
      </footer>

    </div>
  );
}
