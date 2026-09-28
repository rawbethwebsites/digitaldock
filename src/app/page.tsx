"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  Layers,
  HelpCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Mock initial data aligning with PRD Section 1.4 until backend is connected
const initialCategories = [
  { id: "all", name: "All Services" },
  { id: "social-profile", name: "Social Profile Services" },
  { id: "social-growth", name: "Social Growth Services" },
  { id: "content", name: "Content Services" },
  { id: "account-setup", name: "Account Setup" },
];

const initialServices = [
  {
    id: "serv_1",
    slug: "instagram-growth-audit",
    category: "social-growth",
    categoryName: "Social Growth",
    title: "Instagram Growth & Engagement Audit",
    shortSummary:
      "Actionable profile hooks, content strategy teardown, and non-banned organic reach playbook.",
    price: 49,
    turnaroundDays: 3,
    deliverables: [
      "10+ page audit report (PDF)",
      "Bio, highlights, & grid restructuring plan",
      "30-day organic content calendar outline",
    ],
    badge: "Popular",
  },
  {
    id: "serv_2",
    slug: "instagram-profile-setup",
    category: "social-profile",
    categoryName: "Social Profile",
    title: "Instagram Professional Profile Setup",
    shortSummary:
      "Full configuration of customer-owned account with branded bio, custom highlight covers, and security hardening.",
    price: 79,
    turnaroundDays: 2,
    deliverables: [
      "Optimized bio & SEO search keywords",
      "5 custom icon highlight covers (Figma/PNG)",
      "Account category & 2FA guidance",
    ],
    badge: "Essential",
  },
  {
    id: "serv_3",
    slug: "social-content-starter-pack",
    category: "content",
    categoryName: "Content Services",
    title: "Social Content Starter Pack (15 Posts)",
    shortSummary:
      "Bespoke creative concepts, high-converting captions, and hashtag strategy tailored to your niche.",
    price: 129,
    turnaroundDays: 4,
    deliverables: [
      "15 unique post concepts & visual prompts",
      "Ready-to-publish captions with hook variations",
      "Curated research hashtag clusters",
    ],
    badge: "High Value",
  },
  {
    id: "serv_4",
    slug: "business-account-setup",
    category: "account-setup",
    categoryName: "Account Setup",
    title: "Customer-Owned Business Account Setup",
    shortSummary:
      "Guided setup and technical validation for platform business accounts, verified links, and business manager integrations.",
    price: 99,
    turnaroundDays: 2,
    deliverables: [
      "Business Manager / platform link verification",
      "Domain DNS verification guidance",
      "Role & permission delegation walkthrough",
    ],
    badge: "Technical",
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = initialServices.filter((service) => {
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    const matchesSearch =
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-16 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-radial-[at_top] from-emerald-950/20 via-zinc-950 to-zinc-950 pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Admin-Curated Digital Services &bull; No Inauthentic Automation</span>
          </div>

          <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Reliable digital services.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Verified delivery.
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Purchase scoped social, growth, and setup services with hosted crypto checkout. Track brief progress and deliverables with instant Telegram status updates.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g. 'audit', 'instagram', 'profile')..."
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 py-3.5 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-500 shadow-xl focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {initialCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-emerald-500 text-zinc-950 font-semibold shadow-lg shadow-emerald-500/10"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Available Catalogue
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Showing {filteredServices.length} verified listings
            </p>
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-12 text-center max-w-md mx-auto">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500 mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No services found</h3>
            <p className="mt-1 text-xs text-zinc-400">
              No offers match your current filter or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 text-xs font-semibold text-emerald-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-sm hover:border-emerald-500/40 hover:bg-zinc-900/60 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase text-zinc-400">
                      {service.categoryName}
                    </span>
                    <span className="rounded-md bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                    {service.shortSummary}
                  </p>

                  <div className="mt-4 pt-4 border-t border-zinc-800/60">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                      Key Deliverables
                    </p>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {service.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-zinc-500">
                      Fixed Price
                    </span>
                    <span className="text-xl font-extrabold text-white">
                      {formatCurrency(service.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <Clock className="h-3 w-3" />
                      <span>{service.turnaroundDays}d</span>
                    </div>

                    <Link
                      href={`/services/${service.slug}`}
                      className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-100 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors"
                    >
                      <span>Order</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust & Guarantee Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">No Inauthentic Activity</h4>
              <p className="mt-1 text-xs text-zinc-400">
                All offerings are legitimate audits, content, and setup work. Zero fake bots, fake likes, or platform violations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Crypto Escrow Flow</h4>
              <p className="mt-1 text-xs text-zinc-400">
                Pay on-chain (USDT, BTC, ETH) with hosted checkout. Fulfillment only begins after cryptographic verification.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Real-Time Telegram Alerts</h4>
              <p className="mt-1 text-xs text-zinc-400">
                Link your Telegram account with one click to receive milestone alerts without Telegram being the system of record.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
