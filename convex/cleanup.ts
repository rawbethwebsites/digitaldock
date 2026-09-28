import { mutation } from "./_generated/server";

// One-time cleanup: delete corrupted test auth data from the broken-schema era
// so sign-up starts fresh. Safe to delete this file after running once.
export const cleanupTestAuthData = mutation({
  args: {},
  returns: v.object({
    deletedUsers: v.number(),
    deletedAccounts: v.number(),
    deletedSessions: v.number(),
  }),
  handler: async (ctx) => {
    let deletedUsers = 0;
    let deletedAccounts = 0;
    let deletedSessions = 0;

    // Delete all authAccounts
    const accounts = await ctx.db.query("authAccounts").collect();
    for (const account of accounts) {
      await ctx.db.delete(account._id);
      deletedAccounts++;
    }

    // Delete all authSessions
    const sessions = await ctx.db.query("authSessions").collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
      deletedSessions++;
    }

    // Delete all users
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
      deletedUsers++;
    }

    return { deletedUsers, deletedAccounts, deletedSessions };
  },
});

import { v } from "convex/values";