import { mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";

/**
 * One-time bootstrap mutation: creates the first admin user when the database is empty.
 * Gated on zero users in the `users` table — permanently closes after first user.
 */
export const bootstrapAdmin = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    scryptHash: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    email: v.string(),
    role: v.string(),
  }),
  handler: async (ctx, args) => {
    const { email, name, scryptHash } = args;

    // Gate: only works when database has zero users
    const existingUsers = await ctx.db.query("users").collect();
    if (existingUsers.length > 0) {
      throw new ConvexError({
        code: "BOOTSTRAP_CLOSED",
        message: "Bootstrap window closed — users already exist. Use normal sign-up instead.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const displayName = name || normalizedEmail.split("@")[0];

    // Insert into users (our custom table that extends authTables)
    const userId = await ctx.db.insert("users", {
      email: normalizedEmail,
      name: displayName,
      displayName,
      role: "admin",
      status: "active",
    });

    // Insert into authAccounts so the Password provider can find this account
    // on sign-in. The `secret` field stores the pre-hashed Scrypt value.
    await ctx.db.insert("authAccounts", {
      userId,
      provider: "password",
      providerAccountId: normalizedEmail,
      secret: scryptHash,
    });

    return {
      success: true,
      email: normalizedEmail,
      role: "admin",
    };
  },
});
