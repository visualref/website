"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, MoreVertical, Edit, Trash, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { distributionsApi } from "@/lib/api/distributions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Distribution } from "@/types";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  PUBLISHED: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  FAILED: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  CANCELLED: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
};

export default function DistributionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Fetch distributions
  const { data, isLoading, isError } = useQuery({
    queryKey: ["distributions", searchQuery],
    queryFn: () => distributionsApi.list({ search: searchQuery }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => distributionsApi.delete(id),
    onSuccess: () => {
      toast.success("Distribution deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
    },
    onError: (error) => {
      toast.error("Failed to delete distribution");
      console.error(error);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this distribution?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Distributions</h1>
          <p className="text-muted-foreground mt-2">
            Manage content distribution across platforms.
          </p>
        </div>
        <Link href="/distributions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Distribution
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search distributions..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled / Published At</TableHead>
              <TableHead>URL</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-red-500">
                  Failed to load distributions
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No distributions found
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((dist: Distribution) => (
                <TableRow key={dist.id}>
                  <TableCell className="font-medium capitalize">{dist.platform}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[dist.status]}>
                      {dist.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {dist.published_at
                      ? format(new Date(dist.published_at), "MMM d, yyyy HH:mm")
                      : dist.scheduled_at
                      ? format(new Date(dist.scheduled_at), "MMM d, yyyy HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {dist.url ? (
                      <a
                        href={dist.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        Link <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/distributions/${dist.id}`}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(dist.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
