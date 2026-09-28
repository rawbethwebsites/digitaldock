"use client";

import { DollarSign, Bitcoin, ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">Payments</h1>
        <p className="mt-1 text-xs text-zinc-400">Configure crypto checkout for your marketplace</p>
      </div>

      {/* Payment provider status */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Crypto Checkout Not Configured</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Connect a hosted crypto payment provider to start accepting Bitcoin, Ethereum, USDT, and more.
              This is <span className="text-amber-400 font-semibold">Milestone 4</span> in your build plan.
            </p>
          </div>
        </div>

        {/* Provider cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bitcoin className="h-5 w-5 text-orange-500" />
              <h3 className="text-sm font-bold text-white">NOWPayments</h3>
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[9px] font-semibold text-zinc-400">Recommended</span>
            </div>
            <p className="text-xs text-zinc-400">
              Hosted invoices, 100+ cryptocurrencies, HMAC-SHA512 signed webhooks. The PRD's candidate provider.
            </p>
            <ul className="space-y-1 text-[11px] text-zinc-500">
              <li>• Invoice API with hosted checkout page</li>
              <li>• IPN callbacks with signature verification</li>
              <li>• Supports BTC, ETH, USDT, LTC, and more</li>
              <li>• Partial payment and refund handling</li>
            </ul>
            <a
              href="https://nowpayments.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline pt-2"
            >
              Create NOWPayments account
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Cryptomus</h3>
            </div>
            <p className="text-xs text-zinc-400">
              Alternative provider used by Followiz. Crypto payments via BTC, ETH, LTC, USDT with instant deposits.
            </p>
            <ul className="space-y-1 text-[11px] text-zinc-500">
              <li>• No minimum deposit</li>
              <li>• Multiple crypto assets</li>
              <li>• API for automated processing</li>
            </ul>
            <a
              href="https://cryptomus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:underline pt-2"
            >
              Explore Cryptomus
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* What happens when you connect */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-sm font-bold text-white mb-4">What You'll Get After Setup</h2>
        <div className="space-y-3">
          {[
            { title: "Hosted Crypto Invoices", desc: "Each order generates a unique invoice. Customer pays on the provider's page — you never handle wallet keys." },
            { title: "Verified Payment Callbacks", desc: "HMAC-SHA512 signature verification ensures only real provider callbacks mark orders as paid." },
            { title: "Duplicate Callback Protection", desc: "Repeated webhooks are handled idempotently — no duplicate fulfillments or alerts." },
            { title: "Exception Queue", desc: "Partial, expired, and unmatched payments appear for admin review automatically." },
            { title: "Order Snapshot Protection", desc: "Price and scope are frozen at order time — editing a live listing never changes existing orders." },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-zinc-100">{item.title}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next steps */}
      <div className="rounded-2xl border border-emerald-800/30 bg-emerald-950/10 p-6">
        <h2 className="text-sm font-bold text-emerald-300 mb-2">Next Steps</h2>
        <ol className="space-y-2 text-xs text-zinc-400">
          <li className="flex gap-2"><span className="text-emerald-400 font-bold">1.</span> Create a NOWPayments account and get your API key + IPN secret</li>
          <li className="flex gap-2"><span className="text-emerald-400 font-bold">2.</span> Add the keys to Convex env vars (I'll help you with this)</li>
          <li className="flex gap-2"><span className="text-emerald-400 font-bold">3.</span> I'll build the PaymentProvider adapter, webhook handler, and checkout flow</li>
          <li className="flex gap-2"><span className="text-emerald-400 font-bold">4.</span> Test with a small transaction before going live</li>
        </ol>
      </div>
    </div>
  );
}