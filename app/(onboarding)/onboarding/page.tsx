"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Globe,
  Hash,
  Type,
  Languages,
  FileText,
  Users,
  Palette,
  Loader2,
  X,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";
import apiClient, { onboardingApi, competitorsApi } from "@/lib/api-client";
import { setToken } from "@/lib/auth";
import type { ApiResponse, ScrapedData, Competitor, SuggestedCompetitor } from "@/types";

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

const companySchema = z.object({
  company_url: z.string().url("Please enter a valid URL").or(z.literal("")),
});

const descriptionSchema = z.object({
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000),
});

const brandSchema = z.object({
  example_article: z.string().optional(),
});

type WorkspaceForm = z.infer<typeof workspaceSchema>;
type CompanyForm = z.infer<typeof companySchema>;
type DescriptionForm = z.infer<typeof descriptionSchema>;
type BrandForm = z.infer<typeof brandSchema>;

// ==========================================
// Constants
// ==========================================

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "nl", label: "Dutch" },
  { value: "pl", label: "Polish" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "tr", label: "Turkish" },
  { value: "sv", label: "Swedish" },
];

const STEP_IDS = ['workspace', 'company', 'language', 'business', 'competitors', 'brand'] as const;
type StepId = typeof STEP_IDS[number];

const STEP_CONFIG = [
  { label: "Workspace", icon: <Building2 className="h-4 w-4" /> },
  { label: "Company", icon: <Globe className="h-4 w-4" /> },
  { label: "Language", icon: <Languages className="h-4 w-4" /> },
  { label: "Business", icon: <FileText className="h-4 w-4" /> },
  { label: "Competitors", icon: <Users className="h-4 w-4" /> },
  { label: "Brand", icon: <Palette className="h-4 w-4" /> },
];

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
    <div className="flex items-center justify-center space-x-1 mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-300 ${index < currentStep
              ? "bg-primary border-primary text-primary-foreground"
              : index === currentStep
                ? "border-primary text-primary bg-primary/10"
                : "border-border text-muted-foreground"
              }`}
          >
            {index < currentStep ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <span className="text-[10px] font-semibold">{index + 1}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-6 h-0.5 mx-0.5 transition-all duration-300 ${index < currentStep ? "bg-primary" : "bg-border"
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
    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Shared onboarding state
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [audienceInput, setAudienceInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<SuggestedCompetitor[]>([]);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [hasIdentified, setHasIdentified] = useState(false);
  const [competitorName, setCompetitorName] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [brandColors, setBrandColors] = useState<Record<string, string>>({
    primary: "#137fec",
    secondary: "#f1f5f9",
  });

  // Forms
  const workspaceForm = useForm<WorkspaceForm>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: { name: "", slug: "" },
  });

  const companyForm = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { company_url: "" },
  });

  const descriptionForm = useForm<DescriptionForm>({
    resolver: zodResolver(descriptionSchema),
    defaultValues: { description: "" },
  });

  const brandForm = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: { example_article: "" },
  });

  // Auto-generate slug from workspace name
  const watchedName = workspaceForm.watch("name");
  useEffect(() => {
    const slug = generateSlug(watchedName);
    workspaceForm.setValue("slug", slug, { shouldValidate: slug.length > 0 });
  }, [watchedName, workspaceForm]);

  // ==========================================
  // Load persisted onboarding state on mount
  // ==========================================
  useEffect(() => {
    async function loadOnboardingState() {
      try {
        // Only attempt to load if user already has a workspace
        if (!user?.workspace_id) {
          setIsInitializing(false);
          return;
        }

        setWorkspaceId(user.workspace_id);

        // Pre-populate workspace form from existing workspace
        if (user.workspace) {
          workspaceForm.setValue('name', user.workspace.name);
          workspaceForm.setValue('slug', user.workspace.slug);
        }

        const { profile } = await onboardingApi.getProfile();
        if (profile) {
          // Determine which step to resume from
          const step = (profile.onboarding_step ?? 'workspace') as string;
          const stepIndex = STEP_IDS.indexOf(step as StepId);
          if (step === 'complete') {
            // Onboarding already completed — redirect to dashboard
            router.push('/');
            return;
          } else if (stepIndex >= 0) {
            setCurrentStep(stepIndex);
          } else {
            // Unknown step or no step — start from company (workspace already created)
            setCurrentStep(1);
          }

          // Pre-populate all form fields from persisted profile
          if (profile.company_url) {
            companyForm.setValue('company_url', profile.company_url);
          }
          if (profile.scraped_data) {
            setScrapedData(profile.scraped_data);
            // Restore brand colors from scraped data if not explicitly set
            if (profile.scraped_data.colors?.length > 0 && !profile.brand_colors) {
              const restoredColors: Record<string, string> = { primary: '#137fec', secondary: '#f1f5f9' };
              if (profile.scraped_data.colors[0]) restoredColors.primary = profile.scraped_data.colors[0];
              if (profile.scraped_data.colors[1]) restoredColors.secondary = profile.scraped_data.colors[1];
              setBrandColors(restoredColors);
            }
          }
          if (profile.language) {
            setSelectedLanguage(profile.language);
          }
          if (profile.description) {
            descriptionForm.setValue('description', profile.description);
          }
          if (profile.target_audience?.length > 0) {
            setTargetAudience(profile.target_audience);
          }
          if (profile.brand_colors) {
            setBrandColors(profile.brand_colors);
          }
          if (profile.example_article) {
            brandForm.setValue('example_article', profile.example_article);
          }
        } else {
          // Profile doesn't exist yet but workspace does — start from company step
          setCurrentStep(1);
        }

        // Load saved competitors
        try {
          const { competitors: saved } = await competitorsApi.list();
          if (saved?.length > 0) {
            setCompetitors(saved);
            setHasIdentified(true);
          }
        } catch {
          // No competitors yet — that's fine
        }
      } catch {
        // First-time user or API error — start from step 0
      }
      setIsInitializing(false);
    }
    loadOnboardingState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // Step 0: Create or Update Workspace
  // ==========================================
  const handleCreateWorkspace = async (data: WorkspaceForm) => {
    setIsLoading(true);
    try {
      const existingWorkspaceId = workspaceId || user?.workspace_id;

      if (existingWorkspaceId) {
        // Update existing workspace
        const response = await apiClient.put<
          ApiResponse<{ workspace: { id: string; name: string; slug: string } }>
        >(`/api/workspaces/${existingWorkspaceId}`, {
          name: data.name,
        });
        const { workspace } = response.data.data;

        if (user) {
          setUser({
            ...user,
            workspace: {
              id: workspace.id,
              name: workspace.name,
              slug: workspace.slug,
            },
          });
        }

        toast.success('Workspace updated successfully!');
      } else {
        // Create new workspace
        const response = await apiClient.post<
          ApiResponse<{ workspace: { id: string; name: string; slug: string }; token?: string }>
        >('/api/workspaces', {
          name: data.name,
          slug: data.slug,
        });
        const { workspace, token } = response.data.data;
        setWorkspaceId(workspace.id);

        if (token) {
          setToken(token);
        }

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

        toast.success('Workspace created successfully!');
      }

      setCurrentStep(1);
    } catch {
      toast.error('Failed to save workspace. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Step 1: Scrape Company URL
  // ==========================================
  const handleScrapeUrl = async () => {
    let url = companyForm.getValues("company_url");
    if (!url) return;

    // Auto-prepend https:// if no protocol is specified
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
      companyForm.setValue('company_url', url);
    }

    setIsScraping(true);
    try {
      const result = await onboardingApi.scrapeUrl(url);
      setScrapedData(result.scraped_data);

      // Pre-fill colors from scraped data
      if (result.scraped_data.colors?.length > 0) {
        const newColors: Record<string, string> = { ...brandColors };
        if (result.scraped_data.colors[0]) newColors.primary = result.scraped_data.colors[0];
        if (result.scraped_data.colors[1]) newColors.secondary = result.scraped_data.colors[1];
        setBrandColors(newColors);
      }

      toast.success("Website data extracted successfully!");
    } catch {
      toast.error("Failed to scrape website. Please check the URL and try again.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleCompanyNext = async () => {
    setIsLoading(true);
    try {
      await onboardingApi.upsertProfile({
        company_url: companyForm.getValues("company_url") || undefined,
        scraped_data: scrapedData ?? undefined,
        onboarding_step: 'language',
      });
      setCurrentStep(2);
    } catch {
      toast.error("Failed to save company details.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Step 2: Language Selection
  // ==========================================
  const handleLanguageNext = async () => {
    setIsLoading(true);
    try {
      await onboardingApi.upsertProfile({
        language: selectedLanguage,
        onboarding_step: 'business',
      });
      setCurrentStep(3);
    } catch {
      toast.error("Failed to save language preference.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Step 3: Description & Target Audience
  // ==========================================
  const handleGenerateDescription = async () => {
    const url = companyForm.getValues("company_url");
    if (!scrapedData && !url) {
      toast.error("Please provide a company URL in Step 1 first.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await onboardingApi.generateDescription(
        scrapedData || {},
        url || ""
      );
      descriptionForm.setValue("description", result.description, {
        shouldValidate: true,
      });
      toast.success("Description generated!");
    } catch {
      toast.error("Failed to generate description. Please write one manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addAudience = useCallback(() => {
    const trimmed = audienceInput.trim();
    if (trimmed && !targetAudience.includes(trimmed)) {
      setTargetAudience((prev) => [...prev, trimmed]);
      setAudienceInput("");
    }
  }, [audienceInput, targetAudience]);

  const removeAudience = (index: number) => {
    setTargetAudience((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDescriptionNext = async (data: DescriptionForm) => {
    if (targetAudience.length < 2) {
      toast.error("Please add at least 2 target audiences.");
      return;
    }

    setIsLoading(true);
    try {
      await onboardingApi.upsertProfile({
        description: data.description,
        target_audience: targetAudience,
        onboarding_step: 'competitors',
      });
      setCurrentStep(4);
    } catch {
      toast.error("Failed to save business description.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Step 4: Competitors
  // ==========================================
  const handleIdentifyCompetitors = async () => {
    const companyUrl = companyForm.getValues("company_url");
    const companyName = scrapedData?.company_name || "";
    const desc = descriptionForm.getValues("description") || scrapedData?.description || "";

    if (!companyUrl && !companyName) {
      toast.error("Company URL or name is needed to identify competitors.");
      return;
    }

    setIsIdentifying(true);
    try {
      const result = await onboardingApi.identifyCompetitors(
        companyUrl || "",
        companyName,
        desc
      );
      setSuggestedCompetitors(result.competitors || []);
      setHasIdentified(true);
    } catch {
      toast.error("Failed to identify competitors. You can add them manually.");
      setHasIdentified(true);
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleAcceptSuggested = async (suggested: SuggestedCompetitor) => {
    setIsLoading(true);
    try {
      const result = await competitorsApi.create({
        name: suggested.name,
        url: suggested.url || undefined,
        notes: suggested.description || undefined,
      });
      setCompetitors((prev) => [result.competitor, ...prev]);
      setSuggestedCompetitors((prev) =>
        prev.filter((s) => s.name !== suggested.name)
      );
    } catch {
      toast.error("Failed to add competitor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectSuggested = (suggested: SuggestedCompetitor) => {
    setSuggestedCompetitors((prev) =>
      prev.filter((s) => s.name !== suggested.name)
    );
  };

  const handleAddCompetitor = async () => {
    if (!competitorName.trim()) return;

    setIsLoading(true);
    try {
      const result = await competitorsApi.create({
        name: competitorName.trim(),
        url: competitorUrl.trim() || undefined,
      });
      setCompetitors((prev) => [result.competitor, ...prev]);
      setCompetitorName("");
      setCompetitorUrl("");
    } catch {
      toast.error("Failed to add competitor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCompetitor = async (id: string) => {
    try {
      await competitorsApi.delete(id);
      setCompetitors((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Failed to remove competitor.");
    }
  };

  const handleCompetitorsNext = async () => {
    setIsLoading(true);
    try {
      await onboardingApi.upsertProfile({
        onboarding_step: 'brand',
      });
      setCurrentStep(5);
    } catch {
      toast.error("Failed to save progress.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Step 5: Brand & Article (Final)
  // ==========================================
  const handleComplete = async (data: BrandForm) => {
    setIsLoading(true);
    try {
      await onboardingApi.upsertProfile({
        brand_colors: brandColors,
        example_article: data.example_article || undefined,
      });
      await onboardingApi.completeOnboarding();

      // Reauthenticate to update user state with onboarding_completed: true
      // This prevents the dashboard layout from redirecting back to onboarding
      await reauthenticate();

      toast.success('Onboarding complete! Welcome aboard.');
      router.push('/');
    } catch {
      toast.error('Failed to complete onboarding.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <main className="w-full max-w-lg p-6 z-10 relative">
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Resuming your setup...</p>
        </div>
      </main>
    );
  }

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
      <StepIndicator currentStep={currentStep} steps={STEP_CONFIG} />

      {/* Card */}
      <div className="w-full bg-card rounded-xl border border-border shadow-xl overflow-hidden">
        <div className="p-8">
          {/* ================================ */}
          {/* Step 0: Create Workspace */}
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
          {/* Step 1: Company Details */}
          {/* ================================ */}
          {currentStep === 1 && (
            <>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-1">
                  <Globe className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">Company Details</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your company website URL so we can extract information
                  for content generation.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="company-url"
                    className="text-xs font-medium uppercase tracking-wider"
                  >
                    Company Website URL
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                      <Input
                        {...companyForm.register("company_url")}
                        id="company-url"
                        type="url"
                        placeholder="https://example.com"
                        className="pl-10 bg-accent border-border focus-visible:ring-primary/50"
                        autoFocus
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleScrapeUrl}
                      disabled={isScraping || !companyForm.watch("company_url")}
                    >
                      {isScraping ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      <span className="ml-1.5">
                        {isScraping ? "Extracting..." : "Extract"}
                      </span>
                    </Button>
                  </div>
                  {companyForm.formState.errors.company_url && (
                    <p className="text-xs text-destructive">
                      {companyForm.formState.errors.company_url.message}
                    </p>
                  )}
                </div>

                {scrapedData && (
                  <div className="rounded-lg border border-border bg-accent/50 p-4 space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Extracted Data
                    </p>
                    {scrapedData.company_name && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Name:</span>{" "}
                        {scrapedData.company_name}
                      </p>
                    )}
                    {scrapedData.description && (
                      <p className="text-sm line-clamp-2">
                        <span className="text-muted-foreground">
                          Description:
                        </span>{" "}
                        {scrapedData.description}
                      </p>
                    )}
                    {scrapedData.colors.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Colors:
                        </span>
                        <div className="flex gap-1">
                          {scrapedData.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-5 h-5 rounded-full border border-border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                    type="button"
                    onClick={handleCompanyNext}
                    className="shadow-lg shadow-primary/20 hover:shadow-primary/40 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <LoadingSpinner />
                        Saving...
                      </span>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ================================ */}
          {/* Step 2: Language Selection */}
          {/* ================================ */}
          {currentStep === 2 && (
            <>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-1">
                  <Languages className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">Article Language</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Select the language for your generated articles.
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wider">
                    Language
                  </Label>
                  <Select
                    value={selectedLanguage}
                    onValueChange={setSelectedLanguage}
                  >
                    <SelectTrigger className="w-full bg-accent border-border">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentStep(1)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleLanguageNext}
                    className="shadow-lg shadow-primary/20 hover:shadow-primary/40 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <LoadingSpinner />
                        Saving...
                      </span>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ================================ */}
          {/* Step 3: Describe Your Business */}
          {/* ================================ */}
          {currentStep === 3 && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 mb-1">
                    <FileText className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-medium">
                      Describe Your Business
                    </h2>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                    className="text-xs"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Describe your business and target audience for better content
                  generation.
                </p>
              </div>

              <form
                onSubmit={descriptionForm.handleSubmit(handleDescriptionNext)}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="description"
                    className="text-xs font-medium uppercase tracking-wider"
                  >
                    Description
                  </Label>
                  <Textarea
                    {...descriptionForm.register("description")}
                    id="description"
                    placeholder="Enter a description of your business"
                    className="bg-accent border-border focus-visible:ring-primary/50 min-h-[120px]"
                    autoFocus
                  />
                  {descriptionForm.formState.errors.description && (
                    <p className="text-xs text-destructive">
                      {descriptionForm.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wider">
                    Target Audience{" "}
                    <span className="text-muted-foreground font-normal normal-case tracking-normal">
                      (min 2)
                    </span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={audienceInput}
                      onChange={(e) => setAudienceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAudience();
                        }
                      }}
                      placeholder="e.g. lawyers in Florida"
                      className="bg-accent border-border focus-visible:ring-primary/50"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={addAudience}
                      disabled={!audienceInput.trim()}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {targetAudience.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {targetAudience.map((audience, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="pl-2.5 pr-1 py-1 gap-1 cursor-pointer hover:bg-destructive/10"
                          onClick={() => removeAudience(index)}
                        >
                          {audience}
                          <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentStep(2)}
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
                        Saving...
                      </span>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}

          {/* ================================ */}
          {/* Step 4: Competitors */}
          {/* ================================ */}
          {currentStep === 4 && (
            <>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">
                    Identify Competitors
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  We&apos;ll find your competitors automatically. Review the
                  suggestions and add any we missed.
                </p>
              </div>

              <div className="space-y-5">
                {/* AI Identify Button */}
                {!hasIdentified && !isIdentifying && (
                  <Button
                    type="button"
                    onClick={handleIdentifyCompetitors}
                    className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/40"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Find My Competitors
                  </Button>
                )}

                {/* Loading state */}
                {isIdentifying && (
                  <div className="flex flex-col items-center py-8 space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Searching the web for your competitors...
                    </p>
                  </div>
                )}

                {/* Suggested Competitors */}
                {hasIdentified && suggestedCompetitors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Suggested Competitors ({suggestedCompetitors.length})
                    </p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {suggestedCompetitors.map((suggested) => (
                        <div
                          key={suggested.name}
                          className="rounded-lg border border-border bg-accent/30 px-3 py-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {suggested.name}
                              </p>
                              {suggested.url && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {suggested.url}
                                </p>
                              )}
                              {suggested.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {suggested.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                onClick={() => handleAcceptSuggested(suggested)}
                                disabled={isLoading}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() =>
                                  handleRejectSuggested(suggested)
                                }
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirmed Competitors */}
                {competitors.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Confirmed Competitors ({competitors.length})
                    </p>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      {competitors.map((competitor) => (
                        <div
                          key={competitor.id}
                          className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {competitor.name}
                            </p>
                            {competitor.url && (
                              <p className="text-xs text-muted-foreground truncate">
                                {competitor.url}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() =>
                              handleRemoveCompetitor(competitor.id)
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Add (shown after identification) */}
                {hasIdentified && (
                  <div className="space-y-3 border-t border-border pt-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Add Manually
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={competitorName}
                        onChange={(e) => setCompetitorName(e.target.value)}
                        placeholder="Company name"
                        className="bg-accent border-border focus-visible:ring-primary/50 flex-1"
                      />
                      <Input
                        value={competitorUrl}
                        onChange={(e) => setCompetitorUrl(e.target.value)}
                        placeholder="URL (optional)"
                        className="bg-accent border-border focus-visible:ring-primary/50 flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCompetitor();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleAddCompetitor}
                        disabled={isLoading || !competitorName.trim()}
                        className="shrink-0"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentStep(3)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCompetitorsNext}
                    className="shadow-lg shadow-primary/20 hover:shadow-primary/40 group"
                  >
                    <span>Continue</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* ================================ */}
          {/* Step 5: Brand Colors & Example Article */}
          {/* ================================ */}
          {currentStep === 5 && (
            <>
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-1">
                  <Palette className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-medium">Brand & Style</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Set your brand colors and provide an example article to match
                  your writing style.
                </p>
              </div>

              <form
                onSubmit={brandForm.handleSubmit(handleComplete)}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wider">
                    Brand Colors
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        Primary
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={brandColors.primary}
                          onChange={(e) =>
                            setBrandColors((prev) => ({
                              ...prev,
                              primary: e.target.value,
                            }))
                          }
                          className="w-8 h-8 rounded-md border border-border cursor-pointer bg-transparent"
                        />
                        <Input
                          value={brandColors.primary}
                          onChange={(e) =>
                            setBrandColors((prev) => ({
                              ...prev,
                              primary: e.target.value,
                            }))
                          }
                          className="bg-accent border-border text-xs h-8"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">
                        Secondary
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={brandColors.secondary}
                          onChange={(e) =>
                            setBrandColors((prev) => ({
                              ...prev,
                              secondary: e.target.value,
                            }))
                          }
                          className="w-8 h-8 rounded-md border border-border cursor-pointer bg-transparent"
                        />
                        <Input
                          value={brandColors.secondary}
                          onChange={(e) =>
                            setBrandColors((prev) => ({
                              ...prev,
                              secondary: e.target.value,
                            }))
                          }
                          className="bg-accent border-border text-xs h-8"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="example-article"
                    className="text-xs font-medium uppercase tracking-wider"
                  >
                    Example Article{" "}
                    <span className="text-muted-foreground font-normal normal-case tracking-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    {...brandForm.register("example_article")}
                    id="example-article"
                    placeholder="Paste a URL or article text that represents your desired writing style..."
                    className="bg-accent border-border focus-visible:ring-primary/50 min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps us match your brand&apos;s tone and writing style.
                  </p>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentStep(4)}
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
                        Finishing...
                      </span>
                    ) : (
                      <>
                        <span>Complete Setup</span>
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Card Footer */}
        <div className="px-8 py-3 bg-accent/50 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Step {currentStep + 1} of {STEP_CONFIG.length}
            </span>
            <span className="flex items-center space-x-1.5">
              {STEP_CONFIG[currentStep].icon}
              <span>{STEP_CONFIG[currentStep].label}</span>
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
