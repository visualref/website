"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/hooks/use-auth";
import { toast } from "sonner";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, googleLogin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    try {
      await googleLogin(credentialResponse.credential);
      toast.success("Account created successfully!");
      router.push("/onboarding");
    } catch {
      toast.error("Google sign-up failed. Please try again.");
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success("Account created successfully!");
      router.push("/onboarding");
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-md z-10 relative">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#20395B]">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Start creating on-brand content in minutes — no credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[#20395B]/70">
            Full name
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <UserIcon className="h-4 w-4 text-muted-foreground group-focus-within:text-[#48C5AF] transition-colors" />
            </div>
            <Input
              {...register("name")}
              id="name"
              type="text"
              placeholder="Jane Doe"
              className="pl-10 h-11 bg-white border-[#e2e8f0] focus-visible:ring-2 focus-visible:ring-[#48C5AF]/40 focus-visible:border-[#48C5AF] transition-all"
              autoComplete="name"
            />
          </div>
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#20395B]/70">
            Email address
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-muted-foreground group-focus-within:text-[#48C5AF] transition-colors" />
            </div>
            <Input
              {...register("email")}
              id="email"
              type="email"
              placeholder="you@company.com"
              className="pl-10 h-11 bg-white border-[#e2e8f0] focus-visible:ring-2 focus-visible:ring-[#48C5AF]/40 focus-visible:border-[#48C5AF] transition-all"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#20395B]/70">
            Password
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-muted-foreground group-focus-within:text-[#48C5AF] transition-colors" />
            </div>
            <Input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              className="pl-10 pr-10 h-11 bg-white border-[#e2e8f0] focus-visible:ring-2 focus-visible:ring-[#48C5AF]/40 focus-visible:border-[#48C5AF] transition-all"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground hover:text-[#20395B] transition-colors" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground hover:text-[#20395B] transition-colors" />
              )}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
        </div>

        {/* Terms */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-[#48C5AF] hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-[#48C5AF] hover:underline">Privacy Policy</a>.
        </p>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-11 bg-[#20395B] hover:bg-[#2C5282] text-white shadow-lg shadow-[#20395B]/20 hover:shadow-[#20395B]/30 transition-all group rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : (
            <>
              <span className="font-semibold">Create account</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#e2e8f0]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground uppercase tracking-wider">
            Or sign up with
          </span>
        </div>
      </div>

      {/* Google */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error("Google sign-up failed.")}
          size="large"
          width="100%"
          text="signup_with"
        />
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#20395B] hover:text-[#48C5AF] transition-colors">
          Sign in
        </Link>
      </p>
    </main>
  );
}
