'use client'

import React, { useState, ReactNode } from 'react';

interface TabItem {
  label: string;
  value: string;
  content?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (value: string) => void;
  className?: string;
   customClass?: string;
   customButton?: ReactNode | ((activeTab: string) => ReactNode);
}

const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  defaultTab, 
  onChange,
  className = '',
  customClass = '',
  customButton

}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value);

  const handleTabClick = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  const renderedCustomButton =
    typeof customButton === 'function' ? customButton(activeTab) : customButton;

  return (
    <div>
      <div className={`flex flex-wrap gap-y-3 w-full justify-between items-center ${className}`}>
        <div className={`flex gap-3 overflow-x-auto max-w-full`}>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`
                border px-[18px] py-3 whitespace-nowrap rounded-[12px] font-medium text-sm transition-all duration-200
                ${
                  activeTab === tab.value
                    ? 'bg-white dark:bg-[#252830] border-black dark:border-transparent font-semibold text-[#180426] dark:text-white'
                    : 'text-[#4E5255] dark:text-[#9CA3AF] border-[#D2D9DF] dark:border-[#2D313A] hover:border-gray-400 dark:hover:border-[#717784]'
                } ${customClass}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {renderedCustomButton}
      </div>

      {/* All tab panels stay mounted; only the active one is visible.
          This prevents React from unmounting stateful components (like the
          course editor) when the user switches tabs, preserving all state. */}
      {tabs.map((tab) => (
        <div
          key={tab.value}
          className="mt-6"
          style={activeTab === tab.value ? undefined : { display: 'none' }}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};

export default Tabs;
