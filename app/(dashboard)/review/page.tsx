"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
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
import { ContentStatus, ContentType, Priority } from "@/types";
import { useContentList, useCreateTopic, useGenerateContent } from "@/hooks/use-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

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
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");

  const createTopicMutation = useCreateTopic();
  const generateMutation = useGenerateContent();

  const handleCreateAndGenerate = () => {
    if (!newTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    let createdAt: string | undefined = undefined;
    if (newDate) {
      createdAt = new Date(newDate).toISOString();
    }

    createTopicMutation.mutate(
      {
        title: newTitle,
        target_keywords: [],
        content_type: ContentType.ARTICLE,
        priority: Priority.MEDIUM,
        createdAt,
      },
      {
        onSuccess: (newTopic) => {
          toast.success("Topic created! Triggering generation...");
          
          generateMutation.mutate(newTopic.id, {
            onSuccess: () => {
              toast.success("Content generation started successfully!");
              setIsModalOpen(false);
              setNewTitle("");
              setNewDate("");
              setCurrentPage(1);
            }
          });
        }
      }
    );
  };

  const { data: contentResponse, isLoading, isError } = useContentList({
    search: searchQuery || undefined,
    status: statusFilter !== "ALL" ? (statusFilter as any) : undefined,
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
          <Button className="gap-2 shadow-lg shadow-primary/20" onClick={() => setIsModalOpen(true)}>
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
          <Select 
            value={statusFilter} 
            onValueChange={(val) => { 
              setStatusFilter(val); 
              setCurrentPage(1); 
            }}
          >
            <SelectTrigger className="w-[180px] bg-card border-border">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value={ContentStatus.DRAFT_READY}>Draft Ready</SelectItem>
              <SelectItem value={ContentStatus.IN_REVIEW}>In Review</SelectItem>
              <SelectItem value={ContentStatus.APPROVED}>Approved</SelectItem>
              <SelectItem value={ContentStatus.PUBLISHED}>Published</SelectItem>
              <SelectItem value={ContentStatus.NEEDS_REVISION}>Needs Revision</SelectItem>
              <SelectItem value={ContentStatus.REJECTED}>Rejected</SelectItem>
            </SelectContent>
          </Select>
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
                  Category
                </TableHead>
                <TableHead className="py-3 px-6 text-xs font-semibold uppercase tracking-wider w-48">
                  Created Date
                </TableHead>
                <TableHead className="py-3 px-6 text-xs font-semibold uppercase tracking-wider w-48">
                  Quality Score
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
                  const normalizedStatus = item.status?.toLowerCase();
                  const statusInfo =
                    statusConfig[normalizedStatus] || statusConfig[ContentStatus.DRAFT_READY];
                  return (
                    <TableRow
                      key={item.id}
                      className="group hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => router.push(`/content/${item.id}`)}
                    >
                      <TableCell className="py-4 px-6">
                        <Checkbox className="border-border" />
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium group-hover:text-primary transition-colors">
                            {(item as any).topic_text || item.title || item.id}
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
                        <span className="text-sm text-muted-foreground capitalize">
                          {(item as any).content_type || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="text-sm font-mono text-muted-foreground">
                          {new Date(item.created_at).toISOString().split("T")[0]}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-green-500">
                            {(item as any).quality_score ? `${(item as any).quality_score}/10` : "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6" />
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

      {/* Create Topic Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Topic Title</Label>
              <Input 
                id="title"
                placeholder="Enter a topic..." 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Scheduled Date (Optional)</Label>
              <Input 
                id="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateAndGenerate} 
              disabled={createTopicMutation.isPending || generateMutation.isPending || !newTitle.trim()}
              className="gap-2 shadow-lg shadow-primary/20"
            >
              {(createTopicMutation.isPending || generateMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Create & Generate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
