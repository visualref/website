import { publicBlogApi, type PublicBlog } from '@/lib/api-client';
import MasonryBlogGrid from './MasonryBlogGrid';

async function getBlogData(domain: string): Promise<PublicBlog | null> {
  try {
    return await publicBlogApi.getByDomain(domain);
  } catch (error) {
    console.error('Failed to fetch blog data:', error);
    return null;
  }
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
        <MasonryBlogGrid articles={articles} brandColor={brandColor} />
      )}
    </div>
  );
}