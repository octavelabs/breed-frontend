import { ArrowRight } from "lucide-react";
import Testimonials from "./Testimonial";


export default function GetBreedApp() {
  return (
    <>
      <Testimonials />
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="bg-[#F7EDFE] pt-12 pb-5 md:py-20">
          <div className="container mx-auto text-center">
            {/* Badge */}
            <div className="inline-block mb-8">
              <div className="border border-purple-400 text-purple-700 px-4 py-1.5 rounded-full text-xs font-semibold">
                Lorem Ipsum
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-[26px] xl:text-[55px] font-bold text-[#101828] font-aeonik mb-6 leading-tight">
              Get The Breed App
            </h1>

            {/* Description */}
            <p className="text-[#4E5255] text-sm xl:text-[18px] mb-12  mx-auto font-medium px-4">
              Start your journey towards experiencing progress and joy in the
              faith every single day by downloading the Breed App
            </p>

            {/* Phone Mockup */}
            <div className="flex w-full lg:w-[70%] xl:w-[768px] h-[768px] mx-auto justify-center xl:mb-12 relative -top-[55px]">
              <img src="./breedApp.png" alt="Breed App on phone" className="w-full h-full object-cover scale-[0.8]" />
            </div>

            {/* Download Button */}
            <div className="flex justify-center mb-20">
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
            </div>
          </div>
        </div>

        {/* CTA Section - Dark Navy with Image */}
        <div className="container mx-auto px-4 py-12">
          <div className="bg-[#180426] rounded-[24px] xl:rounded-[40px] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative min-h-64 md:min-h-auto order-2 md:order-1">
                <img
                  src="./breedApp2.png"
                  alt="People praying together"
                  className="w-full h-full object-cover rounded-3xl md:rounded-none"
                />
              </div>

              {/* Content */}
              <div className="p-8 md:p-12 flex flex-col items-center text-center xl:items-start xl:text-start order-1 md:order-2">
                <h2 className="text-[24px] xl:text-[36px] font-black text-white mb-4 leading-tight font-aeonik">
                  Rooted in Christ, Growing Together
                </h2>

                <p className=" mb-8 text-sm xl:text-base leading-relaxed">
                  Whether you're just beginning or leading others, Breed is your
                  space to grow in Christ, stay accountable, and walk in
                  purpose. Join here and take the next step in your faith
                  journey.
                </p>

                <button className="text-sm inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full font-semibold transition-all w-fit">
                  Join Us Today
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
