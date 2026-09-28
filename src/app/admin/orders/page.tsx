"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Package,
  Send,
  X,
  ArrowRight,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const stats = useQuery(api.orders.adminStats, {});
  const orders = useQuery(api.orders.adminListAll, {});
  const orderDetail = useQuery(
    api.orders.adminGetOrder,
    selectedOrderId ? { orderId: selectedOrderId as any } : "skip",
  );

  const updateFulfillment = useMutation(api.orders.adminUpdateFulfillment);
  const deliverOrder = useMutation(api.orders.adminDeliverOrder);
  const addNote = useMutation(api.orders.adminAddNote);

  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const filteredOrders = orders?.filter((o) => {
    if (filter === "all") return true;
    if (filter === "paid") return o.paymentState === "paid";
    if (filter === "awaiting") return o.paymentState === "awaiting_payment";
    if (filter === "exceptions") return ["partially_paid", "manual_review", "expired", "failed"].includes(o.paymentState);
    if (filter === "in_progress") return ["needs_information", "in_progress"].includes(o.fulfillmentState);
    if (filter === "delivered") return o.fulfillmentState === "delivered" || o.fulfillmentState === "completed";
    return true;
  }) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Orders</h1>
        <p className="mt-1 text-xs text-zinc-400">Track customer orders, fulfillment, and delivery</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-400">Total Orders</span>
            <ShoppingBag className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.totalOrders ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-400">Awaiting Payment</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.awaitingPayment ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-400">In Progress</span>
            <Package className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats?.inProgress ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-zinc-400">Revenue (Paid)</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats ? formatCurrency(stats.totalRevenue) : "—"}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Orders" },
          { id: "paid", label: "Paid" },
          { id: "awaiting", label: "Awaiting Payment" },
          { id: "exceptions", label: "Payment Exceptions" },
          { id: "in_progress", label: "In Progress" },
          { id: "delivered", label: "Delivered" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.id
                ? "bg-emerald-500 text-zinc-950 font-semibold"
                : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        {orders === undefined ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-zinc-800/40 animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 p-12 text-center">
            <ShoppingBag className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-zinc-300">No orders yet</h3>
            <p className="mt-1 text-xs text-zinc-500">Orders will appear here when customers submit briefs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-3 px-2">Order Ref</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Service</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2">Payment</th>
                  <th className="py-3 px-2">Fulfillment</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-2 font-mono font-bold text-emerald-400">{o.reference}</td>
                    <td className="py-3.5 px-2 text-zinc-300">{o.customerEmail}</td>
                    <td className="py-3.5 px-2 text-zinc-200 max-w-xs truncate">{o.serviceTitle}</td>
                    <td className="py-3.5 px-2 font-semibold text-emerald-400">{formatCurrency(o.quotedPrice, o.quotedCurrency)}</td>
                    <td className="py-3.5 px-2"><StatusBadge status={o.paymentState} type="payment" /></td>
                    <td className="py-3.5 px-2"><StatusBadge status={o.fulfillmentState} type="fulfillment" /></td>
                    <td className="py-3.5 px-2 text-zinc-500">{formatDate(o.createdAt)}</td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrderId(o._id);
                          setDeliveryUrl("");
                          setDeliveryNotes("");
                        }}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrderId && orderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white font-mono">{orderDetail.reference}</h2>
                <p className="text-xs text-zinc-400">{orderDetail.serviceTitle}</p>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Customer & Payment info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-zinc-500">Customer:</span><span className="text-zinc-200 font-medium">{orderDetail.customerEmail}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Price:</span><span className="text-emerald-400 font-bold">{formatCurrency(orderDetail.quotedPrice, orderDetail.quotedCurrency)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Payment:</span><StatusBadge status={orderDetail.paymentState} type="payment" /></div>
                <div className="flex justify-between"><span className="text-zinc-500">Fulfillment:</span><StatusBadge status={orderDetail.fulfillmentState} type="fulfillment" /></div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-zinc-500">Created:</span><span className="text-zinc-200">{formatDate(orderDetail.createdAt)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Turnaround:</span><span className="text-zinc-200">{orderDetail.turnaroundDays} days</span></div>
                {orderDetail.paidAt && <div className="flex justify-between"><span className="text-zinc-500">Paid at:</span><span className="text-emerald-400">{formatDate(orderDetail.paidAt)}</span></div>}
                {orderDetail.deliveredAt && <div className="flex justify-between"><span className="text-zinc-500">Delivered:</span><span className="text-emerald-400">{formatDate(orderDetail.deliveredAt)}</span></div>}
              </div>
            </div>

            {/* Brief answers */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 mb-6">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">Customer Brief</h3>
              <div className="space-y-3">
                {Object.entries(orderDetail.brief as Record<string, string>).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{key.replace(/_/g, " ")}</p>
                    <p className="text-xs text-zinc-200 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Fulfillment controls — only for paid orders */}
            {orderDetail.paymentState === "paid" ? (
              <div className="space-y-4 border-t border-zinc-800 pt-4">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Fulfillment Controls</h3>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateFulfillment({ orderId: selectedOrderId as any, newState: "in_progress" })}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateFulfillment({ orderId: selectedOrderId as any, newState: "needs_information" })}
                    className="rounded-lg border border-amber-800/60 bg-amber-950/30 py-2 text-xs font-medium text-amber-300 hover:bg-amber-950/50 transition-colors"
                  >
                    Needs Info
                  </button>
                  <button
                    onClick={() => updateFulfillment({ orderId: selectedOrderId as any, newState: "completed" })}
                    className="rounded-lg border border-emerald-800/60 bg-emerald-950/30 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-950/50 transition-colors"
                  >
                    Complete
                  </button>
                </div>

                {/* Delivery form */}
                <div className="space-y-3 border-t border-zinc-800 pt-4">
                  <label className="block text-xs font-semibold text-zinc-300">Deliver Work</label>
                  <input
                    type="text"
                    value={deliveryUrl}
                    onChange={(e) => setDeliveryUrl(e.target.value)}
                    placeholder="Delivery URL (e.g. https://storage.digitaldock.com/report.pdf)"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                  />
                  <textarea
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Delivery notes / message to customer..."
                    rows={2}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none resize-none"
                  />
                  <button
                    onClick={() => {
                      deliverOrder({
                        orderId: selectedOrderId as any,
                        deliveryUrl: deliveryUrl || undefined,
                        deliveryNotes: deliveryNotes || undefined,
                      });
                      setSelectedOrderId(null);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Mark Delivered
                  </button>
                </div>

                {/* Admin notes */}
                <div className="space-y-3 border-t border-zinc-800 pt-4">
                  <label className="block text-xs font-semibold text-zinc-300">Internal Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Notes visible only to admins..."
                    rows={2}
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none resize-none"
                  />
                  <button
                    onClick={() => addNote({ orderId: selectedOrderId as any, notes: adminNotes })}
                    className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    Save Notes
                  </button>
                </div>

                {/* Audit history */}
                {orderDetail.events.length > 0 && (
                  <div className="space-y-2 border-t border-zinc-800 pt-4">
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Audit History</h4>
                    <div className="space-y-2">
                      {orderDetail.events.map((event, i) => (
                        <div key={i} className="rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-200">{event.eventType.replace(/_/g, " ")}</span>
                            <span className="text-zinc-500">{formatDate(event.timestamp)}</span>
                          </div>
                          {event.reason && <p className="text-zinc-400 mt-1">{event.reason}</p>}
                          {event.previousState && event.newState && (
                            <p className="text-zinc-500 mt-0.5">{event.previousState} → {event.newState}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4 text-center">
                <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                <p className="text-xs text-amber-300">Fulfillment controls unlock after payment is verified.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}