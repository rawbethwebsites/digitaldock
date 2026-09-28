"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Send,
  Lock,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { isAuthenticated } = useConvexAuth();

  const service = useQuery(api.services.getBySlug, { slug });
  const createOrder = useMutation(api.orders.createOrder);

  const [briefAnswers, setBriefAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (id: string, val: string) => {
    setBriefAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const handleStartOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!service) return;

    // Validate required fields
    for (const field of service.requirementsSchema) {
      if (field.required && !briefAnswers[field.id]?.trim()) {
        setError(`Please provide your "${field.label}" to proceed.`);
        return;
      }
    }

    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrder({
        serviceId: service._id,
        brief: briefAnswers,
      });
      // Redirect to orders page — the new order will appear there
      router.push(`/orders?new=${result.reference}`);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("UNAUTHORIZED") || msg.includes("Authentication required")) {
        router.push("/auth");
      } else {
        setError(msg || "Failed to create order. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (service === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-6 w-32 animate-pulse rounded bg-zinc-800 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-8 w-3/4 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-full animate-pulse rounded bg-zinc-800/60" />
            <div className="h-32 animate-pulse rounded-2xl bg-zinc-800/40" />
          </div>
          <div className="h-48 animate-pulse rounded-2xl bg-zinc-800/40" />
        </div>
      </div>
    );
  }

  if (service === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Service not found</h1>
        <p className="mt-2 text-sm text-zinc-400">This service may have been removed or is not currently published.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Catalogue</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Details, Scope, Brief Form */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {service.categoryName}
            </span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {service.title}
            </h1>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
              {service.shortSummary}
            </p>
            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Deliverables vs Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div>
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <span>Deliverables Included</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                {service.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-zinc-800 pt-4 sm:pt-0 sm:pl-6">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400 mb-4">
                <XCircle className="h-4 w-4" />
                <span>Scope Exclusions</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                {service.exclusions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">&bull;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Service Requirements Form (The Brief) */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h3 className="text-base font-bold text-white mb-1">
              Complete Your Service Brief
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Fill out the required information so our specialist can begin fulfillment upon verified payment.
            </p>

            {!isAuthenticated && (
              <div className="mb-6 flex items-center gap-2 rounded-lg border border-sky-900/50 bg-sky-950/40 p-3 text-xs text-sky-300">
                <Lock className="h-4 w-4 shrink-0 text-sky-400" />
                <span>You need to <Link href="/auth" className="font-bold underline">sign in</Link> or create an account to place an order.</span>
              </div>
            )}

            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-lg border border-rose-900/50 bg-rose-950/40 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStartOrder} className="space-y-4">
              {service.requirementsSchema.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    {field.label} {field.required && <span className="text-rose-400">*</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      required={field.required}
                      rows={3}
                      value={briefAnswers[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  ) : field.type === "select" ? (
                    <select
                      required={field.required}
                      value={briefAnswers[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type === "url" ? "url" : "text"}
                      required={field.required}
                      value={briefAnswers[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  )}
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !isAuthenticated}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/10"
                >
                  {submitting ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  ) : (
                    <>
                      <span>Submit Brief & Proceed to Checkout &bull; {formatCurrency(service.price, service.currency)}</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Price Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sticky top-24">
            <span className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">
              Fixed Quoted Price
            </span>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-extrabold text-white">
                {formatCurrency(service.price, service.currency)}
              </span>
              <span className="text-xs text-zinc-400">USD</span>
            </div>

            <div className="space-y-3 border-t border-zinc-800 pt-4 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="h-4 w-4" />
                  Turnaround
                </span>
                <span className="font-semibold text-white">
                  {service.turnaroundDays} Business Days
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <CreditCard className="h-4 w-4" />
                  Payment
                </span>
                <span className="font-medium text-emerald-400">
                  Crypto (USDT, BTC, ETH)
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Refund Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {service.refundTerms}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}