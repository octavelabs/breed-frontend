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

}

const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  defaultTab, 
  onChange,
  className = '',

}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value);

  const handleTabClick = (value: string) => {
    setActiveTab(value);
    onChange?.(value);
  };

  const activeTabContent = tabs.find(tab => tab.value === activeTab)?.content;

  return (
    <div>
      {/* Tab Buttons */}
      <div className={`flex gap-3 px-12 ${className}`}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className={`
              border px-4 py-3 rounded-[12px] font-medium text-sm transition-all duration-200
              ${
                activeTab === tab.value
                  ? 'bg-white border-black'
                  : 'text-[#4E5255] border-[#D2D9DF]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
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