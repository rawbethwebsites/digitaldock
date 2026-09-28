import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, getCurrentUser } from "./users";

/**
 * List all published services for the public catalogue.
 * Optional filter by category slug.
 */
export const listPublished = query({
  args: {
    categorySlug: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("services"),
      _creationTime: v.number(),
      slug: v.string(),
      title: v.string(),
      shortSummary: v.string(),
      description: v.string(),
      deliverables: v.array(v.string()),
      exclusions: v.array(v.string()),
      price: v.number(),
      currency: v.string(),
      turnaroundDays: v.number(),
      refundTerms: v.string(),
      status: v.string(),
      categoryName: v.string(),
      categorySlug: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    let services;
    if (args.categorySlug) {
      // Find the category first
      const category = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", args.categorySlug!))
        .unique();
      if (!category) return [];

      services = await ctx.db
        .query("services")
        .withIndex("by_category_and_status", (q) =>
          q.eq("categoryId", category._id).eq("status", "published"),
        )
        .collect();
    } else {
      services = await ctx.db
        .query("services")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect();
    }

    // Enrich with category names
    const enriched = await Promise.all(
      services.map(async (s) => {
        const cat = await ctx.db.get(s.categoryId);
        return {
          _id: s._id,
          _creationTime: s._creationTime,
          slug: s.slug,
          title: s.title,
          shortSummary: s.shortSummary,
          description: s.description,
          deliverables: s.deliverables,
          exclusions: s.exclusions,
          price: s.price,
          currency: s.currency,
          turnaroundDays: s.turnaroundDays,
          refundTerms: s.refundTerms,
          status: s.status,
          categoryName: cat?.name ?? "Uncategorized",
          categorySlug: cat?.slug ?? "",
        };
      }),
    );

    // Filter by search query if provided
    if (args.searchQuery) {
      const q = args.searchQuery.toLowerCase();
      return enriched.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.shortSummary.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }

    return enriched;
  },
});

/**
 * Get a single published service by slug (for service detail pages).
 */
export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("services"),
      _creationTime: v.number(),
      slug: v.string(),
      title: v.string(),
      shortSummary: v.string(),
      description: v.string(),
      deliverables: v.array(v.string()),
      exclusions: v.array(v.string()),
      price: v.number(),
      currency: v.string(),
      turnaroundDays: v.number(),
      refundTerms: v.string(),
      requirementsSchema: v.array(v.any()),
      status: v.string(),
      categoryName: v.string(),
      categorySlug: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const service = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!service || service.status !== "published") return null;

    const cat = await ctx.db.get(service.categoryId);
    return {
      _id: service._id,
      _creationTime: service._creationTime,
      slug: service.slug,
      title: service.title,
      shortSummary: service.shortSummary,
      description: service.description,
      deliverables: service.deliverables,
      exclusions: service.exclusions,
      price: service.price,
      currency: service.currency,
      turnaroundDays: service.turnaroundDays,
      refundTerms: service.refundTerms,
      requirementsSchema: service.requirementsSchema,
      status: service.status,
      categoryName: cat?.name ?? "Uncategorized",
      categorySlug: cat?.slug ?? "",
    };
  },
});

/**
 * List all categories (for the catalogue filter bar and admin).
 */
export const listCategories = query({
  args: { includeDisabled: v.optional(v.boolean()) },
  returns: v.array(
    v.object({
      _id: v.id("categories"),
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      sortOrder: v.number(),
      status: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("categories")
      .withIndex("by_sortOrder")
      .order("asc")
      .collect();

    const filtered = args.includeDisabled ? all : all.filter((c) => c.status === "active");
    // Map to only the fields in the validator — strip createdAt/updatedAt/_creationTime
    return filtered.map((c) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      sortOrder: c.sortOrder,
      status: c.status,
    }));
  },
});

/**
 * ADMIN: List all services (including drafts and archived).
 */
export const adminListAll = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("services"),
      _creationTime: v.number(),
      slug: v.string(),
      title: v.string(),
      shortSummary: v.string(),
      price: v.number(),
      currency: v.string(),
      turnaroundDays: v.number(),
      status: v.string(),
      categoryName: v.string(),
    }),
  ),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const services = await ctx.db.query("services").collect();
    const enriched = await Promise.all(
      services.map(async (s) => {
        const cat = await ctx.db.get(s.categoryId);
        return {
          _id: s._id,
          _creationTime: s._creationTime,
          slug: s.slug,
          title: s.title,
          shortSummary: s.shortSummary,
          price: s.price,
          currency: s.currency,
          turnaroundDays: s.turnaroundDays,
          status: s.status,
          categoryName: cat?.name ?? "Uncategorized",
        };
      }),
    );
    return enriched;
  },
});

/**
 * ADMIN: Create a new service listing (starts as draft).
 */
export const adminCreate = mutation({
  args: {
    categoryId: v.id("categories"),
    title: v.string(),
    slug: v.string(),
    shortSummary: v.string(),
    description: v.string(),
    deliverables: v.array(v.string()),
    exclusions: v.array(v.string()),
    price: v.number(),
    currency: v.string(),
    turnaroundDays: v.number(),
    refundTerms: v.string(),
    requirementsSchema: v.array(
      v.object({
        id: v.string(),
        label: v.string(),
        type: v.union(
          v.literal("text"),
          v.literal("textarea"),
          v.literal("url"),
          v.literal("select"),
          v.literal("file"),
        ),
        required: v.boolean(),
        placeholder: v.optional(v.string()),
        options: v.optional(v.array(v.string())),
      }),
    ),
  },
  returns: v.id("services"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    return await ctx.db.insert("services", {
      ...args,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * ADMIN: Update an existing service.
 */
export const adminUpdate = mutation({
  args: {
    serviceId: v.id("services"),
    categoryId: v.optional(v.id("categories")),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    shortSummary: v.optional(v.string()),
    description: v.optional(v.string()),
    deliverables: v.optional(v.array(v.string())),
    exclusions: v.optional(v.array(v.string())),
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    turnaroundDays: v.optional(v.number()),
    refundTerms: v.optional(v.string()),
    requirementsSchema: v.optional(v.array(v.any())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { serviceId, ...updates } = args;
    // Remove undefined fields
    const cleanUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) cleanUpdates[key] = value;
    }
    cleanUpdates.updatedAt = Date.now();
    await ctx.db.patch(serviceId, cleanUpdates);
    return null;
  },
});

/**
 * ADMIN: Change a service's publication status.
 */
export const adminSetStatus = mutation({
  args: {
    serviceId: v.id("services"),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.serviceId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * ADMIN: Delete a service permanently.
 */
export const adminDelete = mutation({
  args: { serviceId: v.id("services") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.serviceId);
    return null;
  },
});

/**
 * SELF-PROMOTE: Promote the current user to admin.
 * Only works if no admins exist yet (bootstrap mode).
 * Once an admin exists, use the setRole mutation from users.ts.
 */
export const selfPromoteToAdmin = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return {
        success: false,
        message: "You must be signed in to become an admin.",
      };
    }

    // Check if any admins already exist
    const existingAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    if (existingAdmins.length > 0) {
      return {
        success: false,
        message: "An admin already exists. Ask an existing admin to promote you.",
      };
    }

    // Promote the current user
    await ctx.db.patch(user._id, {
      role: "admin",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "You are now the admin! Refresh the page to see the admin dashboard.",
    };
  },
});