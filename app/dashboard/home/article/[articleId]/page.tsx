"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePageTitle } from '@/app/hooks/usePageTitle';
import DashboardLayout from "@/app/layout/DashboardLayout";
import { ArrowLeft, Clock, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { devotionalService } from "@/lib/api-services";

interface Author {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  coverImageUrl?: string | null;
  estimatedMinutes?: number;
  publishedAt?: string;
  tags?: string[];
  isBookmarked?: boolean;
  author: Author;
  category?: { id: string; name: string } | null;
  series?: { id: string; title: string } | null;
}

const ArticlePage = () => {
  const params    = useParams();
  const router    = useRouter();
  const articleId = params.articleId as string;

  const [article,    setArticle]    = useState<Article | null>(null);
  const [loading,    setLoading]    = useState(true);
  usePageTitle(article?.title);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  useEffect(() => {
    if (!articleId) return;
    devotionalService
      .getById(articleId)
      .then((data) => {
        const a = data as Article;
        setArticle(a);
        setBookmarked(a.isBookmarked ?? false);
      })
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [articleId]);

  const handleBookmark = async () => {
    if (!article || bookmarking) return;
    setBookmarking(true);
    const prev = bookmarked;
    setBookmarked(!prev);
    try {
      await devotionalService.toggleBookmark(articleId);
    } catch {
      setBookmarked(prev);
    } finally {
      setBookmarking(false);
    }
  };

  const categoryLabel =
    article?.series?.title ?? article?.category?.name ?? null;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#870BD6]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!article) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <p className="text-sm font-semibold text-gray-700">Article not found</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-[#870BD6] hover:underline cursor-pointer"
          >
            Go back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6 pb-16">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center mb-6 text-[#60666B] hover:text-[#180426] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-bold text-[#180426] mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Category + read time row */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {categoryLabel && (
              <span className="bg-[#F7EDFF] text-[#870BD6] font-medium text-xs lg:text-sm px-4 py-1.5 rounded-full">
                {categoryLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            {article.estimatedMinutes != null && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {article.estimatedMinutes}min read
              </span>
            )}
            <button
              onClick={handleBookmark}
              disabled={bookmarking}
              className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              {bookmarked
                ? <BookmarkCheck className="w-5 h-5 text-[#870BD6]" />
                : <Bookmark className="w-5 h-5 text-gray-400" />
              }
            </button>
          </div>
        </div>

        {/* Cover image */}
        {article.coverImageUrl && (
          <div className="w-full h-52 lg:h-72 rounded-2xl overflow-hidden mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-base text-gray-600 font-medium mb-6 leading-relaxed">
            {article.excerpt}
          </p>
        )}

        {/* Rich text content */}
        {article.content ? (
          <div
            className="prose prose-base max-w-none text-gray-700 leading-relaxed
              prose-headings:text-[#180426] prose-a:text-[#870BD6]
              prose-blockquote:border-l-[#870BD6] prose-blockquote:text-gray-600
              prose-img:rounded-xl prose-pre:bg-[#1e1e1e] prose-pre:text-[#d4d4d4]"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <p className="text-gray-400 italic text-sm">No content available.</p>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ArticlePage;
