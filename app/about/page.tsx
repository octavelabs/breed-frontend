"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GetBreedApp from "../components/landingPage/GetBreedApp";
import Navbar from "../components/landingPage/Navbar";
import Footer from "../components/landingPage/Footer";
import Link from "next/link";
import { TimelineSection } from "./components/TimelineSection";
import Button from "../components/Button";
import { partnershipCards } from "../partner/page";

const days = [
  { day: "M" },
  { day: "T" },
  { day: "W" },
  { day: "T" },
  { day: "F" },
  { day: "S" },
  { day: "S" },
];

export default function BelieversPage() {
  const slideInRight = {
    hidden: { x: -60, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  const slideInLeft = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const imageGrid = [
    {
      image: "/aboutHero1.png",
    },
    {
      image: "/aboutHero2.png",
    },
    {
      image: "/aboutHero3.png",
    },
    {
      image: "/aboutHero4.png",
    },
    {
      image: "/aboutHero5.png",
    },
    {
      image: "/aboutHero6.png",
    },
    {
      image: "/aboutHero7.png",
    },
    {
      image: "/aboutHero8.png",
    },
    {
      image: "/aboutHero9.png",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-hidden bg-[#FBF6FF]">
        <div className="container mx-auto px-4 pt-[150px] md:pt-[230px]">
          <div className="container  mx-auto">
            <div className="bg-[#330750] rounded-[40px] p-10 shadow-2xl relative">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 rounded-[40px]"
                style={{
                  backgroundImage: "url('/partnerCardBackground.png')",
                }}
              />
              <div className="relative z-10 flex gap-[50px] items-center">
                <div className="flex flex-col gap-6 text-white w-1/2">
                  <div className="border border-[#161717] rounded-full px-5 py-[4px] bg-[#E7C8FF] mb-6 w-fit">
                    <span className="text-[#161717] text-xs md:text-base font-medium">
                      About Us
                    </span>
                  </div>
                  <p className="text-[56px] leading-[72px] font-aeonik font-bold mb-6 flex items-center gap-[18px]">
                    The Breed Story{" "}
                    <img src="/frame.svg" className="w-[34px] h-[40px]" />
                  </p>
                  <p className="text-[20px]">
                    For pastors, preachers, and leaders called to teach,
                    disciple, and equip the body of Christ.
                  </p>
                </div>
                <div className="w-1/2 grid grid-cols-3 gap-1">
                  {imageGrid?.map((el, idx) => (
                    <img
                      src={el.image}
                      className="h-[184px] w-[184px] object-cover rounded-[20px]"
                      key={idx}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <TimelineSection />
        <div className="container mx-auto pb-[108px]">
          <div className="grid grid-cols-3 gap-3 h-[368px]">
            <div className="bg-[#330750] relative rounded-[32px] pt-[64px] pb-20 px-8 h-full">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 rounded-[32px]"
                style={{
                  backgroundImage: "url('/partnerCardBackground.png')",
                }}
              />
              <div className="relative z-10 flex flex-col gap-6">
                <img src="/about5.svg" className="w-[56px] h-[56px]" />

                <p className="text-[36px] text-white font-medium leading-[48px]">
                  Vision
                </p>
                <p className="text-white text-[18px] leading-relaxed">
                  We envision all men in all nations rooted, grounded, and
                  established in the faith, experiencing progress and joy every
                  day.
                </p>
              </div>
            </div>
            <div className="bg-[#330750] relative rounded-[32px] pt-[64px] pb-20 px-8 h-full">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20 rounded-[32px]"
                style={{
                  backgroundImage: "url('/partnerCardBackground.png')",
                }}
              />
              <div className="relative z-10 flex flex-col gap-6">
                <img src="/about4.svg" className="w-[56px] h-[56px]" />

                <p className="text-[36px] text-white font-medium leading-[48px]">
                  Mission
                </p>
                <p className="text-white text-[18px] leading-relaxed">
                  Our mission is to help believers grow in Christ through
                  discipleship, accountability, and accessible spiritual
                  resources.{" "}
                </p>
              </div>
            </div>
            <div className="rounded-[32px] h-full">
              <img
                src="/mission.png"
                className="h-full w-full object-cover rounded-[32px]"
              />
            </div>
          </div>
        </div>
        <section className="bg-white">
          <div className="container mx-auto px-4 sm:px-6 pb-16 md:pb-[108px]">
            <div className="border border-[#161717] rounded-full px-4 md:px-5 py-1 md:py-[4px] bg-[#E7C8FF] mb-5 md:mb-6 w-fit mx-auto">
              <span className="text-[#161717] text-xs sm:text-sm md:text-base font-medium">
                Join the mission
              </span>
            </div>

            <h2 className="text-[28px] sm:text-[36px] md:text-[55px] leading-[34px] sm:leading-[44px] md:leading-tight font-bold text-center font-aeonik mb-4 md:mb-6 px-1">
              Ways You Can Partner with Us
            </h2>

            <p className="text-sm sm:text-base md:text-[18px] text-center leading-6 md:leading-[25.2px] mb-6 px-1">
              Every partnership makes a difference.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-3">
              {partnershipCards.map((card, index) => (
                <div
                  key={index}
                  className={`relative rounded-2xl md:rounded-[32px] pt-8 sm:pt-10 md:pt-[56px] px-5 sm:px-6 md:px-[36px] text-white overflow-hidden ${
                    card.hasButton ? "min-h-[220px]" : "min-h-[200px]"
                  } sm:min-h-[240px] md:min-h-[260px] ${card.span} w-full`}
                  style={{
                    backgroundColor: `${card.bgColor}`,
                    height: window.innerWidth >= 768 ? card.height : "auto",
                  }}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-10 rounded-2xl md:rounded-[32px]"
                    style={{
                      backgroundImage: "url('/partnerCardBackground.png')",
                    }}
                  />

                  <img
                    src={card.image}
                    alt=""
                    className="absolute bottom-0 right-0 h-20 w-20 sm:h-24 sm:w-24 md:h-[144px] md:w-[144px] rounded-br-2xl md:rounded-br-[32px]"
                  />

                  <p className="text-xl sm:text-2xl md:text-[30px] font-medium leading-7 sm:leading-8 md:leading-[38px] mb-2 md:mb-3 font-aeonik relative z-10 pr-16 sm:pr-20 md:pr-[160px]">
                    {card.title}
                  </p>

                  <p className="text-sm sm:text-base md:text-[18px] relative z-10 pr-10 sm:pr-14 md:pr-[140px]">
                    {card.description}
                  </p>

                  {card.hasButton && (
                    <Button
                      buttonType="custom"
                      customClass="!w-[200px] md:!w-[160px] !h-[52px] sm:!h-[56px] mt-6 md:mt-[88px] !text-[#5B26B1] !bg-white"
                      onClick={() => console.log("done")}
                      type="button"
                    >
                      <p className="flex items-center justify-center sm:justify-start gap-2 sm:gap-[10px] text-sm sm:text-base">
                        Give now{" "}
                        <ArrowRight
                          className="w-4 h-4 sm:w-5 sm:h-4"
                          stroke="#5B26B1"
                        />
                      </p>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
