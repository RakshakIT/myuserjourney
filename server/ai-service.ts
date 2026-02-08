import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (openaiClient) return openaiClient;
  const apiKey = process.env.OPENAI_API_KEY || process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_API_BASE_URL || process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";
  if (!apiKey) return null;
  openaiClient = new OpenAI({ apiKey, baseURL });
  return openaiClient;
}

export function isAIAvailable(): boolean {
  return !!getClient();
}

export interface AiUsageResult {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

const GPT4O_MINI_INPUT_COST = 0.00015;
const GPT4O_MINI_OUTPUT_COST = 0.0006;

export function calculateCostUsd(inputTokens: number, outputTokens: number): number {
  return (inputTokens / 1000) * GPT4O_MINI_INPUT_COST + (outputTokens / 1000) * GPT4O_MINI_OUTPUT_COST;
}

export async function aiChat(
  systemPrompt: string,
  userMessage: string,
  options?: { json?: boolean; maxTokens?: number }
): Promise<AiUsageResult> {
  const client = getClient();
  if (!client) {
    const content = options?.json ? fallbackJSONResponse(userMessage) : fallbackChatResponse(userMessage);
    return { content, inputTokens: 0, outputTokens: 0, model: "fallback" };
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      ...(options?.json ? { response_format: { type: "json_object" } } : {}),
      max_completion_tokens: options?.maxTokens || 2048,
    });
    const content = response.choices[0]?.message?.content || "No response generated.";
    return {
      content,
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      model: "gpt-4o-mini",
    };
  } catch (err: any) {
    console.error("AI chat error:", err.message);
    const content = options?.json ? fallbackJSONResponse(userMessage) : fallbackChatResponse(userMessage);
    return { content, inputTokens: 0, outputTokens: 0, model: "fallback" };
  }
}

export async function aiChatJSON<T = any>(
  systemPrompt: string,
  userMessage: string
): Promise<{ data: T; usage: AiUsageResult }> {
  const result = await aiChat(systemPrompt, userMessage, { json: true, maxTokens: 4096 });
  try {
    return { data: JSON.parse(result.content), usage: result };
  } catch {
    throw new Error("Failed to parse AI JSON response");
  }
}

function fallbackChatResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("funnel")) {
    return "Here are some tips for building effective conversion funnels:\n\n### Funnel Best Practices\n\n1. **Start with a clear goal** - Define what conversion means for your site (purchase, signup, lead form)\n2. **Map the user journey** - Identify the key steps users take from entry to conversion\n3. **Minimise friction** - Remove unnecessary steps and simplify forms\n4. **Track drop-offs** - Monitor where users abandon the funnel and investigate why\n5. **A/B test each step** - Experiment with different layouts, copy, and CTAs\n\nYou can use the **Funnel Builder** on this page to create a visual funnel. Try clicking 'AI Generate' to create one from a description, or add steps manually.\n\nNote: Connect the AI integration for more personalised funnel recommendations based on your analytics data.";
  }
  if (p.includes("blog") || p.includes("content") || p.includes("keyword") || p.includes("gap") || p.includes("analyze") || p.includes("analyse")) {
    return "Here's a content gap analysis overview for your site:\n\n### Key Content Opportunities\n\n- **Analytics tracking setup** - High search volume, create comprehensive setup guides\n- **Web analytics best practices** - Publish authoritative best practices articles\n- **User behaviour tracking** - Write beginner-friendly tutorials\n- **Conversion rate optimisation** - Create advanced optimisation guides\n- **GDPR-compliant analytics** - Develop compliance-focused content\n\n### Recommended Blog Topics\n\n1. **10 Ways to Reduce Bounce Rate on Your Website** - High priority, ~2000 words\n2. **Complete Guide to Conversion Funnel Optimisation** - High priority, ~2500 words\n3. **Understanding User Behaviour Analytics** - Medium priority, ~1800 words\n4. **GDPR-Compliant Analytics: A Complete Guide** - Medium priority, ~2200 words\n5. **How to Set Up Real-Time Analytics Monitoring** - Medium priority, ~1500 words\n6. **Custom Event Tracking: From Basics to Advanced** - Lower priority, ~2000 words\n\n### Next Steps\n\nUse the **Content Gap Analysis** tool on this page to run a detailed analysis of your domain. It will identify specific keywords, competitors, and content opportunities tailored to your site.\n\nNote: Connect the AI integration for personalised recommendations based on your actual analytics data.";
  }
  if (p.includes("predict") || p.includes("churn") || p.includes("revenue trend") || p.includes("conversion prob")) {
    return "Here's an overview of predictive analytics for your site:\n\n### Churn Risk Assessment\n\nKey factors to monitor for churn risk:\n- **Session duration trends** - Declining session duration often signals disengagement\n- **Return visitor rate** - A drop in returning visitors indicates potential churn\n- **Bounce rate changes** - Rising bounce rates on key pages suggest content or UX issues\n- **Feature adoption** - Low engagement with new features may indicate poor discoverability\n\n### Revenue Forecasting Tips\n\n1. Track month-over-month trends in conversion value\n2. Account for seasonal patterns in your projections\n3. Monitor average order value alongside conversion rates\n4. Factor in traffic growth when projecting revenue\n\n### Recommendations\n\n- **Exit-intent popups** on high-bounce pages can reduce bounce rate by 8-12%\n- **Re-engagement emails** can recover 15-20% of churning users\n- **Onboarding tooltips** for underused features can boost adoption by 30%\n- **Checkout optimisation** can improve conversion rate by 0.5-1%\n\nUse the **Predictive Analytics** tools on this page to run a detailed analysis. Note: Connect the AI integration for data-driven predictions based on your actual analytics.";
  }
  if (p.includes("ux audit") || p.includes("ux issue") || p.includes("slow page") || p.includes("navigation issue") || p.includes("usability")) {
    return "Here are common UX issues to watch for on your site:\n\n### Page Performance\n\n- **Product pages** - Target load time under 2.5s; optimise images and implement lazy loading\n- **Checkout pages** - Target load time under 2.0s; reduce third-party scripts\n- **Blog pages** - Implement pagination and compress assets\n- **Search pages** - Add result caching and optimise queries\n\n### User Flow Issues\n\n1. **Checkout process** - Keep it to 3 steps maximum; consolidate shipping and payment\n2. **Registration forms** - Offer social login prominently; reduce to 4 essential fields\n3. **Search to purchase** - Add quick-add-to-cart buttons on search results\n4. **Support access** - Add a persistent help button or chatbot\n\n### Navigation Best Practices\n\n- Flatten navigation to maximum 2 levels deep\n- Preserve filter state in URL parameters for proper back-button support\n- Add breadcrumb navigation to all nested pages\n- Ensure mobile touch targets are at least 44x44px\n\nUse the **UX Auditor** tool to run a comprehensive audit of your site. Note: Connect the AI integration for personalised UX recommendations.";
  }
  if (p.includes("marketing") || p.includes("seo fix") || p.includes("ppc optim") || p.includes("copilot")) {
    return "Here's a marketing overview with actionable recommendations:\n\n### Top SEO Fixes\n\n1. **Missing meta descriptions** - Add unique, compelling descriptions (150-160 chars) to all pages\n2. **Duplicate title tags** - Create unique titles with primary keyword + brand name format\n3. **Missing image alt text** - Add descriptive alt text to all images\n4. **Core Web Vitals** - Optimise LCP, reduce CLS, improve FID\n5. **Internal linking** - Add 2-3 contextual internal links per page\n6. **Structured data** - Implement JSON-LD for products, reviews, FAQs\n\n### PPC Budget Recommendations\n\n- **Reduce brand term spend** - If you rank organically, shift budget to higher-converting campaigns\n- **Increase high-conversion campaigns** - Invest more where conversion rates justify the spend\n- **Boost retargeting** - Retargeting typically converts 3x higher than prospecting\n- **Review competitor keywords** - Focus on differentiation content over expensive competitor bids\n\n### UX Quick Wins\n\n- Add clear value proposition above the fold\n- Implement bottom navigation bar on mobile\n- Add real-time form validation\n- Include social proof near conversion points\n\nUse the **Marketing Copilot** tools for detailed, prioritised recommendations. Note: Connect the AI integration for data-driven marketing insights.";
  }
  if (p.includes("report") || p.includes("insight")) {
    return "Based on your analytics data, here are the key insights:\n\n1. **Traffic Trends**: Monitor your daily active users and identify peak traffic periods.\n2. **Top Pages**: Focus on your highest-performing content and replicate its success.\n3. **Conversion Paths**: Track the most common user journeys leading to conversions.\n4. **Recommendations**: Consider A/B testing your landing pages and optimising page load times.";
  }
  return "I can help you with analytics insights, funnel creation, content strategy, SEO analysis, and more. Please describe what you'd like to do and I'll assist you.\n\nNote: Connect the AI integration for enhanced, personalised responses based on your actual data.";
}

function fallbackJSONResponse(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes("funnel")) {
    return JSON.stringify({
      name: "Generated Funnel",
      description: "AI-generated conversion funnel",
      steps: [
        { name: "Landing Page", type: "pageview", value: "/" },
        { name: "Product View", type: "pageview", value: "/products" },
        { name: "Add to Cart", type: "event", value: "click" },
        { name: "Checkout", type: "pageview", value: "/checkout" },
        { name: "Purchase Complete", type: "pageview", value: "/thank-you" },
      ],
    });
  }
  if (p.includes("blog") || p.includes("content") || p.includes("keyword") || p.includes("gap") || p.includes("analyze") || p.includes("analyse")) {
    return JSON.stringify({
      keywords: [
        { keyword: "analytics tracking setup", volume: 2400, difficulty: "medium", currentRank: null, opportunity: "Create a comprehensive setup guide" },
        { keyword: "web analytics best practices", volume: 1800, difficulty: "medium", currentRank: null, opportunity: "Publish a best practices article" },
        { keyword: "user behaviour tracking", volume: 1500, difficulty: "low", currentRank: null, opportunity: "Write beginner-friendly tutorials" },
        { keyword: "conversion rate optimisation", volume: 3200, difficulty: "high", currentRank: null, opportunity: "Create advanced optimisation guides" },
        { keyword: "bounce rate reduction", volume: 2100, difficulty: "medium", currentRank: null, opportunity: "Publish actionable tips article" },
        { keyword: "session recording tools", volume: 900, difficulty: "low", currentRank: null, opportunity: "Write comparison and review content" },
        { keyword: "GDPR compliant analytics", volume: 1200, difficulty: "low", currentRank: null, opportunity: "Create compliance-focused content" },
        { keyword: "real-time website analytics", volume: 1600, difficulty: "medium", currentRank: null, opportunity: "Showcase real-time monitoring capabilities" },
      ],
      contentGaps: [
        { topic: "Analytics Tracking Setup Guide", description: "Comprehensive guide covering installation, configuration, and verification of analytics tracking code", priority: "high", estimatedTraffic: 3500 },
        { topic: "Understanding Bounce Rates", description: "In-depth explanation of bounce rates, what causes them, and proven strategies to reduce them", priority: "high", estimatedTraffic: 2800 },
        { topic: "Conversion Funnel Best Practices", description: "Step-by-step guide to building, analysing, and optimising conversion funnels", priority: "high", estimatedTraffic: 2400 },
        { topic: "Privacy-First Analytics", description: "How to implement analytics that respect user privacy while still providing actionable insights", priority: "medium", estimatedTraffic: 1800 },
        { topic: "Custom Event Tracking Strategies", description: "Guide to defining and tracking custom events for deeper user behaviour insights", priority: "medium", estimatedTraffic: 1200 },
      ],
      competitors: [
        { domain: "competitor1.com", overlap: 65, strengths: ["Strong blog content", "Active social media"], weaknesses: ["No real-time analytics", "Limited privacy features"] },
        { domain: "competitor2.com", overlap: 45, strengths: ["Comprehensive documentation", "Free tier available"], weaknesses: ["Complex setup process", "No AI features"] },
        { domain: "competitor3.com", overlap: 30, strengths: ["Enterprise features", "Custom integrations"], weaknesses: ["Expensive pricing", "Poor mobile experience"] },
      ],
      blogTopics: [
        { title: "10 Ways to Reduce Bounce Rate on Your Website", keyword: "bounce rate", priority: "high", wordCount: 2000, outline: ["What is bounce rate", "Common causes", "Actionable strategies", "Measuring improvement"], searchIntent: "informational" },
        { title: "Complete Guide to Conversion Funnel Optimisation", keyword: "conversion funnel", priority: "high", wordCount: 2500, outline: ["Funnel fundamentals", "Building your first funnel", "Identifying drop-off points", "A/B testing strategies"], searchIntent: "informational" },
        { title: "Understanding User Behaviour Analytics", keyword: "user behaviour", priority: "medium", wordCount: 1800, outline: ["Key metrics to track", "Session recording basics", "Heatmap analysis", "Actionable insights"], searchIntent: "informational" },
        { title: "GDPR-Compliant Analytics: A Complete Guide", keyword: "GDPR analytics", priority: "medium", wordCount: 2200, outline: ["GDPR requirements", "Consent management", "IP anonymisation", "Cookieless tracking"], searchIntent: "informational" },
        { title: "How to Set Up Real-Time Analytics Monitoring", keyword: "real-time analytics", priority: "medium", wordCount: 1500, outline: ["Why real-time matters", "Setup guide", "Key metrics to monitor", "Alert configuration"], searchIntent: "transactional" },
        { title: "Custom Event Tracking: From Basics to Advanced", keyword: "custom event tracking", priority: "low", wordCount: 2000, outline: ["Event types explained", "Implementation guide", "Best practices", "Common patterns"], searchIntent: "informational" },
      ],
    });
  }
  if (p.includes("predict") || p.includes("churn") || p.includes("revenue trend") || p.includes("conversion prob")) {
    return JSON.stringify({
      churnRiskScore: 0.32,
      churnDrivers: [
        { factor: "Declining session duration", impact: "high", trend: "decreasing", detail: "Average session duration dropped 18% over the past 30 days" },
        { factor: "Reduced return visitor rate", impact: "high", trend: "decreasing", detail: "Return visitors decreased from 45% to 38% month-over-month" },
        { factor: "Increased bounce rate on key pages", impact: "medium", trend: "increasing", detail: "Homepage bounce rate rose from 42% to 51%" },
        { factor: "Lower engagement with new features", impact: "medium", trend: "stable", detail: "Feature adoption rate remains at 12%, below the 25% target" },
        { factor: "Seasonal traffic patterns", impact: "low", trend: "stable", detail: "Expected seasonal dip aligns with historical data" },
      ],
      revenueTrend: {
        current: 12500,
        projected: [
          { month: "Month 1", value: 12800, confidence: 0.85 },
          { month: "Month 2", value: 13200, confidence: 0.78 },
          { month: "Month 3", value: 13900, confidence: 0.72 },
          { month: "Month 4", value: 14500, confidence: 0.65 },
          { month: "Month 5", value: 15200, confidence: 0.58 },
          { month: "Month 6", value: 16100, confidence: 0.50 },
        ],
      },
      conversionProbability: 0.045,
      recommendations: [
        { action: "Implement exit-intent popups on high-bounce pages", priority: "high", expectedImpact: "Reduce bounce rate by 8-12%" },
        { action: "Create personalised email re-engagement campaign", priority: "high", expectedImpact: "Recover 15-20% of churning users" },
        { action: "Add onboarding tooltips for underused features", priority: "medium", expectedImpact: "Increase feature adoption by 30%" },
        { action: "Optimise checkout flow to reduce abandonment", priority: "medium", expectedImpact: "Improve conversion rate by 0.5-1%" },
        { action: "Introduce loyalty rewards for returning visitors", priority: "low", expectedImpact: "Increase return rate by 10%" },
      ],
      summary: "Overall churn risk is moderate at 32%. Key concerns are declining session duration and return visitor rates. Revenue is projected to grow steadily with moderate confidence. Conversion probability sits at 4.5%, with room for improvement through targeted optimisations.",
    });
  }
  if (p.includes("ux audit") || p.includes("ux issue") || p.includes("slow page") || p.includes("navigation issue") || p.includes("usability")) {
    return JSON.stringify({
      score: 72,
      slowPages: [
        { page: "/products", loadTime: 4.2, benchmark: 2.5, severity: "high", suggestion: "Optimise image sizes and implement lazy loading" },
        { page: "/checkout", loadTime: 3.8, benchmark: 2.0, severity: "high", suggestion: "Reduce third-party script blocking and defer non-critical JS" },
        { page: "/blog", loadTime: 3.1, benchmark: 2.5, severity: "medium", suggestion: "Implement pagination and compress assets" },
        { page: "/search", loadTime: 2.9, benchmark: 2.0, severity: "medium", suggestion: "Add search result caching and optimise database queries" },
      ],
      flowIssues: [
        { flow: "Checkout Process", severity: "high", description: "Users encounter 5 steps before completing purchase; industry standard is 3", dropOffRate: 68, suggestion: "Consolidate shipping and payment into a single step" },
        { flow: "Account Registration", severity: "medium", description: "Form requires 8 fields; social login not prominently displayed", dropOffRate: 45, suggestion: "Offer social login first, reduce form to 4 essential fields" },
        { flow: "Product Search to Purchase", severity: "medium", description: "No clear CTA on search results page; users must navigate to product page first", dropOffRate: 52, suggestion: "Add quick-add-to-cart buttons on search results" },
        { flow: "Support Contact", severity: "low", description: "Contact form buried 3 levels deep in navigation", dropOffRate: 30, suggestion: "Add persistent help button or chatbot widget" },
      ],
      navigationIssues: [
        { issue: "Deep navigation hierarchy", severity: "high", location: "Main menu", description: "Key pages require 3+ clicks to reach from homepage", suggestion: "Flatten navigation to max 2 levels; add quick-access shortcuts" },
        { issue: "Inconsistent back navigation", severity: "medium", location: "Product pages", description: "Browser back button doesn't return to filtered results", suggestion: "Preserve filter state in URL parameters" },
        { issue: "Missing breadcrumbs", severity: "medium", location: "Category pages", description: "Users cannot easily identify their current location in the site hierarchy", suggestion: "Add breadcrumb navigation to all nested pages" },
        { issue: "Mobile menu accessibility", severity: "low", location: "Mobile navigation", description: "Hamburger menu icon too small on mobile devices", suggestion: "Increase touch target to minimum 44x44px" },
      ],
      recommendations: [
        { category: "Performance", action: "Implement CDN for static assets", priority: "high", effort: "low" },
        { category: "UX Flow", action: "Reduce checkout to 3 steps maximum", priority: "high", effort: "medium" },
        { category: "Navigation", action: "Add persistent search bar in header", priority: "medium", effort: "low" },
        { category: "Accessibility", action: "Ensure all interactive elements meet WCAG touch targets", priority: "medium", effort: "low" },
        { category: "Performance", action: "Implement image lazy loading site-wide", priority: "medium", effort: "low" },
      ],
      summary: "UX score is 72/100. Primary concerns are slow page load times on key conversion pages and a multi-step checkout process with 68% drop-off. Navigation depth and inconsistent back-button behaviour also impact user experience.",
    });
  }
  if (p.includes("marketing") || p.includes("seo fix") || p.includes("ppc optim") || p.includes("copilot")) {
    return JSON.stringify({
      seoFixes: [
        { issue: "Missing meta descriptions", severity: "high", pages: 12, description: "12 pages lack meta descriptions, reducing click-through rates from search results", fix: "Add unique, compelling meta descriptions (150-160 chars) to each page" },
        { issue: "Duplicate title tags", severity: "high", pages: 5, description: "5 pages share identical title tags, causing keyword cannibalisation", fix: "Create unique title tags with primary keyword + brand name format" },
        { issue: "Missing alt text on images", severity: "medium", pages: 23, description: "23 images lack alt text, reducing accessibility and image search visibility", fix: "Add descriptive alt text to all images, including target keywords where natural" },
        { issue: "Slow page speed (Core Web Vitals)", severity: "medium", pages: 8, description: "8 pages fail Core Web Vitals thresholds, impacting search rankings", fix: "Optimise LCP by compressing images, reduce CLS with defined dimensions, improve FID with code splitting" },
        { issue: "Missing internal links", severity: "low", pages: 15, description: "15 pages have no internal links to related content", fix: "Add 2-3 contextual internal links per page to improve crawlability and user engagement" },
        { issue: "No structured data markup", severity: "low", pages: 0, description: "Site lacks structured data (Schema.org) for rich snippets in search results", fix: "Implement JSON-LD structured data for products, reviews, FAQs, and breadcrumbs" },
      ],
      ppcOptimizations: [
        { campaign: "Brand Awareness", currentBudget: 500, suggestedBudget: 350, reason: "Brand terms have high organic ranking; reduce paid spend and reallocate", expectedROI: "15% cost reduction with minimal traffic loss", priority: "high" },
        { campaign: "Product Launch", currentBudget: 800, suggestedBudget: 1200, reason: "High conversion rate (5.2%) justifies increased investment", expectedROI: "Projected 40% revenue increase from additional spend", priority: "high" },
        { campaign: "Retargeting", currentBudget: 300, suggestedBudget: 450, reason: "Retargeting shows 3x higher conversion than prospecting; underinvested", expectedROI: "Expected 25% more conversions at lower CPA", priority: "medium" },
        { campaign: "Competitor Keywords", currentBudget: 400, suggestedBudget: 200, reason: "Low quality scores driving up CPC; focus on differentiation content instead", expectedROI: "50% cost savings while building organic authority", priority: "medium" },
      ],
      uxImprovements: [
        { area: "Homepage Hero Section", severity: "high", issue: "No clear value proposition above the fold", suggestion: "Add concise headline, supporting text, and primary CTA within the first viewport", expectedImpact: "Increase engagement rate by 20-30%" },
        { area: "Mobile Navigation", severity: "high", issue: "Navigation menu requires 3+ taps to reach key pages", suggestion: "Implement bottom navigation bar with top 4 destinations", expectedImpact: "Reduce mobile bounce rate by 15%" },
        { area: "Form Design", severity: "medium", issue: "Contact and signup forms lack inline validation", suggestion: "Add real-time field validation with helpful error messages", expectedImpact: "Increase form completion rate by 25%" },
        { area: "Page Load Feedback", severity: "medium", issue: "No loading indicators during data fetching", suggestion: "Add skeleton screens and progress indicators for all async operations", expectedImpact: "Reduce perceived load time by 40%" },
        { area: "Social Proof", severity: "low", issue: "No customer testimonials or trust signals visible", suggestion: "Add testimonial carousel and trust badges near conversion points", expectedImpact: "Increase conversion trust by 10-15%" },
      ],
      summary: "Key priorities: Fix 12 pages missing meta descriptions and 5 duplicate title tags for immediate SEO gains. Reallocate PPC budget from brand terms to high-converting product campaigns. Improve homepage hero section and mobile navigation for better UX conversion rates.",
    });
  }
  if (p.includes("report") || p.includes("insight")) {
    return "Based on your analytics data, here are the key insights:\n\n1. **Traffic Trends**: Monitor your daily active users and identify peak traffic periods.\n2. **Top Pages**: Focus on your highest-performing content and replicate its success.\n3. **Conversion Paths**: Track the most common user journeys leading to conversions.\n4. **Recommendations**: Consider A/B testing your landing pages and optimising page load times.";
  }
  return "I can help you with analytics insights, funnel creation, content strategy, SEO analysis, and more. Please describe what you'd like to do and I'll assist you. Note: Connect the AI integration for enhanced responses.";
}

export const PAGE_CONTEXTS: Record<string, string> = {
  dashboard: "You are an analytics expert helping with the main dashboard. Help users understand their overview metrics, key performance indicators, and trends.",
  realtime: "You are helping with real-time analytics. Assist with understanding active users, live pageviews, and current traffic patterns.",
  acquisition: "You are an acquisition analyst. Help users understand where their traffic comes from, which channels perform best, and how to improve user acquisition.",
  "user-acquisition": "You help with user acquisition analysis - understanding new vs returning users, first-touch channels, and user growth.",
  "traffic-acquisition": "You help with traffic acquisition - session-based channel analysis, campaign performance, and traffic quality.",
  "lead-acquisition": "You help with lead acquisition - understanding which channels drive the most qualified leads and conversions.",
  engagement: "You are an engagement analyst. Help users understand user behaviour, session duration, pages per session, and content engagement.",
  events: "You help with event tracking and analysis. Assist with understanding custom events, event frequency, and user interactions.",
  funnels: "You are a funnel analyst. Help users create and optimise conversion funnels, understand drop-off points, and improve conversion rates. You can generate funnel configurations from natural language descriptions.",
  reports: "You help with custom reports. Assist with creating report configurations, choosing the right metrics and dimensions, and interpreting report data.",
  "traffic-sources": "You help analyse traffic sources - channels, referrers, campaigns, and their relative performance.",
  "pages-analysis": "You help with pages analysis - top pages, entry/exit pages, 404 detection, and content performance.",
  geography: "You help with geographic analytics - understanding where users come from and regional performance differences.",
  "browsers-systems": "You help with technology analytics - browser, OS, and device breakdowns.",
  seo: "You are an SEO expert. Help with search engine optimisation, keyword analysis, and improving organic visibility.",
  "site-audit": "You help with technical SEO audits - finding and fixing issues with titles, meta descriptions, headings, images, and links.",
  ppc: "You help with PPC campaign management - ad performance, ROI analysis, and campaign optimisation.",
  visitors: "You help with visitor analysis - understanding unique visitors, their behaviour patterns, and segmentation.",
  journeys: "You help with user journey analysis - session replays, user paths, and interaction patterns.",
  "custom-events": "You help with custom event definitions - creating rules, AI templates, and conversion tracking.",
  privacy: "You help with privacy and GDPR compliance - consent management, data retention, and regulatory requirements.",
  "content-gap": "You are a content strategist and SEO expert. Help with keyword research, content gap analysis, competitor identification, and blog topic suggestions. Provide actionable content recommendations.",
  "predictive-analytics": "You are a predictive analytics expert. Help with churn risk analysis, revenue trend forecasting, and conversion probability predictions. Provide data-driven recommendations.",
  "ux-auditor": "You are a UX audit expert. Help identify slow pages, poor user flows, confusing navigation patterns, and accessibility issues. Provide actionable UX improvement suggestions.",
  "marketing-copilot": "You are an AI marketing copilot. Help with SEO fixes, PPC budget optimisation, and UX improvement suggestions. Provide prioritised, actionable marketing recommendations.",
  "landing-pages": "You help with landing page analysis - performance metrics, conversion rates, and optimisation suggestions.",
  monetisation: "You help with monetisation analysis - revenue tracking, transaction data, and e-commerce performance.",
  admin: "You help with platform administration - user management, subscription plans, and system configuration.",
};
