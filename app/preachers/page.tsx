import { ArrowRight } from "lucide-react";
import GetBreedApp from "../components/GetBreedApp";

export default function PreachersPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7EDFE]">
      <div className="container mx-auto px-4 pt-[150px] md:pt-[230px]">
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center relative z-10 mb-8">
            <div className="inline-block mb-6">
              <div className="border border-[#161717] rounded-full px-5 py-[6px] bg-[#E7C8FF]">
                <span className="text-[#161717] text-sm md:text-base font-medium">
                  For All Preachers
                </span>
              </div>
            </div>
            <h1 className="text-[32px] lg:text-[80px] font-[900] font-aeonik text-[#180426] leading-tight mb-6">
              Lead With Purpose
            </h1>
            <p className="text-base xl:text-[20px] text-[#4E5255] mb-10  mx-auto">
              For pastors, preachers, and leaders called to teach, disciple, and
              equip the body of Christ.
            </p>
         <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="w-[90%] md:w-auto justify-center group flex items-center gap-3 px-8 py-4 bg-white border-2 border-purple-700 text-purple-700 rounded-full  text-base hover:bg-purple-50 transition-all shadow-sm font-bold">
              Download app
              <div className="flex items-center gap-1">
                <img src="/apple.svg" className="w-5 h-5" />
                <img src="/google-play.svg" className="w-5 h-5 fill-current" />
              </div>
            </button>

            <button className="w-[90%] md:w-auto px-8 py-4 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full  text-base hover:bg-purple-800 transition-all shadow-lg font-bold">
              Join Us Today
            </button>
          </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="bg-purple-600 rounded-[32px] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 ">
              <div className="px-5 xl:px-12 py-10 xl:py-20 flex flex-col justify-between text-white">
                <div>
                  <h2 className="text-[28px] leading-[42px] xl:text-[50px] font-medium xl:leading-[64px] font-aeonik mb-8 xl:mb-0">
                    Curate bible plans, devotionals, and discipleship content{" "}
                    <ArrowRight className="w-[35px] h-[27px] inline-block" />
                  </h2>
                </div>
                <div className="w-full xl:w-[80%] bg-[#E7C8FF] rounded-[14px] xl:rounded-[28px] p-4 xl:p-6 flex  gap-4 border-[2.5px] border-[#FFFFFF8A] shadow-[0px_1.2px_29.92px_0px_#452A7C1A]">
                  <div className="flex-1">
                    <p className="text-xs text-[#60666B] mb-[6px]">
                      Bible plan
                    </p>
                    <p className="text-xs text-black mb-3">
                      Grace is God's response to our brokenness undeserved, yet
                      freely given through the gift of Christ.
                    </p>
                    <p className="text-xs text-[#60666B]">
                      📅 &nbsp; Today · 3 Chapters
                    </p>
                  </div>
                  <div className="w-[96px] rounded-[11px] flex items-center justify-center flex-shrink-0">
                    <img src="./DailyEdification1.png" />
                  </div>
                </div>
              </div>

              <div className="relative min-h-80 md:min-h-auto p-2">
                <img
                  src="./Rectangle.png"
                  alt="Woman praying"
                  className="w-full h-full object-cover rounded-[32px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Card 2 - Dark Blue */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="bg-[#34399C] rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="px-5 xl:px-12 py-10 xl:py-20 flex flex-col justify-between text-white order-2 md:order-1">
                <h2 className="text-[28px] leading-[42px] xl:text-[50px] font-medium xl:leading-[64px] mb-[78px] xl:mb-[224px] font-aeonik">
                  Get insights into how <br /> your members/disciples <br /> are
                  engaging <ArrowRight className="w-[35px] h-[27px] inline-block" />
                </h2>
                <div className="w-full xl:w-[80%] bg-[#E7C8FF] rounded-[14px] xl:rounded-[28px]  border-[2.5px] border-[#FFFFFF8A] shadow-[0px_1.2px_29.92px_0px_#452A7C1A]">
                  <img src="./frame3.png" />
                </div>
              </div>

              <div className="relative min-h-80 md:min-h-auto order-1 md:order-2 p-2">
                <img
                  src="./preacher.png"
                  alt="Man reading bible"
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Card 3 - Pink */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="bg-[#C83785] rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="px-5 xl:px-12 py-10 xl:py-20  flex flex-col justify-between text-white">
                <h2 className="text-[28px] leading-[42px] xl:text-[50px] font-medium xl:leading-[64px] mb-[78px] font-aeonik">
                  Nurture deeper fellowship through online prayer circles, group
                  discussions, and focused teaching hub{" "}
                  <ArrowRight className="w-[35px] h-[27px] inline-block" />
                </h2>

                <div className="w-full xl:w-[80%] bg-[#E7C8FF] rounded-[14px] xl:rounded-[28px]  border-[2.5px] border-[#FFFFFF8A] shadow-[0px_1.2px_29.92px_0px_#452A7C1A]">
                  <img src="./frame2.png" />
                </div>
              </div>

              <div className="relative min-h-80 md:min-h-auto p-2">
                <img
                  src="./believer.png"
                  alt="Hands praying together"
                  className="w-full h-full object-cover rounded-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <GetBreedApp />
    </div>
  );
}
