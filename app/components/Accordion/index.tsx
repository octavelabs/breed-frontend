'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: number;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({ 
  items, 
  defaultOpen = 0,
  className = '' 
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={` rounded-2xl ${className}`}>
      <div className="divide-y divide-[#D2D9DF]">
        {items.map((item, index) => (
          <div key={index} className="">
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between py-6 text-left group"
              aria-expanded={openIndex === index}
            >
              <p className="text-[18px] font-medium text-[#180426] leading-[24px] pr-4">
                {item.question}
              </p>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 flex-shrink-0" stroke='#180426' />
              ) : (
                <ChevronDown className="w-5 h-5 flex-shrink-0" stroke='#180426' />
              )}
            </button>

            {openIndex === index && (
              <div className="pb-6 pr-12">
                <p className="text-[#4E5255] text-[18px] leading-[24px] ">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accordion;