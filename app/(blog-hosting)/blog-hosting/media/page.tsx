"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Search,
  Grid,
  List,
  Trash2,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  X,
} from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "document";
  size: string;
  url: string;
  uploadedAt: string;
}

const initialMedia: MediaItem[] = [
  { id: "1", name: "hero-image.jpg", type: "image", size: "245 KB", url: "/placeholder.jpg", uploadedAt: "2024-04-20" },
  { id: "2", name: "product-photo.png", type: "image", size: "1.2 MB", url: "/placeholder.jpg", uploadedAt: "2024-04-19" },
  { id: "3", name: "company-logo.svg", type: "image", size: "12 KB", url: "/placeholder.jpg", uploadedAt: "2024-04-18" },
  { id: "4", name: "press-release.pdf", type: "document", size: "89 KB", url: "/placeholder.pdf", uploadedAt: "2024-04-15" },
];

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = media.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      setMedia((prev) => prev.filter((m) => m.id !== id));
      setSelectedItem(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulate upload - in real app this would upload to server
      const newItems: MediaItem[] = Array.from(files).map((file) => ({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document",
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString().split("T")[0],
      }));
      setMedia((prev) => [...newItems, ...prev]);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Media Library</h1>
          <p className="text-muted-foreground mt-1">{media.length} files</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <Card
              key={item.id}
              className="bg-card/40 backdrop-blur-xl border-border/60 overflow-hidden cursor-pointer hover:border-primary/40 transition-all"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-0 aspect-square relative">
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                </div>
                {item.type === "image" && (
                  <img src={item.url} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                )}
              </CardContent>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.size}</p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card/40 backdrop-blur-xl border-border/60">
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 hover:bg-accent/50 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="w-12 h-12 bg-muted rounded flex items-center justify-center shrink-0">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.type} • {item.size}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.uploadedAt}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate">{selectedItem.name}</DialogTitle>
                <DialogDescription>{selectedItem.type} • {selectedItem.size}</DialogDescription>
              </DialogHeader>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="h-24 w-24 text-muted-foreground/50" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input value={selectedItem.url} readOnly className="flex-1 font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyUrl(selectedItem)}
                  >
                    {copiedId === selectedItem.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Uploaded: {selectedItem.uploadedAt}</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={selectedItem.url} download>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => deleteItem(selectedItem.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}