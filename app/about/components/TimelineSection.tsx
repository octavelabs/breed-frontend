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
    lineHeight: "h-[170px]",
    content: {
      type: "text-with-image",
      text: (
        <>
          <span className="text-[#180426] text-[26px] leading-[40px]">
            The seed for Breed was sown with an instruction from God to start a
            virtual discipleship platform - {" "}
          </span>
          <span className="italic text-[#4e0a7c] text-[26px] leading-[40px]">
            Waxing Strong Community,
          </span>
          <span className="text-[#4e0a7c] leading-10">&nbsp;</span>
          <span className="text-[#180426] text-[26px] leading-[40px]">
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
    lineHeight: "h-[162px]",
    content: {
      type: "text-only",
      text: "This led to grace anew and a fostered culture of fellowship under God's guidance, but along the way, technical problems arose as the online radio service we used had its shortcomings as it was not built to lorem ipsum",
    },
  },
  {
    year: "2021",
    icon: "/about3.svg",
    lineHeight: "h-[376px]",
    content: {
      type: "text-with-quote",
      text: (
        <>
          <span className="leading-10">While meditating on </span>
          <span className="italic leading-10">
            Philippians 1:25
          </span>
          <span className="leading-10">
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
        "Spiritual growth cannot be left to chance—it requires intentional action. Through reading sound books, listening to sermons, taking Christian courses, and maintaining a consistent prayer and study life, believers create the conditions for real growth.",
        "For ministers, it also means having the tools to guide and measure the growth of those under their stewardship, while remaining intentional about their own spiritual maturity.",
      ],
      finalText: {
        before: "All of these has led to",
        logo: "/logo3.png",
        after:
          "your spiritual growth companion app, on a mission to continue fostering",
        continuation: "a community",
      },
    },
  },
];

export const TimelineSection = (): React.ReactElement => {
  return (
    <section className="flex z-[3] w-full max-w-[1319px] mx-auto px-4 relative flex-col items-start font-aeonik mt-[97px]">
      {timelineData.map((item, index) => (
        <div key={`timeline-${index}`} className="flex w-full">
          <div className="flex flex-col items-center relative">
            <div className="w-[44px] h-[44px] border border-[#5B26B1] rounded-full relative z-10 bg-[#D49CFD] flex justify-center items-center">
            <img
              className="h-[30px] w-[30px] object-cover "
              alt={` ${item.year}`}
              src={item.icon}
            />
            </div>
            

            {item.lineHeight && (
              <div
                className={`w-[1.5px] ${item.lineHeight} bg-gradient-to-b from-[#a967f1] to-[#5b26b1]`}
              />
            )}
          </div>

          <article className="flex items-start gap-7 w-full ml-7 mb-[88px]">
            <div className="w-[76px] bg-[linear-gradient(179deg,rgba(169,103,241,1)_0%,rgba(91,38,177,1)_100%)] [-webkit-background-clip:text] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] font-bold text-transparent text-[26px] tracking-[0] leading-10 flex-shrink-0">
              {item.year}
            </div>

            <div className="flex-1 flex flex-col items-start justify-center gap-6">
              {item.content.type === "text-with-image" && (
                <>
                  <p className="w-full font-normal text-[#180426] text-[24px] tracking-[0] leading-10">
                    {item.content.text}
                  </p>
                  {/* <img
                    className="w-full  h-auto aspect-[1171/672] rounded-[32px] object-cover"
                    alt="Community gathering"
                    src={item.content.image}
                  /> */}
                </>
              )}

              {item.content.type === "text-only" && (
                <p className="w-full  font-normal text-[#180426] text-[24px] tracking-[0] leading-10">
                  {item.content.text}
                </p>
              )}

              {item.content.type === "text-with-quote" && (
                <>
                  <p className="w-full  font-normal text-[#180426] text-[24px] tracking-[0] leading-10">
                    {item.content.text}
                  </p>

                  <Card className="w-full  border-0 shadow-none bg-transparent">
                    <CardContent className="flex flex-col items-end justify-end gap-4 p-0">
                      <blockquote className="flex flex-col items-start gap-2 w-full">
                        <div className="flex items-center justify-center gap-2 w-full">
                          <div className="flex-1 font-courgette font-normal text-[#292a2b] text-[24px] tracking-[0] leading-6">
                            &quot;
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 px-10 py-0 w-full">
                          <div className="flex-1 font-courgette font-normal text-[#3c3e40] text-[24px] tracking-[0] leading-[normal]">
                            {item.content.quote.text}
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 px-8 py-0 w-full">
                          <div className="text-right flex-1 font-courgette font-normal text-[#292a2b] text-[40px] tracking-[0] leading-6">
                            &quot;
                          </div>
                        </div>
                      </blockquote>

                      <div className="flex items-center justify-center gap-2 px-8 py-0 w-full">
                        <cite className="flex-1 [font-family:'Courgette',Helvetica] font-normal text-[#3c3e40] text-lg text-right tracking-[0] leading-6 not-italic">
                          {item.content.quote.reference}
                        </cite>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {item.content.type === "text-with-logo" && (
                <div className="flex flex-col items-start justify-center gap-7 w-full">
                  {item.content.paragraphs.map((paragraph, pIndex) => (
                    <p
                      key={`paragraph-${pIndex}`}
                      className="w-full max-w-[1171px] font-normal text-[#180426] text-[24px] tracking-[0] leading-10"
                    >
                      {paragraph}
                    </p>
                  ))}

                  <div className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-2 w-full">
                      <span className="w-fit font-normal text-[#180426] text-[24px] tracking-[0] leading-10 whitespace-nowrap">
                        {item.content.finalText.before}
                      </span>

                      <img
                        className="w-[73.87px] h-7"
                        alt="Breed logo"
                        src={item.content.finalText.logo}
                      />

                      <span className="flex-1 font-normal text-[#180426] text-[24px] tracking-[0] leading-[30px]">
                        {item.content.finalText.after}
                      </span>
                    </div>

                    <p className="w-full max-w-[1171px] font-normal text-[#180426] text-[24px] tracking-[0] leading-[30px]">
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
