'use client';

import { MasonryGrid } from 'react-masonry-virtualized';
import { Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { BlogArticle } from '@/lib/api-client';

// ─── Fixed card dimensions ────────────────────────────────────────────────────
const IMAGE_H = 196;          // fixed cover image slot height
const CARD_WITH_IMG = 450;    // total card height when cover image present
const CARD_NO_IMG = 268;      // total card height without cover image
const COLUMN_WIDTH = 300;     // matches minWidth / baseWidth below

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip markdown syntax so excerpts display as clean prose */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/!?\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\n{2,}/g, ' ')
    .trim();
}

/** "Apr 23, 2026" — abbreviated month keeps the row on one line */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Article Card ─────────────────────────────────────────────────────────────

function ArticleCard({
  article,
  brandColor,
}: {
  article: BlogArticle;
  brandColor: string;
}) {
  const hasImage = !!article.coverImage;

  return (
    <Link href={`/${article.id}`} className="block group h-full">
      <article className="h-full bg-card/40 backdrop-blur-xl border border-border/60 rounded-xl overflow-hidden flex flex-col transition-all duration-300 group-hover:border-[#000000] group-hover:shadow-sm">

        {/* ── Cover image – fixed height slot ── */}
        {hasImage && (
          <div
            className="shrink-0 overflow-hidden bg-muted/30"
            style={{ height: IMAGE_H }}
          >
            <img
              src={article.coverImage!}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {/* ── Text body – fills remaining height exactly ── */}
        <div className="flex flex-col flex-1 p-5 min-h-0 overflow-hidden">

          {/* Date + topic — single row, never wraps */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 overflow-hidden">
            <Calendar className="w-3 h-3 shrink-0" />
            <time
              dateTime={article.updatedAt}
              className="whitespace-nowrap shrink-0"
            >
              {formatDate(article.updatedAt)}
            </time>
            {article.topic && (
              <>
                <span className="shrink-0 text-border">·</span>
                <span className="truncate min-w-0" title={article.topic}>
                  {article.topic}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h2
            className={[
              'font-semibold text-foreground/90 leading-snug mb-2',
              hasImage ? 'text-sm line-clamp-2' : 'text-base line-clamp-3',
            ].join(' ')}
          >
            {article.title}
          </h2>

          {/* Excerpt — fixed size, clipped cleanly by line-clamp */}
          {article.excerpt && (
            <p
              className={[
                'text-muted-foreground text-sm leading-relaxed overflow-hidden',
                hasImage ? 'line-clamp-3' : 'line-clamp-4',
              ].join(' ')}
            >
              {stripMarkdown(article.excerpt)}
            </p>
          )}

          {/* Read more — sits naturally below excerpt with a small top margin */}
          <div
            className="flex items-center gap-1.5 text-xs font-medium mt-4 shrink-0"
            style={{ color: brandColor }}
          >
            <span>Read more</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard({ withImage }: { withImage?: boolean }) {
  return (
    <div
      className="bg-card/40 border border-border/40 rounded-xl overflow-hidden animate-pulse flex flex-col"
      style={{ height: withImage ? CARD_WITH_IMG : CARD_NO_IMG }}
    >
      {withImage && <div className="bg-muted/50 shrink-0" style={{ height: IMAGE_H }} />}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="h-3 bg-muted/50 rounded w-2/5" />
        <div className="h-4 bg-muted/60 rounded w-full" />
        <div className="h-4 bg-muted/60 rounded w-4/5" />
        <div className="h-3 bg-muted/40 rounded w-full" />
        <div className="h-3 bg-muted/40 rounded w-3/4" />
        <div className="h-3 bg-muted/40 rounded w-2/3 mt-auto" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  articles: BlogArticle[];
  brandColor: string;
}

export default function MasonryBlogGrid({ articles, brandColor }: Props) {
  /**
   * Two fixed heights — one for cards with a cover image, one without.
   * Because heights are exact the masonry never mispositions items.
   */
  const getItemSize = async (article: BlogArticle) => ({
    width: COLUMN_WIDTH,
    height: article.coverImage ? CARD_WITH_IMG : CARD_NO_IMG,
  });

  return (
    <MasonryGrid
      items={articles}
      renderItem={(article) => (
        <ArticleCard article={article} brandColor={brandColor} />
      )}
      getItemSize={getItemSize}
      gap={20}
      minWidth={COLUMN_WIDTH}
      baseWidth={COLUMN_WIDTH}
      bufferMultiplier={2}
      loadingPlaceholder={<SkeletonCard withImage />}
      skeletonCount={9}
    />
  );
}
