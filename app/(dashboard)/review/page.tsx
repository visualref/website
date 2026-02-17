"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Plus,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContentStatus } from "@/types";
import { useContentList } from "@/hooks/use-api";

const statusConfig: Record<
  string,
  { label: string; classes: string }
> = {
  [ContentStatus.OUTLINE_READY]: {
    label: "Outline Ready",
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  [ContentStatus.DRAFT_READY]: {
    label: "Draft Ready",
    classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  [ContentStatus.IN_REVIEW]: {
    label: "In Review",
    classes: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  [ContentStatus.APPROVED]: {
    label: "Approved",
    classes: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  [ContentStatus.PUBLISHED]: {
    label: "Published",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  [ContentStatus.NEEDS_REVISION]: {
    label: "Needs Revision",
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  [ContentStatus.REJECTED]: {
    label: "Rejected",
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

const verticalIcons: Record<string, string> = {
  Finance: "\u{1F3E6}",
  Energy: "\u26A1",
  Technology: "\u{1F4BB}",
  Health: "\u2764\uFE0F",
  Marketing: "\u{1F4E2}",
};

function TableRowSkeleton() {
  return (
    <TableRow className="border-b border-border">
      <TableCell className="py-4 px-6">
        <Skeleton className="h-4 w-4" />
      </TableCell>
      <TableCell className="py-4 px-6">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-3 w-32" />
        </div>
      </TableCell>
      <TableCell className="py-4 px-6">
        <Skeleton className="h-6 w-24 rounded-full" />
      </TableCell>
      <TableCell className="py-4 px-6">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="py-4 px-6">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell className="py-4 px-6">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="py-4 px-6">
        <Skeleton className="h-7 w-16" />
      </TableCell>
    </TableRow>
  );
}

export default function ReviewQueuePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: contentResponse, isLoading, isError } = useContentList({
    search: searchQuery || undefined,
    page: currentPage,
    limit: pageSize,
  });

  const items = contentResponse?.data ?? [];
  const total = contentResponse?.total ?? 0;
  const totalPages = contentResponse?.totalPages ?? 1;

  // Build page numbers to display
  function getPageNumbers() {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Content Review Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track content items pending editorial approval.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            New Content
          </Button>
        </div>
      </header>

      {/* Filters Toolbar */}
      <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            className="pl-10 bg-accent border-border focus-visible:ring-primary/50"
            placeholder="Search by title, ID, or keyword..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Button variant="outline" className="gap-2 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Status
            <Badge variant="secondary" className="bg-primary/20 text-primary text-xs px-1.5 py-0 font-bold">
              2
            </Badge>
          </Button>
          <Button variant="outline" className="gap-2 text-sm">
            <span className="text-muted-foreground">{"\u{1F4C1}"}</span>
            Vertical
          </Button>
          <Button variant="outline" className="gap-2 text-sm font-mono text-muted-foreground">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Oct 01 - Oct 24
          </Button>
          <div className="h-6 w-px bg-border mx-1" />
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-accent/50 border-b border-border">
                <TableHead className="w-12 py-3 px-6">
                  <Checkbox className="border-border" />
                </TableHead>
                <TableHead className="py-3 px-6 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-primary transition-colors group select-none">
                  <div className="flex items-center gap-1">
                    Title / ID
                    <ChevronRight className="h-3 w-3 rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </TableHead>
                <TableHead className="py-3 px-6 text-xs font-semibold uppercase tracking-wider w-48">
                  Status
                </TableHead>
                <TableHead className="py-3 px-6 text-xs font-semibold uppercase tracking-wider w-40">
                  Vertical
                </TableHead>
                <TableHead className="py-3 px-6 text-xs font-semibold uppercase tracking-wider w-48">
                  Created Date
                </TableHead>
                <TableHead className="py-3 px-6 text-xs font-semibold uppercase tracking-wider w-48">
                  Assignee
                </TableHead>
                <TableHead className="py-3 px-6 w-24" />
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    No data available
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    {searchQuery ? "No content items match your search." : "No content items found."}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const statusInfo =
                    statusConfig[item.status] || statusConfig[ContentStatus.DRAFT_READY];
                  return (
                    <TableRow
                      key={item.id}
                      className="group hover:bg-accent/30 transition-colors"
                    >
                      <TableCell className="py-4 px-6">
                        <Checkbox className="border-border" />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium group-hover:text-primary transition-colors">
                            {item.title}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            #ID-{item.id.padStart(4, "0")} ·{" "}
                            {((item.word_count || 0) / 1000).toFixed(1)}k words
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={`${statusInfo.classes} gap-1.5`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {verticalIcons[item.vertical?.name || ""] || "\u{1F4C4}"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {item.vertical?.name || item.vertical_id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="text-sm font-mono text-muted-foreground">
                          {new Date(item.created_at).toISOString().split("T")[0]}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Unassigned
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <Link href={`/content/${item.id}`}>
                            <Button size="sm" className="h-7 text-xs shadow-md">
                              Review
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-border p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-accent/30">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>Showing</span>
            <select
              className="bg-card border border-border text-foreground text-xs rounded px-2 py-1 focus:outline-none focus:border-primary"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>of {total} results</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {getPageNumbers().map((page, idx) =>
              page === "ellipsis" ? (
                <span key={`ellipsis-${idx}`} className="text-muted-foreground px-1">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 p-0 text-sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
