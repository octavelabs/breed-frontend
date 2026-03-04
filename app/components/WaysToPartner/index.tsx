"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import Button from "../Button";

type PartnershipCard = {
  title: string;
  description: string;
  image: string;
  bgColor: string;
  height: string; // e.g. "340px"
  span: string; // e.g. "md:col-span-2 lg:col-span-3"
  hasButton?: boolean;
};

export default function WaysToPartner({
  partnershipCards,
  Button,
}: {
  partnershipCards: PartnershipCard[];
  Button: any;
}) {
  return (
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

        <p className="text-sm sm:text-base md:text-[18px] text-center leading-6 md:leading-[25.2px] mb-6 md:mb-6 px-1">
          Every partnership makes a difference.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-3">
          {partnershipCards.map((card, index) => (
            <div
              key={index}
              className={`relative rounded-2xl md:rounded-[32px] pt-8 sm:pt-10 md:pt-[56px] px-5 sm:px-6 md:px-[36px] text-white overflow-hidden ${card.span}`}
              style={{
                backgroundColor: `${card.bgColor}`,
                height: `${card.height}`,
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
                className="absolute bottom-0 right-0 h-24 w-24 sm:h-28 sm:w-28 md:h-[144px] md:w-[144px] rounded-br-2xl md:rounded-br-[32px]"
              />

              <p className="text-xl sm:text-2xl md:text-[30px] font-medium leading-7 sm:leading-8 md:leading-[38px] mb-2 md:mb-3 font-aeonik relative z-10 pr-16 sm:pr-20 md:pr-[160px]">
                {card.title}
              </p>

              <p className="text-sm sm:text-base md:text-[18px] relative z-10 pr-10 sm:pr-14 md:pr-[140px]">
                {card.description}
              </p>

              {card.hasButton && (
                <div className="relative z-10 mt-8 sm:mt-10 md:mt-[88px]">
                  <Button
                    buttonType="custom"
                    customClass="!w-full sm:!w-[200px] md:!w-[160px] !h-[52px] sm:!h-[56px] !text-[#5B26B1] !bg-white"
                    onClick={() => console.log("done")}
                    type="button"
                  >
                    <p className="flex items-center justify-center gap-[10px] text-sm sm:text-base">
                      Give now{" "}
                      <ArrowRight className="w-5 h-4" stroke="#5B26B1" />
                    </p>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
