"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GetBreedApp from "../components/landingPage/GetBreedApp";
import Navbar from "../components/landingPage/Navbar";
import Footer from "../components/landingPage/Footer";
import Link from "next/link";
import Button from "../components/Button";
import ScrollStorySection from "./components/StoryTelling";

export const partnershipCards = [
  {
    title: "Advocacy",
    description: "Share Breed with believers who would benefit from it.",
    span: "col-span-1 lg:col-span-3",
    bgColor: "#2D307B",
    image: "/partner1.svg",
    hasButton: false,
    height: "248px",
  },
  {
    title: "Church Partnerships",
    description: "Introduce Breed to your church community or ministry.",
    span: "col-span-1 lg:col-span-3",
    bgColor: "#4E5255",
    image: "/partner2.svg",
    hasButton: false,
    height: "248px",
  },
  {
    title: "Intercessory Prayers",
    description:
      "Commit to praying for the mission and the people being discipled.",
    span: "col-span-1 lg:col-span-2",
    bgColor: "#A22F6E",
    image: "/partner5.svg",
    hasButton: false,
    height: "424px",
  },
  {
    title: "Skill & Advisory",
    description:
      "Contribute expertise in tech, design, theology, operations, or strategy.",
    span: "col-span-1 lg:col-span-2",
    bgColor: "#6A0BA9",
    image: "/partner4.svg",
    hasButton: false,
    height: "424px",
  },
  {
    title: "Financial Support",
    description:
      "Help sustain and scale the platform through recurring or one-time giving.",
    span: "col-span-1 lg:col-span-2",
    bgColor: "#180426",
    image: "/partner3.svg",
    hasButton: true,
    height: "424px",
  },
];

export default function PartnerWithUsPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const slideInRight = {
    hidden: { x: -60, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  const slideInLeft = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
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
                className="text-[42px] lg:text-[80px] text-center text-white font-[900] text-[#180426] leading-tight mt-4 font-aeonik"
              >
                More than an app <br /> A MOVEMENT.
              </motion.h1>
            </div>
          </div>
          <ScrollStorySection />
          <section className="bg-white py-16 md:py-[104px] relative">
            <div className="container mx-auto px-4 relative z-10">
              <div className="bg-[#330750] rounded-2xl md:rounded-[40px] py-10 md:py-[64px] px-4 sm:px-8 md:px-20 shadow-2xl relative">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-10 rounded-2xl md:rounded-[40px]"
                  style={{
                    backgroundImage: "url('/partnerCardBackground.png')",
                  }}
                />
                <div className="relative z-10">
                  <div className="border border-[#161717] rounded-full px-4 md:px-5 py-1 md:py-[4px] bg-[#E7C8FF] mb-4 md:mb-5 w-fit mx-auto">
                    <span className="text-[#161717] text-xs sm:text-sm md:text-base font-medium font-aeonik">
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
                        buttonType="bordered"
                        customClass="!w-full sm:!w-[229px] !h-[52px] sm:!h-[56px] !border-white !text-white"
                        onClick={() => console.log("done")}
                        type="button"
                      >
                        <p className="flex items-center justify-center gap-[10px] text-sm sm:text-base">
                          Start a conversation{" "}
                          <ArrowRight className="w-5 h-4" stroke="white" />
                        </p>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
                <p className="font-aeonik font-bold text-[26px] sm:text-[32px] lg:text-[40px] leading-[32px] sm:leading-[40px] lg:leading-normal mb-3 sm:mb-4">
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
                    <p className="flex w-full px-5 sm:px-[28px] items-center justify-between text-sm sm:text-base">
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
          <div className="bg-white h-10 sm:h-14 md:h-20" />
        </div>
      </div>
      <Footer />
    </>
  );
}
