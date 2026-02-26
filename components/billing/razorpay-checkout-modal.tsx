"use client";

import { useEffect, useState, useRef } from "react";
import { X, CheckCircle2, Shield, Lock, Zap, Crown, Building2, CreditCard, ArrowRight, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface RazorpayPlan {
  id: string;
  name: string;
  razorpayPlanId: string; // e.g. plan_XXXXXXXX
  monthlyPrice: number; // in INR paise or smallest unit — we display ₹ format
  annualPrice: number;  // total annual, not monthly × 12
  features: string[];
  description: string;
}

interface RazorpayCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  plan: RazorpayPlan;
  userEmail?: string;
  userName?: string;
  /** Called when the frontend subscription_id is obtained and checkout opens */
  onCheckoutOpen?: (subscriptionId: string) => void;
  /**
   * Called by the modal AFTER the user clicks "Confirm & Pay".
   * Should call your backend `POST /api/subscriptions/create` and return { subscription_id, key_id }.
   * Frontend will then open the Razorpay checkout with subscription_id.
   */
  onCreateSubscription: (planId: string, billingCycle: "monthly" | "annual") => Promise<{
    subscription_id: string;
    key_id: string;
  }>;
  /**
   * Called after Razorpay checkout succeeds.
   * Should call your backend `POST /api/subscriptions/verify`.
   */
  onVerifyPayment: (data: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => Promise<void>;
  /** Called on payment failure */
  onPaymentError?: (error: unknown) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PLAN_ICONS: Record<string, React.ElementType> = {
  FREE: Zap,
  STARTER: CreditCard,
  PRO: Crown,
  ENTERPRISE: Building2,
};

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const GST_RATE = 0.18;

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function RazorpayCheckoutModal({
  open,
  onClose,
  plan,
  userEmail,
  userName,
  onCreateSubscription,
  onVerifyPayment,
  onPaymentError,
}: RazorpayCheckoutModalProps) {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  const basePrice = billing === "annual" ? plan.annualPrice : plan.monthlyPrice * 12;
  const gst = Math.round(basePrice * GST_RATE);
  const total = basePrice + gst;
  const annualSaving = Math.round(((plan.monthlyPrice * 12 - plan.annualPrice) / (plan.monthlyPrice * 12)) * 100);

  const PlanIcon = PLAN_ICONS[plan.id] || CreditCard;

  const handleConfirmPay = async () => {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay SDK");

      const { subscription_id, key_id } = await onCreateSubscription(plan.razorpayPlanId, billing);

      const rzp = new (window as any).Razorpay({
        key: key_id,
        subscription_id,
        name: "VisualRef",
        description: `${plan.name} Plan – ${billing === "annual" ? "Annual" : "Monthly"}`,
        prefill: { email: userEmail || "", name: userName || "" },
        theme: { color: "#0d9488" },
        modal: { escape: true, backdropclose: false },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await onVerifyPayment(response);
            onClose();
          } catch (err) {
            onPaymentError?.(err);
          }
        },
      });

      rzp.on("payment.failed", (response: unknown) => {
        onPaymentError?.(response);
      });

      rzp.open();
    } catch (err) {
      onPaymentError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: "rgba(2, 6, 23, 0.6)", backdropFilter: "blur(12px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Modal shell */}
      <div
        className="relative w-full flex overflow-hidden animate-modal-in"
        style={{
          maxWidth: 920,
          minHeight: 620,
          borderRadius: "1.75rem",
          boxShadow: "0 32px 64px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
          background: "white",
        }}
      >
        {/* ── LEFT PANEL ─────────────────────────────────────────── */}
        <div
          className="relative flex flex-col overflow-hidden"
          style={{
            width: "38%",
            flexShrink: 0,
            background: "linear-gradient(160deg, #0f172a 0%, #020617 100%)",
            padding: "2.5rem",
          }}
        >
          {/* Glow blobs */}
          <div
            className="pointer-events-none absolute"
            style={{ top: "-10%", left: "-10%", width: "60%", height: "60%", background: "#0d9488", borderRadius: "50%", filter: "blur(90px)", opacity: 0.18 }}
          />
          <div
            className="pointer-events-none absolute"
            style={{ bottom: "-5%", right: "-15%", width: "50%", height: "40%", background: "#2dd4bf", borderRadius: "50%", filter: "blur(80px)", opacity: 0.08 }}
          />

          <div className="relative z-10 flex flex-col h-full">
            {/* Brand */}
            <div className="flex items-center gap-3 mb-10">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{ width: 38, height: 38, background: "#0d9488", boxShadow: "0 4px 16px rgba(13,148,136,0.4)" }}
              >
                <Zap className="text-white" size={18} strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">VisualRef</span>
            </div>

            {/* Plan title */}
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] mb-2" style={{ color: "#2dd4bf" }}>
                Selected Plan
              </p>
              <h2 className="text-white font-black leading-tight" style={{ fontSize: "1.85rem" }}>
                {plan.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                {plan.description}
              </p>
            </div>

            {/* Features */}
            <ul className="mt-10 flex-1 space-y-5">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <CheckCircle2
                    className="shrink-0 mt-0.5"
                    size={16}
                    style={{ color: "#2dd4bf" }}
                  />
                  <span className="text-sm font-medium text-white/90">{feat}</span>
                </li>
              ))}
            </ul>

            {/* Trust badge */}
            <div
              className="mt-auto pt-6 flex items-center gap-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex -space-x-2">
                {["VR", "AK", "SK"].map((initials) => (
                  <div
                    key={initials}
                    className="flex items-center justify-center rounded-full text-[10px] font-black text-white border-2"
                    style={{ width: 30, height: 30, background: "#1e293b", borderColor: "#020617" }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-xs italic" style={{ color: "#64748b" }}>
                Trusted by 2,000+ creators
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col" style={{ background: "#fff" }}>
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-10"
            style={{ paddingTop: "2rem", paddingBottom: "1.5rem" }}
          >
            <h3 className="font-bold text-slate-900" style={{ fontSize: "1.1rem" }}>Payment Details</h3>

            {/* Billing toggle */}
            <div
              className="relative flex items-center rounded-xl p-1"
              style={{ background: "#f1f5f9", width: 210 }}
            >
              <div
                className="absolute top-1 bottom-1 rounded-[10px] bg-white transition-all duration-200"
                style={{
                  left: billing === "monthly" ? 4 : "calc(50% + 2px)",
                  width: "calc(50% - 6px)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                }}
              />
              <button
                className="relative z-10 flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider transition-colors duration-150"
                style={{ color: billing === "monthly" ? "#0f172a" : "#94a3b8" }}
                onClick={() => setBilling("monthly")}
              >
                Monthly
              </button>
              <button
                className="relative z-10 flex-1 py-1.5 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-colors duration-150"
                style={{ color: billing === "annual" ? "#0f172a" : "#94a3b8" }}
                onClick={() => setBilling("annual")}
              >
                Annual
                {annualSaving > 0 && (
                  <span
                    className="rounded px-1.5 py-0.5 text-[8px] font-black uppercase"
                    style={{ background: "#f0fdfa", color: "#0f766e" }}
                  >
                    Save {annualSaving}%
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="px-10 flex-1">
            <div className="space-y-4 mb-7">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-slate-500">
                  Subscription Fee ({billing === "annual" ? "Annual" : "Monthly"})
                </span>
                <span className="text-lg font-semibold text-slate-900 tabular-nums">
                  {formatINR(basePrice)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-slate-500">Platform Services</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs line-through tabular-nums text-slate-400">
                    {formatINR(Math.round(basePrice * 0.05))}
                  </span>
                  <span className="text-sm font-black" style={{ color: "#0d9488" }}>FREE</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-slate-500">GST (18%)</span>
                <span className="text-sm font-medium text-slate-700 tabular-nums">{formatINR(gst)}</span>
              </div>
              <div
                className="flex justify-between items-center pt-5"
                style={{ borderTop: "1px solid #f1f5f9" }}
              >
                <span className="font-bold text-slate-900">Total Due Today</span>
                <span
                  className="font-black tabular-nums tracking-tight"
                  style={{ fontSize: "1.55rem", color: "#0f172a" }}
                >
                  {formatINR(total)}
                </span>
              </div>
            </div>

            {/* Razorpay trust card */}
            <div
              className="rounded-2xl p-5 mb-7"
              style={{ background: "#f0fdfa", border: "1px solid rgba(20,184,166,0.15)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-sm" style={{ color: "#134e4a" }}>
                    Secure Automated Billing
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: "#115e59", opacity: 0.75 }}>
                    Your subscription is processed via Razorpay's enterprise payment network.
                  </p>
                </div>
                {/* Razorpay wordmark */}
                <div className="rounded-lg bg-white p-2 shadow-sm shrink-0 ml-3">
                  <svg height="14" viewBox="0 0 320 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.1 26.9V55.4H0V0.5L16.2 0.3C21.4 0.3 25.5 1.5 28.5 3.9C31.4 6.3 32.9 9.8 32.9 14.4C32.9 18.2 31.9 21.2 30 23.4C28.1 25.6 25.4 27 21.9 27.6L33.7 55.4H22.7L12 30.2L10.1 26.9ZM10.1 21.5H16.1C18.6 21.5 20.4 21 21.6 20C22.8 19 23.4 17.3 23.4 14.8C23.4 12.5 22.8 10.8 21.6 9.8C20.4 8.8 18.6 8.3 16.1 8.3H10.1V21.5Z" fill="#111827"/>
                    <text fill="#111827" fontFamily="Inter" fontSize="28" fontWeight="800" x="40" y="45">Razorpay</text>
                  </svg>
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(20,184,166,0.2)" }}
              >
                <Shield size={14} style={{ color: "#0d9488" }} />
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: "#0f766e" }}>
                  PCI-DSS Level 1 Secure · 256-bit Encryption
                </span>
              </div>
            </div>
          </div>

          {/* CTA bar */}
          <div
            className="px-10 py-7 mt-auto"
            style={{ background: "rgba(248,250,252,0.85)", borderTop: "1px solid #f1f5f9" }}
          >
            <button
              onClick={handleConfirmPay}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl font-bold text-sm tracking-wide text-white transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                paddingTop: "1rem",
                paddingBottom: "1rem",
                background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Opening Checkout…
                </>
              ) : (
                <>
                  Confirm &amp; Pay {formatINR(total)}
                  <ArrowRight size={16} style={{ color: "#2dd4bf" }} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 mt-3">
              <Lock size={11} className="text-slate-400" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                Encrypted Checkout · Cancel Anytime
              </span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex items-center justify-center rounded-full transition-colors hover:bg-slate-100 text-slate-400"
          style={{ width: 38, height: 38 }}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-in { animation: modal-in 0.22s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>
    </div>
  );
}
