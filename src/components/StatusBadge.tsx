import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "payment" | "fulfillment";
  className?: string;
}

export function StatusBadge({ status, type = "payment", className }: StatusBadgeProps) {
  let badgeStyles = "border-zinc-700 bg-zinc-800 text-zinc-300";
  let label = status.replace(/_/g, " ").toUpperCase();

  switch (status) {
    case "paid":
    case "completed":
      badgeStyles = "border-emerald-700 bg-emerald-950/60 text-emerald-300";
      break;
    case "confirming":
    case "in_progress":
      badgeStyles = "border-sky-700 bg-sky-950/60 text-sky-300";
      break;
    case "needs_information":
    case "partially_paid":
      badgeStyles = "border-amber-700 bg-amber-950/60 text-amber-300";
      break;
    case "manual_review":
    case "disputed":
      badgeStyles = "border-purple-700 bg-purple-950/60 text-purple-300";
      break;
    case "failed":
    case "expired":
    case "cancelled":
      badgeStyles = "border-rose-700 bg-rose-950/60 text-rose-300";
      break;
    case "awaiting_payment":
    case "not_started":
    default:
      badgeStyles = "border-zinc-700 bg-zinc-900 text-zinc-400";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase transition-colors",
        badgeStyles,
        className
      )}
    >
      {label}
    </span>
  );
}
