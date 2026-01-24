import { ArrowRight } from "lucide-react";
import GetBreedApp from "../components/GetBreedApp";
export default function BelieversPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#F7EDFE]">
      <div className="container mx-auto px-4 pt-16 md:pt-[250px]">
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center relative z-10 mb-8">
            <div className="inline-block mb-6">
              <div className="border border-[#161717] rounded-full px-5 py-[6px] bg-[#E7C8FF]">
                <span className="text-[#161717] text-sm md:text-base font-medium">
                  For All Believers
                </span>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-aeonik font-[900] text-[#180426] leading-tight mb-6">
              Grow in Grace
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto font-medium">
              For believers seeking spiritual growth and new converts beginning
              their faith journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group flex items-center gap-3 px-8 py-4 bg-white border-2 border-purple-700 text-purple-700 rounded-full  text-base hover:bg-purple-50 transition-all shadow-sm font-bold">
                Download app
                <div className="flex items-center gap-1">
                  <img src="/apple.svg" className="w-5 h-5" />
                  <img
                    src="/google-play.svg"
                    className="w-5 h-5 fill-current"
                  />
                </div>
              </button>

              <button className="px-8 py-4 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full  text-base hover:bg-purple-800 transition-all shadow-lg font-bold">
                Join Us Today
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="bg-purple-600 rounded-[32px] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 ">
              <div className="px-4 md:px-12 py-20 flex flex-col justify-between text-white">
                <div>
                  <h2 className="text-4xl md:text-[50px] font-medium leading-[64px] font-aeonik">
                    Access devotionals, guided Bible plans, and prayer prompts{" "}
                    <ArrowRight className="w-[35px] h-[27px]" />
                  </h2>
                  {/* <div className="inline-flex items-center gap-2">
                  <span className="text-xl">→</span>
                </div> */}
                </div>

                <div className="w-[80%] bg-[#E7C8FF] rounded-[28px] p-6 flex  gap-4 border-[2.5px] border-[#FFFFFF8A] shadow-[0px_1.2px_29.92px_0px_#452A7C1A]">
                  <div className="flex-1">
                    <p className="text-xs text-[#60666B] mb-[6px]">
                      Personal Devotion
                    </p>
                    <p className="text-xs text-black mb-3">
                      Lord, help me to develop and sustain a consistent time of
                      fellowship with You, no matter how busy life gets.
                    </p>
                    <p className="text-xs text-gray-500">🕐 4 · 5mins</p>
                  </div>
                  <div className="w-[96px] rounded-[11px] flex items-center justify-center flex-shrink-0">
                    <img src="./DailyEdification2.png" />
                  </div>
                </div>
              </div>

              <div className="relative min-h-80 md:min-h-auto p-2">
                <img
                  src="./hero1.png"
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
              <div className="px-4 md:px-12 py-20 flex flex-col justify-between text-white order-2 md:order-1">
                <div>
                  <h2 className="text-4xl md:text-[50px] font-medium leading-[64px] font-aeonik">
                    Grow in faith alongside a community of believers like you{" "}
                    <ArrowRight className="w-[35px] h-[27px]" />
                  </h2>
                </div>

                <div className="w-[80%] bg-[#FFFFFF66]  rounded-[28px] p-6 flex  items-center gap-4 border-[2.5px] border-[#FFFFFF8A] shadow-[0px_1.2px_29.92px_0px_#452A7C1A]">
                  <div className="w-[32px] h-[32px] md:w-[64px] md:h-[64px] rounded-[8px] overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=400&fit=crop"
                      alt="Believers group"
                      className="w-full h-full object-cover grayscale"
                    />
                  </div>

                  {/* Center: Title and avatars */}
                  <div className="flex-1 flex flex-col gap-2">
                    <h2 className="text-base font-medium text-[#330750]">
                      Believers that Hangout
                    </h2>

                    {/* Avatar group with count */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-3">
                        <div className="w-12 h-12 md:w-6 md:h-6 rounded-full border-4 border-purple-200 overflow-hidden bg-gray-300">
                          <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                            alt="Member 1"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-12 h-12 md:w-6 md:h-6 rounded-full border-4 border-purple-200 overflow-hidden bg-gray-300">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                            alt="Member 2"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-12 h-12 md:w-6 md:h-6 rounded-full border-4 border-purple-200 overflow-hidden bg-gray-300">
                          <img
                            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
                            alt="Member 3"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Count badge */}
                      <div className="bg-[#A1A6E7] text-[#0F0F20] px-[3.5px] py-[1.5px] rounded-full text-[10px]">
                        +40
                      </div>
                    </div>
                  </div>

                  {/* Right: Calendar icon */}
                  <div className="w-[52px] h-[52px]">
                    <img src="./beach.svg" className="w-full h-full" />
                  </div>
                </div>
              </div>

              <div className="relative min-h-80 md:min-h-auto order-1 md:order-2 p-2">
                <img
                  src="./hero2.png"
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
              <div className="px-4 md:px-12 py-20 flex flex-col justify-between text-white">
                <div>
                  <h2 className="text-4xl md:text-[50px] font-medium leading-[64px] font-aeonik">
                    Share prayer requests and pray with others in real time{" "}
                    <ArrowRight className="w-[35px] h-[27px]" />
                  </h2>
                </div>

                <div className="w-[80%] bg-[#E7C8FF] rounded-[28px]  border-[2.5px] border-[#FFFFFF8A] shadow-[0px_1.2px_29.92px_0px_#452A7C1A]">
                  <img src="./Frame2.png" />
                </div>
              </div>

              <div className="relative min-h-80 md:min-h-auto p-2">
                <img
                  src="./believer.png"
                  alt="Hands praying together"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Card 4 - Green */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="bg-green-600 rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="px-4 md:px-12 py-20 flex flex-col justify-between text-white order-2 md:order-1">
                <div>
                  <h2 className="text-4xl md:text-[50px] font-medium leading-[64px] font-aeonik">
                    Track your growth - not for performance, but for purpose{" "}
                    <ArrowRight className="w-[35px] h-[27px]" />
                  </h2>
                </div>

                <div className="mt-8 bg-green-500/50 rounded-2xl p-4 backdrop-blur-sm w-[80%]">
                  <p className="text-sm font-semibold mb-3">
                    Consistency is key
                  </p>
                  <div className="flex gap-1">
                    <div className="flex-1 h-6 bg-green-400 rounded flex items-center justify-center text-xs font-bold">
                      M
                    </div>
                    <div className="flex-1 h-6 bg-green-300 rounded flex items-center justify-center text-xs font-bold">
                      T
                    </div>
                    <div className="flex-1 h-6 bg-green-400 rounded flex items-center justify-center text-xs font-bold">
                      W
                    </div>
                    <div className="flex-1 h-6 bg-green-300 rounded flex items-center justify-center text-xs font-bold">
                      T
                    </div>
                    <div className="flex-1 h-6 bg-green-400 rounded flex items-center justify-center text-xs font-bold">
                      F
                    </div>
                    <div className="flex-1 h-6 bg-green-300 rounded flex items-center justify-center text-xs font-bold">
                      S
                    </div>
                    <div className="flex-1 h-6 bg-green-400 rounded flex items-center justify-center text-xs font-bold">
                      S
                    </div>
                    <span className="ml-2 text-sm font-bold">7</span>
                  </div>
                </div>
              </div>

              <div className="relative min-h-80 md:min-h-auto order-1 md:order-2 p-2">
                <img
                  src="./believer2.png"
                  alt="Growth tracking"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GetBreedApp />
    </div>
  );
}
