"use client"

import StepProgress from '@/app/components/StepProgress';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Link from 'next/link';
import React from 'react';


const CourseMaterials: React.FC = () => {


  const categories = [
    {
      id: 1,
      title: 'Knowing Jesus',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    },
    {
      id: 2,
      title: 'Salvation',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
    },
    {
      id: 3,
      title: 'Understand the Bible',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500',
    },
    {
      id: 4,
      title: 'Preaching the Word',
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=500',
    },
  ];

  const exampleSteps = [
    {
      subtitle: 'Prayer Bulletin',
      title: 'Personal Devotion',
      content: (
        <div className="flex gap-6 h-[calc(100vh-400px)]">
          <img 
            src="/dashboard-gratitude.png" 
            alt="Devotional" 
            className="w-72 h-48 object-cover rounded-lg"
          />
          <div className="flex-1 text-gray-700 space-y-4">
            <p>
              Personal devotion is the intentional time set apart to connect with God on a personal level. It is a sacred rhythm of the Christian life that nurtures a deeper relationship with the Father through prayer, worship, and the study of Scripture. 

Unlike public worship or group study, personal devotion is intimate and tailored it reflects the individual's hunger to know God more, to hear His voice, and to grow spiritually in the quiet spaces of everyday life.
Devotional time isn’t bound by a strict format; it can include reading a chapter of the Bible, journaling reflections, meditating on a passage, or simply sitting still in God’s presence. 

What matters most is the heart coming before God with openness and expectation. In these quiet moments, believers find clarity, strength, and spiritual renewal. The consistency of this habit not only shapes character but anchors the soul in God’s truth, even in life’s most turbulent seasons.
Ultimately, personal devotion is where transformation begins. It is the soil in which seeds of faith are planted, watered, and matured. As believers return daily to this space of fellowship, they are reminded of God’s faithfulness and drawn into alignment with His will. 

Over time, personal devotion becomes more than a practice it becomes a lifeline, a daily encounter that fuels the walk of faith and forms the foundation for a vibrant, enduring relationship with Jesus.
            </p>
          
          </div>
        </div>
      )
    },
     {
      subtitle: 'Prayer Bulletin',
      title: 'Prayer for a Consistent Devotional Life',
      content: (
        <div className="flex gap-6 h-[calc(100vh-400px)]">
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
      subtitle: 'Prayer Bulletin',
      title: 'Prayer for God’s Prescence in Daily Life',
      content: (
        <div className="flex gap-6 h-[calc(100vh-400px)]">
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
      subtitle: 'Prayer Bulletin',
      title: 'Thanksgiving',
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
      onComplete={() => alert('Completed all steps!')}
      primaryColor="#7c3aed"
    />
    
    </div>
    </DashboardLayout>
  );
};

export default CourseMaterials