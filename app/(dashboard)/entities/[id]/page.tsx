"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Trash } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { entitiesApi } from "@/lib/api/entities";

const entitySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.string().min(2, "Type is required"),

  aliases: z.string().optional(), // Comma separated
  description: z.string().optional(), // Mapped to properties.description
});

type EntityFormValues = z.infer<typeof entitySchema>;

export default function EntityFormPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = params.id !== "new";
  const [isLoading, setIsLoading] = useState(false);



  // Fetch entity data if editing
  const { data: entityData, isLoading: isFetchingEntity } = useQuery({
    queryKey: ["entity", params.id],
    queryFn: () => entitiesApi.getOne(params.id),
    enabled: isEditing,
  });

  const form = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      name: "",
      type: "",

      aliases: "",
      description: "",
    },
  });

  // Reset form when data is loaded
  useEffect(() => {
    if (entityData?.data) {
      const entity = entityData.data;
      form.reset({
        name: entity.name,
        type: entity.type || "",

        aliases: entity.aliases?.join(", ") || "",
        description: entity.properties?.description || "",
      });
    }
  }, [entityData, form]);

  const createMutation = useMutation({
    mutationFn: (data: any) => entitiesApi.create(data),
    onSuccess: () => {
      toast.success("Entity created successfully");
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      router.push("/entities");
    },
    onError: (error) => {
      toast.error("Failed to create entity");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => entitiesApi.update(params.id, data),
    onSuccess: () => {
      toast.success("Entity updated successfully");
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      router.push("/entities");
    },
    onError: (error) => {
      toast.error("Failed to update entity");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => entitiesApi.delete(params.id),
    onSuccess: () => {
      toast.success("Entity deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["entities"] });
      router.push("/entities");
    },
    onError: (error) => {
      toast.error("Failed to delete entity");
      console.error(error);
    },
  });

  const onSubmit = (data: EntityFormValues) => {
    setIsLoading(true);
    const payload = {
      name: data.name,
      type: data.type,

      aliases: data.aliases
        ? data.aliases.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      properties: data.description ? { description: data.description } : {},
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
    setIsLoading(false);
  };

  if (isEditing && isFetchingEntity) {
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
            {isEditing ? "Edit Entity" : "Create Entity"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update entity details and properties."
              : "Add a new entity to the knowledge base."}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Apple Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Company, Person" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


            </div>

            <FormField
              control={form.control}
              name="aliases"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aliases (comma separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Apple, AAPL" {...field} />
                  </FormControl>
                  <FormDescription>
                    Alternative names for this entity.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the entity..."
                      className="resize-none min-h-[100px]"
                      {...field}
                    />
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
                {isEditing ? "Update Entity" : "Create Entity"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
