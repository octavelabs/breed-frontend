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

export default function TermsPage() {
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
    <div className="min-h-screen bg-[#F7EFFF] px-4 py-10 ">
      <div className="container mx-auto  pt-[100px] md:pt-[200px]">
        <h1 className="text-[64px] leading-[72px] font-medium text-[#4E0A7C]">Terms Of Service</h1>
        <p className="text-[18px] font-medium text-[#180426] mt-[40px] mb-5">Last Updated: 6th of August, 2025</p>
        <p className="text-[#4E5255] text-[18px] border-b border-[#D2D9DF] pb-10">
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat
        </p>
        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-[240px_1fr] gap-10 mt-10">
          <aside className="space-y-[36px]">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={`block w-full text-left text-sm font-medium px-2 pb-5 rounded transition ${
                  activeId === section.id
                    ? "text-purple-800 border-b border-[#D2D9DF]"
                    : "text-purple-600 "
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
