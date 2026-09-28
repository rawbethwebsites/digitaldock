"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
  Layers,
  SlidersHorizontal,
  X,
  Bitcoin,
  ShieldCheck,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function MarketPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "price_low" | "price_high">("newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categories = useQuery(api.services.listCategories, {});
  const services = useQuery(api.services.listPublished, {
    categorySlug: selectedCategory === "all" ? undefined : selectedCategory,
    searchQuery: searchQuery || undefined,
  });

  const isLoading = categories === undefined || services === undefined;
  const allServices = services ?? [];
  const activeCategories = (categories ?? []).filter((c) => c.status === "active");

  // Sort services
  const sortedServices = [...allServices].sort((a, b) => {
    if (sortBy === "price_low") return a.price - b.price;
    if (sortBy === "price_high") return b.price - a.price;
    return b._creationTime - a._creationTime;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Marketplace</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Browse our curated catalogue of digital services
        </p>
      </div>

      {/* Stats Bar — Followiz style */}
      <div className="mb-6 grid grid-cols-3 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-center">
          <p className="text-xl font-extrabold text-emerald-400">{allServices.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Services Available</p>
        </div>
        <div className="text-center border-x border-zinc-800">
          <p className="text-xl font-extrabold text-sky-400">{activeCategories.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Categories</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-extrabold text-purple-400">Crypto</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Payment Accepted</p>
        </div>
      </div>

      {/* Search + Sort Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-10 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 inset-y-0 flex items-center text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs font-medium text-zinc-200 focus:border-emerald-500 focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-xs font-medium text-zinc-300 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Categories</span>
        </button>
      </div>

      <div className="flex gap-6">
        {/* Category Sidebar — Followiz style */}
        <aside className={`${sidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-56 shrink-0`}>
          <div className="sticky top-20 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-emerald-500 text-zinc-950 font-semibold"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <span>All Services</span>
                <span className={`text-[10px] ${selectedCategory === "all" ? "text-zinc-700" : "text-zinc-600"}`}>
                  {allServices.length}
                </span>
              </button>
              {activeCategories.map((cat) => {
                const count = allServices.filter((s) => s.categorySlug === cat.slug).length;
                return (
                  <button
                    key={cat._id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? "bg-emerald-500 text-zinc-950 font-semibold"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className={`text-[10px] ${selectedCategory === cat.slug ? "text-zinc-700" : "text-zinc-600"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Trust badges */}
            <div className="mt-6 pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <Bitcoin className="h-4 w-4 text-amber-400" />
                <span>Crypto Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Verified Delivery</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Service Grid */}
        <div className="flex-1 min-w-0">
          {/* Result count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              {isLoading
                ? "Loading..."
                : `Showing ${sortedServices.length} ${sortedServices.length === 1 ? "service" : "services"}`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-zinc-800/40 animate-pulse" />
              ))}
            </div>
          ) : sortedServices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
              <Layers className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-zinc-300">No services found</h3>
              <p className="mt-1 text-xs text-zinc-500">
                No services match your search or category filter.
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {sortedServices.map((service) => (
                <Link
                  key={service._id}
                  href={`/services/${service.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-sm hover:border-emerald-500/40 hover:bg-zinc-900/60 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase text-zinc-400">
                        {service.categoryName}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <Clock className="h-3 w-3" />
                        <span>{service.turnaroundDays}d delivery</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {service.shortSummary}
                    </p>

                    <div className="mt-4 pt-3 border-t border-zinc-800/60">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Includes
                      </p>
                      <ul className="space-y-1 text-[11px] text-zinc-300">
                        {service.deliverables.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400 mt-0.5" />
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] uppercase tracking-wider text-zinc-500">Price</span>
                      <span className="text-lg font-extrabold text-white">
                        {formatCurrency(service.price, service.currency)}
                      </span>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-100 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                      <span>Order</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}