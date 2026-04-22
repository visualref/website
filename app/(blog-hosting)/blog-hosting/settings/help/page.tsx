"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, ExternalLink, Mail, Book, MessageSquare, FileText, ChevronRight } from "lucide-react";

const faqs = [
  {
    question: "How do I create a new post?",
    answer: "Navigate to Posts and click 'Add New Post'. You can use the editor to write content, add images, and publish.",
  },
  {
    question: "How do I connect Google Analytics?",
    answer: "Go to Settings → Analytics and enter your Google Analytics Measurement ID. Click Connect to verify.",
  },
  {
    question: "How do I change my blog's appearance?",
    answer: "Use the Appearance section to customize colors, fonts, and layout. Advanced users can add custom CSS.",
  },
  {
    question: "How do I enable maintenance mode?",
    answer: "Go to Settings → Tools and toggle Maintenance Mode. Visitors will see your message instead of the blog.",
  },
  {
    question: "How do I export my content?",
    answer: "Go to Settings → Tools and click 'Export All Content'. You'll receive a downloadable file with all your data.",
  },
];

const links = [
  { icon: Book, label: "Documentation", description: "Complete guides and tutorials", href: "#" },
  { icon: MessageSquare, label: "Community Forum", description: "Ask questions and share tips", href: "#" },
  { icon: FileText, label: "API Reference", description: "Developer documentation", href: "#" },
  { icon: Mail, label: "Contact Support", description: "Get help from our team", href: "#" },
];

export default function HelpSettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Help & Support</h1>
        <p className="text-muted-foreground mt-1">Get help with your blog hosting</p>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Quick Links</CardTitle>
          <CardDescription>Access documentation and support</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
            >
              <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                <link.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{link.label}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground truncate">{link.description}</p>
              </div>
            </a>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
              <CardDescription>Quick answers to common questions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 rounded-lg border border-border">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none font-medium">
                  <span>{faq.question}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
              </details>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">System Status</CardTitle>
          <CardDescription>Current platform status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="font-medium text-green-500">All Systems Operational</p>
              <p className="text-xs text-muted-foreground">Last checked: Just now</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Version Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Blog Hosting Version</span>
              <Badge>2.1.0</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Theme Version</span>
              <Badge>1.0.3</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="text-sm">April 22, 2026</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}