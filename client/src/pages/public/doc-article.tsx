import { PublicLayout } from "@/components/public-navbar";
import { SEOHead } from "@/components/seo-head";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, BookOpen, Zap, BarChart3, Shield, Bot, Layers, Settings } from "lucide-react";
import { Link, useParams } from "wouter";

interface DocArticle {
  slug: string;
  title: string;
  description: string;
  section: string;
  content: string[];
  steps?: { title: string; detail: string }[];
  tips?: string[];
  relatedSlugs?: string[];
}

const articles: DocArticle[] = [
  {
    slug: "quick-start-guide",
    title: "Quick Start Guide",
    description: "Set up your first project in under 5 minutes",
    section: "Getting Started",
    content: [
      "Welcome to My User Journey! This guide will walk you through setting up your first analytics project and getting real data flowing in minutes.",
      "My User Journey provides powerful, privacy-first analytics that give you deep insights into how users interact with your website. Unlike traditional analytics platforms, we prioritise user privacy while still delivering actionable data.",
    ],
    steps: [
      { title: "Create an Account", detail: "Sign up for a free account at My User Journey. No credit card required. All core analytics features are free forever." },
      { title: "Create Your First Project", detail: "Once logged in, navigate to the Projects section and click 'Create Project'. Give your project a name and enter your website's domain URL." },
      { title: "Install the Tracking Snippet", detail: "Copy the generated tracking code from the project settings and paste it into the <head> section of your website. The snippet is lightweight (under 5KB) and won't slow down your site." },
      { title: "Verify Installation", detail: "Go to the Project Settings page and click 'Verify Snippet'. The system will check your website and confirm the tracking code is correctly installed." },
      { title: "View Your Data", detail: "Visit your website to generate some traffic, then head to the Real-time dashboard to see live data flowing in. Historical reports will populate within minutes." },
    ],
    tips: [
      "Use the Real-time dashboard to verify your tracking is working immediately after installation.",
      "Configure your GDPR consent settings before going live if you serve users in the UK or EU.",
      "Add your office IP address to the internal traffic filters to exclude your own visits from analytics.",
    ],
    relatedSlugs: ["installing-the-tracking-snippet", "project-configuration", "understanding-the-dashboard"],
  },
  {
    slug: "installing-the-tracking-snippet",
    title: "Installing the Tracking Snippet",
    description: "Add analytics tracking to your website",
    section: "Getting Started",
    content: [
      "The tracking snippet is a small piece of JavaScript that you add to your website to collect analytics data. It's designed to be lightweight, privacy-respecting, and fully configurable.",
      "The snippet supports multiple consent modes, cookieless tracking, and can be customised to match your privacy requirements. It works with all modern browsers and is compatible with single-page applications (SPAs).",
    ],
    steps: [
      { title: "Find Your Tracking Code", detail: "Navigate to your project in the dashboard, then go to Settings > Tracking Code. Your unique tracking snippet will be displayed here, pre-configured with your project ID." },
      { title: "Choose Your Consent Mode", detail: "Select the appropriate consent mode for your jurisdiction. Options include: full consent banner (recommended for UK/EU), implied consent, or cookieless mode for maximum privacy." },
      { title: "Copy the Snippet", detail: "Click the 'Copy' button to copy the entire tracking snippet to your clipboard. The code includes your project ID and consent configuration." },
      { title: "Add to Your Website", detail: "Paste the snippet into the <head> section of every page on your website. For CMS platforms like WordPress, add it to your theme's header template. For SPAs, add it to your index.html file." },
      { title: "Verify Installation", detail: "Use the built-in verification tool in Project Settings to confirm the snippet is correctly installed. It will check for common issues like mismatched project IDs or missing consent configuration." },
    ],
    tips: [
      "Place the snippet as high in the <head> as possible for the best data capture.",
      "If you're using a tag manager (like Google Tag Manager), you can deploy the snippet through a custom HTML tag instead.",
      "The snippet automatically handles page navigation events in single-page applications.",
      "Test in a staging environment first if you want to verify everything works before going live.",
    ],
    relatedSlugs: ["quick-start-guide", "gdpr-compliance-guide", "consent-management"],
  },
  {
    slug: "project-configuration",
    title: "Project Configuration",
    description: "Configure project settings and preferences",
    section: "Getting Started",
    content: [
      "Each project in My User Journey can be individually configured to match your specific needs. This includes setting up domains, configuring privacy rules, managing internal traffic filters, and customising data retention policies.",
      "Project configuration is accessible from the Settings page within each project. Changes take effect immediately and apply to all new incoming data.",
    ],
    steps: [
      { title: "General Settings", detail: "Set your project name, website URL, and timezone. The timezone affects how daily reports are calculated and when data retention policies are applied." },
      { title: "Privacy & Consent", detail: "Configure GDPR consent categories, IP anonymisation, DNT (Do Not Track) respect, and cookieless tracking mode. Choose from 55+ jurisdiction templates for automatic compliance." },
      { title: "Internal Traffic Filters", detail: "Add IP rules (exact match, prefix, or CIDR range) to exclude internal traffic from your analytics. This prevents your team's visits from skewing data." },
      { title: "Data Retention", detail: "Set how long analytics data is retained. Options range from 30 days to unlimited. Data beyond the retention period is automatically purged." },
      { title: "Custom Events", detail: "Define custom event types with rule-based matching to track specific user actions like form submissions, purchases, or sign-ups." },
    ],
    tips: [
      "Always configure your privacy settings before launching your tracking snippet on a live site.",
      "Use CIDR notation for IP ranges to efficiently filter entire office networks.",
      "Shorter data retention periods reduce storage usage but limit historical analysis.",
    ],
    relatedSlugs: ["quick-start-guide", "gdpr-compliance-guide", "custom-events"],
  },
  {
    slug: "understanding-the-dashboard",
    title: "Understanding the Dashboard",
    description: "Navigate the analytics dashboard",
    section: "Getting Started",
    content: [
      "The My User Journey dashboard follows a familiar navigation structure inspired by Google Analytics 4, making it easy to find the data you need. The left sidebar organises features into logical groups.",
      "The dashboard provides multiple views of your data including real-time monitoring, lifecycle analytics, traffic analysis, and advanced explorations like funnel analysis and user journey replay.",
    ],
    steps: [
      { title: "Dashboard Overview", detail: "The main dashboard shows key metrics at a glance: total visitors, page views, sessions, bounce rate, and average session duration. Use the date range picker to adjust the reporting period and enable comparison mode." },
      { title: "Life Cycle Section", detail: "Contains Acquisition (where visitors come from), Engagement (what they do on your site), and Real-time monitoring. These give you a complete picture of the user lifecycle." },
      { title: "Traffic & Content", detail: "Dive into traffic sources, page performance, geography, and browser/device breakdowns. Identify your top-performing content and understand your audience demographics." },
      { title: "Explorations", detail: "Advanced analytics including Funnel Analysis, User Journeys, Custom Reports, and Live Events. These tools help you answer specific questions about user behaviour." },
      { title: "Marketing & SEO", detail: "Integrated tools for SEO site audits, PPC campaign management, and AI-powered marketing recommendations." },
      { title: "Admin Section", detail: "Manage projects, privacy settings, tracking code, usage & billing, and platform configuration." },
    ],
    tips: [
      "Use the comparison toggle in the date picker to compare current performance against a previous period.",
      "Pin your most-used reports for quick access from the dashboard.",
      "The Real-time view auto-refreshes every 30 seconds, so you can leave it open to monitor activity.",
    ],
    relatedSlugs: ["real-time-analytics", "acquisition-reports", "engagement-metrics"],
  },
  {
    slug: "real-time-analytics",
    title: "Real-time Analytics",
    description: "Monitor live user activity on your site",
    section: "Analytics & Tracking",
    content: [
      "The Real-time Analytics dashboard shows you what's happening on your website right now. It updates every 30 seconds and provides instant visibility into active users, popular pages, traffic sources, and geographic distribution.",
      "Real-time data is essential for monitoring campaign launches, content releases, and troubleshooting tracking issues. It gives you immediate feedback on whether your tracking is working correctly.",
    ],
    steps: [
      { title: "Active Users", detail: "The prominent counter at the top shows how many users are currently active on your site (visited within the last 5 minutes). This updates automatically." },
      { title: "Per-Minute Activity Chart", detail: "A timeline chart showing pageviews per minute over the last 30 minutes. Useful for spotting traffic spikes from campaigns or social media shares." },
      { title: "Top Active Pages", detail: "See which pages are being viewed right now, ranked by active viewers. Click any page to see more details about that page's performance." },
      { title: "Traffic Sources", detail: "Real-time breakdown of where your current visitors are coming from, including direct, organic search, social media, and referral traffic." },
      { title: "Geographic Distribution", detail: "See which countries your current visitors are located in, updated in real-time based on IP geolocation." },
    ],
    tips: [
      "Use Real-time Analytics immediately after installing your tracking snippet to verify it's working.",
      "Monitor this view during campaign launches to see the immediate impact of your marketing efforts.",
      "If you see unexpected traffic patterns, check the traffic sources to identify the origin.",
    ],
    relatedSlugs: ["understanding-the-dashboard", "acquisition-reports", "engagement-metrics"],
  },
  {
    slug: "acquisition-reports",
    title: "Acquisition Reports",
    description: "Understand where your traffic comes from",
    section: "Analytics & Tracking",
    content: [
      "Acquisition reports reveal how visitors find your website. The platform automatically classifies traffic into channels including organic search, social media, referral, direct, email, paid search, paid social, display advertising, and affiliate traffic.",
      "Understanding your acquisition channels helps you allocate marketing budgets effectively and identify which strategies drive the most valuable traffic to your site.",
    ],
    steps: [
      { title: "Channel Overview", detail: "The main acquisition view shows a breakdown of all traffic channels with visitor counts, sessions, bounce rates, and conversion rates for each channel." },
      { title: "Traffic Source Details", detail: "Drill down into specific sources within each channel. For example, within 'Social', see whether traffic comes from Facebook, Twitter, LinkedIn, or other platforms." },
      { title: "UTM Parameters", detail: "If you use UTM tags in your marketing URLs, the platform automatically extracts campaign, source, medium, term, and content parameters for detailed campaign tracking." },
      { title: "Referrer Analysis", detail: "See the complete list of websites that send traffic to your site, with metrics for each referrer including visitor count and engagement quality." },
    ],
    tips: [
      "Use UTM parameters consistently across all your marketing campaigns for accurate attribution.",
      "Compare acquisition channels over different time periods to identify trends and seasonality.",
      "High bounce rates from a specific channel may indicate a mismatch between user expectations and your landing page content.",
    ],
    relatedSlugs: ["real-time-analytics", "engagement-metrics", "custom-events"],
  },
  {
    slug: "engagement-metrics",
    title: "Engagement Metrics",
    description: "Measure how users interact with your content",
    section: "Analytics & Tracking",
    content: [
      "Engagement metrics show you how users interact with your website after they arrive. Key metrics include page views, unique visitors, session duration, pages per session, bounce rate, and event counts.",
      "These metrics help you understand the quality of your traffic and the effectiveness of your content. High engagement typically correlates with users finding what they're looking for on your site.",
    ],
    steps: [
      { title: "Event Types", detail: "See all tracked event types including pageviews, clicks, scrolls, form submissions, and any custom events you've defined. Each event type shows total count and unique user count." },
      { title: "Page Performance", detail: "Analyse individual pages by views, unique visitors, average time on page, and exit rate. Identify your best-performing content and pages that need improvement." },
      { title: "Landing Pages", detail: "See which pages users land on first when they visit your site. Landing page performance directly impacts bounce rates and overall engagement." },
      { title: "Session Analysis", detail: "Understand session duration distribution, pages per session, and how users navigate through your site during a typical visit." },
    ],
    tips: [
      "Focus on pages with high traffic but low engagement, as these represent the biggest improvement opportunities.",
      "Compare engagement metrics across different acquisition channels to find your highest-quality traffic sources.",
      "Use custom events to track micro-conversions that indicate user intent.",
    ],
    relatedSlugs: ["acquisition-reports", "custom-events", "funnel-analysis"],
  },
  {
    slug: "custom-events",
    title: "Custom Events",
    description: "Track specific user actions and conversions",
    section: "Analytics & Tracking",
    content: [
      "Custom events let you track specific user actions that matter to your business beyond standard pageviews. You can define events based on rules matching event types, pages, referrers, and device types.",
      "The platform also includes AI-powered event template generation that can create tracking configurations for common conversion types like leads, purchases, sign-ups, and downloads.",
    ],
    steps: [
      { title: "Define a Custom Event", detail: "Navigate to Settings > Custom Events and click 'Create'. Give your event a name and define the matching rules. Events can match on event type (click, form_submit, etc.), page URL patterns, referrer URLs, and device types." },
      { title: "Use AI Templates", detail: "Click 'AI Generate' to have the platform suggest event configurations for common conversions. Simply describe what you want to track (e.g., 'purchase completion') and the AI will generate the appropriate rules." },
      { title: "Track Conversions", detail: "Mark custom events as conversion goals to track conversion rates and analyse the paths users take before converting. Conversion data appears in acquisition and engagement reports." },
      { title: "Analyse Event Data", detail: "View event counts, trends over time, and user segments associated with each custom event. Use the Events Explorer for real-time event monitoring with filters." },
    ],
    tips: [
      "Start with a few high-value events and expand over time rather than tracking everything at once.",
      "Use descriptive event names that clearly indicate what the event represents.",
      "Combine custom events with funnel analysis to understand the steps leading to conversions.",
    ],
    relatedSlugs: ["engagement-metrics", "funnel-analysis", "ai-copilot"],
  },
  {
    slug: "gdpr-compliance-guide",
    title: "GDPR Compliance Guide",
    description: "Ensure your tracking is fully compliant",
    section: "Privacy & Compliance",
    content: [
      "My User Journey is built from the ground up to be fully compliant with UK GDPR, EU GDPR, UK PECR, and the EU ePrivacy Directive. This guide explains the compliance features available and how to configure them for your specific needs.",
      "Privacy compliance is not just a legal requirement, it's a trust signal to your users. Our platform makes it easy to collect meaningful analytics while respecting user privacy and meeting regulatory obligations across 55+ jurisdictions worldwide.",
    ],
    steps: [
      { title: "Choose Your Jurisdiction", detail: "In Privacy Settings, select from 55+ jurisdiction templates covering the EU, US states, Canada, Latin America, Asia-Pacific, Middle East, Africa, and global regions. Each template pre-configures the appropriate consent requirements for that region's privacy laws." },
      { title: "Configure Consent Categories", detail: "Set up the six consent categories: Necessary (always active), Functional, Analytics, Performance, Advertisement, and Personalisation. Each category can be individually enabled or disabled." },
      { title: "Enable IP Anonymisation", detail: "Turn on IP anonymisation to automatically mask the last octet of visitor IP addresses. This provides privacy protection while maintaining useful geolocation data at the country/city level." },
      { title: "Respect DNT Headers", detail: "Enable Do Not Track (DNT) header respect to automatically stop tracking users who have enabled this browser setting." },
      { title: "Set Up Data Retention", detail: "Configure how long visitor data is retained. Shorter retention periods improve privacy compliance but limit historical analysis capabilities." },
      { title: "Handle Data Subject Requests", detail: "Use the built-in tools for Right to Erasure (deleting a visitor's data) and Data Portability (exporting a visitor's data as JSON or CSV) to fulfil data subject access requests." },
    ],
    tips: [
      "When in doubt, use stricter privacy settings. It's better to have slightly less data than to risk non-compliance.",
      "Document your data processing decisions in a privacy policy and link to it from your consent banner.",
      "Regularly review your privacy settings as regulations evolve, especially across different jurisdictions.",
      "The cookieless tracking mode is the most privacy-friendly option and still provides valuable analytics.",
    ],
    relatedSlugs: ["consent-management", "ip-anonymisation", "cookieless-tracking"],
  },
  {
    slug: "consent-management",
    title: "Consent Management",
    description: "Configure consent banners and categories",
    section: "Privacy & Compliance",
    content: [
      "The built-in consent management system provides a fully customisable two-step consent flow. Users first see a banner with Accept, Reject, and Customise options, then can fine-tune their preferences in a detailed modal with expandable category accordions.",
      "The system supports six consent categories, three layout types (bar, popup, box), five banner positions, custom colours, fonts, and button styles. It also integrates with third-party consent platforms including CookieYes, OneTrust, Cookiebot, Termly, and Iubenda.",
    ],
    steps: [
      { title: "Enable Consent Management", detail: "In Privacy Settings, toggle on consent management. Choose between the built-in consent banner or integration with a third-party consent platform." },
      { title: "Customise the Banner", detail: "Select a layout type (bar, popup, or box), position (top, bottom, bottom-left, bottom-right, centre), and customise colours, fonts, and button text to match your website's design." },
      { title: "Configure Categories", detail: "Enable or disable the six consent categories. For each category, add a description explaining what data is collected and why. Necessary cookies are always active and cannot be rejected by users." },
      { title: "Third-Party Integration", detail: "If you already use a consent platform like CookieYes, OneTrust, Cookiebot, Termly, or Iubenda, select it from the integration options. The tracking snippet will automatically respect consent decisions from your existing banner." },
      { title: "Test Your Banner", detail: "Use the preview feature to see how your consent banner will look on your website. Test both the initial banner and the preferences modal to ensure all categories display correctly." },
    ],
    tips: [
      "Keep category descriptions simple and jargon-free so users can make informed decisions.",
      "The bar layout at the bottom of the page is the least intrusive option for most websites.",
      "Always test your consent banner on mobile devices, as screen space is limited.",
      "Consider using the built-in banner for the most seamless integration with our analytics tracking.",
    ],
    relatedSlugs: ["gdpr-compliance-guide", "ip-anonymisation", "cookieless-tracking"],
  },
  {
    slug: "ip-anonymisation",
    title: "IP Anonymisation",
    description: "Protect user privacy with IP masking",
    section: "Privacy & Compliance",
    content: [
      "IP anonymisation automatically masks the last octet of visitor IP addresses before any data is stored. For example, 192.168.1.100 becomes 192.168.1.0. This provides a strong layer of privacy protection while maintaining useful geolocation data.",
      "The anonymisation is applied server-side after geolocation lookup, ensuring that the full IP address is never stored in the database. This approach satisfies the requirements of most privacy regulations including GDPR.",
    ],
    steps: [
      { title: "Enable IP Anonymisation", detail: "Navigate to Privacy Settings in your project and toggle on 'IP Anonymisation'. The change takes effect immediately for all new incoming data." },
      { title: "Understand the Impact", detail: "With anonymisation enabled, geolocation remains accurate at the country and city level. Internal traffic filtering by exact IP will still work, but you won't be able to identify individual visitors by IP address." },
      { title: "Geolocation Processing Order", detail: "The platform performs geolocation lookup before anonymising the IP, ensuring accurate location data. The anonymised IP is then stored for analysis without compromising privacy." },
    ],
    tips: [
      "IP anonymisation is recommended for all projects, regardless of jurisdiction, as a privacy best practice.",
      "The anonymisation is irreversible, providing strong assurance that full IPs cannot be recovered.",
      "Combine IP anonymisation with cookieless tracking for the maximum level of user privacy.",
    ],
    relatedSlugs: ["gdpr-compliance-guide", "consent-management", "cookieless-tracking"],
  },
  {
    slug: "cookieless-tracking",
    title: "Cookieless Tracking",
    description: "Track without cookies or persistent IDs",
    section: "Privacy & Compliance",
    content: [
      "Cookieless tracking mode allows you to collect analytics data without using cookies, localStorage, or any persistent identifiers. This is the most privacy-friendly tracking option available and eliminates the need for cookie consent banners in many jurisdictions.",
      "In cookieless mode, the platform uses session-based fingerprinting that doesn't persist between browser sessions. This means you can still track pageviews, events, and basic engagement within a single session, but you won't be able to identify returning visitors across sessions.",
    ],
    steps: [
      { title: "Enable Cookieless Mode", detail: "In Privacy Settings, toggle on 'Cookieless Tracking'. This disables all cookie and localStorage usage by the tracking snippet." },
      { title: "Understand the Trade-offs", detail: "Cookieless tracking provides per-session analytics but cannot track returning visitors, multi-session journeys, or long-term user engagement trends. Event tracking and pageview data remain fully functional." },
      { title: "Update Your Consent Banner", detail: "In many jurisdictions, cookieless tracking doesn't require a cookie consent banner for analytics purposes. However, consult with your legal team before removing consent requirements, as regulations vary." },
    ],
    tips: [
      "Cookieless tracking is ideal for privacy-sensitive industries like healthcare, finance, and government.",
      "You can still get valuable insights about traffic patterns, popular content, and traffic sources even without visitor identification.",
      "Consider using cookieless mode as a fallback for users who reject analytics cookies.",
    ],
    relatedSlugs: ["gdpr-compliance-guide", "consent-management", "ip-anonymisation"],
  },
  {
    slug: "ai-copilot",
    title: "AI Copilot",
    description: "Ask questions about your data in natural language",
    section: "AI Features",
    content: [
      "The AI Copilot lets you ask questions about your analytics data using natural language. Instead of navigating through multiple reports, simply ask a question like 'What were my top traffic sources last week?' or 'Which pages have the highest bounce rate?' and get instant, data-driven answers.",
      "Powered by OpenAI's GPT-4o-mini model, the AI Copilot analyses your actual analytics data and provides actionable insights with context. It can summarise trends, identify anomalies, and suggest improvements.",
    ],
    steps: [
      { title: "Access AI Copilot", detail: "Navigate to the AI Insights section in the sidebar. The chat interface allows you to type natural language questions about your analytics data." },
      { title: "Ask Questions", detail: "Type any analytics-related question. Examples: 'What's my conversion rate trend this month?', 'Which referrers bring the most engaged users?', 'How does mobile vs desktop traffic compare?'" },
      { title: "Review Insights", detail: "The AI provides detailed responses with relevant data points, trends, and recommendations. Responses include context about your specific data, not generic advice." },
      { title: "Usage Tracking", detail: "AI Copilot usage is tracked and billed on a pay-as-you-go basis. You can monitor your AI usage in the Usage & Billing section. Invoicing only occurs when monthly usage exceeds the threshold." },
    ],
    tips: [
      "Be specific in your questions to get the most actionable insights.",
      "Use the AI Copilot to quickly explore data patterns before diving into detailed reports.",
      "The AI learns from your project's data, so responses become more relevant over time.",
    ],
    relatedSlugs: ["predictive-analytics", "ux-auditor", "marketing-copilot"],
  },
  {
    slug: "predictive-analytics",
    title: "Predictive Analytics",
    description: "Forecast churn, revenue, and conversions",
    section: "AI Features",
    content: [
      "Predictive Analytics uses AI to analyse your historical data and forecast future trends. The platform provides three key predictions: churn risk scoring (identifying users likely to leave), revenue trend forecasting, and conversion probability predictions.",
      "These predictions help you take proactive action, whether that's targeting at-risk users with retention campaigns, adjusting revenue forecasts, or optimising conversion paths before they underperform.",
    ],
    steps: [
      { title: "Access Predictive Analytics", detail: "Navigate to AI > Predictive Analytics in the sidebar. The dashboard shows your current predictions with confidence intervals and trend indicators." },
      { title: "Churn Risk Scoring", detail: "View a ranked list of visitors by churn risk, based on their engagement patterns compared to historical data. Users showing declining engagement or unusual behaviour patterns are flagged as high risk." },
      { title: "Revenue Forecasting", detail: "If you track revenue events, the AI forecasts expected revenue trends based on current trajectory, seasonality, and historical patterns." },
      { title: "Conversion Predictions", detail: "For each defined conversion goal, the AI predicts expected conversion rates and identifies factors that most influence conversions, helping you prioritise optimisation efforts." },
    ],
    tips: [
      "Predictive Analytics becomes more accurate with more historical data. Allow at least 30 days of data collection for reliable predictions.",
      "Combine churn predictions with engagement metrics to build targeted retention strategies.",
      "Use conversion predictions to allocate marketing budget to the channels most likely to convert.",
    ],
    relatedSlugs: ["ai-copilot", "ux-auditor", "marketing-copilot"],
  },
  {
    slug: "ux-auditor",
    title: "UX Auditor",
    description: "Automated UX issue detection and scoring",
    section: "AI Features",
    content: [
      "The AI UX Auditor automatically analyses your website's user experience by examining user behaviour patterns, identifying slow pages, confusing navigation flows, and high-friction areas. It provides a UX score and prioritised recommendations for improvement.",
      "Unlike traditional UX tools that only look at technical metrics, the UX Auditor uses AI to understand actual user behaviour patterns, making its recommendations more relevant and actionable.",
    ],
    steps: [
      { title: "Run a UX Audit", detail: "Navigate to AI > UX Auditor in the sidebar. Click 'Run Audit' to start an AI-powered analysis of your website's user experience based on collected analytics data." },
      { title: "Review Your UX Score", detail: "The audit produces an overall UX score along with category scores for navigation clarity, page performance, user flow efficiency, and content engagement." },
      { title: "Examine Findings", detail: "Each finding includes a severity level, affected pages, the user behaviour pattern that triggered the finding, and a specific recommendation for improvement." },
      { title: "Track Improvements", detail: "After implementing changes, run the audit again to measure improvement. Historical audit scores are tracked so you can see your UX quality trending over time." },
    ],
    tips: [
      "Run UX audits regularly (monthly or after major site changes) to catch new issues early.",
      "Prioritise high-severity findings that affect your most-visited pages for maximum impact.",
      "Combine UX Auditor findings with funnel analysis to pinpoint exactly where users drop off.",
    ],
    relatedSlugs: ["ai-copilot", "predictive-analytics", "marketing-copilot"],
  },
  {
    slug: "marketing-copilot",
    title: "Marketing Copilot",
    description: "AI-powered SEO, PPC, and UX recommendations",
    section: "AI Features",
    content: [
      "The AI Marketing Copilot provides actionable recommendations across three areas: SEO improvements, PPC budget optimisation, and UX enhancements. It analyses your analytics data and website performance to generate specific, prioritised suggestions.",
      "Each recommendation includes an estimated impact, implementation difficulty, and step-by-step guidance, making it easy to decide what to work on first and how to implement changes.",
    ],
    steps: [
      { title: "Access Marketing Copilot", detail: "Navigate to AI > Marketing Copilot in the sidebar. The dashboard shows recommendations organised by category: SEO, PPC, and UX." },
      { title: "SEO Recommendations", detail: "Get specific suggestions for improving organic search visibility, including content optimisation, technical SEO fixes, keyword opportunities, and link building strategies based on your actual traffic data." },
      { title: "PPC Optimisation", detail: "If you run paid campaigns, the AI analyses your PPC performance data and suggests budget allocation changes, bid adjustments, and audience targeting improvements to maximise ROI." },
      { title: "UX Improvements", detail: "Receive suggestions for improving user experience based on actual behaviour patterns, including navigation changes, content restructuring, and conversion path optimisation." },
    ],
    tips: [
      "Start with quick-win recommendations (high impact, low difficulty) for immediate results.",
      "Review recommendations monthly as your traffic patterns and competitive landscape change.",
      "Use the estimated impact scores to prioritise which recommendations to implement first.",
    ],
    relatedSlugs: ["ai-copilot", "predictive-analytics", "ux-auditor"],
  },
  {
    slug: "google-analytics-4",
    title: "Google Analytics 4",
    description: "Import and compare GA4 data",
    section: "Integrations",
    content: [
      "My User Journey can import data from Google Analytics 4, allowing you to compare metrics between platforms and maintain continuity when migrating from GA4. The integration supports importing historical data and running side-by-side comparisons.",
      "This integration helps organisations transitioning from GA4 to a privacy-first analytics solution while maintaining access to their historical data and ensuring consistency in reporting.",
    ],
    steps: [
      { title: "Connect GA4", detail: "Navigate to Integrations > Google Analytics 4 and follow the authentication flow to connect your GA4 property. You'll need admin access to the GA4 property you want to connect." },
      { title: "Select Data to Import", detail: "Choose which GA4 data you want to import, including traffic data, events, conversions, and audience demographics. You can import historical data for a specified date range." },
      { title: "Run Comparisons", detail: "Once imported, use the comparison reports to see how My User Journey metrics compare with GA4 data. This helps validate your tracking setup and identify any discrepancies." },
      { title: "Migration Guide", detail: "Follow the step-by-step migration guide to transition your analytics workflow from GA4 to My User Journey with minimal disruption to your reporting." },
    ],
    tips: [
      "Import at least 3 months of GA4 data to establish meaningful comparison baselines.",
      "Minor discrepancies between platforms are normal due to different tracking methodologies.",
      "Use this integration during a transition period, then consider removing GA4 once you're confident in your My User Journey data.",
    ],
    relatedSlugs: ["google-search-console", "rest-api-reference", "webhooks"],
  },
  {
    slug: "google-search-console",
    title: "Google Search Console",
    description: "Search performance integration",
    section: "Integrations",
    content: [
      "Integrate Google Search Console to enrich your analytics with search performance data. See which search queries drive traffic to your site, track your search rankings, and correlate organic search performance with on-site engagement metrics.",
      "This integration brings search data directly into your analytics dashboard, eliminating the need to switch between tools when analysing your organic search strategy.",
    ],
    steps: [
      { title: "Connect Search Console", detail: "Navigate to Integrations > Google Search Console and authenticate with your Google account. Select the Search Console property that matches your website." },
      { title: "View Search Data", detail: "Once connected, search query data appears in the SEO section of your dashboard. See impressions, clicks, click-through rates, and average position for your top queries." },
      { title: "Cross-Reference with Analytics", detail: "Correlate search performance with engagement metrics. For example, identify queries that drive high-bounce traffic versus queries that bring engaged visitors." },
    ],
    tips: [
      "Search Console data typically has a 2-3 day delay, which is normal for Google's reporting.",
      "Use search query data to identify content opportunities where you rank well but have low click-through rates.",
      "Compare search performance trends with traffic acquisition data to understand your organic growth.",
    ],
    relatedSlugs: ["google-analytics-4", "rest-api-reference", "acquisition-reports"],
  },
  {
    slug: "rest-api-reference",
    title: "REST API Reference",
    description: "Integrate with your own tools",
    section: "Integrations",
    content: [
      "My User Journey provides a comprehensive REST API that allows you to programmatically access your analytics data, manage projects, and integrate with your own tools and workflows. The API follows RESTful conventions and returns JSON responses.",
      "Common use cases include building custom dashboards, integrating analytics data into internal tools, automating report generation, and syncing data with data warehouses.",
    ],
    steps: [
      { title: "Authentication", detail: "API requests are authenticated using session cookies or API tokens. Generate an API token from your account settings to use in server-to-server integrations." },
      { title: "Core Endpoints", detail: "The API provides endpoints for: Projects (CRUD operations), Events (collection and querying), Analytics (metrics, dimensions, and time series data), Privacy (consent and data subject requests), and AI features." },
      { title: "Data Querying", detail: "Use query parameters to filter, sort, and paginate results. Common filters include date ranges, dimensions (page, source, device), and metric thresholds." },
      { title: "Rate Limiting", detail: "API requests are rate-limited to ensure fair usage. Standard accounts allow 100 requests per minute. Rate limit headers are included in every response." },
    ],
    tips: [
      "Use pagination for endpoints that return large datasets to avoid timeout issues.",
      "Cache frequently accessed data on your side to reduce API calls and improve performance.",
      "Check the response headers for rate limit information to avoid hitting limits.",
    ],
    relatedSlugs: ["webhooks", "google-analytics-4", "data-export"],
  },
  {
    slug: "webhooks",
    title: "Webhooks",
    description: "Set up event-driven integrations",
    section: "Integrations",
    content: [
      "Webhooks allow you to receive real-time notifications when specific events occur in your analytics. Instead of polling the API for changes, webhooks push data to your server as events happen, enabling real-time integrations and automated workflows.",
      "Common webhook use cases include triggering alerts when traffic spikes occur, syncing conversion data with CRM systems, updating dashboards in real-time, and feeding data into marketing automation platforms.",
    ],
    steps: [
      { title: "Create a Webhook", detail: "Navigate to Settings > Webhooks and click 'Add Webhook'. Provide a URL endpoint on your server that can receive POST requests, and select which events should trigger the webhook." },
      { title: "Choose Events", detail: "Select from available webhook events including: new visitor, conversion completed, traffic spike detected, daily summary ready, and custom event triggered." },
      { title: "Test Your Webhook", detail: "Use the 'Send Test' button to send a sample payload to your endpoint. Verify that your server correctly receives and processes the webhook data." },
      { title: "Monitor Delivery", detail: "The webhook dashboard shows delivery history, success/failure rates, and response times. Failed deliveries are automatically retried up to 3 times." },
    ],
    tips: [
      "Always verify the webhook signature to ensure requests are genuinely from My User Journey.",
      "Implement idempotency in your webhook handler to safely handle duplicate deliveries.",
      "Use a webhook relay service like RequestBin during development to inspect payloads before building your handler.",
    ],
    relatedSlugs: ["rest-api-reference", "custom-events", "google-analytics-4"],
  },
  {
    slug: "funnel-analysis",
    title: "Funnel Analysis",
    description: "Create and analyse conversion funnels",
    section: "Advanced",
    content: [
      "Funnel Analysis lets you define multi-step conversion funnels and visualise how users progress through them. You can identify exactly where users drop off and quantify the conversion rate between each step.",
      "The platform includes both a traditional funnel builder and an AI-powered no-code funnel builder with visual drag-and-drop, step reordering, flow preview, and AI-generated funnel suggestions.",
    ],
    steps: [
      { title: "Create a Funnel", detail: "Navigate to Explorations > Funnels and click 'Create Funnel'. Define each step in your funnel by specifying the criteria: pageview (URL match), event type, or click target." },
      { title: "No-Code Funnel Builder", detail: "Use the visual drag-and-drop funnel builder for an intuitive experience. Drag steps to reorder them, preview the flow visually, and let the AI suggest funnel structures based on your data." },
      { title: "Analyse Drop-offs", detail: "The funnel visualisation shows the conversion rate between each step, highlighting where the biggest drop-offs occur. Click on any step to see detailed user segments." },
      { title: "Compare Segments", detail: "Compare funnel performance across different user segments, devices, traffic sources, or time periods to identify which audiences convert best." },
    ],
    tips: [
      "Start with your most important conversion path (e.g., homepage to signup to first action) and optimise from there.",
      "Use the AI funnel generator to discover conversion paths you might not have considered.",
      "Monitor funnel performance over time to measure the impact of your optimisation efforts.",
    ],
    relatedSlugs: ["user-journey-replay", "custom-reports", "custom-events"],
  },
  {
    slug: "user-journey-replay",
    title: "User Journey Replay",
    description: "Reconstruct individual sessions",
    section: "Advanced",
    content: [
      "User Journey Replay lets you reconstruct and review individual user sessions as a timeline of events. See exactly what pages a visitor viewed, what they clicked, how long they spent on each page, and their complete navigation path through your site.",
      "This feature is invaluable for understanding user behaviour at an individual level, debugging conversion issues, and identifying UX problems that only become apparent when you see the actual user journey.",
    ],
    steps: [
      { title: "Access Journey Replay", detail: "Navigate to Explorations > User Journeys. You'll see a list of recent sessions with summary information including duration, pages viewed, and events triggered." },
      { title: "Select a Session", detail: "Click on any session to view the complete journey timeline. Filter sessions by visitor ID, date range, number of pages, or specific events to find the sessions you want to examine." },
      { title: "Review the Timeline", detail: "The timeline shows each event in chronological order with timestamps, page URLs, event types, and duration between events. Scroll through to see the complete user journey." },
      { title: "Identify Patterns", detail: "Look for patterns across multiple sessions: common drop-off points, unexpected navigation paths, or repeated actions that might indicate confusion or frustration." },
    ],
    tips: [
      "Focus on sessions that include conversion events to understand what successful journeys look like.",
      "Look at sessions with high page counts but no conversions to identify friction points.",
      "Use journey data to validate or refine your funnel definitions.",
    ],
    relatedSlugs: ["funnel-analysis", "custom-reports", "engagement-metrics"],
  },
  {
    slug: "custom-reports",
    title: "Custom Reports",
    description: "Build reports with custom dimensions",
    section: "Advanced",
    content: [
      "The Custom Report Builder lets you create tailored reports with the exact metrics, dimensions, chart types, and filters you need. Reports can be saved, shared, and scheduled for regular generation.",
      "The platform also supports AI-powered report generation, where you describe what you want to analyse in natural language and the AI creates the appropriate report configuration for you.",
    ],
    steps: [
      { title: "Create a Report", detail: "Navigate to Explorations > Custom Reports and click 'Create'. Choose your metrics (what to measure), dimensions (how to group data), and chart type (bar, line, pie, table)." },
      { title: "Add Filters", detail: "Apply filters to focus your report on specific segments. Filter by date range, traffic source, device type, geography, or any custom dimension." },
      { title: "AI Report Generation", detail: "Click 'Generate with AI' and describe what you want to analyse in plain English. For example: 'Show me mobile traffic trends by country for the last 3 months.' The AI will create the report configuration automatically." },
      { title: "Save and Schedule", detail: "Save your report for quick access later. Optionally schedule it to generate automatically on a daily, weekly, or monthly basis." },
    ],
    tips: [
      "Use the AI report generator when you're not sure which metrics and dimensions to combine.",
      "Create a standard set of reports for your regular review meetings to ensure consistent tracking.",
      "Experiment with different chart types to find the most effective visualisation for each dataset.",
    ],
    relatedSlugs: ["funnel-analysis", "data-export", "engagement-metrics"],
  },
  {
    slug: "data-export",
    title: "Data Export",
    description: "Export your data in CSV or JSON format",
    section: "Advanced",
    content: [
      "My User Journey supports comprehensive data export in both CSV and JSON formats. You can export visitor data, event data, analytics reports, and custom report results for external analysis or compliance requirements.",
      "Data export is also a key component of GDPR Data Portability compliance, allowing you to provide users with a copy of their personal data upon request.",
    ],
    steps: [
      { title: "Export Analytics Data", detail: "From any report or data view, click the 'Export' button and choose CSV or JSON format. The export includes all visible data with the current filters and date range applied." },
      { title: "Export Visitor Data", detail: "Navigate to the Visitors section to export individual visitor records. This includes all pageviews, events, and session data associated with each visitor." },
      { title: "Data Portability Requests", detail: "For GDPR Data Portability compliance, use the Privacy section to generate a complete data export for a specific visitor. This includes all personal data and can be provided to the data subject upon request." },
      { title: "Bulk Export", detail: "For large datasets, use the REST API to programmatically export data with pagination. This is recommended for integrating with data warehouses or external analytics tools." },
    ],
    tips: [
      "Use CSV format for importing into spreadsheet tools. Use JSON for programmatic integrations.",
      "Schedule regular exports to maintain backups of your analytics data.",
      "For GDPR compliance, document your data export process as part of your data protection procedures.",
    ],
    relatedSlugs: ["rest-api-reference", "gdpr-compliance-guide", "custom-reports"],
  },
];

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getRelatedArticles(slugs: string[]): DocArticle[] {
  return slugs
    .map((s) => articles.find((a) => a.slug === s))
    .filter((a): a is DocArticle => !!a);
}

const sectionIcons: Record<string, typeof Zap> = {
  "Getting Started": Zap,
  "Analytics & Tracking": BarChart3,
  "Privacy & Compliance": Shield,
  "AI Features": Bot,
  "Integrations": Layers,
  "Advanced": Settings,
};

export default function DocArticlePage() {
  const params = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === params.slug);

  if (!article) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4" data-testid="text-article-not-found">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The documentation article you're looking for doesn't exist.</p>
          <Link href="/docs">
            <Button data-testid="button-back-to-docs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Documentation
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const SectionIcon = sectionIcons[article.section] || BookOpen;
  const related = article.relatedSlugs ? getRelatedArticles(article.relatedSlugs) : [];

  return (
    <PublicLayout>
      <SEOHead title={`${article.title} - Documentation`} description={article.description} keywords={`${article.title.toLowerCase()}, analytics documentation, ${article.section.toLowerCase()}`} canonicalUrl={`https://myuserjourney.co.uk/docs/${article.slug}`} />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/docs">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-to-docs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documentation
          </Button>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <SectionIcon className="h-4 w-4 text-primary" />
          <Badge variant="secondary" className="text-xs" data-testid="badge-section">{article.section}</Badge>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3" data-testid="text-article-title">
          {article.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-8" data-testid="text-article-description">
          {article.description}
        </p>

        <div className="space-y-6">
          {article.content.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>

        {article.steps && article.steps.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-5">Step-by-Step Guide</h2>
            <div className="space-y-4">
              {article.steps.map((step, i) => (
                <Card key={i} data-testid={`card-step-${i}`}>
                  <CardContent className="p-5">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.detail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {article.tips && article.tips.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Tips & Best Practices</h2>
            <Card>
              <CardContent className="p-5">
                <ul className="space-y-3">
                  {article.tips.map((tip, i) => (
                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">Related Articles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((rel) => (
                <Link key={rel.slug} href={`/docs/${rel.slug}`}>
                  <Card className="hover-elevate cursor-pointer h-full" data-testid={`card-related-${rel.slug}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm">{rel.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{rel.description}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

export { articles, generateSlug };
