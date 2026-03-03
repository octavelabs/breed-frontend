"use client";

import Navbar from "../components/landingPage/Navbar";
import Footer from "../components/landingPage/Footer";
import Accordion from "../components/Accordion";
import { contactInfo, faqs } from "@/utils/commonHelpers";
import GetBreedApp from "../components/landingPage/GetBreedApp";

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-hidden bg-[#FBF6FF]">
        <div className="container mx-auto px-4 xl:px-[70px] pt-[150px] md:pt-[230px] mb-[118px]">
          <p className="text-[#330750] text-[56px] leading-[64px] mb-[72px] text-center text-aeonik font-bold">
            Frequently asked questions
          </p>
          <div className="flex flex-col lg:flex-row gap-10 w-full items-start">
            <div className="bg-[#F7EDFE] px-[28px] py-2 rounded-[16px] flex flex-col gap-6 w-full lg:w-1/2">
              <Accordion items={faqs} defaultOpen={0} />
            </div>
            <div className="w-full lg:w-1/2">
              <div className="bg-[#F7EDFE] rounded-[16px] p-6 h-fit mb-3">
                <p className="font-medium text-[#180426] mb-[18px]">
                  Social media
                </p>
                <div className=" flex items-center gap-5">
                  <a
                    href="https://www.instagram.com/joinbreed"
                    target="_blank"
                    rel="noreferrer"
                    className=""
                  >
                    <img src="/instagram.svg" alt="instagram " />
                  </a>
                  <a
                    href="https://www.facebook.com/share/1CBghY2MbV/?mibetid=wwXIfr"
                    target="_blank"
                    rel="noreferrer"
                    className=""
                  >
                    <img src="/facebook.svg" alt="facebook" />
                  </a>
                  <a
                    href="https://threads.net/joinbreed"
                    target="_blank"
                    rel="noreferrer"
                    className=""
                  >
                    <img src="/threads-fill.svg" alt="threads" />{" "}
                  </a>
                  <a
                    href="https://www.x.com/joinbreed"
                    target="_blank"
                    rel="noreferrer"
                    className=""
                  >
                    <img src="/twitter.svg" alt="twitter" />{" "}
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {contactInfo.map((item) => (
                  <div
                    className="bg-[#F7EDFE] rounded-[16px] p-6 h-fit mb-3"
                    key={item.title}
                  >
                    <p className="font-medium text-[#180426] mb-[18px]">
                      {item.title}
                    </p>
                    <p className="text-[#3C3E40]">{item.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <GetBreedApp showTestimonials={false} bgColor="#00000" />
      </div>
      <Footer />
    </>
  );
}
