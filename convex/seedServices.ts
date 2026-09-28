import { mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { requireAdmin } from "./users";

/**
 * One-time pristine-deployment bootstrap.
 *
 * Seeds the 5 categories + 4 initial services together, but ONLY while the
 * deployment is completely empty (zero users, zero services, zero categories).
 * The moment any account is created, this window closes permanently, so there
 * is no path to re-inject data or escalate later. The content is identical
 * static PRD data with no secrets — running it during the open window is
 * harmless and idempotent-by-guard (it refuses once anything exists).
 */
export const bootstrapSeed = mutation({
  args: {},
  returns: v.object({
    createdCategories: v.number(),
    createdServices: v.number(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    const [users, services, categories] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("services").collect(),
      ctx.db.query("categories").collect(),
    ]);

    // Pristine-window guard: refuse unless the whole database is empty.
    if (users.length > 0 || services.length > 0 || categories.length > 0) {
      return {
        createdCategories: 0,
        createdServices: 0,
        message: "Bootstrap window closed — database already has data. Use admin:seedInitialServices / admin operations instead.",
      };
    }

    const now = Date.now();

    // --- Seed categories ---
    const categoryDefs = [
      { name: "Social Profile Services", slug: "social-profile-services", description: "Configuration and optimization of customer-owned social profiles", sortOrder: 1, status: "active" as const },
      { name: "Social Growth Services", slug: "social-growth-services", description: "Actionable audits, content recommendations, and ethical growth strategies", sortOrder: 2, status: "active" as const },
      { name: "Content Services", slug: "content-services", description: "High-quality captions, concept boards, and digital creative starter packs", sortOrder: 3, status: "active" as const },
      { name: "Account Setup", slug: "account-setup", description: "Guided technical configuration and setup for customer-owned accounts", sortOrder: 4, status: "active" as const },
      { name: "Phone-related services", slug: "phone-related-services", description: "Pending supplier and compliance review (Disabled for MVP)", sortOrder: 5, status: "disabled" as const },
    ];

    const catIds: Record<string, string> = {};
    for (const cat of categoryDefs) {
      const catId = await ctx.db.insert("categories", { ...cat, createdAt: now, updatedAt: now });
      catIds[cat.slug] = catId as unknown as string;
    }

    // --- Seed services ---
    const socialGrowth = catIds["social-growth-services"];
    const socialProfile = catIds["social-profile-services"];
    const content = catIds["content-services"];
    const accountSetup = catIds["account-setup"];

    const serviceDefs = [
      {
        categoryId: socialGrowth,
        title: "Instagram Growth & Engagement Audit",
        slug: "instagram-growth-audit",
        shortSummary: "Actionable profile hooks, content strategy teardown, and non-banned organic reach playbook.",
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
          { id: "instagram_handle", label: "Your Instagram Handle/Username", type: "text", required: true, placeholder: "@yourbrand" },
          { id: "current_followers", label: "Current Follower Count (approximate)", type: "text", required: true, placeholder: "e.g. 1,200" },
          { id: "goals", label: "What are your top 2 growth goals?", type: "textarea", required: true, placeholder: "e.g. Increase engagement rate, reach 10K followers organically" },
          { id: "niche", label: "Your Content Niche", type: "select", required: true, options: ["Fashion/Beauty", "Fitness/Health", "Business/Finance", "Food/Lifestyle", "Tech/Gaming", "Other"] },
        ],
      },
      {
        categoryId: socialProfile,
        title: "Instagram Professional Profile Setup",
        slug: "instagram-profile-setup",
        shortSummary: "Turn a personal Instagram into a polished, credible professional profile.",
        description:
          "We rebuild your Instagram profile for trust and clarity: professional bio, avatar guidance, link strategy, highlights, and grid curation that positions you as a serious business. Legitimate setup only — no followers, likes, or automation.",
        deliverables: [
          "Professional bio + CTA writing",
          "Highlight cover structure (5-8 categories)",
          "Pinned post + link strategy document",
        ],
        exclusions: [
          "No follower or like purchasing",
          "No automated posting",
          "Does not create new audience",
        ],
        price: 79,
        currency: "USD",
        turnaroundDays: 5,
        refundTerms:
          "Full refund before setup work begins. No refund after the setup brief is shared with you.",
        requirementsSchema: [
          { id: "instagram_handle", label: "Your Instagram Handle/Username", type: "text", required: true, placeholder: "@yourbrand" },
          { id: "business_name", label: "Your Business/Personal Brand Name", type: "text", required: true, placeholder: "e.g. Northside Coffee" },
          { id: "target_audience", label: "Who do you want to attract?", type: "textarea", required: true, placeholder: "Describe your ideal customers..." },
        ],
      },
      {
        categoryId: content,
        title: "Social Content Starter Pack",
        slug: "social-content-starter-pack",
        shortSummary: "A launch-ready batch of captions and content concepts you can post immediately.",
        description:
          "A focused pack of original, brand-aligned captions and post concepts for your social channels — written by us, fully yours to use. Includes hashtags and posting guidance. No AI-spam, no engagement manipulation.",
        deliverables: [
          "10 original captions (mixed formats)",
          "5 content concept boards (image)",
          "Hashtag set per post (3 tiers)",
        ],
        exclusions: [
          "Does not include graphic design of images",
          "No automated posting to platforms",
          "No paid ad placement",
        ],
        price: 129,
        currency: "USD",
        turnaroundDays: 7,
        refundTerms:
          "Full refund if no content has been drafted. No refund once the starter pack is delivered.",
        requirementsSchema: [
          { id: "brand_voice", label: "Describe your brand voice", type: "textarea", required: true, placeholder: "e.g. Friendly, witty, professional..." },
          { id: "topics", label: "Which topics/offerings to feature?", type: "textarea", required: true, placeholder: "List 3-5 topics or products" },
          { id: "platforms", label: "Target platforms", type: "select", required: true, options: ["Instagram", "TikTok", "YouTube", "X / Twitter", "LinkedIn"] },
        ],
      },
      {
        categoryId: accountSetup,
        title: "Business Account Setup & Link Strategy",
        slug: "business-account-setup",
        shortSummary: "Get a clean, verified-looking account foundation with a working link ecosystem.",
        description:
          "We help you stand up the technical foundation of your professional presence: account verification prep, business manager / studio configuration guidance, and a link-in-bio structure that routes customers correctly. Legitimate configuration only.",
        deliverables: [
          "Business account setup checklist",
          "Link-in-bio structure (3-5 slots)",
          "Verification preparation guide",
        ],
        exclusions: [
          "No purchase of verification badges",
          "No third-party automation",
          "Does not manage your account day-to-day",
        ],
        price: 99,
        currency: "USD",
        turnaroundDays: 4,
        refundTerms:
          "Full refund before configuration guidance is delivered. No refund after delivery.",
        requirementsSchema: [
          { id: "primary_platform", label: "Primary platform to set up", type: "select", required: true, options: ["Instagram", "TikTok", "YouTube", "X / Twitter", "Facebook"] },
          { id: "existing_assets", label: "What do you already have set up?", type: "textarea", required: true, placeholder: "e.g. Personal IG account, no business manager yet, domain registered with Cloudflare" },
          { id: "website_url", label: "Your Website / Link URL", type: "url", required: false, placeholder: "https://yourbusiness.com" },
        ],
      },
    ];

    for (const def of serviceDefs) {
      await ctx.db.insert("services", {
        ...def,
        status: "published" as const,
        createdAt: now,
        updatedAt: now,
      } as any);
    }

    return {
      createdCategories: categoryDefs.length,
      createdServices: serviceDefs.length,
      message: `Bootstrapped ${categoryDefs.length} categories and ${serviceDefs.length} services on pristine deployment.`,
    };
  },
});

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