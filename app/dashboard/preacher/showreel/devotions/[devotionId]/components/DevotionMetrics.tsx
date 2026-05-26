'use client';

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Bookmark, Clock, Heart, Flame, TrendingUp, MessageCircle, Loader2 } from 'lucide-react';
import { devotionalService } from '@/lib/api-services';

interface DevArticle {
  id: string;
  title: string;
  publishedAt?: string;
  status: 'DRAFT' | 'PUBLISHED';
  estimatedMinutes: number;
  bookmarkCount: number;
  _count?: { reactions: number; comments: number };
}

interface SeriesData {
  id: string;
  title: string;
  subscriberCount: number;
  articleCount: number;
  articles: DevArticle[];
}

function StatCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#180426]">{value}</p>
        <p className="text-sm text-[#60666B] mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const DevotionMetrics = ({ seriesId }: { seriesId: string }) => {
  const [series, setSeries] = useState<SeriesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seriesId) return;
    devotionalService
      .getSeriesById(seriesId)
      .then((data) => setSeries(data as SeriesData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [seriesId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-100 px-4 lg:px-10">
        <Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="px-4 lg:px-10 py-16 text-center text-sm text-gray-400">
        Could not load metrics.
      </div>
    );
  }

  const published = series.articles.filter((a) => a.status === 'PUBLISHED');
  const totalBookmarks = series.articles.reduce((s, a) => s + (a.bookmarkCount ?? 0), 0);
  const totalReactions = series.articles.reduce((s, a) => s + (a._count?.reactions ?? 0), 0);
  const totalComments  = series.articles.reduce((s, a) => s + (a._count?.comments ?? 0), 0);
  const totalReadMins  = published.reduce((s, a) => s + (a.estimatedMinutes ?? 0), 0);

  const topArticle = [...series.articles]
    .filter((a) => a.status === 'PUBLISHED')
    .sort((a, b) => (b.bookmarkCount ?? 0) - (a.bookmarkCount ?? 0))[0];

  return (
    <div className="px-4 lg:px-10 py-8 space-y-8">

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-[#870BD6]" />}
          label="Subscribers"
          value={series.subscriberCount ?? 0}
          sub="Total followers of this devotional"
          color="bg-[#F5EBFF]"
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-[#067647]" />}
          label="Published Articles"
          value={published.length}
          sub={`${series.articleCount - published.length} draft(s)`}
          color="bg-[#ECFDF3]"
        />
        <StatCard
          icon={<Bookmark className="w-5 h-5 text-[#B54708]" />}
          label="Total Bookmarks"
          value={totalBookmarks}
          sub="Across all articles"
          color="bg-[#FFFAEB]"
        />
        <StatCard
          icon={<Heart className="w-5 h-5 text-[#C01048]" />}
          label="Reactions"
          value={totalReactions}
          sub={`${totalComments} comment${totalComments !== 1 ? 's' : ''}`}
          color="bg-[#FFF1F3]"
        />
      </div>

      {/* Read time + top article */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#870BD6]" />
            <h3 className="text-sm font-semibold text-[#180426]">Total Read Time</h3>
          </div>
          <p className="text-3xl font-bold text-[#180426]">
            {totalReadMins >= 60
              ? `${Math.floor(totalReadMins / 60)}h ${totalReadMins % 60}m`
              : `${totalReadMins}m`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Avg {published.length > 0 ? Math.round(totalReadMins / published.length) : 0} min per article
          </p>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Published</span>
                <span>{published.length} / {series.articleCount}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#A967F1] to-[#5B26B1] rounded-full transition-all"
                  style={{ width: series.articleCount > 0 ? `${(published.length / series.articleCount) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#E3E8EF] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-[#870BD6]" />
            <h3 className="text-sm font-semibold text-[#180426]">Top Article</h3>
          </div>
          {topArticle ? (
            <div>
              <p className="font-semibold text-[#180426] leading-snug mb-1 line-clamp-2">
                {topArticle.title}
              </p>
              <p className="text-xs text-gray-400 mb-4">{formatDate(topArticle.publishedAt)}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-[#60666B]">
                  <Bookmark className="w-3.5 h-3.5" />{topArticle.bookmarkCount ?? 0} bookmarks
                </span>
                <span className="flex items-center gap-1.5 text-[#60666B]">
                  <Heart className="w-3.5 h-3.5" />{topArticle._count?.reactions ?? 0} reactions
                </span>
                <span className="flex items-center gap-1.5 text-[#60666B]">
                  <MessageCircle className="w-3.5 h-3.5" />{topArticle._count?.comments ?? 0}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No published articles yet.</p>
          )}
        </div>
      </div>

      {/* Article performance table */}
      <div className="bg-white border border-[#E3E8EF] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[#E3E8EF]">
          <Flame className="w-4 h-4 text-[#870BD6]" />
          <h3 className="text-sm font-semibold text-[#180426]">Article Performance</h3>
        </div>

        {series.articles.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No articles to display.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E3E8EF] bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#60666B] uppercase tracking-wide">Article</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[#60666B] uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#60666B] uppercase tracking-wide">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#60666B] uppercase tracking-wide hidden sm:table-cell">Read</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#60666B] uppercase tracking-wide">
                    <Bookmark className="w-3.5 h-3.5 inline" />
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#60666B] uppercase tracking-wide">
                    <Heart className="w-3.5 h-3.5 inline" />
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-[#60666B] uppercase tracking-wide hidden sm:table-cell">
                    <MessageCircle className="w-3.5 h-3.5 inline" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {series.articles.map((a, i) => (
                  <tr
                    key={a.id}
                    className={`border-b border-[#E3E8EF] last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#180426] truncate max-w-[220px]">{a.title}</p>
                    </td>
                    <td className="px-4 py-3.5 text-[#60666B] hidden md:table-cell whitespace-nowrap">
                      {formatDate(a.publishedAt)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        a.status === 'PUBLISHED'
                          ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]'
                          : 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
                      }`}>
                        {a.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#60666B] hidden sm:table-cell">
                      {a.estimatedMinutes ?? 0}m
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium text-[#180426]">
                      {a.bookmarkCount ?? 0}
                    </td>
                    <td className="px-4 py-3.5 text-center font-medium text-[#180426]">
                      {a._count?.reactions ?? 0}
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#60666B] hidden sm:table-cell">
                      {a._count?.comments ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevotionMetrics;
