"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { topicsApi } from "@/lib/api-client";
import { verticalsApi } from "@/lib/api/verticals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Trash } from "lucide-react";
import Link from "next/link";
import { ContentType, Priority } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  vertical_id: z.string().min(1, "Vertical is required"),
  keywords: z.string().optional(), // Comma separated string
  contentType: z.nativeEnum(ContentType),
  priority: z.nativeEnum(Priority),
});

type FormData = z.infer<typeof schema>;

export default function TopicFormPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const isNew = id === "new";

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      contentType: ContentType.ARTICLE,
      priority: Priority.MEDIUM,
    },
  });

  const { data: topic, isLoading: isLoadingTopic } = useQuery({
    queryKey: ["topic", id],
    queryFn: () => topicsApi.get(id),
    enabled: !isNew,
  });

  const { data: verticalsData, isLoading: isLoadingVerticals } = useQuery({
    queryKey: ["verticals"],
    queryFn: () => verticalsApi.list(),
  });

  useEffect(() => {
    if (topic) {
      reset({
        title: topic.title,
        vertical_id: topic.vertical_id,
        // keywords: topic.keywords?.join(", "), // Assuming keywords is an array
        contentType: (topic as any).contentType || ContentType.ARTICLE, // Fallback if missing
        priority: (topic as any).priority || Priority.MEDIUM,
      });
    }
  }, [topic, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        vertical: data.vertical_id, // API expects 'vertical' string ID? check types. CreateTopicPayload has 'vertical' string.
        keywords: data.keywords ? data.keywords.split(",").map(k => k.trim()) : [],
      };
      
      if (isNew) {
        return topicsApi.create(payload);
      } else {
        return topicsApi.update(id, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success(isNew ? "Topic created" : "Topic updated");
      router.push("/topics");
    },
    onError: (error) => {
      toast.error("Failed to save topic");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => topicsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      toast.success("Topic deleted");
      router.push("/topics");
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (isLoadingTopic || isLoadingVerticals) {
    return (
      <div className="p-8">
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/topics"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? "New Topic" : "Edit Topic"}</h1>
        </div>
        {!isNew && (
          <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border p-6 rounded-lg bg-card">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} placeholder="e.g. 10 Best SEO Practices" />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vertical">Vertical</Label>
          <Select 
            onValueChange={(value) => setValue("vertical_id", value)} 
            defaultValue={watch("vertical_id")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a vertical" />
            </SelectTrigger>
            <SelectContent>
              {verticalsData?.data?.map((v) => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vertical_id && <p className="text-sm text-red-500">{errors.vertical_id.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contentType">Content Type</Label>
            <Select 
              onValueChange={(value) => setValue("contentType", value as ContentType)} 
              defaultValue={watch("contentType")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ContentType).map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.contentType && <p className="text-sm text-red-500">{errors.contentType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              onValueChange={(value) => setValue("priority", value as Priority)} 
              defaultValue={watch("priority")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Priority).map((priority) => (
                  <SelectItem key={priority} value={priority} className="capitalize">{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.priority && <p className="text-sm text-red-500">{errors.priority.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords (comma separated)</Label>
          <Input id="keywords" {...register("keywords")} placeholder="seo, marketing, content" />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
