import { publicBlogApi, type PublicBlog, type BlogArticle } from '@/lib/api-client';
import { Calendar, ArrowRight } from 'lucide-react';

async function getBlogData(domain: string): Promise<PublicBlog | null> {
  try {
    return await publicBlogApi.getByDomain(domain);
  } catch (error) {
    console.error('Failed to fetch blog data:', error);
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

function ArticleCard({ article, brandColor }: { article: BlogArticle; brandColor: string }) {
  return (
    <article className="group bg-card/40 backdrop-blur-xl border border-border/60 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {article.coverImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="w-4 h-4" />
          <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
          {article.topic && (
            <>
              <span className="text-border">•</span>
              <span className="truncate max-w-[150px]" title={article.topic}>
                {article.topic}
              </span>
            </>
          )}
        </div>
        <h2 className="text-xl font-semibold text-foreground/90 group-hover:text-brand transition-colors mb-3 line-clamp-2">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: brandColor }}>
          <span>Read more</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </article>
  );
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const blogData = await getBlogData(domain);

  if (!blogData) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Blog Not Found</h1>
          <p className="text-muted-foreground">
            No blog found for this domain. Please check the URL or return later.
          </p>
        </div>
      </div>
    );
  }

  const { articles, brandColor, workspace } = blogData;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground/95 mb-4">
          {workspace.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Insights, tutorials, and updates from our team
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground/80 mb-2">No Articles Yet</h2>
          <p className="text-muted-foreground">
            Check back soon for new content from {workspace.name}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} brandColor={brandColor} />
          ))}
        </div>
      )}
    </div>
  );
}