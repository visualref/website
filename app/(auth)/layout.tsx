"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Layers, Sparkles, FolderOpen } from "lucide-react";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

/**
 * Split-screen auth shell.
 * - Left: form surface — forced white/light, no dark mode.
 * - Right: product UI preview with blur overlay + brand messaging.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="min-h-screen w-full flex relative overflow-hidden">
        {/* ============ LEFT: form panel — forced light ============ */}
        <section
          className="flex-1 flex flex-col items-center justify-center relative px-4 sm:px-6 lg:px-12 py-10 min-h-screen"
          style={{ background: "#FFFFFF" }}
        >
          {/* Ambient glows */}
          <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#48C5AF]/8 blur-[120px]" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#20395B]/6 blur-[100px]" />
          </div>

          {/* Wordmark + tagline top-left — only place using logo font */}
          <div className="absolute top-6 left-6 lg:top-8 lg:left-10 z-20">
            <span
              className="text-2xl tracking-tight text-[#20395B] block"
              style={{ fontFamily: "var(--font-groote)" }}
            >
              VisualRef
            </span>
            <span className="text-[11px] text-[#64748b] tracking-wide mt-0.5 block">
              Manage your visual assets intelligently
            </span>
          </div>

          {children}

          {/* Footer links */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-xs text-[#94a3b8] z-10">
            <a className="hover:text-[#20395B] transition-colors" href="#">
              Privacy Policy
            </a>
            <span>•</span>
            <a className="hover:text-[#20395B] transition-colors" href="#">
              Terms of Service
            </a>
          </div>
        </section>

        {/* ============ RIGHT: product preview panel ============ */}
        <aside className="hidden lg:flex flex-1 relative overflow-hidden">
          {/* Base gradient fallback */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1a2f4a] to-[#20395B]" />

          {/* Product UI preview image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/auth-hero-ui.png"
            alt="VisualRef product dashboard showing visual asset management"
            className="absolute inset-0 w-full h-full object-cover object-left-top"
            style={{ filter: "brightness(0.7) saturate(1.1)" }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />

          {/* Gradient overlays for depth & readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/50 via-transparent to-[#0F172A]/30" />

          {/* Animated floating accent orbs */}
          <div
            className="absolute top-[15%] right-[10%] w-32 h-32 rounded-full bg-[#48C5AF]/20 blur-[60px]"
            style={{ animation: "authFloat 6s ease-in-out infinite" }}
          />
          <div
            className="absolute bottom-[30%] left-[5%] w-24 h-24 rounded-full bg-[#48C5AF]/15 blur-[50px]"
            style={{ animation: "authFloat 8s ease-in-out infinite reverse" }}
          />

          {/* Content overlay — using regular sans-serif, NOT logo font */}
          <div className="relative z-10 flex flex-col justify-end w-full h-full p-10 lg:p-14">
            <div className="max-w-lg">
              <h2 className="text-4xl lg:text-5xl tracking-tight text-white font-bold leading-tight">
                Organize & reference{" "}
                <span className="text-[#48C5AF]">visuals</span> effortlessly
              </h2>

              <p className="text-white/60 text-base mt-4 leading-relaxed max-w-md">
                Your entire visual library — organized, searchable, and always
                at your fingertips.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-sm">
                <Layers className="w-4 h-4 text-[#48C5AF]" />
                <span>Smart Collections</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-sm">
                <FolderOpen className="w-4 h-4 text-[#48C5AF]" />
                <span>Visual Boards</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-sm">
                <Sparkles className="w-4 h-4 text-[#48C5AF]" />
                <span>AI-Powered Tags</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        @keyframes authFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }
      `}</style>
    </GoogleOAuthProvider>
  );
}
