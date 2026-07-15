"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Video } from "lucide-react";

const COMMUNITY_PHOTOS = [
  "/aboutHero1.png",
  "/aboutHero2.png",
  "/aboutHero3.png",
  "/aboutHero5.png",
  "/aboutHero6.png",
  "/hero3.png",
];

function formatCode(raw: string): string {
  const letters = raw.replace(/[^a-zA-Z]/g, "").toLowerCase().slice(0, 12);
  const parts = [letters.slice(0, 4), letters.slice(4, 8), letters.slice(8, 12)].filter(Boolean);
  return parts.join("-");
}

export default function MeetLanding() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const formatted = formatCode(e.target.value);
    setCode(formatted);
  };

  const handleJoin = () => {
    const clean = code.replace(/-/g, "");
    if (clean.length < 3) {
      setError("Enter a valid room code to join.");
      inputRef.current?.focus();
      return;
    }
    router.push(`/join/${code}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleJoin();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Same pink/purple background blob as main hero */}
      <div className="absolute left-[-30px] top-[-80%] right-0 bg-gradient-to-r from-[#F1DFFF] to-[#F7EDFE] aspect-square rounded-full pointer-events-none" />
      {/* Nav — exact same styles as main site Navbar */}
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

      {/* Hero — push content below fixed nav (80px mobile, 80px+40px desktop) */}
      <main className="flex-1 flex items-center pt-[80px] lg:pt-[120px]">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-0">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left — text + input */}
            <div className="w-full lg:w-[48%] text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#F5EEFF] text-[#870BD6] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Video size={12} />
                Breed Live
              </div>

              <h1 className="text-[42px] lg:text-[80px] font-[800] text-[#180426] leading-tight mb-6 font-almarai">
                Gather in faith,<br />wherever you are.
              </h1>

              <p className="text-base lg:text-[24px] text-[#4E5255] mb-12 max-w-2xl mx-auto lg:mx-0 font-medium">
                Join community meetings, mentorship sessions, and prayer partnerships — all in one place.
              </p>

              {/* Input row */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                <div className="flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={code}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a room code"
                    spellCheck={false}
                    autoComplete="off"
                    className={`w-full h-[52px] px-5 rounded-full border text-[#180426] text-sm font-medium placeholder:text-[#A0A8B0] focus:outline-none focus:ring-2 transition-all ${
                      error
                        ? "border-red-400 focus:ring-red-200"
                        : "border-[#D2D9DF] focus:ring-[#D4A8FF] focus:border-[#870BD6]"
                    }`}
                  />
                </div>
                <button
                  onClick={handleJoin}
                  className="h-[52px] px-7 rounded-full bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold text-sm hover:shadow-lg hover:scale-105 active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
                >
                  Join meeting
                </button>
              </div>

              {error && (
                <p className="mt-3 text-sm text-red-500 text-center lg:text-left">{error}</p>
              )}

              <p className="mt-4 text-xs text-[#A0A8B0] text-center lg:text-left">
                Room codes look like{" "}
                <span className="font-mono font-medium text-[#60666B]">abcd-efgh-ijkl</span>
              </p>
            </div>

            {/* Right — photo mosaic */}
            <div className="w-full lg:w-[52%] flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[520px] h-[380px] lg:h-[480px]">
                {/* Soft background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#F5EEFF] via-[#EDD9FF] to-[#DDB6FF] rounded-3xl opacity-40" />

                {/* 3-column staggered grid */}
                <div className="absolute inset-0 grid grid-cols-3 gap-3 p-5">
                  {/* Col 1 — offset down */}
                  <div className="flex flex-col gap-3 pt-8">
                    <PhotoTile src={COMMUNITY_PHOTOS[0]} tall />
                    <PhotoTile src={COMMUNITY_PHOTOS[3]} />
                  </div>
                  {/* Col 2 — normal */}
                  <div className="flex flex-col gap-3">
                    <PhotoTile src={COMMUNITY_PHOTOS[1]} />
                    <PhotoTile src={COMMUNITY_PHOTOS[4]} tall />
                  </div>
                  {/* Col 3 — offset down */}
                  <div className="flex flex-col gap-3 pt-8">
                    <PhotoTile src={COMMUNITY_PHOTOS[2]} tall />
                    <PhotoTile src={COMMUNITY_PHOTOS[5]} />
                  </div>
                </div>

                {/* Live badge */}
                <div className="absolute bottom-7 left-7 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-white rounded-full px-3 py-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-[#180426]">Live now</span>
                </div>

                {/* Community badge */}
                <div className="absolute top-7 right-7 bg-[#870BD6] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                  Join your community
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-5 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-[#A0A8B0]">© 2025 Breed. All rights reserved.</p>
        <div className="flex items-center gap-4 text-xs text-[#A0A8B0]">
          <a href="https://joinbreed.com/privacy" className="hover:text-[#870BD6] transition-colors">Privacy</a>
          <a href="https://joinbreed.com/terms" className="hover:text-[#870BD6] transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  );
}

function PhotoTile({ src, tall }: { src: string; tall?: boolean }) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#E7C8FF] flex-shrink-0 ${
        tall ? "flex-[2]" : "flex-[1]"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#5B26B1]/30 to-transparent" />
    </div>
  );
}
