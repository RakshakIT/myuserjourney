import { Helmet } from "react-helmet-async";

const SITE_NAME = "My User Journey";
const SITE_URL = "https://myuserjourney.co.uk";
const DEFAULT_DESCRIPTION = "Free, privacy-first analytics platform for tracking user behaviour, SEO analysis, and AI-powered insights. GDPR compliant. No cookies required.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo-full.png`;

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonicalUrl,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  jsonLd,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Free Privacy-First Analytics Platform`;
  const canonical = canonicalUrl || undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonical && <meta property="og:url" content={canonical} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

export const seoData = {
  landing: {
    title: "Free Website Analytics & User Journey Tracking Platform",
    description: "Track user behaviour, analyse traffic sources, and get AI-powered insights with My User Journey. Free forever for core analytics. GDPR & PECR compliant. No cookies required. Perfect for Google Ads and YouTube Ads tracking.",
    keywords: "website analytics, user journey tracking, free analytics platform, GDPR compliant analytics, privacy-first analytics, user behaviour tracking, traffic analysis, SEO analytics, PPC tracking, Google Ads tracking, YouTube Ads tracking, cookieless analytics, web analytics alternative, GA4 alternative, conversion tracking, funnel analysis, real-time analytics, UK analytics platform",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "My User Journey",
        url: SITE_URL,
        logo: `${SITE_URL}/logo-full.png`,
        description: "Privacy-first analytics platform for tracking user behaviour, SEO analysis, and AI-powered insights.",
        sameAs: [],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: `${SITE_URL}/contact`,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "My User Journey",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: "Free, privacy-first web analytics platform with AI-powered insights, user journey tracking, SEO analysis, and GDPR compliance. Alternative to Google Analytics.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "GBP",
          description: "Free forever for core analytics. AI features billed on usage.",
        },
        featureList: [
          "Real-time analytics dashboard",
          "User journey replay and session tracking",
          "Conversion funnel analysis",
          "SEO site audit and analysis",
          "PPC campaign management",
          "AI-powered insights and copilot",
          "Predictive analytics",
          "GDPR and PECR compliance",
          "Cookieless tracking mode",
          "Custom event tracking",
          "Traffic source classification",
          "Google Ads conversion tracking",
          "YouTube Ads performance tracking",
          "Data export (CSV/JSON)",
          "Consent management",
        ],
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "150",
          bestRating: "5",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "My User Journey",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/docs?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  },
  pricing: {
    title: "Pricing - Free Analytics with Pay-As-You-Go AI",
    description: "My User Journey is free forever for core analytics. AI-powered features like predictive analytics, UX auditing, and marketing copilot are billed on actual usage. No subscriptions, no hidden fees.",
    keywords: "free analytics pricing, pay as you go analytics, affordable web analytics, analytics platform pricing, free website tracking, AI analytics pricing, usage based analytics billing, cheap analytics alternative",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Pricing - My User Journey",
        description: "Free core analytics with pay-as-you-go AI features.",
        mainEntity: {
          "@type": "Product",
          name: "My User Journey Analytics Platform",
          offers: [
            {
              "@type": "Offer",
              name: "Core Analytics",
              price: "0",
              priceCurrency: "GBP",
              description: "Free forever - Real-time analytics, dashboards, tracking, reports, GDPR compliance",
            },
            {
              "@type": "Offer",
              name: "AI-Powered Features",
              description: "Pay-as-you-go - AI insights, predictive analytics, UX auditor, marketing copilot",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                priceCurrency: "GBP",
                billingDuration: "P1M",
              },
            },
          ],
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          { "@type": "Question", name: "What exactly do I pay for?", acceptedAnswer: { "@type": "Answer", text: "You only pay for AI-powered features like AI Insights, Predictive Analytics, UX Auditor, Marketing Copilot, Content Gap Analysis, and Site Research. Core analytics, dashboards, tracking, and compliance features are always free." } },
          { "@type": "Question", name: "How does the threshold work?", acceptedAnswer: { "@type": "Answer", text: "We track your AI usage throughout each calendar month. If your total usage stays under the threshold, there is nothing to pay. Once it exceeds the threshold, we send a Stripe invoice for the full amount at month-end." } },
          { "@type": "Question", name: "Do I need to provide a credit card upfront?", acceptedAnswer: { "@type": "Answer", text: "No. You can start using the platform immediately with no payment details required. We will only ask for payment information if your usage exceeds the threshold." } },
          { "@type": "Question", name: "Is it GDPR compliant?", acceptedAnswer: { "@type": "Answer", text: "Absolutely. My User Journey is built from the ground up for UK GDPR, EU GDPR, PECR, and ePrivacy compliance with consent management, IP anonymisation, and cookieless tracking." } },
          { "@type": "Question", name: "What if I only use basic analytics?", acceptedAnswer: { "@type": "Answer", text: "Then it is completely free. Core analytics features including real-time dashboards, traffic analysis, custom reports, and compliance tools have no usage charges." } },
        ],
      },
    ],
  },
  docs: {
    title: "Documentation - Guides, API References & Tutorials",
    description: "Everything you need to know about My User Journey analytics platform. Browse setup guides, API references, privacy compliance tutorials, and AI feature documentation.",
    keywords: "analytics documentation, user journey docs, analytics API reference, tracking setup guide, GDPR analytics guide, analytics tutorials, web analytics help, tracking code installation",
  },
  useCases: {
    title: "Use Cases - Analytics for Every Business",
    description: "Discover how businesses use My User Journey for e-commerce analytics, SaaS metrics, content tracking, lead generation, and more. Real-world examples and success stories.",
    keywords: "analytics use cases, e-commerce analytics, SaaS analytics, content analytics, lead generation tracking, business analytics, website tracking examples, conversion tracking use cases",
  },
  community: {
    title: "Community - Connect with Analytics Professionals",
    description: "Join the My User Journey community. Share insights, get help, and connect with other analytics professionals building privacy-first tracking solutions.",
    keywords: "analytics community, web analytics forum, analytics professionals, tracking community, analytics help, analytics discussion",
  },
  connectors: {
    title: "Integrations & Connectors - Connect Your Tools",
    description: "Connect My User Journey with your existing tools. Integrate with Google Analytics 4, Search Console, CRM systems, and more for a unified analytics experience.",
    keywords: "analytics integrations, GA4 integration, Google Search Console, analytics connectors, CRM analytics, data integration, analytics API, webhooks analytics",
  },
  startGuide: {
    title: "Getting Started - Set Up Analytics in 5 Minutes",
    description: "Get started with My User Journey in under 5 minutes. Step-by-step guide to setting up your first analytics project, installing tracking code, and viewing your first data.",
    keywords: "analytics setup guide, how to set up analytics, install tracking code, web analytics getting started, analytics quick start, website tracking setup",
  },
  blog: {
    title: "Blog - Analytics Insights, Tips & Best Practices",
    description: "Read the latest articles on web analytics, user behaviour tracking, SEO, privacy compliance, and AI-powered insights from the My User Journey team.",
    keywords: "analytics blog, web analytics tips, user tracking insights, GDPR compliance tips, SEO blog, analytics best practices, privacy analytics articles",
  },
  helpCenter: {
    title: "Help Centre - Support & Troubleshooting",
    description: "Get help with My User Journey. Find answers to common questions, troubleshoot issues, and learn how to make the most of your analytics platform.",
    keywords: "analytics help, analytics support, troubleshooting analytics, analytics FAQ, tracking help, analytics questions",
  },
  capabilities: {
    title: "Platform Capabilities - Full Feature Overview",
    description: "Explore the complete feature set of My User Journey. From real-time analytics and AI insights to GDPR compliance and custom reporting - everything you need in one platform.",
    keywords: "analytics features, analytics capabilities, platform features, web analytics tools, analytics feature list, tracking capabilities, AI analytics features",
  },
  guides: {
    title: "Guides - Step-by-Step Analytics Tutorials",
    description: "Detailed guides for setting up and using My User Journey. Learn tracking installation, GDPR compliance, funnel analysis, AI features, and advanced analytics techniques.",
    keywords: "analytics guides, analytics tutorials, tracking setup tutorial, GDPR guide, funnel analysis guide, analytics how to, step by step analytics",
  },
  caseStudies: {
    title: "Case Studies - Real Results from Real Businesses",
    description: "See how businesses achieve measurable results with My User Journey analytics. Real case studies showing improved conversions, better SEO, and data-driven decisions.",
    keywords: "analytics case studies, analytics success stories, business analytics results, conversion improvement, SEO results, analytics ROI",
  },
  security: {
    title: "Security - Enterprise-Grade Data Protection",
    description: "Learn about My User Journey's security measures. Enterprise-grade encryption, GDPR compliance, data sovereignty, and privacy-by-design architecture protect your analytics data.",
    keywords: "analytics security, data protection, GDPR security, analytics encryption, data sovereignty, privacy by design, secure analytics, data privacy",
  },
  trustCenter: {
    title: "Trust Centre - Compliance & Certifications",
    description: "My User Journey's commitment to trust, transparency, and compliance. View our privacy certifications, GDPR compliance status, and data processing agreements.",
    keywords: "analytics trust, GDPR compliance, privacy certifications, data processing agreement, analytics compliance, trust centre, analytics transparency",
  },
  terms: {
    title: "Terms of Service",
    description: "My User Journey terms of service. Read our terms and conditions for using the analytics platform.",
    keywords: "analytics terms of service, terms and conditions, analytics legal, platform terms",
  },
  privacyPolicy: {
    title: "Privacy Policy",
    description: "My User Journey privacy policy. Learn how we handle your data, our commitment to GDPR compliance, and your rights as a data subject.",
    keywords: "analytics privacy policy, data privacy, GDPR privacy, analytics data handling, privacy rights",
  },
  contact: {
    title: "Contact Us - Get in Touch",
    description: "Contact the My User Journey team. Get support, request a demo, or ask questions about our privacy-first analytics platform.",
    keywords: "contact analytics support, analytics demo, analytics enquiry, get in touch analytics",
  },
  login: {
    title: "Log In to Your Analytics Dashboard",
    description: "Log in to My User Journey to access your analytics dashboard, track user behaviour, and manage your projects.",
    keywords: "analytics login, dashboard login, analytics sign in",
  },
};

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION };
