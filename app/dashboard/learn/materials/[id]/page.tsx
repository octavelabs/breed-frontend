"use client"

import StepProgress from '@/app/components/StepProgress';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import React from 'react';


const CourseMaterials: React.FC = () => {
  const router = useRouter()
  const { id } = useParams();

  const exampleSteps = [
    {
      subtitle: 'Chapter 1',
      title: 'The Fall That Made Grace Necessary',
      content: (
        <div className="flex gap-6 min-h-[calc(100vh-400px)]">
          <img 
            src="/dashboard-gratitude.png" 
            alt="Devotional" 
            className="w-72 h-48 object-cover rounded-lg"
          />
          <div className="flex-1 text-gray-700 space-y-4">
            <p>
              Gratitude is more than a momentary feeling, it’s a perspective that transforms how we experience life and relate to God. It shifts our attention from what’s lacking to what’s already been given, reminding us that even in difficult seasons, there is always something to be thankful for. 
When we choose to give thanks, we’re not denying hardship; rather, we’re acknowledging God’s goodness in the midst of it. Gratitude is a spiritual discipline that grounds us in trust that God is at work even when the path is unclear. It is the lens that brings clarity to our chaos and peace to our pressure.
In Scripture, gratitude is not just encouraged it’s commanded, because it opens the door to deeper communion with God. “Give thanks in all circumstances,” Paul writes in 1 Thessalonians 5:18, “for this is God’s will for you in Christ Jesus.” This verse reminds us that thanksgiving isn’t situational, it’s spiritual. 
Whether in plenty or in lack, gratitude becomes a declaration of faith: that God is still good, still present, and still worthy of praise. It also softens our hearts and silences entitlement. When we’re grateful, we’re less likely to compare, complain, or control and more likely to rejoice, release, and rest.
Gratitude also fuels humility. It helps us remember that everything we have is a gift from the breath in our lungs to the people in our lives and the grace that saves us. As we grow in gratitude, we become more generous with encouragement, more patient in process, and more aware of God’s hand in the details. In a culture that often pulls us toward discontentment and striving, practicing gratitude keeps our hearts anchored in truth. 
It becomes a quiet, powerful resistance to fear and frustration reminding us that, in Christ, we have more than enough
            </p>
          
          </div>
        </div>
      )
    },
     {
      subtitle: 'Chapter 1',
      title: 'The Fall That Made Grace Necessary',
      content: (
          <div>
              <div className="relative bg-gray-900 rounded-[20px] overflow-hidden mb-4 aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all shadow-lg">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-4">📖</div>
                    <p className="text-lg">Video Content</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm text-center">Click play to begin the chapter</p>
            </div>
      )
    },
         {
       subtitle: 'Chapter 1',
      title: 'The Fall That Made Grace Necessary',
      content: (
        <div className="flex gap-6 min-h-[calc(100vh-400px)]">
          <img 
            src="/dashboard-gratitude.png" 
            alt="Devotional" 
            className="w-72 h-48 object-cover rounded-lg"
          />
          <div className="flex-1 text-gray-700 space-y-4">
            <p>
             Lord, help me to develop and sustain a consistent time of fellowship with You, no matter how busy life gets.
<br /><b>Scripture:</b><br />
“Very early in the morning, while it was still dark, Jesus got up, left the house and went off to a solitary place, where he prayed.”
Mark 1:35 (NIV)
            </p>
          
          </div>
        </div>
      )
    },
         {
           subtitle: 'Chapter 1',
      title: 'The Fall That Made Grace Necessary',
      content: (
        <div className="flex gap-6 h-[calc(100vh-400px)]">
          <img 
            src="/dashboard-gratitude.png" 
            alt="Devotional" 
            className="w-72 h-48 object-cover rounded-lg"
          />
          <div className="flex-1 text-gray-700 space-y-4">
            <p>
            Prayer for God’s Prescence in Daily Life
            </p>
          
          </div>
        </div>
      )
    },
]

  return (
    <DashboardLayout>
    <div className="">
 
     <StepProgress
      steps={exampleSteps}
      onComplete={() => router.push(`/dashboard/learn/quiz/${id}`)}
      completeButtonText="Take Assessment"
    />
    
    </div>
    </DashboardLayout>
  );
};

export default CourseMaterials