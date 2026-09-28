"use client";

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
  Bitcoin,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function Home() {
  const services = useQuery(api.services.listPublished, {});
  const categories = useQuery(api.services.listCategories, {});

  const featuredServices = (services ?? []).slice(0, 3);
  const serviceCount = services?.length ?? 0;
  const categoryCount = categories?.filter((c) => c.status === "active").length ?? 0;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-emerald-950/20 via-zinc-950 to-zinc-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
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

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/market"
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
            >
              <span>Browse Marketplace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth"
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <span>Create Account</span>
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <p className="text-2xl font-extrabold text-emerald-400">{serviceCount}</p>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 mt-0.5">Live Services</p>
            </div>
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <p className="text-2xl font-extrabold text-sky-400">{categoryCount}</p>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 mt-0.5">Categories</p>
            </div>
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <p className="text-2xl font-extrabold text-purple-400">24/7</p>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 mt-0.5">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Featured Services</h2>
            <p className="text-xs text-zinc-400 mt-1">Hand-picked by our admin team</p>
          </div>
          <Link
            href="/market"
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {services === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-zinc-800/40 animate-pulse" />
            ))}
          </div>
        ) : featuredServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
            <Layers className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">Services coming soon</h3>
            <p className="mt-1 text-xs text-zinc-500">Our admin is curating the catalogue. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <Link
                key={service._id}
                href={`/services/${service.slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 shadow-sm hover:border-emerald-500/40 hover:bg-zinc-900/60 transition-all duration-200"
              >
                <div>
                  <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase text-zinc-400">
                    {service.categoryName}
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{service.shortSummary}</p>
                  <ul className="mt-4 space-y-1.5 text-xs text-zinc-300">
                    {service.deliverables.slice(0, 2).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
                  <span className="text-xl font-extrabold text-white">
                    {formatCurrency(service.price, service.currency)}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <Clock className="h-3 w-3" />
                    <span>{service.turnaroundDays}d</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-800/60">
        <h2 className="text-2xl font-bold tracking-tight text-white text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Search, title: "1. Browse & Search", desc: "Find the service you need from our curated catalogue", color: "emerald" },
            { icon: CheckCircle2, title: "2. Submit Brief", desc: "Fill out the requirements form with your details", color: "sky" },
            { icon: Bitcoin, title: "3. Pay with Crypto", desc: "Checkout with USDT, BTC, or ETH via hosted invoice", color: "amber" },
            { icon: Zap, title: "4. Track & Receive", desc: "Monitor progress and get notified on Telegram", color: "purple" },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-${step.color}-500/10 text-${step.color}-400 border border-${step.color}-500/20 mb-4`}>
                <step.icon className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">{step.title}</h4>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-800/60">
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
              <MessageSquare className="h-5 w-5" />
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Ready to get started?
        </h2>
        <p className="mt-3 text-sm text-zinc-400 max-w-xl mx-auto">
          Browse our curated marketplace and place your first order in minutes.
        </p>
        <Link
          href="/market"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3.5 text-sm font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
        >
          <span>Enter Marketplace</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}