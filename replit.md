# AI Digital Analyst Platform

## Overview
The AI Digital Analyst Platform is a self-hosted, AI-powered analytics solution designed for comprehensive user behavior tracking, SEO analysis, and PPC campaign management across multiple projects. It offers a GA4-style navigation experience and is built to be fully compliant with UK GDPR, UK PECR, EU GDPR, and EU ePrivacy Directives. Key capabilities include:

-   **Real-time Analytics**: Monitor active users, per-minute activity, and top content.
-   **Lifecycle Views**: Analyze user acquisition and engagement patterns.
-   **Funnel Exploration**: Create and analyze conversion funnels with drop-off visualization.
-   **User Journey Replay**: Reconstruct and review individual user sessions.
-   **Advanced Traffic Classification**: Detect bots, server-side traffic, cron jobs, and internal traffic, alongside detailed traffic source classification (organic, social, paid, referral, etc.).
-   **Data Management**: Comprehensive traffic filtering, data export (CSV/JSON), and customizable data retention policies.
-   **Reporting**: Custom report builder with AI-powered generation and comparison analytics.
-   **Privacy Compliance**: Robust features for consent management, IP anonymization, cookieless tracking, Right to Erasure, and Data Portability.
-   **AI Integration**: AI-powered insights and custom event template generation.
-   **Marketing Tools**: Integrated SEO analysis and PPC campaign management.

The platform aims to provide businesses with a powerful, privacy-first alternative to traditional analytics solutions, enabling deeper insights into user behavior and marketing performance while maintaining full control over their data.

## User Preferences
I want to prioritize a clear, concise, and structured approach to development. Please focus on delivering high-quality, maintainable code. For any significant architectural decisions or changes, ask for my approval before implementation. I prefer detailed explanations for complex features or logic. I am comfortable with iterative development, delivering features in manageable chunks. I expect all work to adhere strictly to the outlined privacy and compliance requirements, particularly regarding GDPR and ePrivacy regulations.

## System Architecture

### UI/UX Decisions
The frontend adopts a modern, responsive design using React 18, TypeScript, Vite, Tailwind CSS, and Shadcn UI. The navigation structure mimics Google Analytics 4 (GA4) with sections for "Life cycle," "Traffic & Content," "Explorations," "Marketing & SEO," and "Admin" to provide a familiar user experience. Charting and data visualization are handled by Recharts, ensuring clear and interactive presentation of analytics data. The platform supports dark/light themes.

### Technical Implementations
-   **Frontend**: Built with React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, and Recharts for a robust and modern user interface. State management is handled by TanStack React Query for efficient data fetching and caching. Wouter is used for client-side routing.
-   **Backend**: Developed using Express.js with TypeScript, providing a scalable and maintainable API.
-   **Database**: PostgreSQL is the chosen relational database, managed with Drizzle ORM for type-safe and efficient data interactions.
-   **Analytics Core**:
    -   **Event Collection**: A `/api/events` endpoint handles incoming tracking events, performing GDPR checks, bot/server detection, IP rule matching, and traffic source classification.
    -   **Traffic Classification**: Uses referrer URLs and UTM parameters to categorize traffic into types like organic_search, social, referral, email, paid_search, paid_social, display, affiliate, and direct.
    -   **Bot/Server Detection**: Identifies requests from known bots, crawlers, server-side tools (e.g., curl, wget), and monitoring services based on user-agent patterns.
    -   **Internal Traffic**: Managed via configurable IP rules (exact, prefix, CIDR) to exclude internal traffic from analytics.
    -   **Geolocation**: IP-based geolocation is performed server-side via ip-api.com (free tier), with strict anonymization rules applied if enabled.
-   **GDPR/Privacy Compliance**:
    -   **Consent Management**: Implemented via a fully customizable tracking snippet with two-step consent flow (initial banner with Accept/Reject/Customise, then preferences modal with expandable category accordions). Supports 6 consent categories (Necessary, Functional, Analytics, Performance, Advertisement, Personalisation), 3 layout types (bar, popup, box), 5 positions, custom colors/fonts/button styles, and third-party banner integration (CookieYes, OneTrust, Cookiebot, Termly, Iubenda).
    -   **IP Anonymization**: Automatically anonymizes the last octet of IP addresses.
    -   **DNT Respect**: Honors "Do Not Track" browser headers.
    -   **Cookieless Mode**: Supports tracking without cookies, localStorage, or persistent IDs.
    -   **Data Subject Rights**: Provides UI and API endpoints for Right to Erasure (deleting visitor data) and Data Portability (exporting visitor data as JSON/CSV).
    -   **Data Retention**: Configurable data retention periods with manual purge capabilities.
-   **Customization & Extensibility**:
    -   **Custom Reports**: A flexible report builder allows users to define custom metrics, dimensions, chart types, and filters. AI-powered report generation is also available via natural language prompts.
    -   **Custom Event Definitions**: Users can define custom events with rule-based matching (e.g., eventType, page, referrer, device), including AI-generated templates for common conversions (Lead, Purchase). Conversion analysis tracks paths leading to these events.
    -   **Funnels**: Users can create multi-step funnels, defining steps based on pageviews, events, or clicks, and visualize conversion rates and drop-offs.
-   **API Design**: The backend exposes a RESTful API with distinct endpoints for managing projects, collecting events, retrieving various analytics data (realtime, acquisition, engagement), managing privacy settings, and interacting with AI features.

### Feature Specifications
-   **Dashboard**: Overview of key analytics with comparison stats and period selectors.
-   **Realtime**: Active users, per-minute chart, top pages, sources, countries.
-   **Acquisition**: Traffic sources, referrers, pie/bar charts.
-   **Engagement**: Event types, pages, landing pages, session duration.
-   **Live Events**: Stream of events with multi-dimensional filtering.
-   **User Journeys**: Session replay and timeline views of visitor interactions.
-   **Visitors**: List of unique visitors with aggregated data and export options.
-   **Traffic Sources**: Detailed channel/source/campaign breakdown with bounce rates and session metrics.
-   **Pages Analysis**: Top pages, entry pages, exit pages, and 404 detection with pageview/unique visitor counts.
-   **Geography**: Country, city, and language analytics with visitor distribution.
-   **Browsers & Systems**: Browser, OS, and device type breakdowns with usage statistics.
-   **Site Audit**: HTML crawling with SEO issue detection (titles, meta descriptions, headings, images, links, canonical tags, OG tags), scoring system, and recommendations.
-   **SEO/PPC**: Dedicated modules for SEO analysis and PPC campaign management.
-   **AI Insights**: Chat interface for AI-powered analytics questions and insights.
-   **Predictive Analytics**: AI-powered churn risk scoring, revenue trend forecasting, and conversion probability predictions.
-   **AI UX Auditor**: Automated detection of slow pages, bad UX flows, and confusing navigation with scoring and recommendations.
-   **No-Code Funnel Builder**: Visual drag-and-drop funnel builder with step reordering, flow preview, and AI-powered funnel generation.
-   **AI Marketing Copilot**: AI-driven SEO fixes, PPC budget optimization suggestions, and UX improvement recommendations.
-   **Projects**: CRUD management for analytics projects.
-   **Privacy**: UI for GDPR settings, consent management with full banner customization (6 categories, 3 layouts, 5 positions, custom styling), third-party banner integration, internal IP rules, and data subject requests.
-   **Tracking Code**: Generator for GDPR-compliant JavaScript tracking snippets with two-step consent flow.

## Recent Changes
-   **Pay-as-you-go Pricing & Stripe Billing (Feb 2026)**: Replaced tiered subscription model with pay-as-you-go pricing. Core analytics free, AI features billed at usage-based rates. Stripe integration via stripe-replit-sync for automated invoicing when monthly AI usage exceeds $10. New DB tables: `ai_usage_logs`, `stripe_customers`, `invoices`. New files: `server/stripe-billing.ts`, `server/stripeClient.ts`, `server/webhookHandlers.ts`. Pricing page at `/pricing`.
-   **Built-in OpenAI Integration (Feb 2026)**: Switched from customer-provided API keys to Replit's built-in OpenAI (gpt-4o-mini model). All 8 AI features now track token usage and costs. Removed API key requirement banners. AI service returns `AiUsageResult` with token counts and cost tracking.
-   **Geolocation Fix (Feb 2026)**: Fixed "Unknown" country display by resolving geolocation BEFORE IP anonymization in event collection pipeline.
-   **Global Jurisdiction Support (Feb 2026)**: Expanded privacy jurisdiction dropdown from 3 to 55+ options covering EU, US states, Canada, Latin America, Asia-Pacific, Middle East, Africa, and global regions with their specific privacy laws.
-   **GitHub Publication Readiness (Feb 2026)**: Added README.md, whitepaper.md, LICENSE (MIT), .env.example, and updated .gitignore for safe GitHub publication. Removed hardcoded default admin password from seed.ts (now requires ADMIN_DEFAULT_PASSWORD env var). Added Security Notes section to README.
-   **Password Reset Feature (Feb 2026)**: Secure forgot password / reset password flow with crypto tokens, 1-hour expiry, one-time use. New `password_resets` DB table. Pages: `/reset-password`. API: `/api/auth/forgot-password`, `/api/auth/reset-password`.
-   **CMS Platform Transformation (Feb 2026)**: Converted the platform into a full CMS SaaS. Added 5 new DB tables: `site_settings`, `cms_pages`, `cms_files`, `smtp_settings`, `contact_submissions`. Extended `users` table with `auth_provider` and `is_active` fields.
-   **Custom Authentication (Feb 2026)**: Replaced Replit Auth with custom email/password authentication (bcrypt hashed, 12 rounds) and direct Google OAuth via Passport.js. Login page at `/login` supports both flows. Registration creates new accounts. All `/api/login` Replit Auth links replaced with `/login`.
-   **Admin CMS Panel (Feb 2026)**: Complete admin panel at `/admin` with 7 tabs: Site Settings (branding, colors, social links), SMTP Configuration (with test email), CMS Pages (CRUD with slug, content, SEO metadata, publish status), File Manager (upload/delete with drag-drop), User Management (role/status/delete), Contact Submissions (status tracking, delete), Tracking Codes (Google Analytics, GTM, Search Console, Google Ads, Facebook Pixel, TikTok, LinkedIn, Pinterest, Snapchat, Twitter/X, Microsoft Ads, Bing/Yandex verification, Hotjar, Clarity, custom head/body scripts).
-   **Tracking Codes Injection (Feb 2026)**: TrackingScripts component in PublicLayout dynamically injects all configured tracking codes (scripts, pixels, verification meta tags, noscript fallbacks) into public pages. Public API at `/api/public/tracking-codes` returns tracking IDs (sensitive tokens like Facebook Conversions API token excluded). Proper DOM cleanup on unmount/update via data-attribute tracking.
-   **Dynamic CMS Frontend (Feb 2026)**: Dynamic page rendering at `/page/:slug` from DB content. Contact form at `/contact` with SMTP email notifications. Public API routes: `/api/public/site-settings`, `/api/public/pages`, `/api/public/pages/:slug`, `/api/public/contact`.
-   **Auth Files**: `server/auth.ts` handles Passport local strategy + Google OAuth. `client/src/lib/auth-context.tsx` fetches user from `/api/auth/me`. Login/logout via POST endpoints.
-   **AI Features (Feb 2026)**: Predictive Analytics, AI UX Auditor, AI Marketing Copilot, No-Code Funnel Builder.
-   **Date Range Picker**: Enhanced DateRangePicker with presets, custom ranges, and comparison mode.

## External Dependencies
-   **Geolocation Service**: `ip-api.com` (free tier) for IP-based geolocation, used server-side only and disabled when IP anonymization is active.
-   **LLM Provider**: Replit's built-in OpenAI (gpt-4o-mini model). No customer API keys required. Usage tracked per-feature with token counts and costs.
-   **Stripe**: Payment processing via `stripe-replit-sync`. Automated invoicing when monthly AI usage exceeds $10. Webhook at `/api/stripe/webhook`.
-   **SMTP**: Nodemailer for sending emails (contact form notifications, SMTP test). Configured per-site via admin panel.
-   **File Uploads**: Multer handles file uploads to local `/uploads` directory, served as static files.