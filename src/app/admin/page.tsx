"use client";

import Link from "next/link";
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Rocket,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboard() {
  const services = useQuery(api.services.adminListAll, {});
  const categories = useQuery(api.services.listCategories, { includeDisabled: true });
  const seedServices = useMutation(api.seedServices.seedInitialServices);

  const publishedCount = services?.filter((s) => s.status === "published").length ?? 0;
  const draftCount = services?.filter((s) => s.status === "draft").length ?? 0;
  const totalValue = services
    ?.filter((s) => s.status === "published")
    .reduce((sum, s) => sum + s.price, 0) ?? 0;
  const activeCategories = categories?.filter((c) => c.status === "active").length ?? 0;
  const hasServices = (services?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-xs text-zinc-400">Manage your DigitalDock marketplace</p>
        </div>
        <Link
          href="/admin/services"
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Service</span>
        </Link>
      </div>

      {/* Seed banner */}
      {!hasServices && services !== undefined && (
        <div className="rounded-2xl border border-amber-800/40 bg-amber-950/20 p-6">
          <div className="flex items-start gap-3">
            <Rocket className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-300">Welcome to your admin panel!</h3>
              <p className="mt-1 text-xs text-amber-400/80">
                Your catalogue is empty. Seed the 4 initial services from the PRD, or create your own.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => seedServices({})}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-400 transition-colors"
                >
                  <Rocket className="h-3.5 w-3.5" />
                  Seed 4 Initial Services
                </button>
                <Link
                  href="/admin/services"
                  className="flex items-center gap-1.5 rounded-lg border border-amber-800/40 bg-amber-950/20 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-950/40 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Custom Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-400">Published</span>
            <Package className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{publishedCount}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Live in catalogue</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-400">Drafts</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{draftCount}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Not yet published</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-400">Catalogue Value</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Sum of published</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-400">Categories</span>
            <TrendingUp className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white">{activeCategories}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Active</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/services" className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <Package className="h-6 w-6 text-emerald-400 mb-3" />
              <h3 className="text-sm font-bold text-white">Manage Services</h3>
              <p className="mt-1 text-xs text-zinc-400">Create, edit, publish, and archive listings</p>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </div>
        </Link>
        <Link href="/admin/categories" className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <TrendingUp className="h-6 w-6 text-sky-400 mb-3" />
              <h3 className="text-sm font-bold text-white">Manage Categories</h3>
              <p className="mt-1 text-xs text-zinc-400">Organize services into catalogue sections</p>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </div>
        </Link>
        <Link href="/admin/orders" className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <ShoppingBag className="h-6 w-6 text-purple-400 mb-3" />
              <h3 className="text-sm font-bold text-white">View Orders</h3>
              <p className="mt-1 text-xs text-zinc-400">Track customer orders and fulfillment</p>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </div>
        </Link>
        <Link href="/admin/payments" className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <DollarSign className="h-6 w-6 text-amber-400 mb-3" />
              <h3 className="text-sm font-bold text-white">Payment Setup</h3>
              <p className="mt-1 text-xs text-zinc-400">Configure crypto checkout (Milestone 4)</p>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent services */}
      {hasServices && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Recent Services</h2>
            <Link href="/admin/services" className="text-xs font-medium text-emerald-400 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {services?.slice(0, 5).map((s) => (
              <div key={s._id} className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-400">{s.title.charAt(0)}</div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-zinc-100">{s.title}</p>
                    <p className="text-[10px] text-zinc-500">{s.categoryName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-semibold text-emerald-400">{formatCurrency(s.price, s.currency)}</span>
                  <span className={`rounded-md px-2 py-0.5 text-[9px] font-semibold ${s.status === "published" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/50" : s.status === "draft" ? "bg-amber-950/40 text-amber-300 border border-amber-800/50" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}