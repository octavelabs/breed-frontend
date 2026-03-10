"use client";

import { useState } from "react";
import Navbar from "../components/landingPage/Navbar";
import Footer from "../components/landingPage/Footer";
import Input from "../components/Input";
import Dropdown from "../components/Dropdown";
import Button from "../components/Button";
import { contactInfo } from "@/utils/commonHelpers";

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  purpose: string;
  message: string;
};

const contactPurpose = [
  { name: "Volunteer" },
  { name: "Partner" },
  { name: "Creator" },
  { name: "Support" },
];

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    purpose: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  type AlertType = {
    type: "success" | "error";
    message: string;
  } | null;

  const [alert, setAlert] = useState<AlertType>(null);

  const handleChange = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name) return "Name is required";
    if (!form.email) return "Email is required";
    if (!form.purpose) return "Please select a purpose";
    if (!form.message) return "Message is required";

    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();

    if (error) {
      setAlert({ type: "error", message: error });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAlert({
        type: "success",
        message: "Message sent successfully! We'll get back to you soon.",
      });

      setForm({
        name: "",
        email: "",
        phone: "",
        purpose: "",
        message: "",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to send message. Please try again.",
      });
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div className="h-full overflow-hidden bg-[#FBF6FF]">
        <div className="px-4 lg:px-[50px] xl:px-[184px] pt-[150px] md:pt-[230px] mb-[118px]">
          <p className="text-[#330750] text-[35px] xl:text-[56px] xl:leading-[64px] mb-[72px] text-center font-aeonik font-bold">
            Connect With Us
          </p>

          <div className="flex flex-col lg:flex-row gap-10 w-full">
            {/* FORM */}
            <div className="bg-white p-10 rounded-[16px] flex flex-col gap-6 w-full lg:w-1/2">
              <div className="pb-6 border-b border-[#B9C2CA]">
                <p className="text-[20px] mb-1 font-bold">
                  Start a conversation
                </p>
                <p className="text-[#60666B]">
                  Leave us a message and we’ll reach out to you swiftly
                </p>
              </div>

              {alert && (
                <div
                  className={`p-3 rounded text-sm ${
                    alert.type === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {alert.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* NAME */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Name</label>

                  <Input
                    variant="outlined"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter name"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email address
                  </label>

                  <Input
                    variant="outlined"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Enter email"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>

                  <Input
                    variant="outlined"
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                {/* PURPOSE */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Purpose of contacting us
                  </label>

                  <Dropdown
                    value={form.purpose}
                    objectOptions={contactPurpose}
                    keySelector="name"
                    onChange={(item) => handleChange("purpose", item.name)}
                    className="!h-[48px] border-[#B9C2CA] bg-white"
                  />
                </div>

                {/* MESSAGE */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Leave a message
                  </label>

                  <textarea
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    className="w-full min-h-[96px] border border-[#B9C2CA] rounded-lg p-4"
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                customClass="!w-[85%] !mx-auto !text-white"
              >
                {loading ? "Sending..." : "Join Us Today"}
              </Button>
            </div>

            {/* RIGHT SIDE CONTENT */}
            <div className="w-full lg:w-1/2">
              <div className="bg-[#F7EDFE] rounded-[16px] p-6">
                <p className="font-medium text-[#180426] mb-[18px]">
                  Social media
                </p>

                <div className="flex items-center gap-5">
                  <a href="https://www.instagram.com/joinbreed" target="_blank">
                    <img src="/instagram.svg" />
                  </a>

                  <a href="https://www.facebook.com" target="_blank">
                    <img src="/facebook.svg" />
                  </a>

                  <a href="https://threads.net/joinbreed" target="_blank">
                    <img src="/threads-fill.svg" />
                  </a>

                  <a href="https://www.x.com/joinbreed" target="_blank">
                    <img src="/twitter.svg" />
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-3 mt-6">
                {" "}
                {contactInfo.map((item) => (
                  <div
                    className="bg-[#F7EDFE] rounded-[16px] p-6 h-fit mb-3"
                    key={item.title}
                  >
                    {" "}
                    <p className="font-medium text-[#180426] mb-[18px]">
                      {" "}
                      {item.title}{" "}
                    </p>{" "}
                    <p className="text-[#3C3E40]">{item.email}</p>{" "}
                  </div>
                ))}{" "}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
