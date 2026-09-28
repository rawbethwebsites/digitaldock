"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  Clock,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function expectedDelivery(createdAt: number, turnaroundDays: number, paymentState: string): string {
  if (paymentState === "awaiting_payment") return "Pending Payment";
  const deliveryDate = new Date(createdAt + turnaroundDays * 24 * 60 * 60 * 1000);
  return deliveryDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const newOrderRef = searchParams.get("new");
  const { isAuthenticated, isLoading } = useConvexAuth();

  const orders = useQuery(api.orders.listMyOrders, {});

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent mx-auto" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400">
          <Package className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-white">Sign in to view your orders</h1>
        <p className="mt-2 text-sm text-zinc-400">You need an account to track orders and briefs.</p>
        <Link href="/auth" className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-emerald-400 transition-colors">
          Sign In <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* New order confirmation */}
      {newOrderRef && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-4 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Order {newOrderRef} created!</strong> Your brief has been submitted. Payment checkout will be available here once crypto integration is connected (Milestone 4).
          </span>
        </div>
      )}

      {/* Orders List Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">My Orders</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track fulfillment progress, download deliverables, and manage support
          </p>
        </div>
        <Link href="/" className="rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors">
          Browse Catalogue
        </Link>
      </div>

      {/* Orders List */}
      {orders === undefined ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-800/40 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-zinc-300">No orders yet</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Browse the catalogue and submit a brief to place your first order.
          </p>
          <Link href="/" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors">
            Browse Services <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-emerald-400">{order.reference}</span>
                  <span className="text-zinc-600">&bull;</span>
                  <span className="text-xs text-zinc-400">{formatDate(order.createdAt)}</span>
                  <StatusBadge status={order.paymentState} type="payment" />
                  <StatusBadge status={order.fulfillmentState} type="fulfillment" />
                </div>

                <h3 className="text-base font-bold text-white truncate">{order.serviceTitle}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                  <span>
                    Expected: <strong className="text-zinc-200">{expectedDelivery(order.createdAt, order.turnaroundDays, order.paymentState)}</strong>
                  </span>
                  <span>&bull;</span>
                  <span>
                    Quoted: <strong className="text-white">{formatCurrency(order.quotedPrice, order.quotedCurrency)}</strong>
                  </span>
                  <span>&bull;</span>
                  <span className="text-zinc-500">{order.categoryName}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                {order.deliveryUrl && (
                  <a
                    href={order.deliveryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
                  >
                    <span>Download</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}

                {order.paymentState === "awaiting_payment" && (
                  <button
                    onClick={() => alert("Crypto checkout coming in Milestone 4 (NOWPayments integration)")}
                    className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition-colors"
                  >
                    Pay Invoice
                  </button>
                )}

                <button
                  onClick={() => alert(`Support case feature coming in Milestone 5. Order: ${order.reference}`)}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  title="Contact support"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Support</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}