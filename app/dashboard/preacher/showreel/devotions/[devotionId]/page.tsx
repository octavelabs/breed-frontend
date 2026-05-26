'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Button from '@/app/components/Button';
import { Archive, ArrowLeft, Trash2 } from 'lucide-react';
import PublishIcon from '@/app/assets/icons/publishIcon';
import Tabs from '@/app/components/Tabs';
import { devotionalService } from '@/lib/api-services';
import DevotionContent, { DevotionContentHandle } from './components/DevotionContent';
import DevotionMetrics from './components/DevotionMetrics';

const UpdateDevotion = () => {
  const params = useParams();
  const router = useRouter();
  const devotionId  = params.devotionId as string;
  const contentRef  = useRef<DevotionContentHandle>(null);
  const [seriesTitle, setSeriesTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!devotionId) return;
    devotionalService
      .getSeriesById(devotionId)
      .then((data: any) => setSeriesTitle(data?.title ?? ''))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [devotionId]);

  const tabs = [
    {
      label: 'Content',
      value: 'content',
      content: <DevotionContent ref={contentRef} seriesId={devotionId} />,
    },
    {
      label: 'Metrics',
      value: 'metrics',
      content: <DevotionMetrics seriesId={devotionId} />,
    },
    {
      label: 'Comments',
      value: 'comments',
      content: (
        <div className="px-4 lg:px-10 py-16 text-center text-sm text-gray-400">
          Comments across all articles will appear here.
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout custom={true}>
      <div className="bg-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4 lg:px-10 pt-6">
          <div className="flex items-center gap-4">
            <Button
              customClass="!w-fit !px-3 !h-[40px] !bg-transparent"
              type="button"
              buttonType="custom"
              onClick={() => router.push('/dashboard/preacher/showreel')}
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-[24px] lg:text-[28px] leading-none font-bold">
              {loading ? 'Loading…' : seriesTitle}
            </h1>
          </div>
          <div className="flex gap-4.5">
            <button
              onClick={() => contentRef.current?.publish()}
              title="Publish article"
              className="w-10 h-10 flex justify-center items-center rounded-full border border-[#870BD6] bg-[#F3F4F6] text-[#6B7280] hover:bg-[#F5EBFF] transition-colors cursor-pointer"
            >
              <PublishIcon />
            </button>
            <button className="w-10 h-10 flex justify-center items-center rounded-full border border-[#D1D5DB] bg-[#E2E3E5] text-[#6B7280] hover:bg-[#D1D5DB] transition-colors cursor-pointer">
              <Archive className="w-4.5 h-4.5" />
            </button>
            <button className="w-10 h-10 flex justify-center items-center rounded-full border border-[#FCA5A5] text-[#EF4444] bg-[#FFE4E4] hover:bg-[#FECACA] transition-colors cursor-pointer">
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        <div className="bg-white pt-5">
          <Tabs
            tabs={tabs}
            defaultTab="content"
            className="px-4 lg:px-12"
            customClass="!rounded-full"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UpdateDevotion;
