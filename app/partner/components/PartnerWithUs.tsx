import Button from "@/app/components/Button";
import { ArrowRight } from "lucide-react";

const partnershipCards = [
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

export default function PartnerWithUs(){
    return (
        <section className="bg-[#FBF6FF]">
            <div className="px-4 lg:px-[50px] xl:px-[96px] pb-16 md:pb-[108px]">
              <div className="border border-[#161717] rounded-full px-4 md:px-5 py-1 md:py-[4px] bg-[#E7C8FF] mb-5 md:mb-6 w-fit mx-auto">
                <span className="text-[#161717] text-xs sm:text-sm md:text-base font-medium">
                  Join the mission
                </span>
              </div>

              <h2 className="text-[28px] sm:text-[36px] md:text-[55px] leading-[34px] sm:leading-[44px] md:leading-tight font-bold text-center font-almarai mb-4 md:mb-6 px-1">
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
                    } sm:min-h-[240px] md:min-h-[260px] ${card.span} w-full md:h-[var(--card-h)]`}
                    style={{
                      backgroundColor: `${card.bgColor}`,
                      // set CSS var for md:h-[var(--card-h)] to read
                      ["--card-h" as any]: card.height,
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

                    <p className="text-xl sm:text-2xl md:text-[30px] font-medium leading-7 sm:leading-8 md:leading-[38px] mb-2 md:mb-3 font-almarai relative z-10 ">
                      {card.title}
                    </p>

                    <p className="text-sm sm:text-base md:text-[18px] relative z-10 ">
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
    )
}