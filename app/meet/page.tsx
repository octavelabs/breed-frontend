"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/Logo.png" alt="Breed" width={32} height={32} className="rounded-lg" />
          <span className="text-[#180426] font-bold text-lg tracking-tight hidden sm:block">Breed Meet</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-[#60666B] hover:text-[#870BD6] transition-colors px-3 py-1.5"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold text-white bg-gradient-to-b from-[#A967F1] to-[#5B26B1] px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-0">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left — text + input */}
            <div className="w-full lg:w-[48%] text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#F5EEFF] text-[#870BD6] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                <Video size={12} />
                Breed Live
              </div>

              <h1 className="text-[38px] sm:text-[48px] lg:text-[56px] font-bold text-[#180426] leading-[1.1] tracking-tight mb-5">
                Gather in faith,{" "}
                <span className="bg-gradient-to-r from-[#A967F1] to-[#5B26B1] bg-clip-text text-transparent">
                  wherever you are.
                </span>
              </h1>

              <p className="text-[#60666B] text-base lg:text-lg leading-relaxed mb-10 max-w-md mx-auto lg:mx-0">
                Join community meetings, mentorship sessions, and prayer partnerships — all in one place.
              </p>

              {/* Input row */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={code}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter a room code"
                    spellCheck={false}
                    autoComplete="off"
                    className={`w-full h-[52px] px-5 rounded-2xl border text-[#180426] text-sm font-medium placeholder:text-[#A0A8B0] focus:outline-none focus:ring-2 transition-all ${
                      error
                        ? "border-red-400 focus:ring-red-200"
                        : "border-[#D2D9DF] focus:ring-[#D4A8FF] focus:border-[#870BD6]"
                    }`}
                  />
                  {code && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#A0A8B0]">
                      {code}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleJoin}
                  className="h-[52px] px-7 rounded-2xl bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap shadow-lg shadow-purple-200"
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

                {/* 2×3 staggered grid */}
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

                {/* Live badge overlay */}
                <div className="absolute bottom-7 left-7 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-white rounded-full px-3 py-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-[#180426]">Live now</span>
                </div>

                {/* Members online badge */}
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
          <Link href="/privacy" className="hover:text-[#870BD6] transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-[#870BD6] transition-colors">Terms</Link>
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
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Subtle purple overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#5B26B1]/30 to-transparent" />
    </div>
  );
}
