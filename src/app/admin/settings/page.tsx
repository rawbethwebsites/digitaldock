"use client";

import { Settings, ShieldCheck, Bell, Globe, CreditCard } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function AdminSettingsPage() {
  const viewer = useQuery(api.users.viewer);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-xs text-zinc-400">Configure your marketplace</p>
      </div>

      {/* Account info */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Admin Account</h2>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Name</span>
            <span className="text-zinc-200 font-medium">{viewer?.name || "—"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Email</span>
            <span className="text-zinc-200 font-medium">{viewer?.email || "—"}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Role</span>
            <span className="rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 text-[10px] font-semibold">{viewer?.role || "—"}</span>
          </div>
        </div>
      </div>

      {/* Settings sections (placeholders) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">Telegram Notifications</h3>
          </div>
          <p className="text-xs text-zinc-400">Configure admin alerts and customer notification templates.</p>
          <p className="text-[10px] text-zinc-600 mt-2">Milestone 6 — not yet built</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Payment Provider</h3>
          </div>
          <p className="text-xs text-zinc-400">Connect NOWPayments or Cryptomus for crypto checkout.</p>
          <p className="text-[10px] text-zinc-600 mt-2">Milestone 4 — not yet built</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">Storefront Settings</h3>
          </div>
          <p className="text-xs text-zinc-400">Configure branding, pricing currency, and public pages.</p>
          <p className="text-[10px] text-zinc-600 mt-2">Future milestone</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-white">General</h3>
          </div>
          <p className="text-xs text-zinc-400">Deployment info, environment variables, and system status.</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Deployment</span>
              <span className="text-zinc-300 font-mono">greedy-gazelle-521</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-500">Environment</span>
              <span className="text-amber-400 font-mono">dev</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}