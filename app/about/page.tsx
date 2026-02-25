'use client'

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GetBreedApp from "../components/landingPage/GetBreedApp";
import Navbar from "../components/landingPage/Navbar";
import Footer from "../components/landingPage/Footer";
import Link from "next/link";

 const days = [
    { day: 'M'},
    { day: 'T'},
    { day: 'W'},
    { day: 'T'},
    { day: 'F'},
    { day: 'S'},
    { day: 'S'}
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

  return (
    <>
    <Navbar />
    <div className="min-h-screen overflow-hidden bg-[#F7EDFE]">
      <div className="container mx-auto px-4 pt-[150px] md:pt-[230px]">
         <div className="container  mx-auto px-4">
                      <div className="bg-[#330750] rounded-[40px] p-10 shadow-2xl relative">
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-10 rounded-[40px]"
                          style={{
                            backgroundImage: "url('/partnerCardBackground.png')",
                          }}
                        />
                        <div className="relative z-10 flex gap">
                          <div className="flex flex-col gap-6 text-white">
                            <div className="border border-[#161717] rounded-full px-5 py-[4px] bg-[#E7C8FF] mb-6 w-fit mx-auto">
                <span className="text-[#161717] text-xs md:text-base font-medium">
                  About Us
                </span>
              </div>
              <p className="text-[56px] leading-[72px] font-aeonik font-bold">The Breed Story</p>
                          </div>
                        
                        </div>
                      </div>
                    </div>

      </div>
      <GetBreedApp />
    </div>
    <Footer />
    </>
  );
}
