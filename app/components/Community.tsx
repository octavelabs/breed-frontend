"use client";

// import React, { useEffect, useState, useRef, useCallback } from 'react';

// export default function Community() {
//   const [scrollProgress, setScrollProgress] = useState<number>(0);
//   const [isFixed, setIsFixed] = useState<boolean>(false);
//   const [animationComplete, setAnimationComplete] = useState<boolean>(false);

//   const containerRef = useRef<HTMLDivElement>(null);
//   const animationFrameId = useRef<number | null>(null);

//   // Define animation stages
//   const ANIMATION_STAGES = {
//     IMAGE_ZOOM: 0.3,      // 0-0.3: Image zooms from center
//     TEXT_APPEAR: 0.6,     // 0.3-0.6: Text appears word by word
//     TEXT_SCROLL: 1.0      // 0.6-1.0: Right side text scrolls
//   };

//   const handleScroll = useCallback(() => {
//     if (!containerRef.current) return;

//     if (animationFrameId.current) {
//       cancelAnimationFrame(animationFrameId.current);
//     }

//     animationFrameId.current = requestAnimationFrame(() => {
//       if (!containerRef.current) return;

//       const containerRect = containerRef.current.getBoundingClientRect();
//       const viewportHeight = window.innerHeight;
//       const containerTop = containerRect.top;
//       const containerHeight = containerRef.current.offsetHeight;

//       const shouldBeFixed = containerTop <= 0 && (containerTop + containerHeight) > viewportHeight;

//       const scrolledPastTop = -containerTop;
//       const maxScrollDistance = viewportHeight * 2; // 2 viewport heights for full animation
//       const progress = Math.min(Math.max(scrolledPastTop / maxScrollDistance, 0), 1);

//       const isComplete = !shouldBeFixed && progress >= 1;

//       setIsFixed(shouldBeFixed);
//       setScrollProgress(progress);
//       setAnimationComplete(isComplete);
//     });
//   }, []);

//   useEffect(() => {
//     window.addEventListener('scroll', handleScroll, { passive: true });
//     handleScroll();

//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//       if (animationFrameId.current) {
//         cancelAnimationFrame(animationFrameId.current);
//       }
//     };
//   }, [handleScroll]);

//   const activeProgress = animationComplete ? 1 : scrollProgress;

//   // Image zoom animation (0-0.3 progress)
//   const imageScale = activeProgress <= ANIMATION_STAGES.IMAGE_ZOOM
//     ? 0.3 + (activeProgress / ANIMATION_STAGES.IMAGE_ZOOM) * 0.7
//     : 1;

//   // Text appearance animation (0.3-0.6 progress)
//   const textProgress = Math.max(0, Math.min(
//     (activeProgress - ANIMATION_STAGES.IMAGE_ZOOM) / (ANIMATION_STAGES.TEXT_APPEAR - ANIMATION_STAGES.IMAGE_ZOOM),
//     1
//   ));

//   // Right side text scroll animation (0.6-1.0 progress)
//   const rightTextProgress = Math.max(0, Math.min(
//     (activeProgress - ANIMATION_STAGES.TEXT_APPEAR) / (ANIMATION_STAGES.TEXT_SCROLL - ANIMATION_STAGES.TEXT_APPEAR),
//     1
//   ));

//   // Calculate which words should be visible
//   const titleWords = ["AND", "THE", "GOAL", "TO", "MAKE", "HEAVEN"];
//   const visibleWordCount = Math.floor(textProgress * titleWords.length);

//   const spacerHeight = isFixed ? '100vh' : '0px';
//   const positionStyle = animationComplete ? 'absolute' : (isFixed ? 'fixed' : 'relative');
//   const bottomStyle = animationComplete ? 0 : 'auto';

//   // Floating images data
//   const floatingImages = [
//     { id: 1, top: '5%', left: '5%', size: 120 },
//     { id: 2, top: '8%', left: '40%', size: 150 },
//     { id: 3, top: '5%', right: '8%', size: 100 },
//     { id: 4, top: '35%', left: '12%', size: 130 },
//     { id: 5, top: '30%', right: '15%', size: 110 },
//     { id: 6, top: '65%', left: '8%', size: 140 },
//     { id: 7, top: '70%', left: '20%', size: 100 },
//     { id: 8, top: '72%', right: '12%', size: 120 },
//   ];

//   return (
//     <div className="w-full font-sans">
//       <div
//         ref={containerRef}
//         className="relative"
//         style={{ height: '300vh' }}
//       >
//         <div style={{ height: spacerHeight }} aria-hidden="true" />

//         <div
//           className="w-full h-screen overflow-hidden"
//           style={{
//             position: positionStyle,
//             top: isFixed ? 0 : 'auto',
//             bottom: bottomStyle,
//             left: isFixed || animationComplete ? 0 : 'auto',
//             right: isFixed || animationComplete ? 0 : 'auto',
//             zIndex: isFixed ? 50 : 1,
//           }}
//         >
//           {/* Main container */}
//           <div className="relative w-full h-full bg-white overflow-hidden">

//             {/* Floating images around the edges */}
//             {activeProgress < ANIMATION_STAGES.TEXT_APPEAR && floatingImages.map((img) => (
//               <div
//                 key={img.id}
//                 className="absolute rounded-lg overflow-hidden shadow-md transition-opacity duration-500"
//                 style={{
//                   top: img.top,
//                   left: img.left,
//                   right: img.right,
//                   width: `${img.size}px`,
//                   height: `${img.size}px`,
//                   opacity: 1 - textProgress,
//                 }}
//               >
//                 <div className="w-full h-full bg-gradient-to-br from-purple-200 to-purple-400" />
//               </div>
//             ))}

//             {/* Center content */}
//             <div className="absolute inset-0 flex flex-col items-center justify-center">

//               {/* Badge - visible before text animation */}
//               {textProgress === 0 && (
//                 <div
//                   className="inline-block px-6 py-2 border-2 rounded-full text-sm font-semibold mb-12 transition-opacity duration-500"
//                   style={{
//                     borderColor: '#9333ea',
//                     color: '#9333ea',
//                     opacity: 1 - textProgress
//                   }}
//                 >
//                   Lorem ipsum
//                 </div>
//               )}

//               {/* Main title - appears word by word */}
//               <h1 className="text-5xl md:text-7xl font-bold text-gray-900 text-center mb-8 px-4">
//                 {titleWords.slice(0, visibleWordCount).map((word, index) => (
//                   <span
//                     key={index}
//                     className="inline-block mr-4 animate-fadeIn"
//                     style={{
//                       animation: `fadeIn 0.3s ease-in forwards`,
//                       animationDelay: `${index * 0.1}s`
//                     }}
//                   >
//                     {word}
//                   </span>
//                 ))}
//               </h1>

//               {/* Subtitle - appears after title */}
//               {textProgress > 0.8 && (
//                 <p
//                   className="text-base md:text-lg text-gray-700 text-center max-w-3xl px-8 animate-fadeIn"
//                   style={{
//                     opacity: (textProgress - 0.8) / 0.2
//                   }}
//                 >
//                   Connect deeply with believers who share your passion for growing in faith.
//                   Whether you're looking for encouragement, meaningful conversations, or prayer
//                   support, Breed brings you closer to a vibrant, Spirit-led community.
//                 </p>
//               )}
//             </div>

//             {/* Center image that zooms out */}
//             <div
//               className="absolute inset-0 flex items-center justify-center pointer-events-none"
//               style={{
//                 transform: `scale(${imageScale})`,
//                 transition: 'transform 0.1s ease-out'
//               }}
//             >
//               <div className="relative w-full h-full max-w-6xl max-h-4xl">
//                 <div
//                   className="w-full h-full bg-cover bg-center"
//                   style={{
//                     backgroundImage: "url('data:image/svg+xml,%3Csvg width='1200' height='800' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%239333ea;stop-opacity:1' /%3E%3Cstop offset='50%25' style='stop-color:%23a855f7;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23f5d0fe;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23grad)' /%3E%3Cpath d='M600 200 L700 250 L650 350 L500 350 L450 250 Z' fill='white' opacity='0.5' /%3E%3Cellipse cx='600' cy='500' rx='150' ry='100' fill='white' opacity='0.3' /%3E%3C/svg%3E')"
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Right side verse text - scrolls up */}
//             {activeProgress > ANIMATION_STAGES.TEXT_APPEAR && (
//               <div className="absolute right-8 md:right-16 top-0 bottom-0 flex items-center">
//                 <div
//                   className="max-w-md text-white space-y-6 transition-transform duration-300"
//                   style={{
//                     transform: `translateY(${-rightTextProgress * 30}%)`
//                   }}
//                 >
//                   <div className="text-sm font-semibold mb-4 opacity-90">
//                     Revelation 21:3-4 KJV
//                   </div>

//                   <p className="text-lg md:text-xl leading-relaxed">
//                     <span style={{ opacity: Math.min(1, rightTextProgress * 3) }}>
//                       AND I HEARD A GREAT VOICE OUT OF HEAVEN SAYING, BEHOLD, THE TABERNACLE OF
//                       GOD IS WITH MEN, AND HE WILL DWELL WITH THEM, AND THEY SHALL BE HIS PEOPLE,
//                       AND GOD HIMSELF SHALL BE WITH THEM, AND BE THEIR GOD.
//                     </span>
//                   </p>

//                   <p
//                     className="text-base md:text-lg leading-relaxed"
//                     style={{
//                       opacity: Math.max(0, (rightTextProgress - 0.3) * 2)
//                     }}
//                   >
//                     AND GOD SHALL WIPE AWAY ALL TEARS FROM THEIR EYES; AND THERE SHALL BE NO MORE
//                     DEATH, NEITHER SORROW, NOR CRYING, NEITHER SHALL THERE BE ANY MORE PAIN; FOR THE
//                     FORMER THINGS ARE PASSED AWAY.
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

import React, { useEffect, useState, useRef, useCallback } from "react";

export default function Community() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Define animation stages
  const ANIMATION_STAGES = {
    IMAGE_ZOOM: 0.25, // 0-0.25: Image zooms from center to full screen
    TEXT_APPEAR: 0.65, // 0.25-0.65: Background shows, text appears word by word
    TEXT_SCROLL: 1.0, // 0.65-1.0: Right side text scrolls
  };

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    animationFrameId.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const containerTop = containerRect.top;
      const containerHeight = containerRef.current.offsetHeight;

      const shouldBeFixed =
        containerTop <= 0 && containerTop + containerHeight > viewportHeight;

      const scrolledPastTop = -containerTop;
      const maxScrollDistance = viewportHeight * 2.5;
      const progress = Math.min(
        Math.max(scrolledPastTop / maxScrollDistance, 0),
        1,
      );

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
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleScroll]);

  const activeProgress = animationComplete ? 1 : scrollProgress;

  // Image zoom animation (0-0.25 progress) - scales from small to full screen
  const imageScale =
    activeProgress <= ANIMATION_STAGES.IMAGE_ZOOM
      ? 0.1 + (activeProgress / ANIMATION_STAGES.IMAGE_ZOOM) * 0.9
      : 1;

  const imageOpacity = activeProgress <= ANIMATION_STAGES.IMAGE_ZOOM ? 1 : 0;

  // Text appearance animation (0.25-0.65 progress)
  const textProgress = Math.max(
    0,
    Math.min(
      (activeProgress - ANIMATION_STAGES.IMAGE_ZOOM) /
        (ANIMATION_STAGES.TEXT_APPEAR - ANIMATION_STAGES.IMAGE_ZOOM),
      1,
    ),
  );

  // Right side text scroll animation (0.65-1.0 progress)
  const rightTextProgress = Math.max(
    0,
    Math.min(
      (activeProgress - ANIMATION_STAGES.TEXT_APPEAR) /
        (ANIMATION_STAGES.TEXT_SCROLL - ANIMATION_STAGES.TEXT_APPEAR),
      1,
    ),
  );

  // Calculate which words should be visible
  const titleWords = ["AND", "THE", "GOAL", "TO", "MAKE", "HEAVEN"];
  const visibleWordCount = Math.floor(textProgress * titleWords.length);

  // Show initial content (stage 1) only when progress is very low
  const showInitialContent = activeProgress < 0.1;

  const spacerHeight = isFixed ? "100vh" : "0px";
  const positionStyle = animationComplete
    ? "absolute"
    : isFixed
      ? "fixed"
      : "relative";
  const bottomStyle = animationComplete ? 0 : "auto";

  // Floating images data
  const floatingImages = [
    { id: 1, top: "5%", left: "5%", size: 120, photo: "./community1.png" },
    { id: 2, top: "8%", left: "40%", size: 150, photo: "./community2.png" },
    { id: 3, top: "5%", right: "8%", size: 100, photo: "./community3.png" },
    { id: 4, top: "35%", left: "0%", size: 130, photo: "./community4.png" },
    { id: 5, top: "30%", right: "0%", size: 110, photo: "./community5.png" },
    { id: 6, top: "65%", left: "8%", size: 140, photo: "./community6.png" },
    { id: 7, top: "80%", left: "50%", size: 100, photo: "./community7.png" },
    { id: 8, top: "72%", right: "12%", size: 120, photo: "./community8.png" },
  ];

  return (
    <div className="w-full font-sans">
      <div ref={containerRef} className="relative" style={{ height: "350vh" }}>
        <div style={{ height: spacerHeight }} aria-hidden="true" />

        <div
          className="w-full h-screen overflow-hidden"
          style={{
            position: positionStyle,
            top: isFixed ? 0 : "auto",
            bottom: bottomStyle,
            left: isFixed || animationComplete ? 0 : "auto",
            right: isFixed || animationComplete ? 0 : "auto",
            zIndex: isFixed ? 50 : 1,
          }}
        >
          {/* Main container */}
          <div className="relative w-full h-full bg-[#F7EDFE] overflow-hidden">
            {/* Stage 1: Initial content with floating images and title */}
            {showInitialContent && (
              <>
                {/* Floating images around the edges */}
                {floatingImages.map((img) => (
                  <div
                    key={img.id}
                    className="absolute rounded-lg overflow-hidden shadow-md"
                    style={{
                      top: img.top,
                      left: img.left,
                      right: img.right,
                      width: `${img.size}px`,
                      height: `${img.size}px`,
                    }}
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={img.photo}
                    />
                  </div>
                ))}

                {/* Center content - Stage 1 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
                  <div
                    className="inline-block px-6 py-2 border-2 rounded-full text-sm font-semibold mb-8"
                    style={{
                      borderColor: "#9333ea",
                      color: "#9333ea",
                    }}
                  >
                    Lorem ipsum
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold text-[#101828] font-aeonik text-center mb-8">
                    A real sense of community
                  </h1>

                  <p className="text-base md:text-lg text-gray-700 text-center max-w-3xl leading-relaxed">
                    Connect deeply with believers who share your passion for
                    growing in faith. Whether you're looking for encouragement,
                    meaningful conversations, or prayer support, Breed brings
                    you closer to a vibrant, Spirit-led community.
                  </p>
                </div>
              </>
            )}

            {/* Stage 2: Image zooming from center */}
            {activeProgress >= 0.05 &&
              activeProgress <= ANIMATION_STAGES.IMAGE_ZOOM && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `scale(${imageScale})`,
                    opacity: imageOpacity,
                    transition: "opacity 0.3s ease-out",
                  }}
                >
                  <div className="relative w-full h-full">
                    <img
                      src="./heaven.png"
                      alt="Community"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

            {/* Stage 3: Background gradient with text appearing word by word */}
            {activeProgress > ANIMATION_STAGES.IMAGE_ZOOM && (
              <>
                {/* Center content - Word by word title */}
                <div
                  className="absolute inset-0 flex items-center justify-start px-8"
                  style={{ backgroundImage: `url('/heaven.png')` }}
                >
                  <h1 className="text-5xl md:text-[50px] font-bold text-white ">
                    {titleWords
                      .slice(0, visibleWordCount)
                      .map((word, index) => (
                        <span
                          key={index}
                          className="inline-block mr-4 animate-fadeIn"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                          }}
                        >
                          {word}
                        </span>
                      ))}
                  </h1>
                </div>
              </>
            )}

            {/* Stage 4: Right side verse text - scrolls up */}
            {activeProgress > ANIMATION_STAGES.TEXT_APPEAR && (
              <div className="absolute right-8 md:right-16 top-0 bottom-0 flex items-center">
                <div
                  className="max-w-md text-white space-y-6 transition-transform duration-300"
                  style={{
                    transform: `translateY(${-rightTextProgress * 30}%)`,
                  }}
                >
                  <div className="text-sm font-semibold mb-4 opacity-90">
                    Revelation 21:3-4 KJV
                  </div>

                  <p className="text-lg md:text-[15px] leading-relaxed font-[700]">
                    <span
                      style={{ opacity: Math.min(1, rightTextProgress * 3) }}
                    >
                      AND I HEARD A GREAT VOICE OUT OF HEAVEN SAYING, BEHOLD,
                      THE TABERNACLE OF GOD IS WITH MEN, AND HE WILL DWELL WITH
                      THEM, AND THEY SHALL BE HIS PEOPLE, AND GOD HIMSELF SHALL
                      BE WITH THEM, AND BE THEIR GOD.
                    </span>
                  </p>

                  <p
                    className="text-base md:text-[15px] leading-relaxed font-[700]"
                    style={{
                      opacity: Math.max(0, (rightTextProgress - 0.3) * 2),
                    }}
                  >
                    AND GOD SHALL WIPE AWAY ALL TEARS FROM THEIR EYES; AND THERE
                    SHALL BE NO MORE DEATH, NEITHER SORROW, NOR CRYING, NEITHER
                    SHALL THERE BE ANY MORE PAIN; FOR THE FORMER THINGS ARE
                    PASSED AWAY.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
