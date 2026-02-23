"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export default function Community() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isFixed, setIsFixed] = useState<boolean>(false);
  const [animationComplete, setAnimationComplete] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Define animation stages
  const ANIMATION_STAGES = {
    IMAGE_ZOOM: 0.25,
    TEXT_APPEAR: 0.65,
    TEXT_SCROLL: 1.0,
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

  const imageScale =
    activeProgress <= ANIMATION_STAGES.IMAGE_ZOOM
      ? 0.1 + (activeProgress / ANIMATION_STAGES.IMAGE_ZOOM) * 0.9
      : 1;

  const imageOpacity = activeProgress <= ANIMATION_STAGES.IMAGE_ZOOM ? 1 : 0;

  const textProgress = Math.max(
    0,
    Math.min(
      (activeProgress - ANIMATION_STAGES.IMAGE_ZOOM) /
        (ANIMATION_STAGES.TEXT_APPEAR - ANIMATION_STAGES.IMAGE_ZOOM),
      1,
    ),
  );

  const rightTextProgress = Math.max(
    0,
    Math.min(
      (activeProgress - ANIMATION_STAGES.TEXT_APPEAR) /
        (ANIMATION_STAGES.TEXT_SCROLL - ANIMATION_STAGES.TEXT_APPEAR),
      1,
    ),
  );

  const titleWords = ["AND", "THE", "GOAL", "TO", "MAKE", "HEAVEN"];
  const visibleWordCount = Math.floor(textProgress * titleWords.length);

  const showInitialContent = activeProgress < 0.1;

  const spacerHeight = isFixed ? "100vh" : "0px";
  const positionStyle = animationComplete
    ? "absolute"
    : isFixed
      ? "fixed"
      : "relative";
  const bottomStyle = animationComplete ? 0 : "auto";

  const floatingImages = [
    { id: 1, top: "5%", left: "5%", size: 120, photo: "/community1.png" },
    { id: 2, top: "8%", left: "40%", size: 150, photo: "/community2.png" },
    { id: 3, top: "5%", right: "8%", size: 100, photo: "/community3.png" },
    { id: 4, top: "35%", left: "0%", size: 130, photo: "/community4.png" },
    { id: 5, top: "30%", right: "0%", size: 110, photo: "/community5.png" },
    { id: 6, top: "65%", left: "8%", size: 140, photo: "/community6.png" },
    { id: 7, top: "80%", left: "50%", size: 100, photo: "/community7.png" },
    { id: 8, top: "72%", right: "12%", size: 120, photo: "/community8.png" },
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
                      width: isMobile ? `${img.size * 0.6}px` : `${img.size}px`,
                      height: isMobile ? `${img.size * 0.6}px` : `${img.size}px`,
                    }}
                  >
                    <img
                      className="w-full h-full object-cover"
                      src={img.photo}
                      alt=""
                    />
                  </div>
                ))}

                {/* Center content - Stage 1 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-8">
                  <div
                    className="inline-block px-4 md:px-6 py-2 border-2 rounded-full text-xs md:text-sm font-semibold mb-4 md:mb-8"
                    style={{
                      borderColor: "#9333ea",
                      color: "#9333ea",
                    }}
                  >
                    Breed is free to use
                  </div>

                  <h1 className="text-[24px] leading-[32px] md:text-[20px] md:leading-[40px] xl:text-[58px] xl:leading-[72px] font-bold text-[#101828] font-aeonik text-center mb-4 md:mb-8">
                    A real sense of community
                  </h1>

                  <p className="text-sm xl:text-lg text-[#4E5255] text-center max-w-sm md:max-w-3xl leading-relaxed px-4">
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
                      src="/Heaven.png"
                      alt="Community"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

            {/* Stage 3: Background gradient with text appearing word by word */}
            {activeProgress > ANIMATION_STAGES.IMAGE_ZOOM && (
              <>
                {/* Desktop: Text on left side */}
                <div
                  className="absolute inset-0 hidden md:flex items-center justify-start px-8"
                  style={{ 
                    backgroundImage: "url('/Heaven.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <h1 className="text-[36px] xl:text-[50px] font-bold text-white">
                    {titleWords
                      .slice(0, visibleWordCount)
                      .map((word, index) => (
                        <span
                          key={index}
                          className="inline-block mr-4 animate-fadeIn font-aeonik"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                          }}
                        >
                          {word}
                        </span>
                      ))}
                  </h1>
                </div>

                {/* Mobile: Text stacked vertically */}
                <div
                  className="absolute inset-0 flex md:hidden flex-col justify-center px-6 py-8"
                  style={{ 
                    backgroundImage: `url('/Heaven.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <h1 className="text-[28px] leading-[36px] font-bold text-white mb-6 font-aeonik">
                    {titleWords
                      .slice(0, visibleWordCount)
                      .map((word, index) => (
                        <span
                          key={index}
                          className="inline-block mr-3 animate-fadeIn"
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

            {/* Stage 4: Text content */}
            {activeProgress > ANIMATION_STAGES.TEXT_APPEAR && (
              <>
                {/* Desktop: Right side verse text - scrolls up */}
                <div className="absolute right-8 md:right-16 top-0 bottom-0 hidden lg:flex items-center">
                  <div
                    className="max-w-md text-white space-y-6 transition-transform duration-300"
                    style={{
                      transform: `translateY(${-rightTextProgress * 30}%)`,
                    }}
                  >
                    <div className="text-sm font-semibold mb-4 opacity-90">
                      Revelation 21:3-4 KJV
                    </div>

                    <p className="text-[15px] leading-relaxed font-[700] font-aeonik">
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
                      className="text-[15px] leading-relaxed font-[700] font-aeonik"
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

                {/* Mobile: Stacked verse text - fades in */}
                <div className="absolute inset-x-0 bottom-0 flex lg:hidden flex-col px-6 pb-8 space-y-4">
                  <div
                    className="text-white space-y-4"
                    style={{
                      opacity: Math.min(1, rightTextProgress * 2),
                    }}
                  >
                    <div className="text-xs font-semibold opacity-90">
                      Revelation 21:3-4 KJV
                    </div>

                    <p className="text-[14px] leading-relaxed font-[700] font-aeonik">
                      AND I HEARD A GREAT VOICE OUT OF HEAVEN SAYING, BEHOLD,
                      THE TABERNACLE OF GOD IS WITH MEN, AND HE WILL DWELL WITH
                      THEM, AND THEY SHALL BE HIS PEOPLE, AND GOD HIMSELF SHALL
                      BE WITH THEM, AND BE THEIR GOD.
                    </p>

                    <p
                      className="text-[14px] leading-relaxed font-[700] font-aeonik"
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
              </>
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
