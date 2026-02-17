"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sparkles,
  Building2,
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Globe,
  Hash,
  Type,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types";

// ==========================================
// Schemas
// ==========================================

const workspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Workspace name must be at least 2 characters")
    .max(50, "Workspace name must be 50 characters or less"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be 50 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase letters, numbers, and hyphens only"
    ),
});

const verticalSchema = z.object({
  name: z
    .string()
    .min(2, "Vertical name must be at least 2 characters")
    .max(100, "Vertical name must be 100 characters or less"),
  domain: z
    .string()
    .min(2, "Domain must be at least 2 characters")
    .max(255, "Domain must be 255 characters or less")
    .optional()
    .or(z.literal("")),
});

type WorkspaceForm = z.infer<typeof workspaceSchema>;
type VerticalForm = z.infer<typeof verticalSchema>;

// ==========================================
// Step Indicator
// ==========================================

function StepIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: { label: string; icon: React.ReactNode }[];
}) {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
              index < currentStep
                ? "bg-primary border-primary text-primary-foreground"
                : index === currentStep
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground"
            }`}
          >
            {index < currentStep ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <span className="text-xs font-semibold">{index + 1}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-0.5 mx-1 transition-all duration-300 ${
                index < currentStep ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// Loading Spinner
// ==========================================

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ==========================================
// Slug Generator
// ==========================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ==========================================
// Main Onboarding Page
// ==========================================

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser, reauthenticate } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const steps = [
    { label: "Workspace", icon: <Building2 className="h-4 w-4" /> },
    { label: "Vertical", icon: <Layers className="h-4 w-4" /> },
    { label: "Complete", icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  // Workspace form
  const workspaceForm = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  // Vertical form
  const verticalForm = useForm<VerticalForm>({
    resolver: zodResolver(verticalSchema),
    defaultValues: {
      name: "",
      domain: "",
    },
  });

  // Auto-generate slug from workspace name
  const watchedName = workspaceForm.watch("name");
  useEffect(() => {
    const slug = generateSlug(watchedName);
    workspaceForm.setValue("slug", slug, { shouldValidate: slug.length > 0 });
  }, [watchedName, workspaceForm]);

  // Step 1: Create Workspace
  const handleCreateWorkspace = async (data: WorkspaceForm) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<
        ApiResponse<{ id: string; name: string; slug: string }>
      >("/api/workspaces", {
        name: data.name,
        slug: data.slug,
      });
      const workspace = response.data.data;
      setWorkspaceId(workspace.id);

      // Update user in auth store with workspace info
      if (user) {
        setUser({
          ...user,
          workspace_id: workspace.id,
          workspace: {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
          },
        });
        await reauthenticate();
      }

      toast.success("Workspace created successfully!");
      setCurrentStep(1);
    } catch {
      toast.error("Failed to create workspace. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Create Vertical
  const handleCreateVertical = async (data: VerticalForm) => {
    setIsLoading(true);
    try {
      await apiClient.post("/api/verticals", {
        name: data.name,
        domain: data.domain || undefined,
      });

      toast.success("Vertical created successfully!");
      setCurrentStep(2);
    } catch {
      toast.error("Failed to create vertical. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Go to dashboard
  const handleGoToDashboard = () => {
    router.push("/");
  };

  return (
    <main className="w-full max-w-lg p-6 z-10 relative">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-6 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Set Up Your Workspace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Let&apos;s get everything ready for you in just a few steps.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} steps={steps} />

      {/* Card */}
      <div className="w-full bg-card rounded-xl border border-border shadow-xl overflow-hidden">
        <div className="p-8">
          {/* ================================ */}
          {/* Step 1: Create Workspace */}
          {/* ================================ */}
          {currentStep === 0 && (
            <>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-1">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">Create Your Workspace</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  A workspace is where your team collaborates on content.
                </p>
              </div>

              <form
                onSubmit={workspaceForm.handleSubmit(handleCreateWorkspace)}
                className="space-y-5"
              >
                {/* Workspace Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="workspace-name"
                    className="text-xs font-medium uppercase tracking-wider"
                  >
                    Workspace Name
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Type className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                      {...workspaceForm.register("name")}
                      id="workspace-name"
                      type="text"
                      placeholder="My Company"
                      className="pl-10 bg-accent border-border focus-visible:ring-primary/50"
                      autoComplete="organization"
                      autoFocus
                    />
                  </div>
                  {workspaceForm.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {workspaceForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* Workspace Slug */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="workspace-slug"
                    className="text-xs font-medium uppercase tracking-wider"
                  >
                    Workspace URL Slug
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                      {...workspaceForm.register("slug")}
                      id="workspace-slug"
                      type="text"
                      placeholder="my-company"
                      className="pl-10 bg-accent border-border focus-visible:ring-primary/50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will be used in your workspace URL.
                  </p>
                  {workspaceForm.formState.errors.slug && (
                    <p className="text-xs text-destructive">
                      {workspaceForm.formState.errors.slug.message}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    className="shadow-lg shadow-primary/20 hover:shadow-primary/40 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <LoadingSpinner />
                        Creating...
                      </span>
                    ) : (
                      <>
                        <span>Create Workspace</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* ================================ */}
          {/* Step 2: Define First Vertical */}
          {/* ================================ */}
          {currentStep === 1 && (
            <>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-1">
                  <Layers className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">
                    Define Your First Vertical
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  A vertical represents a content niche or topic area you want
                  to cover.
                </p>
              </div>

              <form
                onSubmit={verticalForm.handleSubmit(handleCreateVertical)}
                className="space-y-5"
              >
                {/* Vertical Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="vertical-name"
                    className="text-xs font-medium uppercase tracking-wider"
                  >
                    Vertical Name
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Type className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                      {...verticalForm.register("name")}
                      id="vertical-name"
                      type="text"
                      placeholder="e.g., Personal Finance, Health & Wellness"
                      className="pl-10 bg-accent border-border focus-visible:ring-primary/50"
                      autoFocus
                    />
                  </div>
                  {verticalForm.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {verticalForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* Domain */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="vertical-domain"
                    className="text-xs font-medium uppercase tracking-wider"
                  >
                    Domain{" "}
                    <span className="text-muted-foreground font-normal normal-case tracking-normal">
                      (optional)
                    </span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <Input
                      {...verticalForm.register("domain")}
                      id="vertical-domain"
                      type="text"
                      placeholder="e.g., example.com"
                      className="pl-10 bg-accent border-border focus-visible:ring-primary/50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The target domain for this content vertical.
                  </p>
                  {verticalForm.formState.errors.domain && (
                    <p className="text-xs text-destructive">
                      {verticalForm.formState.errors.domain.message}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentStep(0)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="shadow-lg shadow-primary/20 hover:shadow-primary/40 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <LoadingSpinner />
                        Creating...
                      </span>
                    ) : (
                      <>
                        <span>Create Vertical</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* ================================ */}
          {/* Step 3: Success / Complete */}
          {/* ================================ */}
          {currentStep === 2 && (
            <div className="text-center py-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-2">
                You&apos;re All Set!
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                Welcome to Geo Content
                {user?.name ? `, ${user.name}` : ""}!
              </p>
              <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
                Your workspace and first vertical have been created. You can now
                start creating and managing content.
              </p>

              <Button
                onClick={handleGoToDashboard}
                className="shadow-lg shadow-primary/20 hover:shadow-primary/40 group px-8"
                size="lg"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          )}
        </div>

        {/* Card Footer - Step label */}
        <div className="px-8 py-3 bg-accent/50 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="flex items-center space-x-1.5">
              {steps[currentStep].icon}
              <span>{steps[currentStep].label}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-8 flex justify-center space-x-6 text-xs text-muted-foreground/60">
        <a className="hover:text-muted-foreground transition-colors" href="#">
          Privacy Policy
        </a>
        <span>•</span>
        <a className="hover:text-muted-foreground transition-colors" href="#">
          Terms of Service
        </a>
      </div>
    </main>
  );
}
