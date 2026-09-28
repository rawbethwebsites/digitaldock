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
  Bot,
  ArrowRight,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";

// Mock user orders for demonstration and interactive local testing
const mockOrders = [
  {
    reference: "DD-2026-0042",
    serviceTitle: "Instagram Growth & Engagement Audit",
    serviceSlug: "instagram-growth-audit",
    price: 49,
    paymentState: "paid",
    fulfillmentState: "in_progress",
    createdAt: "Sep 28, 2026, 12:45 PM",
    expectedDelivery: "Oct 1, 2026",
    deliverablesReady: false,
    telegramLinked: true,
  },
  {
    reference: "DD-2026-0038",
    serviceTitle: "Instagram Professional Profile Setup",
    serviceSlug: "instagram-profile-setup",
    price: 79,
    paymentState: "paid",
    fulfillmentState: "delivered",
    createdAt: "Sep 25, 2026, 10:15 AM",
    expectedDelivery: "Sep 27, 2026",
    deliverablesReady: true,
    deliveryUrl: "https://example.com/assets/DD-0038-assets.zip",
    telegramLinked: true,
  },
  {
    reference: "DD-2026-0029",
    serviceTitle: "Social Content Starter Pack (15 Posts)",
    serviceSlug: "social-content-starter-pack",
    price: 129,
    paymentState: "awaiting_payment",
    fulfillmentState: "not_started",
    createdAt: "Sep 22, 2026, 4:20 PM",
    expectedDelivery: "Pending Payment",
    deliverablesReady: false,
    telegramLinked: false,
  },
];

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const demoCreated = searchParams.get("demo_created");

  const [orders] = useState(mockOrders);
  const [telegramConnected, setTelegramConnected] = useState(false);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Telegram Connection Alert Banner */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {telegramConnected
                ? "Telegram Notifications Active"
                : "Connect Telegram for Real-time Order Alerts"}
            </h3>
            <p className="text-xs text-zinc-400">
              {telegramConnected
                ? "You will receive immediate alerts for payment confirmations and completed deliverables."
                : "Link your Telegram account with a secure, 10-minute deep token (PRD Section 3.6)."}
            </p>
          </div>
        </div>

        <button
          onClick={() => setTelegramConnected(!telegramConnected)}
          className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
            telegramConnected
              ? "border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              : "bg-sky-500 text-zinc-950 hover:bg-sky-400 font-bold shadow-lg shadow-sky-500/10"
          }`}
        >
          {telegramConnected ? "Disconnect Bot" : "Connect Telegram →"}
        </button>
      </div>

      {/* Orders List Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            My Orders
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track fulfillment progress, download deliverables, and manage support cases
          </p>
        </div>

        <Link
          href="/"
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          Browse Catalogue
        </Link>
      </div>

      {demoCreated && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-4 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>
            <strong>New brief submitted!</strong> In production with live NOWPayments keys, this redirects directly to the hosted crypto checkout invoice.
          </span>
        </div>
      )}

      {/* Orders List Cards */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.reference}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-zinc-700 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {order.reference}
                </span>
                <span className="text-zinc-600">&bull;</span>
                <span className="text-xs text-zinc-400">{order.createdAt}</span>
                <StatusBadge status={order.paymentState} type="payment" />
                <StatusBadge status={order.fulfillmentState} type="fulfillment" />
              </div>

              <h3 className="text-base font-bold text-white">
                {order.serviceTitle}
              </h3>

              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span>
                  Expected: <strong className="text-zinc-200">{order.expectedDelivery}</strong>
                </span>
                <span>&bull;</span>
                <span>
                  Quoted: <strong className="text-white">{formatCurrency(order.price)}</strong>
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              {order.deliverablesReady && (
                <a
                  href={order.deliveryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400 transition-colors"
                >
                  <span>Download Deliverable</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              {order.paymentState === "awaiting_payment" && (
                <button
                  onClick={() => alert("Hosted NOWPayments checkout flow trigger")}
                  className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition-colors"
                >
                  Pay Invoice
                </button>
              )}

              <button
                onClick={() =>
                  alert(`Open Support Ticket dialog for order ${order.reference}`)
                }
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
    </div>
  );
}
