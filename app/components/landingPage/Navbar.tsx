"use client";

import Link from "next/link";
import { useState } from "react";

import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import NavbarDropdown from "./NavbarDropdown";

export const navLinks = [
  {
    title: "For Believers",
    dropdown: true,
    options: [
      { title: "For Believers", path: "/believers" },
      { title: "For Preachers", path: "/preachers" },
    ],
  },
  {
    title: "About Us",
    path: "/about",
  },
  {
    title: "Resources",
    dropdown: true,
    options: [
      { title: "For Believers", path: "/dashboard/orders" },
      { title: "For Preachers", path: "/dashboard/prescriptions" },
    ],
  },
];

export const mobileNavLinks = [
  {
    title: "For Believers",
    path: "/believers",
  },
  {
    title: "For Preachers",
    path: "/preachers",
  },
  {
    title: "About Us",
    path: "/about",
  },
  {
    title: "Resources",
    path: "/resources",
  },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="shadow-[0px_16px_50px_0px_#0310271A] px-4 sm:px-[40px] flex w-full xl:w-[70%] h-[80px] box-border mx-auto items-center justify-between left-1/2 -translate-x-1/2 fixed top-0 lg:top-[40px] z-20 bg-white xl:bg-[#FBF6FF] xl:rounded-full border-[5px] border-white">
        <Link href="/">
          <img src="/Logo.png" alt="logo" className="h-[30px] w-auto" />
        </Link>

        <div className="hidden lg:flex items-center space-x-4">
          {navLinks.map((link, index) => {
            if (link.dropdown) {
              const selected = link.options.some((option) =>
                pathname.includes(option.path),
              );
              return (
                <NavbarDropdown selected={selected} link={link} key={index} />
              );
            } else {
              const selected = pathname.includes(link.path as string);

              return (
                <Link
                  key={index}
                  href={link.path as string}
                  className={`flex h-12 items-center justify-center gap-2 rounded-full  ${[
                    selected ? "text-[#330750] font-medium" : "text-[#4E5255]",
                  ].join(" ")} `}
                >
                  <p>{link.title}</p>
                </Link>
              );
            }
          })}
          <button className="px-5 py-4 bg-white text-[#5B26B1] border-[1.5px] border-[#5B26B1] rounded-full  hover:shadow-lg hover:scale-105 transition-all duration-300">
            <Link href="/grant">Partner With Us</Link>
          </button>
          <button className="px-5 py-4 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300">
            <Link href="/welcome.">
              Join Us Today
            </Link>
          </button>
        </div>

        <button
          className="lg:hidden z-50 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-[#101828]" />
          ) : (
            <Menu className="w-6 h-6 text-[#101828]" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed  left-0 right-0 bg-white z-40 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-y-0 top-[80px]" : "-translate-y-full"
        }`}
      >
        <div className="flex flex-col py-6 px-6 h-[calc(100vh-80px)] overflow-y-auto">
          <div className="flex flex-col flex-grow">
          {mobileNavLinks.map((link, index) => (
            <Link
              key={index}
              href={link.path as string}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex py-4 items-center ${
                pathname.includes(link.path as string)
                  ? "text-[#330750] font-medium"
                  : "text-[#4E5255]"
              }`}
            >
              <p className="text-lg">{link.title}</p>
            </Link>
          ))}
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full px-6 py-3 text-[#5B26B1] border-[1.5px] border-[#5B26B1] rounded-full font-medium text-center hover:shadow-lg transition-all"
            >
              Partner With Us
            </Link>
             <Link
              href="/welcome"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full px-6 py-3 bg-gradient-to-b from-[#A967F1] to-[#5B26B1] text-white rounded-full font-medium text-center hover:shadow-lg transition-all"
            >
              Join Us Today
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
