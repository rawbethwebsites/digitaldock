import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const paymentStateValidator = v.union(
  v.literal("awaiting_payment"),
  v.literal("confirming"),
  v.literal("paid"),
  v.literal("expired"),
  v.literal("failed"),
  v.literal("partially_paid"),
  v.literal("manual_review"),
  v.literal("refund_pending"),
  v.literal("refunded")
);

export const fulfillmentStateValidator = v.union(
  v.literal("not_started"),
  v.literal("needs_information"),
  v.literal("in_progress"),
  v.literal("delivered"),
  v.literal("completed"),
  v.literal("cancelled"),
  v.literal("disputed")
);

export const userRoleValidator = v.union(
  v.literal("visitor"),
  v.literal("customer"),
  v.literal("admin")
);

export default defineSchema({
  ...authTables,

  // -------------------------------------------------------------
  // Users & Auth (Extended from Convex Auth)
  // -------------------------------------------------------------
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // DigitalDock custom attributes
    displayName: v.optional(v.string()),
    role: v.optional(userRoleValidator), // default customer
    status: v.optional(v.union(v.literal("active"), v.literal("suspended"))),
  })
    .index("email", ["email"])
    .index("by_role", ["role"]),

  // -------------------------------------------------------------
  // Catalogue & Categories
  // -------------------------------------------------------------
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.number(),
    status: v.union(v.literal("active"), v.literal("disabled")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_sortOrder", ["sortOrder"])
    .index("by_status", ["status"]),

  services: defineTable({
    categoryId: v.id("categories"),
    title: v.string(),
    slug: v.string(),
    shortSummary: v.string(),
    description: v.string(),
    deliverables: v.array(v.string()),
    exclusions: v.array(v.string()),
    price: v.number(), // Amount in base currency (e.g. USD cents or whole currency unit)
    currency: v.string(), // Default "USD"
    turnaroundDays: v.number(),
    requirementsSchema: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("textarea"),
          v.literal("url"),
          v.literal("select"),
          v.literal("file")
        ),
        required: v.boolean(),
        placeholder: v.optional(v.string()),
        options: v.optional(v.array(v.string())),
        validationRule: v.optional(v.string()),
      })
    ),
    refundTerms: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category_and_status", ["categoryId", "status"])
    .index("by_status", ["status"]),

  // -------------------------------------------------------------
  // Orders & Snapshots
  // -------------------------------------------------------------
  orders: defineTable({
    reference: v.string(), // e.g. "DD-2026-0001"
    customerId: v.id("users"),
    serviceId: v.id("services"),

    // Immutable snapshot of service definition at moment of ordering (ORD-03)
    serviceSnapshot: v.object({
      title: v.string(),
      categoryName: v.string(),
      shortSummary: v.string(),
      deliverables: v.array(v.string()),
      exclusions: v.array(v.string()),
      turnaroundDays: v.number(),
      refundTerms: v.string(),
    }),

    // Customer answers to requirements schema
    brief: v.record(v.string(), v.any()),

    quotedPrice: v.number(),
    quotedCurrency: v.string(),

    paymentState: paymentStateValidator,
    fulfillmentState: fulfillmentStateValidator,

    adminNotes: v.optional(v.string()),
    deliveryNotes: v.optional(v.string()),
    deliveryUrl: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
    paidAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_reference", ["reference"])
    .index("by_customer", ["customerId", "createdAt"])
    .index("by_payment_state", ["paymentState"])
    .index("by_fulfillment_state", ["fulfillmentState"]),

  orderFiles: defineTable({
    orderId: v.id("orders"),
    uploadedBy: v.id("users"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    fileType: v.union(v.literal("brief_attachment"), v.literal("deliverable")),
    accessClass: v.union(v.literal("customer"), v.literal("admin_only")),
    createdAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_storageId", ["storageId"]),

  // -------------------------------------------------------------
  // Payments & IPN Callbacks
  // -------------------------------------------------------------
  payments: defineTable({
    orderId: v.id("orders"),
    provider: v.string(), // "nowpayments"
    providerInvoiceId: v.string(),
    providerPaymentId: v.optional(v.string()),
    invoiceUrl: v.optional(v.string()),
    payAddress: v.optional(v.string()),
    payCurrency: v.optional(v.string()),
    expectedAmount: v.number(),
    expectedCurrency: v.string(),
    actualAmountPaid: v.optional(v.number()),
    providerStatus: v.string(),
    verifiedStatus: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_orderId", ["orderId"])
    .index("by_providerInvoiceId", ["providerInvoiceId"])
    .index("by_providerPaymentId", ["providerPaymentId"]),

  paymentEvents: defineTable({
    deduplicationKey: v.string(), // unique hash or provider event ID
    paymentId: v.optional(v.id("payments")),
    orderId: v.id("orders"),
    providerStatus: v.string(),
    verifiedOutcome: v.string(),
    rawPayload: v.string(),
    receivedAt: v.number(),
  })
    .index("by_deduplicationKey", ["deduplicationKey"])
    .index("by_orderId", ["orderId"]),

  orderEvents: defineTable({
    orderId: v.id("orders"),
    actorId: v.optional(v.id("users")),
    actorType: v.union(v.literal("system"), v.literal("customer"), v.literal("admin")),
    eventType: v.string(),
    previousState: v.optional(v.string()),
    newState: v.optional(v.string()),
    reason: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_orderId", ["orderId", "timestamp"]),

  // -------------------------------------------------------------
  // Telegram Integrations & Alerts
  // -------------------------------------------------------------
  telegramLinks: defineTable({
    userId: v.id("users"),
    chatId: v.string(),
    username: v.optional(v.string()),
    linkToken: v.optional(v.string()),
    linkTokenExpiresAt: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("connected"), v.literal("disconnected")),
    preferences: v.object({
      orderStatusUpdates: v.boolean(),
      supportUpdates: v.boolean(),
    }),
    connectedAt: v.optional(v.number()),
    disconnectedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_chatId", ["chatId"])
    .index("by_linkToken", ["linkToken"]),

  notificationEvents: defineTable({
    eventType: v.string(),
    recipientUserId: v.optional(v.id("users")),
    recipientRole: v.union(v.literal("customer"), v.literal("admin")),
    orderId: v.optional(v.id("orders")),
    channel: v.union(v.literal("telegram"), v.literal("email")),
    messagePayload: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("retrying")
    ),
    attemptCount: v.number(),
    lastError: v.optional(v.string()),
    scheduledAt: v.number(),
    sentAt: v.optional(v.number()),
  })
    .index("by_status_scheduled", ["status", "scheduledAt"])
    .index("by_orderId", ["orderId"]),

  // -------------------------------------------------------------
  // Support
  // -------------------------------------------------------------
  supportCases: defineTable({
    orderId: v.id("orders"),
    openedBy: v.id("users"),
    reason: v.string(),
    description: v.string(),
    status: v.union(v.literal("open"), v.literal("resolved")),
    adminResponse: v.optional(v.string()),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_orderId", ["orderId"])
    .index("by_openedBy", ["openedBy"])
    .index("by_status", ["status"]),
});
