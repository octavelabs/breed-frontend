// "use client";

// import { ChevronRight } from "lucide-react";
// import React, { useEffect, useState, useRef, useCallback } from "react";

// /**
//  * TheGreatCommission Component
//  *
//  * This component implements a scroll-based animation where:
//  * 1. When scrolling down and the component enters the viewport, it becomes fixed
//  * 2. While fixed, the phone image scales down and moves right, text fades in
//  * 3. Once animation completes, it stays in final position and allows normal scrolling
//  * 4. Scrolling back up reverses the animation smoothly
//  *
//  * Key implementation details:
//  * - Uses IntersectionObserver for efficient viewport detection
//  * - Tracks scroll direction to handle forward/reverse animations
//  * - Uses a spacer div to maintain document flow when content is fixed
//  * - Calculates scroll progress based on container position relative to viewport
//  */

// export default function TheGreatCommission() {
//   const [isFixed, setIsFixed] = useState<boolean>(false);
//   const [scrollProgress, setScrollProgress] = useState<number>(0);
//   const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");
//   const [animationComplete, setAnimationComplete] = useState<boolean>(false);

//   const containerRef = useRef<HTMLDivElement>(null);
//   const contentRef = useRef<HTMLDivElement>(null);
//   const lastScrollY = useRef<number>(0);
//   const animationFrameId = useRef<number | null>(null);

//   const ANIMATION_SCROLL_DISTANCE = 1;

//   const updateScrollDirection = useCallback(() => {
//     const currentScrollY = window.scrollY;
//     if (currentScrollY > lastScrollY.current) {
//       setScrollDirection("down");
//     } else if (currentScrollY < lastScrollY.current) {
//       setScrollDirection("up");
//     }
//     lastScrollY.current = currentScrollY;
//   }, []);

//   const handleScroll = useCallback(() => {
//     if (!containerRef.current) return;

//     if (animationFrameId.current) {
//       cancelAnimationFrame(animationFrameId.current);
//     }

//     animationFrameId.current = requestAnimationFrame(() => {
//       if (!containerRef.current) return;

//       updateScrollDirection();

//       const containerRect = containerRef.current.getBoundingClientRect();
//       const viewportHeight = window.innerHeight;
//       const containerTop = containerRect.top;
//       const containerHeight = containerRef.current.offsetHeight;

//       const shouldBeFixed =
//         containerTop <= 0 && containerTop + containerHeight > viewportHeight;

//       const scrolledPastTop = -containerTop;
//       const maxScrollDistance = viewportHeight * ANIMATION_SCROLL_DISTANCE;
//       const progress = Math.min(
//         Math.max(scrolledPastTop / maxScrollDistance, 0),
//         1,
//       );

//       const isComplete = !shouldBeFixed && progress >= 1;

//       setIsFixed(shouldBeFixed);
//       setScrollProgress(progress);
//       setAnimationComplete(isComplete);
//     });
//   }, [updateScrollDirection]);

//   useEffect(() => {
//     lastScrollY.current = window.scrollY;

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     handleScroll();

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//       if (animationFrameId.current) {
//         cancelAnimationFrame(animationFrameId.current);
//       }
//     };
//   }, [handleScroll]);

//   const activeProgress = animationComplete ? 1 : scrollProgress;

//   const imageWidthPercent = 100 - activeProgress * 52;
//   const imageTranslateX = activeProgress * 54;
//   const imageBorderRadius = activeProgress * 40;
//   const visionOpacity = activeProgress;
//   const containerPadding = activeProgress * 90;

//   const spacerHeight = isFixed ? "100vh" : "0px";

//   // KEY FIX: When animation is complete, position at bottom of container
//   const positionStyle = animationComplete
//     ? "absolute"
//     : isFixed
//       ? "fixed"
//       : "relative";
//   const topStyle = animationComplete ? "auto" : isFixed ? 0 : "auto";
//   const bottomStyle = animationComplete ? 0 : "auto";

//   return (
//     <div className="w-full font-sans mb-8">
//       <div
//         ref={containerRef}
//         className="relative"
//         style={{ height: `${100 + ANIMATION_SCROLL_DISTANCE * 100}vh` }}
//       >
//         <div style={{ height: spacerHeight }} aria-hidden="true" />

//         <div
//           ref={contentRef}
//           className="w-full h-screen overflow-hidden"
//           style={{
//             position: positionStyle,
//             top: topStyle,
//             bottom: bottomStyle,
//             left: isFixed || animationComplete ? 0 : "auto",
//             right: isFixed || animationComplete ? 0 : "auto",
//             zIndex: isFixed ? 50 : 1,
//             willChange: "transform",
//           }}
//         >
//           <div
//             className="relative w-full h-full flex items-center bg-[#F4E3FE]"
//             style={{
//               padding: `${containerPadding}px`,
//               gap: `${activeProgress * 24}px`,
//             }}
//           >
//             <div
//               className="h-full flex items-center shrink-0"
//               style={{
//                 opacity: visionOpacity,
//                 width: `${activeProgress * 45}%`,
//                 paddingLeft: `${activeProgress * 32}px`,
//                 paddingRight: `${activeProgress * 16}px`,
//                 willChange: "opacity, width",
//               }}
//             >
//               <div className="max-w-xl w-full">
//                 <div className="inline-block px-5 py-[6px] border border-[#161717] rounded-full text-sm xl:text-base  mb-7 text-[#161717] bg-[#E7C8FF]">
//                   Our Vision
//                 </div>

//                 <h1 className="text-[32px] lg:text-[50px] font-[700] text-[#180426] mb-6 font-aeonik leading-tight">
//                   The Great Commission
//                 </h1>

//                 <p className="text-sm md:text-[18px] leading-relaxed text-[#4E5255] mb-8">
//                   At Breed, we believe growth in God shouldn't be left to
//                   chance. That's why we've created a space where believers can
//                   be intentional about their faith every single day. From
//                   devotionals to prayer structures, discipleship to community,
//                   Breed helps you stay rooted, consistent, and purpose-driven in
//                   your walk with Christ.
//                 </p>

//                 <button className="flex items-center font-[700] justify-between gap-2 px-[28px] py-[18px] w-[200px] border-[1.5px] border-[#5B26B1] rounded-full text-sm transition bg-[#FBF6FF] text-[#5B26B1]">
//                   Read our story
//                   <div className="w-5 h-5 bg-gradient-to-r from-[#A967F1] to-[#5B26B1] rounded-full flex items-center justify-center">
//                     <ChevronRight size={12} stroke="#FFFFFF" />
//                   </div>
//                 </button>

//                 <div className="mt-8 md:mt-10 text-[40px] md:text-3xl xl:text-[68px] text-[#180426] italic font-mono">
//                   Matthew 28:16-20
//                 </div>
//               </div>
//             </div>

//             <div
//               className="h-full flex-1 overflow-hidden shadow-2xl"
//               style={{
//                 borderRadius: `${imageBorderRadius}px`,
//                 willChange: "border-radius",
//               }}
//             >
//               <div
//                 className="w-full h-full bg-cover bg-no-repeat bg-center"
//                 style={{ backgroundImage: `url('/ValueProposition.png')` }}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { ChevronRight } from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";

export default function TheGreatCommission() {
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);

  const ANIMATION_SCROLL_DISTANCE = 1;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // const updateScrollDirection = useCallback(() => {
  //   const currentScrollY = window.scrollY;
  //   if (currentScrollY > lastScrollY.current) {
  //     setScrollDirection("down");
  //   } else if (currentScrollY < lastScrollY.current) {
  //     setScrollDirection("up");
  //   }
  //   lastScrollY.current = currentScrollY;
  // }, []);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isMobile) return;

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    animationFrameId.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      // updateScrollDirection();

      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const containerTop = containerRect.top;
      const containerHeight = containerRef.current.offsetHeight;

      const shouldBeFixed =
        containerTop <= 0 && containerTop + containerHeight > viewportHeight;

      const scrolledPastTop = -containerTop;
      const maxScrollDistance = viewportHeight * ANIMATION_SCROLL_DISTANCE;
      const progress = Math.min(
        Math.max(scrolledPastTop / maxScrollDistance, 0),
        1,
      );

      const isComplete = !shouldBeFixed && progress >= 1;

      setIsFixed(shouldBeFixed);
      setScrollProgress(progress);
      setAnimationComplete(isComplete);
    });
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    
    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleScroll, isMobile]);

  const activeProgress = animationComplete ? 1 : scrollProgress;

  const imageWidthPercent = 100 - activeProgress * 52;
  const imageTranslateX = activeProgress * 54;
  const imageBorderRadius = activeProgress * 40;
  const visionOpacity = activeProgress;
  const containerPadding = activeProgress * 90;

  const spacerHeight = isFixed ? "100vh" : "0px";

  const positionStyle = animationComplete
    ? "absolute"
    : isFixed
      ? "fixed"
      : "relative";
  const topStyle = animationComplete ? "auto" : isFixed ? 0 : "auto";
  const bottomStyle = animationComplete ? 0 : "auto";

  // Mobile render
  if (isMobile) {
    return (
      <div className="w-full font-sans mb-8">
        <div className="bg-[#F4E3FE] px-4 py-8">
          {/* Image Section - Fixed height 224px */}
          <div className="w-full h-[224px] rounded-[24px] overflow-hidden shadow-lg mb-6">
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('/ValueProposition.png')` }}
            />
          </div>

          {/* Content Section Below */}
          <div className="w-full">
            <div className="inline-block px-4 py-[6px] border border-[#161717] rounded-full text-sm mb-4 text-[#161717] bg-[#E7C8FF]">
              Our Vision
            </div>

            <h1 className="text-[32px] font-[700] text-[#180426] mb-4 font-aeonik leading-tight">
              The Great Commission
            </h1>

            <p className="text-[16px] leading-relaxed text-[#4E5255] mb-6">
              At Breed, we believe growth in God shouldn't be left to
              chance. That's why we've created a space where believers can
              be intentional about their faith every single day. From
              devotionals to prayer structures, discipleship to community,
              Breed helps you stay rooted, consistent, and purpose-driven in
              your walk with Christ.
            </p>

            <button className="flex items-center font-[800] justify-between gap-2 px-6 py-4 w-[70%] md:w-[200px] border-[1.5px] border-[#5B26B1] rounded-full text-sm transition bg-[#FBF6FF] text-[#5B26B1]">
              Read our story
              <div className="w-5 h-5 bg-gradient-to-r from-[#A967F1] to-[#5B26B1] rounded-full flex items-center justify-center">
                <ChevronRight size={12} stroke="#FFFFFF" />
              </div>
            </button>

            <div className="mt-6 text-[40px] text-[#180426] italic font-mono">
              Matthew 28:16-20
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop render (original animation)
  return (
    <div className="w-full font-sans mb-8">
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${100 + ANIMATION_SCROLL_DISTANCE * 100}vh` }}
      >
        <div style={{ height: spacerHeight }} aria-hidden="true" />

        <div
          ref={contentRef}
          className="w-full h-screen overflow-hidden"
          style={{
            position: positionStyle,
            top: topStyle,
            bottom: bottomStyle,
            left: isFixed || animationComplete ? 0 : "auto",
            right: isFixed || animationComplete ? 0 : "auto",
            zIndex: isFixed ? 50 : 1,
            willChange: "transform",
          }}
        >
          <div
            className="relative w-full h-full flex items-center bg-[#F4E3FE]"
            style={{
              padding: `${containerPadding}px`,
              gap: `${activeProgress * 24}px`,
            }}
          >
            <div
              className="h-full flex items-center shrink-0"
              style={{
                opacity: visionOpacity,
                width: `${activeProgress * 45}%`,
                paddingLeft: `${activeProgress * 32}px`,
                paddingRight: `${activeProgress * 16}px`,
                willChange: "opacity, width",
              }}
            >
              <div className="max-w-xl w-full">
                <div className="inline-block px-5 py-[6px] border border-[#161717] rounded-full text-base mb-7 text-[#161717] bg-[#E7C8FF]">
                  Our Vision
                </div>

                <h1 className="text-[32px] lg:text-[40px] font-[700] text-[#180426] mb-6 font-aeonik leading-tight">
                  The Great Commission
                </h1>

                <p className="text-sm md:text-[18px] leading-relaxed text-[#4E5255] mb-8">
                  At Breed, we believe growth in God shouldn't be left to
                  chance. That's why we've created a space where believers can
                  be intentional about their faith every single day. From
                  devotionals to prayer structures, discipleship to community,
                  Breed helps you stay rooted, consistent, and purpose-driven in
                  your walk with Christ.
                </p>

                <button className="flex items-center font-[800] justify-between gap-2 px-[28px] py-[18px] w-[200px] border-[1.5px] border-[#5B26B1] rounded-full text-sm transition bg-[#FBF6FF] text-[#5B26B1]">
                  Read our story
                  <div className="w-5 h-5 bg-gradient-to-r from-[#A967F1] to-[#5B26B1] rounded-full flex items-center justify-center">
                    <ChevronRight size={12} stroke="#FFFFFF" />
                  </div>
                </button>

                <div className="mt-8 md:mt-10 text-[40px] xl:text-[60px] text-[#180426] italic font-mono">
                  Matthew 28:16-20
                </div>
              </div>
            </div>

            <div
              className="h-full flex-1 overflow-hidden shadow-2xl"
              style={{
                borderRadius: `${imageBorderRadius}px`,
                willChange: "border-radius",
              }}
            >
              <div
                className="w-full h-full bg-cover bg-no-repeat bg-center"
                style={{ backgroundImage: `url('/ValueProposition.png')` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}