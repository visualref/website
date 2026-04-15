"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    try {
      await googleLogin(credentialResponse.credential);
      toast.success("Welcome back!");
      router.push("/");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
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
    <main className="w-full max-w-md z-10 relative">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#20395B]">
          Welcome back
        </h1>
        <p className="text-sm text-[#64748b] mt-2">
          Sign in to your account to continue managing your content.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-semibold uppercase tracking-wider text-[#20395B]/70"
          >
            Email address
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-[#94a3b8] group-focus-within:text-[#48C5AF] transition-colors duration-300" />
            </div>
            {/* Focus glow ring */}
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-[#48C5AF]/0 via-[#48C5AF]/0 to-[#48C5AF]/0 group-focus-within:from-[#48C5AF]/20 group-focus-within:via-[#48C5AF]/10 group-focus-within:to-[#20395B]/10 blur-sm transition-all duration-500 pointer-events-none" />
            <Input
              {...register("email")}
              id="email"
              type="email"
              placeholder="you@company.com"
              className="relative pl-10 h-11 bg-white border-[#e2e8f0] text-[#20395B] placeholder:text-[#94a3b8] focus-visible:ring-2 focus-visible:ring-[#48C5AF]/40 focus-visible:border-[#48C5AF] transition-all duration-300 focus-visible:shadow-[0_0_20px_rgba(72,197,175,0.15)]"
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-[#20395B]/70"
          >
            Password
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-[#94a3b8] group-focus-within:text-[#48C5AF] transition-colors duration-300" />
            </div>
            {/* Focus glow ring */}
            <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-[#48C5AF]/0 via-[#48C5AF]/0 to-[#48C5AF]/0 group-focus-within:from-[#48C5AF]/20 group-focus-within:via-[#48C5AF]/10 group-focus-within:to-[#20395B]/10 blur-sm transition-all duration-500 pointer-events-none" />
            <Input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="relative pl-10 pr-10 h-11 bg-white border-[#e2e8f0] text-[#20395B] placeholder:text-[#94a3b8] focus-visible:ring-2 focus-visible:ring-[#48C5AF]/40 focus-visible:border-[#48C5AF] transition-all duration-300 focus-visible:shadow-[0_0_20px_rgba(72,197,175,0.15)]"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center z-10"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-[#94a3b8] hover:text-[#20395B] transition-colors" />
              ) : (
                <Eye className="h-4 w-4 text-[#94a3b8] hover:text-[#20395B] transition-colors" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember + forgot */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#e2e8f0] text-[#48C5AF] focus:ring-[#48C5AF]/40 cursor-pointer"
            />
            <span className="text-sm text-[#64748b]">Remember me</span>
          </label>
          <a
            href="#"
            className="text-sm font-medium text-[#48C5AF] hover:text-[#20395B] transition-colors"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit — CTA: "Access Dashboard" with micro-interactions */}
        <Button
          type="submit"
          className="w-full h-12 bg-[#20395B] hover:bg-[#2C5282] text-white shadow-lg shadow-[#20395B]/20 hover:shadow-[#20395B]/40 hover:shadow-xl transition-all duration-300 group rounded-lg active:scale-[0.98] active:shadow-md"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span className="font-semibold">Signing you in...</span>
            </span>
          ) : (
            <>
              <span className="font-semibold text-[15px]">Access Dashboard</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </Button>
      </form>

      {/* ─── OR ─── divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e2e8f0]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-[#94a3b8] font-medium tracking-widest uppercase">
            or
          </span>
        </div>
      </div>

      {/* Google — tighter placement */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("Google sign-in failed.")}
          size="large"
          width="100%"
          text="continue_with"
        />
      </div>

      {/* Create account link */}
      <p className="text-center text-sm text-[#64748b] mt-8">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#20395B] hover:text-[#48C5AF] transition-colors"
        >
          Create one
        </Link>
      </p>
    </main>
  );
}
