"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  CreditCard,
  Settings,
  Terminal,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/services", label: "Services", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.viewer);

  const isAdmin = viewer?.role === "admin";

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-800/40 bg-rose-950/30 text-rose-400">
            <Settings className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Access Required</h1>
          <p className="mt-2 text-sm text-zinc-400">
            You need an admin account to access this area.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/auth"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Back to Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-16 z-30 hidden w-60 border-r border-zinc-800 bg-zinc-950/95 lg:flex flex-col">
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-4 px-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              <Terminal className="h-3.5 w-3.5" />
              <span>Admin Portal</span>
            </div>
          </div>

          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border-l-2 border-transparent"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-zinc-800 pt-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View Storefront</span>
            </Link>
          </div>
        </div>

        {/* User info at bottom */}
        <div className="border-t border-zinc-800 p-3">
          <div className="flex items-center gap-2 rounded-lg bg-zinc-900/60 px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
              {viewer?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-zinc-200">
                {viewer?.name || viewer?.email}
              </p>
              <p className="text-[10px] text-emerald-400">Administrator</p>
            </div>
            <button
              onClick={() => void signOut()}
              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-rose-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar (horizontal nav) */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
        <div className="flex overflow-x-auto px-2 py-2 gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400 hover:bg-zinc-800/50"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content area */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-4">
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}