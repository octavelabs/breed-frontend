"use client";

import { ArrowRight } from "lucide-react";
import Navbar from "../components/landingPage/Navbar";
import Footer from "../components/landingPage/Footer";

import { TimelineSection } from "./components/TimelineSection";
import PartnerWithUs from "../partner/components/PartnerWithUs";


export default function BelieversPage() {

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
      <div className="min-h-screen overflow-hidden bg-[#FBF6FF] ">
        <div className="px-4 lg:px-[50px] xl:px-[96px] pt-[150px] md:pt-[230px]">
          <div className="">
            <div className="bg-[#330750] rounded-[40px] p-10 shadow-2xl relative">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-10 rounded-[40px]"
                style={{
                  backgroundImage: "url('/partnerCardBackground.png')",
                }}
              />
              <div className="relative z-10 flex flex-col lg:flex-row gap-[50px] items-center">
                <div className="flex flex-col gap-6 text-white w-full lg:w-1/2">
                  <div className="border border-[#161717] rounded-full px-5 py-[4px] bg-[#E7C8FF] mb-6 w-fit">
                    <span className="text-[#161717] text-xs md:text-base font-medium">
                      About Us
                    </span>
                  </div>
                  <p className="text-[34px] lg:text-[56px] leading-[40px] lg:leading-[72px] font-aeonik font-bold mb-6 flex items-center gap-4 lg:gap-[18px]">
                    The Breed Story{" "}
                    <img src="/frame.svg" className="w-[34px] h-[40px]" />
                  </p>
                  <p className="text-[20px]">
                    For pastors, preachers, and leaders called to teach,
                    disciple, and equip the body of Christ.
                  </p>
                </div>
                <div className="w-full lg:w-1/2 grid grid-cols-3 gap-1">
                  {imageGrid?.map((el, idx) => (
                    <img
                      src={el.image}
                      className="h-[150px] xl:h-[184px] w-[150px] xl:w-[184px] object-cover rounded-[20px]"
                      key={idx}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <TimelineSection />
        <div className="px-4 lg:px-[50px] xl:px-[96px] pb-[108px] h-fit">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 ">
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
       <PartnerWithUs />
      </div>
      <Footer />
    </>
  );
}
