'use client'

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GetBreedApp from "../components/landingPage/GetBreedApp";
import Navbar from "../components/landingPage/Navbar";
import Footer from "../components/landingPage/Footer";
import Link from "next/link";

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
      
      title: 'Stay Free',
      description: 'The app remains free so every church and believer can participate without financial pressure.'
    },
    {
      
      title: 'Product excellence',
      description: 'Every update strengthens the tools that support ministry, kingdom collaboration, and growth.'
    },
    {
     
      title: 'Wider reach',
      description: 'We bring more churches and believers onboard, strengthening connections and increasing collective impact.'
    },
    {

      title: 'Sustainable growth',
      description: 'We make careful decisions that protect trust, maintain quality, and ensure the platform serves communities well into the '
    },
    {
        
      title: 'Shared Stewarship',
      description: 'Together, we manage resources wisely and make decisions that protect trust and ensure long term sustainability.'
    }
  ];

  const partnershipCards = [
    {
      title: 'Advocacy',
      description: 'Share Breed with your church, small group, or on social media. Help us reach more believers.',
      span: "col-span-3",
      bgColor: '#2D307B',
      image: '📢',
      hasButton: false,
      height: '248px'
    },
    {
      title: 'Church Partnerships',
      description: 'Partner with us to integrate Breed into your church community and discipleship programs.',
      span: "col-span-3",
      bgColor: '#4E5255',
      image: '⛪',
      hasButton: false,
      height: '248px'
    },
    {
      title: 'Intercessory Prayers',
      description: 'Commit to praying regularly for Breed\'s mission, team, and the believers we serve.',
      span: "col-span-2",
      bgColor: '#A22F6E',
      image: '🙏',
    hasButton: false,
    height: '424px'
    },
    {
      title: 'Skill & Advisory',
      description: 'Offer your professional expertise in tech, design, content, or ministry to help us grow.',
      span: "col-span-2",
      bgColor: '#6A0BA9',
      image: '💡',
      hasButton: false,
      height: '424px'
    },
    {
      title: 'Financial Support',
      description: 'One-time or recurring donations help us keep Breed free and continuously improving.',
      span: "col-span-2",
      bgColor: '#180426',
      image: '💰',
    hasButton: true,
    height: '424px'
    }
  ];

  return (
    <>
    <Navbar />
    <div className="min-h-screen overflow-hidden bg-[#F7EDFE]">
      <div className="">
        <div className="relative flex justify-center bg-cover bg-center px-4 pt-[150px] md:pt-[230px] h-screen" style={{
                backgroundImage: `url('/partnerWithUs.jpg')`,
        }}>
            <div>
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
          className="text-[42px] lg:text-[80px] text-center text-white font-[900] text-[#180426] leading-tight mt-4 font-aeonik">
            More than an app <br /> A MOVEMENT
           
          </motion.h1>
          </div>
        </div>
<section>
    <div className="container mx-auto text-center  px-4 py-[276px]">
        <p className="text-[56px] font-medium leading-[72px] font-aeonik">
          Breed is intentionally free because we believe<br />
          spiritual growth should never sit behind a paywall.<br />
          Every <span className="font-aeonik text-[56px] bg-white text-[#5B26B1] leading-[68px] px-[2px] rounded-[2px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A]">devotional</span>,
          <span className="font-aeonik text-[56px] bg-white text-[#A22F6E] leading-[68px] px-[2px] rounded-[2px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A]">prayer thread</span>,
          <span className="font-aeonik text-[56px] bg-white text-[#34399C] leading-[68px] px-[2px] rounded-[2px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A]">sermon tool</span>, and <span className="font-aeonik text-[56px] bg-white text-[#1A8454] leading-[68px] shadow-[0px_4px_4px_-4px_#0C0C0D0D,0px_16px_16px_-8px_#0C0C0D1A]">growth tracker</span>
          exists for one purpose:
        </p>
       
      </div>
</section>
<section className="bg-white py-[104px] ">
      <div className="container  mx-auto px-4">
        <div className="bg-[#330750] rounded-[40px] py-[64px] px-20 shadow-2xl" >
           <div className="border border-[#161717] rounded-full px-5 py-[4px] bg-[#E7C8FF] mb-5 w-fit mx-auto">
              <span className="text-[#161717] text-xs md:text-base font-medium font-aeonik">
               Why we need you
              </span>
            </div>
         
            <p className="mb-8 text-white text-[32px] leading-[44px] font-bold mb-4 text-center">
              A global discipleship platform does not grow on vision alone. <br />
              It depends on people who believe in the mission.
            </p>
            <p className="text-[20px] font-medium text-white mb-6 text-center">Your partnership allows breed to achieve the following:</p>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {whatToAchieve.map((item, index) => (
              <div 
                key={index}
                className="bg-[#4E0A7C] relative rounded-[16px] py-[28px] px-5" >
                     <div
    className="absolute inset-0 bg-cover bg-center opacity-20"
    style={{ backgroundImage: "url('/partnerCardBackground.png')" }}
  />
  <div className="relative z-10">
                <div className="bg-[#330750] border-[0.5px] border-[#6A0BA9] rounded-[8px] mb-8 flex justify-center items-center w-8 h-8">
                    <img src='/partnerPage.svg' />
                </div>
                <p className="text-[18px] text-white font-semibold mb-5">{item.title}</p>
                <p className="text-white text-base leading-relaxed">
                  {item.description}
                </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-bold text-lg mb-3">Sustainable Growth</h3>
              <p className="text-purple-100 text-sm leading-relaxed mb-4">
                Your partnership helps us maintain free access while building features that truly serve spiritual growth.
              </p>
              <button className="text-purple-300 text-sm font-semibold hover:text-white transition-colors">
                Learn More →
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-white font-bold text-lg mb-3">Organic Community</h3>
              <p className="text-purple-100 text-sm leading-relaxed mb-4">
                Every contribution directly supports server costs, development, and creating content that helps people grow closer to God.
              </p>
              <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full font-semibold transition-all">
                View Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="bg-white">
        <div className="container m-auto">
        <div className="border border-[#161717] rounded-full px-5 py-[4px] bg-[#E7C8FF] mb-6 w-fit mx-auto">
              <span className="text-[#161717] text-xs md:text-base font-medium">
               Join the mission
              </span>
            </div>
         
            <h2 className="mb-8 text-[55px] leading-tight font-bold mb-6 text-center font-aeonik">
             Ways You Can Partner with Us
            </h2>
            <p className="text-[18px] mb-6 text-center leading-[25.2px]">Every partnership makes a difference.</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-3">
          {partnershipCards.map((card, index) => (
            <div
          key={index}
          className={`rounded-[32px] px-[36px] text-white ${card.span}`} style={{backgroundColor: `${card.bgColor}`, height: `${card.height}`}}
        >
          <p className="text-[36px] font-medium leading-[48px] mb-3">{card.title}</p>
        </div>
          ))}
        </div>
  </div>
    </section>
      </div>
  
    </div>
    <Footer />
    </>
  );
}
