"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  XCircle,
} from "lucide-react";

interface Page {
  id: string;
  title: string;
  status: "published" | "draft";
  template: string;
  lastModified: string;
}

const initialPages: Page[] = [
  { id: "1", title: "About Us", status: "published", template: "Default", lastModified: "2024-04-15" },
  { id: "2", title: "Contact", status: "published", template: "Contact", lastModified: "2024-04-14" },
  { id: "3", title: "Privacy Policy", status: "published", template: "Default", lastModified: "2024-04-10" },
  { id: "4", title: "Terms of Service", status: "draft", template: "Default", lastModified: "2024-04-08" },
];

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deletePage = (id: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      setPages((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Pages</h1>
          <p className="text-muted-foreground mt-1">Manage your static pages</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/blog-hosting/pages/new">
            <Plus className="h-4 w-4" />
            Add New Page
          </Link>
        </Button>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{page.title}</span>
                      <div className="flex gap-2">
                        <Link href={`/blog-hosting/pages/${page.id}/edit`} className="text-xs text-primary hover:underline">
                          Edit
                        </Link>
                        <Link href="#" className="text-xs text-primary hover:underline">
                          View
                        </Link>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={page.status === "published" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}>
                      {page.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{page.template}</TableCell>
                  <TableCell className="text-muted-foreground">{page.lastModified}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/blog-hosting/pages/${page.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="#">
                            <Copy className="h-4 w-4 mr-2" /> Duplicate
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deletePage(page.id)}
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
          {filteredPages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <XCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium text-lg">No pages found</h3>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}