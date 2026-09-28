import { query, mutation } from "./_generated/server.js";
import type { QueryCtx, MutationCtx } from "./_generated/server.js";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v, ConvexError } from "convex/values";

/**
 * Helper to fetch the current authenticated user record.
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

/**
 * Asserts that the authenticated user has the 'admin' role.
 * Throws a ConvexError if not authorized (ACC-02).
 */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user || user.role !== "admin") {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Admin access required for this operation",
    });
  }
  return user;
}

/**
 * Asserts that the caller is an authenticated customer or admin.
 */
export async function requireAuthUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }
  return user;
}

/**
 * Returns current authenticated user profile and roles.
 */
export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      name: user.name || user.displayName,
      role: user.role || "customer",
      status: user.status || "active",
    };
  },
});

/**
 * Admin management: Promote user to admin (or demote)
 */
export const setRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("visitor"), v.literal("customer"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    // Only an existing admin or initial empty database setup can promote
    const currentUser = await getCurrentUser(ctx);
    const allAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    if (allAdmins.length > 0 && currentUser?.role !== "admin") {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Only existing admins can modify roles",
      });
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Seed initial categories according to PRD section 1.4:
 * 1. Social Profile Services
 * 2. Social Growth Services
 * 3. Content Services
 * 4. Account Setup
 * 5. Phone-related services (created in DISABLED state per PRD)
 */
export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) {
      return { message: "Categories already seeded" };
    }

    const now = Date.now();

    const categories = [
      {
        name: "Social Profile Services",
        slug: "social-profile-services",
        description: "Configuration and optimization of customer-owned social profiles",
        sortOrder: 1,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Social Growth Services",
        slug: "social-growth-services",
        description: "Actionable audits, content recommendations, and ethical growth strategies",
        sortOrder: 2,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Content Services",
        slug: "content-services",
        description: "High-quality captions, concept boards, and digital creative starter packs",
        sortOrder: 3,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Account Setup",
        slug: "account-setup",
        description: "Guided technical configuration and setup for customer-owned accounts",
        sortOrder: 4,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Phone-related services",
        slug: "phone-related-services",
        description: "Pending supplier and compliance review (Disabled for MVP)",
        sortOrder: 5,
        status: "disabled" as const, // CAT-01 / PRD section 1.4
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const cat of categories) {
      await ctx.db.insert("categories", cat);
    }

    return { message: `Seeded ${categories.length} categories successfully` };
  },
});
