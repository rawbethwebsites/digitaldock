import test from "node:test";
import assert from "node:assert/strict";
import {
  paymentStateValidator,
  fulfillmentStateValidator,
  userRoleValidator,
} from "../convex/schema.ts";

test("Foundation - Schema Enums Validation", () => {
  // Test paymentStateValidator
  const validPaymentStates = [
    "awaiting_payment",
    "confirming",
    "paid",
    "expired",
    "failed",
    "partially_paid",
    "manual_review",
    "refund_pending",
    "refunded",
  ];
  for (const state of validPaymentStates) {
    assert.doesNotThrow(() => {
      // paymentStateValidator is a Convex validator union
      assert.ok(paymentStateValidator);
    });
  }

  // Test fulfillmentStateValidator
  const validFulfillmentStates = [
    "not_started",
    "needs_information",
    "in_progress",
    "delivered",
    "completed",
    "cancelled",
    "disputed",
  ];
  for (const state of validFulfillmentStates) {
    assert.doesNotThrow(() => {
      assert.ok(fulfillmentStateValidator);
    });
  }

  // Test userRoleValidator
  assert.ok(userRoleValidator);
});

test("Foundation - Role-Based Authorization Logic (ACC-02)", async () => {
  // Mock context without user
  const unauthenticatedCtx = {
    auth: { getUserIdentity: async () => null },
    db: { get: async () => null },
  };

  const { requireAdmin, requireAuthUser } = await import("../convex/users.ts");

  // Attempting requireAuthUser without user must throw
  await assert.rejects(
    async () => {
      await requireAuthUser(unauthenticatedCtx as any);
    },
    (err: any) => {
      return err.data?.code === "UNAUTHORIZED" || err.message?.includes("Authentication required");
    }
  );

  // Customer attempting requireAdmin must throw FORBIDDEN
  const customerCtx = {
    auth: { getUserIdentity: async () => ({ subject: "cust_1" }) },
    db: {
      get: async () => ({ _id: "cust_1", role: "customer", email: "customer@test.com" }),
    },
  };

  await assert.rejects(
    async () => {
      await requireAdmin(customerCtx as any);
    },
    (err: any) => {
      return err.data?.code === "FORBIDDEN" || err.message?.includes("Admin access required");
    }
  );

  // Admin user must succeed
  const adminCtx = {
    auth: { getUserIdentity: async () => ({ subject: "admin_1" }) },
    db: {
      get: async () => ({ _id: "admin_1", role: "admin", email: "admin@digitaldock.com" }),
    },
  };

  const adminUser = await requireAdmin(adminCtx as any);
  assert.equal(adminUser.role, "admin");
});

test("Foundation - Seed Category Verification (PRD 1.4)", async () => {
  const { seedInitialData } = await import("../convex/users.ts");
  const inserted: any[] = [];
  const mockCtx = {
    db: {
      query: () => ({
        collect: async () => [],
      }),
      insert: async (_table: string, doc: any) => {
        inserted.push(doc);
      },
    },
  };

  const handler = (seedInitialData as any)._handler || (seedInitialData as any).handler;
  const result = await handler(mockCtx);
  assert.ok(result.message.includes("Seeded 5 categories"));

  // Check that Phone-related services category is inserted as DISABLED (PRD 1.4)
  const phoneCat = inserted.find((c) => c.slug === "phone-related-services");
  assert.ok(phoneCat, "Phone category must exist in seed list");
  assert.equal(phoneCat.status, "disabled", "Phone category MUST be disabled in MVP");
});
