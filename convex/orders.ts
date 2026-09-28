import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getCurrentUser, requireAuthUser, requireAdmin } from "./users";

/**
 * Generate a unique human-readable order reference: DD-YYYY-XXXX
 */
function generateOrderReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DD-${year}-${random}`;
}

/**
 * CUSTOMER: Create a new order from a service + brief.
 * - Reads the published service from the DB (not from the browser)
 * - Freezes a price/scope/turnaround snapshot on the order (ORD-03, CAT-06)
 * - Validates required brief fields (ORD-02)
 * - Sets initial payment + fulfillment states
 */
export const createOrder = mutation({
  args: {
    serviceId: v.id("services"),
    brief: v.record(v.string(), v.any()),
  },
  returns: v.object({
    orderId: v.id("orders"),
    reference: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await requireAuthUser(ctx);

    // Load the published service from the DB — never trust browser input for price
    const service = await ctx.db.get(args.serviceId);
    if (!service) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Service not found" });
    }
    if (service.status !== "published") {
      throw new ConvexError({ code: "NOT_FOUND", message: "This service is not available for ordering" });
    }

    // Load category for snapshot
    const category = await ctx.db.get(service.categoryId);

    // Validate required brief fields against the service's requirementsSchema
    for (const field of service.requirementsSchema) {
      if (field.required) {
        const value = args.brief[field.id];
        if (value === undefined || value === null || String(value).trim() === "") {
          throw new ConvexError({
            code: "VALIDATION_ERROR",
            message: `Missing required field: "${field.label}"`,
          });
        }
      }
    }

    const now = Date.now();
    const reference = generateOrderReference();

    // Build the immutable service snapshot (ORD-03)
    const serviceSnapshot = {
      title: service.title,
      categoryName: category?.name ?? "Uncategorized",
      shortSummary: service.shortSummary,
      deliverables: service.deliverables,
      exclusions: service.exclusions,
      turnaroundDays: service.turnaroundDays,
      refundTerms: service.refundTerms,
    };

    const orderId = await ctx.db.insert("orders", {
      reference,
      customerId: user._id,
      serviceId: service._id,
      serviceSnapshot,
      brief: args.brief,
      quotedPrice: service.price,
      quotedCurrency: service.currency,
      paymentState: "awaiting_payment",
      fulfillmentState: "not_started",
      createdAt: now,
      updatedAt: now,
    });

    // Record the creation event (ORD-07)
    await ctx.db.insert("orderEvents", {
      orderId,
      actorId: user._id,
      actorType: "customer",
      eventType: "order_created",
      previousState: undefined,
      newState: undefined,
      reason: "Customer submitted service brief",
      timestamp: now,
    });

    return { orderId, reference };
  },
});

/**
 * CUSTOMER: List their own orders (ACC-03 — can only see their own).
 */
export const listMyOrders = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("orders"),
      reference: v.string(),
      serviceTitle: v.string(),
      categoryName: v.string(),
      quotedPrice: v.number(),
      quotedCurrency: v.string(),
      paymentState: v.string(),
      fulfillmentState: v.string(),
      turnaroundDays: v.number(),
      createdAt: v.number(),
      deliveryUrl: v.optional(v.string()),
      deliveryNotes: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", user._id))
      .order("desc")
      .collect();

    return orders.map((o) => ({
      _id: o._id,
      reference: o.reference,
      serviceTitle: o.serviceSnapshot.title,
      categoryName: o.serviceSnapshot.categoryName,
      quotedPrice: o.quotedPrice,
      quotedCurrency: o.quotedCurrency,
      paymentState: o.paymentState,
      fulfillmentState: o.fulfillmentState,
      turnaroundDays: o.serviceSnapshot.turnaroundDays,
      createdAt: o.createdAt,
      deliveryUrl: o.deliveryUrl,
      deliveryNotes: o.deliveryNotes,
    }));
  },
});

/**
 * CUSTOMER: Get a single order detail (only their own — ACC-03).
 */
export const getMyOrder = query({
  args: { orderId: v.id("orders") },
  returns: v.union(
    v.object({
      _id: v.id("orders"),
      reference: v.string(),
      serviceTitle: v.string(),
      categoryName: v.string(),
      shortSummary: v.string(),
      deliverables: v.array(v.string()),
      exclusions: v.array(v.string()),
      turnaroundDays: v.number(),
      refundTerms: v.string(),
      brief: v.any(),
      quotedPrice: v.number(),
      quotedCurrency: v.string(),
      paymentState: v.string(),
      fulfillmentState: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      paidAt: v.optional(v.number()),
      deliveredAt: v.optional(v.number()),
      deliveryUrl: v.optional(v.string()),
      deliveryNotes: v.optional(v.string()),
      adminNotes: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    // ACC-03: Customer can only access their own orders
    if (order.customerId !== user._id) return null;

    return {
      _id: order._id,
      reference: order.reference,
      serviceTitle: order.serviceSnapshot.title,
      categoryName: order.serviceSnapshot.categoryName,
      shortSummary: order.serviceSnapshot.shortSummary,
      deliverables: order.serviceSnapshot.deliverables,
      exclusions: order.serviceSnapshot.exclusions,
      turnaroundDays: order.serviceSnapshot.turnaroundDays,
      refundTerms: order.serviceSnapshot.refundTerms,
      brief: order.brief,
      quotedPrice: order.quotedPrice,
      quotedCurrency: order.quotedCurrency,
      paymentState: order.paymentState,
      fulfillmentState: order.fulfillmentState,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt,
      deliveredAt: order.deliveredAt,
      deliveryUrl: order.deliveryUrl,
      deliveryNotes: order.deliveryNotes,
      adminNotes: order.adminNotes,
    };
  },
});

/**
 * ADMIN: List all orders.
 */
export const adminListAll = query({
  args: {
    paymentState: v.optional(v.string()),
    fulfillmentState: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("orders"),
      reference: v.string(),
      serviceTitle: v.string(),
      customerId: v.id("users"),
      customerEmail: v.string(),
      quotedPrice: v.number(),
      quotedCurrency: v.string(),
      paymentState: v.string(),
      fulfillmentState: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let orders;
    if (args.paymentState) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_payment_state", (q) => q.eq("paymentState", args.paymentState as any))
        .order("desc")
        .collect();
    } else if (args.fulfillmentState) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_fulfillment_state", (q) => q.eq("fulfillmentState", args.fulfillmentState as any))
        .order("desc")
        .collect();
    } else {
      orders = await ctx.db.query("orders").order("desc").collect();
    }

    // Enrich with customer email
    const enriched = await Promise.all(
      orders.map(async (o) => {
        const customer = await ctx.db.get(o.customerId);
        return {
          _id: o._id,
          reference: o.reference,
          serviceTitle: o.serviceSnapshot.title,
          customerId: o.customerId,
          customerEmail: customer?.email ?? "unknown",
          quotedPrice: o.quotedPrice,
          quotedCurrency: o.quotedCurrency,
          paymentState: o.paymentState,
          fulfillmentState: o.fulfillmentState,
          createdAt: o.createdAt,
        };
      }),
    );
    return enriched;
  },
});

/**
 * ADMIN: Get full order detail including brief, events, and internal notes.
 */
export const adminGetOrder = query({
  args: { orderId: v.id("orders") },
  returns: v.union(
    v.object({
      _id: v.id("orders"),
      reference: v.string(),
      serviceTitle: v.string(),
      categoryName: v.string(),
      shortSummary: v.string(),
      deliverables: v.array(v.string()),
      exclusions: v.array(v.string()),
      turnaroundDays: v.number(),
      refundTerms: v.string(),
      brief: v.any(),
      quotedPrice: v.number(),
      quotedCurrency: v.string(),
      paymentState: v.string(),
      fulfillmentState: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      paidAt: v.optional(v.number()),
      deliveredAt: v.optional(v.number()),
      deliveryUrl: v.optional(v.string()),
      deliveryNotes: v.optional(v.string()),
      adminNotes: v.optional(v.string()),
      customerEmail: v.string(),
      customerName: v.string(),
      events: v.array(
        v.object({
          actorType: v.string(),
          eventType: v.string(),
          previousState: v.optional(v.string()),
          newState: v.optional(v.string()),
          reason: v.optional(v.string()),
          timestamp: v.number(),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const customer = await ctx.db.get(order.customerId);
    const events = await ctx.db
      .query("orderEvents")
      .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
      .order("asc")
      .collect();

    return {
      _id: order._id,
      reference: order.reference,
      serviceTitle: order.serviceSnapshot.title,
      categoryName: order.serviceSnapshot.categoryName,
      shortSummary: order.serviceSnapshot.shortSummary,
      deliverables: order.serviceSnapshot.deliverables,
      exclusions: order.serviceSnapshot.exclusions,
      turnaroundDays: order.serviceSnapshot.turnaroundDays,
      refundTerms: order.serviceSnapshot.refundTerms,
      brief: order.brief,
      quotedPrice: order.quotedPrice,
      quotedCurrency: order.quotedCurrency,
      paymentState: order.paymentState,
      fulfillmentState: order.fulfillmentState,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paidAt: order.paidAt,
      deliveredAt: order.deliveredAt,
      deliveryUrl: order.deliveryUrl,
      deliveryNotes: order.deliveryNotes,
      adminNotes: order.adminNotes,
      customerEmail: customer?.email ?? "unknown",
      customerName: customer?.name ?? customer?.displayName ?? "Unknown",
      events: events.map((e) => ({
        actorType: e.actorType,
        eventType: e.eventType,
        previousState: e.previousState,
        newState: e.newState,
        reason: e.reason,
        timestamp: e.timestamp,
      })),
    };
  },
});

/**
 * ADMIN: Update fulfillment state (FUL-02).
 * Records an audit event on every transition (ORD-07).
 */
export const adminUpdateFulfillment = mutation({
  args: {
    orderId: v.id("orders"),
    newState: v.union(
      v.literal("not_started"),
      v.literal("needs_information"),
      v.literal("in_progress"),
      v.literal("delivered"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("disputed"),
    ),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Order not found" });
    }

    const now = Date.now();
    const previousState = order.fulfillmentState;

    // Only verified paid orders enter the fulfillment queue (FUL-01)
    if (args.newState !== "not_started" && args.newState !== "cancelled" && order.paymentState !== "paid") {
      throw new ConvexError({
        code: "PAYMENT_REQUIRED",
        message: "Order must be paid before fulfillment can begin",
      });
    }

    const updates: any = {
      fulfillmentState: args.newState,
      updatedAt: now,
    };

    if (args.newState === "delivered" && !order.deliveredAt) {
      updates.deliveredAt = now;
    }
    if (args.newState === "completed" && !order.completedAt) {
      updates.completedAt = now;
    }

    await ctx.db.patch(args.orderId, updates);

    // Record audit event
    await ctx.db.insert("orderEvents", {
      orderId: args.orderId,
      actorId: admin._id,
      actorType: "admin",
      eventType: "fulfillment_state_change",
      previousState,
      newState: args.newState,
      reason: args.reason ?? `Admin moved order to ${args.newState}`,
      timestamp: now,
    });

    return null;
  },
});

/**
 * ADMIN: Deliver work to the customer (FUL-04).
 */
export const adminDeliverOrder = mutation({
  args: {
    orderId: v.id("orders"),
    deliveryUrl: v.optional(v.string()),
    deliveryNotes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Order not found" });
    }

    const now = Date.now();
    await ctx.db.patch(args.orderId, {
      fulfillmentState: "delivered",
      deliveryUrl: args.deliveryUrl,
      deliveryNotes: args.deliveryNotes,
      deliveredAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("orderEvents", {
      orderId: args.orderId,
      actorId: admin._id,
      actorType: "admin",
      eventType: "order_delivered",
      previousState: order.fulfillmentState,
      newState: "delivered",
      reason: args.deliveryNotes ?? "Admin delivered the order",
      timestamp: now,
    });

    return null;
  },
});

/**
 * ADMIN: Add internal notes to an order.
 */
export const adminAddNote = mutation({
  args: {
    orderId: v.id("orders"),
    notes: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.orderId, {
      adminNotes: args.notes,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * ADMIN: Get dashboard stats (order counts by state).
 */
export const adminStats = query({
  args: {},
  returns: v.object({
    totalOrders: v.number(),
    paidOrders: v.number(),
    awaitingPayment: v.number(),
    paymentExceptions: v.number(),
    inProgress: v.number(),
    delivered: v.number(),
    completed: v.number(),
    totalRevenue: v.number(),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allOrders = await ctx.db.query("orders").collect();

    return {
      totalOrders: allOrders.length,
      paidOrders: allOrders.filter((o) => o.paymentState === "paid").length,
      awaitingPayment: allOrders.filter((o) => o.paymentState === "awaiting_payment").length,
      paymentExceptions: allOrders.filter((o) =>
        ["partially_paid", "manual_review", "expired", "failed"].includes(o.paymentState),
      ).length,
      inProgress: allOrders.filter((o) =>
        ["needs_information", "in_progress"].includes(o.fulfillmentState),
      ).length,
      delivered: allOrders.filter((o) => o.fulfillmentState === "delivered").length,
      completed: allOrders.filter((o) => o.fulfillmentState === "completed").length,
      totalRevenue: allOrders
        .filter((o) => o.paymentState === "paid")
        .reduce((sum, o) => sum + o.quotedPrice, 0),
    };
  },
});