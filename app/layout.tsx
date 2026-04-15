import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Brand/wordmark font — used exclusively for the "VisualRef" logo.
const groote = localFont({
  src: "../public/fonts/groote/Groote-Regular.otf",
  variable: "--font-groote",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Visualref — Content Intelligence Platform",
  description:
    "AI-powered content intelligence dashboard for generating, reviewing, and managing content at scale.",
  icons: {
    icon: "/visualref.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${groote.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
