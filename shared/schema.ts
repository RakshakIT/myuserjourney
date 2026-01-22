import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").default(""),
  role: text("role").notNull().default("user"),
  authProvider: text("auth_provider").notNull().default("local"),
  isActive: boolean("is_active").notNull().default(true),
  subscriptionTier: text("subscription_tier").notNull().default("free"),
  subscriptionStatus: text("subscription_status").notNull().default("inactive"),
  stripeCustomerId: text("stripe_customer_id"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const passwordResets = pgTable("password_resets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: real("price").notNull(),
  currency: text("currency").notNull().default("GBP"),
  projectLimit: integer("project_limit").notNull(),
  features: text("features").array().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  stripePriceId: text("stripe_price_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentSettings = pgTable("payment_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull().default("stripe"),
  stripePublishableKey: text("stripe_publishable_key"),
  stripeSecretKey: text("stripe_secret_key"),
  stripeWebhookSecret: text("stripe_webhook_secret"),
  paypalClientId: text("paypal_client_id"),
  paypalSecretKey: text("paypal_secret_key"),
  isActive: boolean("is_active").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  googleClientId: text("google_client_id"),
  googleClientSecret: text("google_client_secret"),
  ga4PropertyId: text("ga4_property_id"),
  ga4MeasurementId: text("ga4_measurement_id"),
  gscSiteUrl: text("gsc_site_url"),
  trackingVerified: boolean("tracking_verified").default(false),
  trackingVerifiedAt: timestamp("tracking_verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  visitorId: varchar("visitor_id"),
  sessionId: varchar("session_id"),
  eventType: text("event_type").notNull(),
  page: text("page"),
  referrer: text("referrer"),
  device: text("device"),
  browser: text("browser"),
  os: text("os"),
  country: text("country"),
  city: text("city"),
  region: text("region"),
  ip: text("ip"),
  isBot: text("is_bot").default("false"),
  isInternal: text("is_internal").default("false"),
  isServer: text("is_server").default("false"),
  trafficSource: text("traffic_source"),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const internalIpRules = pgTable("internal_ip_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  ip: text("ip").notNull(),
  label: text("label"),
  ruleType: text("rule_type").notNull().default("exact"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const funnels = pgTable("funnels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const seoAnalyses = pgTable("seo_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  url: text("url").notNull(),
  score: integer("score").notNull(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  headingsCount: integer("headings_count"),
  imagesWithoutAlt: integer("images_without_alt"),
  internalLinks: integer("internal_links"),
  externalLinks: integer("external_links"),
  issues: jsonb("issues"),
  recommendations: jsonb("recommendations"),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

export const ppcCampaigns = pgTable("ppc_campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  budget: real("budget"),
  clicks: integer("clicks").notNull().default(0),
  impressions: integer("impressions").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  cost: real("cost").notNull().default(0),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customReports = pgTable("custom_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  metrics: text("metrics").array().notNull(),
  dimensions: text("dimensions").array().notNull(),
  chartType: text("chart_type").notNull().default("line"),
  dateRange: text("date_range").notNull().default("last_30_days"),
  filters: jsonb("filters"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const consentSettings = pgTable("consent_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().unique(),
  consentMode: text("consent_mode").notNull().default("opt-in"),
  anonymizeIp: text("anonymize_ip").notNull().default("true"),
  respectDnt: text("respect_dnt").notNull().default("true"),
  dataRetentionDays: integer("data_retention_days").notNull().default(365),
  cookielessMode: text("cookieless_mode").notNull().default("false"),
  bannerEnabled: text("banner_enabled").notNull().default("true"),
  bannerTitle: text("banner_title").notNull().default("We value your privacy"),
  bannerMessage: text("banner_message").notNull().default("We use cookies on our website to give you the most relevant experience by remembering your preferences and repeat visits. By clicking \"Accept All\", you consent to the use of ALL the cookies. However, you may visit \"Cookie Settings\" to provide a controlled consent."),
  bannerAcceptText: text("banner_accept_text").notNull().default("Accept All"),
  bannerDeclineText: text("banner_decline_text").notNull().default("Reject All"),
  bannerCustomiseText: text("banner_customise_text").notNull().default("Customise"),
  bannerSavePreferencesText: text("banner_save_preferences_text").notNull().default("Save My Preferences"),
  bannerPosition: text("banner_position").notNull().default("bottom"),
  bannerLayout: text("banner_layout").notNull().default("bar"),
  bannerTheme: text("banner_theme").notNull().default("auto"),
  bannerBgColor: text("banner_bg_color"),
  bannerTextColor: text("banner_text_color"),
  bannerBtnBgColor: text("banner_btn_bg_color"),
  bannerBtnTextColor: text("banner_btn_text_color"),
  bannerAcceptBgColor: text("banner_accept_bg_color"),
  bannerAcceptTextColor: text("banner_accept_text_color"),
  bannerBorderColor: text("banner_border_color"),
  bannerFontFamily: text("banner_font_family"),
  bannerFontSize: text("banner_font_size"),
  privacyPolicyUrl: text("privacy_policy_url"),
  granularConsent: text("granular_consent").notNull().default("true"),
  categoryAnalytics: text("category_analytics").notNull().default("true"),
  categoryFunctional: text("category_functional").notNull().default("false"),
  categoryPerformance: text("category_performance").notNull().default("false"),
  categoryMarketing: text("category_marketing").notNull().default("false"),
  categoryAdvertisement: text("category_advertisement").notNull().default("false"),
  categoryPersonalization: text("category_personalization").notNull().default("false"),
  categoryAnalyticsDesc: text("category_analytics_desc").default("Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc."),
  categoryFunctionalDesc: text("category_functional_desc").default("Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features."),
  categoryPerformanceDesc: text("category_performance_desc").default("Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors."),
  categoryMarketingDesc: text("category_marketing_desc").default("Marketing cookies are used to deliver relevant advertisements and measure campaign effectiveness."),
  categoryAdvertisementDesc: text("category_advertisement_desc").default("Advertisement cookies are used to provide visitors with customized advertisements based on the pages you visited previously and to analyze the effectiveness of the ad campaigns."),
  categoryPersonalizationDesc: text("category_personalization_desc").default("Personalisation cookies allow the site to remember your preferences and customise your experience."),
  showCookieList: text("show_cookie_list").notNull().default("true"),
  consentVersion: integer("consent_version").notNull().default(1),
  legalBasis: text("legal_basis").notNull().default("consent"),
  jurisdiction: text("jurisdiction").notNull().default("eu_uk"),
  useThirdPartyBanner: text("use_third_party_banner").notNull().default("false"),
  thirdPartyProvider: text("third_party_provider"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const consentRecords = pgTable("consent_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  visitorId: varchar("visitor_id").notNull(),
  consentGiven: text("consent_given").notNull().default("false"),
  consentTimestamp: timestamp("consent_timestamp").defaultNow().notNull(),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  consentVersion: integer("consent_version"),
  categoriesAccepted: text("categories_accepted"),
});

export const aiSettings = pgTable("ai_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  provider: text("provider").notNull().default("none"),
  apiKey: text("api_key"),
  model: text("model"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const registerUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSettingsSchema = createInsertSchema(paymentSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  timestamp: true,
});

export const insertSeoAnalysisSchema = createInsertSchema(seoAnalyses).omit({
  id: true,
  analyzedAt: true,
});

export const insertPpcCampaignSchema = createInsertSchema(ppcCampaigns).omit({
  id: true,
  createdAt: true,
});

export const insertCustomReportSchema = createInsertSchema(customReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConsentSettingsSchema = createInsertSchema(consentSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertConsentRecordSchema = createInsertSchema(consentRecords).omit({
  id: true,
  consentTimestamp: true,
});

export const insertAiSettingsSchema = createInsertSchema(aiSettings).omit({
  id: true,
});

export const insertInternalIpRuleSchema = createInsertSchema(internalIpRules).omit({
  id: true,
  createdAt: true,
});

export const customEventDefinitions = pgTable("custom_event_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("custom"),
  isAiBuilt: text("is_ai_built").notNull().default("false"),
  rules: jsonb("rules").notNull(),
  color: text("color"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomEventDefinitionSchema = createInsertSchema(customEventDefinitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFunnelSchema = createInsertSchema(funnels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export type InsertPaymentSettings = z.infer<typeof insertPaymentSettingsSchema>;
export type PaymentSettings = typeof paymentSettings.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertSeoAnalysis = z.infer<typeof insertSeoAnalysisSchema>;
export type SeoAnalysis = typeof seoAnalyses.$inferSelect;

export type InsertPpcCampaign = z.infer<typeof insertPpcCampaignSchema>;
export type PpcCampaign = typeof ppcCampaigns.$inferSelect;

export type InsertCustomReport = z.infer<typeof insertCustomReportSchema>;
export type CustomReport = typeof customReports.$inferSelect;

export type InsertConsentSettings = z.infer<typeof insertConsentSettingsSchema>;
export type ConsentSettings = typeof consentSettings.$inferSelect;

export type InsertConsentRecord = z.infer<typeof insertConsentRecordSchema>;
export type ConsentRecord = typeof consentRecords.$inferSelect;

export type InsertAiSettings = z.infer<typeof insertAiSettingsSchema>;
export type AiSettings = typeof aiSettings.$inferSelect;

export type InsertInternalIpRule = z.infer<typeof insertInternalIpRuleSchema>;
export type InternalIpRule = typeof internalIpRules.$inferSelect;

export type InsertFunnel = z.infer<typeof insertFunnelSchema>;
export type Funnel = typeof funnels.$inferSelect;

export type InsertCustomEventDefinition = z.infer<typeof insertCustomEventDefinitionSchema>;
export type CustomEventDefinition = typeof customEventDefinitions.$inferSelect;

export const googleIntegrations = pgTable("google_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  provider: text("provider").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  accountId: text("account_id"),
  propertyId: text("property_id"),
  siteUrl: text("site_url"),
  status: text("status").notNull().default("disconnected"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGoogleIntegrationSchema = createInsertSchema(googleIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertGoogleIntegration = z.infer<typeof insertGoogleIntegrationSchema>;
export type GoogleIntegration = typeof googleIntegrations.$inferSelect;

export const contentGapAnalyses = pgTable("content_gap_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  domain: text("domain").notNull(),
  keywords: jsonb("keywords").notNull(),
  contentGaps: jsonb("content_gaps").notNull(),
  competitors: jsonb("competitors").notNull(),
  blogTopics: jsonb("blog_topics").notNull(),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContentGapAnalysisSchema = createInsertSchema(contentGapAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertContentGapAnalysis = z.infer<typeof insertContentGapAnalysisSchema>;
export type ContentGapAnalysis = typeof contentGapAnalyses.$inferSelect;

export const projectLogos = pgTable("project_logos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  logoData: text("logo_data").notNull(),
  logoName: text("logo_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectLogoSchema = createInsertSchema(projectLogos).omit({
  id: true,
  createdAt: true,
});

export type InsertProjectLogo = z.infer<typeof insertProjectLogoSchema>;
export type ProjectLogo = typeof projectLogos.$inferSelect;

export const siteResearchReports = pgTable("site_research_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  domain: text("domain").notNull(),
  overview: jsonb("overview"),
  organicKeywords: jsonb("organic_keywords"),
  topPages: jsonb("top_pages"),
  backlinks: jsonb("backlinks"),
  competitors: jsonb("competitors"),
  paidKeywords: jsonb("paid_keywords"),
  internalLinks: jsonb("internal_links"),
  siteStructure: jsonb("site_structure"),
  opportunities: jsonb("opportunities"),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSiteResearchReportSchema = createInsertSchema(siteResearchReports).omit({
  id: true,
  createdAt: true,
});

export type InsertSiteResearchReport = z.infer<typeof insertSiteResearchReportSchema>;
export type SiteResearchReport = typeof siteResearchReports.$inferSelect;

export const predictiveAnalytics = pgTable("predictive_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  churnRiskScore: real("churn_risk_score").notNull(),
  churnDrivers: jsonb("churn_drivers").notNull(),
  revenueTrend: jsonb("revenue_trend").notNull(),
  conversionProbability: real("conversion_probability").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPredictiveAnalyticsSchema = createInsertSchema(predictiveAnalytics).omit({
  id: true,
  createdAt: true,
});

export type InsertPredictiveAnalytics = z.infer<typeof insertPredictiveAnalyticsSchema>;
export type PredictiveAnalytics = typeof predictiveAnalytics.$inferSelect;

export const uxAudits = pgTable("ux_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  score: integer("score").notNull(),
  slowPages: jsonb("slow_pages").notNull(),
  flowIssues: jsonb("flow_issues").notNull(),
  navigationIssues: jsonb("navigation_issues").notNull(),
  recommendations: jsonb("recommendations").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUxAuditSchema = createInsertSchema(uxAudits).omit({
  id: true,
  createdAt: true,
});

export type InsertUxAudit = z.infer<typeof insertUxAuditSchema>;
export type UxAudit = typeof uxAudits.$inferSelect;

export const marketingCopilotSessions = pgTable("marketing_copilot_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  prompt: text("prompt"),
  seoFixes: jsonb("seo_fixes").notNull(),
  ppcOptimizations: jsonb("ppc_optimizations").notNull(),
  uxImprovements: jsonb("ux_improvements").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMarketingCopilotSessionSchema = createInsertSchema(marketingCopilotSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertMarketingCopilotSession = z.infer<typeof insertMarketingCopilotSessionSchema>;
export type MarketingCopilotSession = typeof marketingCopilotSessions.$inferSelect;

export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  siteName: text("site_name").notNull().default("My User Journey"),
  siteTagline: text("site_tagline").default("AI-Powered Analytics"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  contactEmail: text("contact_email"),
  footerText: text("footer_text"),
  primaryColor: text("primary_color"),
  customCss: text("custom_css"),
  customHeaderScripts: text("custom_header_scripts"),
  customFooterScripts: text("custom_footer_scripts"),
  socialTwitter: text("social_twitter"),
  socialLinkedin: text("social_linkedin"),
  socialGithub: text("social_github"),
  googleAnalyticsId: text("google_analytics_id"),
  googleTagManagerId: text("google_tag_manager_id"),
  googleSearchConsoleCode: text("google_search_console_code"),
  googleAdsId: text("google_ads_id"),
  googleAdsConversionLabel: text("google_ads_conversion_label"),
  facebookPixelId: text("facebook_pixel_id"),
  facebookConversionsApiToken: text("facebook_conversions_api_token"),
  microsoftAdsId: text("microsoft_ads_id"),
  tiktokPixelId: text("tiktok_pixel_id"),
  linkedinInsightTagId: text("linkedin_insight_tag_id"),
  pinterestTagId: text("pinterest_tag_id"),
  snapchatPixelId: text("snapchat_pixel_id"),
  twitterPixelId: text("twitter_pixel_id"),
  bingVerificationCode: text("bing_verification_code"),
  yandexVerificationCode: text("yandex_verification_code"),
  hotjarSiteId: text("hotjar_site_id"),
  clarityProjectId: text("clarity_project_id"),
  customTrackingHead: text("custom_tracking_head"),
  customTrackingBody: text("custom_tracking_body"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;

export const cmsPages = pgTable("cms_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull().default(""),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  ogImage: text("og_image"),
  customScripts: text("custom_scripts"),
  status: text("status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  showInNav: boolean("show_in_nav").notNull().default(false),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCmsPageSchema = createInsertSchema(cmsPages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCmsPage = z.infer<typeof insertCmsPageSchema>;
export type CmsPage = typeof cmsPages.$inferSelect;

export const cmsFiles = pgTable("cms_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  uploadedBy: varchar("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCmsFileSchema = createInsertSchema(cmsFiles).omit({
  id: true,
  createdAt: true,
});

export type InsertCmsFile = z.infer<typeof insertCmsFileSchema>;
export type CmsFile = typeof cmsFiles.$inferSelect;

export const smtpSettings = pgTable("smtp_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  host: text("host").notNull().default(""),
  port: integer("port").notNull().default(587),
  username: text("username").notNull().default(""),
  password: text("password").notNull().default(""),
  encryption: text("encryption").notNull().default("tls"),
  fromEmail: text("from_email").notNull().default(""),
  fromName: text("from_name").notNull().default(""),
  isActive: boolean("is_active").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSmtpSettingsSchema = createInsertSchema(smtpSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertSmtpSettings = z.infer<typeof insertSmtpSettingsSchema>;
export type SmtpSettings = typeof smtpSettings.$inferSelect;

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  feature: text("feature").notNull(),
  model: text("model").notNull().default("gpt-4o-mini"),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  costUsd: real("cost_usd").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAiUsageLogSchema = createInsertSchema(aiUsageLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAiUsageLog = z.infer<typeof insertAiUsageLogSchema>;
export type AiUsageLog = typeof aiUsageLogs.$inferSelect;

export const stripeCustomers = pgTable("stripe_customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStripeCustomerSchema = createInsertSchema(stripeCustomers).omit({
  id: true,
  createdAt: true,
});

export type InsertStripeCustomer = z.infer<typeof insertStripeCustomerSchema>;
export type StripeCustomer = typeof stripeCustomers.$inferSelect;

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  stripeInvoiceId: text("stripe_invoice_id"),
  amountUsd: real("amount_usd").notNull(),
  amountGbp: real("amount_gbp"),
  status: text("status").notNull().default("pending"),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
