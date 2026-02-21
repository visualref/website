"use client";

import { Search, Bell, HelpCircle, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — only render toggle after mount
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  return (
    <header className="h-16 flex items-center justify-between px-8 bg-card/80 backdrop-blur border-b border-border z-10 shrink-0">
      {/* Search */}
      <div className="flex items-center w-full max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search content, topics, or authors..."
            className="pl-10 bg-accent border-border focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-2">
        {/* Dark / Light toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="group p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-accent transition-all duration-200"
            aria-label="Toggle theme"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="relative block w-5 h-5">
              <Sun
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75"
                }`}
              />
              <Moon
                className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
                  isDark ? "opacity-0 -rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
                }`}
              />
            </span>
          </button>
        )}

        <div className="h-6 w-px bg-border" />

        <button className="p-2 rounded-full text-muted-foreground hover:text-foreground focus:outline-none relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
        </button>

        <div className="h-6 w-px bg-border" />

        <button className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <span>Help</span>
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
