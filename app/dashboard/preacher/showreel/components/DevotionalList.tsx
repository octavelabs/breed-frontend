'use client';

import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Plus, SearchIcon, SlidersHorizontal, BookOpen, Users, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { devotionalService } from '@/lib/api-services';
import Input from '@/app/components/Input';
import Button from '@/app/components/Button';

interface DevotionalSeries {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  articleCount: number;
  subscriberCount: number;
  isPublished: boolean;
}

const DevotionalList = ({
  setOpenModal,
  refreshKey,
}: {
  setOpenModal: Dispatch<SetStateAction<{ course: boolean; devotional: boolean }>>;
  refreshKey?: number;
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [series, setSeries] = useState<DevotionalSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    devotionalService
      .getAllSeries({ authorId: user.id, limit: 50 })
      .then((res) => {
        const data = (res as { data?: DevotionalSeries[] })?.data ?? [];
        setSeries(data);
      })
      .catch(() => setSeries([]))
      .finally(() => setLoading(false));
  }, [user?.id, refreshKey]);

  const filtered = series.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="bg-white mx-4 lg:mx-10 border border-[#E3E8EF] rounded-[16px]">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 justify-between my-[21px] mx-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Devotionals ({loading ? '…' : series.length})
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input
              type="text"
              id="search-devotionals"
              name="search-devotionals"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              placeholder="Search by name"
              variant="outlined"
              icon={
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
              }
              className="!bg-white !border-[#B9C2CA] !h-[36px] rounded-full"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <SlidersHorizontal className="w-4 h-4" />
            <p className="hidden lg:block">Filter</p>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-87.5">
          <Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex justify-center h-87.5 items-center">
          <div className="flex flex-col gap-4 items-center">
            <BookOpen className="w-16 h-16 text-gray-300" />
            <p className="text-base text-gray-500">
              {search ? 'No devotionals match your search' : "You haven't created any devotional yet"}
            </p>
            {!search && (
              <Button
                customClass="!w-fit px-6 !h-[48px] !text-white"
                type="button"
                onClick={() => setOpenModal((prev) => ({ ...prev, devotional: true }))}
              >
                <p className="flex items-center gap-1.5">
                  <Plus stroke="white" /> Create Devotional
                </p>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
          {filtered.map((s) => (
            <DevotionalSeriesCard
              key={s.id}
              series={s}
              onClick={() => router.push(`/dashboard/preacher/showreel/devotions/${s.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function DevotionalSeriesCard({
  series: s,
  onClick,
}: {
  series: DevotionalSeries;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="border border-[#E2E3E5] shadow-[0px_1px_2px_0px_#1018280D] cursor-pointer rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="bg-gray-100 rounded-t-2xl w-full p-3.5">
        <div className="relative bg-[#180426] rounded-xl h-47 overflow-hidden flex items-center justify-center">
          {s.coverImageUrl ? (
            <img src={s.coverImageUrl} alt={s.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-12 h-12 text-purple-300" />
          )}
          <span
            className={`absolute top-4 left-4 text-sm font-semibold px-4 py-1.5 rounded-full capitalize ${
              s.isPublished
                ? 'bg-[#ECFDF3] border border-[#ABEFC6] text-[#067647]'
                : 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]'
            }`}
          >
            {s.isPublished ? 'published' : 'draft'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-b-2xl px-4 py-4.5">
        <h3 className="text-sm font-semibold mb-2 leading-tight line-clamp-2">{s.title}</h3>
        {s.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">{s.description}</p>
        )}
        <div className="flex items-center gap-4 text-gray-600 text-sm">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" strokeWidth={1.5} />
            {s.articleCount} articles
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" strokeWidth={1.5} />
            {s.subscriberCount}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DevotionalList;
