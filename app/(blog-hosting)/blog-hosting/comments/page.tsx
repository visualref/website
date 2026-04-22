"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Reply,
  Flag,
  MoreHorizontal,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  post: string;
  date: string;
  status: "approved" | "pending" | "spam";
}

const initialComments: Comment[] = [
  { id: "1", author: "John Doe", email: "john@example.com", content: "Great article! Very informative.", post: "Getting Started with SEO", date: "2024-04-20", status: "approved" },
  { id: "2", author: "Jane Smith", email: "jane@example.com", content: "Thanks for sharing this valuable content.", post: "Content Marketing Strategies", date: "2024-04-19", status: "pending" },
  { id: "3", author: "Spam Bot", email: "spam@spam.com", content: "Buy cheap products now!", post: "Social Media Integration Tips", date: "2024-04-18", status: "spam" },
  { id: "4", author: "Mike Johnson", email: "mike@example.com", content: "Have you considered adding more examples?", post: "Getting Started with SEO", date: "2024-04-17", status: "approved" },
];

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Comment["status"]>("all");

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const approveComment = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "approved" as const } : c))
    );
    toast.success("Comment approved");
  };

  const markAsSpam = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "spam" as const } : c))
    );
    toast.success("Comment marked as spam");
  };

  const deleteComment = (id: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      setComments((prev) => prev.filter((c) => c.id !== id));
      toast.success("Comment deleted");
    }
  };

  const getStatusBadge = (status: Comment["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500 gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 gap-1"><XCircle className="h-3 w-3" /> Pending</Badge>;
      case "spam":
        return <Badge className="bg-red-500/10 text-red-500 gap-1"><Flag className="h-3 w-3" /> Spam</Badge>;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Comments</h1>
          <p className="text-muted-foreground mt-1">Manage user comments</p>
        </div>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "approved", "pending", "spam"] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Post</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{comment.author}</p>
                      <p className="text-xs text-muted-foreground">{comment.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-xs truncate">{comment.content}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">{comment.post}</TableCell>
                  <TableCell>{getStatusBadge(comment.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{comment.date}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {comment.status !== "approved" && (
                          <DropdownMenuItem onClick={() => approveComment(comment.id)}>
                            <Check className="h-4 w-4 mr-2" /> Approve
                          </DropdownMenuItem>
                        )}
                        {comment.status !== "spam" && (
                          <DropdownMenuItem onClick={() => markAsSpam(comment.id)}>
                            <Flag className="h-4 w-4 mr-2" /> Mark as Spam
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Reply className="h-4 w-4 mr-2" /> Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteComment(comment.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredComments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <XCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg">No comments found</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}