"use client";

import { ArrowRight, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function GrowInGrace() {
  const [activeTab, setActiveTab] = useState(0);

  const slideInRight = {
    hidden: { x: -60, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  const slideInLeft = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  const tabs = [
    "Daily Edification",
    "Forums/Communities",
    "Discipleship Tools",
    "Online Christian Courses",
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <TabContentOne />;
      case 1:
        return <TabContentTwo />;
      case 2:
        return <TabContentThree />;
      case 3:
        return <TabContentFour />;
      default:
        return <TabContentOne />;
    }
  };

  return (
    <div className="space-y-2 px-4 lg:px-[50px] xl:px-[96px]">
      {/* Top Grid - 2 Cards */}
      <div className="grid md:grid-cols-2 gap-2">
        {/* Blue Card - Grow in Grace */}
        <motion.div
          variants={slideInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="bg-[#34399C] rounded-[24px] xl:rounded-[40px] py-[32px] xl:py-[80px] px-[20px] xl:px-[48px]"
        >
          <div className="inline-block mb-6">
            <span className="px-4 py-1.5 text-xs xl:text-base text-white border border-white/50 rounded-full font-medium">
              For All Believers
            </span>
          </div>

          <h1 className="text-[32px] xl:text-[58px] xl:leading-[72px] font-[700] font-aeonik font-bold mb-2 text-white">
            Grow in Grace
          </h1>

          <p className="text-white text-[14px] xl:text-[18px] mb-8 leading-relaxed">
            For believers seeking spiritual growth and new converts beginning
            their faith journey
          </p>

          <div className="space-y-3 mb-[65px]">
            {[
              "Access devotionals, guided Bible plans, and prayer prompts",
              "Grow in faith alongside a community of believers like you",
              "Share prayer requests and pray with others in real time",
              "Track your growth - not for performance, but for purpose",
            ].map((item, index) => (
              <div
                className="flex items-center gap-2 bg-[#C5C8F1] rounded-full px-3 py-2 text-sm xl:text-base text-[#24265B] border-[0.5px] border-[#24265B]"
                key={index}
              >
                <img src="/abstract-24.svg" className="w-[16px] h-[16px]" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="group w-[50%] lg:w-auto flex items-center gap-3 px-4 xl:px-8 py-4 bg-white/16 rounded-full font-semibold text-xs xl:text-sm text-white transition-all font-bold">
              Download app
              <div className="flex items-center gap-2.5">
                <img src="/apple-white.svg" className="w-4 xl:w-5 h-4 xl:h-5" />
                <img
                  src="/google-white.svg"
                  className="w-4 xl:w-5 h-4 xl:h-5"
                />
              </div>
            </button>
            <button className="flex items-center justify-between gap-2 px-5 py-2.5 w-[50%] lg:w-[200px] bg-white text-black rounded-full text-sm font-bold">
              Learn more
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>

        {/* Image Card - Prayer */}
        <motion.div
          variants={slideInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-amber-200 to-amber-100 rounded-[24px] xl:rounded-[40px] overflow-hidden min-h-[500px] flex items-center justify-center"
        >
          <img
            className="h-full w-full object-cover"
            src="./growInGrace1.png"
            alt="Woman praying"
          />
        </motion.div>
      </div>

      {/* Bottom Grid - 2 Cards */}
      <div className="grid md:grid-cols-2 gap-2">
        {/* Image Card - Pastor */}
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-[24px] rounded-[40px] overflow-hidden min-h-[500px] flex items-center justify-center"
        >
          <img
            className="h-full w-full object-cover"
            src="./Rectangle.png"
            alt="pastor preaching"
          />
        </motion.div>

        {/* Pink Card - Lead with Purpose */}
        <motion.div
          variants={slideInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="bg-[#C83785] py-[32px] xl:py-[80px] px-[20px] xl:px-[48px] rounded-[24px] xl:rounded-[40px] text-white"
        >
          <div className="inline-block mb-6">
            <span className="px-4 py-1.5 text-xs xl:text-base text-white border border-white/50 rounded-full font-medium">
              For Preachers
            </span>
          </div>


          <h2 className="text-[32px] xl:text-[58px] xl:leading-[72px] font-[700] font-aeonik font-bold mb-2">
            Lead with Purpose
          </h2>

          <p className="text-white text-sm xl:text-[18px] mb-8 leading-relaxed">
            For pastors, preachers, and leaders called to teach, disciple, and
            equip the body of Christ
          </p>

          <div className="space-y-3 mb-[65px]">
            {[
              "Curate bible plans, devotionals, and discipleship content",
              "Get insights into how your members/disciples are engaging",
              "Nurture deeper fellowship through online prayer circles, group discussions, and focused teaching hubs",
            ].map((item, index) => (
              <div
                className="flex items-center gap-2 bg-[#F3C4DD] rounded-full px-3 py-2 text-sm xl:text-base text-[#7D2757] border-[0.5px] border-[#7D2757]"
                key={index}
              >
                <img
                  src="/abstract-pink-24.svg"
                  className="w-[16px] h-[16px]"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="group  flex items-center gap-3 px-4 xl:px-8 py-4 bg-white/16 rounded-full font-semibold text-xs xl:text-sm text-white transition-all font-bold">
              Download app
              <div className="flex items-center gap-2.5">
                <img src="/apple-white.svg" className="w-4 xl:w-5 h-4 xl:h-5" />
                <img
                  src="/google-white.svg"
                  className="w-4 xl:w-5 h-4 xl:h-5"
                />
              </div>
            </button>
            <button className="flex items-center justify-between gap-2 px-5 py-2.5 w-[200px] bg-white text-black rounded-full text-sm font-bold">
              Learn more
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Daily Edification Section */}
      <div className="bg-[#870BD6] rounded-[24px] xl:rounded-[40px] p-[32px] xl:p-[48px] mt-10">
        {/* Tabs */}
        <div className="bg-white rounded-full p-1.5 mb-[72px] flex overflow-x-auto justify-between">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-2.5 space-x-4 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeTab === index
                  ? "text-white bg-gradient-to-b from-[#A967F1] to-[#5B26B1]"
                  : "text-black hover:bg-[#5B26B1]/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {renderTabContent()}
      </div>
    </div>
  );
}

const TabContentOne = () => {
  return (
    <div className="grid md:grid-cols-2 gap-10 xl:gap-[139px]">
      {/* Left Content */}
      <div className="text-white">
        <h2 className="text-[28px] xl:text-[42px] leading-[44px] xl:leading-[56px] font-bold font-aeonik mb-1 text-white">
          Daily Edification
        </h2>

        <p className="text-white text-sm xl:text-base mb-8">
          Stay nourished in the Word — Every day.
        </p>

        <div className="space-y-3 mb-[40px] xl:mb-[91px]">
          {[
            "Spirit-filled devotionals designed to help you hear God clearly each day.",
            "Build spiritual consistency with gentle reminders to pray, read, and meditate every single day.",
            "Receive fresh daily content that strengthens your walk and revives your hunger for God.",
          ].map((item, index) => (
            <div
              className="flex items-center gap-2 bg-[#E7C8FF] text-[#330750] rounded-full px-5 py-2 border-[0.5px] border-[#6A0BA9]"
              key={index}
            >
              <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.4485 0.769352V4.16935L8.35685 6.52769V1.80269L11.2985 0.136019C11.4128 0.0698804 11.5423 0.034395 11.6744 0.0330017C11.8064 0.0316083 11.9366 0.0643542 12.0523 0.128066C12.168 0.191777 12.2652 0.284294 12.3347 0.396648C12.4041 0.509002 12.4433 0.637384 12.4485 0.769352ZM0.406848 8.76935L3.34851 10.436L7.44851 8.15269L3.35685 5.74435L0.415181 7.41102C0.290816 7.47517 0.186383 7.57214 0.113199 7.69142C0.0400151 7.8107 0.000872931 7.94773 1.4432e-05 8.08766C-0.000844067 8.2276 0.036614 8.3651 0.108329 8.48527C0.180044 8.60543 0.28328 8.70367 0.406848 8.76935ZM13.3568 13.8694V10.4694L9.26518 8.15269V12.8777L12.2152 14.5444C12.3323 14.61 12.4647 14.6438 12.599 14.6423C12.7332 14.6408 12.8648 14.604 12.9804 14.5356C13.096 14.4673 13.1916 14.3697 13.2577 14.2528C13.3238 14.1359 13.358 14.0037 13.3568 13.8694Z" fill="#4E0A7C"/>
<path opacity="0.3" d="M5.41576 0.102717L8.35742 1.76938V6.49438L4.26576 4.16938V0.769383C4.26528 0.634575 4.30035 0.502024 4.36745 0.385098C4.43454 0.268171 4.53128 0.171003 4.64791 0.103393C4.76454 0.0357819 4.89693 0.000118986 5.03174 2.97226e-07C5.16655 -0.000118392 5.29901 0.0353113 5.41576 0.102717ZM4.49909 14.536L7.44909 12.8694V8.15272L3.35742 10.4694V13.8694C3.35778 14.003 3.39303 14.1342 3.4597 14.2499C3.52636 14.3657 3.62212 14.462 3.73748 14.5294C3.85285 14.5968 3.98382 14.6328 4.1174 14.634C4.25099 14.6352 4.38257 14.6014 4.49909 14.536ZM16.3074 7.44438L13.3658 5.77772L9.26576 8.15272L13.3574 10.4694L16.2991 8.80272C16.4235 8.73856 16.5279 8.64159 16.6011 8.52231C16.6743 8.40304 16.7134 8.26601 16.7143 8.12607C16.7151 7.98614 16.6777 7.84863 16.6059 7.72847C16.5342 7.6083 16.431 7.51006 16.3074 7.44438Z" fill="#4E0A7C"/>
</svg>
              <span className="text-xs xl:text-sm leading-relaxed">{item}</span>
            </div>
          ))}
        </div>

        <a
          href="https://form.typeform.com/to/EMh4jnRi"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="flex items-center font-[800] justify-between gap-2 px-[28px] py-[18px] w-[200px] border-[1.5px] border-white rounded-full cursor-pointer text-sm transition">
            Get started
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <ChevronRight size={12} stroke="#6A0BA9" />
            </div>
          </button>
        </a>
      </div>

      {/* Right Preview Cards */}
      <div
        className="flex flex-col gap-[45px] items-center bg-[#F1DFFF] rounded-[28px] px-[19px] xl:px-[32px] py-[32px] xl:py-10 w-full h-full bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url('/tabsBackground.png')` }}
      >
        <div className="space-y-[10px]">
          {/* Bible Plan Card */}
          <div className="bg-[#E7C8FF] rounded-[28px] p-6 flex flex-col xl:flex-row gap-4 border-[2.5px] border-[#FFFFFF8A] shadow-[0px_1.2px_29.92px_0px_#452A7C1A]">
            <div className="flex-1">
              <p className="text-xs text-[#60666B] mb-[6px]">Bible plan</p>
              <p className="text-xs text-black mb-3">
                Grace is God's response to our brokenness undeserved, yet freely
                given through the gift of Christ.
              </p>
              <p className="text-xs text-[#60666B]">
                📅 &nbsp; Today · 3 Chapters
              </p>
            </div>
            <div className="w-[96px] rounded-[11px] flex items-center justify-center flex-shrink-0">
              <img src="./DailyEdification1.png" />
            </div>
          </div>

          {/* Personal Devotion Card */}
          <div className="bg-[#E7C8FF] rounded-[28px] p-6 flex flex-col xl:flex-row gap-4 border-[2.5px] border-[#FFFFFF8A] shadow-[0px_1.2px_29.92px_0px_#452A7C1A]">
            <div className="flex-1">
              <p className="text-xs text-[#60666B] mb-[6px]">
                Personal Devotion
              </p>
              <p className="text-xs text-black mb-3">
                Lord, help me to develop and sustain a consistent time of
                fellowship with You, no matter how busy life gets.
              </p>
              <p className="text-xs text-gray-500">🕐 &nbsp; 4 · 5mins</p>
            </div>
            <div className="w-[96px] rounded-[11px] flex items-center justify-center flex-shrink-0">
              <img src="./DailyEdification2.png" />
            </div>
          </div>
        </div>
        <button className="w-fit px-[10px] py-2 bg-[#E7C8FF] text-[#4E0A7C] rounded-full text-sm font-medium transition">
          Consistency builds intimacy with God 💜
        </button>
      </div>
    </div>
  );
};

const TabContentTwo = () => {
  return (
    <div className="grid md:grid-cols-2 gap-10 xl:gap-[139px]">
      {/* Left Content */}
      <div className="text-white">
        <h2 className="text-[28px] xl:text-[42px] leading-[44px] xl:leading-[56px] font-bold font-aeonik mb-1 text-white">
          Forums/Communities
        </h2>

        <p className="text-white text-sm xl:text-base mb-8">
          Grow Together with Like-Minded Believers.
        </p>

        <div className="space-y-3 mb-[40px]">
          {[
            "Join communities that reflect your season — students, parents, young professionals, etc.",
            "Get answers to your questions in a safe, Spirit-filled environment.",
            "Receive encouragement through testimonies, scriptures, and life stories.",
            "Stay accountable with peers walking the same journey of faith.",
          ].map((item, index) => (
            <div
              className="flex items-center gap-2 bg-[#E7C8FF] text-[#330750] rounded-full px-5 py-2 border-[0.5px] border-[#6A0BA9]"
              key={index}
            >
              <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.4485 0.769352V4.16935L8.35685 6.52769V1.80269L11.2985 0.136019C11.4128 0.0698804 11.5423 0.034395 11.6744 0.0330017C11.8064 0.0316083 11.9366 0.0643542 12.0523 0.128066C12.168 0.191777 12.2652 0.284294 12.3347 0.396648C12.4041 0.509002 12.4433 0.637384 12.4485 0.769352ZM0.406848 8.76935L3.34851 10.436L7.44851 8.15269L3.35685 5.74435L0.415181 7.41102C0.290816 7.47517 0.186383 7.57214 0.113199 7.69142C0.0400151 7.8107 0.000872931 7.94773 1.4432e-05 8.08766C-0.000844067 8.2276 0.036614 8.3651 0.108329 8.48527C0.180044 8.60543 0.28328 8.70367 0.406848 8.76935ZM13.3568 13.8694V10.4694L9.26518 8.15269V12.8777L12.2152 14.5444C12.3323 14.61 12.4647 14.6438 12.599 14.6423C12.7332 14.6408 12.8648 14.604 12.9804 14.5356C13.096 14.4673 13.1916 14.3697 13.2577 14.2528C13.3238 14.1359 13.358 14.0037 13.3568 13.8694Z" fill="#4E0A7C"/>
<path opacity="0.3" d="M5.41576 0.102717L8.35742 1.76938V6.49438L4.26576 4.16938V0.769383C4.26528 0.634575 4.30035 0.502024 4.36745 0.385098C4.43454 0.268171 4.53128 0.171003 4.64791 0.103393C4.76454 0.0357819 4.89693 0.000118986 5.03174 2.97226e-07C5.16655 -0.000118392 5.29901 0.0353113 5.41576 0.102717ZM4.49909 14.536L7.44909 12.8694V8.15272L3.35742 10.4694V13.8694C3.35778 14.003 3.39303 14.1342 3.4597 14.2499C3.52636 14.3657 3.62212 14.462 3.73748 14.5294C3.85285 14.5968 3.98382 14.6328 4.1174 14.634C4.25099 14.6352 4.38257 14.6014 4.49909 14.536ZM16.3074 7.44438L13.3658 5.77772L9.26576 8.15272L13.3574 10.4694L16.2991 8.80272C16.4235 8.73856 16.5279 8.64159 16.6011 8.52231C16.6743 8.40304 16.7134 8.26601 16.7143 8.12607C16.7151 7.98614 16.6777 7.84863 16.6059 7.72847C16.5342 7.6083 16.431 7.51006 16.3074 7.44438Z" fill="#4E0A7C"/>
</svg>
              <span className="text-xs xl:text-sm leading-relaxed">{item}</span>
            </div>
          ))}
        </div>

        <a
          href="https://form.typeform.com/to/EMh4jnRi"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="flex items-center font-[800] justify-between gap-2 px-[28px] py-[18px] w-[200px] border-[1.5px] border-white rounded-full cursor-pointer text-sm transition">
            Get started
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <ChevronRight size={12} stroke="#6A0BA9" />
            </div>
          </button>
        </a>
      </div>

      {/* Right Preview Cards */}
      <div
        className="bg-[#F1DFFF] rounded-[28px] px-[19px] xl:px-[32px] py-[32px] xl:py-10 w-full h-full bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url('/tabsBackground.png')` }}
      >
        <div className="flex flex-col items-center space-y-[35px]">
          {/* Bible Plan Card */}
          <div className="rounded-[32px] h-[220px] w-full">
            <img src="./Forum1.png" className="h-full w-full" />
          </div>
          <div className="flex gap-4 w-[70%]">
            {[
              "./heart.png",
              "./pray.png",
              "./percent.png",
              "./fire.png",
              "./sparks.png",
              "./clap.png",
            ].map((item, index) => (
              <div
                className="h-6 xl:h-[40px] w-6 xl:w-[40px] border-[0.5px] border-[#D2D9DF] bg-white rounded-full flex justify-center items-center"
                key={index}
              >
                <img
                  src={item}
                  className="w-[10px] xl:w-[20px] h-[10px] xl:h-[20px]"
                />
              </div>
            ))}
          </div>
          <button className="w-fit text-[8.85px] lg:text-sm px-[10px] py-2 bg-[#E7C8FF] text-[#4E0A7C] rounded-full text-sm font-medium transition">
            Join friends. Meet new people. Grow in christ.
          </button>
        </div>
      </div>
    </div>
  );
};

const TabContentThree = () => {
  return (
    <div className="grid md:grid-cols-2 gap-[139px]">
      {/* Left Content */}
      <div className="text-white">
        <h2 className="text-[42px] leading-[56px] font-bold mb-1 font-base text-white">
          Discipleship Tools
        </h2>

        <p className="text-white text-base mb-8">
          Grow Together with Like-Minded Believers.
        </p>

        <div className="space-y-3 mb-[39px]">
          {[
            "Onboard your disciples and track their spiritual journey with ease.",
            "Schedule and host meetings weekly or daily, right within the app.",
            "Track attendance and consistency automatically through meeting logs.",
            "Monitor growth metrics to help disciples stay accountable and motivated.",
          ].map((item, index) => (
            <div
              className="flex items-center gap-2 bg-[#E7C8FF] text-[#330750] rounded-full px-5 py-2 border-[0.5px] border-[#6A0BA9]"
              key={index}
            >
              <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.4485 0.769352V4.16935L8.35685 6.52769V1.80269L11.2985 0.136019C11.4128 0.0698804 11.5423 0.034395 11.6744 0.0330017C11.8064 0.0316083 11.9366 0.0643542 12.0523 0.128066C12.168 0.191777 12.2652 0.284294 12.3347 0.396648C12.4041 0.509002 12.4433 0.637384 12.4485 0.769352ZM0.406848 8.76935L3.34851 10.436L7.44851 8.15269L3.35685 5.74435L0.415181 7.41102C0.290816 7.47517 0.186383 7.57214 0.113199 7.69142C0.0400151 7.8107 0.000872931 7.94773 1.4432e-05 8.08766C-0.000844067 8.2276 0.036614 8.3651 0.108329 8.48527C0.180044 8.60543 0.28328 8.70367 0.406848 8.76935ZM13.3568 13.8694V10.4694L9.26518 8.15269V12.8777L12.2152 14.5444C12.3323 14.61 12.4647 14.6438 12.599 14.6423C12.7332 14.6408 12.8648 14.604 12.9804 14.5356C13.096 14.4673 13.1916 14.3697 13.2577 14.2528C13.3238 14.1359 13.358 14.0037 13.3568 13.8694Z" fill="#4E0A7C"/>
<path opacity="0.3" d="M5.41576 0.102717L8.35742 1.76938V6.49438L4.26576 4.16938V0.769383C4.26528 0.634575 4.30035 0.502024 4.36745 0.385098C4.43454 0.268171 4.53128 0.171003 4.64791 0.103393C4.76454 0.0357819 4.89693 0.000118986 5.03174 2.97226e-07C5.16655 -0.000118392 5.29901 0.0353113 5.41576 0.102717ZM4.49909 14.536L7.44909 12.8694V8.15272L3.35742 10.4694V13.8694C3.35778 14.003 3.39303 14.1342 3.4597 14.2499C3.52636 14.3657 3.62212 14.462 3.73748 14.5294C3.85285 14.5968 3.98382 14.6328 4.1174 14.634C4.25099 14.6352 4.38257 14.6014 4.49909 14.536ZM16.3074 7.44438L13.3658 5.77772L9.26576 8.15272L13.3574 10.4694L16.2991 8.80272C16.4235 8.73856 16.5279 8.64159 16.6011 8.52231C16.6743 8.40304 16.7134 8.26601 16.7143 8.12607C16.7151 7.98614 16.6777 7.84863 16.6059 7.72847C16.5342 7.6083 16.431 7.51006 16.3074 7.44438Z" fill="#4E0A7C"/>
</svg>
              <span className="text-sm leading-relaxed">{item}</span>
            </div>
          ))}
        </div>

        <a
          href="https://form.typeform.com/to/EMh4jnRi"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="flex items-center font-[800] justify-between gap-2 px-[28px] py-[18px] w-[200px] border-[1.5px] border-white rounded-full cursor-pointer text-sm transition">
            Get started
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <ChevronRight size={12} stroke="#6A0BA9" />
            </div>
          </button>
        </a>
      </div>

      {/* Right Preview Cards */}
      <div className="bg-[#F1DFFF]  rounded-[28px] px-[32px] py-10">
        <img src="./discipleship.png" className="" />
      </div>
    </div>
  );
};
const TabContentFour = () => {
  return (
    <div className="grid md:grid-cols-2 gap-[139px]">
      {/* Left Content */}
      <div className="text-white">
        <h2 className="text-[42px] leading-[56px] font-bold mb-1 text-white font-aeonik">
          Online Christian Courses
        </h2>

        <p className="text-white text-base mb-8">
          Learn the Word. One lesson at a time
        </p>

        <div className="space-y-3 mb-[39px]">
          {[
            "Access short, structured courses built for easy understanding and daily use",
            "Learn sound doctrine from trusted pastors, teachers, and Spirit-led instructors.",
            "Earn completion badges and track your learning progress.",
            "Share course plans with friends or within communities for group learning.",
          ].map((item, index) => (
            <div
              className="flex items-center gap-2 bg-[#E7C8FF] text-[#330750] rounded-full px-5 py-2 border-[0.5px] border-[#6A0BA9]"
              key={index}
            >
              <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.4485 0.769352V4.16935L8.35685 6.52769V1.80269L11.2985 0.136019C11.4128 0.0698804 11.5423 0.034395 11.6744 0.0330017C11.8064 0.0316083 11.9366 0.0643542 12.0523 0.128066C12.168 0.191777 12.2652 0.284294 12.3347 0.396648C12.4041 0.509002 12.4433 0.637384 12.4485 0.769352ZM0.406848 8.76935L3.34851 10.436L7.44851 8.15269L3.35685 5.74435L0.415181 7.41102C0.290816 7.47517 0.186383 7.57214 0.113199 7.69142C0.0400151 7.8107 0.000872931 7.94773 1.4432e-05 8.08766C-0.000844067 8.2276 0.036614 8.3651 0.108329 8.48527C0.180044 8.60543 0.28328 8.70367 0.406848 8.76935ZM13.3568 13.8694V10.4694L9.26518 8.15269V12.8777L12.2152 14.5444C12.3323 14.61 12.4647 14.6438 12.599 14.6423C12.7332 14.6408 12.8648 14.604 12.9804 14.5356C13.096 14.4673 13.1916 14.3697 13.2577 14.2528C13.3238 14.1359 13.358 14.0037 13.3568 13.8694Z" fill="#4E0A7C"/>
<path opacity="0.3" d="M5.41576 0.102717L8.35742 1.76938V6.49438L4.26576 4.16938V0.769383C4.26528 0.634575 4.30035 0.502024 4.36745 0.385098C4.43454 0.268171 4.53128 0.171003 4.64791 0.103393C4.76454 0.0357819 4.89693 0.000118986 5.03174 2.97226e-07C5.16655 -0.000118392 5.29901 0.0353113 5.41576 0.102717ZM4.49909 14.536L7.44909 12.8694V8.15272L3.35742 10.4694V13.8694C3.35778 14.003 3.39303 14.1342 3.4597 14.2499C3.52636 14.3657 3.62212 14.462 3.73748 14.5294C3.85285 14.5968 3.98382 14.6328 4.1174 14.634C4.25099 14.6352 4.38257 14.6014 4.49909 14.536ZM16.3074 7.44438L13.3658 5.77772L9.26576 8.15272L13.3574 10.4694L16.2991 8.80272C16.4235 8.73856 16.5279 8.64159 16.6011 8.52231C16.6743 8.40304 16.7134 8.26601 16.7143 8.12607C16.7151 7.98614 16.6777 7.84863 16.6059 7.72847C16.5342 7.6083 16.431 7.51006 16.3074 7.44438Z" fill="#4E0A7C"/>
</svg>
              <span className="text-sm leading-relaxed">{item}</span>
            </div>
          ))}
        </div>

        <a
          href="https://form.typeform.com/to/EMh4jnRi"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="flex items-center font-[800] justify-between gap-2 px-[28px] py-[18px] w-[200px] border-[1.5px] border-white rounded-full cursor-pointer text-sm transition">
            Get started
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
              <ChevronRight size={12} stroke="#6A0BA9" />
            </div>
          </button>
        </a>
      </div>

      {/* Right Preview Cards */}
      <div
        className="bg-[#F1DFFF] flex flex-col items-center gap-[35px] rounded-[28px] px-[32px] py-[56px] w-full h-full bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url('/tabsBackground.png')` }}
      >
        {/* Bible Plan Card */}
        <div className="rounded-[32px] px-[25px] py-[36px] h-[70%] w-full bg-[#E7C8FF]">
          <img src="./christianCourses.png" className="h-full w-full" />
        </div>

        <button className="w-fit px-[10px] py-2 bg-[#E7C8FF] text-[#4E0A7C] rounded-full text-sm font-medium transition">
          Learn, Unlearn, Relearn and Grow 🌱
        </button>
      </div>
    </div>
  );
};
