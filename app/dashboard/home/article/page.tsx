"use client"

import DashboardLayout from "@/app/layout/DashboardLayout"
import { ArrowLeft, Clock } from "lucide-react";

import { useRouter } from "next/navigation";


const HomePage = () => {
const router = useRouter();

    return (
        <DashboardLayout>
       <div className=" mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 text-[#60666B]" />
      </button>
      <div className="mb-8">
        <h1 className="text-[32px] font-bold mb-4">Gratitude</h1>
        <div className="flex items-center justify-between">
          <div className="bg-[#F7EDFF] px-12 py-[10px] rounded-full">
          <span className="text-[#870BD6] font-medium text-[20px] leading-none">Salvation</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" />
            <span>4min read</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-8"
       style={{
          backgroundImage: `url('/dashboard-gratitude.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
        }}>
       
      </div>

      <div className="prose prose-lg max-w-none">
        <p className="text-gray-700 leading-relaxed mb-6">
          Gratitude is more than a momentary feeling, it's a perspective that transforms how we experience 
          life and relate to God. It shifts our focus from what's lacking to what's already been given, 
          reminding us that even in difficult seasons, there is always something to be thankful for.
        </p>

        <p className="text-gray-700 leading-relaxed mb-6">
          When we choose to give thanks, we acknowledge God's undeserved kindness and his abiding 
          goodness in the midst of it. Gratitude is a spiritual discipline that grounds us in trust that God is at 
          work even when the path is unclear. It is the lens that brings clarity to our chaos and peace to our 
          pressure.
        </p>

        <p className="text-gray-700 leading-relaxed mb-6">
          In Scripture, gratitude is not just encouraged it's commanded, because it opens the door to deeper 
          communion with God. "Give thanks in all circumstances; for this is God's will for you in Christ Jesus." 
          (1 Thessalonians 5:18). This verse reminds us that thanksgiving isn't situational, it's spiritual.
        </p>

        <p className="text-gray-700 leading-relaxed mb-6">
          Whether in plenty or in lack, gratitude becomes a declaration of faith: that God is still good, still 
          present, and still worthy of praise. It also softens our hearts and silences entitlement. When we're 
          grateful, we're less likely to compare, complain, or control and more likely to rejoice, release, and 
          rest.
        </p>

        <p className="text-gray-700 leading-relaxed">
          Gratitude also fuels humility. It helps us remember that everything we have is a gift from the breath 
          in our lungs to the people in our lives and the grace that saves us. As we grow in gratitude, we 
          become more attentive to God's faithfulness, more resilient in trials, and more generous in spirit.
        </p>
      </div>
    </div>
        </DashboardLayout>
    )
}

export default HomePage