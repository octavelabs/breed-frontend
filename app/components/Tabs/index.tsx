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

  const activeTabContent = tabs.find(tab => tab.value === activeTab)?.content;
  const renderedCustomButton =
    typeof customButton === 'function' ? customButton(activeTab) : customButton;

  return (
    <div>
    <div className={`flex w-full justify-between items-center ${className}`}>
      <div className={`flex gap-3 w-full max-w-full overflow-auto`}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`
              border px-[18px] py-3 whitespace-nowrap rounded-[12px] font-medium text-sm transition-all duration-200
              ${
                activeTab === tab.value
                  ? 'bg-white border-black font-semibold'
                  : 'text-[#4E5255] border-[#D2D9DF]'
              } ${customClass}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {renderedCustomButton}
      </div>

      {/* Tab Content */}
      {activeTabContent && (
        <div className="mt-6">
          {activeTabContent}
        </div>
      )}
    </div>
  );
};

export default Tabs;
