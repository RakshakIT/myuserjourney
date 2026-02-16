import { eq, desc, and, sql, count, gte, lte, sum } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  projects,
  events,
  seoAnalyses,
  ppcCampaigns,
  customReports,
  consentSettings,
  consentRecords,
  aiSettings,
  internalIpRules,
  funnels,
  customEventDefinitions,
  subscriptionPlans,
  paymentSettings,
  contentGapAnalyses,
  projectLogos,
  siteResearchReports,
  type User,
  type InsertUser,
  type Project,
  type InsertProject,
  type Event,
  type InsertEvent,
  type SeoAnalysis,
  type InsertSeoAnalysis,
  type PpcCampaign,
  type InsertPpcCampaign,
  type CustomReport,
  type InsertCustomReport,
  type ConsentSettings,
  type InsertConsentSettings,
  type ConsentRecord,
  type InsertConsentRecord,
  type AiSettings,
  type InsertAiSettings,
  type InternalIpRule,
  type InsertInternalIpRule,
  type Funnel,
  type InsertFunnel,
  type CustomEventDefinition,
  type InsertCustomEventDefinition,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type PaymentSettings,
  type InsertPaymentSettings,
  type ContentGapAnalysis,
  type InsertContentGapAnalysis,
  type ProjectLogo,
  type InsertProjectLogo,
  type SiteResearchReport,
  type InsertSiteResearchReport,
  predictiveAnalytics,
  uxAudits,
  marketingCopilotSessions,
  type PredictiveAnalytics,
  type InsertPredictiveAnalytics,
  type UxAudit,
  type InsertUxAudit,
  type MarketingCopilotSession,
  type InsertMarketingCopilotSession,
  googleIntegrations,
  type GoogleIntegration,
  type InsertGoogleIntegration,
  siteSettings,
  cmsPages,
  cmsFiles,
  smtpSettings,
  contactSubmissions,
  passwordResets,
  type SiteSettings,
  type InsertSiteSettings,
  type CmsPage,
  type InsertCmsPage,
  type CmsFile,
  type InsertCmsFile,
  type SmtpSettings,
  type InsertSmtpSettings,
  type ContactSubmission,
  type InsertContactSubmission,
  aiUsageLogs,
  stripeCustomers,
  invoices,
  type AiUsageLog,
  type InsertAiUsageLog,
  type StripeCustomer,
  type InsertStripeCustomer,
  type Invoice,
  type InsertInvoice,
  quizTopics,
  quizQuestions,
  quizAttempts,
  badges,
  userBadges,
  type QuizTopic,
  type QuizQuestion,
  type QuizAttempt,
  type InsertQuizAttempt,
  type Badge,
  type UserBadge,
  type InsertUserBadge,
  blogPosts,
  guidesContent,
  caseStudiesContent,
  helpArticles,
  type BlogPost,
  type InsertBlogPost,
  type Guide,
  type InsertGuide,
  type CaseStudy,
  type InsertCaseStudy,
  type HelpArticle,
  type InsertHelpArticle,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  getUserProjectCount(userId: string): Promise<number>;

  getProjects(userId?: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, data: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(projectId: string, limit?: number): Promise<Event[]>;
  getAnalyticsSummary(projectId: string): Promise<any>;
  getEventsByDateRange(projectId: string, from: Date, to: Date): Promise<Event[]>;
  getFilteredEvents(projectId: string, filters: EventFilters): Promise<Event[]>;

  getSeoAnalyses(projectId: string): Promise<SeoAnalysis[]>;
  createSeoAnalysis(analysis: InsertSeoAnalysis): Promise<SeoAnalysis>;

  getPpcCampaigns(projectId: string): Promise<PpcCampaign[]>;
  createPpcCampaign(campaign: InsertPpcCampaign): Promise<PpcCampaign>;

  getCustomReports(projectId: string): Promise<CustomReport[]>;
  getCustomReport(id: string): Promise<CustomReport | undefined>;
  createCustomReport(report: InsertCustomReport): Promise<CustomReport>;
  updateCustomReport(id: string, report: Partial<InsertCustomReport>): Promise<CustomReport>;
  deleteCustomReport(id: string): Promise<void>;

  getConsentSettings(projectId: string): Promise<ConsentSettings | undefined>;
  upsertConsentSettings(settings: InsertConsentSettings): Promise<ConsentSettings>;
  createConsentRecord(record: InsertConsentRecord): Promise<ConsentRecord>;
  getConsentRecords(projectId: string, visitorId?: string): Promise<ConsentRecord[]>;
  deleteVisitorData(projectId: string, visitorId: string): Promise<{ eventsDeleted: number; consentsDeleted: number }>;
  getVisitorData(projectId: string, visitorId: string): Promise<{ events: Event[]; consents: ConsentRecord[] }>;
  purgeOldEvents(projectId: string, retentionDays: number): Promise<number>;

  getAiSettings(userId: string): Promise<AiSettings | undefined>;
  upsertAiSettings(settings: InsertAiSettings): Promise<AiSettings>;

  getInternalIpRules(projectId: string): Promise<InternalIpRule[]>;
  createInternalIpRule(rule: InsertInternalIpRule): Promise<InternalIpRule>;
  deleteInternalIpRule(id: string): Promise<void>;

  getFunnels(projectId: string): Promise<Funnel[]>;
  getFunnel(id: string): Promise<Funnel | undefined>;
  createFunnel(funnel: InsertFunnel): Promise<Funnel>;
  updateFunnel(id: string, funnel: Partial<InsertFunnel>): Promise<Funnel>;
  deleteFunnel(id: string): Promise<void>;

  getCustomEventDefinitions(projectId: string): Promise<CustomEventDefinition[]>;
  getCustomEventDefinition(id: string): Promise<CustomEventDefinition | undefined>;
  createCustomEventDefinition(def: InsertCustomEventDefinition): Promise<CustomEventDefinition>;
  updateCustomEventDefinition(id: string, def: Partial<InsertCustomEventDefinition>): Promise<CustomEventDefinition>;
  deleteCustomEventDefinition(id: string): Promise<void>;

  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: string, data: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan>;
  deleteSubscriptionPlan(id: string): Promise<void>;

  getPaymentSettings(): Promise<PaymentSettings | undefined>;
  upsertPaymentSettings(settings: InsertPaymentSettings): Promise<PaymentSettings>;

  getContentGapAnalyses(projectId: string): Promise<ContentGapAnalysis[]>;
  createContentGapAnalysis(analysis: InsertContentGapAnalysis): Promise<ContentGapAnalysis>;
  deleteContentGapAnalysis(id: string): Promise<void>;

  getProjectLogo(projectId: string): Promise<ProjectLogo | undefined>;
  upsertProjectLogo(logo: InsertProjectLogo): Promise<ProjectLogo>;
  deleteProjectLogo(projectId: string): Promise<void>;

  getSiteResearchReports(userId: string): Promise<SiteResearchReport[]>;
  getSiteResearchReport(id: string): Promise<SiteResearchReport | undefined>;
  createSiteResearchReport(report: InsertSiteResearchReport): Promise<SiteResearchReport>;
  deleteSiteResearchReport(id: string): Promise<void>;

  transferProjectOwnership(projectId: string, newUserId: string): Promise<Project>;
  getUserByEmail(email: string): Promise<User | undefined>;

  getPredictiveAnalyses(projectId: string): Promise<PredictiveAnalytics[]>;
  createPredictiveAnalysis(data: InsertPredictiveAnalytics): Promise<PredictiveAnalytics>;
  deletePredictiveAnalysis(id: string): Promise<void>;

  getUxAudits(projectId: string): Promise<UxAudit[]>;
  createUxAudit(data: InsertUxAudit): Promise<UxAudit>;
  deleteUxAudit(id: string): Promise<void>;

  getMarketingCopilotSessions(projectId: string): Promise<MarketingCopilotSession[]>;
  createMarketingCopilotSession(data: InsertMarketingCopilotSession): Promise<MarketingCopilotSession>;
  deleteMarketingCopilotSession(id: string): Promise<void>;

  getGoogleIntegration(projectId: string, provider: string): Promise<GoogleIntegration | undefined>;
  getGoogleIntegrations(projectId: string): Promise<GoogleIntegration[]>;
  upsertGoogleIntegration(data: InsertGoogleIntegration): Promise<GoogleIntegration>;
  deleteGoogleIntegration(projectId: string, provider: string): Promise<void>;

  getSiteSettings(): Promise<SiteSettings | undefined>;
  upsertSiteSettings(data: Partial<InsertSiteSettings>): Promise<SiteSettings>;

  getCmsPages(): Promise<CmsPage[]>;
  getCmsPage(id: string): Promise<CmsPage | undefined>;
  getCmsPageBySlug(slug: string): Promise<CmsPage | undefined>;
  createCmsPage(page: InsertCmsPage): Promise<CmsPage>;
  updateCmsPage(id: string, data: Partial<InsertCmsPage>): Promise<CmsPage>;
  deleteCmsPage(id: string): Promise<void>;

  getCmsFiles(): Promise<CmsFile[]>;
  getCmsFile(id: string): Promise<CmsFile | undefined>;
  createCmsFile(file: InsertCmsFile): Promise<CmsFile>;
  deleteCmsFile(id: string): Promise<void>;

  getSmtpSettings(): Promise<SmtpSettings | undefined>;
  upsertSmtpSettings(data: Partial<InsertSmtpSettings>): Promise<SmtpSettings>;

  getContactSubmissions(): Promise<ContactSubmission[]>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  updateContactSubmission(id: string, data: Partial<ContactSubmission>): Promise<ContactSubmission>;
  deleteContactSubmission(id: string): Promise<void>;

  deleteUser(id: string): Promise<void>;

  createPasswordReset(userId: string, token: string, expiresAt: Date): Promise<void>;
  getPasswordResetByToken(token: string): Promise<{ id: string; userId: string; token: string; expiresAt: Date; used: boolean } | undefined>;
  markPasswordResetUsed(id: string): Promise<void>;

  logAiUsage(data: InsertAiUsageLog): Promise<AiUsageLog>;
  getAiUsageLogs(userId: string, from?: Date, to?: Date): Promise<AiUsageLog[]>;
  getAiUsageTotalCost(userId: string, from?: Date, to?: Date): Promise<number>;

  getStripeCustomer(userId: string): Promise<StripeCustomer | undefined>;
  createStripeCustomer(data: InsertStripeCustomer): Promise<StripeCustomer>;

  getInvoices(userId: string): Promise<Invoice[]>;
  createInvoice(data: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice>;

  getQuizTopics(): Promise<QuizTopic[]>;
  getQuizQuestions(topicId: string): Promise<QuizQuestion[]>;
  getQuizAttempts(userId: string): Promise<QuizAttempt[]>;
  createQuizAttempt(data: InsertQuizAttempt): Promise<QuizAttempt>;
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]>;
  awardBadge(data: InsertUserBadge): Promise<UserBadge>;
  hasUserBadge(userId: string, badgeId: string): Promise<boolean>;

  getBlogPosts(publishedOnly?: boolean): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;

  getGuides(publishedOnly?: boolean): Promise<Guide[]>;
  getGuide(id: string): Promise<Guide | undefined>;
  getGuideBySlug(slug: string): Promise<Guide | undefined>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(id: string, data: Partial<InsertGuide>): Promise<Guide>;
  deleteGuide(id: string): Promise<void>;

  getCaseStudies(publishedOnly?: boolean): Promise<CaseStudy[]>;
  getCaseStudy(id: string): Promise<CaseStudy | undefined>;
  getCaseStudyBySlug(slug: string): Promise<CaseStudy | undefined>;
  createCaseStudy(cs: InsertCaseStudy): Promise<CaseStudy>;
  updateCaseStudy(id: string, data: Partial<InsertCaseStudy>): Promise<CaseStudy>;
  deleteCaseStudy(id: string): Promise<void>;

  getHelpArticles(publishedOnly?: boolean): Promise<HelpArticle[]>;
  getHelpArticle(id: string): Promise<HelpArticle | undefined>;
  getHelpArticleBySlug(slug: string): Promise<HelpArticle | undefined>;
  createHelpArticle(article: InsertHelpArticle): Promise<HelpArticle>;
  updateHelpArticle(id: string, data: Partial<InsertHelpArticle>): Promise<HelpArticle>;
  deleteHelpArticle(id: string): Promise<void>;
}

export interface EventFilters {
  from?: string;
  to?: string;
  eventType?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  referrer?: string;
  isBot?: string;
  isInternal?: string;
  isServer?: string;
  trafficSource?: string;
  page?: string;
  visitorId?: string;
  limit?: number;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async getUserProjectCount(userId: string): Promise<number> {
    const [result] = await db.select({ count: count() }).from(projects).where(eq(projects.userId, userId));
    return result?.count ?? 0;
  }

  async getProjects(userId?: string): Promise<Project[]> {
    if (userId) {
      return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
    }
    return db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const [updated] = await db.update(projects).set(data).where(eq(projects.id, id)).returning();
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(events).where(eq(events.projectId, id));
    await db.delete(seoAnalyses).where(eq(seoAnalyses.projectId, id));
    await db.delete(ppcCampaigns).where(eq(ppcCampaigns.projectId, id));
    await db.delete(customReports).where(eq(customReports.projectId, id));
    await db.delete(consentSettings).where(eq(consentSettings.projectId, id));
    await db.delete(consentRecords).where(eq(consentRecords.projectId, id));
    await db.delete(internalIpRules).where(eq(internalIpRules.projectId, id));
    await db.delete(funnels).where(eq(funnels.projectId, id));
    await db.delete(customEventDefinitions).where(eq(customEventDefinitions.projectId, id));
    await db.delete(projects).where(eq(projects.id, id));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  async getEvents(projectId: string, limit = 100): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(eq(events.projectId, projectId))
      .orderBy(desc(events.timestamp))
      .limit(limit);
  }

  async getFilteredEvents(projectId: string, filters: EventFilters): Promise<Event[]> {
    const conditions = [eq(events.projectId, projectId)];

    if (filters.from) {
      conditions.push(sql`${events.timestamp} >= ${new Date(filters.from)}`);
    }
    if (filters.to) {
      conditions.push(sql`${events.timestamp} <= ${new Date(filters.to)}`);
    }
    if (filters.eventType) {
      conditions.push(eq(events.eventType, filters.eventType));
    }
    if (filters.device) {
      conditions.push(eq(events.device, filters.device));
    }
    if (filters.browser) {
      conditions.push(eq(events.browser, filters.browser));
    }
    if (filters.os) {
      conditions.push(eq(events.os, filters.os));
    }
    if (filters.country) {
      conditions.push(eq(events.country, filters.country));
    }
    if (filters.referrer) {
      conditions.push(eq(events.referrer, filters.referrer));
    }
    if (filters.isBot) {
      conditions.push(eq(events.isBot, filters.isBot));
    }
    if (filters.isInternal) {
      conditions.push(eq(events.isInternal, filters.isInternal));
    }
    if (filters.isServer) {
      conditions.push(eq(events.isServer, filters.isServer));
    }
    if (filters.trafficSource) {
      conditions.push(eq(events.trafficSource, filters.trafficSource));
    }
    if (filters.page) {
      conditions.push(sql`${events.page} ILIKE ${'%' + filters.page + '%'}`);
    }
    if (filters.visitorId) {
      conditions.push(eq(events.visitorId, filters.visitorId));
    }

    return db
      .select()
      .from(events)
      .where(and(...conditions))
      .orderBy(desc(events.timestamp))
      .limit(filters.limit || 1000);
  }

  async getAnalyticsSummary(projectId: string): Promise<any> {
    const allEvents = await db
      .select()
      .from(events)
      .where(eq(events.projectId, projectId));

    const pageViews = allEvents.filter((e) => e.eventType === "pageview");
    const clicks = allEvents.filter((e) => e.eventType === "click");

    const pageMap = new Map<string, number>();
    pageViews.forEach((e) => {
      const p = e.page || "/";
      pageMap.set(p, (pageMap.get(p) || 0) + 1);
    });

    const topPages = Array.from(pageMap.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const deviceMap = new Map<string, number>();
    allEvents.forEach((e) => {
      const d = e.device || "Unknown";
      deviceMap.set(d, (deviceMap.get(d) || 0) + 1);
    });
    const deviceBreakdown = Array.from(deviceMap.entries()).map(([device, count]) => ({
      device,
      count,
    }));

    const browserMap = new Map<string, number>();
    allEvents.forEach((e) => {
      const b = e.browser || "Unknown";
      browserMap.set(b, (browserMap.get(b) || 0) + 1);
    });
    const browserBreakdown = Array.from(browserMap.entries()).map(([browser, count]) => ({
      browser,
      count,
    }));

    const referrerMap = new Map<string, number>();
    allEvents.forEach((e) => {
      const r = e.referrer || "Direct";
      referrerMap.set(r, (referrerMap.get(r) || 0) + 1);
    });
    const referrerBreakdown = Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const dailyMap = new Map<string, { views: number; clicks: number }>();
    allEvents.forEach((e) => {
      const date = new Date(e.timestamp).toISOString().slice(5, 10);
      const existing = dailyMap.get(date) || { views: 0, clicks: 0 };
      if (e.eventType === "pageview") existing.views++;
      if (e.eventType === "click") existing.clicks++;
      dailyMap.set(date, existing);
    });
    const dailyViews = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const uniqueVisitors = new Set(
      allEvents.map(
        (e) => e.visitorId || `${e.device}-${e.browser}-${e.os}-${e.country}`
      )
    ).size;

    const botEvents = allEvents.filter((e) => e.isBot === "true").length;
    const internalEvents = allEvents.filter((e) => e.isInternal === "true").length;
    const serverEvents = allEvents.filter((e) => e.isServer === "true").length;

    return {
      totalPageViews: pageViews.length,
      totalClicks: clicks.length,
      avgTimeOnPage: Math.floor(Math.random() * 60) + 30,
      uniqueVisitors,
      bounceRate: 35 + Math.floor(Math.random() * 20),
      topPages,
      deviceBreakdown,
      browserBreakdown,
      dailyViews,
      referrerBreakdown,
      botEvents,
      internalEvents,
      serverEvents,
    };
  }

  async getSeoAnalyses(projectId: string): Promise<SeoAnalysis[]> {
    return db
      .select()
      .from(seoAnalyses)
      .where(eq(seoAnalyses.projectId, projectId))
      .orderBy(desc(seoAnalyses.analyzedAt));
  }

  async createSeoAnalysis(analysis: InsertSeoAnalysis): Promise<SeoAnalysis> {
    const [created] = await db.insert(seoAnalyses).values(analysis).returning();
    return created;
  }

  async getPpcCampaigns(projectId: string): Promise<PpcCampaign[]> {
    return db
      .select()
      .from(ppcCampaigns)
      .where(eq(ppcCampaigns.projectId, projectId))
      .orderBy(desc(ppcCampaigns.createdAt));
  }

  async createPpcCampaign(campaign: InsertPpcCampaign): Promise<PpcCampaign> {
    const [created] = await db.insert(ppcCampaigns).values(campaign).returning();
    return created;
  }

  async getCustomReports(projectId: string): Promise<CustomReport[]> {
    return db
      .select()
      .from(customReports)
      .where(eq(customReports.projectId, projectId))
      .orderBy(desc(customReports.createdAt));
  }

  async getCustomReport(id: string): Promise<CustomReport | undefined> {
    const [report] = await db.select().from(customReports).where(eq(customReports.id, id));
    return report;
  }

  async createCustomReport(report: InsertCustomReport): Promise<CustomReport> {
    const [created] = await db.insert(customReports).values(report).returning();
    return created;
  }

  async updateCustomReport(id: string, report: Partial<InsertCustomReport>): Promise<CustomReport> {
    const [updated] = await db
      .update(customReports)
      .set({ ...report, updatedAt: new Date() })
      .where(eq(customReports.id, id))
      .returning();
    return updated;
  }

  async deleteCustomReport(id: string): Promise<void> {
    await db.delete(customReports).where(eq(customReports.id, id));
  }

  async getEventsByDateRange(projectId: string, from: Date, to: Date): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(
        and(
          eq(events.projectId, projectId),
          sql`${events.timestamp} >= ${from}`,
          sql`${events.timestamp} <= ${to}`
        )
      )
      .orderBy(desc(events.timestamp));
  }

  async getConsentSettings(projectId: string): Promise<ConsentSettings | undefined> {
    const [settings] = await db.select().from(consentSettings).where(eq(consentSettings.projectId, projectId));
    return settings;
  }

  async upsertConsentSettings(settings: InsertConsentSettings): Promise<ConsentSettings> {
    const existing = await this.getConsentSettings(settings.projectId);
    if (existing) {
      const [updated] = await db
        .update(consentSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(consentSettings.projectId, settings.projectId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(consentSettings).values(settings).returning();
    return created;
  }

  async createConsentRecord(record: InsertConsentRecord): Promise<ConsentRecord> {
    const [created] = await db.insert(consentRecords).values(record).returning();
    return created;
  }

  async getConsentRecords(projectId: string, visitorId?: string): Promise<ConsentRecord[]> {
    if (visitorId) {
      return db.select().from(consentRecords).where(
        and(eq(consentRecords.projectId, projectId), eq(consentRecords.visitorId, visitorId))
      ).orderBy(desc(consentRecords.consentTimestamp));
    }
    return db.select().from(consentRecords).where(eq(consentRecords.projectId, projectId)).orderBy(desc(consentRecords.consentTimestamp));
  }

  async deleteVisitorData(projectId: string, visitorId: string): Promise<{ eventsDeleted: number; consentsDeleted: number }> {
    const evtResult = await db.delete(events).where(
      and(eq(events.projectId, projectId), eq(events.visitorId, visitorId))
    ).returning();
    const consentResult = await db.delete(consentRecords).where(
      and(eq(consentRecords.projectId, projectId), eq(consentRecords.visitorId, visitorId))
    ).returning();
    return { eventsDeleted: evtResult.length, consentsDeleted: consentResult.length };
  }

  async getVisitorData(projectId: string, visitorId: string): Promise<{ events: Event[]; consents: ConsentRecord[] }> {
    const visitorEvents = await db.select().from(events).where(
      and(eq(events.projectId, projectId), eq(events.visitorId, visitorId))
    ).orderBy(desc(events.timestamp));
    const visitorConsents = await db.select().from(consentRecords).where(
      and(eq(consentRecords.projectId, projectId), eq(consentRecords.visitorId, visitorId))
    ).orderBy(desc(consentRecords.consentTimestamp));
    return { events: visitorEvents, consents: visitorConsents };
  }

  async purgeOldEvents(projectId: string, retentionDays: number): Promise<number> {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const deleted = await db.delete(events).where(
      and(eq(events.projectId, projectId), sql`${events.timestamp} < ${cutoff}`)
    ).returning();
    return deleted.length;
  }

  async getAiSettings(userId: string): Promise<AiSettings | undefined> {
    const [settings] = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.userId, userId));
    return settings;
  }

  async upsertAiSettings(settings: InsertAiSettings): Promise<AiSettings> {
    const existing = await this.getAiSettings(settings.userId);
    if (existing) {
      const [updated] = await db
        .update(aiSettings)
        .set({
          provider: settings.provider,
          apiKey: settings.apiKey,
          model: settings.model,
        })
        .where(eq(aiSettings.userId, settings.userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(aiSettings).values(settings).returning();
    return created;
  }

  async getInternalIpRules(projectId: string): Promise<InternalIpRule[]> {
    return db
      .select()
      .from(internalIpRules)
      .where(eq(internalIpRules.projectId, projectId))
      .orderBy(desc(internalIpRules.createdAt));
  }

  async createInternalIpRule(rule: InsertInternalIpRule): Promise<InternalIpRule> {
    const [created] = await db.insert(internalIpRules).values(rule).returning();
    return created;
  }

  async deleteInternalIpRule(id: string): Promise<void> {
    await db.delete(internalIpRules).where(eq(internalIpRules.id, id));
  }

  async getFunnels(projectId: string): Promise<Funnel[]> {
    return db
      .select()
      .from(funnels)
      .where(eq(funnels.projectId, projectId))
      .orderBy(desc(funnels.createdAt));
  }

  async getFunnel(id: string): Promise<Funnel | undefined> {
    const [funnel] = await db.select().from(funnels).where(eq(funnels.id, id));
    return funnel;
  }

  async createFunnel(funnel: InsertFunnel): Promise<Funnel> {
    const [created] = await db.insert(funnels).values(funnel).returning();
    return created;
  }

  async updateFunnel(id: string, funnel: Partial<InsertFunnel>): Promise<Funnel> {
    const [updated] = await db
      .update(funnels)
      .set({ ...funnel, updatedAt: new Date() })
      .where(eq(funnels.id, id))
      .returning();
    return updated;
  }

  async deleteFunnel(id: string): Promise<void> {
    await db.delete(funnels).where(eq(funnels.id, id));
  }

  async getCustomEventDefinitions(projectId: string): Promise<CustomEventDefinition[]> {
    return db
      .select()
      .from(customEventDefinitions)
      .where(eq(customEventDefinitions.projectId, projectId))
      .orderBy(desc(customEventDefinitions.createdAt));
  }

  async getCustomEventDefinition(id: string): Promise<CustomEventDefinition | undefined> {
    const [def] = await db.select().from(customEventDefinitions).where(eq(customEventDefinitions.id, id));
    return def;
  }

  async createCustomEventDefinition(def: InsertCustomEventDefinition): Promise<CustomEventDefinition> {
    const [created] = await db.insert(customEventDefinitions).values(def).returning();
    return created;
  }

  async updateCustomEventDefinition(id: string, def: Partial<InsertCustomEventDefinition>): Promise<CustomEventDefinition> {
    const [updated] = await db
      .update(customEventDefinitions)
      .set({ ...def, updatedAt: new Date() })
      .where(eq(customEventDefinitions.id, id))
      .returning();
    return updated;
  }

  async deleteCustomEventDefinition(id: string): Promise<void> {
    await db.delete(customEventDefinitions).where(eq(customEventDefinitions.id, id));
  }

  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return db.select().from(subscriptionPlans).orderBy(subscriptionPlans.sortOrder);
  }

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [created] = await db.insert(subscriptionPlans).values(plan).returning();
    return created;
  }

  async updateSubscriptionPlan(id: string, data: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan> {
    const [updated] = await db.update(subscriptionPlans).set(data).where(eq(subscriptionPlans.id, id)).returning();
    return updated;
  }

  async deleteSubscriptionPlan(id: string): Promise<void> {
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  }

  async getPaymentSettings(): Promise<PaymentSettings | undefined> {
    const [settings] = await db.select().from(paymentSettings);
    return settings;
  }

  async upsertPaymentSettings(settings: InsertPaymentSettings): Promise<PaymentSettings> {
    const existing = await this.getPaymentSettings();
    if (existing) {
      const [updated] = await db.update(paymentSettings).set({ ...settings, updatedAt: new Date() }).where(eq(paymentSettings.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(paymentSettings).values(settings).returning();
    return created;
  }

  async getContentGapAnalyses(projectId: string): Promise<ContentGapAnalysis[]> {
    return db.select().from(contentGapAnalyses).where(eq(contentGapAnalyses.projectId, projectId)).orderBy(desc(contentGapAnalyses.createdAt));
  }

  async createContentGapAnalysis(analysis: InsertContentGapAnalysis): Promise<ContentGapAnalysis> {
    const [created] = await db.insert(contentGapAnalyses).values(analysis).returning();
    return created;
  }

  async deleteContentGapAnalysis(id: string): Promise<void> {
    await db.delete(contentGapAnalyses).where(eq(contentGapAnalyses.id, id));
  }

  async getProjectLogo(projectId: string): Promise<ProjectLogo | undefined> {
    const [logo] = await db.select().from(projectLogos).where(eq(projectLogos.projectId, projectId));
    return logo;
  }

  async upsertProjectLogo(logo: InsertProjectLogo): Promise<ProjectLogo> {
    const existing = await this.getProjectLogo(logo.projectId);
    if (existing) {
      const [updated] = await db.update(projectLogos).set(logo).where(eq(projectLogos.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(projectLogos).values(logo).returning();
    return created;
  }

  async deleteProjectLogo(projectId: string): Promise<void> {
    await db.delete(projectLogos).where(eq(projectLogos.projectId, projectId));
  }

  async getSiteResearchReports(userId: string): Promise<SiteResearchReport[]> {
    return db.select().from(siteResearchReports).where(eq(siteResearchReports.userId, userId)).orderBy(desc(siteResearchReports.createdAt));
  }

  async getSiteResearchReport(id: string): Promise<SiteResearchReport | undefined> {
    const [report] = await db.select().from(siteResearchReports).where(eq(siteResearchReports.id, id));
    return report;
  }

  async createSiteResearchReport(report: InsertSiteResearchReport): Promise<SiteResearchReport> {
    const [created] = await db.insert(siteResearchReports).values(report).returning();
    return created;
  }

  async deleteSiteResearchReport(id: string): Promise<void> {
    await db.delete(siteResearchReports).where(eq(siteResearchReports.id, id));
  }

  async transferProjectOwnership(projectId: string, newUserId: string): Promise<Project> {
    const [updated] = await db.update(projects).set({ userId: newUserId }).where(eq(projects.id, projectId)).returning();
    return updated;
  }

  async getPredictiveAnalyses(projectId: string): Promise<PredictiveAnalytics[]> {
    return db.select().from(predictiveAnalytics).where(eq(predictiveAnalytics.projectId, projectId)).orderBy(desc(predictiveAnalytics.createdAt));
  }

  async createPredictiveAnalysis(data: InsertPredictiveAnalytics): Promise<PredictiveAnalytics> {
    const [created] = await db.insert(predictiveAnalytics).values(data).returning();
    return created;
  }

  async deletePredictiveAnalysis(id: string): Promise<void> {
    await db.delete(predictiveAnalytics).where(eq(predictiveAnalytics.id, id));
  }

  async getUxAudits(projectId: string): Promise<UxAudit[]> {
    return db.select().from(uxAudits).where(eq(uxAudits.projectId, projectId)).orderBy(desc(uxAudits.createdAt));
  }

  async createUxAudit(data: InsertUxAudit): Promise<UxAudit> {
    const [created] = await db.insert(uxAudits).values(data).returning();
    return created;
  }

  async deleteUxAudit(id: string): Promise<void> {
    await db.delete(uxAudits).where(eq(uxAudits.id, id));
  }

  async getMarketingCopilotSessions(projectId: string): Promise<MarketingCopilotSession[]> {
    return db.select().from(marketingCopilotSessions).where(eq(marketingCopilotSessions.projectId, projectId)).orderBy(desc(marketingCopilotSessions.createdAt));
  }

  async createMarketingCopilotSession(data: InsertMarketingCopilotSession): Promise<MarketingCopilotSession> {
    const [created] = await db.insert(marketingCopilotSessions).values(data).returning();
    return created;
  }

  async deleteMarketingCopilotSession(id: string): Promise<void> {
    await db.delete(marketingCopilotSessions).where(eq(marketingCopilotSessions.id, id));
  }

  async getGoogleIntegration(projectId: string, provider: string): Promise<GoogleIntegration | undefined> {
    const [result] = await db.select().from(googleIntegrations)
      .where(and(eq(googleIntegrations.projectId, projectId), eq(googleIntegrations.provider, provider)));
    return result;
  }

  async getGoogleIntegrations(projectId: string): Promise<GoogleIntegration[]> {
    return db.select().from(googleIntegrations).where(eq(googleIntegrations.projectId, projectId));
  }

  async upsertGoogleIntegration(data: InsertGoogleIntegration): Promise<GoogleIntegration> {
    const existing = await this.getGoogleIntegration(data.projectId, data.provider);
    if (existing) {
      const [updated] = await db.update(googleIntegrations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(googleIntegrations.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(googleIntegrations).values(data).returning();
    return created;
  }

  async deleteGoogleIntegration(projectId: string, provider: string): Promise<void> {
    await db.delete(googleIntegrations)
      .where(and(eq(googleIntegrations.projectId, projectId), eq(googleIntegrations.provider, provider)));
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings);
    return settings;
  }

  async upsertSiteSettings(data: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const existing = await this.getSiteSettings();
    if (existing) {
      const [updated] = await db.update(siteSettings).set({ ...data, updatedAt: new Date() }).where(eq(siteSettings.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(siteSettings).values(data as InsertSiteSettings).returning();
    return created;
  }

  async getCmsPages(): Promise<CmsPage[]> {
    return db.select().from(cmsPages).orderBy(cmsPages.sortOrder);
  }

  async getCmsPage(id: string): Promise<CmsPage | undefined> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.id, id));
    return page;
  }

  async getCmsPageBySlug(slug: string): Promise<CmsPage | undefined> {
    const [page] = await db.select().from(cmsPages).where(eq(cmsPages.slug, slug));
    return page;
  }

  async createCmsPage(page: InsertCmsPage): Promise<CmsPage> {
    const [created] = await db.insert(cmsPages).values(page).returning();
    return created;
  }

  async updateCmsPage(id: string, data: Partial<InsertCmsPage>): Promise<CmsPage> {
    const [updated] = await db.update(cmsPages).set({ ...data, updatedAt: new Date() }).where(eq(cmsPages.id, id)).returning();
    return updated;
  }

  async deleteCmsPage(id: string): Promise<void> {
    await db.delete(cmsPages).where(eq(cmsPages.id, id));
  }

  async getCmsFiles(): Promise<CmsFile[]> {
    return db.select().from(cmsFiles).orderBy(desc(cmsFiles.createdAt));
  }

  async getCmsFile(id: string): Promise<CmsFile | undefined> {
    const [file] = await db.select().from(cmsFiles).where(eq(cmsFiles.id, id));
    return file;
  }

  async createCmsFile(file: InsertCmsFile): Promise<CmsFile> {
    const [created] = await db.insert(cmsFiles).values(file).returning();
    return created;
  }

  async deleteCmsFile(id: string): Promise<void> {
    await db.delete(cmsFiles).where(eq(cmsFiles.id, id));
  }

  async getSmtpSettings(): Promise<SmtpSettings | undefined> {
    const [settings] = await db.select().from(smtpSettings);
    return settings;
  }

  async upsertSmtpSettings(data: Partial<InsertSmtpSettings>): Promise<SmtpSettings> {
    const existing = await this.getSmtpSettings();
    if (existing) {
      const [updated] = await db.update(smtpSettings).set({ ...data, updatedAt: new Date() }).where(eq(smtpSettings.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(smtpSettings).values(data as InsertSmtpSettings).returning();
    return created;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [created] = await db.insert(contactSubmissions).values(submission).returning();
    return created;
  }

  async updateContactSubmission(id: string, data: Partial<ContactSubmission>): Promise<ContactSubmission> {
    const [updated] = await db.update(contactSubmissions).set(data).where(eq(contactSubmissions.id, id)).returning();
    return updated;
  }

  async deleteContactSubmission(id: string): Promise<void> {
    await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async createPasswordReset(userId: string, token: string, expiresAt: Date): Promise<void> {
    await db.insert(passwordResets).values({ userId, token, expiresAt });
  }

  async getPasswordResetByToken(token: string): Promise<{ id: string; userId: string; token: string; expiresAt: Date; used: boolean } | undefined> {
    const [result] = await db.select().from(passwordResets).where(eq(passwordResets.token, token)).limit(1);
    return result;
  }

  async markPasswordResetUsed(id: string): Promise<void> {
    await db.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, id));
  }

  async logAiUsage(data: InsertAiUsageLog): Promise<AiUsageLog> {
    const [created] = await db.insert(aiUsageLogs).values(data).returning();
    return created;
  }

  async getAiUsageLogs(userId: string, from?: Date, to?: Date): Promise<AiUsageLog[]> {
    const conditions = [eq(aiUsageLogs.userId, userId)];
    if (from) {
      conditions.push(gte(aiUsageLogs.createdAt, from));
    }
    if (to) {
      conditions.push(lte(aiUsageLogs.createdAt, to));
    }
    return db.select().from(aiUsageLogs).where(and(...conditions)).orderBy(desc(aiUsageLogs.createdAt));
  }

  async getAiUsageTotalCost(userId: string, from?: Date, to?: Date): Promise<number> {
    const conditions = [eq(aiUsageLogs.userId, userId)];
    if (from) {
      conditions.push(gte(aiUsageLogs.createdAt, from));
    }
    if (to) {
      conditions.push(lte(aiUsageLogs.createdAt, to));
    }
    const [result] = await db.select({ total: sql<number>`COALESCE(SUM(${aiUsageLogs.costUsd}), 0)` }).from(aiUsageLogs).where(and(...conditions));
    return Number(result?.total ?? 0);
  }

  async getStripeCustomer(userId: string): Promise<StripeCustomer | undefined> {
    const [customer] = await db.select().from(stripeCustomers).where(eq(stripeCustomers.userId, userId));
    return customer;
  }

  async createStripeCustomer(data: InsertStripeCustomer): Promise<StripeCustomer> {
    const [created] = await db.insert(stripeCustomers).values(data).returning();
    return created;
  }

  async getInvoices(userId: string): Promise<Invoice[]> {
    return db.select().from(invoices).where(eq(invoices.userId, userId)).orderBy(desc(invoices.createdAt));
  }

  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const [created] = await db.insert(invoices).values(data).returning();
    return created;
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const [updated] = await db.update(invoices).set(data).where(eq(invoices.id, id)).returning();
    return updated;
  }

  async getQuizTopics(): Promise<QuizTopic[]> {
    return db.select().from(quizTopics).orderBy(quizTopics.sortOrder);
  }

  async getQuizQuestions(topicId: string): Promise<QuizQuestion[]> {
    return db.select().from(quizQuestions).where(eq(quizQuestions.topicId, topicId)).orderBy(quizQuestions.sortOrder);
  }

  async getQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return db.select().from(quizAttempts).where(eq(quizAttempts.userId, userId)).orderBy(desc(quizAttempts.completedAt));
  }

  async createQuizAttempt(data: InsertQuizAttempt): Promise<QuizAttempt> {
    const [created] = await db.insert(quizAttempts).values(data).returning();
    return created;
  }

  async getBadges(): Promise<Badge[]> {
    return db.select().from(badges).orderBy(badges.sortOrder);
  }

  async getUserBadges(userId: string): Promise<(UserBadge & { badge: Badge })[]> {
    const results = await db
      .select()
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
    return results.map(r => ({ ...r.user_badges, badge: r.badges }));
  }

  async awardBadge(data: InsertUserBadge): Promise<UserBadge> {
    const [created] = await db.insert(userBadges).values(data).returning();
    return created;
  }

  async hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
    const [existing] = await db.select().from(userBadges).where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
    return !!existing;
  }

  async getBlogPosts(publishedOnly = false): Promise<BlogPost[]> {
    if (publishedOnly) {
      return db.select().from(blogPosts).where(eq(blogPosts.status, "published")).orderBy(desc(blogPosts.createdAt));
    }
    return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }
  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [created] = await db.insert(blogPosts).values(post).returning();
    return created;
  }
  async updateBlogPost(id: string, data: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updated] = await db.update(blogPosts).set({ ...data, updatedAt: new Date() }).where(eq(blogPosts.id, id)).returning();
    return updated;
  }
  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getGuides(publishedOnly = false): Promise<Guide[]> {
    if (publishedOnly) {
      return db.select().from(guidesContent).where(eq(guidesContent.status, "published")).orderBy(guidesContent.sortOrder);
    }
    return db.select().from(guidesContent).orderBy(guidesContent.sortOrder);
  }
  async getGuide(id: string): Promise<Guide | undefined> {
    const [guide] = await db.select().from(guidesContent).where(eq(guidesContent.id, id));
    return guide;
  }
  async getGuideBySlug(slug: string): Promise<Guide | undefined> {
    const [guide] = await db.select().from(guidesContent).where(eq(guidesContent.slug, slug));
    return guide;
  }
  async createGuide(guide: InsertGuide): Promise<Guide> {
    const [created] = await db.insert(guidesContent).values(guide).returning();
    return created;
  }
  async updateGuide(id: string, data: Partial<InsertGuide>): Promise<Guide> {
    const [updated] = await db.update(guidesContent).set({ ...data, updatedAt: new Date() }).where(eq(guidesContent.id, id)).returning();
    return updated;
  }
  async deleteGuide(id: string): Promise<void> {
    await db.delete(guidesContent).where(eq(guidesContent.id, id));
  }

  async getCaseStudies(publishedOnly = false): Promise<CaseStudy[]> {
    if (publishedOnly) {
      return db.select().from(caseStudiesContent).where(eq(caseStudiesContent.status, "published")).orderBy(desc(caseStudiesContent.createdAt));
    }
    return db.select().from(caseStudiesContent).orderBy(desc(caseStudiesContent.createdAt));
  }
  async getCaseStudy(id: string): Promise<CaseStudy | undefined> {
    const [cs] = await db.select().from(caseStudiesContent).where(eq(caseStudiesContent.id, id));
    return cs;
  }
  async getCaseStudyBySlug(slug: string): Promise<CaseStudy | undefined> {
    const [cs] = await db.select().from(caseStudiesContent).where(eq(caseStudiesContent.slug, slug));
    return cs;
  }
  async createCaseStudy(cs: InsertCaseStudy): Promise<CaseStudy> {
    const [created] = await db.insert(caseStudiesContent).values(cs).returning();
    return created;
  }
  async updateCaseStudy(id: string, data: Partial<InsertCaseStudy>): Promise<CaseStudy> {
    const [updated] = await db.update(caseStudiesContent).set({ ...data, updatedAt: new Date() }).where(eq(caseStudiesContent.id, id)).returning();
    return updated;
  }
  async deleteCaseStudy(id: string): Promise<void> {
    await db.delete(caseStudiesContent).where(eq(caseStudiesContent.id, id));
  }

  async getHelpArticles(publishedOnly = false): Promise<HelpArticle[]> {
    if (publishedOnly) {
      return db.select().from(helpArticles).where(eq(helpArticles.status, "published")).orderBy(helpArticles.sortOrder);
    }
    return db.select().from(helpArticles).orderBy(helpArticles.sortOrder);
  }
  async getHelpArticle(id: string): Promise<HelpArticle | undefined> {
    const [article] = await db.select().from(helpArticles).where(eq(helpArticles.id, id));
    return article;
  }
  async getHelpArticleBySlug(slug: string): Promise<HelpArticle | undefined> {
    const [article] = await db.select().from(helpArticles).where(eq(helpArticles.slug, slug));
    return article;
  }
  async createHelpArticle(article: InsertHelpArticle): Promise<HelpArticle> {
    const [created] = await db.insert(helpArticles).values(article).returning();
    return created;
  }
  async updateHelpArticle(id: string, data: Partial<InsertHelpArticle>): Promise<HelpArticle> {
    const [updated] = await db.update(helpArticles).set({ ...data, updatedAt: new Date() }).where(eq(helpArticles.id, id)).returning();
    return updated;
  }
  async deleteHelpArticle(id: string): Promise<void> {
    await db.delete(helpArticles).where(eq(helpArticles.id, id));
  }
}

export const storage = new DatabaseStorage();
