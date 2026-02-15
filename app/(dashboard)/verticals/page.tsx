"use client";

import { useQuery } from "@tanstack/react-query";
import { verticalsApi } from "@/lib/api/verticals";
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

export default function VerticalsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["verticals"],
    queryFn: () => verticalsApi.list(),
  });

  if (error) return <div className="p-8 text-red-500">Failed to load verticals</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verticals</h1>
          <p className="text-muted-foreground">
            Manage your content verticals and their settings.
          </p>
        </div>
        <Button asChild>
          <Link href="/verticals/new">
            <Plus className="mr-2 h-4 w-4" />
            New Vertical
          </Link>
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No verticals found.
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((vertical) => (
                <TableRow key={vertical.id}>
                  <TableCell className="font-medium">
                    <Link href={`/verticals/${vertical.id}`} className="hover:underline">
                      {vertical.name}
                    </Link>
                  </TableCell>
                  <TableCell>{vertical.domain || "-"}</TableCell>
                  <TableCell>{format(new Date(vertical.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/verticals/${vertical.id}`}>Edit</Link>
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
