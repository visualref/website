"use client";

import { HelpCircle, Sun, Moon, Mail } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  return (
    <>
      <header className="h-16 flex items-center justify-end px-8 bg-card/80 backdrop-blur border-b border-border z-10 shrink-0">
        {/* Header Actions */}
        <div className="flex items-center space-x-2">
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

          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <span>Help</span>
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Help Modal */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Need help?
            </DialogTitle>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our support team is here to help. Send us an email and we'll get back to you as soon as possible.
            </p>

            <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-accent/50 border border-border">
              <div className="p-2 rounded-md bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Support email</p>
                <p className="text-sm font-medium">help@visualref.com</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setHelpOpen(false)}>
              Close
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => window.location.href = "mailto:help@visualref.com"}
            >
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
