"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, ImageIcon, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { contentApi, type ContentImage } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface CoverImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  currentCover?: string | null;
  onUpdated: (newCoverUrl: string) => void;
}

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function CoverImageDialog({
  open,
  onOpenChange,
  contentId,
  currentCover,
  onUpdated,
}: CoverImageDialogProps) {
  const [tab, setTab] = useState<"upload" | "history">("upload");
  const [images, setImages] = useState<ContentImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settingId, setSettingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    contentApi
      .listImages(contentId)
      .then((res) => setImages(res.images))
      .catch(() => toast.error("Failed to load image history"))
      .finally(() => setLoading(false));
  }, [open, contentId]);

  const handleFiles = async (file: File) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images are allowed");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const res = await contentApi.uploadImage(contentId, file);
      toast.success("Cover image updated");
      onUpdated(res.image.image_url);
      setImages((prev) => [res.image, ...prev]);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectHistoric = async (image: ContentImage) => {
    setSettingId(image.id);
    try {
      await contentApi.setCover(contentId, image.id);
      toast.success("Cover updated");
      onUpdated(image.image_url);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to set cover");
    } finally {
      setSettingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change cover image</DialogTitle>
          <DialogDescription>
            Upload a new image, or pick one you've used before on this article.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upload">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload new
            </TabsTrigger>
            <TabsTrigger value="history">
              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
              Previous images {images.length > 0 && `(${images.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="pt-4">
            <div
              className={cn(
                "border-2 border-dashed border-border rounded-lg p-10 text-center",
                "hover:border-primary/60 transition-colors cursor-pointer",
                uploading && "pointer-events-none opacity-60",
              )}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) void handleFiles(file);
              }}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Uploading…</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Click to browse, or drag an image here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This will replace the current cover. JPG, PNG, or WebP up to 5MB.
                  </p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={ALLOWED.join(",")}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFiles(file);
                  e.target.value = "";
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="history" className="pt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                No previous images yet. Upload one to get started.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {images.map((img) => {
                  const isActive = currentCover === img.image_url;
                  const busy = settingId === img.id;
                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => handleSelectHistoric(img)}
                      disabled={busy}
                      className={cn(
                        "group relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                        isActive
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/60",
                        busy && "opacity-60 pointer-events-none",
                      )}
                    >
                      <img
                        src={img.thumbnail_url || img.image_url}
                        alt="Cover option"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5">
                        {img.source === "generated" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-purple-500/90 text-white px-1.5 py-0.5 rounded">
                            <Sparkles className="h-2.5 w-2.5" />
                            AI
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                            <Upload className="h-2.5 w-2.5" />
                            Upload
                          </span>
                        )}
                      </div>
                      {busy && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
