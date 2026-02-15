"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Trash } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { distributionsApi } from "@/lib/api/distributions";
import { contentApi } from "@/lib/api-client";
import { ContentItem } from "@/types";

const distributionSchema = z.object({
  content_item_id: z.string().min(1, "Content item is required"),
  platform: z.string().min(1, "Platform is required"),
  status: z.enum(["SCHEDULED", "PUBLISHED", "FAILED", "CANCELLED"]).optional(),
  scheduled_at: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
});

type DistributionFormValues = z.infer<typeof distributionSchema>;

export default function DistributionFormPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = params.id !== "new";
  const [isLoading, setIsLoading] = useState(false);

  // Fetch content items for select
  const { data: contentData } = useQuery({
    queryKey: ["content"],
    queryFn: () => contentApi.list(),
  });

  // Fetch distribution data if editing
  const { data: distData, isLoading: isFetchingDist } = useQuery({
    queryKey: ["distribution", params.id],
    queryFn: () => distributionsApi.get(params.id),
    enabled: isEditing,
  });

  const form = useForm<DistributionFormValues>({
    resolver: zodResolver(distributionSchema),
    defaultValues: {
      content_item_id: "",
      platform: "",
      status: "SCHEDULED",
      scheduled_at: "",
      url: "",
    },
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (distData?.data) {
      const dist = distData.data;
      form.reset({
        content_item_id: dist.content_item_id,
        platform: dist.platform,
        status: dist.status,
        scheduled_at: dist.scheduled_at
          ? format(new Date(dist.scheduled_at), "yyyy-MM-dd'T'HH:mm")
          : "",
        url: dist.url || "",
      });
    }
  }, [distData, form]);

  const createMutation = useMutation({
    mutationFn: (data: any) => distributionsApi.create(data),
    onSuccess: () => {
      toast.success("Distribution created successfully");
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      router.push("/distributions");
    },
    onError: (error) => {
      toast.error("Failed to create distribution");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => distributionsApi.update(params.id, data),
    onSuccess: () => {
      toast.success("Distribution updated successfully");
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      router.push("/distributions");
    },
    onError: (error) => {
      toast.error("Failed to update distribution");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => distributionsApi.delete(params.id),
    onSuccess: () => {
      toast.success("Distribution deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      router.push("/distributions");
    },
    onError: (error) => {
      toast.error("Failed to delete distribution");
      console.error(error);
    },
  });

  const onSubmit = (data: DistributionFormValues) => {
    setIsLoading(true);
    const payload = {
      ...data,
      scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString() : undefined,
      url: data.url || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
    setIsLoading(false);
  };

  if (isEditing && isFetchingDist) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Distribution" : "New Distribution"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update distribution details."
              : "Schedule or record a new content distribution."}
          </p>
        </div>
        {isEditing && (
          <Button
            variant="destructive"
            size="icon"
            className="ml-auto"
            onClick={() => {
              if (confirm("Are you sure?")) deleteMutation.mutate();
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content_item_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Item</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content to distribute" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contentData?.data?.map((item: ContentItem) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="wordpress">WordPress</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Published URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Update Distribution" : "Create Distribution"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
