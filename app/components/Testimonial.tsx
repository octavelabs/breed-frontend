import { Quote, Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "As a new believer, I didn’t know where to start. Breed gave me structure, daily encouragement, and a space where I could ask questions without feeling lost. I finally feel like I’m growing in the right direction.",
      author: "Amara Okafor",
      location: "Lagos",
      role: "Tech Entrepreneur",
      color: "#F3C4DD",
    },
    {
      quote:
        "As a new believer, I didn’t know where to start. Breed gave me structure, daily encouragement, and a space where I could ask questions without feeling lost. I finally feel like I’m growing in the right direction.",
      author: "Joshua E",
      location: "Lagos",
      role: "Senior Pastor, Havilah HOG",
      color: "#E7C8FF",
    },
    {
      quote:
        "As a new believer, I didn’t know where to start. Breed gave me structure, daily encouragement, and a space where I could ask questions without feeling lost. I finally feel like I’m growing in the right direction.",
      author: "Grace Mensah",
      location: "Lagos",
      role: "Product Manager",
      color: "#C8DBFF",
    },
  ];

  return (
    <div className="mt-[104px] flex gap-6 w-[90%] max-w-[90%] mx-auto overflow-auto events-slider">
      {testimonials.map((t, index) => (
        <div
          key={index}
          className="rounded-[40px] flex flex-col p-20 items-center text-center flex-shrink-0 w-[90%] gap-[64px]"
          style={{ backgroundColor: t.color }}
        >
          <img src="./quotation.svg" className="" />
          <p className="text-[34px] font-medium text-[#180426]">{t.quote}</p>
          <div className="">
            <p className="text-[24px] text-black">{`${t.author}, ${t.location}`}</p>
            <p className="text-base text-[#3C3E40]">{t.role}</p>
            <></>
          </div>
        </div>
      ))}
    </div>
  );
}
