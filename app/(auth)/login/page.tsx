"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowRight, ArrowLeft, RotateCcw, CheckCircle } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/hooks/use-auth";
import { authApi } from "@/lib/api-client";
import { toast } from "sonner";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailForm = z.infer<typeof emailSchema>;

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { verifyOtp, googleLogin } = useAuthStore();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  // ─── Step 1: send OTP ─────────────────────────────────────────────────────
  const onSubmitEmail = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      const result = await authApi.sendOtp(data.email);
      setEmail(data.email);
      setCooldown(result.cooldown_remaining);
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      // Focus first OTP box after render
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    } catch (err: any) {
      // 429 — backend returns cooldown_remaining in error.details
      const remaining = err?.response?.data?.error?.details?.cooldown_remaining;
      if (remaining && remaining > 0) {
        setEmail(data.email);
        setCooldown(remaining);
        setStep("otp");
        setOtp(["", "", "", "", "", ""]);
        setOtpError(`A code was already sent. Resend available in ${remaining}s.`);
        setTimeout(() => otpRefs.current[0]?.focus(), 80);
      } else {
        toast.error(err?.response?.data?.error?.message || "Failed to send code. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Resend OTP ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    setOtpError("");
    try {
      const result = await authApi.sendOtp(email);
      setCooldown(result.cooldown_remaining);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      toast.success("New code sent!");
    } catch (err: any) {
      // 429 — backend returns cooldown_remaining in error.details
      const remaining = err?.response?.data?.error?.details?.cooldown_remaining;
      if (remaining && remaining > 0) {
        setCooldown(remaining);
        setOtpError(`A code was already sent. Resend available in ${remaining}s.`);
      } else {
        toast.error(err?.response?.data?.error?.message || "Failed to resend code.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── OTP input handlers ──────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    // Only accept digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    setOtpError("");

    // Auto-advance
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    if (digit && index === 5) {
      const fullOtp = [...updated].join("");
      if (fullOtp.length === 6) {
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const updated = [...otp];
    for (let i = 0; i < 6; i++) updated[i] = text[i] || "";
    setOtp(updated);
    setOtpError("");
    const lastFilled = Math.min(text.length, 5);
    otpRefs.current[lastFilled]?.focus();
    if (text.length === 6) handleVerifyOtp(text);
  };

  // ─── Step 2: verify OTP ──────────────────────────────────────────────────
  const handleVerifyOtp = useCallback(
    async (code: string) => {
      if (code.length < 6) return;
      setIsLoading(true);
      setOtpError("");
      try {
        await verifyOtp(email, code);
        toast.success("Welcome!");
        router.push("/");
      } catch (err: any) {
        const msg =
          err?.response?.data?.message || "Incorrect code. Please try again.";
        setOtpError(msg);
        // Keep digits visible — don't clear, just let user correct them
      } finally {
        setIsLoading(false);
      }
    },
    [email, verifyOtp, router]
  );

  const handleVerifyClick = () => {
    const code = otp.join("");
    handleVerifyOtp(code);
  };

  // ─── Google ───────────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) return;
    try {
      await googleLogin(credentialResponse.credential);
      toast.success("Welcome!");
      router.push("/");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <main className="w-full max-w-md z-10 relative">
      {/* ── Step 1: Email ── */}
      {step === "email" && (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#20395B]">
              Welcome back
            </h1>
            <p className="text-sm text-[#64748b] mt-2">
              Enter your email to receive a one-time sign-in code.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmitEmail)} className="space-y-5">
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
                <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-[#48C5AF]/0 via-[#48C5AF]/0 to-[#48C5AF]/0 group-focus-within:from-[#48C5AF]/20 group-focus-within:via-[#48C5AF]/10 group-focus-within:to-[#20395B]/10 blur-sm transition-all duration-500 pointer-events-none" />
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="relative pl-10 h-11 bg-white border-[#e2e8f0] text-[#20395B] placeholder:text-[#94a3b8] focus-visible:ring-2 focus-visible:ring-[#48C5AF]/40 focus-visible:border-[#48C5AF] transition-all duration-300 focus-visible:shadow-[0_0_20px_rgba(72,197,175,0.15)]"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              id="send-otp-btn"
              className="w-full h-12 bg-[#20395B] hover:bg-[#2C5282] text-white shadow-lg shadow-[#20395B]/20 hover:shadow-[#20395B]/40 hover:shadow-xl transition-all duration-300 group rounded-lg active:scale-[0.98] active:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="font-semibold">Sending code...</span>
                </span>
              ) : (
                <>
                  <span className="font-semibold text-[15px]">Continue with email</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e2e8f0]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-[#94a3b8] font-medium tracking-widest uppercase">or</span>
            </div>
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign-in failed.")}
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>

          {/* Footer hint */}
          <p className="text-center text-sm text-[#64748b] mt-8">
            New here?{" "}
            <span className="font-medium text-[#20395B]">Just enter your email to get started.</span>
          </p>
        </>
      )}

      {/* ── Step 2: OTP ── */}
      {step === "otp" && (
        <>
          {/* Back button */}
          <button
            type="button"
            onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); setOtpError(""); }}
            className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#20395B] transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#20395B]">
              Check your inbox
            </h1>
            <p className="text-sm text-[#64748b] mt-2 leading-relaxed">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-[#20395B]">{email}</span>
            </p>
          </div>

          {/* OTP boxes */}
          <div className="space-y-1.5 mb-6">
            <Label className="text-xs font-semibold uppercase tracking-wider text-[#20395B]/70">
              Verification code
            </Label>
            <div
              className="flex gap-2"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={isLoading}
                  className={`
                    w-full aspect-square max-w-[52px] text-center text-xl font-bold rounded-lg border-2 
                    bg-white text-[#20395B] outline-none transition-all duration-200
                    focus:border-[#48C5AF] focus:shadow-[0_0_0_3px_rgba(72,197,175,0.15)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${otpError ? "border-red-400" : digit ? "border-[#48C5AF] bg-[#f0fdf9]" : "border-[#e2e8f0]"}
                  `}
                />
              ))}
            </div>

            {/* Error message */}
            {otpError && (
              <p className="text-xs text-red-500 mt-1 flex items-start gap-1">
                <span>{otpError}</span>
              </p>
            )}
          </div>

          {/* Verify button */}
          <Button
            type="button"
            id="verify-otp-btn"
            onClick={handleVerifyClick}
            className="w-full h-12 bg-[#20395B] hover:bg-[#2C5282] text-white shadow-lg shadow-[#20395B]/20 hover:shadow-[#20395B]/40 hover:shadow-xl transition-all duration-300 group rounded-lg active:scale-[0.98] active:shadow-md mb-5"
            disabled={isLoading || otp.join("").length < 6}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="font-semibold">Verifying...</span>
              </span>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                <span className="font-semibold text-[15px]">Verify & sign in</span>
              </>
            )}
          </Button>

          {/* Resend */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-[#94a3b8]">Didn&apos;t receive a code?</span>
            {cooldown > 0 ? (
              <span className="text-[#64748b] font-medium tabular-nums">
                Resend in {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="flex items-center gap-1 font-semibold text-[#48C5AF] hover:text-[#20395B] transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Resend code
              </button>
            )}
          </div>

          {/* Code expires note */}
          <p className="text-center text-xs text-[#94a3b8] mt-4">
            Code expires in 10 minutes
          </p>
        </>
      )}
    </main>
  );
}
