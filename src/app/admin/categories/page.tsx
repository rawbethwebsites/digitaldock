"use client";

import { FolderTree, Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function AdminCategoriesPage() {
  const categories = useQuery(api.services.listCategories, { includeDisabled: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Categories</h1>
          <p className="mt-1 text-xs text-zinc-400">Organize your services into catalogue sections</p>
        </div>
        <button
          onClick={() => alert("Category creation form coming soon")}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        {categories === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-zinc-800/40 animate-pulse" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
            <FolderTree className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No categories yet</h3>
            <p className="mt-1 text-xs text-zinc-500">Run the seed function to create initial categories.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat._id} className="flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-400">
                    {cat.sortOrder}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-100">{cat.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">/{cat.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {cat.description && <p className="hidden sm:block text-[10px] text-zinc-500 max-w-xs truncate">{cat.description}</p>}
                  <span className={`rounded-md px-2 py-0.5 text-[9px] font-semibold ${cat.status === "active" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/50" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>{cat.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}