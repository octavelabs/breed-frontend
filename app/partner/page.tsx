"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Navbar from "../components/landingPage/Navbar";
import Footer from "../components/landingPage/Footer";
import Button from "../components/Button";
import ScrollStorySection from "./components/StoryTelling";
import PartnerWithUs from "./components/PartnerWithUs";



export default function PartnerWithUsPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const whatToAchieve = [
    {
      title: "Stay Free",
      description:
        "The app remains free so every church and believer can participate without financial pressure.",
    },
    {
      title: "Product excellence",
      description:
        "Every update strengthens the tools that support ministry, kingdom collaboration, and growth.",
    },
    {
      title: "Wider reach",
      description:
        "We bring more churches and believers onboard, strengthening connections and increasing collective impact.",
    },
    {
      title: "Sustainable growth",
      description:
        "We make careful decisions that protect trust, maintain quality, and ensure the platform serves communities well into the ",
    },
    {
      title: "Shared Stewarship",
      description:
        "Together, we manage resources wisely and make decisions that protect trust and ensure long term sustainability.",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-hidden bg-[#F7EDFE]">
        <div className="">
          <div
            className="relative flex justify-center items-center bg-cover bg-center px-4 h-screen"
            style={{
              backgroundImage: `url('/partnerWithUs.jpg')`,
            }}
          >
            <div className="absolute inset-0 bg-[#180426B2]" />

            <div className="relative z-10">
              <div className="w-fit border border-[#161717] rounded-full px-5 py-[4px] bg-[#E7C8FF] mx-auto">
                <span className="text-[#161717] text-xs md:text-base font-medium">
                  A growing community of Believers
                </span>
              </div>
              <motion.h1
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="text-[42px] lg:text-[80px] text-center text-white font-[800] text-[#180426] leading-tight mt-4 font-almarai"
              >
                More than an app <br /> A MOVEMENT.
              </motion.h1>
            </div>
          </div>
          <ScrollStorySection />
          <section className="bg-[#FBF6FF] py-16 md:py-[104px] relative">
            <div className="px-4 lg:px-[50px] xl:px-[96px] relative z-10">
              <div className="bg-[#330750] rounded-2xl md:rounded-[40px] py-10 md:py-[64px] px-4 sm:px-8 md:px-20 shadow-2xl relative">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-10 rounded-2xl md:rounded-[40px]"
                  style={{
                    backgroundImage: "url('/partnerCardBackground.png')",
                  }}
                />
                <div className="relative z-10">
                  <div className="border border-[#161717] rounded-full px-4 md:px-5 py-1 md:py-[4px] bg-[#E7C8FF] mb-4 md:mb-5 w-fit mx-auto">
                    <span className="text-[#161717] text-xs sm:text-sm md:text-base font-medium font-almarai">
                      Why we need you
                    </span>
                  </div>

                  <p className="text-white text-xl sm:text-2xl md:text-[32px] leading-7 sm:leading-9 md:leading-[44px] font-bold text-center mb-4 md:mb-8 px-1">
                    A global discipleship platform does not grow on vision
                    alone. <br className="hidden sm:block" />
                    It depends on people who believe in the mission.
                  </p>

                  <p className="text-white text-base sm:text-lg md:text-[20px] leading-6 sm:leading-7 font-medium text-center mb-6 md:mb-6 px-1">
                    Your partnership allows breed to achieve the following:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-4 mb-4">
                    {whatToAchieve.map((item, index) => (
                      <div
                        key={index}
                        className="bg-[#4E0A7C] relative rounded-2xl md:rounded-[16px] py-6 md:py-[28px] px-4 md:px-5"
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-20 rounded-2xl md:rounded-[16px]"
                          style={{
                            backgroundImage:
                              "url('/partnerCardBackground.png')",
                          }}
                        />
                        <div className="relative z-10">
                          <div className="bg-[#330750] border-[0.5px] border-[#6A0BA9] rounded-lg md:rounded-[8px] mb-6 md:mb-8 flex justify-center items-center w-9 h-9 md:w-8 md:h-8">
                            <img
                              src="/partnerPage.svg"
                              alt=""
                              className="w-4 h-4 md:w-auto md:h-auto"
                            />
                          </div>

                          <p className="text-white font-semibold mb-3 md:mb-5 text-base sm:text-[17px] md:text-[18px] leading-6">
                            {item.title}
                          </p>

                          <p className="text-white text-sm sm:text-base leading-6 md:leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Last grid item - Start a conversation button */}
                    <div className="relative rounded-2xl md:rounded-[16px] py-6 md:py-[28px] px-4 md:px-5 flex items-center justify-center border-[1.5px] border-[#4E0A7C] border-dashed">
                      <Button
                        buttonType="custom"
                        customClass="!w-full sm:!w-[260px] !h-[52px] sm:!h-[56px] !text-white !bg-[rgba(255,255,255,0.16)] backdrop-blur-sm p-8"
                        onClick={() => console.log("done")}
                        type="button"
                      >
                        <p className="flex items-center justify-center gap-[10px] text-sm sm:text-base font-bold">
                          Start a conversation
                          <ArrowRight className="w-5 h-4" stroke="white" />
                        </p>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <PartnerWithUs />
          <section className="relative bg-[#180426] px-4 sm:px-6 lg:px-[176px] py-14 sm:py-16 lg:py-[102px] pb-20 sm:pb-24 lg:pb-[102px]">
            {/* background texture */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-5 rounded-[32px]"
              style={{ backgroundImage: "url('/partnerCardBackground.png')" }}
            />

            <div className="bg-[#330750] flex flex-col lg:flex-row relative z-10 rounded-2xl lg:rounded-[20px] overflow-hidden h-auto lg:h-[420px]">
              {/* image */}
              <div className="w-full lg:w-1/2 h-[220px] sm:h-[280px] lg:h-full">
                <img
                  src="/grapes.png"
                  className="w-full h-full object-cover mix-blend-luminosity"
                  alt=""
                />
              </div>

              {/* content */}
              <div className="w-full lg:w-1/2 py-8 sm:py-10 lg:py-[78px] px-5 sm:px-8 lg:pr-[73px] lg:pl-0 text-white">
                <p className="font-almarai font-bold text-[26px] sm:text-[32px] lg:text-[40px] leading-[32px] sm:leading-[40px] lg:leading-normal mb-3 sm:mb-4">
                  Let’s work together in God’s vineyard
                </p>

                <p className="text-sm sm:text-base lg:text-[18px] leading-6 sm:leading-7 lg:leading-[25.2px] mb-8 sm:mb-10 lg:mb-12">
                  If Breed resonates with your heart and your calling, we invite
                  you to partner with us in whatever way God leads
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    buttonType="bordered"
                    customClass="!w-full sm:!w-1/2 !h-[52px] sm:!h-[56px] !border-white !text-white"
                    onClick={() => console.log("done")}
                    type="button"
                  >
                    <p className="flex items-center justify-center sm:justify-start gap-2 sm:gap-[10px] text-sm sm:text-base">
                      Start a conversation{" "}
                      <ArrowRight
                        className="w-4 h-4 sm:w-5 sm:h-4"
                        stroke="white"
                      />
                    </p>
                  </Button>

                  <Button
                    buttonType="custom"
                    customClass="!w-full sm:!w-1/2 !h-[52px] sm:!h-[56px] !text-[#5B26B1] !bg-white"
                    onClick={() => console.log("done")}
                    type="button"
                  >
                    <p className="flex w-full px-5 sm:px-[28px] gap-2 items-center justify-center lg:justify-between text-sm sm:text-base">
                      Give now{" "}
                      <ArrowRight
                        className="w-4 h-4 sm:w-5 sm:h-4"
                        stroke="#5B26B1"
                      />
                    </p>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* White space before footer */}
          {/* <div className="bg-white h-10 sm:h-14 md:h-20" /> */}
        </div>
      </div>
      <Footer />
    </>
  );
}
