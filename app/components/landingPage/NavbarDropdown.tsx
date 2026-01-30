"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";


interface NavbarDropdownProps {
  selected: boolean;
  link: {
    title: string;
    options: { title: string; path: string }[];
  };
}

const NavbarDropdown: React.FC<NavbarDropdownProps> = ({ link, selected }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`flex h-12 items-center justify-center gap-2 rounded-full px-4 ${[
            selected
              ? "text-[#330750]"
              : "text-[#4E5255]",
          ].join(" ")} `}
        >
          <p>{link.title}</p>
          <ChevronDown />
        </button>
      </div>
      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-[14px] bg-white shadow-lg">
          {link.options.map((option, index: number) => (
            <Link
              href={option.path}
              key={index}
              onClick={() => setDropdownOpen(false)}
              className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
            >
              {option.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavbarDropdown;
