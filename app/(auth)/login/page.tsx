"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    setIsGoogleLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      toast.success("Welcome back!");
      router.push("/");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success("Welcome back!");
      router.push("/");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md p-6 z-10 relative">
      {/* Logo Section */}
      <div className="flex flex-col items-center mb-10 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Geo Content
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Content intelligence platform
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full bg-card rounded-xl border border-border shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-lg font-medium">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to access your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-wider"
              >
                Email Address
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="name@geocontent.com"
                  className="pl-10 bg-accent border-border focus-visible:ring-primary/50"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium uppercase tracking-wider"
                >
                  Password
                </Label>
                <a
                  className="text-xs font-medium text-primary hover:underline"
                  href="#"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-accent border-border focus-visible:ring-primary/50"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/40 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
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
                  Signing in...
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign-in failed.")}
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-8 py-4 bg-accent/50 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Don&apos;t have an account?
          </span>
          <a className="text-xs font-medium text-foreground hover:text-primary transition-colors" href="/register">
            Create an account
          </a>
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
