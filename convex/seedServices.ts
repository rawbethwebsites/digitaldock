import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./users";

/**
 * Seed the 4 initial services from the PRD (section 1.4) into the live database.
 * Admin-only. Only seeds if no published services exist yet.
 */
export const seedInitialServices = mutation({
  args: {},
  returns: v.object({
    created: v.number(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);

    // Check if services already exist
    const existing = await ctx.db
      .query("services")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    if (existing.length > 0) {
      return { created: 0, message: "Services already exist" };
    }

    // Get category IDs
    const categories = await ctx.db.query("categories").collect();
    const catMap = new Map(categories.map((c) => [c.slug, c._id]));

    const socialGrowth = catMap.get("social-growth-services");
    const socialProfile = catMap.get("social-profile-services");
    const content = catMap.get("content-services");
    const accountSetup = catMap.get("account-setup");

    if (!socialGrowth || !socialProfile || !content || !accountSetup) {
      return { created: 0, message: "Categories not seeded. Run seedInitialData first." };
    }

    const now = Date.now();
    const services = [
      {
        categoryId: socialGrowth,
        title: "Instagram Growth & Engagement Audit",
        slug: "instagram-growth-audit",
        shortSummary:
          "Actionable profile hooks, content strategy teardown, and non-banned organic reach playbook.",
        description:
          "A comprehensive audit of your Instagram presence covering profile optimization, content strategy, hashtag research, and organic growth tactics that comply with Meta's platform policies. No fake followers, no bots — just legitimate, sustainable growth recommendations.",
        deliverables: [
          "10+ page audit report (PDF)",
          "Bio, highlights, & grid restructuring plan",
          "30-day organic content calendar outline",
        ],
        exclusions: [
          "No fake followers or bot accounts",
          "No automated engagement services",
          "Does not include content creation or posting",
        ],
        price: 49,
        currency: "USD",
        turnaroundDays: 3,
        refundTerms:
          "Full refund available if the audit has not been started. Partial refund (50%) if the audit is in progress but not yet delivered. No refund after delivery of the audit document.",
        requirementsSchema: [
          {
            id: "instagram_handle",
            label: "Your Instagram Handle/Username",
            type: "text" as const,
            required: true,
            placeholder: "@yourbrand",
          },
          {
            id: "current_followers",
            label: "Current Follower Count (approximate)",
            type: "text" as const,
            required: true,
            placeholder: "e.g. 1,200",
          },
          {
            id: "goals",
            label: "What are your top 2 growth goals?",
            type: "textarea" as const,
            required: true,
            placeholder: "e.g. Increase engagement rate, reach 10K followers organically",
          },
          {
            id: "niche",
            label: "Your Content Niche",
            type: "select" as const,
            required: true,
            options: ["Fashion/Beauty", "Fitness/Health", "Business/Finance", "Food/Lifestyle", "Tech/Gaming", "Other"],
          },
        ],
        status: "published" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        categoryId: socialProfile,
        title: "Instagram Professional Profile Setup",
        slug: "instagram-profile-setup",
        shortSummary:
          "Full configuration of customer-owned account with branded bio, custom highlight covers, and security hardening.",
        description:
          "Complete setup and optimization of your customer-owned Instagram account. We configure your profile with a branded bio, create custom highlight covers, set up business account features, and provide 2FA security guidance. You retain full ownership and control of the account.",
        deliverables: [
          "Optimized bio & SEO search keywords",
          "5 custom icon highlight covers (Figma/PNG)",
          "Account category & 2FA guidance",
        ],
        exclusions: [
          "We do not create accounts on your behalf",
          "We do not request your password — you complete all login steps",
          "No content creation included",
        ],
        price: 79,
        currency: "USD",
        turnaroundDays: 2,
        refundTerms:
          "Full refund if setup has not started. 50% refund if configuration is in progress. No refund after delivery of all deliverables.",
        requirementsSchema: [
          {
            id: "instagram_handle",
            label: "Your Instagram Handle/Username",
            type: "text" as const,
            required: true,
            placeholder: "@yourbrand",
          },
          {
            id: "brand_name",
            label: "Brand or Display Name",
            type: "text" as const,
            required: true,
            placeholder: "Your Brand Name",
          },
          {
            id: "color_preferences",
            label: "Brand Color Preferences (hex codes or description)",
            type: "textarea" as const,
            required: false,
            placeholder: "e.g. #EA6113 orange, #1a1210 dark, minimal style",
          },
          {
            id: "highlight_categories",
            label: "What 5 highlight categories do you want?",
            type: "textarea" as const,
            required: true,
            placeholder: "e.g. About, Services, Reviews, Portfolio, FAQ",
          },
        ],
        status: "published" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        categoryId: content,
        title: "Social Content Starter Pack (15 Posts)",
        slug: "social-content-starter-pack",
        shortSummary:
          "Bespoke creative concepts, high-converting captions, and hashtag strategy tailored to your niche.",
        description:
          "A starter content pack designed to give you 15 ready-to-publish post concepts with captions, visual prompts, and hashtag clusters. Perfect for new accounts or creators looking to refresh their content strategy with professional-grade material.",
        deliverables: [
          "15 unique post concepts & visual prompts",
          "Ready-to-publish captions with hook variations",
          "Curated research hashtag clusters",
        ],
        exclusions: [
          "Does not include graphic design or image creation",
          "Does not include scheduling or posting services",
          "Single platform only (specify at checkout)",
        ],
        price: 129,
        currency: "USD",
        turnaroundDays: 4,
        refundTerms:
          "Full refund if content pack has not been started. 50% refund if in progress. No refund after delivery of all 15 post concepts.",
        requirementsSchema: [
          {
            id: "platform",
            label: "Which platform is this for?",
            type: "select" as const,
            required: true,
            options: ["Instagram", "TikTok", "LinkedIn", "Twitter/X", "Facebook"],
          },
          {
            id: "niche",
            label: "Your Content Niche",
            type: "text" as const,
            required: true,
            placeholder: "e.g. sustainable fashion, indie game dev, personal finance",
          },
          {
            id: "tone",
            label: "Preferred Content Tone",
            type: "select" as const,
            required: true,
            options: ["Professional", "Casual/Friendly", "Bold/Edgy", "Educational", "Humorous"],
          },
          {
            id: "target_audience",
            label: "Describe your target audience",
            type: "textarea" as const,
            required: true,
            placeholder: "e.g. Women 25-35 interested in wellness and self-care",
          },
        ],
        status: "published" as const,
        createdAt: now,
        updatedAt: now,
      },
      {
        categoryId: accountSetup,
        title: "Customer-Owned Business Account Setup",
        slug: "business-account-setup",
        shortSummary:
          "Guided setup and technical validation for platform business accounts, verified links, and business manager integrations.",
        description:
          "Guided technical setup for customer-owned business accounts across major platforms. We walk you through Business Manager configuration, domain verification, role delegation, and permission management. You own the account and complete all authentication steps yourself.",
        deliverables: [
          "Business Manager / platform link verification",
          "Domain DNS verification guidance",
          "Role & permission delegation walkthrough",
        ],
        exclusions: [
          "We do not create accounts or access them on your behalf",
          "No password sharing required — guided setup only",
          "Platform-specific fees (e.g. Meta verification) not included",
        ],
        price: 99,
        currency: "USD",
        turnaroundDays: 2,
        refundTerms:
          "Full refund if guidance has not started. 50% refund if in progress. No refund after delivery of the walkthrough document.",
        requirementsSchema: [
          {
            id: "platform",
            label: "Which platform needs business account setup?",
            type: "select" as const,
            required: true,
            options: ["Instagram/Meta", "Google Business", "LinkedIn", "TikTok Business", "Other"],
          },
          {
            id: "business_name",
            label: "Legal Business Name",
            type: "text" as const,
            required: true,
            placeholder: "Your LLC or registered business name",
          },
          {
            id: "website",
            label: "Business Website URL (if you have one)",
            type: "url" as const,
            required: false,
            placeholder: "https://yourbusiness.com",
          },
          {
            id: "current_setup",
            label: "What do you already have set up?",
            type: "textarea" as const,
            required: true,
            placeholder: "e.g. Personal IG account, no business manager yet, domain registered with Cloudflare",
          },
        ],
        status: "published" as const,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const service of services) {
      await ctx.db.insert("services", service);
    }

    return {
      created: services.length,
      message: `Seeded ${services.length} services successfully`,
    };
  },
});