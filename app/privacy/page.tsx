'use client'

import { useState, useEffect, useRef } from "react";
import Footer from "../components/landingPage/Footer";
import Navbar from "../components/landingPage/Navbar";

const sections = [
  {
    id: "intro",
    title: "Lorem Ipsum",
    content: `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident...`,
  },
  {
    id: "section1",
    title: "Lorem Ipsum",
    content: `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident...\n\nNam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus...`,
  },
  {
    id: "section2",
    title: "Lorem Ipsum",
    content: `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident...`,
  },
  {
    id: "section3",
    title: "Lorem Ipsum",
    content: `At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident...`,
  },
];

export default function PrivacyPolicyPage() {
  const [activeId, setActiveId] = useState(sections[0].id);
  const [openMobile, setOpenMobile] = useState(sections[0].id);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Lock scroll during transition
  useEffect(() => {
    if (isTransitioning) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isTransitioning]);

  const handleSectionChange = (sectionId: string | null) => {
    if (sectionId === null) return;
    setActiveId(sectionId);
    setIsTransitioning(true);

    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Unlock scroll after 600ms
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const activeSection = sections.find(s => s.id === activeId);

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-[#F7EFFF] px-4 py-10">
      <div className=" mx-auto  pt-[100px] md:pt-[230px]">
        <h1 className="text-3xl font-semibold text-purple-800">Privacy Policy</h1>
        <p className="text-sm text-purple-700 mt-2">Last Updated: 6th of August, 2025</p>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-[240px_1fr] gap-10 mt-10">
          <aside className="space-y-4">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`block w-full text-left text-sm font-medium px-2 py-1 rounded transition ${
                  activeId === section.id
                    ? "text-purple-800"
                    : "text-purple-600 hover:text-purple-800"
                }`}
              >
                {section.title}
              </button>
            ))}
          </aside>

          <main className="text-sm text-purple-800 leading-relaxed space-y-6">
            <h2 className="text-lg font-semibold">{activeSection?.title}</h2>
            {activeSection?.content.split("\n\n").map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </main>
        </div>

        {/* Mobile Accordion */}
        <div className="md:hidden mt-8 space-y-4">
          {sections.map(section => {
            const isOpen = openMobile === section.id;
            return (
              <div key={section.id} className="border-b border-purple-300 pb-2">
                <button
                  onClick={() =>
                    setOpenMobile(isOpen ? '' : section.id)
                  }
                  className="w-full flex items-center justify-between text-left text-purple-800 font-medium"
                >
                  {section.title}
                  <span className="text-xl">{isOpen ? "−" : "+"}</span>
                </button>

                {isOpen && (
                  <div className="mt-3 text-sm text-purple-700 leading-relaxed space-y-4">
                    {section.content.split("\n\n").map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
