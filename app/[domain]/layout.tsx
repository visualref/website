import { Inter } from 'next/font/google';
import { publicBlogApi, type PublicBlog } from '@/lib/api-client';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

async function getBlogData(domain: string): Promise<PublicBlog | null> {
  try {
    return await publicBlogApi.getByDomain(domain);
  } catch (error) {
    console.error('Failed to fetch blog data:', error);
    return null;
  }
}

export default async function DomainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const blogData = await getBlogData(domain);

  if (!blogData) {
    return (
      <html lang="en">
        <body className={inter.variable}>
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Blog Not Found</h1>
              <p className="text-muted-foreground mt-2">
                No blog found for this domain.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  const { brandColor, brandLogo, workspace } = blogData;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} style={{
        '--brand-primary': brandColor,
        '--brand-primary-hover': adjustColor(brandColor, -10),
      } as React.CSSProperties}>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border/40 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-3">
                  {brandLogo ? (
                    <img 
                      src={brandLogo} 
                      alt={workspace.name} 
                      className="h-8 w-auto object-contain"
                    />
                  ) : (
                    <span className="font-semibold text-lg" style={{ color: brandColor }}>
                      {workspace.name}
                    </span>
                  )}
                </div>
                <nav className="flex items-center gap-6">
                  <a 
                    href="#" 
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t border-border/40 mt-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <p className="text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} {workspace.name}. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
        <style jsx global>{`
          :root {
            --brand-primary: ${brandColor};
            --brand-primary-hover: ${adjustColor(brandColor, -10)};
          }
          .text-brand { color: var(--brand-primary); }
          .bg-brand { background-color: var(--brand-primary); }
          .border-brand { border-color: var(--brand-primary); }
          .hover\\:text-brand:hover { color: var(--brand-primary); }
          .hover\\:bg-brand:hover { background-color: var(--brand-primary); }
        `}</style>
      </body>
    </html>
  );
}

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}