"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/layout/DashboardLayout";
import { devotionalService } from "@/lib/api-services";
import { ArrowLeft, BookOpen, Users, Check, Bell, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  churchName?: string | null;
  country?: string | null;
  city?: string | null;
}

interface Article {
  id: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string | null;
  estimatedMinutes?: number;
  publishedAt?: string;
  status: "DRAFT" | "PUBLISHED";
  tags?: string[];
  isBookmarked?: boolean;
}

interface SeriesDetail {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  author: Author;
  articleCount: number;
  subscriberCount: number;
  isSubscribed?: boolean;
  articles?: Article[];
}

// ── Article Card ──────────────────────────────────────────────────────────────

const ArticleCard = ({ article, onClick }: { article: Article; onClick: () => void }) => {
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="border border-[#E2E3E5] rounded-2xl bg-white hover:shadow-md transition-all duration-200 flex flex-col group cursor-pointer" onClick={onClick}>
      <div className="bg-gray-100 rounded-t-2xl p-3">
        <div className="relative bg-[#180426] rounded-xl h-36 overflow-hidden flex items-center justify-center">
          {article.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <BookOpen size={28} className="text-white opacity-20" />
          )}
        </div>
      </div>
      <div className="px-4 pt-3 pb-4 flex-1 flex flex-col gap-2">
        {date && (
          <p className="text-[11px] text-[#870BD6] font-semibold uppercase tracking-wide">
            {date}
          </p>
        )}
        <h3 className="text-sm font-bold text-[#180426] leading-snug line-clamp-2 group-hover:text-[#870BD6] transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-[#60666B] line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-[12px] text-[#60666B] mt-auto pt-1">
          {article.estimatedMinutes != null && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {article.estimatedMinutes} min
            </span>
          )}
          {article.tags && article.tags.length > 0 && (
            <span className="truncate">{article.tags[0]}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const DevotionalSeriesPage = () => {
  const params   = useParams();
  const router   = useRouter();
  const { user } = useAuth();
  const seriesId = params.seriesId as string;

  const [series,      setSeries]      = useState<SeriesDetail | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [activeTab,   setActiveTab]   = useState<"articles" | "about">("articles");

  const isOwnSeries = user?.id === series?.author?.id;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await devotionalService.getSeriesById(seriesId) as SeriesDetail;
      setSeries(data);
    } catch {
      setSeries(null);
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => { load(); }, [load]);

  const handleSubscribe = async () => {
    if (!series) return;
    const wasSubscribed = series.isSubscribed;
    setSeries((prev) =>
      prev
        ? {
            ...prev,
            isSubscribed: !wasSubscribed,
            subscriberCount: (prev.subscriberCount ?? 0) + (wasSubscribed ? -1 : 1),
          }
        : prev
    );
    setSubscribing(true);
    try {
      await devotionalService.toggleSeriesSubscription(seriesId);
    } catch {
      setSeries((prev) =>
        prev
          ? {
              ...prev,
              isSubscribed: wasSubscribed,
              subscriberCount: (prev.subscriberCount ?? 0) + (wasSubscribed ? 1 : -1),
            }
          : prev
      );
    } finally {
      setSubscribing(false);
    }
  };

  const authorName = series
    ? `${series.author.firstName} ${series.author.lastName}`
    : "Author";
  const authorInitial =
    series?.author?.firstName?.charAt(0)?.toUpperCase() ?? "A";
  const location = [series?.author?.city, series?.author?.country]
    .filter(Boolean)
    .join(", ");
  const publishedArticles = (series?.articles ?? []).filter(
    (a) => a.status === "PUBLISHED"
  );

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout custom={true}>
        <div>
          <div className="h-48 bg-[#870BD6] animate-pulse" />
          <div className="px-4 md:px-12 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-[#E2E3E5] rounded-2xl animate-pulse">
                  <div className="bg-gray-100 rounded-t-2xl p-3">
                    <div className="bg-gray-200 rounded-xl h-36" />
                  </div>
                  <div className="px-4 py-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!series) {
    return (
      <DashboardLayout custom={true}>
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-4">
          <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
            <BookOpen size={22} className="text-[#870BD6]" />
          </div>
          <p className="text-sm font-semibold text-gray-700">Series not found</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-[#870BD6] hover:underline mt-1"
          >
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout custom={true}>
      <div className="border-l border-[#D2D9DF]">

        {/* ── Banner ──────────────────────────────────────────────────────── */}
        <div
          className="bg-[#870BD6] h-48 relative"
          style={{ backgroundImage: "url('/dashboard-header.png')" }}
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 cursor-pointer px-4 md:px-12 pt-16 relative z-20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15)_1px,_transparent_1px)] [background-size:20px_20px]" />
        </div>

        {/* ── Profile header ───────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 lg:gap-6">
          <div className="flex items-center gap-5">
            {/* Cover image / avatar overlapping the banner */}
            <div className="w-30 lg:w-37.5 h-30 lg:h-37.5 rounded-full bg-[#E7C8FF] flex items-center justify-center shrink-0 border-[3px] border-white overflow-hidden -mt-20 relative z-20 shadow-lg">
              {series.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={series.coverImageUrl}
                  alt={series.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen size={32} className="text-[#870BD6]" />
              )}
            </div>

            {/* Title + author + stats (large screens) */}
            <div className="hidden lg:block">
              <h2 className="text-2xl font-bold text-[#180426]">{series.title}</h2>
              <p className="text-[#60666B] text-sm mt-0.5">
                by{" "}
                <span className="font-medium text-[#180426]">{authorName}</span>
                {series.author.churchName ? ` · ${series.author.churchName}` : ""}
                {location ? ` · ${location}` : ""}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-sm text-[#60666B]">
                  <span className="font-bold text-[#180426]">
                    {(series.subscriberCount ?? 0).toLocaleString()}
                  </span>{" "}
                  Subscribers
                </span>
                <span className="w-1 h-1 rounded-full bg-[#C4B5FD]" />
                <span className="text-sm text-[#60666B]">
                  <span className="font-bold text-[#180426]">
                    {publishedArticles.length}
                  </span>{" "}
                  Articles
                </span>
              </div>
            </div>
          </div>

          {/* Title + author + stats (small screens) */}
          <div className="lg:hidden">
            <h2 className="text-2xl font-bold text-[#180426]">{series.title}</h2>
            <p className="text-[#60666B] text-sm mt-0.5">
              by{" "}
              <span className="font-medium text-[#180426]">{authorName}</span>
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm text-[#60666B]">
                <span className="font-bold text-[#180426]">
                  {(series.subscriberCount ?? 0).toLocaleString()}
                </span>{" "}
                Subscribers
              </span>
              <span className="w-1 h-1 rounded-full bg-[#C4B5FD]" />
              <span className="text-sm text-[#60666B]">
                <span className="font-bold text-[#180426]">
                  {publishedArticles.length}
                </span>{" "}
                Articles
              </span>
            </div>
          </div>

          {/* Subscribe button */}
          {!isOwnSeries && (
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm transition-all disabled:opacity-60 shrink-0 ${
                series.isSubscribed
                  ? "bg-[#F5EBFF] border border-[#D49CFD] text-[#870BD6] hover:bg-[#EDD9FF]"
                  : "bg-linear-to-b from-[#A967F1] to-[#5B26B1] text-white"
              }`}
            >
              {subscribing ? (
                <span className="inline-block w-4 h-4 rounded-full border-t-2 border-current animate-spin" />
              ) : series.isSubscribed ? (
                <Check size={15} />
              ) : (
                <Bell size={15} />
              )}
              {series.isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          )}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="px-4 md:px-12 pt-2">
          <div className="flex gap-8 border-b border-[#D2D9DF]">
            {(["articles", "about"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-[#870BD6] text-[#870BD6] font-semibold text-lg"
                    : "text-[#60666B]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="px-4 lg:px-12 py-6">

          {/* Articles tab */}
          {activeTab === "articles" && (
            publishedArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-[#E2E3E5] rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-[#F5EBFF] flex items-center justify-center">
                  <BookOpen size={22} className="text-[#870BD6]" />
                </div>
                <p className="text-sm font-semibold text-gray-700">No articles yet</p>
                <p className="text-xs text-[#60666B] max-w-xs">
                  This devotional series hasn&apos;t published any articles yet. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} onClick={() => router.push(`/dashboard/home/article/${article.id}`)} />
                ))}
              </div>
            )
          )}

          {/* About tab */}
          {activeTab === "about" && (
            <div className="max-w-2xl w-full space-y-4 leading-relaxed">
              {series.description ? (
                <p className="text-[#60666B] text-sm whitespace-pre-wrap">
                  {series.description}
                </p>
              ) : (
                <p className="text-[#60666B] text-sm italic">
                  No description available.
                </p>
              )}

              {/* Author card */}
              <div className="pt-4 border-t border-[#F0F2F4]">
                <p className="text-xs font-semibold text-[#60666B] uppercase tracking-wide mb-3">
                  About the Author
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E7C8FF] flex items-center justify-center shrink-0 overflow-hidden">
                    {series.author.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={series.author.avatarUrl}
                        alt={authorName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[#870BD6] text-sm font-bold">
                        {authorInitial}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#180426]">{authorName}</p>
                    {(series.author.churchName || location) && (
                      <p className="text-xs text-[#60666B]">
                        {series.author.churchName}
                        {series.author.churchName && location
                          ? ` · ${location}`
                          : location}
                      </p>
                    )}
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-sm text-[#60666B]">
                    <Users size={13} />
                    <span>{(series.subscriberCount ?? 0).toLocaleString()}</span>
                  </div>
                </div>
                {series.author.bio && (
                  <p className="text-sm text-[#60666B] mt-3 whitespace-pre-wrap">
                    {series.author.bio}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DevotionalSeriesPage;
