"use client";

import { useState } from "react";
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Archive,
  X,
  Save,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatCurrency } from "@/lib/utils";

export default function AdminServicesPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const services = useQuery(api.services.adminListAll, {});
  const categories = useQuery(api.services.listCategories, { includeDisabled: true });

  const createService = useMutation(api.services.adminCreate);
  const updateService = useMutation(api.services.adminUpdate);
  const setStatus = useMutation(api.services.adminSetStatus);
  const deleteService = useMutation(api.services.adminDelete);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Services</h1>
          <p className="mt-1 text-xs text-zinc-400">Create and manage your service listings</p>
        </div>
        <button
          onClick={() => { setEditingServiceId(null); setShowEditor(true); }}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Services table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">All Services</h2>
          <span className="text-xs text-zinc-500">{services?.length ?? 0} total</span>
        </div>

        {services === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-zinc-800/40 animate-pulse" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
            <Package className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No services yet</h3>
            <p className="mt-1 text-xs text-zinc-500">Create your first service listing to get started.</p>
            <button
              onClick={() => { setEditingServiceId(null); setShowEditor(true); }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Create First Service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-3 px-2">Title</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2">Turnaround</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {services.map((s) => (
                  <tr key={s._id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-2">
                      <div className="font-semibold text-zinc-100">{s.title}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">/{s.slug}</div>
                    </td>
                    <td className="py-3.5 px-2 text-zinc-300">{s.categoryName}</td>
                    <td className="py-3.5 px-2 font-semibold text-emerald-400">{formatCurrency(s.price, s.currency)}</td>
                    <td className="py-3.5 px-2 text-zinc-400">{s.turnaroundDays}d</td>
                    <td className="py-3.5 px-2">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${s.status === "published" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/50" : s.status === "draft" ? "bg-amber-950/40 text-amber-300 border border-amber-800/50" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>{s.status}</span>
                    </td>
                    <td className="py-3.5 px-2">
                      <div className="flex items-center justify-end gap-1">
                        {s.status === "draft" && (
                          <button onClick={() => setStatus({ serviceId: s._id, status: "published" })} title="Publish" className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-950/40 transition-colors"><Eye className="h-3.5 w-3.5" /></button>
                        )}
                        {s.status === "published" && (
                          <button onClick={() => setStatus({ serviceId: s._id, status: "draft" })} title="Unpublish" className="rounded-lg p-1.5 text-amber-400 hover:bg-amber-950/40 transition-colors"><EyeOff className="h-3.5 w-3.5" /></button>
                        )}
                        {s.status !== "archived" && (
                          <button onClick={() => setStatus({ serviceId: s._id, status: "archived" })} title="Archive" className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 transition-colors"><Archive className="h-3.5 w-3.5" /></button>
                        )}
                        <button onClick={() => { setEditingServiceId(s._id); setShowEditor(true); }} title="Edit" className="rounded-lg p-1.5 text-sky-400 hover:bg-sky-950/40 transition-colors"><Edit3 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => { if (confirm(`Delete "${s.title}"? This cannot be undone.`)) deleteService({ serviceId: s._id }); }} title="Delete" className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-950/40 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Service Editor Modal */}
      {showEditor && (
        <ServiceEditor
          categories={categories ?? []}
          editingServiceId={editingServiceId}
          onClose={() => { setShowEditor(false); setEditingServiceId(null); }}
          onCreate={createService}
          onUpdate={updateService}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Service Editor Modal
// ---------------------------------------------------------------------------
function ServiceEditor({
  categories,
  editingServiceId,
  onClose,
  onCreate,
  onUpdate,
}: {
  categories: Array<{ _id: string; name: string; slug: string; status: string }>;
  editingServiceId: string | null;
  onClose: () => void;
  onCreate: ReturnType<typeof useMutation<typeof api.services.adminCreate>>;
  onUpdate: ReturnType<typeof useMutation<typeof api.services.adminUpdate>>;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortSummary, setShortSummary] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [turnaroundDays, setTurnaroundDays] = useState("3");
  const [deliverables, setDeliverables] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [refundTerms, setRefundTerms] = useState("Full refund if work has not started. 50% refund if in progress. No refund after delivery.");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCategories = categories.filter((c) => c.status === "active");
  const slugify = (text: string) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      if (!categoryId) { setError("Please select a category"); setSaving(false); return; }
      const deliverablesArr = deliverables.split("\n").map((d) => d.trim()).filter(Boolean);
      const exclusionsArr = exclusions.split("\n").map((e) => e.trim()).filter(Boolean);
      if (deliverablesArr.length === 0) { setError("Add at least one deliverable"); setSaving(false); return; }

      const baseData = {
        categoryId: categoryId as any,
        title, slug, shortSummary, description,
        deliverables: deliverablesArr,
        exclusions: exclusionsArr,
        price: parseFloat(price) || 0,
        currency,
        turnaroundDays: parseInt(turnaroundDays) || 1,
        refundTerms,
        requirementsSchema: [],
      };

      if (editingServiceId) {
        await onUpdate({ serviceId: editingServiceId as any, ...baseData });
      } else {
        await onCreate(baseData as any);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{editingServiceId ? "Edit Service" : "Create New Service"}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-rose-900/50 bg-rose-950/40 p-3 text-xs text-rose-300">{error}</div>}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">Title</label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (!editingServiceId) setSlug(slugify(e.target.value)); }} placeholder="e.g. TikTok Growth Audit" className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">URL Slug</label>
              <input type="text" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="tiktok-growth-audit" className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none">
                <option value="">Select...</option>
                {activeCategories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">Price (USD)</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="49.00" className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">Turnaround (days)</label>
              <input type="number" value={turnaroundDays} onChange={(e) => setTurnaroundDays(e.target.value)} placeholder="3" className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Short Summary</label>
            <input type="text" value={shortSummary} onChange={(e) => setShortSummary(e.target.value)} placeholder="One-line description shown on the catalogue card" className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Full Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description of what the service includes..." rows={4} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">Deliverables (one per line)</label>
              <textarea value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder={"10+ page audit report (PDF)\nBio restructuring plan\n30-day content calendar"} rows={5} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-300">Exclusions (one per line)</label>
              <textarea value={exclusions} onChange={(e) => setExclusions(e.target.value)} placeholder={"No fake followers\nNo automated engagement"} rows={5} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none resize-none" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-300">Refund Terms</label>
            <textarea value={refundTerms} onChange={(e) => setRefundTerms(e.target.value)} rows={2} className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none resize-none" />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-4">
            <button onClick={onClose} className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors">
              {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" /> : <><Save className="h-3.5 w-3.5" />{editingServiceId ? "Update Service" : "Create Service"}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}