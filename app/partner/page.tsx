"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GetBreedApp from "../components/landingPage/GetBreedApp";
import Navbar from "../components/landingPage/Navbar";
import Footer from "../components/landingPage/Footer";
import Link from "next/link";
import Button from "../components/Button";
import ScrollStorySection from "./components/StoryTelling";

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

  const partnershipCards = [
    {
      title: "Advocacy",
      description: "Share Breed with believers who would benefit from it.",
      span: "col-span-3",
      bgColor: "#2D307B",
      image: "/partner1.svg",
      hasButton: false,
      height: "248px",
    },
    {
      title: "Church Partnerships",
      description: "Introduce Breed to your church community or ministry.",
      span: "col-span-3",
      bgColor: "#4E5255",
      image: "/partner2.svg",
      hasButton: false,
      height: "248px",
    },
    {
      title: "Intercessory Prayers",
      description:
        "Commit to praying for the mission and the people being discipled.",
      span: "col-span-2",
      bgColor: "#A22F6E",
      image: "/partner5.svg",
      hasButton: false,
      height: "424px",
    },
    {
      title: "Skill & Advisory",
      description:
        "Contribute expertise in tech, design, theology, operations, or strategy.",
      span: "col-span-2",
      bgColor: "#6A0BA9",
      image: "/partner4.svg",
      hasButton: false,
      height: "424px",
    },
    {
      title: "Financial Support",
      description:
        "Help sustain and scale the platform through recurring or one-time giving.",
      span: "col-span-2",
      bgColor: "#180426",
      image: "/partner3.svg",
      hasButton: true,
      height: "424px",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-hidden bg-[#F7EDFE]">
        <div className="">
          <div
            className="relative flex justify-center bg-cover bg-center px-4 pt-[150px] md:pt-[230px] h-screen"
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
                More than an app <br /> A MOVEMENT
              </motion.h1>
            </div>
          </div>
          <ScrollStorySection />
          <section className="bg-white py-[104px] relative">
            <div className="absolute inset-0 bg-[#180426B2]" />
            <div className="container  mx-auto px-4 relative z-10">
              <div className="bg-[#330750] rounded-[40px] py-[64px] px-20 shadow-2xl relative">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-10 rounded-[40px]"
                  style={{
                    backgroundImage: "url('/partnerCardBackground.png')",
                  }}
                />
                <div className="relative z-10">
                  <div className="border border-[#161717] rounded-full px-5 py-[4px] bg-[#E7C8FF] mb-5 w-fit mx-auto">
                    <span className="text-[#161717] text-xs md:text-base font-medium font-aeonik">
                      Why we need you
                    </span>
                  </div>

                  <p className="mb-8 text-white text-[32px] leading-[44px] font-bold mb-4 text-center">
                    A global discipleship platform does not grow on vision
                    alone. <br />
                    It depends on people who believe in the mission.
                  </p>
                  <p className="text-[20px] font-medium text-white mb-6 text-center">
                    Your partnership allows breed to achieve the following:
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {whatToAchieve.map((item, index) => (
                      <div
                        key={index}
                        className="bg-[#4E0A7C] relative rounded-[16px] py-[28px] px-5"
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-20 rounded-[16px]"
                          style={{
                            backgroundImage:
                              "url('/partnerCardBackground.png')",
                          }}
                        />
                        <div className="relative z-10">
                          <div className="bg-[#330750] border-[0.5px] border-[#6A0BA9] rounded-[8px] mb-8 flex justify-center items-center w-8 h-8">
                            <img src="/partnerPage.svg" />
                          </div>
                          <p className="text-[18px] text-white font-semibold mb-5">
                            {item.title}
                          </p>
                          <p className="text-white text-base leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                    {/* Last grid item - Start a conversation button */}
                    <div className="relative rounded-[16px] py-[28px] px-5 flex items-center justify-center border-[1.5px] border-[#4E0A7C] border-dashed">
                      <Button
                        buttonType="bordered"
                        customClass="!w-[229px] !h-[56px] !border-white !text-white"
                        onClick={() => console.log("done")}
                        type="button"
                      >
                        <p className="flex items-center gap-[10px]">
                          Start a conversation <ArrowRight className="w-5 h-4" stroke="white" />
                        </p>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="bg-white">
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
          <section className="px-[176px] py-[102px] relative bg-[#180426]">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-5 rounded-[32px]"
              style={{ backgroundImage: "url('/partnerCardBackground.png')" }}
            />
            <div className="bg-[#330750] flex relative z-10 rounded-[20px] h-[420px]">
              <div className="w-1/2">
                <img src='/grapes.png' className="w-full h-full object-cover mix-blend-burn"/>
              </div>
              <div className="w-1/2 py-[78px] pr-[73px] text-white">
                <p className="font-aeonik font-bold text-[40px] mb-4">
                  Let’s work together in God’s vineyard
                </p>
                <p className="text-[18px] leading-[25.2px] mb-12">
                  If Breed resonates with your heart and your calling, we invite
                  you to partner with us in whatever way God leads
                </p>
                <div className="flex gap-4">
                  <Button
                    buttonType="bordered"
                    customClass="!w-1/2 !h-[56px] !border-white !text-white"
                    onClick={() => console.log("done")}
                    type="button"
                  >
                    <p className="flex items-center gap-[10px]">
                      Start a conversation <ArrowRight className="w-5 h-4" stroke="white" />
                    </p>
                  </Button>
                  <Button
                    buttonType="custom"
                    customClass="!w-1/2 !h-[56px] !text-[#5B26B1] !bg-white"
                    onClick={() => console.log("done")}
                    type="button"
                  >
                    <p className="flex w-full px-[28px] items-center justify-between">
                      Give now{" "}
                      <ArrowRight className="w-5 h-4" stroke="#5B26B1" />
                    </p>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
