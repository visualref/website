"use client";

import { useQuery } from "@tanstack/react-query";
import { topicsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import type { Topic } from "@/types";

export default function TopicsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["topics"],
    queryFn: () => topicsApi.list(),
  });

  if (error) return <div className="p-8 text-red-500">Failed to load topics</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Topics</h1>
          <p className="text-muted-foreground">
            Manage your content topics and their status.
          </p>
        </div>
        <Button asChild>
          <Link href="/topics/new">
            <Plus className="mr-2 h-4 w-4" />
            New Topic
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>

              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No topics found.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((topic: Topic) => (
                <TableRow key={topic.id}>
                  <TableCell className="font-medium">
                    <Link href={`/topics/${topic.id}`} className="hover:underline">
                      {topic.title}
                    </Link>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {topic.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {topic.createdAt ? format(new Date(topic.createdAt), "MMM d, yyyy") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/topics/${topic.id}`}>Edit</Link>
                    </Button>
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
