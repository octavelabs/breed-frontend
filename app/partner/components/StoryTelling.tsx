// "use client";

// import { useEffect, useRef, useState } from "react";

// const slides = [
//   { id: "slide-1" },
//   { id: "slide-2" },
//   { id: "slide-3" },
//   { id: "slide-4" },
// ];

// export default function ScrollStorySection() {
//   const sectionRef = useRef<HTMLDivElement>(null);
//   const [progress, setProgress] = useState(0); // 0 to 1 across entire section
//   const [isDone, setIsDone] = useState(false);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (!sectionRef.current) return;
//       const rect = sectionRef.current.getBoundingClientRect();
//       const totalScrollable = sectionRef.current.offsetHeight - window.innerHeight;
//       const scrolled = -rect.top;
//       const p = Math.min(Math.max(scrolled / totalScrollable, 0), 1);
//       setProgress(p);
//       setIsDone(p >= 0.99);
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Each slide occupies 25% of scroll progress
//   // slide1: 0–0.25, slide2: 0.25–0.5, slide3: 0.5–0.75, slide4: 0.75–1.0
//   const getSlideState = (index: number) => {
//     const start = index * 0.25;
//     const end = start + 0.25;
//     const local = (progress - start) / 0.25; // 0 to 1 within this slide's range

//     if (progress < start) return { phase: "upcoming", local: 0 };
//     if (progress >= end) return { phase: "done", local: 1 };
//     return { phase: "active", local: Math.min(Math.max(local, 0), 1) };
//   };

//   // Slide 1: slide up and fade out when local > 0.7
//   const s1 = getSlideState(0);
//   const s1Exit = s1.local > 0.7 ? (s1.local - 0.7) / 0.3 : 0;
//   const s1Enter = Math.min(s1.local / 0.3, 1);
//   const slide1Style = {
//     opacity: s1.phase === "upcoming" ? 0 : s1.phase === "done" ? 0 : Math.min(s1Enter, 1 - s1Exit),
//     transform: `translateY(${
//       s1.phase === "upcoming" ? "40px" :
//       s1.phase === "done" ? "-60px" :
//       `${-s1Exit * 60}px`
//     })`,
//     transition: "none",
//   };

//   // Slide 2: comes from bottom, exits up
//   const s2 = getSlideState(1);
//   const s2Enter = Math.min(s2.local / 0.3, 1);
//   const s2Exit = s2.local > 0.7 ? (s2.local - 0.7) / 0.3 : 0;
//   const slide2Style = {
//     opacity: s2.phase === "upcoming" ? 0 : s2.phase === "done" ? 0 : Math.min(s2Enter, 1 - s2Exit),
//     transform: `translateY(${
//       s2.phase === "upcoming" ? "80px" :
//       s2.phase === "done" ? "-60px" :
//       `${(1 - s2Enter) * 80 - s2Exit * 60}px`
//     })`,
//     transition: "none",
//   };

//   // Slide 3: comes from bottom, exits up
//   const s3 = getSlideState(2);
//   const s3Enter = Math.min(s3.local / 0.3, 1);
//   const s3Exit = s3.local > 0.7 ? (s3.local - 0.7) / 0.3 : 0;
//   const slide3Style = {
//     opacity: s3.phase === "upcoming" ? 0 : s3.phase === "done" ? 0 : Math.min(s3Enter, 1 - s3Exit),
//     transform: `translateY(${
//       s3.phase === "upcoming" ? "80px" :
//       s3.phase === "done" ? "-60px" :
//       `${(1 - s3Enter) * 80 - s3Exit * 60}px`
//     })`,
//     transition: "none",
//   };

//   // Slide 4: comes from bottom, stays
//   const s4 = getSlideState(3);
//   const s4Enter = Math.min(s4.local / 0.3, 1);
//   const slide4Style = {
//     opacity: s4.phase === "upcoming" ? 0 : Math.min(s4Enter, 1),
//     transform: `translateY(${
//       s4.phase === "upcoming" ? "80px" :
//       `${(1 - s4Enter) * 80}px`
//     })`,
//     transition: "none",
//   };

//   return (
//     <>
//       {/* Tall section to create scroll room — 400vh gives 4 slides worth of scroll */}
//       <div ref={sectionRef} className="relative" style={{ height: "400vh" }}>
//         {/* Sticky viewport */}
//         <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center"
//           style={{
//             background: "linear-gradient(160deg, #f0eef8 0%, #e8e4f5 50%, #ede8f7 100%)",
//           }}
//         >
//           {/* Subtle background texture */}
//           <div
//             className="absolute inset-0 opacity-10"
//             style={{
//               backgroundImage: "url('/partnerCardBackground.png')",
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//             }}
//           />

//           {/* SLIDE 1 */}
//           <div
//             className="absolute inset-0 flex items-center justify-center px-4"
//             style={slide1Style}
//           >
//             <div className="container mx-auto text-center max-w-5xl">
//               <p className="text-[56px] font-medium leading-[72px] font-almarai text-[#180426]">
//                 Breed is intentionally free because we believe
//                 <br />
//                 spiritual growth should never sit behind a paywall.
//                 <br />
//                 Every{" "}
//                 <span className="font-almarai text-[56px] bg-white text-[#5B26B1] leading-[68px] px-[2px] rounded-[2px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A] mr-3">
//                   devotional,
//                 </span>
//                 <span className="font-almarai text-[56px] bg-white text-[#A22F6E] leading-[68px] px-[2px] rounded-[2px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A] mr-3">
//                   prayer thread,
//                 </span>
//                 <span className="font-almarai text-[56px] bg-white text-[#34399C] leading-[68px] px-[2px] rounded-[2px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A] mr-3">
//                   sermon tool,
//                 </span>
//                 and{" "}
//                 <span className="font-almarai text-[56px] bg-white text-[#1A8454] leading-[68px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A]">
//                   growth tracker
//                 </span>{" "}
//                 exists for one purpose:
//               </p>
//             </div>
//           </div>

//           {/* SLIDE 2 */}
//           <div
//             className="absolute inset-0 flex items-center justify-center px-4"
//             style={slide2Style}
//           >
//             <div className="container mx-auto text-center max-w-3xl">
//               <p className="text-[48px] font-medium leading-[64px] font-almarai text-[#180426]">
//                 To help people know{" "}
//                 <span
//                   className="font-almarai"
//                   style={{
//                     background: "linear-gradient(135deg, #5B26B1 10%, #34399C 70%)",
//                     WebkitBackgroundClip: "text",
//                     WebkitTextFillColor: "transparent",
//                     backgroundClip: "text",
//                   }}
//                 >
//                   God
//                 </span>{" "}
//                 more deeply and walk
//                 <br />
//                 faithfully toward eternity. 🛤️
//               </p>
//             </div>
//           </div>

//           {/* SLIDE 3 */}
//           <div
//             className="absolute inset-0 flex items-center justify-center px-4"
//             style={slide3Style}
//           >
//             <div className="container mx-auto text-center max-w-2xl">
//               <p
//                 className="text-[40px] font-medium leading-[56px] font-almarai"
//                 style={{ color: "#5B26B1" }}
//               >
//                 This isn&apos;t about scale...
//               </p>
//             </div>
//           </div>

//           {/* SLIDE 4 */}
//           <div
//             className="absolute inset-0 flex items-center justify-center px-4"
//             style={slide4Style}
//           >
//             <div className="container mx-auto text-center max-w-2xl flex flex-col items-center gap-2">
//               <p
//                 className="text-[28px] font-medium font-almarai line-through opacity-60"
//                 style={{ color: "#5B26B1" }}
//               >
//                 This isn&apos;t about scale...
//               </p>
//               <p className="text-[48px] font-bold leading-[60px] font-almarai text-[#180426]">
//                 It&apos;s about{" "}
//                 <span
//                   className="px-3 py-1 rounded-md text-white"
//                   style={{ background: "#870BD6" }}
//                 >
//                   souls.
//                 </span>
//               </p>
//             </div>
//           </div>

//           {/* Scroll indicator — only show at start */}
//           <div
//             className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
//             style={{
//               opacity: progress < 0.05 ? 1 : 0,
//               transition: "opacity 0.4s ease",
//             }}
//           >
//             <span className="text-sm text-[#180426] opacity-50 font-almarai tracking-wide">
//               scroll
//             </span>
//             <div className="w-px h-8 bg-[#180426] opacity-30 animate-pulse" />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function ScrollStorySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFixed, setIsFixed] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Total scroll distance = SCROLL_MULTIPLIER × viewport height
  // Spread across 4 slides. Tune this number to control how "slow" the scroll feels.
  const SCROLL_MULTIPLIER = 2.5;
  const SLIDES = 4;

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    if (animationFrameId.current)
      cancelAnimationFrame(animationFrameId.current);

    animationFrameId.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const containerHeight = containerRef.current.offsetHeight;

      const shouldBeFixed =
        rect.top <= 0 && rect.top + containerHeight > viewportHeight;
      const scrolledPastTop = -rect.top;
      const maxScroll = viewportHeight * SCROLL_MULTIPLIER;
      const progress = Math.min(Math.max(scrolledPastTop / maxScroll, 0), 1);
      const isComplete = !shouldBeFixed && progress >= 1;

      setIsFixed(shouldBeFixed);
      setScrollProgress(progress);
      setAnimationComplete(isComplete);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
    };
  }, [handleScroll]);

  const progress = animationComplete ? 1 : scrollProgress;

  // Returns local progress (0→1) for each slide occupying 1/SLIDES of total range
  const getLocal = (index: number) => {
    const start = index / SLIDES;
    const end = (index + 1) / SLIDES;
    return Math.min(Math.max((progress - start) / (end - start), 0), 1);
  };

  // Slide enters (0→0.3), holds (0.3→0.7), exits upward (0.7→1.0)
  // Last slide never exits
  const slideStyle = (index: number): React.CSSProperties => {
    const local = getLocal(index);
    const isLast = index === SLIDES - 1;
    const isFirst = index === 0;

    const enterProgress = Math.min(local / 0.3, 1);
    const exitProgress = isLast ? 0 : local > 0.7 ? (local - 0.7) / 0.3 : 0;

    // Slide 1 is immediately visible when user reaches the section
    const opacity =
      isFirst && progress < 0.005
        ? 1
        : Math.min(enterProgress, 1 - exitProgress);

    const translateY =
      isFirst && progress < 0.005
        ? 0
        : (1 - enterProgress) * 60 - exitProgress * 60;

    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      transform: `translateY(${translateY}px)`,
      pointerEvents: opacity > 0.05 ? "auto" : "none",
    };
  };

  const positionStyle = animationComplete
    ? "absolute"
    : isFixed
      ? "fixed"
      : "relative";
  const spacerHeight = isFixed ? "100vh" : "0px";

  return (
    <div className="w-full">
      {/* 
        Total height = scroll room (SCROLL_MULTIPLIER × 100vh) + 1 viewport for the pinned panel itself.
        This matches exactly how Community.tsx works.
      */}
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${(SCROLL_MULTIPLIER + 1) * 100}vh` }}
      >
        {/* Spacer — takes up the viewport height while panel is fixed */}
        <div style={{ height: spacerHeight }} aria-hidden="true" />

        {/* Pinned viewport panel */}
        <div
          className="w-full h-screen overflow-hidden"
          style={{
            position: positionStyle,
            top: isFixed ? 0 : "auto",
            bottom: animationComplete ? 0 : "auto",
            left: isFixed || animationComplete ? 0 : "auto",
            right: isFixed || animationComplete ? 0 : "auto",
            zIndex: isFixed ? 50 : 1,
          }}
        >
          {/* Static background — never moves */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, #f0eef8 0%, #e8e4f5 50%, #ede8f7 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "url('/aboutBackground.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>

          {/* ── SLIDE 1 ── visible immediately on mount */}
          <div
            className="absolute inset-0 flex items-center justify-center px-4"
            style={slideStyle(0)}
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-10"
              style={{ backgroundImage: "url('/aboutBackground.png')" }}
            />

            <div className="container mx-auto text-center px-4 py-16 sm:py-24 xl:py-[276px] relative z-10 font-bold">
              <p className="text-[28px] sm:text-[36px] xl:text-[56px] font-medium leading-[36px] sm:leading-[46px] xl:leading-[72px] font-almarai text-[#180426]">
                Breed is intentionally free because we believe
                <br />
                spiritual growth should never sit behind a paywall.
                <br />
                Every{" "}
                <span
                  className="font-almarai text-[28px] sm:text-[36px] xl:text-[56px] leading-[34px] sm:leading-[44px] xl:leading-[68px] px-[2px] rounded-[2px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A] mr-2 sm:mr-3"
                  style={{ backgroundColor: "#ffffff", color: "#5B26B1" }}
                >
                  devotional,
                </span>
                <span
                  className="font-almarai text-[28px] sm:text-[36px] xl:text-[56px] leading-[34px] sm:leading-[44px] xl:leading-[68px] px-[2px] rounded-[2px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A] mr-2 sm:mr-3"
                  style={{ backgroundColor: "#ffffff", color: "#A22F6E" }}
                >
                  community,
                </span>
                <span
                  className="font-almarai text-[28px] sm:text-[36px] xl:text-[56px] leading-[34px] sm:leading-[44px] xl:leading-[68px] px-[2px] rounded-[2px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A] mr-2 sm:mr-3"
                  style={{ backgroundColor: "#ffffff", color: "#34399C" }}
                >
                  mentor,
                </span>
                and{" "}
                <span
                  className="font-almarai text-[28px] sm:text-[36px] xl:text-[56px] leading-[34px] sm:leading-[44px] xl:leading-[68px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A]"
                  style={{ backgroundColor: "#ffffff", color: "#1A8454" }}
                >
                  growth tracker
                </span>{" "}
                exists for one purpose:
              </p>
            </div>
          </div>

          {/* ── SLIDE 2 ── */}
          <div
            className="absolute inset-0 flex items-center justify-center px-4"
            style={slideStyle(1)}
          >
            <div className="container mx-auto text-center font-bold">
              <p className="text-[28px] sm:text-[36px] xl:text-[56px] font-medium leading-[36px] sm:leading-[46px] xl:leading-[72px] font-almarai text-[#4E0A7C]">
                To help believers know{" "}
                <span
                  className="font-almarai text-[28px] sm:text-[36px] xl:text-[56px] leading-[34px] sm:leading-[44px] xl:leading-[68px] px-[2px] rounded-[2px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A]"
                  style={{ backgroundColor: "#ffffff", color: "#870BD6" }}
                >
                  God
                </span>{" "}
                more deeply and walk
                <br />
                boldly in purpose until Jesus returns.{" "}
                <img
                  src="./heroImage.svg"
                  alt="pathway"
                  className="w-4 h-4 sm:w-6 sm:h-6 xl:w-[56px] xl:h-[56px] inline-block align-middle"
                />
              </p>
            </div>
          </div>

          {/* ── SLIDE 3 ── */}
          <div
            className="absolute inset-0 flex items-center justify-center px-4 font-bold"
            style={slideStyle(2)}
          >
            <div className="container mx-auto text-center flex justify-center items-center">
              <p
                className="text-[28px] sm:text-[36px] xl:text-[56px] font-medium leading-[36px] sm:leading-[46px] xl:leading-[72px] font-almarai"
                style={{ color: "#4E0A7C" }}
              >
                This isn&apos;t about scale...
              </p>
            </div>
          </div>

          {/* ── SLIDE 4 ── stays visible, never exits */}
          <div
            className="absolute inset-0 flex items-center justify-center px-4"
            style={slideStyle(3)}
          >
            <div className="container mx-auto text-center max-w-2xl flex flex-col items-center gap-3 font-bold px-2 sm:px-0">
              <p
                className="text-[18px] sm:text-[22px] xl:text-[28px] font-medium leading-[24px] sm:leading-[28px] xl:leading-[32px] font-almarai"
                style={{ color: "#4E0A7C" }}
              >
                This isn&apos;t about{" "}
                <span className="line-through">scale</span>...
              </p>

              <p className="text-[34px] sm:text-[44px] xl:text-[56px] font-bold leading-[42px] sm:leading-[56px] xl:leading-[72px] font-almarai text-[#4E0A7C]">
                It&apos;s about{" "}
                <span
                  className="text-[34px] sm:text-[44px] xl:text-[56px] leading-[40px] sm:leading-[52px] xl:leading-[68px] px-3 py-1 rounded-[2px] text-white inline-block font-almarai shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A]"
                  style={{ background: "#A119F6" }}
                >
                  souls.
                </span>
              </p>
            </div>
          </div>

          {/* Scroll hint — fades out after first scroll */}
          <div
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{
              opacity: progress < 0.04 ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          >
            <div className="w-px h-6 bg-[#180426] opacity-25 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
