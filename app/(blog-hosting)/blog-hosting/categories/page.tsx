"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderTree,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent?: string;
}

const initialCategories: Category[] = [
  { id: "1", name: "Marketing", slug: "marketing", description: "Marketing related posts", count: 12 },
  { id: "2", name: "Technology", slug: "technology", description: "Tech news and updates", count: 8 },
  { id: "3", name: "Business", slug: "business", description: "Business insights", count: 6 },
  { id: "4", name: "Design", slug: "design", description: "Design tips and inspiration", count: 4 },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "" });

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateDialog = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", description: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug, description: category.description });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: formData.name, slug: formData.slug || generateSlug(formData.name), description: formData.description }
            : c
        )
      );
      toast.success("Category updated successfully");
    } else {
      const newCategory: Category = {
        id: `${Date.now()}`,
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        count: 0,
      };
      setCategories((prev) => [...prev, newCategory]);
      toast.success("Category created successfully");
    }
    setIsDialogOpen(false);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  const deleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your posts into categories</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/40 backdrop-blur-xl border-border/60">
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {filteredCategories.map((category) => (
              <div key={category.id} className="flex items-center gap-4 p-4 hover:bg-accent/50">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <FolderTree className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{category.description}</p>
                </div>
                <p className="text-sm text-muted-foreground">{category.count} posts</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(category)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteCategory(category.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-medium text-lg">No categories found</h3>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the category details." : "Create a new category for your posts."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="category-slug"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{editingCategory ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}