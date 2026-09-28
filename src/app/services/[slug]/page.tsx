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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Mock catalog data
const serviceData: Record<string, any> = {
  "instagram-growth-audit": {
    title: "Instagram Growth & Engagement Audit",
    categoryName: "Social Growth Services",
    price: 49,
    turnaroundDays: 3,
    summary:
      "A comprehensive teardown of profile hooks, visual grid structure, and an actionable organic content playbook.",
    deliverables: [
      "10+ Page In-Depth PDF Audit Report",
      "Bio, CTA, and Link-in-Bio conversion review",
      "Content pillars & 30-day content calendar recommendations",
      "Hashtag and audio research guidelines tailored to your niche",
    ],
    exclusions: [
      "No fake followers, likes, or automated engagement bots (violates platform policy)",
      "Does not include direct post scheduling or content creation",
      "No account credentials or passwords will ever be requested",
    ],
    requirements: [
      { id: "handle", label: "Instagram Handle (@username)", type: "text", placeholder: "@yourhandle", required: true },
      { id: "niche", label: "Primary Target Niche / Industry", type: "text", placeholder: "e.g. B2B SaaS, Fitness, Creator", required: true },
      { id: "goals", label: "Key Goals or Current Bottlenecks", type: "textarea", placeholder: "What would you most like to improve?", required: true },
    ],
    refundTerms: "100% refund eligibility if audit is not delivered within the agreed 3 business days turnaround.",
  },
  "instagram-profile-setup": {
    title: "Instagram Professional Profile Setup",
    categoryName: "Social Profile Services",
    price: 79,
    turnaroundDays: 2,
    summary: "Complete optimization and branded redesign assets for customer-owned profile.",
    deliverables: [
      "Custom branded highlight covers (5 PNG assets)",
      "SEO-optimized bio copy with link structure",
      "Security hardening (2FA) walkthrough guide",
    ],
    exclusions: [
      "No account creation on buyer's behalf (customer-owned only)",
      "No password collection",
    ],
    requirements: [
      { id: "brand_name", label: "Brand Name & Colors", type: "text", placeholder: "Brand name and hex colors", required: true },
      { id: "links", label: "Links to Feature", type: "text", placeholder: "Website or newsletter URL", required: true },
    ],
    refundTerms: "Full refund if deliverables are not submitted within 2 business days.",
  },
  "social-content-starter-pack": {
    title: "Social Content Starter Pack (15 Posts)",
    categoryName: "Content Services",
    price: 129,
    turnaroundDays: 4,
    summary: "15 high-converting post concepts, hook variations, and ready-to-use captions.",
    deliverables: [
      "15 Custom post concepts & design prompts",
      "High-converting caption copy with 3 hook variations per post",
      "Curated hashtag and sound suggestions",
    ],
    exclusions: [
      "Does not include graphic design production (concepts & copy only)",
      "No direct social media management",
    ],
    requirements: [
      { id: "brand_voice", label: "Target Audience & Brand Voice", type: "textarea", placeholder: "Describe your tone and audience", required: true },
    ],
    refundTerms: "Full refund if delivered past 4 days without prior mutual agreement.",
  },
  "business-account-setup": {
    title: "Customer-Owned Business Account Setup",
    categoryName: "Account Setup",
    price: 99,
    turnaroundDays: 2,
    summary: "Guided setup and technical validation for platform business accounts and integrations.",
    deliverables: [
      "Business Manager / platform link verification checklist",
      "Domain DNS verification step-by-step guidance",
      "Role & permission delegation documentation",
    ],
    exclusions: [
      "Sale of pre-made accounts (strictly prohibited)",
      "Third-party verification bypassing",
    ],
    requirements: [
      { id: "platform", label: "Target Platform & Website Domain", type: "text", placeholder: "e.g. Meta / yoursite.com", required: true },
    ],
    refundTerms: "Full refund if technical guidance does not achieve verified configuration.",
  },
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const service = serviceData[slug] || serviceData["instagram-growth-audit"];

  const [briefAnswers, setBriefAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (id: string, val: string) => {
    setBriefAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const handleStartOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    for (const field of service.requirements) {
      if (field.required && !briefAnswers[field.id]?.trim()) {
        setError(`Please provide your "${field.label}" to proceed.`);
        return;
      }
    }

    setSubmitting(true);
    // Simulate order placement handoff
    setTimeout(() => {
      // In full implementation, calls Convex orders.create mutation
      router.push(`/orders?demo_created=true&service=${slug}`);
    }, 800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Catalogue</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Details, Scope, Exclusions, Brief Form */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <span className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {service.categoryName}
            </span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {service.title}
            </h1>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
              {service.summary}
            </p>
          </div>

          {/* Deliverables vs Exclusions Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div>
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <span>Deliverables Included</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                {service.deliverables.map((item: string, idx: number) => (
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
                {service.exclusions.map((item: string, idx: number) => (
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
              Please fill out the required information below so our specialist can begin fulfillment upon verified payment.
            </p>

            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-lg border border-rose-900/50 bg-rose-950/40 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStartOrder} className="space-y-4">
              {service.requirements.map((field: any) => (
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
                  ) : (
                    <input
                      type="text"
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
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/10"
                >
                  {submitting ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  ) : (
                    <>
                      <span>Proceed to Crypto Checkout &bull; {formatCurrency(service.price)}</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Price Summary Card & Trust */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sticky top-24">
            <span className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">
              Fixed Quoted Price
            </span>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-extrabold text-white">
                {formatCurrency(service.price)}
              </span>
              <span className="text-xs text-zinc-400">USD Equivalent</span>
            </div>

            <div className="space-y-3 border-t border-zinc-800 pt-4 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Clock className="h-4 w-4" />
                  Turnaround Time
                </span>
                <span className="font-semibold text-white">
                  {service.turnaroundDays} Business Days
                </span>
              </div>

              <div className="flex items-center justify-between text-zinc-300">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <CreditCard className="h-4 w-4" />
                  Payment Assets
                </span>
                <span className="font-medium text-emerald-400">
                  USDT, BTC, ETH, LTC
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Satisfaction & Refund Policy</span>
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
