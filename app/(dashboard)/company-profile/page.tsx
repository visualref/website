"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { onboardingApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
    Building2,
    Globe,
    Languages,
    Palette,
    Pencil,
    Save,
    Target,
    Users,
    X,
} from "lucide-react";

export default function CompanyProfilePage() {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ["company-profile"],
        queryFn: () => onboardingApi.getProfile(),
    });

    const profile = data?.profile;

    const [formState, setFormState] = useState({
        company_url: "",
        description: "",
        target_audience: "",
        language: "",
        example_article: "",
    });

    const startEditing = () => {
        if (profile) {
            setFormState({
                company_url: profile.company_url || "",
                description: profile.description || "",
                target_audience: profile.target_audience?.join(", ") || "",
                language: profile.language || "en",
                example_article: profile.example_article || "",
            });
        }
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
    };

    const mutation = useMutation({
        mutationFn: async () => {
            return onboardingApi.upsertProfile({
                company_url: formState.company_url || undefined,
                description: formState.description || undefined,
                target_audience: formState.target_audience
                    ? formState.target_audience.split(",").map((a) => a.trim()).filter(Boolean)
                    : [],
                language: formState.language || "en",
                example_article: formState.example_article || undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company-profile"] });
            toast.success("Company profile updated");
            setIsEditing(false);
        },
        onError: () => {
            toast.error("Failed to update profile");
        },
    });

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-red-500">
                Failed to load company profile. Please try again.
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
                <div className="border rounded-xl p-12 flex flex-col items-center justify-center text-center bg-card">
                    <Building2 className="h-16 w-16 text-muted-foreground/40 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No Profile Found</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Complete the onboarding process to set up your company profile and start generating content.
                    </p>
                    <Button asChild>
                        <a href="/onboarding">Start Onboarding</a>
                    </Button>
                </div>
            </div>
        );
    }

    const brandColors = profile.brand_colors
        ? Object.entries(profile.brand_colors)
        : [];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
                    <p className="text-muted-foreground mt-1">
                        Your company information used for content generation
                    </p>
                </div>
                {!isEditing ? (
                    <Button onClick={startEditing} variant="outline">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={cancelEditing}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                            <Save className="mr-2 h-4 w-4" />
                            {mutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Content */}
            <div className="grid gap-6">
                {/* Company URL */}
                <div className="border rounded-xl p-6 bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Company Website</h2>
                    </div>
                    {isEditing ? (
                        <div className="space-y-2">
                            <Label htmlFor="company_url">URL</Label>
                            <Input
                                id="company_url"
                                value={formState.company_url}
                                onChange={(e) => setFormState({ ...formState, company_url: e.target.value })}
                                placeholder="https://example.com"
                            />
                        </div>
                    ) : (
                        <p className="text-foreground">
                            {profile.company_url ? (
                                <a
                                    href={profile.company_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    {profile.company_url}
                                </a>
                            ) : (
                                <span className="text-muted-foreground italic">Not set</span>
                            )}
                        </p>
                    )}
                </div>

                {/* Description */}
                <div className="border rounded-xl p-6 bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Company Description</h2>
                    </div>
                    {isEditing ? (
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formState.description}
                                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                placeholder="Describe your company and what it does..."
                                rows={4}
                            />
                        </div>
                    ) : (
                        <p className="text-foreground leading-relaxed">
                            {profile.description || (
                                <span className="text-muted-foreground italic">No description set</span>
                            )}
                        </p>
                    )}
                </div>

                {/* Target Audience & Language */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Target Audience */}
                    <div className="border rounded-xl p-6 bg-card">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Target Audience</h2>
                        </div>
                        {isEditing ? (
                            <div className="space-y-2">
                                <Label htmlFor="target_audience">Audiences (comma separated)</Label>
                                <Input
                                    id="target_audience"
                                    value={formState.target_audience}
                                    onChange={(e) => setFormState({ ...formState, target_audience: e.target.value })}
                                    placeholder="marketers, developers, founders"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {profile.target_audience?.length > 0 ? (
                                    profile.target_audience.map((audience, i) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1">
                                            <Users className="mr-1.5 h-3 w-3" />
                                            {audience}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-muted-foreground italic">No audiences defined</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Language */}
                    <div className="border rounded-xl p-6 bg-card">
                        <div className="flex items-center gap-2 mb-4">
                            <Languages className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Language</h2>
                        </div>
                        {isEditing ? (
                            <div className="space-y-2">
                                <Label htmlFor="language">Content Language</Label>
                                <Input
                                    id="language"
                                    value={formState.language}
                                    onChange={(e) => setFormState({ ...formState, language: e.target.value })}
                                    placeholder="en"
                                />
                            </div>
                        ) : (
                            <Badge variant="outline" className="px-4 py-1.5 text-sm">
                                {profile.language?.toUpperCase() || "EN"}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Brand Colors */}
                {brandColors.length > 0 && (
                    <div className="border rounded-xl p-6 bg-card">
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="h-5 w-5 text-primary" />
                            <h2 className="text-lg font-semibold">Brand Colors</h2>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {brandColors.map(([name, color]) => (
                                <div key={name} className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-lg border border-border shadow-sm"
                                        style={{ backgroundColor: color }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium capitalize">{name}</p>
                                        <p className="text-xs text-muted-foreground">{color}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Example Article */}
                <div className="border rounded-xl p-6 bg-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Example Article</h2>
                    </div>
                    {isEditing ? (
                        <div className="space-y-2">
                            <Label htmlFor="example_article">Example Article URL or Content</Label>
                            <Textarea
                                id="example_article"
                                value={formState.example_article}
                                onChange={(e) => setFormState({ ...formState, example_article: e.target.value })}
                                placeholder="Paste an example article URL or content that represents your desired writing style..."
                                rows={4}
                            />
                        </div>
                    ) : (
                        <p className="text-foreground leading-relaxed">
                            {profile.example_article ? (
                                profile.example_article.startsWith("http") ? (
                                    <a
                                        href={profile.example_article}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {profile.example_article}
                                    </a>
                                ) : (
                                    <span className="line-clamp-4">{profile.example_article}</span>
                                )
                            ) : (
                                <span className="text-muted-foreground italic">No example article set</span>
                            )}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
