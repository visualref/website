'use client';

import { MasonryGrid } from 'react-masonry-virtualized';
import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { BlogArticle } from '@/lib/api-client';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ArticleCard({
  article,
  brandColor,
}: {
  article: BlogArticle;
  brandColor: string;
}) {
  return (
    <Link href={`/${article.id}`} className="block group">
      <article className="bg-card/40 backdrop-blur-xl border border-border/60 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {article.coverImage && (
          <div className="overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              loading="lazy"
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
            {article.topic && (
              <>
                <span className="text-border">•</span>
                <span className="truncate max-w-[140px]" title={article.topic}>
                  {article.topic}
                </span>
              </>
            )}
          </div>
          <h2 className="text-base font-semibold text-foreground/90 group-hover:text-brand transition-colors mb-2 line-clamp-3 leading-snug">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-4 leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <div
            className="flex items-center gap-1.5 text-xs font-medium mt-auto"
            style={{ color: brandColor }}
          >
            <span>Read more</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  );
}

// Skeleton card shown while JS initialises / items measure
function SkeletonCard() {
  return (
    <div className="bg-card/40 border border-border/40 rounded-xl overflow-hidden animate-pulse">
      <div className="bg-muted/50 h-48 w-full" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-muted/50 rounded w-1/2" />
        <div className="h-4 bg-muted/60 rounded w-full" />
        <div className="h-4 bg-muted/60 rounded w-4/5" />
        <div className="h-3 bg-muted/40 rounded w-full" />
        <div className="h-3 bg-muted/40 rounded w-3/4" />
      </div>
    </div>
  );
}

interface Props {
  articles: BlogArticle[];
  brandColor: string;
}

export default function MasonryBlogGrid({ articles, brandColor }: Props) {
  /**
   * Estimate each card's height so the masonry layout can pre-position items
   * without waiting for actual DOM measurement.
   *
   * Base width used by MasonryGrid = 241px (default).
   * We return a fixed width so items fill their column, and vary height based
   * on whether the article has a cover image and how long the excerpt is.
   */
  const getItemSize = async (article: BlogArticle) => {
    const BASE_WIDTH = 241;
    // image slot: aspect ~16/9 → ~136px at 241px wide
    const imageHeight = article.coverImage ? Math.round((BASE_WIDTH * 9) / 16) : 0;
    // title: ~3 lines × 22px + excerpt: ~4 lines × 20px + chrome
    const textHeight = 130;
    return { width: BASE_WIDTH, height: imageHeight + textHeight };
  };

  return (
    <MasonryGrid
      items={articles}
      renderItem={(article) => (
        <ArticleCard article={article} brandColor={brandColor} />
      )}
      getItemSize={getItemSize}
      gap={20}
      minWidth={280}
      bufferMultiplier={1.5}
      loadingPlaceholder={<SkeletonCard />}
      skeletonCount={9}
      skeletonAspectRatio={1.4}
      enableZoomOnHover
      zoomScale={1.05}
    />
  );
}
