"use client";

import Navbar from "../components/landingPage/Navbar";
import Footer from "../components/landingPage/Footer";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import { contactInfo } from "@/utils/commonHelpers";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen overflow-hidden bg-[#FBF6FF]">
        <div className="container mx-auto px-4 xl:px-[70px] pt-[150px] md:pt-[230px] mb-[118px]">
          <p className="text-[#330750] text-[56px] leading-[64px] mb-[72px] text-center text-aeonik font-bold">
            Connect With Us
          </p>
          <div className="flex flex-col lg:flex-row gap-10 w-full">
            <div className="bg-white p-10 rounded-[16px] flex flex-col gap-6 w-full lg:w-1/2">
              <div className="pb-6 border-b-[0.5px] border-[#B9C2CA]">
                <p className="text-[20px] mb-1 font-bold">
                  Start a conversation
                </p>
                <p className="text-[#60666B]">
                  Leave us a message and we’ll reach out to you swiftly
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium  mb-2"
                  >
                    Name
                  </label>
                  <div className="relative">
                    <Input
                      variant="outlined"
                      type="text"
                      id="firstName"
                      onChange={() => console.log("firstname")}
                      placeholder="Enter name"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium  mb-2"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <Input
                      variant="outlined"
                      type="text"
                      id="firstName"
                      onChange={() => console.log("firstname")}
                      placeholder="Enter email "
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium  mb-2"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Input
                      variant="outlined"
                      type="text"
                      id="firstName"
                      onChange={() => console.log("firstname")}
                      placeholder="Enter phone number "
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium  mb-2"
                  >
                    Purpose of contacting us
                  </label>
                  <Dropdown
                    value={""}
                    objectOptions={[{ name: "Nigeria" }]}
                    keySelector="name"
                    onChange={(item) => console.log(item.name)}
                    className="!h-[48px] border-[#B9C2CA] bg-white z-20 "
                  />
                </div>
                <div className="col-span-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium  mb-2"
                  >
                    Leave a message
                  </label>
                  <textarea className="w-full min-h-[96px] border border-[#B9C2CA] rounded-lg p-4" />
                </div>
              </div>
              <Button customClass="!w-[85%] !mx-auto !text-white">
                Join Us Today
              </Button>
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
      </div>
      <Footer />
    </>
  );
}
