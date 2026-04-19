import { publicBlogApi, type PublicArticle } from '@/lib/api-client';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface ArticleData extends PublicArticle {}

async function getArticle(domain: string, articleId: string): Promise<ArticleData | null> {
  try {
    return await publicBlogApi.getArticleById(domain, articleId);
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ domain: string; articleId: string }>;
}) {
  const { domain, articleId } = await params;
  const article = await getArticle(domain, articleId);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This article may have been moved or removed.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  const { brandColor, brandLogo, workspace, body, coverImage, title, topic, updatedAt } = article;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {workspace.name}
      </Link>

      <article>
        {coverImage && (
          <div className="aspect-video rounded-xl overflow-hidden mb-8">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          {topic && (
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
              style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
            >
              {topic}
            </span>
          )}
          <h1 className="text-4xl font-bold text-foreground/95 mb-4 leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h2: ({ children }) => <h2 className="text-2xl font-bold text-foreground/90 mt-8 mb-4">{children}</h2>,
              h3: ({ children }) => <h3 className="text-xl font-semibold text-foreground/90 mt-6 mb-3">{children}</h3>,
              p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              a: ({ href, children }) => <a href={href} className="text-brand hover:underline">{children}</a>,
              blockquote: ({ children }) => <blockquote className="border-l-4 border-brand/30 pl-4 italic text-muted-foreground my-6">{children}</blockquote>,
              code: ({ children }) => <code className="bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
              pre: ({ children }) => <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
            }}
          >
            {body}
          </ReactMarkdown>
        </div>
      </article>

      <div className="mt-16 pt-8 border-t border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={workspace.name}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="font-semibold" style={{ color: brandColor }}>
                {workspace.name}
              </span>
            )}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: brandColor }}
          >
            View all articles
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}