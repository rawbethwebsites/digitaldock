"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Send,
  MessageSquare,
  Users,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";

const mockAdminOrders = [
  {
    reference: "DD-2026-0042",
    customer: "alex@example.com",
    service: "Instagram Growth & Engagement Audit",
    price: 49,
    payCurrency: "USDT (TRC20)",
    paymentState: "paid",
    fulfillmentState: "in_progress",
    date: "Sep 28, 12:45",
  },
  {
    reference: "DD-2026-0045",
    customer: "jordan@brand.co",
    service: "Social Content Starter Pack (15 Posts)",
    price: 129,
    payCurrency: "BTC",
    paymentState: "partially_paid",
    fulfillmentState: "not_started",
    date: "Sep 28, 11:20",
  },
  {
    reference: "DD-2026-0038",
    customer: "elena@startup.io",
    service: "Instagram Professional Profile Setup",
    price: 79,
    payCurrency: "ETH",
    paymentState: "paid",
    fulfillmentState: "delivered",
    date: "Sep 25, 10:15",
  },
];

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState(mockAdminOrders);
  const [selectedOrder, setSelectedOrder] = useState<any>(mockAdminOrders[0]);
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [updatedSuccess, setUpdatedSuccess] = useState(false);

  const handleUpdateStatus = (newState: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.reference === selectedOrder.reference
          ? { ...o, fulfillmentState: newState }
          : o
      )
    );
    setSelectedOrder((prev: any) => ({ ...prev, fulfillmentState: newState }));
    setUpdatedSuccess(true);
    setTimeout(() => setUpdatedSuccess(false), 3000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Admin Control Portal</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            DigitalDock Operations
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Simulating NOWPayments manual IPN sync...")}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Callbacks</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Verified Paid Volume</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">$257.00</p>
          <p className="text-[11px] text-zinc-500 mt-1">Across 3 orders</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Pending Fulfillment</span>
            <Clock className="h-4 w-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-white">1 Order</p>
          <p className="text-[11px] text-sky-400 mt-1">DD-2026-0042 in progress</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Payment Exceptions</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300">1 Review</p>
          <p className="text-[11px] text-amber-400/80 mt-1">Partial payment on DD-0045</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Support Cases</span>
            <MessageSquare className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">0 Open</p>
          <p className="text-[11px] text-zinc-500 mt-1">All tickets resolved</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Orders Table */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h2 className="text-lg font-bold text-white">Order Management Queue</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="py-3 px-2">Order Ref</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Service</th>
                  <th className="py-3 px-2">Payment</th>
                  <th className="py-3 px-2">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {orders.map((o) => (
                  <tr
                    key={o.reference}
                    onClick={() => setSelectedOrder(o)}
                    className={`cursor-pointer transition-colors ${
                      selectedOrder.reference === o.reference
                        ? "bg-zinc-800/70"
                        : "hover:bg-zinc-800/30"
                    }`}
                  >
                    <td className="py-3.5 px-2 font-mono font-bold text-emerald-400">
                      {o.reference}
                    </td>
                    <td className="py-3.5 px-2 text-zinc-300">{o.customer}</td>
                    <td className="py-3.5 px-2 text-zinc-200">{o.service}</td>
                    <td className="py-3.5 px-2">
                      <StatusBadge status={o.paymentState} type="payment" />
                    </td>
                    <td className="py-3.5 px-2">
                      <StatusBadge status={o.fulfillmentState} type="fulfillment" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Selected Order Action Panel */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Selected Order Detail
            </span>
            <h3 className="text-xl font-mono font-bold text-white mt-1">
              {selectedOrder.reference}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">{selectedOrder.service}</p>
          </div>

          {updatedSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-950/40 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Fulfillment state updated and customer notified!</span>
            </div>
          )}

          {/* Payment Info */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500">Customer:</span>
              <span className="text-zinc-200">{selectedOrder.customer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Price & Asset:</span>
              <span className="font-semibold text-emerald-400">
                {formatCurrency(selectedOrder.price)} ({selectedOrder.payCurrency})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Payment Status:</span>
              <StatusBadge status={selectedOrder.paymentState} type="payment" />
            </div>
          </div>

          {/* Fulfillment Controls */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-zinc-300">
              Advance Fulfillment State
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleUpdateStatus("in_progress")}
                className="rounded-lg border border-zinc-700 bg-zinc-800 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
              >
                In Progress
              </button>
              <button
                onClick={() => handleUpdateStatus("needs_information")}
                className="rounded-lg border border-amber-800/60 bg-amber-950/30 py-2 text-xs font-medium text-amber-300 hover:bg-amber-950/50"
              >
                Needs Info
              </button>
            </div>
          </div>

          {/* Deliver Work */}
          <div className="space-y-3 border-t border-zinc-800 pt-4">
            <label className="block text-xs font-semibold text-zinc-300">
              Deliverable URL / Storage Link
            </label>
            <input
              type="text"
              value={deliveryUrl}
              onChange={(e) => setDeliveryUrl(e.target.value)}
              placeholder="https://storage.digitaldock.com/report.pdf"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={() => handleUpdateStatus("delivered")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/10"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Mark Delivered & Trigger Telegram Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
