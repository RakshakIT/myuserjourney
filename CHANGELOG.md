# Changelog

All notable changes to MyUserJourney will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0-beta] - 2026-02-17

### Added
- Site Research tool with real website crawling (homepage HTML + sitemap.xml parsing)
- Server-side URL validation and SSRF protection for Site Research
- GitHub Actions CI/CD workflows (lint, type-check, build, CodeQL, release)
- SECURITY.md with vulnerability reporting process
- CHANGELOG.md following Keep a Changelog format
- Professional open-source community files

### Changed
- Site Research now verifies actual pages before AI analysis
- AI output filtered to only include crawl-verified page URLs

### Removed
- Backlinks tab from Site Research (requires third-party SEO tool integration)

## [1.2.0] - 2026-02-16

### Added
- Pay-as-you-go pricing with Stripe billing integration
- Automated invoicing when monthly AI usage exceeds threshold
- AI usage tracking across all 8 AI features
- Pricing page at `/pricing`
- Password reset flow with secure crypto tokens
- GitHub repository structure with 25 branches and 27 version tags

### Changed
- Switched from customer-provided API keys to built-in OpenAI integration
- Removed API key requirement banners from AI features

## [1.1.0] - 2026-02-15

### Added
- CMS platform transformation with 5 new database tables
- Admin panel with 7 management tabs
- Custom email/password authentication with bcrypt hashing
- Google OAuth via Passport.js
- Dynamic CMS frontend with page rendering at `/page/:slug`
- Contact form with SMTP email notifications
- Tracking codes injection for 15+ analytics platforms
- File manager with drag-and-drop upload
- User management with role and status controls

### Changed
- Replaced Replit Auth with custom authentication system
- Login page supports both email/password and Google OAuth

## [1.0.0] - 2026-02-14

### Added
- AI Predictive Analytics (churn risk, revenue forecasting, conversion probability)
- AI UX Auditor (slow pages, bad UX flows, confusing navigation detection)
- AI Marketing Copilot (SEO fixes, PPC budget optimization, UX recommendations)
- No-Code Funnel Builder with drag-and-drop and AI generation
- Custom report builder with AI-powered generation
- Enhanced DateRangePicker with presets and comparison mode

## [0.9.0] - 2026-02-13

### Added
- Funnel exploration with multi-step conversion analysis
- User journey replay with session timeline views
- Live events stream with multi-dimensional filtering
- Custom event definitions with rule-based matching
- AI-generated event templates for common conversions

## [0.8.0] - 2026-02-12

### Added
- GDPR consent management with customisable banner
- Two-step consent flow (banner + preferences modal)
- 6 consent categories with expandable accordions
- Third-party banner integration (CookieYes, OneTrust, Cookiebot, Termly, Iubenda)
- IP anonymisation with configurable rules
- DNT header respect
- Cookieless tracking mode
- Right to Erasure and Data Portability

## [0.7.0] - 2026-02-11

### Added
- Privacy jurisdiction support for 55+ regions worldwide
- Internal traffic filtering via IP rules (exact, prefix, CIDR)
- Data retention policies with manual purge
- Data export capabilities (CSV/JSON)

## [0.6.0] - 2026-02-10

### Added
- Site audit with HTML crawling and SEO issue detection
- Scoring system for SEO health
- Recommendations engine for SEO improvements
- Geography analytics (country, city, language)
- Browser and device type breakdowns

## [0.5.0] - 2026-02-09

### Added
- Traffic sources analysis with channel breakdown
- Pages analysis (top pages, entry pages, exit pages, 404 detection)
- Acquisition analytics with traffic source classification
- Engagement metrics (event types, session duration, landing pages)

## [0.4.0] - 2026-02-08

### Added
- Real-time analytics dashboard
- Active users monitoring with per-minute activity chart
- Top pages, sources, and countries in real-time view
- Advanced traffic classification (organic, social, paid, referral, email, display, affiliate, direct)

## [0.3.0] - 2026-02-07

### Added
- Bot and server-side traffic detection
- User-agent pattern matching for crawlers and monitoring services
- Event collection endpoint with GDPR checks
- IP-based geolocation via ip-api.com

## [0.2.0] - 2026-02-06

### Added
- Dashboard overview with key analytics
- Period selectors and comparison statistics
- Project management (CRUD operations)
- Basic event tracking and pageview collection

## [0.1.0] - 2026-02-05

### Added
- Initial project setup with React 18, TypeScript, Vite
- Express.js backend with Drizzle ORM
- PostgreSQL database schema
- Tailwind CSS and Shadcn UI component library
- Dark/light theme support
- Basic routing with Wouter

[1.3.0-beta]: https://github.com/RakshakIT/myuserjourney/compare/v1.2.0...v1.3.0-beta
[1.2.0]: https://github.com/RakshakIT/myuserjourney/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/RakshakIT/myuserjourney/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/RakshakIT/myuserjourney/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/RakshakIT/myuserjourney/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/RakshakIT/myuserjourney/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/RakshakIT/myuserjourney/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/RakshakIT/myuserjourney/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/RakshakIT/myuserjourney/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/RakshakIT/myuserjourney/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/RakshakIT/myuserjourney/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/RakshakIT/myuserjourney/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/RakshakIT/myuserjourney/releases/tag/v0.1.0
