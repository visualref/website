"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { verticalsApi } from "@/lib/api/verticals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, Trash } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  domain: z.string().optional(),
  content_style: z.string().optional(), // We'll parse json later or just use string for now
  posting_schedule: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function VerticalFormPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const isNew = id === "new";

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { data: vertical, isLoading } = useQuery({
    queryKey: ["vertical", id],
    queryFn: () => verticalsApi.get(id),
    enabled: !isNew,
  });

  useEffect(() => {
    if (vertical) {
      reset({
        name: vertical.name,
        domain: vertical.domain,
        content_style: vertical.content_style ? JSON.stringify(vertical.content_style, null, 2) : "",
        posting_schedule: vertical.posting_schedule ? JSON.stringify(vertical.posting_schedule, null, 2) : "",
      });
    }
  }, [vertical, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = {
        ...data,
        content_style: data.content_style ? JSON.parse(data.content_style) : undefined,
        posting_schedule: data.posting_schedule ? JSON.parse(data.posting_schedule) : undefined,
      };
      
      if (isNew) {
        return verticalsApi.create(payload);
      } else {
        return verticalsApi.update(id, payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verticals"] });
      toast.success(isNew ? "Vertical created" : "Vertical updated");
      router.push("/verticals");
    },
    onError: (error) => {
      toast.error("Failed to save vertical");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => verticalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verticals"] });
      toast.success("Vertical deleted");
      router.push("/verticals");
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div className="p-8"><Skeleton className="h-8 w-full mb-4" /><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/verticals"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? "New Vertical" : "Edit Vertical"}</h1>
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
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} placeholder="e.g. Technology Blog" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain">Domain</Label>
          <Input id="domain" {...register("domain")} placeholder="e.g. techblog.com" />
          {errors.domain && <p className="text-sm text-red-500">{errors.domain.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content_style">Content Style (JSON)</Label>
          <Textarea 
            id="content_style" 
            {...register("content_style")} 
            placeholder='{"tone": "professional"}' 
            className="font-mono h-32"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="posting_schedule">Posting Schedule (JSON)</Label>
          <Textarea 
            id="posting_schedule" 
            {...register("posting_schedule")} 
            placeholder='{"frequency": "weekly"}' 
            className="font-mono h-32"
          />
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
