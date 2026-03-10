import React from "react";
import { Card } from "@/app/components/Card";
import { CardContent } from "@/app/components/Card/CardContent";

interface TextWithImageContent {
  type: "text-with-image";
  text: React.ReactNode;
  image: string;
}

interface TextOnlyContent {
  type: "text-only";
  text: string;
}

interface TextWithQuoteContent {
  type: "text-with-quote";
  text: React.ReactNode;
  quote: {
    text: string;
    reference: string;
  };
}

interface TextWithLogoContent {
  type: "text-with-logo";
  paragraphs: string[];
  finalText: {
    before: string;
    logo: string;
    after: string;
    continuation: string;
  };
}

type TimelineContent =
  | TextWithImageContent
  | TextOnlyContent
  | TextWithQuoteContent
  | TextWithLogoContent;

interface TimelineItem {
  year: string;
  icon: string;
  lineHeight: string | null;
  content: TimelineContent;
}

const timelineData: TimelineItem[] = [
  {
    year: "2021",
    icon: "/about1.svg",
    lineHeight: "h-[233px] md:h-[170px]",
    content: {
      type: "text-with-image",
      text: (
        <>
          <span className="text-[#180426] text-[18px] lg:text-[26px] leading-[36px] lg:leading-[40px]">
            The seed for Breed was sown with an instruction from God to start a
            virtual discipleship platform -{" "}
          </span>
          <span className="italic text-[#4e0a7c] text-[18px] lg:text-[26px] leading-[36px] lg:leading-[40px]">
            Waxing Strong Community,
          </span>
          <span className="text-[#4e0a7c] leading-10">&nbsp;</span>
          <span className="text-[#180426] text-[18px] lg:text-[26px] leading-[36px] lg:leading-[40px]">
            where we met twice a week to study the word and pray together
          </span>
        </>
      ),
      image: "/rectangle-161124301.png",
    },
  },
  {
    year: "2021",
    icon: "/about2.svg",
    lineHeight: "h-[270px] md:h-[162px]",
    content: {
      type: "text-only",
      text: "This led to grace anew and a fostered culture of fellowship under God's guidance, but along the way, technical problems arose as the online radio service we used had its shortcomings as it was not built to foster stronger connections between people of like minds, alongside technical issues.",
    },
  },
  {
    year: "2021",
    icon: "/about3.svg",
    lineHeight: "h-[520px] md:h-[376px]",
    content: {
      type: "text-with-quote",
      text: (
        <>
          <span className="leading-[36px] lg:leading-10">
            While meditating on{" "}
          </span>
          <span className="italic leading-[36px] lg:leading-10">
            Philippians 1:25
          </span>
          <span className="leading-[36px] lg:leading-10">
            , God laid an expanded vision to combat the issues at hand, and also
            to expand on what we were already achieving at Waxing Strong by
            connecting with more people on a more consistent and measurable
            level
          </span>
        </>
      ),
      quote: {
        text: "And having this confidence, I know that I shall abide and continue with you all for your furtherance and joy of faith",
        reference: "Philippians 1:25 Kjv",
      },
    },
  },
  {
    year: "Today",
    icon: "/about4.svg",
    lineHeight: null,
    content: {
      type: "text-with-logo",
      paragraphs: [
        "Spiritual growth cannot be left to chance. It requires intentional action. Through reading sound books, listening to sermons, taking Christian courses, and maintaining a consistent prayer and study life, believers create the conditions for real growth.",
        "For ministers, it also means having the tools to guide and measure the growth of those under their stewardship, while remaining intentional about their own spiritual maturity.",
      ],
      finalText: {
        before: "All of these has led to",
        logo: "/logo3.png",
        after:
          "your spiritual growth companion app, on a mission to continue fostering",
        continuation: "a community where the ultimate goal is to see Jesus.",
      },
    },
  },
];

export const TimelineSection = (): React.ReactElement => {
  return (
    <section className="flex z-[3] w-full px-4 lg:px-[50px] xl:px-[96px] relative flex-col items-start font-aeonik mt-[48px] lg:mt-[97px]">
      {timelineData.map((item, index) => (
        <div key={`timeline-${index}`} className="flex w-full">
          {/* Icon + vertical line column */}
          <div className="flex flex-col items-center relative flex-shrink-0">
            <img
              className="w-[36px] h-[36px] lg:w-[44px] lg:h-[44px]"
              alt={`${item.year}`}
              src={item.icon}
            />

            {item.lineHeight && (
              <div
                className={`w-[1.5px] ${item.lineHeight} bg-gradient-to-b from-[#a967f1] to-[#5b26b1]`}
              />
            )}
          </div>

          {/* Content area */}
          <article className="flex items-start gap-3 lg:gap-7 w-full ml-3 lg:ml-4 mb-[48px] lg:mb-[88px]">
            {/* Year label */}
            <div className="w-[52px] lg:w-[76px] bg-[linear-gradient(179deg,rgba(169,103,241,1)_0%,rgba(91,38,177,1)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] font-bold text-transparent text-[16px] lg:text-[26px] tracking-[0] leading-[36px] lg:leading-10 flex-shrink-0">
              {item.year}
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-start justify-center gap-4 lg:gap-6 min-w-0">
              {item.content.type === "text-with-image" && (
                <>
                  <p className="w-full font-normal text-[#180426] text-[16px] lg:text-[24px] tracking-[0] leading-[32px] lg:leading-10">
                    {item.content.text}
                  </p>
                  {/* Uncomment if image is needed:
                  <img
                    className="w-full h-auto aspect-[1171/672] rounded-[20px] lg:rounded-[32px] object-cover"
                    alt="Community gathering"
                    src={item.content.image}
                  /> */}
                </>
              )}

              {item.content.type === "text-only" && (
                <p className="w-full font-normal text-[#180426] text-[16px] lg:text-[24px] tracking-[0] leading-[32px] lg:leading-10">
                  {item.content.text}
                </p>
              )}

              {item.content.type === "text-with-quote" && (
                <>
                  <p className="w-full font-normal text-[#180426] text-[16px] lg:text-[24px] tracking-[0] leading-[32px] lg:leading-10">
                    {item.content.text}
                  </p>

                  <Card className="w-full border-0 shadow-none bg-transparent">
                    <CardContent className="flex flex-col items-end justify-end gap-3 lg:gap-4 p-0">
                      <blockquote className="flex flex-col items-start gap-1 lg:gap-2 w-full">
                        <div className="flex items-center justify-center gap-2 w-full">
                          <div className="flex-1 font-courgette font-normal text-[#292a2b] text-[20px] lg:text-[24px] tracking-[0] leading-6">
                            &quot;
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 px-4 lg:px-10 py-0 w-full">
                          <div className="flex-1 font-courgette font-normal text-[#3c3e40] text-[16px] lg:text-[24px] tracking-[0] leading-[normal]">
                            {item.content.quote.text}
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 px-3 lg:px-8 py-0 w-full">
                          <div className="text-right flex-1 font-courgette font-normal text-[#292a2b] text-[32px] lg:text-[40px] tracking-[0] leading-6">
                            &quot;
                          </div>
                        </div>
                      </blockquote>

                      <div className="flex items-center justify-center gap-2 px-3 lg:px-8 py-0 w-full">
                        <cite className="flex-1 [font-family:'Courgette',Helvetica] font-normal text-[#3c3e40] text-[14px] lg:text-lg text-right tracking-[0] leading-6 not-italic">
                          {item.content.quote.reference}
                        </cite>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {item.content.type === "text-with-logo" && (
                <div className="flex flex-col items-start justify-center gap-5 lg:gap-7 w-full">
                  {item.content.paragraphs.map((paragraph, pIndex) => (
                    <p
                      key={`paragraph-${pIndex}`}
                      className="w-full font-normal text-[#180426] text-[16px] lg:text-[24px] tracking-[0] leading-[32px] lg:leading-10"
                    >
                      {paragraph}
                    </p>
                  ))}

                  <div className="flex flex-col items-start w-full gap-0">
                    {/* On mobile, wrap the inline sentence naturally */}
                    <p className="w-full font-normal text-[#180426] text-[16px] lg:text-[24px] tracking-[0] leading-[32px] lg:leading-10">
                      {item.content.finalText.before}{" "}
                      <img
                        className="inline-block h-[16px] lg:h-5  align-middle mx-1 -mt-2 g:-mt-1"
                        alt="Breed logo"
                        src={item.content.finalText.logo}
                      />{" "}
                      {item.content.finalText.after}{" "}
                      {item.content.finalText.continuation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      ))}
    </section>
  );
};
