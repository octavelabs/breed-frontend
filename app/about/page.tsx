'use client'

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

  const imageGrid = [
    {
      image: "/aboutHero1.png"
    },
    {
      image: "/aboutHero2.png"
    },
    {
      image: "/aboutHero3.png"
    },
    {
      image: "/aboutHero4.png"
    },
    {
      image: "/aboutHero5.png"
    },
     {
      image: "/aboutHero6.png"
    },
     {
      image: "/aboutHero7.png"
    },
     {
      image: "/aboutHero8.png"
    },
     {
      image: "/aboutHero9.png"
    },
  ]

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
              <p className="text-[56px] leading-[72px] font-aeonik font-bold mb-6 flex items-center gap-[18px]">The Breed Story <img src='/frame.svg' className='w-[34px] h-[40px]' /></p>
              <p className='text-[20px]'>Lorem ipsum for pastors, preachers, and leaders called to teach, disciple, and equip the body of Christ lorem ipsum lorem ipsum</p>
                          </div>
                        <div className="w-1/2 grid grid-cols-3 gap-1">
                          {imageGrid?.map((el, idx) => (
                            <img src={el.image} className="h-[184px] w-[184px] object-cover rounded-[20px]" key={idx}/>
                          ))}
                        </div>
                        </div>
                      </div>
                    </div>

      </div>
     <TimelineSection />
     <section className="">
                 <div className="container mx-auto pb-[108px]">
                   <div className="border border-[#161717] rounded-full px-5 py-[4px] bg-[#E7C8FF] mb-6 w-fit mx-auto">
                     <span className="text-[#161717] text-xs md:text-base font-medium">
                       Join the mission
                     </span>
                   </div>
     
                   <h2 className="mb-8 text-[55px] leading-tight font-bold mb-6 text-center font-aeonik">
                     Ways You Can Partner with Us
                   </h2>
                   <p className="text-[18px] mb-6 text-center leading-[25.2px]">
                     Every partnership makes a difference.
                   </p>
     
                   <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-3">
                     {partnershipCards.map((card, index) => (
                       <div
                         key={index}
                         className={`relative rounded-[32px] pt-[56px] px-[36px] text-white ${card.span}`}
                         style={{
                           backgroundColor: `${card.bgColor}`,
                           height: `${card.height}`,
                         }}
                       >
                         <div
                           className="absolute inset-0 bg-cover bg-center opacity-10 rounded-[32px]"
                           style={{
                             backgroundImage: "url('/partnerCardBackground.png')",
                           }}
                         />
                         <img
                           src={card.image}
                           className="absolute bottom-0 right-0 h-[144px] w-[144px] rounded-br-[32px]"
                         />
                         <p className="text-[30px] font-medium leading-[38px] mb-3 font-aeonik">
                           {card.title}
                         </p>
                         <p className="text-[18px]">{card.description}</p>
                         {card.hasButton && (
                           <Button
                             buttonType="custom"
                             customClass="!w-[160px] !h-[56px] mt-[88px] !text-[#5B26B1] !bg-white"
                             onClick={() => console.log("done")}
                             type="button"
                           >
                             <p className="flex items-center gap-[10px]">
                               Give now{" "}
                               <ArrowRight className="w-5 h-4" stroke="#5B26B1" />
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
