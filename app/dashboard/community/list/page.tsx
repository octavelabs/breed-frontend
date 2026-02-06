'use client'

import DashboardLayout from "@/app/layout/DashboardLayout"
import { EmptyState } from "./components/EmptyState";
import { CommunitySidebar } from "./components/CommunitySidebar";
import { CommunityChatView } from "./components/CommunityChatView";
import { useState } from "react";


const CommunityListPage = () => {
     const [selectedCommunity, setSelectedCommunity] = useState(null);

  const communities = [
    {
      id: 1,
      name: 'Believers That Hangout',
      avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=100&h=100&fit=crop'
    },
    {
      id: 2,
      name: 'GrowT Community',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop'
    }
  ];

  return (
    <DashboardLayout custom={true}>
            <div className="flex overflow-hidden">
      <CommunitySidebar
        communities={communities}
        selectedCommunity={selectedCommunity}
        onSelectCommunity={setSelectedCommunity}
      />
      {selectedCommunity ? (
        <CommunityChatView community={selectedCommunity} />
      ) : (
        <EmptyState />
      )}
    </div>

    </DashboardLayout>
  )
}

export default CommunityListPage