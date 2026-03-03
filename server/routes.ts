import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { createHash } from "crypto";
import { storage } from "./storage";
import { insertProjectSchema, insertEventSchema, insertPpcCampaignSchema, insertCustomReportSchema } from "@shared/schema";
import type { EventFilters } from "./storage";
import { requireAuth, requireAdmin } from "./auth";
import { aiChat, aiChatJSON, calculateCostUsd, PAGE_CONTEXTS as aiPageContexts } from "./ai-service";
import { isStripeConfigured, checkAndInvoiceUser } from "./stripe-billing";
import multer from "multer";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { invalidateTrackingCache } from "./tracking-inject";
import { registerAdminRoutes } from "./admin-routes";
import { getGA4ConnectionForProject, refreshAccessToken, fetchGA4LeadJourneyData, runGA4Report } from "./ga4-client";

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 },
});

function parseDateRange(query: Record<string, any>): { from: Date; to: Date } {
  if (query.from && query.to) {
    return {
      from: new Date(query.from as string),
      to: new Date(query.to as string),
    };
  }
  const period = (query.period as string) || "last_30_days";
  const now = new Date();
  const to = now;
  let from: Date;
  switch (period) {
    case "today":
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "yesterday": {
      const y = new Date(now.getTime() - 86400000);
      from = new Date(y.getFullYear(), y.getMonth(), y.getDate());
      break;
    }
    case "last_7_days":
      from = new Date(now.getTime() - 7 * 86400000);
      break;
    case "last_28_days":
      from = new Date(now.getTime() - 28 * 86400000);
      break;
    case "last_30_days":
      from = new Date(now.getTime() - 30 * 86400000);
      break;
    case "last_90_days":
      from = new Date(now.getTime() - 90 * 86400000);
      break;
    case "last_12_months":
      from = new Date(now.getTime() - 365 * 86400000);
      break;
    case "this_week": {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      break;
    }
    case "this_month":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "last_month":
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      break;
    default:
      from = new Date(now.getTime() - 30 * 86400000);
  }
  return { from, to };
}

function hashIp(ip: string): string {
  if (!ip) return "";
  return createHash("sha256").update(ip + "gdpr-salt-da").digest("hex").slice(0, 16);
}

function anonymizeIp(ip: string): string {
  if (!ip) return "";
  if (ip.includes(":")) {
    const parts = ip.split(":");
    if (parts.length >= 4) {
      return parts.slice(0, 4).join(":") + ":0:0:0:0";
    }
    return ip;
  }
  const parts = ip.split(".");
  if (parts.length === 4) {
    return parts.slice(0, 3).join(".") + ".0";
  }
  return ip;
}

async function resolveGeo(ip: string): Promise<{ country: string | null; city: string | null; region: string | null }> {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { country: null, city: null, region: null };
  }
  try {
    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,regionName`, { signal: AbortSignal.timeout(2000) });
    if (resp.ok) {
      const data = await resp.json();
      return { country: data.country || null, city: data.city || null, region: data.regionName || null };
    }
  } catch {}
  return { country: null, city: null, region: null };
}

function ipMatchesCidr(ip: string, ruleIp: string, bits: number): boolean {
  if (ip.includes(":") || ruleIp.includes(":")) return false;
  const ipParts = ip.split(".").map(Number);
  const ruleParts = ruleIp.split(".").map(Number);
  if (ipParts.length !== 4 || ruleParts.length !== 4) return false;
  const ipNum = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
  const ruleNum = (ruleParts[0] << 24) | (ruleParts[1] << 16) | (ruleParts[2] << 8) | ruleParts[3];
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return ((ipNum >>> 0) & mask) === ((ruleNum >>> 0) & mask);
}

function classifyTrafficSource(referrer: string | null | undefined, page: string | null | undefined, projectDomain: string): string {
  if (!referrer || referrer === "Direct" || referrer === "" || referrer === "(none)") {
    return "direct";
  }
  const ref = referrer.toLowerCase();
  const searchEngines = ["google.", "bing.", "yahoo.", "duckduckgo.", "baidu.", "yandex.", "ecosia.", "ask."];
  if (searchEngines.some(se => ref.includes(se))) {
    return "organic_search";
  }
  const socialPlatforms = ["facebook.", "instagram.", "twitter.", "t.co", "linkedin.", "youtube.", "tiktok.", "reddit.", "pinterest.", "threads."];
  if (socialPlatforms.some(sp => ref.includes(sp))) {
    return "social";
  }
  const emailPatterns = ["mail.", "outlook.", "gmail.", "yahoo.com/mail", "proton."];
  if (emailPatterns.some(ep => ref.includes(ep))) {
    return "email";
  }
  if (page) {
    const urlLower = page.toLowerCase();
    if (urlLower.includes("utm_medium=cpc") || urlLower.includes("utm_medium=paid") || urlLower.includes("gclid=") || urlLower.includes("msclkid=")) {
      return "paid_search";
    }
    if (urlLower.includes("utm_medium=social") || urlLower.includes("utm_medium=paid_social")) {
      return "paid_social";
    }
    if (urlLower.includes("utm_medium=display") || urlLower.includes("utm_medium=banner")) {
      return "display";
    }
    if (urlLower.includes("utm_medium=affiliate")) {
      return "affiliate";
    }
    if (urlLower.includes("utm_medium=email") || urlLower.includes("utm_medium=newsletter")) {
      return "email";
    }
  }
  try {
    const refDomain = new URL(ref.startsWith("http") ? ref : `https://${ref}`).hostname.replace(/^www\./, "");
    if (refDomain === projectDomain) return "internal";
  } catch {}
  return "referral";
}

function extractSearchKeyword(referrer: string | null | undefined): string | null {
  if (!referrer || referrer === "Direct" || referrer === "" || referrer === "(none)") return null;
  try {
    const url = new URL(referrer.startsWith("http") ? referrer : `https://${referrer}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const params = url.searchParams;
    const searchEngineParams: Record<string, string[]> = {
      "google": ["q"],
      "bing": ["q"],
      "yahoo": ["p", "q"],
      "duckduckgo": ["q"],
      "baidu": ["wd", "word"],
      "yandex": ["text"],
      "ecosia": ["q"],
      "ask": ["q"],
      "aol": ["q"],
      "startpage": ["query"],
      "qwant": ["q"],
      "brave": ["q"],
    };
    for (const [engine, keys] of Object.entries(searchEngineParams)) {
      if (host.includes(engine)) {
        for (const key of keys) {
          const val = params.get(key);
          if (val && val.trim()) return val.trim();
        }
        return null;
      }
    }
  } catch {}
  return null;
}

function matchesRules(evt: any, rules: Array<{ field: string; operator: string; value: string }>): boolean {
  return rules.every(rule => {
    const fieldValue = String(evt[rule.field] || "").toLowerCase();
    const ruleValue = rule.value.toLowerCase();

    switch (rule.operator) {
      case "equals":
        return fieldValue === ruleValue;
      case "not_equals":
        return fieldValue !== ruleValue;
      case "contains":
        return fieldValue.includes(ruleValue);
      case "not_contains":
        return !fieldValue.includes(ruleValue);
      case "starts_with":
        return fieldValue.startsWith(ruleValue);
      case "ends_with":
        return fieldValue.endsWith(ruleValue);
      case "contains_any":
        return ruleValue.split(",").some(v => fieldValue.includes(v.trim()));
      case "regex":
        try {
          return new RegExp(rule.value, "i").test(String(evt[rule.field] || ""));
        } catch {
          return false;
        }
      default:
        return false;
    }
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads", { recursive: true });
  }

  app.use("/uploads", express.static("uploads"));

  // Public: subscription plans
  app.get("/api/plans", async (_req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans.filter(p => p.isActive));
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Projects (auth-protected)
  app.get("/api/projects", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const projects = user.role === "admin"
        ? await storage.getProjects()
        : await storage.getProjects(user.id);
      res.json(projects);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(project);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;

      const plans = await storage.getSubscriptionPlans();
      const userPlan = plans.find(p => p.slug === user.subscriptionTier);
      if (userPlan && userPlan.projectLimit > 0) {
        const projectCount = await storage.getUserProjectCount(user.id);
        if (projectCount >= userPlan.projectLimit) {
          return res.status(403).json({
            message: `Your ${userPlan.name} plan allows up to ${userPlan.projectLimit} project(s). Please upgrade to add more.`,
          });
        }
      }

      if (!req.body.name || !req.body.name.trim()) {
        return res.status(400).json({ message: "Project name is required" });
      }
      if (!req.body.domain || !req.body.domain.trim()) {
        return res.status(400).json({ message: "Project domain is required" });
      }
      let cleanDomain = req.body.domain.trim()
        .replace(/^https?:\/\//i, "")
        .replace(/\/+$/, "");
      const parsed = insertProjectSchema.safeParse({
        ...req.body,
        name: req.body.name.trim(),
        domain: cleanDomain,
        userId: user.id,
        status: req.body.status || "active",
      });
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors.map(e => e.message).join(", ") });
      }
      const project = await storage.createProject(parsed.data);
      res.status(201).json(project);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const allowedFields = [
        "name", "domain", "description", "status",
        "googleClientId", "googleClientSecret",
        "ga4PropertyId", "ga4MeasurementId", "gscSiteUrl",
      ];
      const updateData: Record<string, any> = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      if (updateData.domain) {
        updateData.domain = updateData.domain.trim()
          .replace(/^https?:\/\//i, "")
          .replace(/\/+$/, "");
      }
      const updated = await storage.updateProject(req.params.id, updateData);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/verify-tracking", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      let domain = project.domain.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
      let url = (req.body.url || `https://${domain}`).trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }

      try {
        const parsedUrl = new URL(url);
        const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
        if (blockedHosts.includes(parsedUrl.hostname)) {
          return res.status(400).json({ message: "Cannot verify localhost URLs" });
        }
        if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
          return res.status(400).json({ message: "Only HTTP/HTTPS URLs are supported" });
        }
      } catch {
        return res.status(400).json({ message: "Invalid URL" });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent": "AIDigitalAnalyst-TrackingVerifier/1.0",
          },
          redirect: "follow",
        });
        clearTimeout(timeout);

        if (!response.ok) {
          return res.json({
            verified: false,
            foundSnippet: false,
            checkedUrl: url,
            message: `Website returned status ${response.status}`,
          });
        }

        const html = await response.text();
        const projectId = req.params.id;

        const hasSnippetJs = html.includes("snippet.js");
        const hasProjectId = html.includes(projectId);
        const hasDataProjectId = html.includes(`data-projectId`) || html.includes(`data-project-id`) || html.includes(`dataset.projectId`) || html.includes(`dataset.projectid`);

        const hasEventEndpoint = html.includes("/api/events");

        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
        let foundOtherProjectId: string | null = null;
        if (hasSnippetJs && !hasProjectId) {
          const snippetSection = html.substring(
            Math.max(0, html.indexOf("snippet.js") - 500),
            html.indexOf("snippet.js") + 500
          );
          const uuidMatches = snippetSection.match(uuidRegex);
          if (uuidMatches && uuidMatches.length > 0) {
            foundOtherProjectId = uuidMatches[0];
          }
        }

        const verified = (hasSnippetJs && hasProjectId) || (hasProjectId && hasEventEndpoint);

        if (verified) {
          await storage.updateProject(projectId, {
            trackingVerified: true,
            trackingVerifiedAt: new Date(),
          });
        }

        let message: string;
        if (verified) {
          message = "Tracking code successfully detected on your website!";
        } else if (hasSnippetJs && foundOtherProjectId) {
          message = `Found snippet.js on your website but it's using a different project ID (${foundOtherProjectId}). Please update the tracking code on your website with the latest snippet from your current project.`;
        } else if (hasSnippetJs) {
          message = "Found snippet.js but could not find your project ID. Make sure you're using the correct tracking code.";
        } else {
          message = "Tracking code not found on the page. Make sure you've added the snippet to your website's <head> tag. Note: If this is a single-page application (SPA), the tracking code may be loaded dynamically and won't be visible in the initial HTML. The tracking will still work when visitors load the page in their browser.";
        }

        res.json({
          verified,
          foundSnippet: hasSnippetJs,
          foundProjectId: hasProjectId,
          hasDataAttribute: hasDataProjectId,
          foundOtherProjectId,
          checkedUrl: url,
          message,
        });
      } catch (fetchErr: any) {
        clearTimeout(timeout);
        if (fetchErr.name === "AbortError") {
          return res.json({
            verified: false,
            foundSnippet: false,
            checkedUrl: url,
            message: "Request timed out. Make sure the website is accessible.",
          });
        }
        return res.json({
          verified: false,
          foundSnippet: false,
          checkedUrl: url,
          message: `Could not reach the website: ${fetchErr.message}`,
        });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/test-google-credentials", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const clientId = req.body.clientId || project.googleClientId;
      const clientSecret = req.body.clientSecret || project.googleClientSecret;

      if (!clientId || !clientSecret) {
        return res.json({
          valid: false,
          message: "Client ID and Client Secret are both required.",
        });
      }

      const clientIdPattern = /^[a-zA-Z0-9\-]+\.apps\.googleusercontent\.com$/;
      if (!clientIdPattern.test(clientId)) {
        return res.json({
          valid: false,
          message: "Client ID format is invalid. It should end with .apps.googleusercontent.com",
        });
      }

      if (clientSecret.length < 10) {
        return res.json({
          valid: false,
          message: "Client Secret appears too short. Please check your credentials.",
        });
      }

      try {
        const tokenUrl = "https://oauth2.googleapis.com/token";
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(tokenUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            code: "test_invalid_code",
            redirect_uri: `${req.protocol}://${req.get("host")}/api/google/callback`,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const data = await response.json() as any;
        if (data.error === "invalid_grant" || data.error === "redirect_uri_mismatch") {
          return res.json({
            valid: true,
            message: "Credentials are valid and recognised by Google.",
          });
        } else if (data.error === "invalid_client") {
          return res.json({
            valid: false,
            message: "Google rejected these credentials. Please double-check your Client ID and Client Secret.",
          });
        } else {
          return res.json({
            valid: true,
            message: "Credentials appear valid. Google responded without an invalid_client error.",
          });
        }
      } catch (fetchErr: any) {
        return res.json({
          valid: false,
          message: "Could not reach Google to verify credentials. Please try again.",
        });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id/google-oauth-status", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });

      const hasProjectCreds = !!(project.googleClientId && project.googleClientSecret);
      const hasEnvCreds = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

      res.json({
        configured: hasProjectCreds || hasEnvCreds,
        source: hasProjectCreds ? "project" : hasEnvCreds ? "environment" : "none",
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/google/authorize/:projectId", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.projectId);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const clientId = project.googleClientId || process.env.GOOGLE_CLIENT_ID;
      const clientSecret = project.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.redirect(`/integrations?error=${encodeURIComponent("Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables, or configure them in Project Settings under the advanced section.")}`);
      }

      const provider = (req.query.provider as string) || "analytics";
      const scopes: string[] = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ];
      if (provider === "analytics" || provider === "both") {
        scopes.push("https://www.googleapis.com/auth/analytics.readonly");
      }
      if (provider === "search_console" || provider === "both") {
        scopes.push("https://www.googleapis.com/auth/webmasters.readonly");
      }

      const redirectUri = `${req.protocol}://${req.get("host")}/api/google/callback`;
      const state = JSON.stringify({ projectId: project.id, provider, userId: user.id });

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", scopes.join(" "));
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
      authUrl.searchParams.set("state", Buffer.from(state).toString("base64"));

      res.redirect(authUrl.toString());
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/google/callback", async (req, res) => {
    try {
      const { code, state, error } = req.query;
      if (error) {
        return res.redirect(`/integrations?error=${encodeURIComponent(error as string)}`);
      }
      if (!code || !state) {
        return res.redirect("/integrations?error=missing_params");
      }

      let stateData: { projectId: string; provider: string; userId: string };
      try {
        stateData = JSON.parse(Buffer.from(state as string, "base64").toString());
      } catch {
        return res.redirect("/integrations?error=invalid_state");
      }

      const project = await storage.getProject(stateData.projectId);
      if (!project) {
        return res.redirect("/integrations?error=project_not_found");
      }

      const clientId = project.googleClientId || process.env.GOOGLE_CLIENT_ID;
      const clientSecret = project.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return res.redirect("/integrations?error=missing_credentials");
      }

      const redirectUri = `${req.protocol}://${req.get("host")}/api/google/callback`;
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code as string,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenResponse.json() as any;
      if (tokenData.error) {
        return res.redirect(`/integrations?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
      }

      const tokenExpiry = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

      let accountEmail = "";
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userInfo = await userInfoRes.json() as any;
        accountEmail = userInfo.email || "";
      } catch {}

      if (stateData.provider === "analytics" || stateData.provider === "both") {
        await storage.upsertGoogleIntegration({
          projectId: stateData.projectId,
          provider: "analytics",
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || null,
          tokenExpiry,
          accountId: accountEmail,
          status: "connected",
        });
      }

      if (stateData.provider === "search_console" || stateData.provider === "both") {
        await storage.upsertGoogleIntegration({
          projectId: stateData.projectId,
          provider: "search_console",
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || null,
          tokenExpiry,
          accountId: accountEmail,
          status: "connected",
        });
      }

      res.redirect(`/integrations?success=true&provider=${stateData.provider}`);
    } catch (err: any) {
      console.error("Google OAuth callback error:", err);
      res.redirect(`/integrations?error=${encodeURIComponent(err.message)}`);
    }
  });

  app.get("/api/projects/:id/google-integrations", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const integrations = await storage.getGoogleIntegrations(project.id);
      const safe = integrations.map(({ accessToken, refreshToken, ...rest }) => rest);
      res.json(safe);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/google-integrations/:provider", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteGoogleIntegration(project.id, req.params.provider);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteProject(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  registerAdminRoutes(app);

  app.get("/landing", (_req, res) => {
    res.redirect(301, "/");
  });

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(
      `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\nDisallow: /dashboard\n\nSitemap: https://myuserjourney.co.uk/sitemap.xml\n`
    );
  });

  app.get("/sitemap.xml", async (_req, res) => {
    const baseUrl = "https://myuserjourney.co.uk";
    const staticPages = [
      { loc: "/", priority: "1.0", changefreq: "weekly" },
      { loc: "/pricing", priority: "0.9", changefreq: "monthly" },
      { loc: "/docs", priority: "0.9", changefreq: "weekly" },
      { loc: "/use-cases", priority: "0.8", changefreq: "monthly" },
      { loc: "/capabilities", priority: "0.8", changefreq: "monthly" },
      { loc: "/start-guide", priority: "0.8", changefreq: "monthly" },
      { loc: "/guides", priority: "0.7", changefreq: "monthly" },
      { loc: "/blog", priority: "0.7", changefreq: "weekly" },
      { loc: "/community", priority: "0.6", changefreq: "monthly" },
      { loc: "/connectors", priority: "0.7", changefreq: "monthly" },
      { loc: "/help-center", priority: "0.6", changefreq: "monthly" },
      { loc: "/case-studies", priority: "0.7", changefreq: "monthly" },
      { loc: "/security", priority: "0.5", changefreq: "monthly" },
      { loc: "/trust-center", priority: "0.5", changefreq: "monthly" },
      { loc: "/contact", priority: "0.6", changefreq: "monthly" },
      { loc: "/login", priority: "0.4", changefreq: "monthly" },
      { loc: "/terms", priority: "0.3", changefreq: "yearly" },
      { loc: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
    ];
    const docSlugs = [
      "quick-start-guide", "installing-the-tracking-snippet", "project-configuration",
      "understanding-the-dashboard", "real-time-analytics", "acquisition-reports",
      "engagement-metrics", "custom-events", "gdpr-compliance-guide", "consent-management",
      "ip-anonymisation", "cookieless-tracking", "ai-copilot", "predictive-analytics",
      "ux-auditor", "marketing-copilot", "google-analytics-4", "google-search-console",
      "rest-api-reference", "webhooks", "funnel-analysis", "user-journey-replay",
      "custom-reports", "data-export",
    ];
    const today = new Date().toISOString().split("T")[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    for (const page of staticPages) {
      xml += `  <url>\n    <loc>${baseUrl}${page.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }
    for (const slug of docSlugs) {
      xml += `  <url>\n    <loc>${baseUrl}/docs/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }
    try {
      const allPages = await storage.getCmsPages();
      const cmsPages = allPages.filter((p: any) => p.isPublished);
      for (const p of cmsPages) {
        xml += `  <url>\n    <loc>${baseUrl}/page/${p.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
      }
    } catch {}
    xml += `</urlset>`;
    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600");
    res.send(xml);
  });

  app.get("/api/public/site-settings", async (_req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      if (settings) {
        const { facebookConversionsApiToken, customTrackingHead, customTrackingBody, ...safe } = settings as any;
        res.json(safe);
      } else {
        res.json({});
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/public/tracking-codes", async (_req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      if (!settings) return res.json({});
      const s = settings as any;
      res.json({
        googleAnalyticsId: s.googleAnalyticsId || null,
        googleTagManagerId: s.googleTagManagerId || null,
        googleSearchConsoleCode: s.googleSearchConsoleCode || null,
        googleAdsId: s.googleAdsId || null,
        googleAdsConversionLabel: s.googleAdsConversionLabel || null,
        facebookPixelId: s.facebookPixelId || null,
        microsoftAdsId: s.microsoftAdsId || null,
        tiktokPixelId: s.tiktokPixelId || null,
        linkedinInsightTagId: s.linkedinInsightTagId || null,
        pinterestTagId: s.pinterestTagId || null,
        snapchatPixelId: s.snapchatPixelId || null,
        twitterPixelId: s.twitterPixelId || null,
        bingVerificationCode: s.bingVerificationCode || null,
        yandexVerificationCode: s.yandexVerificationCode || null,
        hotjarSiteId: s.hotjarSiteId || null,
        clarityProjectId: s.clarityProjectId || null,
        customTrackingHead: s.customTrackingHead || null,
        customTrackingBody: s.customTrackingBody || null,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/public/pages", async (_req, res) => {
    try {
      const pages = await storage.getCmsPages();
      const published = pages.filter((p: any) => p.status === "published").sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
      res.json(published);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/public/pages/:slug", async (req, res) => {
    try {
      const page = await storage.getCmsPageBySlug(String(req.params.slug));
      if (!page || (page as any).status !== "published") {
        return res.status(404).json({ message: "Page not found" });
      }
      res.json(page);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Public Blog Posts
  app.get("/api/public/blog-posts", async (_req, res) => {
    try {
      const posts = await storage.getBlogPosts(true);
      res.json(posts);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
  app.get("/api/public/blog-posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(String(req.params.slug));
      if (!post || post.status !== "published") return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Public Guides
  app.get("/api/public/guides", async (_req, res) => {
    try {
      const guides = await storage.getGuides(true);
      res.json(guides);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
  app.get("/api/public/guides/:slug", async (req, res) => {
    try {
      const guide = await storage.getGuideBySlug(String(req.params.slug));
      if (!guide || guide.status !== "published") return res.status(404).json({ message: "Guide not found" });
      res.json(guide);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Public Case Studies
  app.get("/api/public/case-studies", async (_req, res) => {
    try {
      const studies = await storage.getCaseStudies(true);
      res.json(studies);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
  app.get("/api/public/case-studies/:slug", async (req, res) => {
    try {
      const study = await storage.getCaseStudyBySlug(String(req.params.slug));
      if (!study || study.status !== "published") return res.status(404).json({ message: "Case study not found" });
      res.json(study);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Public Help Articles
  app.get("/api/public/help-articles", async (_req, res) => {
    try {
      const articles = await storage.getHelpArticles(true);
      res.json(articles);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });
  app.get("/api/public/help-articles/:slug", async (req, res) => {
    try {
      const article = await storage.getHelpArticleBySlug(String(req.params.slug));
      if (!article || article.status !== "published") return res.status(404).json({ message: "Article not found" });
      res.json(article);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/public/contact", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email, and message are required" });
      }
      const submission = await storage.createContactSubmission({ name, email, message });
      const smtpConfig = await storage.getSmtpSettings();
      if (smtpConfig && smtpConfig.isActive) {
        try {
          const siteConfig = await storage.getSiteSettings();
          const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.encryption === "ssl",
            auth: { user: smtpConfig.username, pass: smtpConfig.password },
          });
          const cFromEmail = (smtpConfig.fromEmail || smtpConfig.username || "").trim();
          const cFromName = (smtpConfig.fromName || "").trim();
          const cToEmail = ((siteConfig && siteConfig.contactEmail) || cFromEmail).trim();
          await transporter.sendMail({
            from: cFromName ? `"${cFromName}" <${cFromEmail}>` : cFromEmail,
            to: cToEmail,
            envelope: {
              from: cFromEmail,
              to: cToEmail,
            },
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
          });
        } catch (_emailErr) {}
      }
      res.status(201).json(submission);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // CORS for event collection (tracking snippet sends from external sites)
  app.options("/api/events", (_req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "86400");
    res.status(204).end();
  });

  // Events (JS Snippet collector)
  app.post("/api/events", async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    try {
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch { return res.status(400).json({ message: "Invalid JSON" }); }
      }
      if (req.rawBody && (!body || Object.keys(body).length === 0)) {
        try { body = JSON.parse(req.rawBody.toString()); } catch { return res.status(400).json({ message: "Invalid body" }); }
      }

      const gdprSettings = body.projectId ? await storage.getConsentSettings(body.projectId) : null;
      const shouldAnonymizeIp = gdprSettings?.anonymizeIp === "true" || !gdprSettings;
      const respectDnt = gdprSettings?.respectDnt === "true" || !gdprSettings;
      const cookielessMode = gdprSettings?.cookielessMode === "true";
      const consentMode = gdprSettings?.consentMode || "opt-in";

      if (respectDnt) {
        const dnt = req.headers["dnt"] || body.dnt;
        if (dnt === "1" || dnt === 1) {
          res.status(200).json({ message: "DNT respected, event not recorded" });
          return;
        }
      }

      if (consentMode === "opt-in") {
        if (body.consentGiven !== true && body.consentGiven !== "true") {
          res.status(200).json({ message: "Consent not given, event not recorded" });
          return;
        }
      }

      let ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
        || req.headers["x-real-ip"] as string
        || req.socket.remoteAddress
        || "";

      const geoData = await resolveGeo(ip);

      if (shouldAnonymizeIp) {
        ip = anonymizeIp(ip);
      }

      const ua = (body.userAgent || req.headers["user-agent"] || "").toLowerCase();
      const botPatterns = [
        "bot", "crawl", "spider", "slurp", "bingpreview", "mediapartners",
        "facebookexternalhit", "twitterbot", "linkedinbot", "whatsapp",
        "telegrambot", "applebot", "google", "yandex", "baidu",
        "semrush", "ahrefs", "mj12bot", "dotbot", "petalbot",
        "headless", "phantom", "puppeteer", "playwright", "selenium",
      ];
      const isBot = botPatterns.some((p) => ua.includes(p)) ? "true" : "false";

      const serverPatterns = [
        "curl", "wget", "httpie", "python-requests", "python-urllib",
        "node-fetch", "axios", "got/", "undici", "java/", "apache-httpclient",
        "go-http-client", "ruby", "perl", "php/", "libwww", "mechanize",
        "scrapy", "httpclient", "okhttp", "cron", "monitor", "uptime",
        "pingdom", "newrelic", "datadog", "statuspage", "uptimerobot",
        "site24x7", "nagios", "zabbix", "munin", "healthcheck",
        "vercel", "netlify", "cloudflare-worker", "aws-sdk",
        "google-cloud", "azure", "render", "railway",
      ];
      const isServer = serverPatterns.some((p) => ua.includes(p)) || !ua || ua === "unknown" ? "true" : "false";

      const project = await storage.getProject(body.projectId);
      const projectDomain = (project?.domain || "").replace(/^www\./, "").toLowerCase();
      const pageDomain = (body.hostname || "").replace(/^www\./, "").toLowerCase();

      let isInternal = "false";
      if (ip && (ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.16.") || ip === "127.0.0.1" || ip === "::1")) {
        isInternal = "true";
      }

      const ipRules = await storage.getInternalIpRules(body.projectId);
      for (const rule of ipRules) {
        if (rule.ruleType === "exact" && ip === rule.ip) {
          isInternal = "true";
          break;
        }
        if (rule.ruleType === "prefix" && ip.startsWith(rule.ip)) {
          isInternal = "true";
          break;
        }
        if (rule.ruleType === "cidr") {
          const [ruleIp, bits] = rule.ip.split("/");
          if (bits && ipMatchesCidr(ip, ruleIp, parseInt(bits))) {
            isInternal = "true";
            break;
          }
        }
      }

      let trafficSource = classifyTrafficSource(body.referrer, body.page, projectDomain);

      const eventData = {
        projectId: body.projectId,
        visitorId: cookielessMode ? null : (body.visitorId || null),
        sessionId: cookielessMode ? null : (body.sessionId || null),
        eventType: body.eventType || "pageview",
        page: body.page,
        referrer: body.referrer,
        device: body.device,
        browser: body.browser,
        os: body.os,
        country: geoData.country || body.country || null,
        city: geoData.city || null,
        region: geoData.region || null,
        ip: shouldAnonymizeIp ? ip : (ip || null),
        isBot,
        isInternal,
        isServer,
        trafficSource,
        metadata: body.metadata,
      };
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Events for a project
  app.get("/api/projects/:id/events", async (req, res) => {
    try {
      const events = await storage.getEvents(req.params.id);
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Visitor journeys - grouped by visitorId/sessionId
  app.get("/api/projects/:id/journeys", async (req, res) => {
    try {
      const allEvents = await storage.getEvents(req.params.id, 1000);
      const sessionMap = new Map<string, any[]>();
      allEvents.forEach((e) => {
        const key = e.sessionId || e.visitorId || e.id;
        if (!sessionMap.has(key)) sessionMap.set(key, []);
        sessionMap.get(key)!.push(e);
      });
      const journeys = Array.from(sessionMap.entries()).map(([sessionId, evts]) => {
        evts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const first = evts[0];
        const last = evts[evts.length - 1];
        const duration = Math.round((new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / 1000);
        const pages = evts.filter((e) => e.eventType === "pageview").map((e) => e.page);
        return {
          sessionId,
          visitorId: first.visitorId || "anonymous",
          device: first.device,
          browser: first.browser,
          os: first.os,
          country: first.country,
          city: first.city,
          region: first.region,
          isBot: first.isBot,
          isInternal: first.isInternal,
          startTime: first.timestamp,
          endTime: last.timestamp,
          duration,
          pageCount: pages.length,
          pages,
          eventCount: evts.length,
          events: evts,
          referrer: first.referrer,
          searchKeyword: extractSearchKeyword(first.referrer),
        };
      });
      journeys.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      res.json(journeys);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Visitors list - unique visitors with aggregated info
  app.get("/api/projects/:id/visitors", async (req, res) => {
    try {
      const allEvents = await storage.getEvents(req.params.id, 5000);
      const visitorMap = new Map<string, any>();
      allEvents.forEach((e) => {
        const vid = e.visitorId || `anon-${e.device}-${e.browser}-${e.os}`;
        if (!visitorMap.has(vid)) {
          visitorMap.set(vid, {
            visitorId: vid,
            device: e.device,
            browser: e.browser,
            os: e.os,
            country: e.country,
            city: e.city,
            region: e.region,
            ip: e.ip,
            isBot: e.isBot,
            isInternal: e.isInternal,
            firstSeen: e.timestamp,
            lastSeen: e.timestamp,
            totalEvents: 0,
            totalPageViews: 0,
            totalSessions: new Set<string>(),
            pages: new Set<string>(),
          });
        }
        const v = visitorMap.get(vid)!;
        v.totalEvents++;
        if (e.eventType === "pageview") v.totalPageViews++;
        if (e.sessionId) v.totalSessions.add(e.sessionId);
        if (e.page) v.pages.add(e.page);
        if (new Date(e.timestamp) < new Date(v.firstSeen)) v.firstSeen = e.timestamp;
        if (new Date(e.timestamp) > new Date(v.lastSeen)) v.lastSeen = e.timestamp;
      });
      const visitors = Array.from(visitorMap.values()).map((v) => ({
        ...v,
        totalSessions: v.totalSessions.size || 1,
        pages: Array.from(v.pages),
      }));
      visitors.sort((a: any, b: any) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
      res.json(visitors);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Export events data as JSON or CSV
  app.get("/api/projects/:id/export", async (req, res) => {
    try {
      const format = req.query.format === "csv" ? "csv" : "json";
      const allEvents = await storage.getEvents(req.params.id, 10000);

      if (format === "csv") {
        const headers = ["id", "visitorId", "sessionId", "eventType", "page", "referrer", "device", "browser", "os", "country", "city", "region", "ip", "isBot", "isInternal", "timestamp"];
        const rows = allEvents.map((e) =>
          headers.map((h) => {
            const val = (e as any)[h];
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
          }).join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="events-export.csv"`);
        res.send(csv);
      } else {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="events-export.json"`);
        res.json(allEvents);
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Analytics summary
  app.get("/api/projects/:id/analytics", async (req, res) => {
    try {
      const summary = await storage.getAnalyticsSummary(req.params.id);
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Comparison analytics - compare current period vs previous period
  app.get("/api/projects/:id/analytics/compare", async (req, res) => {
    try {
      const period = (req.query.period as string) || "daily";
      let currentFrom: Date, currentTo: Date, previousFrom: Date, previousTo: Date;

      if (req.query.from && req.query.to) {
        const { from, to } = parseDateRange(req.query);
        currentFrom = from;
        currentTo = to;
        const diff = currentTo.getTime() - currentFrom.getTime();
        previousFrom = new Date(currentFrom.getTime() - diff);
        previousTo = new Date(currentFrom.getTime());
      } else {
        const now = new Date();
        switch (period) {
          case "hourly":
            currentTo = now;
            currentFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            previousTo = new Date(currentFrom);
            previousFrom = new Date(currentFrom.getTime() - 24 * 60 * 60 * 1000);
            break;
          case "weekly":
            currentTo = now;
            currentFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            previousTo = new Date(currentFrom);
            previousFrom = new Date(currentFrom.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "monthly":
            currentTo = now;
            currentFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            previousTo = new Date(currentFrom);
            previousFrom = new Date(currentFrom.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "all":
            currentTo = now;
            currentFrom = new Date(0);
            previousTo = now;
            previousFrom = new Date(0);
            break;
          default: // daily
            currentTo = now;
            currentFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            previousTo = new Date(currentFrom);
            previousFrom = new Date(currentFrom.getTime() - 24 * 60 * 60 * 1000);
            break;
        }
      }

      const currentEvents = await storage.getEventsByDateRange(req.params.id, currentFrom, currentTo);
      const previousEvents = period === "all" ? [] : await storage.getEventsByDateRange(req.params.id, previousFrom, previousTo);

      function computeMetrics(evts: any[]) {
        const pageViews = evts.filter(e => e.eventType === "pageview").length;
        const clicks = evts.filter(e => e.eventType === "click").length;
        const uniqueVisitors = new Set(evts.map(e => e.visitorId || `${e.device}-${e.browser}`)).size;
        const sessions = new Set(evts.map(e => e.sessionId || e.id)).size;
        const bots = evts.filter(e => e.isBot === "true").length;
        const internal = evts.filter(e => e.isInternal === "true").length;
        const bounceRate = sessions > 0 ? Math.round((evts.filter(e => {
          const sid = e.sessionId || e.id;
          return evts.filter(ev => (ev.sessionId || ev.id) === sid).length === 1;
        }).length / sessions) * 100) : 0;
        return { pageViews, clicks, uniqueVisitors, sessions, bots, internal, bounceRate, totalEvents: evts.length };
      }

      const current = computeMetrics(currentEvents);
      const previous = computeMetrics(previousEvents);

      function pctChange(curr: number, prev: number): number | null {
        if (period === "all") return null;
        if (prev === 0) return curr > 0 ? 100 : 0;
        return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
      }

      // Build time-series data based on period
      function buildTimeSeries(evts: any[], granularity: string) {
        const buckets = new Map<string, { pageViews: number; clicks: number; visitors: Set<string>; events: number }>();
        evts.forEach(e => {
          const ts = new Date(e.timestamp);
          let key: string;
          switch (granularity) {
            case "hourly":
              key = `${ts.getMonth()+1}/${ts.getDate()} ${ts.getHours()}:00`;
              break;
            case "weekly":
            case "daily":
              key = `${ts.getMonth()+1}/${ts.getDate()}`;
              break;
            case "monthly":
              key = `${ts.getFullYear()}-${String(ts.getMonth()+1).padStart(2, '0')}`;
              break;
            default:
              key = `${ts.getMonth()+1}/${ts.getDate()}`;
          }
          if (!buckets.has(key)) buckets.set(key, { pageViews: 0, clicks: 0, visitors: new Set(), events: 0 });
          const b = buckets.get(key)!;
          if (e.eventType === "pageview") b.pageViews++;
          if (e.eventType === "click") b.clicks++;
          b.visitors.add(e.visitorId || e.id);
          b.events++;
        });
        return Array.from(buckets.entries())
          .map(([label, d]) => ({ label, pageViews: d.pageViews, clicks: d.clicks, visitors: d.visitors.size, events: d.events }))
          .sort((a, b) => a.label.localeCompare(b.label));
      }

      // Dimension breakdowns
      function buildBreakdown(evts: any[], field: string) {
        const map = new Map<string, number>();
        evts.forEach(e => {
          const val = (e as any)[field] || "Unknown";
          map.set(val, (map.get(val) || 0) + 1);
        });
        return Array.from(map.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }

      res.json({
        period,
        dateRange: { from: currentFrom.toISOString(), to: currentTo.toISOString() },
        previousDateRange: period !== "all" ? { from: previousFrom.toISOString(), to: previousTo.toISOString() } : null,
        current,
        previous: period !== "all" ? previous : null,
        changes: {
          pageViews: pctChange(current.pageViews, previous.pageViews),
          clicks: pctChange(current.clicks, previous.clicks),
          uniqueVisitors: pctChange(current.uniqueVisitors, previous.uniqueVisitors),
          sessions: pctChange(current.sessions, previous.sessions),
          bounceRate: pctChange(current.bounceRate, previous.bounceRate),
          totalEvents: pctChange(current.totalEvents, previous.totalEvents),
        },
        timeSeries: buildTimeSeries(currentEvents, period),
        breakdowns: {
          device: buildBreakdown(currentEvents, "device"),
          browser: buildBreakdown(currentEvents, "browser"),
          country: buildBreakdown(currentEvents, "country"),
          page: buildBreakdown(currentEvents, "page"),
          referrer: buildBreakdown(currentEvents, "referrer"),
          eventType: buildBreakdown(currentEvents, "eventType"),
          os: buildBreakdown(currentEvents, "os"),
          city: buildBreakdown(currentEvents, "city"),
        },
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Custom Reports CRUD
  app.get("/api/projects/:id/reports", async (req, res) => {
    try {
      const reports = await storage.getCustomReports(req.params.id);
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id/reports/:reportId", async (req, res) => {
    try {
      const report = await storage.getCustomReport(req.params.reportId);
      if (!report || report.projectId !== req.params.id) return res.status(404).json({ message: "Report not found" });
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/reports", async (req, res) => {
    try {
      const report = await storage.createCustomReport({
        projectId: req.params.id,
        name: req.body.name,
        description: req.body.description || null,
        metrics: req.body.metrics || ["pageViews"],
        dimensions: req.body.dimensions || ["date"],
        chartType: req.body.chartType || "line",
        dateRange: req.body.dateRange || "last_30_days",
        filters: req.body.filters || null,
      });
      res.status(201).json(report);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/projects/:id/reports/:reportId", async (req, res) => {
    try {
      const existing = await storage.getCustomReport(req.params.reportId);
      if (!existing || existing.projectId !== req.params.id) return res.status(404).json({ message: "Report not found" });
      const report = await storage.updateCustomReport(req.params.reportId, {
        name: req.body.name,
        description: req.body.description,
        metrics: req.body.metrics,
        dimensions: req.body.dimensions,
        chartType: req.body.chartType,
        dateRange: req.body.dateRange,
        filters: req.body.filters,
      });
      res.json(report);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/reports/:reportId", async (req, res) => {
    try {
      const existing = await storage.getCustomReport(req.params.reportId);
      if (!existing || existing.projectId !== req.params.id) return res.status(404).json({ message: "Report not found" });
      await storage.deleteCustomReport(req.params.reportId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Execute a custom report - returns data based on report config
  app.get("/api/projects/:id/reports/:reportId/data", async (req, res) => {
    try {
      const report = await storage.getCustomReport(req.params.reportId);
      if (!report || report.projectId !== req.params.id) return res.status(404).json({ message: "Report not found" });

      const now = new Date();
      let from: Date, to: Date;

      if (req.query.from && req.query.to) {
        from = new Date(req.query.from as string);
        to = new Date(req.query.to as string);
      } else {
        const period = (req.query.period as string) || report.dateRange;
        switch (period) {
          case "today":
            from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            to = now;
            break;
          case "yesterday":
            from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case "last_7_days":
            from = new Date(now.getTime() - 7 * 86400000);
            to = now;
            break;
          case "last_28_days":
            from = new Date(now.getTime() - 28 * 86400000);
            to = now;
            break;
          case "last_90_days":
            from = new Date(now.getTime() - 90 * 86400000);
            to = now;
            break;
          case "last_12_months":
            from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            to = now;
            break;
          case "this_week": {
            const day = now.getDay();
            const diff = day === 0 ? 6 : day - 1;
            from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
            to = now;
            break;
          }
          case "this_month":
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = now;
            break;
          case "last_month":
            from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            break;
          case "this_year":
            from = new Date(now.getFullYear(), 0, 1);
            to = now;
            break;
          case "all_time":
            from = new Date(0);
            to = now;
            break;
          default: // last_30_days
            from = new Date(now.getTime() - 30 * 86400000);
            to = now;
        }
      }

      const evts = await storage.getEventsByDateRange(req.params.id, from, to);

      // Apply filters
      let filtered = evts;
      const filters = report.filters as any;
      if (filters) {
        if (filters.excludeBots) filtered = filtered.filter(e => e.isBot !== "true");
        if (filters.excludeInternal) filtered = filtered.filter(e => e.isInternal !== "true");
        if (filters.eventType) filtered = filtered.filter(e => e.eventType === filters.eventType);
        if (filters.device) filtered = filtered.filter(e => e.device === filters.device);
        if (filters.country) filtered = filtered.filter(e => e.country === filters.country);
        if (filters.page) filtered = filtered.filter(e => e.page && e.page.includes(filters.page));
      }

      // Build data based on dimensions and metrics
      const primaryDimension = report.dimensions[0] || "date";
      const buckets = new Map<string, any>();

      filtered.forEach(e => {
        let dimKey: string;
        const ts = new Date(e.timestamp);
        switch (primaryDimension) {
          case "date": dimKey = ts.toISOString().slice(0, 10); break;
          case "hour": dimKey = `${ts.toISOString().slice(0, 10)} ${ts.getHours()}:00`; break;
          case "month": dimKey = ts.toISOString().slice(0, 7); break;
          case "week": {
            const weekStart = new Date(ts);
            weekStart.setDate(ts.getDate() - ts.getDay());
            dimKey = `Week of ${weekStart.toISOString().slice(0, 10)}`;
            break;
          }
          case "page": dimKey = e.page || "/"; break;
          case "device": dimKey = e.device || "Unknown"; break;
          case "browser": dimKey = e.browser || "Unknown"; break;
          case "country": dimKey = e.country || "Unknown"; break;
          case "city": dimKey = e.city || "Unknown"; break;
          case "referrer": dimKey = e.referrer || "Direct"; break;
          case "os": dimKey = e.os || "Unknown"; break;
          case "eventType": dimKey = e.eventType; break;
          default: dimKey = ts.toISOString().slice(0, 10);
        }

        if (!buckets.has(dimKey)) {
          buckets.set(dimKey, {
            dimension: dimKey,
            pageViews: 0,
            clicks: 0,
            events: 0,
            visitors: new Set<string>(),
            sessions: new Set<string>(),
            scrolls: 0,
            formSubmits: 0,
            rageClicks: 0,
            bots: 0,
          });
        }
        const b = buckets.get(dimKey)!;
        b.events++;
        if (e.eventType === "pageview") b.pageViews++;
        if (e.eventType === "click") b.clicks++;
        if (e.eventType === "scroll") b.scrolls++;
        if (e.eventType === "form_submit") b.formSubmits++;
        if (e.eventType === "rage_click") b.rageClicks++;
        if (e.isBot === "true") b.bots++;
        b.visitors.add(e.visitorId || e.id);
        b.sessions.add(e.sessionId || e.id);
      });

      const rows = Array.from(buckets.values()).map(b => {
        const row: any = { dimension: b.dimension };
        report.metrics.forEach(m => {
          switch (m) {
            case "pageViews": row.pageViews = b.pageViews; break;
            case "clicks": row.clicks = b.clicks; break;
            case "events": row.events = b.events; break;
            case "visitors": row.visitors = b.visitors.size; break;
            case "sessions": row.sessions = b.sessions.size; break;
            case "scrolls": row.scrolls = b.scrolls; break;
            case "formSubmits": row.formSubmits = b.formSubmits; break;
            case "rageClicks": row.rageClicks = b.rageClicks; break;
            case "bots": row.bots = b.bots; break;
            case "bounceRate": {
              const singleSession = Array.from(b.sessions).filter(sid =>
                filtered.filter(e => (e.sessionId || e.id) === sid).length === 1
              ).length;
              row.bounceRate = b.sessions.size > 0 ? Math.round((singleSession / b.sessions.size) * 100) : 0;
              break;
            }
          }
        });
        return row;
      });

      // Sort based on dimension type
      const isTimeDimension = ["date", "hour", "month", "week"].includes(primaryDimension);
      if (isTimeDimension) {
        rows.sort((a, b) => a.dimension.localeCompare(b.dimension));
      } else {
        const sortMetric = report.metrics[0] || "events";
        rows.sort((a, b) => (b[sortMetric] || 0) - (a[sortMetric] || 0));
      }

      res.json({
        report: {
          id: report.id,
          name: report.name,
          chartType: report.chartType,
          metrics: report.metrics,
          dimensions: report.dimensions,
          dateRange: report.dateRange,
        },
        totalEvents: filtered.length,
        rows: rows.slice(0, 100),
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // GDPR Consent Settings
  app.get("/api/projects/:id/consent-settings", async (req, res) => {
    try {
      const settings = await storage.getConsentSettings(req.params.id);
      res.json(settings || { projectId: req.params.id });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/consent-settings", async (req, res) => {
    try {
      const body = req.body;
      const settings = await storage.upsertConsentSettings({
        projectId: req.params.id,
        consentMode: body.consentMode || "opt-in",
        anonymizeIp: body.anonymizeIp ?? "true",
        respectDnt: body.respectDnt ?? "true",
        dataRetentionDays: body.dataRetentionDays || 365,
        cookielessMode: body.cookielessMode ?? "false",
        bannerEnabled: body.bannerEnabled ?? "true",
        bannerTitle: body.bannerTitle || "We value your privacy",
        bannerMessage: body.bannerMessage || "",
        bannerAcceptText: body.bannerAcceptText || "Accept All",
        bannerDeclineText: body.bannerDeclineText || "Reject All",
        bannerCustomiseText: body.bannerCustomiseText || "Customise",
        bannerSavePreferencesText: body.bannerSavePreferencesText || "Save My Preferences",
        bannerPosition: body.bannerPosition || "bottom",
        bannerLayout: body.bannerLayout || "bar",
        bannerTheme: body.bannerTheme || "auto",
        bannerBgColor: body.bannerBgColor || null,
        bannerTextColor: body.bannerTextColor || null,
        bannerBtnBgColor: body.bannerBtnBgColor || null,
        bannerBtnTextColor: body.bannerBtnTextColor || null,
        bannerAcceptBgColor: body.bannerAcceptBgColor || null,
        bannerAcceptTextColor: body.bannerAcceptTextColor || null,
        bannerBorderColor: body.bannerBorderColor || null,
        bannerFontFamily: body.bannerFontFamily || null,
        bannerFontSize: body.bannerFontSize || null,
        privacyPolicyUrl: body.privacyPolicyUrl || null,
        granularConsent: body.granularConsent ?? "true",
        categoryAnalytics: body.categoryAnalytics ?? "true",
        categoryFunctional: body.categoryFunctional ?? "false",
        categoryPerformance: body.categoryPerformance ?? "false",
        categoryMarketing: body.categoryMarketing ?? "false",
        categoryAdvertisement: body.categoryAdvertisement ?? "false",
        categoryPersonalization: body.categoryPersonalization ?? "false",
        categoryAnalyticsDesc: body.categoryAnalyticsDesc || null,
        categoryFunctionalDesc: body.categoryFunctionalDesc || null,
        categoryPerformanceDesc: body.categoryPerformanceDesc || null,
        categoryMarketingDesc: body.categoryMarketingDesc || null,
        categoryAdvertisementDesc: body.categoryAdvertisementDesc || null,
        categoryPersonalizationDesc: body.categoryPersonalizationDesc || null,
        showCookieList: body.showCookieList ?? "true",
        consentVersion: body.consentVersion || 1,
        legalBasis: body.legalBasis || "consent",
        jurisdiction: body.jurisdiction || "eu_uk",
        useThirdPartyBanner: body.useThirdPartyBanner ?? "false",
        thirdPartyProvider: body.thirdPartyProvider || null,
      });
      res.json(settings);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Public endpoint: get consent config for snippet (no auth needed, CORS enabled)
  app.get("/api/consent-config/:projectId", async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    try {
      const settings = await storage.getConsentSettings(req.params.projectId);
      res.json(settings || {
        consentMode: "opt-in",
        anonymizeIp: "true",
        respectDnt: "true",
        cookielessMode: "false",
        bannerEnabled: "true",
        bannerTitle: "We value your privacy",
        bannerMessage: "We use cookies on our website to give you the most relevant experience.",
        bannerAcceptText: "Accept All",
        bannerDeclineText: "Reject All",
        bannerCustomiseText: "Customise",
        bannerSavePreferencesText: "Save My Preferences",
        bannerPosition: "bottom",
        bannerLayout: "bar",
        bannerTheme: "auto",
        privacyPolicyUrl: null,
        granularConsent: "true",
        categoryAnalytics: "true",
        categoryFunctional: "false",
        categoryPerformance: "false",
        categoryMarketing: "false",
        categoryAdvertisement: "false",
        categoryPersonalization: "false",
        showCookieList: "true",
        consentVersion: 1,
        jurisdiction: "eu_uk",
        useThirdPartyBanner: "false",
        thirdPartyProvider: null,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Record consent from visitor (public, CORS enabled)
  app.options("/api/consent", (_req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).end();
  });

  app.post("/api/consent", async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    try {
      let body = req.body;
      if (typeof body === "string") {
        try { body = JSON.parse(body); } catch { return res.status(400).json({ message: "Invalid JSON" }); }
      }
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
        || req.headers["x-real-ip"] as string
        || req.socket.remoteAddress || "";
      const ipHash = hashIp(ip);
      const record = await storage.createConsentRecord({
        projectId: body.projectId,
        visitorId: body.visitorId,
        consentGiven: body.consentGiven ? "true" : "false",
        ipHash,
        userAgent: body.userAgent || null,
        consentVersion: body.consentVersion || null,
        categoriesAccepted: body.categoriesAccepted || null,
      });
      res.status(201).json(record);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // GDPR Right to Erasure (Right to be Forgotten)
  app.delete("/api/projects/:id/visitor/:visitorId", async (req, res) => {
    try {
      const result = await storage.deleteVisitorData(req.params.id, req.params.visitorId);
      res.json({
        success: true,
        message: `Deleted ${result.eventsDeleted} events and ${result.consentsDeleted} consent records for visitor ${req.params.visitorId}`,
        ...result,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // GDPR Data Portability (Visitor Data Export)
  app.get("/api/projects/:id/visitor/:visitorId/data", async (req, res) => {
    try {
      const data = await storage.getVisitorData(req.params.id, req.params.visitorId);
      const format = req.query.format === "csv" ? "csv" : "json";
      if (format === "csv") {
        const headers = ["id", "eventType", "page", "referrer", "device", "browser", "os", "country", "city", "timestamp"];
        const rows = data.events.map(e =>
          headers.map(h => {
            const val = (e as any)[h];
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
          }).join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename="visitor-${req.params.visitorId}-data.csv"`);
        res.send(csv);
      } else {
        res.setHeader("Content-Disposition", `attachment; filename="visitor-${req.params.visitorId}-data.json"`);
        res.json({
          visitorId: req.params.visitorId,
          projectId: req.params.id,
          exportDate: new Date().toISOString(),
          events: data.events.map(e => ({
            id: e.id,
            eventType: e.eventType,
            page: e.page,
            referrer: e.referrer,
            device: e.device,
            browser: e.browser,
            os: e.os,
            country: e.country,
            city: e.city,
            region: e.region,
            timestamp: e.timestamp,
            metadata: e.metadata,
          })),
          consentRecords: data.consents,
        });
      }
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Data Retention Purge
  app.post("/api/projects/:id/purge", async (req, res) => {
    try {
      const settings = await storage.getConsentSettings(req.params.id);
      const retentionDays = req.body.retentionDays || settings?.dataRetentionDays || 365;
      const deleted = await storage.purgeOldEvents(req.params.id, retentionDays);
      res.json({
        success: true,
        message: `Purged ${deleted} events older than ${retentionDays} days`,
        eventsDeleted: deleted,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Consent records for a project
  app.get("/api/projects/:id/consent-records", async (req, res) => {
    try {
      const visitorId = req.query.visitorId as string | undefined;
      const records = await storage.getConsentRecords(req.params.id, visitorId);
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // SEO
  app.get("/api/projects/:id/seo", async (req, res) => {
    try {
      const analyses = await storage.getSeoAnalyses(req.params.id);
      res.json(analyses);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/seo", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ message: "URL is required" });

      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
        cleanUrl = `https://${cleanUrl}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      let html = "";
      let fetchStatus = 0;
      let loadTimeMs = 0;

      try {
        const startTime = Date.now();
        const response = await fetch(cleanUrl, {
          signal: controller.signal,
          headers: { "User-Agent": "DigitalAnalystBot/1.0 (SEO Analyzer)" },
          redirect: "follow",
        });
        loadTimeMs = Date.now() - startTime;
        fetchStatus = response.status;
        clearTimeout(timeout);
        html = (await response.text()).slice(0, 2 * 1024 * 1024);
      } catch (fetchErr: any) {
        clearTimeout(timeout);
        return res.status(400).json({ message: `Failed to fetch URL: ${fetchErr.message}` });
      }

      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i)
        || html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["']/i);
      const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
      const h2Matches = html.match(/<h2[^>]*>[\s\S]*?<\/h2>/gi) || [];
      const h3Matches = html.match(/<h3[^>]*>[\s\S]*?<\/h3>/gi) || [];
      const imgMatches = html.match(/<img[^>]*>/gi) || [];
      const imgsNoAlt = imgMatches.filter((img: string) => !img.match(/alt=["'][^"']+["']/i)).length;
      const parsedDomain = cleanUrl.replace(/^https?:\/\//, "").split("/")[0];
      const allHrefs = html.match(/href=["']([^"']+)["']/gi) || [];
      let internalLinkCount = 0;
      let externalLinkCount = 0;
      for (const h of allHrefs) {
        const val = h.replace(/^href=["']|["']$/gi, "");
        if (val.startsWith("#") || val.startsWith("mailto:") || val.startsWith("tel:") || val.startsWith("javascript:")) continue;
        if (val.startsWith("/") || val.includes(parsedDomain)) internalLinkCount++;
        else if (val.startsWith("http")) externalLinkCount++;
      }
      const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([\s\S]*?)["']/i);
      const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([\s\S]*?)["']/i);
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i);
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i);
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([\s\S]*?)["']/i);
      const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([\s\S]*?)["']/i);
      const charsetMatch = html.match(/<meta[^>]*charset=["']?([^"'\s>]+)/i);
      const schemaMatch = html.match(/application\/ld\+json/i);
      const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
      const faviconMatch = html.match(/<link[^>]*rel=["'](icon|shortcut icon)["'][^>]*/i);

      const title = titleMatch ? titleMatch[1].trim() : null;
      const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : null;
      const headingsCount = h1Matches.length + h2Matches.length + h3Matches.length;

      const issues: any[] = [];
      const recommendations: string[] = [];

      if (!title) {
        issues.push({ type: "title", label: "Missing page title tag", severity: "error" });
        recommendations.push("Add a descriptive <title> tag to the page");
      } else if (title.length > 60) {
        issues.push({ type: "title", label: `Title too long (${title.length} chars, max 60)`, severity: "warning" });
        recommendations.push("Shorten the title to 60 characters or less for optimal display in search results");
      } else if (title.length < 10) {
        issues.push({ type: "title", label: `Title too short (${title.length} chars, min 10)`, severity: "warning" });
        recommendations.push("Expand the title to be more descriptive (at least 10 characters)");
      }

      if (!metaDesc) {
        issues.push({ type: "meta", label: "Missing meta description", severity: "error" });
        recommendations.push("Add a meta description between 120-160 characters summarizing the page content");
      } else if (metaDesc.length > 160) {
        issues.push({ type: "meta", label: `Meta description too long (${metaDesc.length} chars, max 160)`, severity: "warning" });
        recommendations.push("Shorten meta description to 160 characters or fewer");
      } else if (metaDesc.length < 70) {
        issues.push({ type: "meta", label: `Meta description too short (${metaDesc.length} chars, min 70)`, severity: "warning" });
        recommendations.push("Expand meta description to at least 70 characters for better search snippet display");
      }

      if (h1Matches.length === 0) {
        issues.push({ type: "headings", label: "Missing H1 tag", severity: "error" });
        recommendations.push("Add a single H1 heading that describes the main topic of the page");
      } else if (h1Matches.length > 1) {
        issues.push({ type: "headings", label: `Multiple H1 tags found (${h1Matches.length})`, severity: "warning" });
        recommendations.push("Use only one H1 tag per page for better SEO structure");
      }

      if (imgsNoAlt > 0) {
        issues.push({ type: "images", label: `${imgsNoAlt} of ${imgMatches.length} images missing alt text`, severity: "warning" });
        recommendations.push("Add descriptive alt text to all images for accessibility and SEO");
      }

      if (!canonicalMatch) {
        issues.push({ type: "canonical", label: "Missing canonical URL", severity: "warning" });
        recommendations.push("Add a canonical link tag to prevent duplicate content issues");
      }

      if (!ogTitleMatch || !ogDescMatch) {
        issues.push({ type: "social", label: "Missing or incomplete Open Graph tags", severity: "warning" });
        recommendations.push("Add og:title, og:description, and og:image meta tags for better social media sharing");
      }

      if (!ogImageMatch) {
        issues.push({ type: "social", label: "Missing og:image tag", severity: "info" });
      }

      if (!viewportMatch) {
        issues.push({ type: "mobile", label: "Missing viewport meta tag", severity: "error" });
        recommendations.push("Add a viewport meta tag for proper mobile rendering");
      }

      if (!schemaMatch) {
        issues.push({ type: "structured-data", label: "No structured data (Schema.org) detected", severity: "info" });
        recommendations.push("Add structured data (JSON-LD) for better search result appearance (rich snippets)");
      }

      if (!langMatch) {
        issues.push({ type: "accessibility", label: "Missing lang attribute on <html> tag", severity: "warning" });
        recommendations.push("Add a lang attribute to the <html> tag (e.g., lang=\"en\")");
      }

      if (!faviconMatch) {
        issues.push({ type: "branding", label: "No favicon detected", severity: "info" });
        recommendations.push("Add a favicon for better brand recognition in browser tabs and bookmarks");
      }

      if (internalLinkCount < 3) {
        issues.push({ type: "links", label: `Only ${internalLinkCount} internal links found`, severity: "warning" });
        recommendations.push("Add more internal links to improve site navigation and SEO link equity");
      }

      if (loadTimeMs > 3000) {
        issues.push({ type: "performance", label: `Slow server response (${loadTimeMs}ms)`, severity: "warning" });
        recommendations.push("Optimize server response time - aim for under 2 seconds");
      } else {
        issues.push({ type: "performance", label: `Server response time: ${loadTimeMs}ms`, severity: "info" });
      }

      if (fetchStatus !== 200) {
        issues.push({ type: "status", label: `HTTP status ${fetchStatus} returned`, severity: "error" });
      }

      let score = 100;
      for (const issue of issues) {
        if (issue.severity === "error") score -= 15;
        else if (issue.severity === "warning") score -= 8;
        else if (issue.severity === "info") score -= 2;
      }
      if (score < 0) score = 0;

      const analysis = await storage.createSeoAnalysis({
        projectId: req.params.id,
        url: cleanUrl,
        score,
        metaTitle: title || null,
        metaDescription: metaDesc || null,
        headingsCount,
        imagesWithoutAlt: imgsNoAlt,
        internalLinks: internalLinkCount,
        externalLinks: externalLinkCount,
        issues,
        recommendations,
      });

      res.status(201).json(analysis);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // PPC
  app.get("/api/projects/:id/ppc", async (req, res) => {
    try {
      const campaigns = await storage.getPpcCampaigns(req.params.id);
      res.json(campaigns);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/ppc", async (req, res) => {
    try {
      const campaign = await storage.createPpcCampaign({
        projectId: req.params.id,
        name: req.body.name,
        utmSource: req.body.utmSource || null,
        utmMedium: req.body.utmMedium || null,
        utmCampaign: req.body.utmCampaign || null,
        budget: req.body.budget || 0,
        clicks: req.body.clicks || 0,
        impressions: req.body.impressions || 0,
        conversions: req.body.conversions || 0,
        cost: req.body.cost || 0,
        status: req.body.status || "active",
      });
      res.status(201).json(campaign);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // Internal IP Rules CRUD
  app.get("/api/projects/:id/internal-ips", async (req, res) => {
    try {
      const rules = await storage.getInternalIpRules(req.params.id);
      res.json(rules);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/internal-ips", async (req, res) => {
    try {
      const rule = await storage.createInternalIpRule({
        projectId: req.params.id,
        ip: req.body.ip,
        label: req.body.label || null,
        ruleType: req.body.ruleType || "exact",
      });
      res.status(201).json(rule);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/internal-ips/:ruleId", async (req, res) => {
    try {
      await storage.deleteInternalIpRule(req.params.ruleId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Filtered Events endpoint
  app.get("/api/projects/:id/events/filtered", async (req, res) => {
    try {
      const filters: EventFilters = {
        from: req.query.from as string,
        to: req.query.to as string,
        eventType: req.query.eventType as string,
        device: req.query.device as string,
        browser: req.query.browser as string,
        os: req.query.os as string,
        country: req.query.country as string,
        referrer: req.query.referrer as string,
        isBot: req.query.isBot as string,
        isInternal: req.query.isInternal as string,
        isServer: req.query.isServer as string,
        trafficSource: req.query.trafficSource as string,
        page: req.query.page as string,
        visitorId: req.query.visitorId as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 1000,
      };
      Object.keys(filters).forEach(k => {
        if (!(filters as any)[k]) delete (filters as any)[k];
      });
      const filteredEvents = await storage.getFilteredEvents(req.params.id, filters);
      res.json(filteredEvents);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Realtime analytics (last 30 minutes)
  app.get("/api/projects/:id/realtime", async (req, res) => {
    try {
      const now = new Date();
      const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000);
      const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const recentEvents = await storage.getEventsByDateRange(req.params.id, thirtyMinsAgo, now);

      const activeUsers30 = new Set(recentEvents.map(e => e.visitorId || e.sessionId || e.id)).size;
      const evts5min = recentEvents.filter(e => new Date(e.timestamp) >= fiveMinsAgo);
      const activeUsers5 = new Set(evts5min.map(e => e.visitorId || e.sessionId || e.id)).size;

      const perMinute: { minute: string; users: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const start = new Date(now.getTime() - (i + 1) * 60 * 1000);
        const end = new Date(now.getTime() - i * 60 * 1000);
        const minuteEvts = recentEvents.filter(e => {
          const t = new Date(e.timestamp);
          return t >= start && t < end;
        });
        const label = `-${i + 1} min`;
        perMinute.push({ minute: label, users: new Set(minuteEvts.map(e => e.visitorId || e.sessionId || e.id)).size });
      }

      const pageViews30 = recentEvents.filter(e => e.eventType === "pageview").length;

      const pageMap = new Map<string, { users: Set<string>; views: number }>();
      recentEvents.filter(e => e.eventType === "pageview").forEach(e => {
        const p = e.page || "/";
        if (!pageMap.has(p)) pageMap.set(p, { users: new Set(), views: 0 });
        const pm = pageMap.get(p)!;
        pm.users.add(e.visitorId || e.sessionId || e.id);
        pm.views++;
      });
      const topPages = Array.from(pageMap.entries())
        .map(([page, d]) => ({ page, activeUsers: d.users.size, views: d.views }))
        .sort((a, b) => b.activeUsers - a.activeUsers)
        .slice(0, 20);

      const sourceMap = new Map<string, Set<string>>();
      recentEvents.forEach(e => {
        const src = e.trafficSource || classifyTrafficSource(e.referrer, e.page, "");
        if (!sourceMap.has(src)) sourceMap.set(src, new Set());
        sourceMap.get(src)!.add(e.visitorId || e.sessionId || e.id);
      });
      const topSources = Array.from(sourceMap.entries())
        .map(([source, users]) => ({ source, activeUsers: users.size }))
        .sort((a, b) => b.activeUsers - a.activeUsers);

      const countryMap = new Map<string, Set<string>>();
      recentEvents.forEach(e => {
        const c = e.country || "Unknown";
        if (!countryMap.has(c)) countryMap.set(c, new Set());
        countryMap.get(c)!.add(e.visitorId || e.sessionId || e.id);
      });
      const topCountries = Array.from(countryMap.entries())
        .map(([country, users]) => ({ country, activeUsers: users.size }))
        .sort((a, b) => b.activeUsers - a.activeUsers);

      const eventTypeMap = new Map<string, number>();
      recentEvents.forEach(e => {
        eventTypeMap.set(e.eventType, (eventTypeMap.get(e.eventType) || 0) + 1);
      });
      const eventTypes = Array.from(eventTypeMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      res.json({
        activeUsers30,
        activeUsers5,
        pageViews30,
        perMinute,
        topPages,
        topSources,
        topCountries,
        eventTypes,
        totalEvents: recentEvents.length,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Funnels CRUD
  app.get("/api/projects/:id/funnels", async (req, res) => {
    try {
      const funnelList = await storage.getFunnels(req.params.id);
      res.json(funnelList);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/funnels", async (req, res) => {
    try {
      const funnel = await storage.createFunnel({
        projectId: req.params.id,
        name: req.body.name,
        description: req.body.description || null,
        steps: req.body.steps,
      });
      res.status(201).json(funnel);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.patch("/api/projects/:id/funnels/:funnelId", async (req, res) => {
    try {
      const funnel = await storage.updateFunnel(req.params.funnelId, {
        name: req.body.name,
        description: req.body.description,
        steps: req.body.steps,
      });
      res.json(funnel);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/funnels/:funnelId", async (req, res) => {
    try {
      await storage.deleteFunnel(req.params.funnelId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Funnel Analysis - compute step counts and drop-off
  app.get("/api/projects/:id/funnels/:funnelId/analysis", async (req, res) => {
    try {
      const funnel = await storage.getFunnel(req.params.funnelId);
      if (!funnel || funnel.projectId !== req.params.id) {
        return res.status(404).json({ message: "Funnel not found" });
      }

      const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 86400000);
      const to = req.query.to ? new Date(req.query.to as string) : new Date();
      const allEvents = await storage.getEventsByDateRange(req.params.id, from, to);

      const steps = funnel.steps as Array<{ name: string; type: string; value: string }>;
      const sessionMap = new Map<string, any[]>();
      allEvents.forEach(e => {
        const key = e.sessionId || e.visitorId || e.id;
        if (!sessionMap.has(key)) sessionMap.set(key, []);
        sessionMap.get(key)!.push(e);
      });

      const stepResults = steps.map((step, idx) => {
        let completedSessions = 0;
        sessionMap.forEach((sessionEvents) => {
          sessionEvents.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          let currentStepIdx = 0;
          for (const evt of sessionEvents) {
            if (currentStepIdx > idx) break;
            const currentStep = steps[currentStepIdx];
            let matches = false;
            if (currentStep.type === "pageview" && evt.eventType === "pageview") {
              matches = evt.page?.includes(currentStep.value) || false;
            } else if (currentStep.type === "event" && evt.eventType === currentStep.value) {
              matches = true;
            } else if (currentStep.type === "click" && evt.eventType === "click") {
              const meta = evt.metadata as any;
              matches = meta?.text?.includes(currentStep.value) || meta?.target?.includes(currentStep.value) || false;
            }
            if (matches) {
              currentStepIdx++;
            }
          }
          if (currentStepIdx > idx) {
            completedSessions++;
          }
        });
        return {
          name: step.name,
          type: step.type,
          value: step.value,
          users: completedSessions,
          dropOff: idx === 0 ? 0 : 0,
          dropOffRate: 0,
        };
      });

      for (let i = 1; i < stepResults.length; i++) {
        const prev = stepResults[i - 1].users;
        const curr = stepResults[i].users;
        stepResults[i].dropOff = prev - curr;
        stepResults[i].dropOffRate = prev > 0 ? Math.round(((prev - curr) / prev) * 100 * 10) / 10 : 0;
      }

      const overallConversion = stepResults.length > 1 && stepResults[0].users > 0
        ? Math.round((stepResults[stepResults.length - 1].users / stepResults[0].users) * 100 * 10) / 10
        : 0;

      res.json({
        funnel: { id: funnel.id, name: funnel.name },
        dateRange: { from: from.toISOString(), to: to.toISOString() },
        totalSessions: sessionMap.size,
        steps: stepResults,
        overallConversion,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Custom Event Definitions CRUD
  app.get("/api/projects/:id/custom-events", async (req, res) => {
    try {
      const defs = await storage.getCustomEventDefinitions(req.params.id);
      res.json(defs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/custom-events", async (req, res) => {
    try {
      const def = await storage.createCustomEventDefinition({
        ...req.body,
        projectId: req.params.id,
      });
      res.status(201).json(def);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.patch("/api/projects/:id/custom-events/:defId", async (req, res) => {
    try {
      const def = await storage.updateCustomEventDefinition(req.params.defId, {
        ...req.body,
      });
      res.json(def);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/custom-events/:defId", async (req, res) => {
    try {
      await storage.deleteCustomEventDefinition(req.params.defId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Match events against a custom event definition
  app.get("/api/projects/:id/custom-events/:defId/matches", async (req, res) => {
    try {
      const def = await storage.getCustomEventDefinition(req.params.defId);
      if (!def || def.projectId !== req.params.id) {
        return res.status(404).json({ message: "Custom event not found" });
      }

      const { from, to } = parseDateRange(req.query);

      const allEvents = await storage.getEventsByDateRange(req.params.id, from, to);
      const rules = def.rules as Array<{ field: string; operator: string; value: string }>;
      const matched = allEvents.filter(evt => matchesRules(evt, rules));

      res.json({
        definition: def,
        totalMatches: matched.length,
        events: matched.slice(0, 200),
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Conversion analysis: which pages lead to custom events (leads/purchases)
  app.get("/api/projects/:id/custom-events/:defId/conversion-analysis", async (req, res) => {
    try {
      const def = await storage.getCustomEventDefinition(req.params.defId);
      if (!def || def.projectId !== req.params.id) {
        return res.status(404).json({ message: "Custom event not found" });
      }

      const { from, to } = parseDateRange(req.query);

      const allEvents = await storage.getEventsByDateRange(req.params.id, from, to);
      const rules = def.rules as Array<{ field: string; operator: string; value: string }>;

      // Group events by session
      const sessionMap = new Map<string, typeof allEvents>();
      allEvents.forEach(evt => {
        const sid = evt.sessionId || evt.visitorId || evt.id;
        if (!sessionMap.has(sid)) sessionMap.set(sid, []);
        sessionMap.get(sid)!.push(evt);
      });

      // For each session, find if it contains a conversion and what pages preceded it
      const pageConversions = new Map<string, { pageViews: number; conversions: number; visitors: Set<string> }>();
      let totalConversions = 0;

      sessionMap.forEach((sessionEvents, sid) => {
        sessionEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        const hasConversion = sessionEvents.some(evt => matchesRules(evt, rules));
        if (hasConversion) totalConversions++;

        const pagesInSession = new Set<string>();
        sessionEvents.forEach(evt => {
          if (evt.page && evt.eventType === "pageview") {
            pagesInSession.add(evt.page);
          }
        });

        pagesInSession.forEach(page => {
          if (!pageConversions.has(page)) {
            pageConversions.set(page, { pageViews: 0, conversions: 0, visitors: new Set() });
          }
          const pc = pageConversions.get(page)!;
          pc.pageViews++;
          if (hasConversion) {
            pc.conversions++;
            pc.visitors.add(sessionEvents[0]?.visitorId || sid);
          }
        });
      });

      const pageAnalysis = Array.from(pageConversions.entries())
        .map(([page, data]) => ({
          page,
          pageViews: data.pageViews,
          conversions: data.conversions,
          conversionRate: data.pageViews > 0 ? Math.round((data.conversions / data.pageViews) * 10000) / 100 : 0,
          uniqueConverters: data.visitors.size,
        }))
        .sort((a, b) => b.conversions - a.conversions);

      // Source analysis
      const sourceConversions = new Map<string, { total: number; conversions: number }>();
      sessionMap.forEach((sessionEvents) => {
        const hasConversion = sessionEvents.some(evt => matchesRules(evt, rules));
        const source = sessionEvents[0]?.trafficSource || "direct";
        if (!sourceConversions.has(source)) sourceConversions.set(source, { total: 0, conversions: 0 });
        const sc = sourceConversions.get(source)!;
        sc.total++;
        if (hasConversion) sc.conversions++;
      });

      const sourceAnalysis = Array.from(sourceConversions.entries())
        .map(([source, data]) => ({
          source,
          sessions: data.total,
          conversions: data.conversions,
          conversionRate: data.total > 0 ? Math.round((data.conversions / data.total) * 10000) / 100 : 0,
        }))
        .sort((a, b) => b.conversions - a.conversions);

      // Daily trend
      const dailyMap = new Map<string, { total: number; conversions: number }>();
      allEvents.forEach(evt => {
        const date = new Date(evt.timestamp).toISOString().slice(0, 10);
        if (!dailyMap.has(date)) dailyMap.set(date, { total: 0, conversions: 0 });
        const d = dailyMap.get(date)!;
        d.total++;
        if (matchesRules(evt, rules)) d.conversions++;
      });

      const dailyTrend = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, events: data.total, conversions: data.conversions }))
        .sort((a, b) => a.date.localeCompare(b.date));

      res.json({
        definition: def,
        totalSessions: sessionMap.size,
        totalConversions,
        overallConversionRate: sessionMap.size > 0
          ? Math.round((totalConversions / sessionMap.size) * 10000) / 100
          : 0,
        pageAnalysis,
        sourceAnalysis,
        dailyTrend,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // AI auto-create lead/purchase event definitions
  app.post("/api/projects/:id/custom-events/ai-templates", async (req, res) => {
    try {
      const { template } = req.body;
      const templates: Record<string, any> = {
        lead: {
          name: "Lead",
          description: "Auto-detected lead events: form submissions that indicate user interest (contact forms, signup forms, demo requests)",
          category: "lead",
          isAiBuilt: "true",
          color: "#10b981",
          rules: [
            { field: "eventType", operator: "equals", value: "form_submit" },
          ],
        },
        purchase: {
          name: "Purchase",
          description: "Auto-detected purchase events: form submissions on checkout, payment, or order pages",
          category: "purchase",
          isAiBuilt: "true",
          color: "#8b5cf6",
          rules: [
            { field: "eventType", operator: "equals", value: "form_submit" },
            { field: "page", operator: "contains_any", value: "checkout,purchase,order,payment,buy,cart/complete,thank-you,confirmation" },
          ],
        },
        signup: {
          name: "Sign Up",
          description: "Auto-detected signup events: form submissions on registration, signup, or create account pages",
          category: "lead",
          isAiBuilt: "true",
          color: "#3b82f6",
          rules: [
            { field: "eventType", operator: "equals", value: "form_submit" },
            { field: "page", operator: "contains_any", value: "signup,register,create-account,join,onboard" },
          ],
        },
        download: {
          name: "Download",
          description: "Auto-detected download events: clicks on download links or pages",
          category: "custom",
          isAiBuilt: "true",
          color: "#f59e0b",
          rules: [
            { field: "eventType", operator: "equals", value: "click" },
            { field: "page", operator: "contains_any", value: "download,get-started,free-trial" },
          ],
        },
      };

      const tmpl = templates[template];
      if (!tmpl) {
        return res.status(400).json({ message: "Unknown template. Available: lead, purchase, signup, download" });
      }

      const existing = await storage.getCustomEventDefinitions(req.params.id);
      const alreadyExists = existing.find(d => d.name === tmpl.name && d.isAiBuilt === "true");
      if (alreadyExists) {
        return res.status(409).json({ message: `${tmpl.name} event already exists`, existing: alreadyExists });
      }

      const def = await storage.createCustomEventDefinition({
        ...tmpl,
        projectId: req.params.id,
        status: "active",
      });
      res.status(201).json(def);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Acquisition data endpoint
  app.get("/api/projects/:id/acquisition", async (req, res) => {
    try {
      const period = (req.query.period as string) || "last_30_days";
      const { from, to } = parseDateRange(req.query);

      const evts = await storage.getEventsByDateRange(req.params.id, from, to);

      const sourceMap = new Map<string, { users: Set<string>; sessions: Set<string>; events: number; pageViews: number }>();
      evts.forEach(e => {
        const src = e.trafficSource || "direct";
        if (!sourceMap.has(src)) sourceMap.set(src, { users: new Set(), sessions: new Set(), events: 0, pageViews: 0 });
        const s = sourceMap.get(src)!;
        s.users.add(e.visitorId || e.id);
        s.sessions.add(e.sessionId || e.id);
        s.events++;
        if (e.eventType === "pageview") s.pageViews++;
      });

      const sources = Array.from(sourceMap.entries())
        .map(([source, d]) => ({
          source,
          users: d.users.size,
          sessions: d.sessions.size,
          events: d.events,
          pageViews: d.pageViews,
        }))
        .sort((a, b) => b.users - a.users);

      const referrerMap = new Map<string, { users: Set<string>; sessions: Set<string> }>();
      evts.forEach(e => {
        const ref = e.referrer || "Direct";
        if (!referrerMap.has(ref)) referrerMap.set(ref, { users: new Set(), sessions: new Set() });
        referrerMap.get(ref)!.users.add(e.visitorId || e.id);
        referrerMap.get(ref)!.sessions.add(e.sessionId || e.id);
      });
      const referrers = Array.from(referrerMap.entries())
        .map(([referrer, d]) => ({ referrer, users: d.users.size, sessions: d.sessions.size }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 20);

      const totalUsers = new Set(evts.map(e => e.visitorId || e.id)).size;
      const totalSessions = new Set(evts.map(e => e.sessionId || e.id)).size;

      res.json({
        period,
        totalUsers,
        totalSessions,
        sources,
        referrers,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Engagement data endpoint
  app.get("/api/projects/:id/engagement", async (req, res) => {
    try {
      const period = (req.query.period as string) || "last_30_days";
      const { from, to } = parseDateRange(req.query);

      const evts = await storage.getEventsByDateRange(req.params.id, from, to);

      const eventTypeMap = new Map<string, number>();
      evts.forEach(e => {
        eventTypeMap.set(e.eventType, (eventTypeMap.get(e.eventType) || 0) + 1);
      });
      const eventTypes = Array.from(eventTypeMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      const pageMap = new Map<string, { views: number; users: Set<string>; avgEngagement: number }>();
      evts.filter(e => e.eventType === "pageview").forEach(e => {
        const p = e.page || "/";
        if (!pageMap.has(p)) pageMap.set(p, { views: 0, users: new Set(), avgEngagement: 0 });
        const pm = pageMap.get(p)!;
        pm.views++;
        pm.users.add(e.visitorId || e.id);
      });
      const pages = Array.from(pageMap.entries())
        .map(([page, d]) => ({
          page,
          views: d.views,
          users: d.users.size,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 20);

      const landingPages = new Map<string, { sessions: number; users: Set<string> }>();
      const sessionFirstEvent = new Map<string, any>();
      evts.forEach(e => {
        const sid = e.sessionId || e.id;
        if (!sessionFirstEvent.has(sid) || new Date(e.timestamp) < new Date(sessionFirstEvent.get(sid).timestamp)) {
          sessionFirstEvent.set(sid, e);
        }
      });
      sessionFirstEvent.forEach(e => {
        if (e.eventType === "pageview" && e.page) {
          if (!landingPages.has(e.page)) landingPages.set(e.page, { sessions: 0, users: new Set() });
          landingPages.get(e.page)!.sessions++;
          landingPages.get(e.page)!.users.add(e.visitorId || e.id);
        }
      });
      const landingPagesList = Array.from(landingPages.entries())
        .map(([page, d]) => ({ page, sessions: d.sessions, users: d.users.size }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 20);

      const totalEvents = evts.length;
      const totalPageViews = evts.filter(e => e.eventType === "pageview").length;
      const totalUsers = new Set(evts.map(e => e.visitorId || e.id)).size;

      const sessionMap = new Map<string, any[]>();
      evts.forEach(e => {
        const sid = e.sessionId || e.id;
        if (!sessionMap.has(sid)) sessionMap.set(sid, []);
        sessionMap.get(sid)!.push(e);
      });
      let totalDuration = 0;
      let sessionsWithDuration = 0;
      sessionMap.forEach(sessionEvts => {
        if (sessionEvts.length > 1) {
          const times = sessionEvts.map(e => new Date(e.timestamp).getTime());
          const dur = Math.max(...times) - Math.min(...times);
          totalDuration += dur;
          sessionsWithDuration++;
        }
      });
      const avgSessionDuration = sessionsWithDuration > 0 ? Math.round(totalDuration / sessionsWithDuration / 1000) : 0;

      res.json({
        period,
        totalEvents,
        totalPageViews,
        totalUsers,
        avgSessionDuration,
        eventTypes,
        pages,
        landingPages: landingPagesList,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Traffic Sources endpoint
  app.get("/api/projects/:id/traffic-sources", async (req, res) => {
    try {
      const period = (req.query.period as string) || "last_30_days";
      const { from, to } = parseDateRange(req.query);
      const evts = await storage.getEventsByDateRange(req.params.id, from, to);

      type BucketData = { users: Set<string>; sessions: Set<string>; events: number; pageViews: number; bounces: number };
      const makeBucket = (): BucketData => ({ users: new Set(), sessions: new Set(), events: 0, pageViews: 0, bounces: 0 });

      const channelMap = new Map<string, BucketData>();
      const sourceMap = new Map<string, BucketData>();
      const sourceMediumMap = new Map<string, BucketData>();
      const mediumMap = new Map<string, BucketData>();
      const sourcePlatformMap = new Map<string, BucketData>();
      const campaignMap = new Map<string, BucketData>();

      const sessionEvts = new Map<string, any[]>();
      evts.forEach(e => {
        const sid = e.sessionId || e.id;
        if (!sessionEvts.has(sid)) sessionEvts.set(sid, []);
        sessionEvts.get(sid)!.push(e);
      });
      const bounceSessions = new Set<string>();
      sessionEvts.forEach((sEvts, sid) => {
        if (sEvts.filter(e => e.eventType === "pageview").length <= 1) bounceSessions.add(sid);
      });

      const addToBucket = (map: Map<string, BucketData>, key: string, e: any, sid: string) => {
        if (!map.has(key)) map.set(key, makeBucket());
        const b = map.get(key)!;
        b.users.add(e.visitorId || e.id);
        if (!b.sessions.has(sid) && bounceSessions.has(sid)) b.bounces++;
        b.sessions.add(sid);
        b.events++;
        if (e.eventType === "pageview") b.pageViews++;
      };

      evts.forEach(e => {
        const channel = e.trafficSource || "direct";
        const sid = e.sessionId || e.id;
        addToBucket(channelMap, channel, e, sid);

        let src = "(direct)";
        try {
          if (e.referrer && e.referrer !== "Direct") src = new URL(e.referrer.startsWith("http") ? e.referrer : "http://" + e.referrer).hostname;
        } catch { src = e.referrer || "(direct)"; }
        const meta = e.metadata as any;
        const utmSource = (meta?.utm_source || meta?.utmSource) || src;
        const utmMedium = (meta?.utm_medium || meta?.utmMedium) || (channel === "direct" ? "(none)" : channel);

        addToBucket(sourceMap, utmSource, e, sid);
        addToBucket(sourceMediumMap, `${utmSource} / ${utmMedium}`, e, sid);
        addToBucket(mediumMap, utmMedium, e, sid);

        let platform = "Manual";
        const srcLower = utmSource.toLowerCase();
        if (srcLower.includes("google")) platform = "Google";
        else if (srcLower.includes("facebook") || srcLower.includes("instagram") || srcLower.includes("meta")) platform = "Meta";
        else if (srcLower.includes("bing") || srcLower.includes("microsoft")) platform = "Microsoft";
        else if (srcLower.includes("tiktok")) platform = "TikTok";
        else if (srcLower.includes("twitter") || srcLower.includes("x.com")) platform = "X (Twitter)";
        else if (srcLower.includes("linkedin")) platform = "LinkedIn";
        else if (srcLower.includes("pinterest")) platform = "Pinterest";
        else if (srcLower.includes("youtube")) platform = "YouTube";
        else if (srcLower === "(direct)") platform = "(direct)";
        addToBucket(sourcePlatformMap, platform, e, sid);

        if (meta && (meta.utm_campaign || meta.utmCampaign)) {
          const camp = meta.utm_campaign || meta.utmCampaign || "unknown";
          addToBucket(campaignMap, camp, e, sid);
        }
      });

      const formatBucket = (map: Map<string, BucketData>, limit?: number) => {
        const arr = Array.from(map.entries())
          .map(([name, d]) => ({ name, users: d.users.size, sessions: d.sessions.size, events: d.events, pageViews: d.pageViews, bounceRate: d.sessions.size > 0 ? d.bounces / d.sessions.size : 0 }))
          .sort((a, b) => b.users - a.users);
        return limit ? arr.slice(0, limit) : arr;
      };

      res.json({
        period,
        channels: formatBucket(channelMap),
        sources: formatBucket(sourceMap, 50),
        sourceMediums: formatBucket(sourceMediumMap, 50),
        mediums: formatBucket(mediumMap),
        sourcePlatforms: formatBucket(sourcePlatformMap),
        campaigns: formatBucket(campaignMap),
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id/user-acquisition", async (req, res) => {
    try {
      const period = (req.query.period as string) || "last_30_days";
      const { from, to } = parseDateRange(req.query);
      const evts = await storage.getEventsByDateRange(req.params.id, from, to);
      const allVisitors = new Set<string>();
      const sessionMap = new Map<string, { events: any[]; firstSeen: Date }>();

      evts.forEach(e => {
        const vid = e.visitorId || e.id;
        allVisitors.add(vid);
        const sid = e.sessionId || e.id;
        if (!sessionMap.has(sid)) sessionMap.set(sid, { events: [], firstSeen: e.timestamp });
        sessionMap.get(sid)!.events.push(e);
      });

      const visitorFirstSeen = new Map<string, Date>();
      evts.forEach(e => {
        const vid = e.visitorId || e.id;
        if (!visitorFirstSeen.has(vid) || e.timestamp < visitorFirstSeen.get(vid)!) {
          visitorFirstSeen.set(vid, e.timestamp);
        }
      });

      const newVisitors = new Set<string>();
      const returningVisitors = new Set<string>();
      visitorFirstSeen.forEach((firstSeen, vid) => {
        if (firstSeen >= from) newVisitors.add(vid);
        else returningVisitors.add(vid);
      });

      const channelData = new Map<string, { totalUsers: Set<string>; newUsers: Set<string>; returningUsers: Set<string>; sessions: Set<string>; events: number; engagementTime: number }>();
      evts.forEach(e => {
        const channel = e.trafficSource || "direct";
        const vid = e.visitorId || e.id;
        if (!channelData.has(channel)) channelData.set(channel, { totalUsers: new Set(), newUsers: new Set(), returningUsers: new Set(), sessions: new Set(), events: 0, engagementTime: 0 });
        const cd = channelData.get(channel)!;
        cd.totalUsers.add(vid);
        if (newVisitors.has(vid)) cd.newUsers.add(vid);
        else cd.returningUsers.add(vid);
        cd.sessions.add(e.sessionId || e.id);
        cd.events++;
      });

      const channels = Array.from(channelData.entries()).map(([name, d]) => ({
        name,
        totalUsers: d.totalUsers.size,
        newUsers: d.newUsers.size,
        returningUsers: d.returningUsers.size,
        sessions: d.sessions.size,
        events: d.events,
        avgEngagementTime: d.sessions.size > 0 ? Math.round((d.events * 12) / d.sessions.size) : 0,
      })).sort((a, b) => b.totalUsers - a.totalUsers);

      const dayMap = new Map<string, { total: Set<string>; new_: Set<string> }>();
      evts.forEach(e => {
        const day = e.timestamp.toISOString().split("T")[0];
        const vid = e.visitorId || e.id;
        if (!dayMap.has(day)) dayMap.set(day, { total: new Set(), new_: new Set() });
        const dm = dayMap.get(day)!;
        dm.total.add(vid);
        if (newVisitors.has(vid)) dm.new_.add(vid);
      });
      const timeline = Array.from(dayMap.entries()).map(([date, d]) => ({ date, totalUsers: d.total.size, newUsers: d.new_.size })).sort((a, b) => a.date.localeCompare(b.date));

      res.json({
        period,
        totalUsers: allVisitors.size,
        newUsers: newVisitors.size,
        returningUsers: returningVisitors.size,
        channels,
        timeline,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Pages analysis endpoint
  app.get("/api/projects/:id/pages-analysis", async (req, res) => {
    try {
      const period = (req.query.period as string) || "last_30_days";
      const { from, to } = parseDateRange(req.query);
      const evts = await storage.getEventsByDateRange(req.params.id, from, to);
      const pvs = evts.filter(e => e.eventType === "pageview");

      const pageMap = new Map<string, { views: number; users: Set<string>; sessions: Set<string> }>();
      pvs.forEach(e => {
        const p = e.page || "/";
        if (!pageMap.has(p)) pageMap.set(p, { views: 0, users: new Set(), sessions: new Set() });
        const pm = pageMap.get(p)!;
        pm.views++;
        pm.users.add(e.visitorId || e.id);
        pm.sessions.add(e.sessionId || e.id);
      });
      const topPages = Array.from(pageMap.entries())
        .map(([page, d]) => ({ page, views: d.views, users: d.users.size, sessions: d.sessions.size }))
        .sort((a, b) => b.views - a.views).slice(0, 50);

      const sessionFirstEvent = new Map<string, any>();
      const sessionLastEvent = new Map<string, any>();
      evts.forEach(e => {
        const sid = e.sessionId || e.id;
        const ts = new Date(e.timestamp).getTime();
        if (!sessionFirstEvent.has(sid) || ts < new Date(sessionFirstEvent.get(sid).timestamp).getTime()) sessionFirstEvent.set(sid, e);
        if (!sessionLastEvent.has(sid) || ts > new Date(sessionLastEvent.get(sid).timestamp).getTime()) sessionLastEvent.set(sid, e);
      });

      const entryMap = new Map<string, { sessions: number; users: Set<string> }>();
      sessionFirstEvent.forEach(e => {
        if (e.eventType === "pageview" && e.page) {
          if (!entryMap.has(e.page)) entryMap.set(e.page, { sessions: 0, users: new Set() });
          entryMap.get(e.page)!.sessions++;
          entryMap.get(e.page)!.users.add(e.visitorId || e.id);
        }
      });
      const entryPages = Array.from(entryMap.entries())
        .map(([page, d]) => ({ page, sessions: d.sessions, users: d.users.size }))
        .sort((a, b) => b.sessions - a.sessions).slice(0, 50);

      const exitMap = new Map<string, { sessions: number; users: Set<string> }>();
      sessionLastEvent.forEach(e => {
        if (e.eventType === "pageview" && e.page) {
          if (!exitMap.has(e.page)) exitMap.set(e.page, { sessions: 0, users: new Set() });
          exitMap.get(e.page)!.sessions++;
          exitMap.get(e.page)!.users.add(e.visitorId || e.id);
        }
      });
      const exitPages = Array.from(exitMap.entries())
        .map(([page, d]) => ({ page, sessions: d.sessions, users: d.users.size }))
        .sort((a, b) => b.sessions - a.sessions).slice(0, 50);

      const statusCodes = new Map<string, number>();
      pvs.forEach(e => {
        const meta = e.metadata as any;
        if (meta && meta.status) statusCodes.set(e.page || "/", meta.status);
      });
      const possible404s = Array.from(pageMap.entries())
        .filter(([page]) => {
          const lower = page.toLowerCase();
          return lower.includes("404") || lower.includes("not-found") || lower.includes("notfound") || lower.includes("error");
        })
        .map(([page, d]) => ({ page, views: d.views, users: d.users.size }))
        .sort((a, b) => b.views - a.views);

      res.json({ period, topPages, entryPages, exitPages, possible404s });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id/search-console", async (req, res) => {
    try {
      const keywords = await storage.getGscKeywords(req.params.id);
      const hasData = keywords.length > 0;

      const queries = keywords.map(k => ({
        query: k.query,
        page: k.page || "",
        clicks: k.clicks,
        impressions: k.impressions,
        ctr: k.ctr,
        position: k.position,
      }));

      const pageMap = new Map<string, { clicks: number; impressions: number; ctrSum: number; posSum: number; count: number }>();
      keywords.forEach(k => {
        const pg = k.page || "(not set)";
        const existing = pageMap.get(pg) || { clicks: 0, impressions: 0, ctrSum: 0, posSum: 0, count: 0 };
        existing.clicks += k.clicks;
        existing.impressions += k.impressions;
        existing.ctrSum += k.ctr;
        existing.posSum += k.position;
        existing.count += 1;
        pageMap.set(pg, existing);
      });
      const pages = Array.from(pageMap.entries()).map(([page, d]) => ({
        page,
        clicks: d.clicks,
        impressions: d.impressions,
        ctr: d.count > 0 ? d.ctrSum / d.count : 0,
        position: d.count > 0 ? d.posSum / d.count : 0,
      })).sort((a, b) => b.clicks - a.clicks);

      const totalClicks = keywords.reduce((s, k) => s + k.clicks, 0);
      const totalImpressions = keywords.reduce((s, k) => s + k.impressions, 0);
      const avgCtr = keywords.length > 0 ? keywords.reduce((s, k) => s + k.ctr, 0) / keywords.length : 0;
      const avgPosition = keywords.length > 0 ? keywords.reduce((s, k) => s + k.position, 0) / keywords.length : 0;

      res.json({
        connected: hasData,
        queries,
        pages,
        countries: [],
        devices: [],
        timeline: [],
        totals: { clicks: totalClicks, impressions: totalImpressions, ctr: avgCtr, position: avgPosition },
        keywordCount: keywords.length,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/search-console/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fs = await import("fs");
      const csvContent = fs.readFileSync(req.file.path, "utf-8");
      fs.unlinkSync(req.file.path);

      const lines = csvContent.split("\n").filter(l => l.trim());
      if (lines.length < 2) {
        return res.status(400).json({ message: "CSV file appears empty or has no data rows" });
      }

      const header = lines[0].toLowerCase();
      const hasTab = header.includes("\t");
      const delimiter = hasTab ? "\t" : ",";
      const headers = header.split(delimiter).map(h => h.trim().replace(/"/g, ""));

      const queryIdx = headers.findIndex(h => h === "query" || h === "top queries" || h === "search query" || h === "keyword");
      const pageIdx = headers.findIndex(h => h === "page" || h === "url" || h === "landing page");
      const clicksIdx = headers.findIndex(h => h === "clicks" || h === "click");
      const impressionsIdx = headers.findIndex(h => h === "impressions" || h === "impression");
      const ctrIdx = headers.findIndex(h => h === "ctr" || h === "click through rate" || h === "click-through rate");
      const positionIdx = headers.findIndex(h => h === "position" || h === "average position" || h === "avg position" || h === "avg. position");

      if (queryIdx === -1) {
        return res.status(400).json({ message: "Could not find a 'Query' or 'Keyword' column in the CSV. Please upload a Google Search Console export file." });
      }

      const batchId = `batch_${Date.now()}`;
      const keywords: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(delimiter).map(c => c.trim().replace(/"/g, ""));
        const query = cols[queryIdx];
        if (!query) continue;

        const ctrVal = ctrIdx >= 0 ? parseFloat(cols[ctrIdx]?.replace("%", "") || "0") : 0;

        keywords.push({
          projectId: req.params.id,
          query,
          page: pageIdx >= 0 ? cols[pageIdx] || null : null,
          clicks: clicksIdx >= 0 ? parseInt(cols[clicksIdx] || "0", 10) || 0 : 0,
          impressions: impressionsIdx >= 0 ? parseInt(cols[impressionsIdx] || "0", 10) || 0 : 0,
          ctr: isNaN(ctrVal) ? 0 : ctrVal,
          position: positionIdx >= 0 ? parseFloat(cols[positionIdx] || "0") || 0 : 0,
          source: "csv",
          uploadBatchId: batchId,
        });
      }

      if (keywords.length === 0) {
        return res.status(400).json({ message: "No valid keyword rows found in the CSV" });
      }

      const created = await storage.createGscKeywords(keywords);
      res.json({ message: `Successfully imported ${created.length} keywords`, count: created.length, batchId });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/search-console/keywords", async (req, res) => {
    try {
      await storage.deleteGscKeywordsByProject(req.params.id);
      res.json({ message: "All keyword data cleared" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/search-console/strategy", async (req, res) => {
    try {
      const keywords = await storage.getGscKeywords(req.params.id);
      if (keywords.length === 0) {
        return res.status(400).json({ message: "No keyword data available. Upload a CSV or connect Google Search Console first." });
      }

      const project = await storage.getProject(req.params.id);
      const domain = project?.domain || "the website";

      const topKeywords = keywords.slice(0, 200).map(k => ({
        q: k.query,
        p: k.page || "",
        c: k.clicks,
        i: k.impressions,
        ctr: k.ctr,
        pos: k.position,
      }));

      const quickWins = keywords.filter(k => k.position >= 4 && k.position <= 15);
      const lowCtr = keywords.filter(k => k.position <= 10 && k.ctr < 3);
      const contentGaps = keywords.filter(k => k.impressions > 50 && k.clicks === 0);

      const systemPrompt = `You are an expert SEO strategist and digital marketing consultant. Analyze the Google Search Console keyword data for "${domain}" and provide a comprehensive, detailed SEO strategy report. Return valid JSON with this structure:
{
  "summary": "A detailed 4-6 paragraph executive summary covering: overall search footprint assessment, biggest ranking opportunities, misaligned/low-value traffic concerns, local/commercial intent analysis, and a clear strategic direction. Reference specific keywords and their positions/impressions. Be highly specific with numbers.",
  "quickWins": [{"keyword": "string", "currentPosition": number, "action": "detailed multi-sentence action plan including: page URL structure suggestion, title tag (≤60 chars), meta description (≤155 chars), H1/H2 structure, content essentials (word count, topics to cover), internal linking suggestions, and CTA recommendations", "expectedImpact": "high/medium/low", "page": "string"}],
  "contentGaps": [{"topic": "string", "keywords": ["string"], "suggestedTitle": "string", "searchIntent": "informational/transactional/navigational", "priority": "high/medium/low", "contentPlan": "detailed content plan including: suggested URL, title tag, H1, H2 structure, content sections to include, word count target, internal linking strategy, and schema markup suggestions"}],
  "lowCtrFixes": [{"keyword": "string", "currentCtr": number, "position": number, "suggestedTitle": "optimized title tag ≤60 chars designed for higher CTR", "suggestedDescription": "optimized meta description ≤155 chars with clear value proposition and call to action", "analysis": "why the current CTR is low and what the searcher intent likely is"}],
  "recommendations": [{"category": "On-Page SEO/Technical SEO/Content Strategy/Local SEO/Link Building/UX", "title": "string", "description": "detailed multi-sentence recommendation with specific implementation steps", "priority": "high/medium/low", "effort": "low/medium/high", "expectedOutcome": "measurable expected result"}]
}
Limit each array to maximum 10 items. Be extremely specific and actionable — reference actual keywords, suggest exact title tags, meta descriptions, URL structures, and content outlines. Think like a senior SEO consultant writing a strategy document for a client.`;

      const userPrompt = `Analyze these ${keywords.length} keywords for ${domain}:

TOP KEYWORDS BY PERFORMANCE:
${JSON.stringify(topKeywords.slice(0, 80))}

QUICK WIN OPPORTUNITIES (Position 4-15, already ranking but can push higher):
${quickWins.length} keywords found
Sample: ${JSON.stringify(quickWins.slice(0, 30).map(k => ({ q: k.query, pos: k.position, i: k.impressions, c: k.clicks, p: k.page })))}

LOW CTR KEYWORDS (Position ≤10 but CTR <3%, snippet optimization needed):
${lowCtr.length} keywords found
Sample: ${JSON.stringify(lowCtr.slice(0, 30).map(k => ({ q: k.query, ctr: k.ctr, pos: k.position, p: k.page })))}

CONTENT GAPS (Impressions >50 but 0 clicks, need new/better content):
${contentGaps.length} keywords found
Sample: ${JSON.stringify(contentGaps.slice(0, 30).map(k => ({ q: k.query, i: k.impressions, pos: k.position })))}

Provide a comprehensive strategy report as if you were a senior SEO consultant presenting to a client. Be specific about page URLs, title tags, meta descriptions, content structure, and internal linking.`;

      const result = await aiChatJSON(systemPrompt, userPrompt);

      const report = await storage.createGscStrategyReport({
        projectId: req.params.id,
        summary: result.data?.summary || "",
        quickWins: result.data?.quickWins || [],
        contentGaps: result.data?.contentGaps || [],
        lowCtrFixes: result.data?.lowCtrFixes || [],
        recommendations: result.data?.recommendations || [],
        keywordCount: keywords.length,
      });

      res.json(report);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id/search-console/strategies", async (req, res) => {
    try {
      const reports = await storage.getGscStrategyReports(req.params.id);
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/search-console/strategies/:reportId", async (req, res) => {
    try {
      await storage.deleteGscStrategyReport(req.params.reportId);
      res.json({ message: "Strategy report deleted" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id/lead-journey", async (req, res) => {
    try {
      const { from, to } = parseDateRange(req.query);
      const evts = await storage.getEventsByDateRange(req.params.id, from, to);

      const discoveryTypes = new Set(["pageview", "session_start", "first_visit"]);
      const engagementTypes = new Set(["scroll", "key_page_view", "cta_click", "content_interaction", "click"]);
      const intentTypes = new Set(["form_start", "form_submit", "form_error", "phone_click", "email_click", "chat_start", "chat_lead"]);
      const conversionTypes = new Set(["generate_lead"]);

      const discovery = { events: 0, users: new Set<string>(), sessions: new Set<string>(), breakdown: {} as Record<string, { count: number; users: Set<string> }> };
      const engagement = { events: 0, users: new Set<string>(), sessions: new Set<string>(), breakdown: {} as Record<string, { count: number; users: Set<string> }> };
      const intent = { events: 0, users: new Set<string>(), sessions: new Set<string>(), breakdown: {} as Record<string, { count: number; users: Set<string> }> };
      const conversion = { events: 0, users: new Set<string>(), sessions: new Set<string>(), breakdown: {} as Record<string, { count: number; users: Set<string> }> };

      const discoveryParams: any[] = [];
      const engagementParams: any[] = [];
      const intentParams: any[] = [];
      const conversionParams: any[] = [];

      for (const e of evts) {
        if (e.isBot === "true") continue;
        const vid = e.visitorId || "anon";
        const sid = e.sessionId || "unknown";
        const et = e.eventType;
        const meta = (e.metadata || {}) as Record<string, any>;

        let stage: typeof discovery | null = null;
        let paramsList: any[] | null = null;

        if (discoveryTypes.has(et)) { stage = discovery; paramsList = discoveryParams; }
        else if (conversionTypes.has(et)) { stage = conversion; paramsList = conversionParams; }
        else if (intentTypes.has(et)) { stage = intent; paramsList = intentParams; }
        else if (engagementTypes.has(et)) { stage = engagement; paramsList = engagementParams; }

        if (!stage) continue;

        stage.events++;
        stage.users.add(vid);
        stage.sessions.add(sid);
        if (!stage.breakdown[et]) stage.breakdown[et] = { count: 0, users: new Set() };
        stage.breakdown[et].count++;
        stage.breakdown[et].users.add(vid);

        if (et === "pageview") {
          paramsList!.push({ type: "pageview", page: e.page, pageType: meta.pageType || "other" });
        } else if (et === "session_start") {
          paramsList!.push({ type: "session_start", landingPage: meta.landingPage || e.page, trafficSource: meta.trafficSource || e.trafficSource || "direct" });
        } else if (et === "first_visit") {
          paramsList!.push({ type: "first_visit", pageType: meta.pageType || "other" });
        } else if (et === "scroll") {
          paramsList!.push({ type: "scroll", depth: meta.depth || meta.percentageScrolled || 0, pageType: meta.pageType || "other" });
        } else if (et === "key_page_view") {
          paramsList!.push({ type: "key_page_view", pageType: meta.pageType || "other", serviceName: meta.serviceName || "" });
        } else if (et === "cta_click") {
          paramsList!.push({ type: "cta_click", ctaText: meta.ctaText || meta.text || "", ctaPosition: meta.ctaPosition || "unknown", pageType: meta.pageType || "other", serviceName: meta.serviceName || "" });
        } else if (et === "content_interaction") {
          paramsList!.push({ type: "content_interaction", contentType: meta.contentType || "", contentName: meta.contentName || "" });
        } else if (et === "form_start") {
          paramsList!.push({ type: "form_start", formName: meta.formName || "", formLocation: meta.formLocation || "", serviceInterest: meta.serviceInterest || "", page: e.page || "", pageType: meta.pageType || "" });
        } else if (et === "form_submit") {
          paramsList!.push({ type: "form_submit", formName: meta.formName || meta.formId || "", page: e.page || "", pageType: meta.pageType || "", serviceName: meta.serviceName || "" });
        } else if (et === "form_error") {
          paramsList!.push({ type: "form_error", formName: meta.formName || "", errorField: meta.errorField || "", page: e.page || "" });
        } else if (et === "phone_click") {
          paramsList!.push({ type: "phone_click", page: e.page || "", pageType: meta.pageType || "", serviceName: meta.serviceName || "", trafficSource: meta.trafficSource || e.trafficSource || "direct", callDuration: meta.callDuration || 0 });
        } else if (et === "email_click") {
          paramsList!.push({ type: "email_click", page: e.page || "", pageType: meta.pageType || "", serviceName: meta.serviceName || "" });
        } else if (et === "chat_start") {
          paramsList!.push({ type: "chat_start", page: e.page || "", pageType: meta.pageType || "" });
        } else if (et === "chat_lead") {
          paramsList!.push({ type: "chat_lead", page: e.page || "", pageType: meta.pageType || "" });
        } else if (et === "generate_lead") {
          paramsList!.push({ type: "generate_lead", leadType: meta.leadType || "form", serviceInterest: meta.serviceInterest || "", leadSource: meta.leadSource || e.trafficSource || "direct", landingPage: meta.landingPage || "" });
        }
      }

      const serializeStage = (s: typeof discovery) => ({
        events: s.events,
        users: s.users.size,
        sessions: s.sessions.size,
        breakdown: Object.entries(s.breakdown).map(([type, d]) => ({ type, count: d.count, users: d.users.size })).sort((a, b) => b.count - a.count),
      });

      const EVENT_PARAM_FIELDS: Record<string, string[]> = {
        pageview: ["page", "pageType"],
        session_start: ["landingPage", "trafficSource"],
        first_visit: ["pageType"],
        scroll: ["depth", "pageType"],
        key_page_view: ["pageType", "serviceName"],
        cta_click: ["ctaText", "ctaPosition", "pageType", "serviceName"],
        content_interaction: ["contentType", "contentName"],
        click: ["pageType"],
        form_start: ["formName", "formLocation", "serviceInterest", "page", "pageType"],
        form_submit: ["formName", "page", "pageType", "serviceName"],
        form_error: ["formName", "errorField", "page"],
        phone_click: ["page", "pageType", "serviceName", "trafficSource", "callDuration"],
        email_click: ["page", "pageType", "serviceName"],
        chat_start: ["page", "pageType"],
        chat_lead: ["page", "pageType"],
        generate_lead: ["leadType", "serviceInterest", "leadSource", "landingPage"],
      };

      const aggregateParamsByEventType = (params: any[], limit = 20) => {
        const byType: Record<string, any[]> = {};
        for (const p of params) {
          if (!byType[p.type]) byType[p.type] = [];
          byType[p.type].push(p);
        }
        const result: Record<string, Record<string, Record<string, { count: number }>>> = {};
        for (const [eventType, events] of Object.entries(byType)) {
          const fields = EVENT_PARAM_FIELDS[eventType] || [];
          result[eventType] = {};
          for (const field of fields) {
            const map = new Map<string, number>();
            for (const ev of events) {
              const val = ev[field];
              if (val && val !== "other" && val !== "unknown" && val !== "" && val !== 0) {
                map.set(String(val), (map.get(String(val)) || 0) + 1);
              }
            }
            if (map.size > 0) {
              result[eventType][field] = {};
              Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, limit).forEach(([k, v]) => {
                result[eventType][field][k] = { count: v };
              });
            }
          }
        }
        return result;
      };

      res.json({
        funnel: [
          { stage: "Discovery", ...serializeStage(discovery) },
          { stage: "Engagement", ...serializeStage(engagement) },
          { stage: "Intent", ...serializeStage(intent) },
          { stage: "Conversion", ...serializeStage(conversion) },
        ],
        eventParameters: {
          discovery: aggregateParamsByEventType(discoveryParams),
          engagement: aggregateParamsByEventType(engagementParams),
          intent: aggregateParamsByEventType(intentParams),
          conversion: aggregateParamsByEventType(conversionParams),
        },
        totalEvents: evts.filter(e => e.isBot !== "true").length,
        totalUsers: new Set(evts.filter(e => e.isBot !== "true").map(e => e.visitorId)).size,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/lead-journey/strategy", requireAuth, async (req, res) => {
    try {
      const { from, to } = parseDateRange(req.query);
      const evts = await storage.getEventsByDateRange(req.params.id, from, to);
      const project = await storage.getProject(req.params.id);
      const domain = project?.domain || "the website";

      const discoveryTypes = new Set(["pageview", "session_start", "first_visit"]);
      const engagementTypes = new Set(["scroll", "key_page_view", "cta_click", "content_interaction", "click"]);
      const intentTypes = new Set(["form_start", "form_submit", "form_error", "phone_click", "email_click", "chat_start", "chat_lead"]);
      const conversionTypes = new Set(["generate_lead"]);

      const stages: Record<string, { events: number; users: Set<string>; byType: Record<string, number> }> = {
        Discovery: { events: 0, users: new Set(), byType: {} },
        Engagement: { events: 0, users: new Set(), byType: {} },
        Intent: { events: 0, users: new Set(), byType: {} },
        Conversion: { events: 0, users: new Set(), byType: {} },
      };

      const topPages: Record<string, number> = {};
      const formPages: Record<string, number> = {};
      const ctaTexts: Record<string, number> = {};
      const trafficSources: Record<string, number> = {};
      const allUsers = new Set<string>();

      for (const e of evts) {
        if (e.isBot === "true") continue;
        const vid = e.visitorId || "anon";
        const et = e.eventType;
        const meta = (e.metadata || {}) as Record<string, any>;
        allUsers.add(vid);

        let stageName: string | null = null;
        if (discoveryTypes.has(et)) stageName = "Discovery";
        else if (engagementTypes.has(et)) stageName = "Engagement";
        else if (intentTypes.has(et)) stageName = "Intent";
        else if (conversionTypes.has(et)) stageName = "Conversion";
        if (!stageName) continue;

        const stage = stages[stageName];
        stage.events++;
        stage.users.add(vid);
        stage.byType[et] = (stage.byType[et] || 0) + 1;

        if (e.page) topPages[e.page] = (topPages[e.page] || 0) + 1;
        if ((et === "form_submit" || et === "form_start" || et === "form_error") && e.page) {
          formPages[e.page] = (formPages[e.page] || 0) + 1;
        }
        if (et === "cta_click" && meta.ctaText) {
          ctaTexts[meta.ctaText] = (ctaTexts[meta.ctaText] || 0) + 1;
        }
        const ts = meta.trafficSource || e.trafficSource;
        if (ts) trafficSources[ts] = (trafficSources[ts] || 0) + 1;
      }

      const stagesSummary = Object.entries(stages).map(([name, s]) => ({
        stage: name,
        events: s.events,
        users: s.users.size,
        eventBreakdown: Object.entries(s.byType).sort((a, b) => b[1] - a[1]).map(([t, c]) => `${t}: ${c}`),
      }));

      const topPagesArr = Object.entries(topPages).sort((a, b) => b[1] - a[1]).slice(0, 20);
      const formPagesArr = Object.entries(formPages).sort((a, b) => b[1] - a[1]).slice(0, 15);
      const ctaArr = Object.entries(ctaTexts).sort((a, b) => b[1] - a[1]).slice(0, 15);
      const sourceArr = Object.entries(trafficSources).sort((a, b) => b[1] - a[1]).slice(0, 10);

      const totalEvents = evts.filter(e => e.isBot !== "true").length;
      const totalUsers = allUsers.size;

      const convRate = stages.Discovery.users.size > 0
        ? ((stages.Conversion.users.size / stages.Discovery.users.size) * 100).toFixed(2)
        : "0";
      const intentRate = stages.Discovery.users.size > 0
        ? ((stages.Intent.users.size / stages.Discovery.users.size) * 100).toFixed(2)
        : "0";

      const systemPrompt = `You are an expert digital analytics strategist, CRO (Conversion Rate Optimization) specialist, and marketing consultant. Analyze the lead journey funnel data for "${domain}" and provide an extremely comprehensive strategy report. Return valid JSON with this structure:
{
  "summary": "A detailed 4-6 paragraph executive summary covering: overall funnel health assessment with specific conversion rates, biggest bottlenecks with exact drop-off percentages, traffic quality analysis, user behaviour patterns across stages, comparison to industry benchmarks (typical B2B/B2C conversion rates), and a clear strategic direction. Reference specific pages, event types, and numbers throughout. Be extremely specific.",
  "funnelAnalysis": [
    {"stage": "string", "health": "healthy/warning/critical", "analysis": "detailed 3-5 sentence analysis of this stage including: volume assessment, user engagement quality, comparison to the other stages, specific event types driving this stage, and which pages are most active. Reference actual data.", "dropOffInsight": "detailed explanation of what's causing drop-off including: specific pages where users leave, missing engagement signals, UX friction points, and content gaps that could be addressed"}
  ],
  "quickWins": [
    {"title": "string", "action": "detailed multi-sentence action plan with specific implementation steps: what page to modify, what CTA text to use, what form fields to add/remove, where to place elements, what copy changes to make. Be prescriptive.", "expectedImpact": "high/medium/low", "stage": "Discovery/Engagement/Intent/Conversion", "metric": "specific KPI with estimated improvement (e.g., 'Expected to increase form start rate from 2% to 5%')"}
  ],
  "conversionOptimizations": [
    {"area": "string", "currentIssue": "detailed description of the current problem with data evidence", "suggestedFix": "detailed multi-sentence recommendation with step-by-step implementation: page layout changes, CTA placement, form optimization, trust signals to add, social proof elements, urgency/scarcity tactics, and A/B test suggestions", "priority": "high/medium/low", "effort": "low/medium/high"}
  ],
  "journeyInsights": [
    {"insight": "a specific, non-obvious finding from the data", "evidence": "exact data points with numbers supporting this insight", "recommendation": "actionable recommendation with implementation details", "category": "funnel/engagement/content/conversion"}
  ],
  "recommendations": [
    {"category": "CRO/UX/Content/Traffic/Technical/Email Marketing", "title": "string", "description": "detailed multi-sentence recommendation with specific implementation steps, expected timeline, and success metrics. Think like a senior consultant writing a strategy document.", "priority": "high/medium/low", "effort": "low/medium/high", "expectedOutcome": "measurable expected result with specific numbers"}
  ]
}
Limit each array to maximum 8 items. Be extremely specific, actionable, and data-driven. Reference actual pages, events, and numbers from the data provided. Think like a senior digital marketing consultant presenting a comprehensive strategy to a client.`;

      const userPrompt = `Analyze this lead journey funnel data for ${domain}:

FUNNEL OVERVIEW:
- Total events: ${totalEvents}, Total users: ${totalUsers}
- Overall conversion rate (Discovery → Conversion): ${convRate}%
- Intent rate (Discovery → Intent): ${intentRate}%

STAGE BREAKDOWN:
${stagesSummary.map(s => `${s.stage}: ${s.users} users, ${s.events} events\n  Events: ${s.eventBreakdown.join(", ")}`).join("\n")}

DROP-OFF ANALYSIS:
- Discovery → Engagement: ${stages.Discovery.users.size > 0 ? ((1 - stages.Engagement.users.size / stages.Discovery.users.size) * 100).toFixed(1) : 0}% drop-off
- Engagement → Intent: ${stages.Engagement.users.size > 0 ? ((1 - stages.Intent.users.size / stages.Engagement.users.size) * 100).toFixed(1) : 0}% drop-off
- Intent → Conversion: ${stages.Intent.users.size > 0 ? ((1 - stages.Conversion.users.size / stages.Intent.users.size) * 100).toFixed(1) : 0}% drop-off

TOP PAGES BY EVENTS:
${topPagesArr.map(([p, c]) => `${p}: ${c} events`).join("\n")}

FORM ACTIVITY BY PAGE:
${formPagesArr.length > 0 ? formPagesArr.map(([p, c]) => `${p}: ${c} form events`).join("\n") : "No form events recorded"}

TOP CTA CLICKS:
${ctaArr.length > 0 ? ctaArr.map(([t, c]) => `"${t}": ${c} clicks`).join("\n") : "No CTA clicks recorded"}

TRAFFIC SOURCES:
${sourceArr.length > 0 ? sourceArr.map(([s, c]) => `${s}: ${c} events`).join("\n") : "No traffic source data"}`;

      const result = await aiChatJSON(systemPrompt, userPrompt);

      const report = await storage.createLeadJourneyReport({
        projectId: req.params.id,
        summary: result.data?.summary || result.summary || "",
        funnelAnalysis: result.data?.funnelAnalysis || result.funnelAnalysis || [],
        quickWins: result.data?.quickWins || result.quickWins || [],
        conversionOptimizations: result.data?.conversionOptimizations || result.conversionOptimizations || [],
        journeyInsights: result.data?.journeyInsights || result.journeyInsights || [],
        recommendations: result.data?.recommendations || result.recommendations || [],
        totalEvents: totalEvents,
        totalUsers: totalUsers,
      });

      res.json(report);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id/lead-journey/strategies", requireAuth, async (req, res) => {
    try {
      const reports = await storage.getLeadJourneyReports(req.params.id);
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/lead-journey/strategy/:reportId", requireAuth, async (req, res) => {
    try {
      await storage.deleteLeadJourneyReport(req.params.reportId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id/ga4/status", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const connection = await getGA4ConnectionForProject(req.params.id);
      res.json({
        connected: connection.connected,
        propertyId: connection.propertyId || null,
        hasCredentials: connection.hasCredentials || false,
        hasOAuth: connection.hasOAuth || false,
        hasPropertyId: connection.hasPropertyId || false,
      });
    } catch (err: any) {
      res.json({ connected: false, hasCredentials: false, hasOAuth: false, hasPropertyId: false });
    }
  });

  app.get("/api/projects/:id/lead-journey/ga4", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const connection = await getGA4ConnectionForProject(req.params.id);
      if (!connection.connected || !connection.integration || !connection.propertyId) {
        return res.status(400).json({ message: "GA4 is not connected. Please connect Google Analytics in the Integrations page and set your GA4 Property ID in Project Settings." });
      }

      console.log(`[GA4] Fetching lead journey for project ${req.params.id}, property ${connection.propertyId}`);
      const accessToken = await refreshAccessToken(connection.integration as any, project as any);
      const { from, to } = parseDateRange(req.query);
      const startDate = from.toISOString().split("T")[0];
      const endDate = to.toISOString().split("T")[0];

      const stages = await fetchGA4LeadJourneyData(accessToken, connection.propertyId, startDate, endDate);
      console.log(`[GA4] Lead journey stages:`, stages.map(s => `${s.name}: ${s.events} events, ${s.users} users`));
      res.json({ stages, source: "ga4" });
    } catch (err: any) {
      console.error(`[GA4] Lead journey error:`, err.message);
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id/funnels/:funnelId/analysis/ga4", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const connection = await getGA4ConnectionForProject(req.params.id);
      if (!connection.connected || !connection.integration || !connection.propertyId) {
        return res.status(400).json({ message: "GA4 is not connected." });
      }

      const funnel = await storage.getFunnel(req.params.funnelId);
      if (!funnel) return res.status(404).json({ message: "Funnel not found" });

      const accessToken = await refreshAccessToken(connection.integration as any, project as any);
      const { from, to } = parseDateRange(req.query);
      const startDate = from.toISOString().split("T")[0];
      const endDate = to.toISOString().split("T")[0];

      const steps = (funnel.steps as Array<{ name: string; type: string; value: string }>) || [];
      const stepsData = [];
      let previousUsers = 0;

      const funnelStepToGA4Event = (step: { type: string; value: string }): string => {
        if (step.type === "pageview") return "page_view";
        if (step.type === "event") return step.value || "page_view";
        if (step.type === "click") return "click";
        return step.value || "page_view";
      };

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const eventName = funnelStepToGA4Event(step);

        let dimensionFilter: any = {
          filter: {
            fieldName: "eventName",
            stringFilter: { matchType: "EXACT", value: eventName },
          },
        };

        if (step.type === "pageview" && step.value) {
          dimensionFilter = {
            andGroup: {
              expressions: [
                { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "page_view" } } },
                { filter: { fieldName: "pagePathPlusQueryString", stringFilter: { matchType: "CONTAINS", value: step.value } } },
              ],
            },
          };
        }

        try {
          const report = await runGA4Report(accessToken, connection.propertyId, {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "eventName" }],
            metrics: [{ name: "totalUsers" }, { name: "eventCount" }],
            dimensionFilter,
          });

          const row = report.rows?.[0];
          const users = parseInt(row?.metricValues?.[0]?.value || "0", 10);
          const events = parseInt(row?.metricValues?.[1]?.value || "0", 10);
          const conversionRate = i === 0 ? 100 : previousUsers > 0 ? (users / previousUsers) * 100 : 0;
          const dropOff = i === 0 ? 0 : previousUsers > 0 ? ((previousUsers - users) / previousUsers) * 100 : 0;

          stepsData.push({
            step: i + 1,
            name: step.name || eventName,
            type: step.type,
            value: step.value,
            users,
            events,
            conversionRate: Math.round(conversionRate * 10) / 10,
            dropOff: Math.round(dropOff * 10) / 10,
          });

          if (i === 0 || users > 0) previousUsers = users;
        } catch {
          stepsData.push({
            step: i + 1,
            name: step.name || eventName,
            type: step.type,
            value: step.value,
            users: 0,
            events: 0,
            conversionRate: 0,
            dropOff: 0,
          });
        }
      }

      res.json({
        funnel: { id: funnel.id, name: funnel.name },
        steps: stepsData,
        source: "ga4",
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/projects/:id/reports/:reportId/data/ga4", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const connection = await getGA4ConnectionForProject(req.params.id);
      if (!connection.connected || !connection.integration || !connection.propertyId) {
        return res.status(400).json({ message: "GA4 is not connected." });
      }

      const report = await storage.getCustomReport(req.params.reportId);
      if (!report) return res.status(404).json({ message: "Report not found" });

      const accessToken = await refreshAccessToken(connection.integration as any, project as any);
      const { from, to } = parseDateRange(req.query);
      const startDate = from.toISOString().split("T")[0];
      const endDate = to.toISOString().split("T")[0];

      const metricsConfig = (report.metrics as string[]) || ["pageViews"];
      const dimensionsConfig = (report.dimensions as string[]) || ["date"];

      const metricMapping: Record<string, string> = {
        pageViews: "screenPageViews",
        visitors: "totalUsers",
        sessions: "sessions",
        clicks: "eventCount",
        bounceRate: "bounceRate",
        scrolls: "eventCount",
        avgSessionDuration: "averageSessionDuration",
        conversions: "conversions",
        events: "eventCount",
        newUsers: "newUsers",
        engagementRate: "engagementRate",
        activeUsers: "activeUsers",
      };

      const dimensionMapping: Record<string, string> = {
        date: "date",
        hour: "hour",
        page: "pagePathPlusQueryString",
        device: "deviceCategory",
        browser: "browser",
        country: "country",
        city: "city",
        referrer: "sessionSource",
        os: "operatingSystem",
        language: "language",
        eventType: "eventName",
        week: "isoYearIsoWeek",
        month: "yearMonth",
      };

      const unsupportedMetrics = metricsConfig.filter(m => !metricMapping[m]);
      const unsupportedDimensions = dimensionsConfig.filter(d => !dimensionMapping[d]);

      if (unsupportedMetrics.length > 0 || unsupportedDimensions.length > 0) {
        const issues = [];
        if (unsupportedMetrics.length > 0) issues.push(`Unsupported metrics for GA4: ${unsupportedMetrics.join(", ")}`);
        if (unsupportedDimensions.length > 0) issues.push(`Unsupported dimensions for GA4: ${unsupportedDimensions.join(", ")}`);
        return res.status(400).json({ message: issues.join(". ") + ". Please switch to myuserjourney data source for this report." });
      }

      const ga4Metrics = metricsConfig.map(m => ({ name: metricMapping[m] }));
      const ga4Dimensions = dimensionsConfig.map(d => ({ name: dimensionMapping[d] }));

      const ga4Report = await runGA4Report(accessToken, connection.propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: ga4Dimensions,
        metrics: ga4Metrics,
        limit: 500,
        orderBys: ga4Dimensions.length > 0 ? [{ dimension: { dimensionName: ga4Dimensions[0].name, orderType: "ALPHANUMERIC" } }] : undefined,
      });

      const rows = (ga4Report.rows || []).map((row) => {
        const item: Record<string, any> = {};
        dimensionsConfig.forEach((dim, i) => {
          item[dim] = row.dimensionValues[i]?.value || "";
        });
        metricsConfig.forEach((metric, i) => {
          const val = row.metricValues[i]?.value || "0";
          item[metric] = parseFloat(val);
        });
        return item;
      });

      res.json({ data: rows, source: "ga4" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Geography endpoint
  app.get("/api/projects/:id/geography", async (req, res) => {
    try {
      const period = (req.query.period as string) || "last_30_days";
      const { from, to } = parseDateRange(req.query);
      const evts = await storage.getEventsByDateRange(req.params.id, from, to);

      const countryMap = new Map<string, { users: Set<string>; sessions: Set<string>; events: number }>();
      const cityMap = new Map<string, { users: Set<string>; sessions: Set<string>; events: number; country: string }>();
      const langMap = new Map<string, { users: Set<string>; events: number }>();

      evts.forEach(e => {
        const country = e.country || "Unknown";
        if (!countryMap.has(country)) countryMap.set(country, { users: new Set(), sessions: new Set(), events: 0 });
        const cm = countryMap.get(country)!;
        cm.users.add(e.visitorId || e.id);
        cm.sessions.add(e.sessionId || e.id);
        cm.events++;

        const city = e.city || "Unknown";
        const cityKey = `${city}, ${country}`;
        if (!cityMap.has(cityKey)) cityMap.set(cityKey, { users: new Set(), sessions: new Set(), events: 0, country });
        const ct = cityMap.get(cityKey)!;
        ct.users.add(e.visitorId || e.id);
        ct.sessions.add(e.sessionId || e.id);
        ct.events++;

        const meta = e.metadata as any;
        if (meta && meta.language) {
          const lang = meta.language;
          if (!langMap.has(lang)) langMap.set(lang, { users: new Set(), events: 0 });
          langMap.get(lang)!.users.add(e.visitorId || e.id);
          langMap.get(lang)!.events++;
        }
      });

      const countries = Array.from(countryMap.entries())
        .map(([name, d]) => ({ name, users: d.users.size, sessions: d.sessions.size, events: d.events }))
        .sort((a, b) => b.users - a.users).slice(0, 50);
      const cities = Array.from(cityMap.entries())
        .map(([name, d]) => ({ name, users: d.users.size, sessions: d.sessions.size, events: d.events, country: d.country }))
        .sort((a, b) => b.users - a.users).slice(0, 50);
      const languages = Array.from(langMap.entries())
        .map(([name, d]) => ({ name, users: d.users.size, events: d.events }))
        .sort((a, b) => b.users - a.users).slice(0, 30);

      res.json({ period, countries, cities, languages });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Browsers & Systems endpoint
  app.get("/api/projects/:id/tech", async (req, res) => {
    try {
      const period = (req.query.period as string) || "last_30_days";
      const { from, to } = parseDateRange(req.query);
      const evts = await storage.getEventsByDateRange(req.params.id, from, to);

      const browserMap = new Map<string, { users: Set<string>; sessions: Set<string>; events: number }>();
      const osMap = new Map<string, { users: Set<string>; sessions: Set<string>; events: number }>();
      const deviceMap = new Map<string, { users: Set<string>; sessions: Set<string>; events: number }>();

      evts.forEach(e => {
        const browser = e.browser || "Unknown";
        if (!browserMap.has(browser)) browserMap.set(browser, { users: new Set(), sessions: new Set(), events: 0 });
        const b = browserMap.get(browser)!;
        b.users.add(e.visitorId || e.id);
        b.sessions.add(e.sessionId || e.id);
        b.events++;

        const os = e.os || "Unknown";
        if (!osMap.has(os)) osMap.set(os, { users: new Set(), sessions: new Set(), events: 0 });
        const o = osMap.get(os)!;
        o.users.add(e.visitorId || e.id);
        o.sessions.add(e.sessionId || e.id);
        o.events++;

        const device = e.device || "Unknown";
        if (!deviceMap.has(device)) deviceMap.set(device, { users: new Set(), sessions: new Set(), events: 0 });
        const d = deviceMap.get(device)!;
        d.users.add(e.visitorId || e.id);
        d.sessions.add(e.sessionId || e.id);
        d.events++;
      });

      const browsers = Array.from(browserMap.entries())
        .map(([name, d]) => ({ name, users: d.users.size, sessions: d.sessions.size, events: d.events }))
        .sort((a, b) => b.users - a.users);
      const operatingSystems = Array.from(osMap.entries())
        .map(([name, d]) => ({ name, users: d.users.size, sessions: d.sessions.size, events: d.events }))
        .sort((a, b) => b.users - a.users);
      const devices = Array.from(deviceMap.entries())
        .map(([name, d]) => ({ name, users: d.users.size, sessions: d.sessions.size, events: d.events }))
        .sort((a, b) => b.users - a.users);

      res.json({ period, browsers, operatingSystems, devices });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Site Audit - basic crawl endpoint
  app.post("/api/projects/:id/site-audit", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      const domain = project.domain.replace(/^https?:\/\//, "").replace(/\/+$/, "");
      const urls = req.body.urls || [`https://${domain}`];
      const results: any[] = [];

      for (const url of urls.slice(0, 10)) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          const response = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "DigitalAnalystBot/1.0" } });
          clearTimeout(timeout);
          const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
          if (contentLength > 5 * 1024 * 1024) {
            results.push({ url, error: "Page too large (>5MB)", status: 0, score: 0, issues: ["Page exceeds 5MB size limit"] });
            continue;
          }
          const html = (await response.text()).slice(0, 2 * 1024 * 1024);
          const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
          const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i)
            || html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["']/i);
          const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
          const h2Matches = html.match(/<h2[^>]*>[\s\S]*?<\/h2>/gi) || [];
          const imgMatches = html.match(/<img[^>]*>/gi) || [];
          const imgsNoAlt = imgMatches.filter(img => !img.match(/alt=["'][^"']+["']/i)).length;
          const internalLinks = (html.match(new RegExp(`href=["'][^"']*${domain.replace(/\./g, "\\.")}[^"']*["']`, "gi")) || []).length;
          const externalLinks = (html.match(/href=["']https?:\/\/[^"']+["']/gi) || []).length - internalLinks;
          const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([\s\S]*?)["']/i);
          const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([\s\S]*?)["']/i);
          const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i);

          const issues: string[] = [];
          const title = titleMatch ? titleMatch[1].trim() : null;
          if (!title) issues.push("Missing page title");
          else if (title.length > 60) issues.push("Title too long (>60 chars)");
          else if (title.length < 10) issues.push("Title too short (<10 chars)");
          const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : null;
          if (!metaDesc) issues.push("Missing meta description");
          else if (metaDesc.length > 160) issues.push("Meta description too long (>160 chars)");
          if (h1Matches.length === 0) issues.push("Missing H1 tag");
          if (h1Matches.length > 1) issues.push("Multiple H1 tags found");
          if (imgsNoAlt > 0) issues.push(`${imgsNoAlt} image(s) missing alt text`);
          if (!canonicalMatch) issues.push("Missing canonical URL");
          if (!ogTitleMatch) issues.push("Missing Open Graph tags");

          let score = 100;
          score -= issues.length * 8;
          if (score < 0) score = 0;

          results.push({
            url,
            status: response.status,
            score,
            title,
            metaDescription: metaDesc,
            h1Count: h1Matches.length,
            h2Count: h2Matches.length,
            totalImages: imgMatches.length,
            imagesWithoutAlt: imgsNoAlt,
            internalLinks,
            externalLinks: Math.max(0, externalLinks),
            hasCanonical: !!canonicalMatch,
            hasRobotsMeta: !!robotsMatch,
            robotsContent: robotsMatch ? robotsMatch[1] : null,
            hasOgTags: !!ogTitleMatch,
            issues,
          });
        } catch (urlErr: any) {
          results.push({ url, status: 0, score: 0, error: urlErr.message, issues: ["Failed to fetch page"] });
        }
      }

      res.json({ domain, results, crawledAt: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // AI Status - check if OpenAI API key is configured
  app.get("/api/ai/status", async (_req, res) => {
    const available = !!(process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY);
    res.json({ available });
  });

  // AI Usage tracking
  app.get("/api/ai/usage", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { from, to } = req.query;
      const fromDate = from ? new Date(from as string) : undefined;
      const toDate = to ? new Date(to as string) : undefined;
      const logs = await storage.getAiUsageLogs(user.id, fromDate, toDate);
      const totalCost = await storage.getAiUsageTotalCost(user.id, fromDate, toDate);
      res.json({ logs, totalCost });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/ai/usage/current-month", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const totalCost = await storage.getAiUsageTotalCost(user.id, firstDay, lastDay);
      const logs = await storage.getAiUsageLogs(user.id, firstDay, lastDay);
      const featureBreakdown: Record<string, { count: number; cost: number }> = {};
      for (const log of logs) {
        if (!featureBreakdown[log.feature]) {
          featureBreakdown[log.feature] = { count: 0, cost: 0 };
        }
        featureBreakdown[log.feature].count++;
        featureBreakdown[log.feature].cost += log.costUsd;
      }
      res.json({
        totalCostUsd: totalCost,
        totalRequests: logs.length,
        billingThresholdUsd: 10,
        featureBreakdown,
        periodStart: firstDay.toISOString(),
        periodEnd: lastDay.toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Billing status
  app.get("/api/billing/status", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const totalCost = await storage.getAiUsageTotalCost(user.id, firstDay, lastDay);
      const userInvoices = await storage.getInvoices(user.id);
      res.json({
        currentMonthUsageUsd: totalCost,
        billingThresholdUsd: 10,
        stripeConfigured: isStripeConfigured(),
        invoices: userInvoices,
      });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });


  // AI Settings
  app.get("/api/ai-settings", async (_req, res) => {
    try {
      const settings = await storage.getAiSettings("default");
      res.json(settings || null);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/ai-settings", async (req, res) => {
    try {
      const settings = await storage.upsertAiSettings({
        userId: req.body.userId || "default",
        provider: req.body.provider || "none",
        apiKey: req.body.apiKey || null,
        model: req.body.model || null,
      });
      res.json(settings);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // AI Report Generation - parse natural language into report config
  app.post("/api/projects/:id/ai-generate-report", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ message: "Prompt is required" });

      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      const config = parseReportPrompt(prompt);

      const report = await storage.createCustomReport({
        projectId: req.params.id,
        name: config.name,
        description: `AI-generated: "${prompt}"`,
        metrics: config.metrics,
        dimensions: config.dimensions,
        chartType: config.chartType,
        dateRange: config.dateRange,
        filters: config.filters,
      });

      res.status(201).json(report);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // AI Insights
  app.post("/api/projects/:id/ai-insights", async (req, res) => {
    try {
      const { prompt } = req.body;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      const analytics = await storage.getAnalyticsSummary(req.params.id);

      // Generate data-driven insight based on analytics
      const insight = generateDataInsight(prompt, project, analytics);
      res.json({ insight });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === Global AI Chat (context-aware, available on every page) ===
  app.post("/api/ai/chat", requireAuth, async (req, res) => {
    try {
      const { prompt, pageContext, projectId } = req.body;
      const user = req.user as any;
      if (!prompt) return res.status(400).json({ message: "Prompt is required" });

      const contextDesc = aiPageContexts[pageContext] || "You are an analytics assistant.";
      let dataContext = "";
      if (projectId) {
        try {
          const project = await storage.getProject(projectId);
          if (project && (user.role === "admin" || project.userId === user.id)) {
            const analytics = await storage.getAnalyticsSummary(projectId);
            dataContext = `\nProject: ${project.name} (${project.domain})\nAnalytics summary: ${JSON.stringify(analytics)}`;
          }
        } catch {}
      }

      const systemPrompt = `${contextDesc}${dataContext}\n\nProvide helpful, actionable advice. Format with markdown for readability. Be concise but thorough.`;
      const result = await aiChat(systemPrompt, prompt);
      if (result.model !== "fallback") {
        await storage.logAiUsage({ userId: user.id, feature: "ai-chat", model: result.model, inputTokens: result.inputTokens, outputTokens: result.outputTokens, costUsd: calculateCostUsd(result.inputTokens, result.outputTokens) });
      }
      res.json({ response: result.content });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === AI Funnel Generation ===
  app.post("/api/projects/:id/ai-generate-funnel", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { prompt } = req.body;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });

      const systemPrompt = `You are a conversion funnel expert. Generate a funnel configuration based on the user's description.
Return JSON with this exact structure:
{
  "name": "Funnel Name",
  "description": "Brief description",
  "steps": [
    { "name": "Step Name", "type": "pageview|event|click", "value": "URL or event type" }
  ]
}
Domain: ${project.domain}. Create realistic steps that match the website type. Include 3-6 steps.`;

      const result = await aiChatJSON(systemPrompt, prompt);
      if (result.usage.model !== "fallback") {
        await storage.logAiUsage({ userId: user.id, feature: "ai-funnel-generation", model: result.usage.model, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens, costUsd: calculateCostUsd(result.usage.inputTokens, result.usage.outputTokens) });
      }
      const funnel = await storage.createFunnel({
        projectId: req.params.id,
        name: result.data.name || "AI-Generated Funnel",
        description: result.data.description || `AI-generated: "${prompt}"`,
        steps: result.data.steps || [],
      });
      res.status(201).json(funnel);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === Content Gap Analysis ===
  app.get("/api/projects/:id/content-gap", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      const analyses = await storage.getContentGapAnalyses(req.params.id);
      res.json(analyses);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/content-gap/analyze", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { prompt, domain } = req.body;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });

      const targetDomain = domain || project.domain;
      const analytics = await storage.getAnalyticsSummary(req.params.id);

      const systemPrompt = `You are an expert SEO and content strategist. Analyse the domain "${targetDomain}" and provide comprehensive content gap analysis.
Return JSON with this exact structure:
{
  "keywords": [{ "keyword": "string", "volume": number, "difficulty": "low|medium|high", "currentRank": number|null, "opportunity": "string" }],
  "contentGaps": [{ "topic": "string", "description": "string", "priority": "high|medium|low", "estimatedTraffic": number }],
  "competitors": [{ "domain": "string", "overlap": number, "strengths": ["string"], "weaknesses": ["string"] }],
  "blogTopics": [{ "title": "string", "keyword": "string", "priority": "high|medium|low", "wordCount": number, "outline": ["string"], "searchIntent": "informational|transactional|navigational" }]
}
Provide realistic, actionable data. Include at least 8 keywords, 5 content gaps, 3 competitors, and 6 blog topics.
Analytics context: ${JSON.stringify(analytics)}`;

      const result = await aiChatJSON(systemPrompt, prompt || `Analyze content gaps for ${targetDomain}`);
      if (result.usage.model !== "fallback") {
        await storage.logAiUsage({ userId: user.id, feature: "content-gap-analysis", model: result.usage.model, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens, costUsd: calculateCostUsd(result.usage.inputTokens, result.usage.outputTokens) });
      }

      const analysis = await storage.createContentGapAnalysis({
        projectId: req.params.id,
        domain: targetDomain,
        keywords: result.data.keywords || [],
        contentGaps: result.data.contentGaps || [],
        competitors: result.data.competitors || [],
        blogTopics: result.data.blogTopics || [],
        status: "completed",
      });
      res.status(201).json(analysis);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/content-gap/:analysisId", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      await storage.deleteContentGapAnalysis(req.params.analysisId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === Predictive Analytics ===
  app.get("/api/projects/:id/predictive-analytics", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      const analyses = await storage.getPredictiveAnalyses(req.params.id);
      res.json(analyses);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/predictive-analytics/run", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });

      const analytics = await storage.getAnalyticsSummary(req.params.id);
      const systemPrompt = `You are an expert predictive analytics AI. Analyse the website "${project.domain}" and its analytics data to predict user behaviour trends.
Return JSON with this exact structure:
{
  "churnRiskScore": number (0-1),
  "churnDrivers": [{ "factor": "string", "impact": "high|medium|low", "trend": "increasing|decreasing|stable", "detail": "string" }],
  "revenueTrend": { "current": number, "projected": [{ "month": "string", "value": number, "confidence": number }] },
  "conversionProbability": number (0-1),
  "recommendations": [{ "action": "string", "priority": "high|medium|low", "expectedImpact": "string" }],
  "summary": "string"
}
Analytics context: ${JSON.stringify(analytics)}`;

      const result = await aiChatJSON(systemPrompt, `Predict churn risk, revenue trends, and conversion probability for ${project.domain}`);
      if (result.usage.model !== "fallback") {
        await storage.logAiUsage({ userId: user.id, feature: "predictive-analytics", model: result.usage.model, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens, costUsd: calculateCostUsd(result.usage.inputTokens, result.usage.outputTokens) });
      }

      const analysis = await storage.createPredictiveAnalysis({
        projectId: req.params.id,
        churnRiskScore: result.data.churnRiskScore || 0,
        churnDrivers: result.data.churnDrivers || [],
        revenueTrend: result.data.revenueTrend || { current: 0, projected: [] },
        conversionProbability: result.data.conversionProbability || 0,
        recommendations: result.data.recommendations || [],
        summary: result.data.summary || null,
      });
      res.status(201).json(analysis);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/predictive-analytics/:analysisId", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      await storage.deletePredictiveAnalysis(req.params.analysisId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === UX Auditor ===
  app.get("/api/projects/:id/ux-audits", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      const audits = await storage.getUxAudits(req.params.id);
      res.json(audits);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/ux-audits/run", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });

      const analytics = await storage.getAnalyticsSummary(req.params.id);
      const systemPrompt = `You are an expert UX auditor. Analyse the website "${project.domain}" and its analytics data to identify UX issues.
Return JSON with this exact structure:
{
  "score": number (0-100),
  "slowPages": [{ "page": "string", "loadTime": number, "benchmark": number, "severity": "high|medium|low", "suggestion": "string" }],
  "flowIssues": [{ "flow": "string", "severity": "high|medium|low", "description": "string", "dropOffRate": number, "suggestion": "string" }],
  "navigationIssues": [{ "issue": "string", "severity": "high|medium|low", "location": "string", "description": "string", "suggestion": "string" }],
  "recommendations": [{ "category": "string", "action": "string", "priority": "high|medium|low", "effort": "low|medium|high" }],
  "summary": "string"
}
Analytics context: ${JSON.stringify(analytics)}`;

      const result = await aiChatJSON(systemPrompt, `Run a UX audit on ${project.domain} to detect slow pages, bad UX flows, and navigation issues`);
      if (result.usage.model !== "fallback") {
        await storage.logAiUsage({ userId: user.id, feature: "ux-audit", model: result.usage.model, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens, costUsd: calculateCostUsd(result.usage.inputTokens, result.usage.outputTokens) });
      }

      const audit = await storage.createUxAudit({
        projectId: req.params.id,
        score: result.data.score || 0,
        slowPages: result.data.slowPages || [],
        flowIssues: result.data.flowIssues || [],
        navigationIssues: result.data.navigationIssues || [],
        recommendations: result.data.recommendations || [],
        summary: result.data.summary || null,
      });
      res.status(201).json(audit);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/ux-audits/:auditId", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      await storage.deleteUxAudit(req.params.auditId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === Marketing Copilot ===
  app.get("/api/projects/:id/marketing-copilot", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      const sessions = await storage.getMarketingCopilotSessions(req.params.id);
      res.json(sessions);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/projects/:id/marketing-copilot/run", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { prompt } = req.body;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });

      const analytics = await storage.getAnalyticsSummary(req.params.id);
      const systemPrompt = `You are an AI marketing copilot. Analyse the website "${project.domain}" and provide actionable marketing recommendations.
Return JSON with this exact structure:
{
  "seoFixes": [{ "issue": "string", "severity": "high|medium|low", "pages": number, "description": "string", "fix": "string" }],
  "ppcOptimizations": [{ "campaign": "string", "currentBudget": number, "suggestedBudget": number, "reason": "string", "expectedROI": "string", "priority": "high|medium|low" }],
  "uxImprovements": [{ "area": "string", "severity": "high|medium|low", "issue": "string", "suggestion": "string", "expectedImpact": "string" }],
  "summary": "string"
}
Analytics context: ${JSON.stringify(analytics)}`;

      const result = await aiChatJSON(systemPrompt, prompt || `Provide marketing copilot recommendations for ${project.domain} covering SEO fixes, PPC budget optimization, and UX improvements`);
      if (result.usage.model !== "fallback") {
        await storage.logAiUsage({ userId: user.id, feature: "marketing-copilot", model: result.usage.model, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens, costUsd: calculateCostUsd(result.usage.inputTokens, result.usage.outputTokens) });
      }

      const session = await storage.createMarketingCopilotSession({
        projectId: req.params.id,
        prompt: prompt || null,
        seoFixes: result.data.seoFixes || [],
        ppcOptimizations: result.data.ppcOptimizations || [],
        uxImprovements: result.data.uxImprovements || [],
        summary: result.data.summary || null,
      });
      res.status(201).json(session);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/marketing-copilot/:sessionId", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      await storage.deleteMarketingCopilotSession(req.params.sessionId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === Project Logo ===
  app.get("/api/projects/:id/logo", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      const logo = await storage.getProjectLogo(req.params.id);
      res.json(logo || null);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/projects/:id/logo", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      const { logoData, logoName } = req.body;
      if (!logoData || !logoName) return res.status(400).json({ message: "Logo data and name required" });
      if (logoData.length > 3 * 1024 * 1024) return res.status(400).json({ message: "Logo too large (max 2MB)" });
      const logo = await storage.upsertProjectLogo({
        projectId: req.params.id,
        logoData,
        logoName,
      });
      res.json(logo);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/projects/:id/logo", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      await storage.deleteProjectLogo(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === AI Report Insights ===
  app.post("/api/projects/:id/reports/:reportId/ai-insights", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      const analytics = await storage.getAnalyticsSummary(req.params.id);

      const systemPrompt = `You are an analytics expert. Provide actionable insights for this report.
Project: ${project.name} (${project.domain})
Analytics: ${JSON.stringify(analytics)}
Give 3-5 key insights with specific recommendations. Format with markdown.`;

      const result = await aiChat(systemPrompt, req.body.prompt || "Provide key insights and recommendations for this report data.");
      if (result.model !== "fallback") {
        await storage.logAiUsage({ userId: user.id, feature: "report-insights", model: result.model, inputTokens: result.inputTokens, outputTokens: result.outputTokens, costUsd: calculateCostUsd(result.inputTokens, result.outputTokens) });
      }
      res.json({ insights: result.content });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === Site Research ===
  app.get("/api/site-research", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const reports = await storage.getSiteResearchReports(user.id);
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/site-research/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const report = await storage.getSiteResearchReport(req.params.id);
      if (!report) return res.status(404).json({ message: "Report not found" });
      if (user.role !== "admin" && report.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/site-research/analyze", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { domain } = req.body;
      if (!domain) return res.status(400).json({ message: "Domain is required" });

      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/[^a-zA-Z0-9.\-]/g, "");

      const blockedPatterns = /^(localhost|127\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|0\.|169\.254\.|::1|fc|fd|fe80)/i;
      if (blockedPatterns.test(cleanDomain)) {
        return res.status(400).json({ message: "Invalid domain: private or local addresses are not allowed" });
      }
      if (!cleanDomain.includes(".") || cleanDomain.length < 4) {
        return res.status(400).json({ message: "Please enter a valid domain name" });
      }

      let crawledPages: string[] = [];
      let crawledTitle = "";
      let crawledDescription = "";
      let crawledLinks: string[] = [];
      let crawlError = "";

      try {
        const homepageUrl = `https://${cleanDomain}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const homeRes = await fetch(homepageUrl, {
          signal: controller.signal,
          headers: { "User-Agent": "MyUserJourney-SiteResearch/1.0" },
        });
        clearTimeout(timeout);
        const html = await homeRes.text();

        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        crawledTitle = titleMatch ? titleMatch[1].trim() : "";

        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i)
          || html.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/i);
        crawledDescription = descMatch ? descMatch[1].trim() : "";

        const hrefRegex = /href=["']\/([\w\-\/]+?)["']/g;
        const foundPaths = new Set<string>();
        let match;
        while ((match = hrefRegex.exec(html)) !== null) {
          const path = "/" + match[1].replace(/\/$/, "");
          if (path.length > 1 && !path.includes(".") && !path.startsWith("/wp-") && !path.startsWith("/cdn-")) {
            foundPaths.add(path);
          }
        }
        crawledPages = Array.from(foundPaths).slice(0, 50);

        const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/gi;
        let navMatch;
        while ((navMatch = navRegex.exec(html)) !== null) {
          const navHtml = navMatch[1];
          const navLinks = navHtml.match(/href=["']\/([\w\-\/]+?)["']/g) || [];
          navLinks.forEach(l => {
            const p = "/" + l.replace(/href=["']\//, "").replace(/["']/, "").replace(/\/$/, "");
            if (p.length > 1) crawledLinks.push(p);
          });
        }

        try {
          const sitemapUrl = `https://${cleanDomain}/sitemap.xml`;
          const smController = new AbortController();
          const smTimeout = setTimeout(() => smController.abort(), 8000);
          const smRes = await fetch(sitemapUrl, {
            signal: smController.signal,
            headers: { "User-Agent": "MyUserJourney-SiteResearch/1.0" },
          });
          clearTimeout(smTimeout);
          if (smRes.ok) {
            const smText = await smRes.text();
            const locRegex = /<loc>(.*?)<\/loc>/g;
            let locMatch;
            while ((locMatch = locRegex.exec(smText)) !== null) {
              try {
                const url = new URL(locMatch[1]);
                if (url.pathname && url.pathname !== "/") {
                  crawledPages.push(url.pathname);
                }
              } catch {}
            }
            crawledPages = Array.from(new Set(crawledPages)).slice(0, 100);
          }
        } catch {}
      } catch (e: any) {
        crawlError = e.message || "Could not reach the website";
      }

      const crawlContext = crawledPages.length > 0
        ? `\n\nVERIFIED SITE DATA (from actual crawl of ${cleanDomain}):
- Page title: "${crawledTitle}"
- Meta description: "${crawledDescription}"
- Verified pages found on the site: ${crawledPages.join(", ")}
- Navigation links: ${crawledLinks.length > 0 ? crawledLinks.join(", ") : "N/A"}

IMPORTANT: You MUST ONLY use pages from the verified list above in your topPages, organicKeywords URLs, paidKeywords URLs, and siteStructure subfolders. Do NOT invent any pages or URLs that are not in this verified list.`
        : crawlError
          ? `\n\nWARNING: Could not crawl ${cleanDomain} (${crawlError}). Since we cannot verify which pages exist, return EMPTY arrays for organicKeywords, topPages, paidKeywords, and siteStructure subfolders. Only provide the overview with a description if you know what this business does, and opportunities based on general best practices. Set all numeric estimates to 0 if you are unsure.`
          : `\n\nWARNING: No pages could be verified for ${cleanDomain}. Return EMPTY arrays for data that requires verified URLs.`;

      const systemPrompt = `You are an expert SEO analyst. Analyze the domain "${cleanDomain}" based on verified crawl data provided below.

CRITICAL RULES:
1. ONLY reference pages that appear in the VERIFIED SITE DATA below. Do NOT invent or guess any pages or URLs.
2. For keywords, only include terms directly relevant to the verified pages and content found on the site.
3. For backlinks referring domains, leave the array empty (we cannot verify backlinks without a real SEO tool).
4. For competitors, only include real businesses you know exist in the same industry.
5. All traffic numbers, keyword volumes, and positions are ESTIMATES. Use conservative values.
6. If you don't know something, use 0 or "Unknown" rather than guessing.
7. The description must accurately reflect what the site actually does based on the crawled title and description.
${crawlContext}

Return JSON with this exact structure:
{
  "overview": {
    "domain": "${cleanDomain}",
    "authorityScore": number (0-100, conservative),
    "estimatedMonthlyTraffic": number,
    "totalBacklinks": number (use 0 if unknown),
    "referringDomains": number (use 0 if unknown),
    "organicKeywordsCount": number,
    "paidKeywordsCount": number (use 0 if unknown),
    "domainAge": "string or Unknown",
    "topCountry": "string",
    "topCountryShare": number,
    "trafficTrend": "up|down|stable",
    "trafficChange": number,
    "category": "string",
    "description": "string based on actual crawled data"
  },
  "organicKeywords": [
    { "keyword": "string", "position": number, "volume": number, "difficulty": number, "cpc": number, "url": "string (MUST be from verified pages)", "traffic": number, "trafficShare": number }
  ],
  "topPages": [
    { "url": "string (MUST be from verified pages)", "traffic": number, "keywords": number, "backlinks": number, "topKeyword": "string" }
  ],
  "backlinks": {
    "total": 0,
    "dofollow": 0,
    "nofollow": 0,
    "topAnchors": [],
    "topReferringDomains": []
  },
  "competitors": [
    { "domain": "string (real competitors only)", "commonKeywords": number, "authorityScore": number, "estimatedTraffic": number, "overlap": number }
  ],
  "paidKeywords": [],
  "siteStructure": {
    "totalPages": ${crawledPages.length || 0},
    "avgPageDepth": number,
    "topSubfolders": [{ "path": "string (from verified pages)", "pages": number, "traffic": number }]
  },
  "opportunities": [
    { "type": "keyword|content|technical|backlink", "title": "string", "description": "string", "impact": "high|medium|low", "effort": "easy|medium|hard" }
  ]
}`;

      const result = await aiChatJSON(systemPrompt, `Analyze the website ${cleanDomain} based on the verified crawl data provided`);
      if (result.usage.model !== "fallback") {
        await storage.logAiUsage({ userId: user.id, feature: "site-research", model: result.usage.model, inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens, costUsd: calculateCostUsd(result.usage.inputTokens, result.usage.outputTokens) });
      }

      const data = result.data;
      const verifiedSet = new Set(crawledPages.map((p: string) => p.toLowerCase()));

      const filterByVerifiedUrl = (items: any[], urlField: string) => {
        if (crawledPages.length === 0) return [];
        return (items || []).filter((item: any) => {
          const url = item[urlField];
          if (!url) return false;
          const path = url.replace(`https://${cleanDomain}`, "").replace(`http://${cleanDomain}`, "");
          return verifiedSet.has(path.toLowerCase()) || verifiedSet.has(path.toLowerCase().replace(/\/$/, ""));
        });
      };

      const filteredOrganicKeywords = filterByVerifiedUrl(data.organicKeywords || [], "url");
      const filteredTopPages = filterByVerifiedUrl(data.topPages || [], "url");
      const filteredPaidKeywords = filterByVerifiedUrl(data.paidKeywords || [], "url");

      const filteredStructure = data.siteStructure || {};
      if (filteredStructure.topSubfolders && crawledPages.length > 0) {
        filteredStructure.topSubfolders = (filteredStructure.topSubfolders || []).filter((sf: any) => {
          const sfPath = sf.path?.toLowerCase();
          return crawledPages.some((p: string) => p.toLowerCase().startsWith(sfPath));
        });
      } else if (crawledPages.length === 0) {
        filteredStructure.topSubfolders = [];
        filteredStructure.totalPages = 0;
      }
      filteredStructure.totalPages = crawledPages.length;

      const sanitizedBacklinks = {
        total: 0,
        dofollow: 0,
        nofollow: 0,
        topAnchors: [],
        topReferringDomains: [],
      };

      const report = await storage.createSiteResearchReport({
        userId: user.id,
        domain: cleanDomain,
        overview: data.overview || {},
        organicKeywords: filteredOrganicKeywords,
        topPages: filteredTopPages,
        backlinks: sanitizedBacklinks,
        competitors: data.competitors || [],
        paidKeywords: filteredPaidKeywords,
        internalLinks: data.internalLinks || null,
        siteStructure: filteredStructure,
        opportunities: data.opportunities || [],
        status: "completed",
      });
      res.status(201).json(report);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/site-research/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const report = await storage.getSiteResearchReport(req.params.id);
      if (!report) return res.status(404).json({ message: "Report not found" });
      if (user.role !== "admin" && report.userId !== user.id) return res.status(403).json({ message: "Access denied" });
      await storage.deleteSiteResearchReport(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // === Project Ownership Transfer ===
  app.post("/api/projects/:id/transfer", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Recipient email is required" });

      const project = await storage.getProject(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (user.role !== "admin" && project.userId !== user.id) return res.status(403).json({ message: "Only the project owner can transfer ownership" });

      const newOwner = await storage.getUserByEmail(email);
      if (!newOwner) return res.status(404).json({ message: "No user found with that email address" });
      if (newOwner.id === user.id) return res.status(400).json({ message: "You already own this project" });

      const updated = await storage.transferProjectOwnership(req.params.id, newOwner.id);
      res.json({ ...updated, newOwnerUsername: newOwner.username });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Serve the tracking snippet
  app.get("/snippet.js", (_req, res) => {
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(getSnippetJs());
  });

  // Knowledge Center - Quiz & Badge API routes
  app.get("/api/quiz/topics", async (_req, res) => {
    try {
      const topics = await storage.getQuizTopics();
      res.json(topics);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quiz/topics/:topicId/questions", async (req, res) => {
    try {
      const questions = await storage.getQuizQuestions(req.params.topicId);
      const sanitized = questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        sortOrder: q.sortOrder,
      }));
      res.json(sanitized);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/quiz/submit", requireAuth, async (req, res) => {
    try {
      const { topicId, answers } = req.body;
      if (!topicId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "topicId and answers array required" });
      }
      const questions = await storage.getQuizQuestions(topicId);
      let correct = 0;
      const results = questions.map((q, i) => {
        const isCorrect = answers[i] === q.correctAnswer;
        if (isCorrect) correct++;
        return {
          questionId: q.id,
          correct: isCorrect,
          correctAnswer: q.correctAnswer,
          userAnswer: answers[i],
          explanation: q.explanation,
        };
      });

      const score = Math.round((correct / questions.length) * 100);
      const userId = (req.user as any).id;

      const attempt = await storage.createQuizAttempt({
        userId,
        topicId,
        score,
        totalQuestions: questions.length,
      });

      const newBadges: any[] = [];
      const allBadges = await storage.getBadges();
      const allAttempts = await storage.getQuizAttempts(userId);

      for (const badge of allBadges) {
        const alreadyHas = await storage.hasUserBadge(userId, badge.id);
        if (alreadyHas) continue;

        let earned = false;

        if (badge.requirementType === "quizzes_completed") {
          earned = allAttempts.length >= badge.requirementValue;
        } else if (badge.requirementType === "quiz_score" && badge.topicId) {
          if (topicId === badge.topicId && score >= badge.requirementValue) {
            earned = true;
          }
        } else if (badge.requirementType === "all_topics_passed") {
          const topics = await storage.getQuizTopics();
          const passedTopics = new Set<string>();
          for (const a of allAttempts) {
            if (a.score >= 60) passedTopics.add(a.topicId);
          }
          earned = passedTopics.size >= topics.length;
        } else if (badge.requirementType === "perfect_scores") {
          const perfectTopics = new Set<string>();
          for (const a of allAttempts) {
            if (a.score === 100) perfectTopics.add(a.topicId);
          }
          earned = perfectTopics.size >= badge.requirementValue;
        }

        if (earned) {
          await storage.awardBadge({ userId, badgeId: badge.id });
          newBadges.push(badge);
        }
      }

      res.json({ attempt, score, correct, total: questions.length, results, newBadges });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/quiz/attempts", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const attempts = await storage.getQuizAttempts(userId);
      res.json(attempts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/badges", async (_req, res) => {
    try {
      const allBadges = await storage.getBadges();
      res.json(allBadges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/badges/mine", requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const myBadges = await storage.getUserBadges(userId);
      res.json(myBadges);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}

function parseReportPrompt(prompt: string): {
  name: string;
  metrics: string[];
  dimensions: string[];
  chartType: string;
  dateRange: string;
  filters: any;
} {
  const p = prompt.toLowerCase();

  // Determine metrics
  const metrics: string[] = [];
  if (p.includes("page view") || p.includes("pageview") || p.includes("views")) metrics.push("pageViews");
  if (p.includes("click")) metrics.push("clicks");
  if (p.includes("visitor") || p.includes("user") || p.includes("unique")) metrics.push("visitors");
  if (p.includes("session")) metrics.push("sessions");
  if (p.includes("bounce")) metrics.push("bounceRate");
  if (p.includes("scroll")) metrics.push("scrolls");
  if (p.includes("form") || p.includes("submission") || p.includes("submit")) metrics.push("formSubmits");
  if (p.includes("rage")) metrics.push("rageClicks");
  if (p.includes("bot")) metrics.push("bots");
  if (p.includes("event") || p.includes("all")) metrics.push("events");
  if (metrics.length === 0) metrics.push("pageViews", "visitors");

  // Determine dimension
  let dimensions = ["date"];
  if (p.includes("by device") || p.includes("per device") || p.includes("device breakdown")) dimensions = ["device"];
  else if (p.includes("by browser") || p.includes("per browser") || p.includes("browser breakdown")) dimensions = ["browser"];
  else if (p.includes("by country") || p.includes("per country") || p.includes("country breakdown") || p.includes("geographic") || p.includes("geo")) dimensions = ["country"];
  else if (p.includes("by city") || p.includes("per city")) dimensions = ["city"];
  else if (p.includes("by page") || p.includes("per page") || p.includes("top page") || p.includes("page breakdown")) dimensions = ["page"];
  else if (p.includes("by referrer") || p.includes("per referrer") || p.includes("referral") || p.includes("source")) dimensions = ["referrer"];
  else if (p.includes("by os") || p.includes("operating system")) dimensions = ["os"];
  else if (p.includes("by event") || p.includes("event type")) dimensions = ["eventType"];
  else if (p.includes("hourly") || p.includes("by hour") || p.includes("per hour")) dimensions = ["hour"];
  else if (p.includes("weekly") || p.includes("by week") || p.includes("per week")) dimensions = ["week"];
  else if (p.includes("monthly") || p.includes("by month") || p.includes("per month")) dimensions = ["month"];

  // Determine chart type
  let chartType = "bar";
  if (p.includes("line chart") || p.includes("line graph") || p.includes("trend")) chartType = "line";
  else if (p.includes("pie") || p.includes("donut") || p.includes("distribution") || p.includes("breakdown") || p.includes("share")) chartType = "pie";
  else if (p.includes("area")) chartType = "area";
  else if (p.includes("table") || p.includes("list") || p.includes("tabular")) chartType = "table";
  else if (dimensions[0] === "date" || dimensions[0] === "hour" || dimensions[0] === "week" || dimensions[0] === "month") chartType = "line";

  // Determine date range
  let dateRange = "last_30_days";
  if (p.includes("today") || p.includes("so far today")) dateRange = "today";
  else if (p.includes("yesterday")) dateRange = "yesterday";
  else if (p.includes("7 day") || p.includes("last week") || p.includes("this week") || p.includes("past week")) dateRange = "last_7_days";
  else if (p.includes("90 day") || p.includes("3 month") || p.includes("quarter")) dateRange = "last_90_days";
  else if (p.includes("this year") || p.includes("year to date") || p.includes("ytd")) dateRange = "this_year";
  else if (p.includes("all time") || p.includes("all data") || p.includes("ever") || p.includes("everything")) dateRange = "all_time";

  // Determine filters
  const filters: any = {};
  if (p.includes("no bot") || p.includes("exclude bot") || p.includes("without bot") || p.includes("human only") || p.includes("real user")) filters.excludeBots = true;
  if (p.includes("no internal") || p.includes("exclude internal") || p.includes("external only") || p.includes("without internal")) filters.excludeInternal = true;
  if (p.includes("mobile only") || p.includes("mobile traffic")) filters.device = "Mobile";
  else if (p.includes("desktop only") || p.includes("desktop traffic")) filters.device = "Desktop";

  // Generate a descriptive name
  const metricLabels: Record<string, string> = {
    pageViews: "Page Views", clicks: "Clicks", visitors: "Visitors", sessions: "Sessions",
    bounceRate: "Bounce Rate", scrolls: "Scrolls", formSubmits: "Form Submissions",
    rageClicks: "Rage Clicks", bots: "Bot Events", events: "Events"
  };
  const dimLabels: Record<string, string> = {
    date: "Daily", hour: "Hourly", week: "Weekly", month: "Monthly",
    page: "by Page", device: "by Device", browser: "by Browser", country: "by Country",
    city: "by City", referrer: "by Referrer", os: "by OS", eventType: "by Event Type"
  };

  const metricNames = metrics.slice(0, 3).map(m => metricLabels[m] || m).join(" & ");
  const dimName = dimLabels[dimensions[0]] || dimensions[0];
  const name = `${metricNames} ${dimName}`;

  return { name, metrics, dimensions, chartType, dateRange, filters: Object.keys(filters).length > 0 ? filters : null };
}

function generateDataInsight(prompt: string, project: any, analytics: any): string {
  const promptLower = prompt.toLowerCase();

  if (promptLower.includes("traffic") || promptLower.includes("trend")) {
    return `Based on the data for ${project.name} (${project.domain}):\n\n` +
      `Total Page Views: ${analytics.totalPageViews}\n` +
      `Total Clicks: ${analytics.totalClicks}\n` +
      `Unique Visitors: ${analytics.uniqueVisitors}\n\n` +
      `The traffic data shows ${analytics.totalPageViews > 100 ? "healthy" : "growing"} traffic patterns. ` +
      `${analytics.topPages.length > 0 ? `Your top page is "${analytics.topPages[0].page}" with ${analytics.topPages[0].views} views.` : "Start collecting data by installing the tracking snippet."}\n\n` +
      `Recommendation: Focus on content that drives organic traffic and ensure your top-performing pages are optimized for conversions.`;
  }

  if (promptLower.includes("bounce") || promptLower.includes("engagement")) {
    return `Engagement Analysis for ${project.name}:\n\n` +
      `Bounce Rate: ~${analytics.bounceRate}%\n` +
      `Average Time on Page: ${analytics.avgTimeOnPage}s\n` +
      `Click-through Events: ${analytics.totalClicks}\n\n` +
      `${analytics.bounceRate > 50 ? "Your bounce rate is above average. Consider improving page load speed, adding more engaging content above the fold, and ensuring clear calls-to-action." : "Your bounce rate is within a healthy range. Continue monitoring and optimizing your content strategy."}\n\n` +
      `Suggestion: Implement exit-intent popups and improve internal linking to reduce bounce rate.`;
  }

  if (promptLower.includes("seo") || promptLower.includes("search")) {
    return `SEO Overview for ${project.name}:\n\n` +
      `Key recommendations:\n` +
      `1. Ensure all pages have unique, descriptive meta titles (50-60 characters)\n` +
      `2. Write compelling meta descriptions (150-160 characters)\n` +
      `3. Use proper heading hierarchy (H1 > H2 > H3)\n` +
      `4. Add alt text to all images\n` +
      `5. Implement structured data markup (Schema.org)\n` +
      `6. Build quality internal links between related content\n` +
      `7. Optimize Core Web Vitals (LCP, FID, CLS)\n\n` +
      `Use the SEO Analysis tool to scan specific pages and get detailed scoring.`;
  }

  if (promptLower.includes("device") || promptLower.includes("browser") || promptLower.includes("mobile")) {
    const devices = analytics.deviceBreakdown;
    const deviceInfo = devices.length > 0
      ? devices.map((d: any) => `${d.device}: ${d.count} events`).join("\n")
      : "No device data collected yet";
    return `Device & Browser Analysis for ${project.name}:\n\n${deviceInfo}\n\n` +
      `Make sure your website is fully responsive and provides an excellent experience across all devices. ` +
      `Test on both mobile and desktop regularly.`;
  }

  return `Analysis for ${project.name} (${project.domain}):\n\n` +
    `Here's a summary of your current analytics:\n` +
    `- ${analytics.totalPageViews} page views recorded\n` +
    `- ${analytics.totalClicks} click interactions\n` +
    `- ${analytics.uniqueVisitors} unique visitor fingerprints\n` +
    `- ${analytics.topPages.length} unique pages tracked\n\n` +
    `To get more specific insights, try asking about:\n` +
    `- Traffic trends and patterns\n` +
    `- Bounce rate and engagement metrics\n` +
    `- SEO recommendations\n` +
    `- Device and browser breakdown\n\n` +
    `For AI-powered deep analysis, configure an LLM provider in Settings.`;
}

function getSnippetJs(): string {
  return `(function() {
  var projectId = '';
  var scripts = document.querySelectorAll('script[data-project-id]');
  if (scripts.length > 0) {
    projectId = scripts[scripts.length - 1].dataset.projectId;
  }
  if (!projectId) return;

  var scriptSrc = '';
  try { scriptSrc = document.currentScript ? document.currentScript.src : ''; } catch(e) {}
  var origin = scriptSrc ? new URL(scriptSrc).origin : '';
  var endpoint = origin + '/api/events';
  var consentEndpoint = origin + '/api/consent';
  var configEndpoint = origin + '/api/consent-config/' + projectId;

  function uid() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function getDevice() {
    var w = window.innerWidth;
    if (w < 768) return 'Mobile';
    if (w < 1024) return 'Tablet';
    return 'Desktop';
  }

  function getBrowser() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) return 'Chrome';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
    if (ua.indexOf('Edg') > -1) return 'Edge';
    return 'Other';
  }

  function getOS() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
    return 'Other';
  }

  var config = null;
  var trackingActive = false;
  var visitorId = null;
  var sessionId = null;

  function initIds(cookieless) {
    if (cookieless) {
      visitorId = null;
      sessionId = null;
      return;
    }
    visitorId = localStorage.getItem('_da_vid');
    if (!visitorId) {
      visitorId = 'v_' + uid();
      localStorage.setItem('_da_vid', visitorId);
    }
    sessionId = sessionStorage.getItem('_da_sid');
    if (!sessionId) {
      sessionId = 's_' + uid();
      sessionStorage.setItem('_da_sid', sessionId);
    }
  }

  var consentState = { given: false, categories: '' };

  function sendEvent(type, extra) {
    if (!trackingActive) return;
    var data = {
      projectId: projectId,
      visitorId: visitorId,
      sessionId: sessionId,
      eventType: type,
      page: window.location.pathname,
      hostname: window.location.hostname,
      referrer: document.referrer || 'Direct',
      userAgent: navigator.userAgent,
      dnt: navigator.doNotTrack || '0',
      consentGiven: consentState.given,
      device: getDevice(),
      browser: getBrowser(),
      os: getOS(),
      metadata: extra || {}
    };
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([JSON.stringify(data)], { type: 'text/plain' }));
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    }
  }

  function getPageType() {
    var p = window.location.pathname.toLowerCase();
    if (p === '/' || p === '/home') return 'homepage';
    if (p.indexOf('/service') > -1 || p.indexOf('/product') > -1) return 'service';
    if (p.indexOf('/blog') > -1 || p.indexOf('/article') > -1 || p.indexOf('/news') > -1) return 'content';
    if (p.indexOf('/contact') > -1 || p.indexOf('/enquir') > -1 || p.indexOf('/get-in-touch') > -1 || p.indexOf('/book') > -1) return 'contact';
    if (p.indexOf('/about') > -1 || p.indexOf('/team') > -1) return 'about';
    if (p.indexOf('/pricing') > -1 || p.indexOf('/plans') > -1 || p.indexOf('/quote') > -1) return 'pricing';
    if (p.indexOf('/checkout') > -1 || p.indexOf('/cart') > -1 || p.indexOf('/basket') > -1) return 'checkout';
    if (p.indexOf('/thank') > -1 || p.indexOf('/success') > -1 || p.indexOf('/confirm') > -1) return 'confirmation';
    if (p.indexOf('/case-stud') > -1 || p.indexOf('/portfolio') > -1 || p.indexOf('/testimonial') > -1) return 'social_proof';
    if (p.indexOf('/faq') > -1 || p.indexOf('/help') > -1) return 'support';
    return 'other';
  }

  function getServiceFromPath() {
    var parts = window.location.pathname.split('/').filter(function(p) { return p; });
    return parts.length > 1 ? parts[parts.length - 1].replace(/-/g, ' ') : '';
  }

  function isCtaElement(el) {
    if (!el) return false;
    var tag = el.tagName;
    if (tag === 'BUTTON') return true;
    if (tag === 'A') {
      var cls = (el.className || '').toLowerCase();
      var text = (el.textContent || '').toLowerCase().trim();
      if (cls.indexOf('btn') > -1 || cls.indexOf('button') > -1 || cls.indexOf('cta') > -1) return true;
      var ctaWords = ['get started','sign up','subscribe','buy','purchase','book','request','enquire','contact','call','free','download','learn more','get quote','start','try','join','register','apply','schedule','demo'];
      for (var i = 0; i < ctaWords.length; i++) {
        if (text.indexOf(ctaWords[i]) > -1) return true;
      }
    }
    return false;
  }

  function getCtaPosition(el) {
    if (!el) return 'unknown';
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight;
    var y = rect.top + window.scrollY;
    var docH = document.body.scrollHeight;
    if (y < vh) return 'above_fold';
    if (y < docH * 0.5) return 'mid_page';
    return 'below_fold';
  }

  function startTracking() {
    if (trackingActive) return;
    trackingActive = true;
    var pt = getPageType();

    var isFirst = !localStorage.getItem('_da_returning');
    if (isFirst) {
      sendEvent('first_visit', { pageType: pt });
      localStorage.setItem('_da_returning', '1');
    }

    var isNewSession = !sessionStorage.getItem('_da_session_started');
    if (isNewSession) {
      sendEvent('session_start', { pageType: pt, landingPage: window.location.pathname, trafficSource: document.referrer || 'direct' });
      sessionStorage.setItem('_da_session_started', '1');
    }

    sendEvent('pageview', { pageType: pt, serviceName: getServiceFromPath() });

    var keyPages = ['pricing','contact','checkout','service','confirmation'];
    if (keyPages.indexOf(pt) > -1) {
      sendEvent('key_page_view', { pageType: pt, serviceName: getServiceFromPath() });
    }

    document.addEventListener('click', function(e) {
      var el = e.target.closest ? e.target.closest('a, button, [role="button"], input[type="submit"]') : e.target;
      if (!el) el = e.target;
      var tag = el.tagName;
      var text = (el.textContent || '').slice(0, 80).trim();
      var href = el.getAttribute ? (el.getAttribute('href') || '') : '';

      sendEvent('click', { target: tag, text: text });

      if (isCtaElement(el)) {
        sendEvent('cta_click', { ctaText: text, ctaPosition: getCtaPosition(el), pageType: pt, serviceName: getServiceFromPath() });
      }

      if (href.indexOf('tel:') === 0) {
        var phoneClickTime = Date.now();
        sendEvent('phone_click', { pageType: pt, serviceName: getServiceFromPath(), trafficSource: document.referrer || 'direct', callDuration: 0 });
        var beforeUnload = function() {
          var duration = Math.round((Date.now() - phoneClickTime) / 1000);
          if (duration > 5) {
            sendEvent('phone_click', { pageType: pt, serviceName: getServiceFromPath(), trafficSource: document.referrer || 'direct', callDuration: duration, isCallEnd: true });
          }
        };
        window.addEventListener('focus', function onFocus() {
          var duration = Math.round((Date.now() - phoneClickTime) / 1000);
          if (duration > 5) {
            sendEvent('phone_click', { pageType: pt, serviceName: getServiceFromPath(), trafficSource: document.referrer || 'direct', callDuration: duration, isCallEnd: true });
          }
          window.removeEventListener('focus', onFocus);
        });
      }

      if (href.indexOf('mailto:') === 0) {
        sendEvent('email_click', { pageType: pt, serviceName: getServiceFromPath() });
      }
    });

    var lastScroll = 0;
    window.addEventListener('scroll', function() {
      var sh = document.body.scrollHeight - window.innerHeight;
      if (sh <= 0) return;
      var pct = Math.round((window.scrollY / sh) * 100);
      if (pct - lastScroll >= 25) {
        lastScroll = pct;
        sendEvent('scroll', { depth: pct, percentageScrolled: pct, pageType: pt });
      }
    });

    document.querySelectorAll('form').forEach(function(form) {
      var formName = form.getAttribute('name') || form.getAttribute('data-form-name') || form.id || 'unknown';
      var formLocation = form.closest('[data-section]') ? form.closest('[data-section]').getAttribute('data-section') : getCtaPosition(form);
      var formTracked = false;

      form.addEventListener('focusin', function() {
        if (!formTracked) {
          formTracked = true;
          sendEvent('form_start', { formName: formName, formLocation: formLocation, pageType: pt, serviceInterest: getServiceFromPath() });
        }
      });

      form.addEventListener('submit', function(ev) {
        sendEvent('form_submit', { formId: form.id || 'unknown', formName: formName, formLocation: formLocation, pageType: pt, serviceName: getServiceFromPath() });

        if (pt === 'contact' || pt === 'pricing' || pt === 'checkout' || formName.toLowerCase().indexOf('contact') > -1 || formName.toLowerCase().indexOf('enquir') > -1 || formName.toLowerCase().indexOf('lead') > -1 || formName.toLowerCase().indexOf('quote') > -1) {
          sendEvent('generate_lead', { leadType: 'form', serviceInterest: getServiceFromPath(), leadSource: document.referrer || 'direct', landingPage: sessionStorage.getItem('_da_landing') || window.location.pathname, formName: formName });
        }
      });

      form.addEventListener('invalid', function(ev) {
        sendEvent('form_error', { formName: formName, formLocation: formLocation, pageType: pt, errorField: ev.target.name || ev.target.id || 'unknown' });
      }, true);
    });

    if (!sessionStorage.getItem('_da_landing')) {
      sessionStorage.setItem('_da_landing', window.location.pathname);
    }

    try {
      var chatStarted = false;
      var chatObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
          m.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
              var el = node;
              var cls = (el.className || '').toString().toLowerCase();
              var id = (el.id || '').toLowerCase();
              var isChatEl = cls.indexOf('chat') > -1 || id.indexOf('chat') > -1 || cls.indexOf('livechat') > -1 || cls.indexOf('tawk') > -1 || cls.indexOf('intercom') > -1 || cls.indexOf('drift') > -1 || cls.indexOf('crisp') > -1 || cls.indexOf('zendesk') > -1 || cls.indexOf('hubspot-messages') > -1;
              if (isChatEl && !chatStarted) {
                chatStarted = true;
                sendEvent('chat_start', { pageType: pt });
              }
              if (isChatEl) {
                var chatText = (el.textContent || '').toLowerCase();
                var leadIndicators = ['thank', 'submitted', 'received', 'booked', 'confirmed', 'success', 'email', 'phone', 'call back', 'appointment'];
                for (var li = 0; li < leadIndicators.length; li++) {
                  if (chatText.indexOf(leadIndicators[li]) > -1 && chatText.length > 10 && chatText.length < 500) {
                    sendEvent('chat_lead', { pageType: pt, chatContent: chatText.slice(0, 100) });
                    break;
                  }
                }
              }
            }
          });
        });
      });
      chatObserver.observe(document.body, { childList: true, subtree: true });
    } catch(ce) {}

    var clickCounts = {};
    document.addEventListener('click', function(e) {
      var key = e.clientX + ',' + e.clientY;
      clickCounts[key] = (clickCounts[key] || 0) + 1;
      if (clickCounts[key] >= 3) {
        sendEvent('rage_click', { x: e.clientX, y: e.clientY });
        clickCounts[key] = 0;
      }
    });

    var observeContent = function() {
      document.querySelectorAll('[data-content-type]').forEach(function(el) {
        var obs = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              sendEvent('content_interaction', {
                contentType: el.getAttribute('data-content-type'),
                contentName: el.getAttribute('data-content-name') || el.textContent.slice(0, 50)
              });
              obs.unobserve(el);
            }
          });
        }, { threshold: 0.5 });
        obs.observe(el);
      });
    };
    if (document.readyState === 'complete') observeContent();
    else window.addEventListener('load', observeContent);
  }

  function recordConsent(given, categories) {
    var data = {
      projectId: projectId,
      visitorId: visitorId || 'anonymous',
      consentGiven: given,
      userAgent: navigator.userAgent,
      consentVersion: config ? (config.consentVersion || 1) : 1,
      categoriesAccepted: categories || null
    };
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(consentEndpoint, new Blob([JSON.stringify(data)], { type: 'text/plain' }));
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', consentEndpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
      }
    } catch(e) {}
  }

  var defaultDescs = {
    necessary: 'Necessary cookies are absolutely essential for the website to function properly. These cookies ensure basic functionalities and security features of the website, anonymously.',
    functional: 'Functional cookies help perform certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.',
    analytics: 'Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.',
    performance: 'Performance cookies are used to understand and analyze the key performance indexes of the website which helps in delivering a better user experience for the visitors.',
    marketing: 'Marketing cookies are used to deliver relevant advertisements and measure campaign effectiveness.',
    advertisement: 'Advertisement cookies are used to provide visitors with customized advertisements based on the pages you visited previously and to analyze the effectiveness of the ad campaigns.',
    personalisation: 'Personalisation cookies allow the site to remember your preferences and customise your experience.'
  };

  function getColors(cfg) {
    var theme = cfg.bannerTheme || 'auto';
    var isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    return {
      bg: cfg.bannerBgColor || (isDark ? '#1a1a2e' : '#ffffff'),
      fg: cfg.bannerTextColor || (isDark ? '#e0e0e0' : '#333333'),
      border: cfg.bannerBorderColor || (isDark ? '#333355' : '#e0e0e0'),
      btnBg: cfg.bannerBtnBgColor || (isDark ? '#374151' : '#f3f4f6'),
      btnFg: cfg.bannerBtnTextColor || (isDark ? '#e0e0e0' : '#1f2937'),
      acceptBg: cfg.bannerAcceptBgColor || '#c1272d',
      acceptFg: cfg.bannerAcceptTextColor || '#ffffff',
      muted: isDark ? '#9ca3af' : '#6b7280',
      switchOn: '#16a34a',
      switchOff: isDark ? '#4b5563' : '#d1d5db',
      fontFamily: cfg.bannerFontFamily || '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif',
      fontSize: cfg.bannerFontSize || '14px',
      isDark: isDark
    };
  }

  function getEnabledCategories(cfg) {
    var cats = [];
    cats.push({ key: 'necessary', label: 'Necessary', desc: cfg.categoryNecessaryDesc || defaultDescs.necessary, alwaysActive: true });
    if (cfg.categoryFunctional === 'true') {
      cats.push({ key: 'functional', label: 'Functional', desc: cfg.categoryFunctionalDesc || defaultDescs.functional, alwaysActive: false });
    }
    if (cfg.categoryAnalytics !== 'false') {
      cats.push({ key: 'analytics', label: 'Analytics', desc: cfg.categoryAnalyticsDesc || defaultDescs.analytics, alwaysActive: false });
    }
    if (cfg.categoryPerformance === 'true') {
      cats.push({ key: 'performance', label: 'Performance', desc: cfg.categoryPerformanceDesc || defaultDescs.performance, alwaysActive: false });
    }
    if (cfg.categoryMarketing === 'true' || cfg.categoryAdvertisement === 'true') {
      cats.push({ key: 'marketing', label: 'Marketing', desc: cfg.categoryMarketingDesc || defaultDescs.marketing, alwaysActive: false });
    }
    if (cfg.categoryAdvertisement === 'true') {
      cats.push({ key: 'advertisement', label: 'Advertisement', desc: cfg.categoryAdvertisementDesc || defaultDescs.advertisement, alwaysActive: false });
    }
    if (cfg.categoryPersonalization === 'true') {
      cats.push({ key: 'personalisation', label: 'Personalisation', desc: cfg.categoryPersonalizationDesc || defaultDescs.personalisation, alwaysActive: false });
    }
    return cats;
  }

  function getAllCategoryKeys(cfg) {
    var keys = ['necessary'];
    var cats = getEnabledCategories(cfg);
    for (var i = 0; i < cats.length; i++) {
      if (keys.indexOf(cats[i].key) === -1) keys.push(cats[i].key);
    }
    return keys;
  }

  function removeOverlay() {
    var o = document.getElementById('_da_overlay');
    if (o) o.remove();
  }

  function removeBanner() {
    var b = document.getElementById('_da_consent_banner');
    if (b) b.remove();
    removeOverlay();
  }

  function removePrefsModal() {
    var m = document.getElementById('_da_prefs_modal');
    if (m) m.remove();
    removeOverlay();
  }

  function handleAcceptAll(cfg) {
    var allCats = {};
    var accepted = [];
    var cats = getEnabledCategories(cfg);
    for (var i = 0; i < cats.length; i++) {
      allCats[cats[i].key] = true;
      accepted.push(cats[i].key);
    }
    localStorage.setItem('_da_consent', 'granted');
    localStorage.setItem('_da_consent_ts', new Date().toISOString());
    localStorage.setItem('_da_consent_cats', JSON.stringify(allCats));
    consentState.given = true;
    consentState.categories = accepted.join(',');
    removeBanner();
    removePrefsModal();
    addSettingsButton(cfg);
    initIds(cfg.cookielessMode === 'true');
    recordConsent(true, accepted.join(','));
    startTracking();
  }

  function handleRejectAll(cfg) {
    var cats = { necessary: true };
    localStorage.setItem('_da_consent', 'denied');
    localStorage.setItem('_da_consent_ts', new Date().toISOString());
    localStorage.setItem('_da_consent_cats', JSON.stringify(cats));
    consentState.given = false;
    consentState.categories = '';
    removeBanner();
    removePrefsModal();
    addSettingsButton(cfg);
    trackingActive = false;
    recordConsent(false, '');
  }

  function showBanner(cfg) {
    removeBanner();
    removePrefsModal();
    var colors = getColors(cfg);
    var layout = cfg.bannerLayout || 'bar';
    var pos = cfg.bannerPosition || 'bottom';

    var overlay = null;
    if (layout === 'popup') {
      overlay = document.createElement('div');
      overlay.id = '_da_overlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999998;';
      document.body.appendChild(overlay);
    }

    var banner = document.createElement('div');
    banner.id = '_da_consent_banner';

    var baseStyle = 'position:fixed;z-index:999999;font-family:' + colors.fontFamily + ';font-size:' + colors.fontSize + ';color:' + colors.fg + ';background:' + colors.bg + ';box-sizing:border-box;';

    if (layout === 'bar') {
      var posStyle = pos === 'top' ? 'top:0;left:0;right:0;border-bottom:1px solid ' + colors.border + ';' : 'bottom:0;left:0;right:0;border-top:1px solid ' + colors.border + ';';
      banner.style.cssText = baseStyle + posStyle + 'padding:16px 24px;box-shadow:0 -2px 10px rgba(0,0,0,0.08);';
      var inner = document.createElement('div');
      inner.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:20px;max-width:1400px;margin:0 auto;flex-wrap:wrap;';

      var textDiv = document.createElement('div');
      textDiv.style.cssText = 'flex:1;min-width:300px;';
      textDiv.innerHTML = '<div style="font-weight:700;font-size:15px;margin-bottom:4px;">' + (cfg.bannerTitle || 'We value your privacy') + '</div><div style="font-size:13px;line-height:1.5;color:' + colors.muted + ';">' + (cfg.bannerMessage || 'We use cookies to enhance your browsing experience, serve personalised ads or content, and analyse our traffic. By clicking \\u201cAccept All\\u201d, you consent to our use of cookies.') + (cfg.privacyPolicyUrl ? ' <a href="' + cfg.privacyPolicyUrl + '" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline;">Privacy Policy</a>' : '') + '</div>';
      inner.appendChild(textDiv);

      var btnWrap = document.createElement('div');
      btnWrap.style.cssText = 'display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;';
      appendBannerButtons(btnWrap, cfg, colors);
      inner.appendChild(btnWrap);
      banner.appendChild(inner);
    } else if (layout === 'popup') {
      banner.style.cssText = baseStyle + 'top:50%;left:50%;transform:translate(-50%,-50%);width:90%;max-width:520px;border-radius:12px;padding:28px;box-shadow:0 8px 32px rgba(0,0,0,0.18);border:1px solid ' + colors.border + ';';
      var textDiv2 = document.createElement('div');
      textDiv2.innerHTML = '<div style="font-weight:700;font-size:18px;margin-bottom:8px;">' + (cfg.bannerTitle || 'We value your privacy') + '</div><div style="font-size:13px;line-height:1.6;color:' + colors.muted + ';">' + (cfg.bannerMessage || 'We use cookies to enhance your browsing experience, serve personalised ads or content, and analyse our traffic. By clicking \\u201cAccept All\\u201d, you consent to our use of cookies.') + (cfg.privacyPolicyUrl ? ' <a href="' + cfg.privacyPolicyUrl + '" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline;">Privacy Policy</a>' : '') + '</div>';
      banner.appendChild(textDiv2);
      var btnWrap2 = document.createElement('div');
      btnWrap2.style.cssText = 'display:flex;gap:8px;margin-top:20px;flex-wrap:wrap;';
      appendBannerButtons(btnWrap2, cfg, colors);
      banner.appendChild(btnWrap2);
    } else {
      var boxPos = (pos === 'bottom-right') ? 'bottom:16px;right:16px;' : 'bottom:16px;left:16px;';
      banner.style.cssText = baseStyle + boxPos + 'width:360px;max-width:calc(100vw - 32px);border-radius:12px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,0.15);border:1px solid ' + colors.border + ';';
      var textDiv3 = document.createElement('div');
      textDiv3.innerHTML = '<div style="font-weight:700;font-size:15px;margin-bottom:6px;">' + (cfg.bannerTitle || 'We value your privacy') + '</div><div style="font-size:12px;line-height:1.5;color:' + colors.muted + ';">' + (cfg.bannerMessage || 'We use cookies to enhance your browsing experience, serve personalised ads or content, and analyse our traffic.') + (cfg.privacyPolicyUrl ? ' <a href="' + cfg.privacyPolicyUrl + '" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline;">Privacy Policy</a>' : '') + '</div>';
      banner.appendChild(textDiv3);
      var btnWrap3 = document.createElement('div');
      btnWrap3.style.cssText = 'display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;';
      appendBannerButtons(btnWrap3, cfg, colors);
      banner.appendChild(btnWrap3);
    }

    document.body.appendChild(banner);
  }

  function appendBannerButtons(wrap, cfg, colors) {
    var btnBase = 'padding:8px 18px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;border:1px solid ' + colors.border + ';font-family:' + colors.fontFamily + ';';

    var customBtn = document.createElement('button');
    customBtn.textContent = cfg.bannerCustomiseText || 'Customise';
    customBtn.style.cssText = btnBase + 'background:' + colors.btnBg + ';color:' + colors.btnFg + ';';
    customBtn.onclick = function() { removeBanner(); showPrefsModal(cfg); };
    wrap.appendChild(customBtn);

    var rejectBtn = document.createElement('button');
    rejectBtn.textContent = cfg.bannerDeclineText || 'Reject All';
    rejectBtn.style.cssText = btnBase + 'background:' + colors.btnBg + ';color:' + colors.btnFg + ';';
    rejectBtn.onclick = function() { handleRejectAll(cfg); };
    wrap.appendChild(rejectBtn);

    var acceptBtn = document.createElement('button');
    acceptBtn.textContent = cfg.bannerAcceptText || 'Accept All';
    acceptBtn.style.cssText = btnBase + 'background:' + colors.acceptBg + ';color:' + colors.acceptFg + ';border-color:' + colors.acceptBg + ';';
    acceptBtn.onclick = function() { handleAcceptAll(cfg); };
    wrap.appendChild(acceptBtn);
  }

  function showPrefsModal(cfg) {
    removePrefsModal();
    var colors = getColors(cfg);
    var cats = getEnabledCategories(cfg);
    var prevCats = {};
    try { prevCats = JSON.parse(localStorage.getItem('_da_consent_cats') || '{}'); } catch(e) {}

    var overlay = document.createElement('div');
    overlay.id = '_da_overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:999998;';
    document.body.appendChild(overlay);

    var modal = document.createElement('div');
    modal.id = '_da_prefs_modal';
    modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:999999;width:92%;max-width:640px;max-height:85vh;background:' + colors.bg + ';color:' + colors.fg + ';border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.2);font-family:' + colors.fontFamily + ';font-size:' + colors.fontSize + ';display:flex;flex-direction:column;border:1px solid ' + colors.border + ';';

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:20px 24px 16px;border-bottom:1px solid ' + colors.border + ';flex-shrink:0;';
    header.innerHTML = '<div style="font-weight:700;font-size:17px;">Customise Consent Preferences</div>';
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&#10005;';
    closeBtn.style.cssText = 'background:none;border:none;font-size:18px;cursor:pointer;color:' + colors.fg + ';padding:4px 8px;line-height:1;';
    closeBtn.onclick = function() { removePrefsModal(); showBanner(cfg); };
    header.appendChild(closeBtn);
    modal.appendChild(header);

    var body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow-y:auto;padding:16px 24px;';

    var introP = document.createElement('p');
    introP.style.cssText = 'font-size:13px;line-height:1.6;color:' + colors.muted + ';margin:0 0 16px 0;';
    introP.textContent = 'We use cookies to help you navigate efficiently and perform certain functions. You will find detailed information about all cookies under each consent category below. You can choose which categories to allow.';
    body.appendChild(introP);

    var toggles = {};

    for (var i = 0; i < cats.length; i++) {
      (function(cat) {
        var section = document.createElement('div');
        section.style.cssText = 'border:1px solid ' + colors.border + ';border-radius:8px;margin-bottom:8px;overflow:hidden;';

        var headerRow = document.createElement('div');
        headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;gap:8px;';

        var leftSide = document.createElement('div');
        leftSide.style.cssText = 'display:flex;align-items:center;gap:8px;flex:1;';

        var arrow = document.createElement('span');
        arrow.textContent = '\\u25B8';
        arrow.style.cssText = 'font-size:12px;transition:transform 0.2s;display:inline-block;color:' + colors.muted + ';';
        leftSide.appendChild(arrow);

        var label = document.createElement('span');
        label.style.cssText = 'font-weight:600;font-size:14px;';
        label.textContent = cat.label;
        leftSide.appendChild(label);

        headerRow.appendChild(leftSide);

        if (cat.alwaysActive) {
          var alwaysLabel = document.createElement('span');
          alwaysLabel.textContent = 'Always Active';
          alwaysLabel.style.cssText = 'font-size:12px;font-weight:600;color:#16a34a;flex-shrink:0;';
          headerRow.appendChild(alwaysLabel);
        } else {
          var sw = document.createElement('div');
          var isChecked = prevCats[cat.key] === true;
          sw.dataset.checked = isChecked ? 'true' : 'false';
          sw.style.cssText = 'width:40px;height:22px;border-radius:11px;cursor:pointer;position:relative;transition:background 0.2s;background:' + (isChecked ? colors.switchOn : colors.switchOff) + ';flex-shrink:0;';
          var knob = document.createElement('div');
          knob.style.cssText = 'width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:2px;transition:left 0.2s;left:' + (isChecked ? '20px' : '2px') + ';box-shadow:0 1px 3px rgba(0,0,0,0.2);';
          sw.appendChild(knob);
          sw.onclick = function(e) {
            e.stopPropagation();
            var on = sw.dataset.checked === 'true';
            sw.dataset.checked = on ? 'false' : 'true';
            sw.style.background = on ? colors.switchOff : colors.switchOn;
            knob.style.left = on ? '2px' : '20px';
          };
          toggles[cat.key] = sw;
          headerRow.appendChild(sw);
        }

        var descDiv = document.createElement('div');
        descDiv.style.cssText = 'padding:0 16px 12px;font-size:12px;line-height:1.5;color:' + colors.muted + ';display:none;border-top:1px solid ' + colors.border + ';padding-top:10px;';
        descDiv.textContent = cat.desc;

        var expanded = false;
        headerRow.onclick = function(e) {
          if (e.target === sw || (sw && sw.contains && sw.contains(e.target))) return;
          expanded = !expanded;
          descDiv.style.display = expanded ? 'block' : 'none';
          arrow.style.transform = expanded ? 'rotate(90deg)' : 'rotate(0deg)';
        };

        section.appendChild(headerRow);
        section.appendChild(descDiv);
        body.appendChild(section);
      })(cats[i]);
    }

    modal.appendChild(body);

    var footer = document.createElement('div');
    footer.style.cssText = 'display:flex;gap:8px;padding:16px 24px;border-top:1px solid ' + colors.border + ';flex-shrink:0;flex-wrap:wrap;justify-content:flex-end;';

    var btnBase = 'padding:8px 18px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;border:1px solid ' + colors.border + ';font-family:' + colors.fontFamily + ';';

    var rejectBtn = document.createElement('button');
    rejectBtn.textContent = 'Reject All';
    rejectBtn.style.cssText = btnBase + 'background:' + colors.btnBg + ';color:' + colors.btnFg + ';';
    rejectBtn.onclick = function() { handleRejectAll(cfg); };
    footer.appendChild(rejectBtn);

    var saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save My Preferences';
    saveBtn.style.cssText = btnBase + 'background:' + colors.btnBg + ';color:' + colors.btnFg + ';';
    saveBtn.onclick = function() {
      var savedCats = { necessary: true };
      var accepted = ['necessary'];
      var keys = Object.keys(toggles);
      for (var j = 0; j < keys.length; j++) {
        var k = keys[j];
        savedCats[k] = toggles[k].dataset.checked === 'true';
        if (savedCats[k]) accepted.push(k);
      }
      var anyAccepted = accepted.length > 1;
      localStorage.setItem('_da_consent', anyAccepted ? 'granted' : 'denied');
      localStorage.setItem('_da_consent_ts', new Date().toISOString());
      localStorage.setItem('_da_consent_cats', JSON.stringify(savedCats));
      consentState.given = anyAccepted;
      consentState.categories = accepted.join(',');
      removePrefsModal();
      addSettingsButton(cfg);
      if (anyAccepted) {
        initIds(cfg.cookielessMode === 'true');
        recordConsent(true, accepted.join(','));
        startTracking();
      } else {
        trackingActive = false;
        recordConsent(false, '');
      }
    };
    footer.appendChild(saveBtn);

    var acceptBtn = document.createElement('button');
    acceptBtn.textContent = 'Accept All';
    acceptBtn.style.cssText = btnBase + 'background:' + colors.acceptBg + ';color:' + colors.acceptFg + ';border-color:' + colors.acceptBg + ';';
    acceptBtn.onclick = function() { handleAcceptAll(cfg); };
    footer.appendChild(acceptBtn);

    modal.appendChild(footer);
    document.body.appendChild(modal);

    overlay.onclick = function() { removePrefsModal(); showBanner(cfg); };
  }

  function addSettingsButton(cfg) {
    if (document.getElementById('_da_cookie_settings')) return;
    var colors = getColors(cfg);
    var btn = document.createElement('button');
    btn.id = '_da_cookie_settings';
    btn.textContent = 'Cookie Settings';
    btn.setAttribute('aria-label', 'Manage cookie preferences');
    btn.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:999998;padding:6px 14px;border:1px solid ' + colors.border + ';border-radius:20px;cursor:pointer;font-size:12px;font-weight:500;background:' + colors.bg + ';color:' + colors.fg + ';font-family:' + colors.fontFamily + ';box-shadow:0 2px 8px rgba(0,0,0,0.12);';
    btn.onclick = function() {
      btn.remove();
      showPrefsModal(cfg);
    };
    document.body.appendChild(btn);
  }

  function getCookieValue(name) {
    var m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? decodeURIComponent(m[2]) : null;
  }

  function mapThirdPartyConsent(raw) {
    var mapped = { necessary: true, functional: false, analytics: false, performance: false, marketing: false, advertisement: false, personalisation: false };
    if (!raw) return mapped;
    if (typeof raw === 'string') raw = raw.toLowerCase();
    if (raw.analytics || raw.analytical) mapped.analytics = true;
    if (raw.functional || raw.preferences) mapped.functional = true;
    if (raw.performance || raw.statistics) { mapped.performance = true; mapped.analytics = true; }
    if (raw.marketing || raw.advertising || raw.advertisement || raw.targeting) { mapped.marketing = true; mapped.advertisement = true; }
    if (raw.personalisation || raw.personalization) mapped.personalisation = true;
    return mapped;
  }

  function applyThirdPartyConsent(mapped, cfg) {
    var accepted = [];
    var keys = Object.keys(mapped);
    for (var i = 0; i < keys.length; i++) {
      if (mapped[keys[i]]) accepted.push(keys[i]);
    }
    localStorage.setItem('_da_consent', accepted.length > 1 ? 'granted' : 'denied');
    localStorage.setItem('_da_consent_ts', new Date().toISOString());
    localStorage.setItem('_da_consent_cats', JSON.stringify(mapped));
    consentState.given = accepted.length > 1;
    consentState.categories = accepted.join(',');
    if (accepted.length > 1) {
      initIds(cfg.cookielessMode === 'true');
      recordConsent(true, accepted.join(','));
      startTracking();
    }
  }

  function listenThirdPartyBanners(cfg) {
    var handled = false;
    function onConsent(mapped) {
      if (handled) return;
      handled = true;
      applyThirdPartyConsent(mapped, cfg);
      addSettingsButton(cfg);
    }

    document.addEventListener('cookieyes_consent_update', function() {
      try {
        var raw = {};
        if (window.getCookieYesConsent) {
          raw = window.getCookieYesConsent();
        } else {
          var cv = getCookieValue('cookieyes-consent');
          if (cv) {
            var parts = cv.split(',');
            for (var i = 0; i < parts.length; i++) {
              var kv = parts[i].split(':');
              if (kv.length === 2) raw[kv[0].trim()] = kv[1].trim() === 'yes';
            }
          }
        }
        onConsent(mapThirdPartyConsent(raw));
      } catch(e) {}
    });

    window.addEventListener('OneTrustGroupsUpdated', function() {
      try {
        var groups = window.OnetrustActiveGroups || '';
        var raw = {};
        if (groups.indexOf('C0002') > -1) raw.performance = true;
        if (groups.indexOf('C0003') > -1) raw.functional = true;
        if (groups.indexOf('C0004') > -1) { raw.marketing = true; raw.advertising = true; }
        if (groups.indexOf('C0005') > -1) raw.analytics = true;
        onConsent(mapThirdPartyConsent(raw));
      } catch(e) {}
    });

    window.addEventListener('CookiebotOnAccept', function() {
      try {
        var c = window.Cookiebot ? window.Cookiebot.consent : {};
        var raw = {};
        if (c.preferences) raw.functional = true;
        if (c.statistics) { raw.analytics = true; raw.performance = true; }
        if (c.marketing) { raw.marketing = true; raw.advertising = true; }
        onConsent(mapThirdPartyConsent(raw));
      } catch(e) {}
    });
    window.addEventListener('CookiebotOnDecline', function() {
      onConsent({ necessary: true });
    });

    var pollCount = 0;
    var pollInterval = setInterval(function() {
      pollCount++;
      if (pollCount > 30 || handled) { clearInterval(pollInterval); return; }
      try {
        if (window.Termly && window.Termly.getConsentState) {
          var ts = window.Termly.getConsentState();
          if (ts) { onConsent(mapThirdPartyConsent(ts)); clearInterval(pollInterval); return; }
        }
        if (window.__tcfapi) {
          window.__tcfapi('getTCData', 2, function(data, success) {
            if (success && data && data.purpose && data.purpose.consents) {
              var raw = {};
              if (data.purpose.consents[1]) raw.functional = true;
              if (data.purpose.consents[3] || data.purpose.consents[5] || data.purpose.consents[6]) raw.analytics = true;
              if (data.purpose.consents[7]) raw.performance = true;
              if (data.purpose.consents[4] || data.purpose.consents[2]) { raw.marketing = true; raw.advertising = true; }
              onConsent(mapThirdPartyConsent(raw));
            }
          });
          clearInterval(pollInterval);
          return;
        }
        var consentCookie = getCookieValue('cookie_consent') || getCookieValue('gdpr_consent') || getCookieValue('CookieConsent');
        if (consentCookie) {
          var raw = {};
          try { raw = JSON.parse(consentCookie); } catch(e2) { raw = { analytics: true }; }
          onConsent(mapThirdPartyConsent(raw));
          clearInterval(pollInterval);
          return;
        }
      } catch(e) {}
    }, 1000);
  }

  function init() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', configEndpoint, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        try { config = JSON.parse(xhr.responseText); } catch(e) { config = {}; }
      } else {
        config = {};
      }

      var cookieless = config.cookielessMode === 'true';
      var respectDnt = config.respectDnt !== 'false';
      var consentMode = config.consentMode || 'opt-in';
      var bannerEnabled = config.bannerEnabled !== 'false';

      if (respectDnt && (navigator.doNotTrack === '1' || window.doNotTrack === '1')) {
        return;
      }

      initIds(cookieless);

      if (config.useThirdPartyBanner === 'true') {
        listenThirdPartyBanners(config);
        return;
      }

      var existingConsent = localStorage.getItem('_da_consent');

      if (consentMode === 'opt-out' || !bannerEnabled) {
        consentState.given = true;
        startTracking();
        addSettingsButton(config);
        return;
      }

      if (existingConsent === 'granted') {
        consentState.given = true;
        try { var storedCats = JSON.parse(localStorage.getItem('_da_consent_cats') || '{}'); var ks = Object.keys(storedCats); var active = []; for (var i = 0; i < ks.length; i++) { if (storedCats[ks[i]]) active.push(ks[i]); } consentState.categories = active.join(','); } catch(e) {}
        startTracking();
        addSettingsButton(config);
        return;
      }

      if (existingConsent === 'denied') {
        addSettingsButton(config);
        return;
      }

      showBanner(config);
    };
    xhr.onerror = function() {
      initIds(false);
      consentState.given = true;
      startTracking();
    };
    xhr.send();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();`;
}
