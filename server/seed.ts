import { storage } from "./storage";
import { db } from "./db";
import { projects, events, seoAnalyses, ppcCampaigns, subscriptionPlans } from "@shared/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seedPlans() {
  const existingPlans = await storage.getSubscriptionPlans();
  if (existingPlans.length > 0) return;

  console.log("Seeding subscription plans...");

  await storage.createSubscriptionPlan({
    name: "Starter",
    slug: "starter",
    price: 5,
    currency: "GBP",
    projectLimit: 1,
    features: ["1 Project", "Core Analytics", "Real-time Dashboard", "Email Support", "CSV/JSON Export"],
    isActive: true,
    sortOrder: 1,
  });

  await storage.createSubscriptionPlan({
    name: "Professional",
    slug: "professional",
    price: 10,
    currency: "GBP",
    projectLimit: 4,
    features: ["Up to 4 Projects", "Advanced Analytics", "AI Copilot", "SEO Analysis", "Custom Reports", "Priority Support"],
    isActive: true,
    sortOrder: 2,
  });

  await storage.createSubscriptionPlan({
    name: "Enterprise",
    slug: "enterprise",
    price: 50,
    currency: "GBP",
    projectLimit: -1,
    features: ["Unlimited Projects", "Full Analytics Suite", "AI Copilot Pro", "PPC Management", "White-label Options", "Dedicated Support", "Custom Integrations"],
    isActive: true,
    sortOrder: 3,
  });
}

async function seedAdminUser() {
  const existingAdmin = await storage.getUserByEmail("admin@analytics.io");
  if (existingAdmin) return;

  console.log("Creating admin user...");
  const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!defaultPassword) {
    console.warn("WARNING: ADMIN_DEFAULT_PASSWORD not set. Skipping admin user creation. Set this env var to create the default admin account.");
    return;
  }
  if (defaultPassword.length < 8) {
    console.warn("WARNING: ADMIN_DEFAULT_PASSWORD is too short (min 8 characters). Skipping admin user creation.");
    return;
  }
  const hashedPassword = await bcrypt.hash(defaultPassword, 12);
  console.log("Default admin created with email: admin@analytics.io — change the password immediately after first login.");
  await storage.createUser({
    username: "admin",
    email: "admin@analytics.io",
    password: hashedPassword,
  });
  const admin = await storage.getUserByEmail("admin@analytics.io");
  if (admin) {
    await storage.updateUser(admin.id, { role: "admin", subscriptionTier: "enterprise", subscriptionStatus: "active" });
  }
}

export async function seedDatabase() {
  await seedPlans();
  await seedAdminUser();

  const existingProjects = await storage.getProjects();
  if (existingProjects.length > 0) {
    return;
  }

  console.log("Seeding database with sample data...");

  const admin = await storage.getUserByEmail("admin@analytics.io");
  const adminId = admin?.id || "default";

  const project1 = await storage.createProject({
    userId: adminId,
    name: "TechStartup.io",
    domain: "techstartup.io",
    description: "Main company website with blog and product pages",
    status: "active",
  });

  const project2 = await storage.createProject({
    userId: adminId,
    name: "ShopWave Store",
    domain: "shopwave.com",
    description: "E-commerce platform selling digital products",
    status: "active",
  });

  const project3 = await storage.createProject({
    userId: adminId,
    name: "DevBlog Pro",
    domain: "devblog.pro",
    description: "Developer community blog and tutorials",
    status: "active",
  });

  const pages = ["/", "/about", "/products", "/blog", "/pricing", "/contact", "/docs", "/blog/seo-guide"];
  const devices = ["Desktop", "Mobile", "Tablet"];
  const browsers = ["Chrome", "Firefox", "Safari", "Edge"];
  const oses = ["Windows", "macOS", "Linux", "iOS", "Android"];
  const referrers = ["Google", "Direct", "Twitter", "LinkedIn", "Reddit", "GitHub"];
  const eventTypes = ["pageview", "click", "scroll", "form_submit", "hover"];

  for (const proj of [project1, project2, project3]) {
    for (let i = 0; i < 80; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const ts = new Date(Date.now() - daysAgo * 86400000 - Math.random() * 86400000);

      await storage.createEvent({
        projectId: proj.id,
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        page: pages[Math.floor(Math.random() * pages.length)],
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: oses[Math.floor(Math.random() * oses.length)],
        country: ["US", "UK", "DE", "FR", "CA", "AU"][Math.floor(Math.random() * 6)],
        metadata: {},
      });
    }
  }

  // Seed SEO analyses
  await storage.createSeoAnalysis({
    projectId: project1.id,
    url: "https://techstartup.io",
    score: 78,
    metaTitle: "TechStartup - Build Better Products",
    metaDescription: "Leading technology startup helping companies build better digital products with AI-powered solutions.",
    headingsCount: 8,
    imagesWithoutAlt: 2,
    internalLinks: 15,
    externalLinks: 5,
    issues: [
      { type: "images", label: "2 images missing alt text", severity: "warning" },
      { type: "performance", label: "Page loads in under 2 seconds", severity: "info" },
    ],
    recommendations: [
      "Add alt text to hero banner and team photo images",
      "Consider adding Schema.org structured data for Organization type",
      "Meta description is within optimal length range",
    ],
  });

  await storage.createSeoAnalysis({
    projectId: project1.id,
    url: "https://techstartup.io/blog",
    score: 85,
    metaTitle: "Blog - TechStartup",
    metaDescription: "Read the latest articles on technology, AI, and product development.",
    headingsCount: 12,
    imagesWithoutAlt: 0,
    internalLinks: 22,
    externalLinks: 8,
    issues: [
      { type: "meta", label: "All meta tags present and optimized", severity: "info" },
    ],
    recommendations: [
      "Great heading structure - well organized content",
      "Consider adding FAQ schema for popular articles",
    ],
  });

  // Seed PPC campaigns
  const campaignData = [
    { name: "Google Ads - Brand", utmSource: "google", utmMedium: "cpc", utmCampaign: "brand_2025", budget: 5000, clicks: 1250, impressions: 25000, conversions: 85, cost: 3200, status: "active" as const },
    { name: "Facebook Retargeting", utmSource: "facebook", utmMedium: "social", utmCampaign: "retarget_q1", budget: 3000, clicks: 890, impressions: 18500, conversions: 42, cost: 1800, status: "active" as const },
    { name: "LinkedIn B2B", utmSource: "linkedin", utmMedium: "cpc", utmCampaign: "b2b_outreach", budget: 2500, clicks: 420, impressions: 8900, conversions: 28, cost: 1950, status: "active" as const },
    { name: "Twitter Awareness", utmSource: "twitter", utmMedium: "social", utmCampaign: "awareness_jan", budget: 1000, clicks: 310, impressions: 12000, conversions: 8, cost: 650, status: "paused" as const },
  ];

  for (const c of campaignData) {
    await storage.createPpcCampaign({
      projectId: project1.id,
      ...c,
    });
  }

  await storage.createPpcCampaign({
    projectId: project2.id,
    name: "ShopWave - Product Launch",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "product_launch_2025",
    budget: 8000,
    clicks: 2100,
    impressions: 45000,
    conversions: 156,
    cost: 5200,
    status: "active",
  });

  console.log("Seed data created successfully");
}
