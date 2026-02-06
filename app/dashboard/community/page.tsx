import FlameIcon from "@/app/assets/icons/flame";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

const CommunityPage = () => {
  const content = [
    {
      title: "Believers that Hangout",
      image: "/dashboardCommunity1.jpg",
      id: 1
    },
    {
      title: "Growth Community",
      image: "/dashboardCommunity2.jpg",
      id: 2
    },
    {
      title: "Waxing Strong Community",
      image: "/dashboardCommunity1.jpg",
      id: 3
    },
  ];
  return (
    <DashboardLayout>
        <h1 className="text-[32px] leading-none font-bold mb-8">Community</h1>
        <div className="grid grid-cols-3 gap-4">
          {content.map((item, index) => (
            <Link href={`/dashboard/community/${item.id}`} key={index}>
            <div className="bg-white rounded-[10px] py-3 px-4 flex  items-center gap-4" >
              <div className="w-[88px] h-[88px] md:w-[64px] md:h-[64px] rounded-[10px] overflow-hidden">
                <img
                  src={item?.image}
                  alt="Believers group"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>

              {/* Center: Title and avatars */}
              <div className="flex-1 flex flex-col gap-2">
                <h2 className="text-base font-bold">
                  {item?.title}
                </h2>

                {/* Avatar group with count */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center -space-x-3">
                    <div className="w-12 h-12 md:w-6 md:h-6 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
                      <img
                        src="/believers1.jpg"
                        alt="Member 1"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-12 h-12 md:w-6 md:h-6 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
                      <img
                        src="/believers2.jpg"
                        alt="Member 2"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-12 h-12 md:w-6 md:h-6 rounded-full border-[1.2px] border-[#A1A6E7] overflow-hidden bg-gray-300">
                      <img
                        src="/believers3.jpg"
                        alt="Member 3"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>

    </DashboardLayout>
  );
};

export default CommunityPage;
