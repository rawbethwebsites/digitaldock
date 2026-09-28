"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ShieldCheck, ShoppingBag, Terminal, User, LogOut, ArrowRight } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  // Safe query (will return null if unauthenticated or not yet loaded)
  const viewer = useQuery(api.users.viewer);

  const isAdmin = viewer?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-zinc-100 hover:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="text-lg">Digital<span className="text-emerald-400">Dock</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-zinc-400">
            <Link
              href="/"
              className={`hover:text-zinc-100 transition-colors ${
                pathname === "/" ? "text-zinc-100" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/market"
              className={`hover:text-zinc-100 transition-colors ${
                pathname === "/market" ? "text-zinc-100" : ""
              }`}
            >
              Marketplace
            </Link>
            {isAuthenticated && (
              <Link
                href="/orders"
                className={`hover:text-zinc-100 transition-colors ${
                  pathname.startsWith("/orders") ? "text-zinc-100" : ""
                }`}
              >
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 hover:bg-emerald-950/50 transition-colors ${
                  pathname.startsWith("/admin") ? "border-emerald-600" : ""
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-zinc-800" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{viewer?.name || viewer?.email || "Account"}</span>
                {isAdmin && (
                  <span className="rounded bg-emerald-900/60 px-1.5 py-0.5 font-semibold text-emerald-300">
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={() => void signOut()}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
